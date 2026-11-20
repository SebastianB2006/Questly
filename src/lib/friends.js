/**
 * Prietenii. Un singur document pentru fiecare pereche de utilizatori:
 *   friendships/{uidA_uidB}   (uid-urile sortate alfabetic, ca perechea să aibă mereu același id)
 *   { users: [uidA, uidB], requester, status: 'pending' | 'accepted', profiles: { uid: { name, username } }, createdAt }
 * Refuzul, anularea unei cereri și ștergerea unui prieten = ștergerea documentului.
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { demoStore, wait } from './demoStore';
import { newestFirst } from './dates';

export const pairId = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);

/** Documentul brut → forma folosită în interfață, din perspectiva lui `uid`. */
function toFriendship(id, data, uid) {
  const otherUid = data.users.find((u) => u !== uid);
  return {
    id,
    otherUid,
    other: data.profiles?.[otherUid] ?? { name: 'Explorer', username: '' },
    status: data.status,
    incoming: data.status === 'pending' && data.requester !== uid,
    createdAt: data.createdAt,
  };
}

/** cb(lista de prietenii și cereri) la fiecare schimbare. */
export function subscribeFriendships(uid, cb, onError) {
  if (!isFirebaseConfigured) {
    return demoStore.watch(
      (s) =>
        Object.entries(s.friendships)
          .filter(([, f]) => f.users.includes(uid))
          .map(([id, f]) => toFriendship(id, f, uid))
          .sort(newestFirst('createdAt')),
      cb
    );
  }
  const q = query(collection(db, 'friendships'), where('users', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs
          .map((d) => toFriendship(d.id, d.data({ serverTimestamps: 'estimate' }), uid))
          .sort(newestFirst('createdAt'))
      ),
    onError
  );
}

/**
 * Trimite o cerere de prietenie. `me` și `other` = { uid, name, username }.
 * Dacă celălalt ți-a trimis deja o cerere, o acceptă direct.
 * Returnează 'sent' | 'accepted'. Aruncă { code: 'self' | 'already-friends' | 'already-sent' }.
 */
export async function sendFriendRequest(me, other) {
  if (me.uid === other.uid) throw { code: 'self' };
  const id = pairId(me.uid, other.uid);
  const profiles = {
    [me.uid]: { name: me.name, username: me.username },
    [other.uid]: { name: other.name, username: other.username },
  };

  if (!isFirebaseConfigured) {
    await wait();
    const existing = demoStore.state.friendships[id];
    if (existing) {
      if (existing.status === 'accepted') throw { code: 'already-friends' };
      if (existing.requester === me.uid) throw { code: 'already-sent' };
      existing.status = 'accepted';
      demoStore.emit();
      return 'accepted';
    }
    demoStore.state.friendships[id] = {
      users: [me.uid, other.uid].sort(),
      requester: me.uid,
      status: 'pending',
      profiles,
      createdAt: Date.now(),
    };
    demoStore.emit();
    return 'sent';
  }

  const ref = doc(db, 'friendships', id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const f = snap.data();
    if (f.status === 'accepted') throw { code: 'already-friends' };
    if (f.requester === me.uid) throw { code: 'already-sent' };
    await acceptFriend(id);
    return 'accepted';
  }
  await setDoc(ref, {
    users: [me.uid, other.uid].sort(),
    requester: me.uid,
    status: 'pending',
    profiles,
    createdAt: serverTimestamp(),
  });
  return 'sent';
}

export async function acceptFriend(id) {
  if (!isFirebaseConfigured) {
    await wait();
    const f = demoStore.state.friendships[id];
    if (f) {
      f.status = 'accepted';
      f.acceptedAt = Date.now();
      demoStore.emit();
    }
    return;
  }
  await updateDoc(doc(db, 'friendships', id), { status: 'accepted', acceptedAt: serverTimestamp() });
}

/** Refuză sau anulează o cerere ori șterge un prieten. */
export async function removeFriendship(id) {
  if (!isFirebaseConfigured) {
    await wait();
    delete demoStore.state.friendships[id];
    demoStore.emit();
    return;
  }
  await deleteDoc(doc(db, 'friendships', id));
}

export function friendErrorMessage(e) {
  switch (e?.code) {
    case 'self':
      return 'That’s you! Try a friend’s username.';
    case 'already-friends':
      return 'You’re already adventure buddies.';
    case 'already-sent':
      return 'Request already sent. Give them a moment to say yes.';
    case 'not-found':
      return 'No explorer with that username yet.';
    default:
      return 'Couldn’t send the request. Try again.';
  }
}
