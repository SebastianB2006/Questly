/**
 * Provocările (quests). Toate stau în colecția quests/{id}:
 *   ownerUid / ownerName   cine face provocarea
 *   fromUid / fromName     cine a trimis-o (null pentru provocarea zilei)
 *   source                 'daily' (generată de Gemini) | 'friend' (trimisă de un prieten)
 *   title, description, category, difficulty, minutes, xp, aiGenerated
 *   status                 'pending' (așteaptă accept) → 'active' → 'completed'   sau 'declined'
 *   date, number, rerolls, acceptedAt   doar pentru provocarea zilei (id = daily_{uid}_{AAAA-LL-ZZ}, deci una pe zi)
 *   note, media[]          descrierea și pozele / videoclipurile adăugate la final
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { demoStore, wait } from './demoStore';
import { generateDailyQuest } from './ai';
import { dateKey, parseKey } from './dates';
import { MAX_REROLLS, FRIEND_QUEST_XP } from '../constants/quests';

export const MAX_NOTE = 500;
export const MAX_FRIEND_QUEST = 240;

export const dailyId = (uid, date) => `daily_${uid}_${date}`;

const questFields = (q) => ({
  title: q.title,
  description: q.description ?? '',
  category: q.category,
  difficulty: q.difficulty,
  minutes: q.minutes,
  xp: q.xp,
  aiGenerated: Boolean(q.aiGenerated),
});

const fromSnap = (snap) => ({ id: snap.id, ...snap.data({ serverTimestamps: 'estimate' }) });
const demoList = (pred) => (s) =>
  Object.entries(s.quests)
    .filter(([, q]) => pred(q))
    .map(([id, q]) => ({ id, ...q }));

// ── Abonări (date live) ───────────────────────────────────────────────────────

/** Provocările pe care le faci tu, cu un anumit status. */
export function subscribeOwnQuests(uid, status, cb, onError) {
  if (!isFirebaseConfigured) {
    return demoStore.watch(demoList((q) => q.ownerUid === uid && q.status === status), cb);
  }
  const q = query(collection(db, 'quests'), where('ownerUid', '==', uid), where('status', '==', status));
  return onSnapshot(q, (snap) => cb(snap.docs.map(fromSnap)), onError);
}

/** Provocările trimise de tine prietenilor. */
export function subscribeSentQuests(uid, cb, onError) {
  if (!isFirebaseConfigured) {
    return demoStore.watch(demoList((q) => q.fromUid === uid), cb);
  }
  const q = query(collection(db, 'quests'), where('fromUid', '==', uid));
  return onSnapshot(q, (snap) => cb(snap.docs.map(fromSnap)), onError);
}

/** Un singur document (ex. provocarea zilei). cb(null) dacă nu există. */
export function subscribeQuest(id, cb, onError) {
  if (!isFirebaseConfigured) {
    return demoStore.watch((s) => (s.quests[id] ? { id, ...s.quests[id] } : null), cb);
  }
  return onSnapshot(doc(db, 'quests', id), (snap) => cb(snap.exists() ? fromSnap(snap) : null), onError);
}

// ── Provocarea zilei ──────────────────────────────────────────────────────────

const inFlight = new Map();

/**
 * Creează provocarea zilei dacă nu există încă. Apelurile simultane sunt unite într-unul.
 * `recentTitles` ajută Gemini să nu repete provocări; `number` = a câta provocare e („NO. 028”).
 */
export function ensureDailyQuest(user, date, recentTitles = [], number = 1) {
  const id = dailyId(user.uid, date);
  if (inFlight.has(id)) return inFlight.get(id);

  const base = {
    ownerUid: user.uid,
    ownerName: user.name,
    fromUid: null,
    fromName: null,
    source: 'daily',
    date,
    number,
    status: 'active',
    rerolls: 0,
  };

  const run = (async () => {
    if (!isFirebaseConfigured) {
      if (demoStore.state.quests[id]) return;
      const quest = await generateDailyQuest(recentTitles);
      if (demoStore.state.quests[id]) return;
      demoStore.state.quests[id] = { ...base, ...questFields(quest), createdAt: Date.now() };
      demoStore.emit();
      return;
    }

    const ref = doc(db, 'quests', id);
    if ((await getDoc(ref)).exists()) return;
    const quest = await generateDailyQuest(recentTitles);
    try {
      await setDoc(ref, { ...base, ...questFields(quest), createdAt: serverTimestamp() });
    } catch (e) {
      // Între timp a creat-o alt dispozitiv: regulile refuză suprascrierea, iar documentul există deja.
      if (!(await getDoc(ref)).exists()) throw e;
    }
  })().finally(() => inFlight.delete(id));

  inFlight.set(id, run);
  return run;
}

/** „Accept quest” pe provocarea zilei. */
export async function acceptDaily(id) {
  if (!isFirebaseConfigured) {
    await wait(150);
    demoStore.state.quests[id].acceptedAt = Date.now();
    demoStore.emit();
    return;
  }
  await updateDoc(doc(db, 'quests', id), { acceptedAt: serverTimestamp() });
}

/** Înlocuiește provocarea zilei cu alta (maximum MAX_REROLLS pe zi). */
export async function rerollDaily(quest, recentTitles = []) {
  const rerolls = (quest.rerolls ?? 0) + 1;
  if (rerolls > MAX_REROLLS) throw { code: 'no-rerolls' };
  const next = await generateDailyQuest([quest.title, ...recentTitles]);
  const changes = { ...questFields(next), rerolls };

  if (!isFirebaseConfigured) {
    Object.assign(demoStore.state.quests[quest.id], changes);
    demoStore.emit();
    return;
  }
  await updateDoc(doc(db, 'quests', quest.id), changes);
}

// ── Provocări între prieteni ──────────────────────────────────────────────────

/** `from` = utilizatorul curent, `to` = { uid, name } prietenul, `quest` = { title, category, aiGenerated }. */
export async function sendQuest({ from, to, quest }) {
  const data = {
    ownerUid: to.uid,
    ownerName: to.name,
    fromUid: from.uid,
    fromName: from.name,
    source: 'friend',
    status: 'pending',
    ...questFields({
      title: String(quest.title).trim().slice(0, MAX_FRIEND_QUEST),
      description: '',
      category: quest.category,
      difficulty: 'easy',
      minutes: 15,
      xp: FRIEND_QUEST_XP,
      aiGenerated: quest.aiGenerated,
    }),
  };
  if (!isFirebaseConfigured) {
    await wait();
    demoStore.state.quests[demoStore.newId('demo-q')] = { ...data, createdAt: Date.now() };
    demoStore.emit();
    return;
  }
  await addDoc(collection(db, 'quests'), { ...data, createdAt: serverTimestamp() });
}

/** Acceptă sau refuză o provocare primită. */
export async function respondToQuest(id, accept) {
  const changes = { status: accept ? 'active' : 'declined' };
  if (!isFirebaseConfigured) {
    await wait();
    Object.assign(demoStore.state.quests[id], changes, { respondedAt: Date.now() });
    demoStore.emit();
    return;
  }
  await updateDoc(doc(db, 'quests', id), { ...changes, respondedAt: serverTimestamp() });
}

/** Cel care a trimis provocarea o poate retrage cât timp nu a fost acceptată. */
export async function cancelQuest(id) {
  if (!isFirebaseConfigured) {
    await wait();
    delete demoStore.state.quests[id];
    demoStore.emit();
    return;
  }
  await deleteDoc(doc(db, 'quests', id));
}

/**
 * Marchează provocarea ca terminată și actualizează statisticile publice din profil (XP, serie),
 * într-un singur batch. `streak` = seria după terminare (calculată din jurnal).
 */
export async function completeQuest(quest, { uid, note, media, streak }) {
  const today = dateKey();
  const changes = {
    status: 'completed',
    note: String(note ?? '').trim().slice(0, MAX_NOTE),
    media,
    completedDate: today,
  };
  const xp = quest.xp ?? 0;

  if (!isFirebaseConfigured) {
    await wait();
    Object.assign(demoStore.state.quests[quest.id], changes, { completedAt: Date.now() });
    const u = demoStore.state.users[uid];
    if (u) Object.assign(u, { xp: (u.xp ?? 0) + xp, completedCount: (u.completedCount ?? 0) + 1, streak, lastCompletedDate: today });
    demoStore.emit();
    return;
  }

  const batch = writeBatch(db);
  batch.update(doc(db, 'quests', quest.id), { ...changes, completedAt: serverTimestamp() });
  batch.update(doc(db, 'users', uid), {
    xp: increment(xp),
    completedCount: increment(1),
    streak,
    lastCompletedDate: today,
  });
  await batch.commit();
}

// ── Statistici ────────────────────────────────────────────────────────────────

/** Seria: câte zile la rând (până azi sau ieri) ai terminat cel puțin o provocare. */
export function computeStreak(completed, today = dateKey()) {
  const days = new Set(completed.map((q) => q.completedDate).filter(Boolean));
  const d = parseKey(today);
  if (!days.has(today)) d.setDate(d.getDate() - 1); // seria nu se rupe până nu trece și ziua de azi
  let streak = 0;
  while (days.has(dateKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function questErrorMessage(e) {
  const code = e?.code ?? '';
  if (code === 'no-rerolls') return 'That’s all the swaps for today. This one might surprise you!';
  if (code === 'permission-denied') return 'You’re not allowed to do that.';
  if (code === 'unavailable' || code === 'storage/retry-limit-exceeded') return 'You seem to be offline.';
  if (code === 'storage/unauthorized') return 'The upload was refused. Check storage.rules in Firebase.';
  if (code === 'storage/quota-exceeded') return 'Your Firebase storage is full.';
  if (code === 'media/too-large') return e.message;
  return 'Something went wrong. Try again.';
}
