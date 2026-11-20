import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  signOut as fbSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { demoStore } from '../lib/demoStore';
import { normalizeUsername, usernameError, DEFAULT_BIO } from '../lib/users';

const AuthContext = createContext(null);

// Conturi folosite doar în modul demo (fără Firebase configurat).
export const DEMO_ACCOUNTS = [
  { email: 'alex@demo.com', password: 'demo1234', label: 'Alex' },
  { email: 'jamie@demo.com', password: 'demo1234', label: 'Jamie' },
];

async function loadProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { uid, name: d.name, username: d.username };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { uid, email, name, username }
  const [loading, setLoading] = useState(true);
  // La înregistrare contul există în Auth înainte de profilul din Firestore.
  // Fără acest flag, listener-ul ar vedea „cont fără profil” și l-ar deloga.
  const registeringRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      if (registeringRef.current) return;
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await loadProfile(fbUser.uid);
        if (!profile) {
          await fbSignOut(auth);
          setUser(null);
        } else {
          setUser({ email: fbUser.email, ...profile });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (!isFirebaseConfigured) {
      const account = demoStore.state.accounts[cleanEmail];
      if (!account || account.password !== password) throw { code: 'auth/invalid-credential' };
      const p = demoStore.state.users[account.uid];
      setUser({ uid: account.uid, email: cleanEmail, name: p.name, username: p.username });
      return;
    }

    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const profile = await loadProfile(cred.user.uid);
    if (!profile) {
      await fbSignOut(auth);
      throw { code: 'app/no-profile' };
    }
    // onAuthStateChanged setează utilizatorul, iar _layout face redirecționarea.
  }

  /**
   * Creează contul și profilul, atomic (un singur batch):
   *  - users/{uid}            profil public: nume, @username, bio și statistici pornite de la 0
   *  - usernames/{username}   { uid } – unicitatea @username
   * Dacă numele de utilizator e luat, regulile Firestore refuză batch-ul și ștergem contul creat.
   */
  async function signUp({ name, username, email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const handle = normalizeUsername(username);
    const invalid = usernameError(handle);
    if (invalid) throw { code: 'app/invalid-username', message: invalid };
    const profile = {
      name: cleanName,
      username: handle,
      usernameLower: handle,
      bio: DEFAULT_BIO,
      xp: 0,
      completedCount: 0,
      streak: 0,
      lastCompletedDate: null,
    };

    if (!isFirebaseConfigured) {
      const s = demoStore.state;
      if (s.accounts[cleanEmail]) throw { code: 'auth/email-already-in-use' };
      if (s.usernames[handle]) throw { code: 'app/username-taken' };
      const uid = demoStore.newId('demo-user');
      s.accounts[cleanEmail] = { password, uid };
      s.users[uid] = profile;
      s.usernames[handle] = uid;
      demoStore.emit();
      setUser({ uid, email: cleanEmail, name: cleanName, username: handle });
      return;
    }

    registeringRef.current = true;
    let created = null;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      created = cred.user;
      const uid = created.uid;

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), { ...profile, createdAt: serverTimestamp() });
      batch.set(doc(db, 'usernames', handle), { uid });
      await batch.commit();

      setUser({ uid, email: cleanEmail, name: cleanName, username: handle });
    } catch (e) {
      if (created) await deleteUser(created).catch(() => {});
      if (created && e?.code === 'permission-denied') throw { code: 'app/username-taken' };
      throw e;
    } finally {
      registeringRef.current = false;
    }
  }

  async function signOut() {
    if (isFirebaseConfigured) await fbSignOut(auth);
    setUser(null);
  }

  async function resetPassword(email) {
    if (!isFirebaseConfigured) return; // în demo nu trimitem nimic
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth trebuie folosit în interiorul <AuthProvider>');
  return ctx;
}
