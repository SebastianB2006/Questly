// Bază de date în memorie pentru modul demo (fără Firebase, adică fără fișierul .env).
// Datele (din designul Figma) se pierd la reîncărcarea aplicației. Te poți loga pe rând cu Alex și cu Jamie
// ca să vezi ambele părți ale unei provocări trimise între prieteni.
import { dateKey, addDays } from './dates';

const HOUR = 3600000;
const DAY = 24 * HOUR;
const now = Date.now();
const today = dateKey();
const daysAgo = (n) => addDays(today, -n);

const user = (name, username, bio, xp, streak, lastDaysAgo, completedCount) => ({
  name,
  username,
  usernameLower: username,
  bio,
  xp,
  streak,
  lastCompletedDate: lastDaysAgo == null ? null : daysAgo(lastDaysAgo),
  completedCount,
});

const users = {
  'demo-alex2': user('Alex Morgan', 'alex', 'Collecting moments, not things.', 300, 6, 1, 6),
  'demo-jamie': user('Jamie Chen', 'jamie', 'Always up for an adventure', 1150, 12, 1, 24),
  'demo-sofia1': user('Sofia Miller', 'sofia', 'Finding magic in the little things', 1640, 8, 0, 31),
  'demo-rivera1': user('Alex Rivera', 'alexr', 'A little more curious every day', 2100, 5, 1, 40),
  'demo-taylor4': user('Taylor Kim', 'taylor', 'Here for the side quests', 2600, 3, 0, 52),
  'demo-riley4': user('Riley Park', 'riley', 'New here, say hi!', 120, 2, 0, 3),
  'demo-sam4': user('Sam Lee', 'sam', 'Coffee, cameras and long walks', 860, 0, 9, 17),
};

const pairProfiles = (...uids) => Object.fromEntries(uids.map((u) => [u, { name: users[u].name, username: users[u].username }]));
const friendship = (a, b, requester, status, ago) => [
  [a, b].sort().join('_'),
  { users: [a, b].sort(), requester, status, profiles: pairProfiles(a, b), createdAt: now - ago },
];

const daily = (n, title, note, xp, minutes, category, media = []) => [
  `daily_demo-alex2_${daysAgo(n)}`,
  {
    ownerUid: 'demo-alex2',
    ownerName: 'Alex Morgan',
    fromUid: null,
    fromName: null,
    source: 'daily',
    date: daysAgo(n),
    number: 7 - n,
    title,
    description: '',
    category,
    difficulty: xp >= 70 ? 'medium' : 'easy',
    minutes,
    xp,
    aiGenerated: false,
    rerolls: 0,
    status: 'completed',
    note,
    media,
    createdAt: now - n * DAY,
    acceptedAt: now - n * DAY + HOUR,
    completedAt: now - n * DAY + 6 * HOUR,
    completedDate: daysAgo(n),
  },
];

const friendQuest = (id, from, to, title, category, status, extra = {}) => [
  id,
  {
    ownerUid: to,
    ownerName: users[to].name,
    fromUid: from,
    fromName: users[from].name,
    source: 'friend',
    title,
    description: '',
    category,
    difficulty: 'easy',
    minutes: 15,
    xp: 50,
    aiGenerated: false,
    status,
    createdAt: now - 2 * HOUR,
    ...extra,
  },
];

const photo = (seed, w = 1200, h = 900) => ({ url: `https://picsum.photos/seed/${seed}/${w}/${h}`, type: 'image', width: w, height: h });

const state = {
  accounts: {
    'alex@demo.com': { password: 'demo1234', uid: 'demo-alex2' },
    'jamie@demo.com': { password: 'demo1234', uid: 'demo-jamie' },
  },
  users,
  usernames: Object.fromEntries(Object.entries(users).map(([uid, u]) => [u.username, uid])),
  friendships: Object.fromEntries([
    friendship('demo-alex2', 'demo-jamie', 'demo-alex2', 'accepted', 40 * DAY),
    friendship('demo-alex2', 'demo-sofia1', 'demo-sofia1', 'accepted', 30 * DAY),
    friendship('demo-alex2', 'demo-rivera1', 'demo-alex2', 'accepted', 20 * DAY),
    friendship('demo-alex2', 'demo-taylor4', 'demo-taylor4', 'accepted', 10 * DAY),
    friendship('demo-alex2', 'demo-riley4', 'demo-riley4', 'pending', 3 * HOUR),
  ]),
  quests: Object.fromEntries([
    daily(1, 'Go for a walk with no destination.', 'Found a tiny bookstore tucked away on a street I’d never noticed. Definitely going back.', 50, 30, 'active', [photo('questly-books'), photo('questly-street')]),
    daily(2, 'Reach out to an old friend.', 'Called my college roommate. We ended up talking for an hour.', 50, 15, 'social'),
    daily(3, 'Try something new for breakfast.', 'Made shakshuka for the first time. A little messy, a lot delicious.', 40, 20, 'creative', [photo('questly-breakfast', 1000, 1000)]),
    daily(4, 'Slow down.\nLook up for a while.', '', 40, 5, 'chill'),
    daily(5, 'Make a little art.\nJust for yourself.', 'Drew my coffee cup. It somehow looks like a cat.', 50, 10, 'creative'),
    daily(6, 'Climb a little higher.\nTake the stairs.', 'Seven floors. My legs have opinions.', 70, 15, 'active'),
    friendQuest('demo-in-1', 'demo-jamie', 'demo-alex2', 'Find a little piece of nature in the city.', 'active', 'pending', { createdAt: now - 2 * HOUR }),
    friendQuest('demo-in-2', 'demo-sofia1', 'demo-alex2', 'Make a playlist for your current mood.', 'creative', 'pending', { createdAt: now - 4 * HOUR }),
    friendQuest('demo-in-3', 'demo-rivera1', 'demo-alex2', 'Watch the sunset without your phone.', 'chill', 'pending', { createdAt: now - 6 * HOUR }),
    friendQuest('demo-out-1', 'demo-alex2', 'demo-jamie', 'Try a coffee order you’ve never had before.', 'chill', 'active', { createdAt: now - DAY, respondedAt: now - DAY + HOUR }),
    friendQuest('demo-out-2', 'demo-alex2', 'demo-sofia1', 'Write a tiny poem about your day.', 'creative', 'completed', {
      createdAt: now - 3 * DAY,
      respondedAt: now - 3 * DAY + HOUR,
      completedAt: now - 2 * DAY,
      completedDate: daysAgo(2),
      note: 'Rain on the window, tea going cold, one good song on repeat. Not bad for a Tuesday.',
      media: [photo('questly-poem', 900, 1200)],
    }),
    friendQuest('demo-out-3', 'demo-alex2', 'demo-taylor4', 'Take a different route home.', 'active', 'declined', { createdAt: now - 4 * DAY, respondedAt: now - 4 * DAY + HOUR }),
  ]),
};

const listeners = new Set();
let counter = 0;

export const demoStore = {
  state,
  newId(prefix = 'demo') {
    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
  },
  emit() {
    listeners.forEach((fn) => fn());
  },
  /** Apelează cb(selector(state)) acum și după fiecare modificare. Returnează funcția de dezabonare. */
  watch(selector, cb) {
    const run = () => cb(selector(state));
    run();
    listeners.add(run);
    return () => listeners.delete(run);
  },
};

export const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));
