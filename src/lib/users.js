/**
 * Profiluri publice și nume de utilizator (@username), folosite ca să-ți găsești prietenii.
 *   users/{uid}: { name, username, usernameLower, bio, xp, completedCount, streak, lastCompletedDate, createdAt }
 * Statisticile (xp, streak…) le actualizează aplicația când termini o provocare, ca prietenii să le vadă.
 */
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { demoStore, wait } from './demoStore';
import { addDays, dateKey } from './dates';

const USERNAME_RE = /^[a-z0-9._]{3,20}$/;
export const MAX_BIO = 60;
export const DEFAULT_BIO = 'Here for the side quests';

/** „@Ana.Pop ” → „ana.pop” */
export function normalizeUsername(value = '') {
  return value.trim().replace(/^@/, '').toLowerCase();
}

/** Mesaj de eroare sau null dacă numele de utilizator e valid. */
export function usernameError(value) {
  const u = normalizeUsername(value);
  if (u.length < 3) return 'Your username needs at least 3 characters.';
  if (u.length > 20) return 'Your username can have at most 20 characters.';
  if (!USERNAME_RE.test(u)) return 'Use only letters, numbers, dots and underscores.';
  return null;
}

const toProfile = (uid, d) => ({
  uid,
  name: d.name,
  username: d.username,
  bio: d.bio || DEFAULT_BIO,
  xp: d.xp ?? 0,
  completedCount: d.completedCount ?? 0,
  streak: d.streak ?? 0,
  lastCompletedDate: d.lastCompletedDate ?? null,
});

/** Seria afișată: se rupe dacă ultima provocare terminată e mai veche de ieri. */
export function liveStreak(profile, today = dateKey()) {
  if (!profile?.lastCompletedDate) return 0;
  return profile.lastCompletedDate === today || profile.lastCompletedDate === addDays(today, -1) ? profile.streak ?? 0 : 0;
}

/** Profilul public al unui utilizator sau null. */
export async function getProfile(uid) {
  if (!isFirebaseConfigured) {
    const p = demoStore.state.users[uid];
    return p ? toProfile(uid, p) : null;
  }
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? toProfile(uid, snap.data()) : null;
}

/** Profilurile mai multor utilizatori (prietenii), ca obiect { uid: profil }. */
export async function getProfiles(uids) {
  const list = await Promise.all(uids.map((u) => getProfile(u).catch(() => null)));
  return Object.fromEntries(list.filter(Boolean).map((p) => [p.uid, p]));
}

/** Profilul tău, live. */
export function subscribeProfile(uid, cb, onError) {
  if (!isFirebaseConfigured) {
    return demoStore.watch((s) => (s.users[uid] ? toProfile(uid, s.users[uid]) : null), cb);
  }
  return onSnapshot(doc(db, 'users', uid), (snap) => cb(snap.exists() ? toProfile(uid, snap.data()) : null), onError);
}

export async function updateBio(uid, bio) {
  const clean = String(bio ?? '').trim().slice(0, MAX_BIO) || DEFAULT_BIO;
  if (!isFirebaseConfigured) {
    await wait(200);
    demoStore.state.users[uid].bio = clean;
    demoStore.emit();
    return;
  }
  await updateDoc(doc(db, 'users', uid), { bio: clean });
}

/** Caută un utilizator după @username. Returnează profilul sau null. */
export async function findUserByUsername(value) {
  const u = normalizeUsername(value);
  if (usernameError(u)) return null;
  if (!isFirebaseConfigured) {
    await wait();
    const uid = demoStore.state.usernames[u];
    return uid ? getProfile(uid) : null;
  }
  const snap = await getDoc(doc(db, 'usernames', u));
  if (!snap.exists()) return null;
  return getProfile(snap.data().uid);
}
