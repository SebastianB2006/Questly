/**
 * Datele live ale utilizatorului logat, comune pentru toate ecranele:
 * provocarea zilei, provocările primite / active / terminate / trimise, prietenii și statisticile.
 * Abonările se fac o singură dată aici, nu pe fiecare ecran.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import {
  subscribeOwnQuests,
  subscribeSentQuests,
  subscribeQuest,
  ensureDailyQuest,
  rerollDaily,
  acceptDaily,
  dailyId,
  computeStreak,
  questErrorMessage,
} from '../lib/quests';
import { subscribeFriendships } from '../lib/friends';
import { subscribeProfile, getProfiles, liveStreak } from '../lib/users';
import { dateKey, newestFirst } from '../lib/dates';
import { levelInfo } from '../constants/quests';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [today, setToday] = useState(dateKey());
  const [daily, setDaily] = useState(undefined); // undefined = se încarcă, null = nu există încă
  const [dailyError, setDailyError] = useState('');
  const [inbox, setInbox] = useState([]);
  const [activeRaw, setActiveRaw] = useState([]);
  const [completedRaw, setCompletedRaw] = useState(null); // null până la primul răspuns
  const [sentRaw, setSentRaw] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [profile, setProfile] = useState(null);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [error, setError] = useState('');

  // Ziua se schimbă la miezul nopții: recalculăm când aplicația revine în prim-plan.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setToday(dateKey());
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const onError = (e) => {
      console.warn('[Questly] Sync error:', e?.code ?? e);
      setError('Couldn’t load your adventures. Check your connection and the Firestore rules.');
    };
    const unsubs = [
      subscribeOwnQuests(uid, 'pending', setInbox, onError),
      subscribeOwnQuests(uid, 'active', setActiveRaw, onError),
      subscribeOwnQuests(uid, 'completed', setCompletedRaw, onError),
      subscribeSentQuests(uid, setSentRaw, onError),
      subscribeFriendships(uid, setFriendships, onError),
      subscribeProfile(uid, setProfile, onError),
    ];
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setDaily(undefined);
    return subscribeQuest(dailyId(uid, today), setDaily, (e) => {
      console.warn('[Questly] Daily quest:', e?.code ?? e);
      setDailyError(questErrorMessage(e));
    });
  }, [uid, today]);

  // Statisticile prietenilor (serie, nivel, bio) pentru cardurile din „Friends”.
  const friendUids = useMemo(
    () => friendships.filter((f) => f.status === 'accepted').map((f) => f.otherUid).sort().join(','),
    [friendships]
  );
  const refreshFriends = useCallback(() => {
    if (!friendUids) return setFriendProfiles({});
    getProfiles(friendUids.split(','))
      .then(setFriendProfiles)
      .catch((e) => console.warn('[Questly] Friend profiles:', e?.code ?? e));
  }, [friendUids]);
  useEffect(() => {
    refreshFriends();
  }, [refreshFriends, today]);

  const completed = useMemo(() => [...(completedRaw ?? [])].sort(newestFirst('completedAt')), [completedRaw]);
  const recentRef = useRef([]);
  recentRef.current = completed.slice(0, 15).map((q) => q.title);
  const countRef = useRef(0);
  countRef.current = completed.length;

  const createDaily = useCallback(async () => {
    if (!user) return;
    setDailyError('');
    try {
      await ensureDailyQuest(user, today, recentRef.current, countRef.current + 1);
    } catch (e) {
      console.warn('[Questly] Couldn’t create the daily quest:', e?.code ?? e);
      setDailyError(questErrorMessage(e));
    }
  }, [user, today]);

  // Prima deschidere din zi: generăm provocarea (după ce știm ce a făcut deja, ca să nu se repete).
  useEffect(() => {
    if (daily === null && completedRaw !== null) createDaily();
  }, [daily, completedRaw, createDaily]);

  const reroll = useCallback(async () => {
    if (daily) await rerollDaily(daily, recentRef.current);
  }, [daily]);

  const accept = useCallback(async () => {
    if (daily) await acceptDaily(daily.id);
  }, [daily]);

  const value = useMemo(() => {
    const friends = friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => {
        const p = friendProfiles[f.otherUid];
        return {
          ...f,
          bio: p?.bio ?? '',
          streak: p ? liveStreak(p, today) : 0,
          level: levelInfo(p?.xp ?? 0).level,
        };
      })
      .sort((a, b) => a.other.name.localeCompare(b.other.name));
    const totalXp = completed.reduce((sum, q) => sum + (q.xp ?? 0), 0);
    return {
      today,
      daily,
      dailyError,
      retryDaily: createDaily,
      reroll,
      accept,
      inbox: [...inbox].sort(newestFirst('createdAt')),
      // Provocările zilei din zilele trecute, neterminate, au expirat: nu le mai arătăm.
      active: activeRaw.filter((q) => q.source !== 'daily').sort(newestFirst('respondedAt')),
      completed,
      sent: [...sentRaw].sort(newestFirst('createdAt')),
      friends,
      incomingRequests: friendships.filter((f) => f.status === 'pending' && f.incoming),
      outgoingRequests: friendships.filter((f) => f.status === 'pending' && !f.incoming),
      profile,
      refreshFriends,
      stats: {
        completedCount: completed.length,
        completedDays: new Set(completed.map((q) => q.completedDate)),
        streak: computeStreak(completed, today),
        totalXp,
        ...levelInfo(totalXp),
        sentCount: sentRaw.length,
        friendsCount: friends.length,
      },
      loading: completedRaw === null,
      error,
    };
  }, [today, daily, dailyError, createDaily, reroll, accept, inbox, activeRaw, completed, completedRaw, sentRaw, friendships, friendProfiles, profile, refreshFriends, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData trebuie folosit în interiorul <DataProvider>');
  return ctx;
}

/** Caută o provocare după id în toate listele încărcate. */
export function useQuest(id) {
  const { daily, inbox, active, completed, sent } = useData();
  return useMemo(() => {
    if (daily?.id === id) return daily;
    return [...inbox, ...active, ...completed, ...sent].find((q) => q.id === id) ?? null;
  }, [id, daily, inbox, active, completed, sent]);
}
