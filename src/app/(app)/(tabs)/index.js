import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Screen } from '../../../components/Layout';
import FeaturedQuest from '../../../components/FeaturedQuest';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/Icon';
import { Button, Card, CircleButton, EmptyState, ErrorText, PageHeading, SectionHeading, Tag, firstName } from '../../../components/ui';
import { currentWeek, timeAgo } from '../../../lib/dates';
import { XP_PER_LEVEL } from '../../../constants/quests';
import { useStyles, useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function StreakPill({ streak }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={s.streakPill} accessibilityLabel={`${streak} day streak`}>
      <View style={s.streakPillRow}>
        <Icon name="flame" size={19} color={c.streakText} />
        <Text style={s.streakPillNumber}>{streak}</Text>
      </View>
      <Text style={s.streakPillLabel}>day streak</Text>
    </View>
  );
}

function FromFriends() {
  const s = useStyles(makeStyles);
  const { inbox } = useData();
  return (
    <View>
      <SectionHeading
        title="From your friends"
        count={inbox.length}
        subtitle="Because adventures are better when they’re shared."
        right={<Button variant="text" title="View inbox" arrow onPress={() => router.navigate('/inbox')} />}
      />
      <View style={{ marginTop: 6 }}>
        {inbox.slice(0, 2).map((q) => (
          <View key={q.id} style={s.friendRow}>
            <Avatar seed={q.fromUid} size={38} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.sender}>
                {firstName(q.fromName)} sent you a quest <Text style={s.ago}>· {timeAgo(q.createdAt)}</Text>
              </Text>
              <Text style={s.friendQuestTitle}>{q.title}</Text>
              <Tag category={q.category} />
            </View>
            <CircleButton label={`View quest from ${firstName(q.fromName)}`} onPress={() => router.navigate('/inbox')} />
          </View>
        ))}
        {inbox.length === 0 && (
          <View style={{ marginTop: 12 }}>
            <EmptyState>All caught up. Send a friend a little adventure!</EmptyState>
          </View>
        )}
      </View>
    </View>
  );
}

function LittleWins() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { stats, today } = useData();
  const doneToday = stats.completedDays.has(today);

  return (
    <Card style={{ padding: 22 }}>
      <SectionHeading title="Your little wins" right={<Icon name="spark" size={19} color={c.star} />} />

      <View style={s.weekStreak}>
        <View style={s.streakIcon}>
          <Icon name="flame" size={28} color={c.streakIcon} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.streakBig}>
            {stats.streak}
            <Text style={s.streakBigLabel}> day streak</Text>
          </Text>
          <Text style={s.streakCaption}>{doneToday ? 'You showed up. That’s what counts.' : 'Look at you, showing up for life.'}</Text>
        </View>
      </View>

      <View style={s.week}>
        {currentWeek(today).map((day, i) => {
          const done = stats.completedDays.has(day);
          const isToday = day === today;
          return (
            <View key={day} style={s.weekDay}>
              <Text style={s.weekLetter}>{DAY_LETTERS[i]}</Text>
              <View style={[s.dayCircle, done ? s.dayDone : isToday ? s.dayToday : s.dayIdle]}>
                {done ? (
                  <Icon name="check" size={13} color={c.dayDone} strokeWidth={2} />
                ) : isToday ? (
                  <View style={s.todayDot} />
                ) : (
                  <Text style={s.dayIdleText}>·</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={s.levelBlock}>
        <View style={s.levelRow}>
          <Text style={s.levelText}>
            <Text style={s.levelStrong}>Level {stats.level}</Text> · {stats.rank}
          </Text>
          <Text style={s.levelXp}>
            {stats.levelXp}
            <Text style={s.levelXpOf}> / {XP_PER_LEVEL} XP</Text>
          </Text>
        </View>
        <View style={s.track}>
          <View style={[s.trackFill, { width: `${(stats.levelXp / XP_PER_LEVEL) * 100}%` }]} />
        </View>
        <Text style={s.levelCaption}>{stats.toNext} XP to your next level. You’ve got this.</Text>
      </View>
    </Card>
  );
}

function Mindset() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={s.mindset}>
      <Text style={s.quoteMark}>“</Text>
      <Text style={s.quote}>
        Life gets a little bigger when you try something <Text style={s.quoteEm}>a little different.</Text>
      </Text>
      <View style={s.mindsetFooter}>
        <Text style={s.mindsetLabel}>THE QUESTLY MINDSET</Text>
        <Icon name="spark" size={22} color={c.mindFooter} />
      </View>
    </View>
  );
}

function Crew() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { friends } = useData();
  const seeds = friends.length ? friends.slice(0, 3).map((f) => f.otherUid) : ['crew-a', 'crew-b', 'crew-c'];
  return (
    <View style={s.crew}>
      <View style={s.crewAvatars}>
        {seeds.map((seed, i) => (
          <View key={seed} style={{ marginLeft: i ? -6 : 0 }}>
            <Avatar seed={seed} size={33} ring={c.bg} />
          </View>
        ))}
        {friends.length > 0 && <View style={s.online} />}
      </View>
      <Text style={s.crewTitle}>A little friendly motivation</Text>
      <Text style={s.crewText}>
        {friends.length
          ? 'Your crew is out making memories. Send a little adventure their way.'
          : 'Adventures are better together. Bring a friend into your crew.'}
      </Text>
      <Button
        variant="text"
        title={friends.length ? 'Visit your friends' : 'Find your crew'}
        arrow
        onPress={() => router.navigate('/friends')}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

export default function TodayScreen() {
  const { user } = useAuth();
  const { stats, error } = useData();

  return (
    <Screen>
      <PageHeading
        eyebrow="Make room for a little wonder"
        title={`Hey ${firstName(user.name)}, let’s make today count`}
        subtitle="Step out of your routine. Your next little adventure is waiting."
        right={<StreakPill streak={stats.streak} />}
      />
      <ErrorText message={error} />
      <FeaturedQuest />
      <FromFriends />
      <LittleWins />
      <Mindset />
      <Crew />
    </Screen>
  );
}

const makeStyles = (c) => ({
  streakPill: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: c.streakBorder,
    backgroundColor: c.streakBg,
    alignItems: 'center',
    marginTop: 18,
  },
  streakPillRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakPillNumber: { fontFamily: fonts.body700, fontSize: 17, color: c.streakStrong },
  streakPillLabel: { fontFamily: fonts.body400, fontSize: 10, color: c.streakText },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: c.border },
  sender: { fontFamily: fonts.body400, fontSize: 12, color: c.secondary },
  ago: { fontSize: 11, color: c.faint },
  friendQuestTitle: { fontFamily: fonts.heading700, fontSize: 14.5, lineHeight: 20, letterSpacing: -0.15, color: c.text },
  weekStreak: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  streakIcon: { width: 50, height: 54, borderRadius: 13, backgroundColor: c.streakIconBg, alignItems: 'center', justifyContent: 'center' },
  streakBig: { fontFamily: fonts.heading800, fontSize: 32, letterSpacing: -0.8, color: c.text },
  streakBigLabel: { fontFamily: fonts.body500, fontSize: 15, letterSpacing: 0, color: c.text },
  streakCaption: { fontFamily: fonts.body400, fontSize: 13, color: c.muted, marginTop: 4 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  weekDay: { alignItems: 'center', gap: 8 },
  weekLetter: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dayDone: { backgroundColor: c.pale, borderColor: c.pale },
  dayToday: { borderStyle: 'dashed', borderColor: c.dayDashed },
  dayIdle: { backgroundColor: c.bg, borderColor: c.border },
  todayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: c.dayDashed },
  dayIdleText: { fontFamily: fonts.body700, fontSize: 14, color: c.dayIdle, marginTop: -2 },
  levelBlock: { marginTop: 22, paddingTop: 20, borderTopWidth: 1, borderTopColor: c.border },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelText: { fontFamily: fonts.body400, fontSize: 12.5, color: c.secondary },
  levelStrong: { fontFamily: fonts.body600, color: c.text },
  levelXp: { fontFamily: fonts.body700, fontSize: 12.5, color: c.purple },
  levelXpOf: { fontFamily: fonts.body400, color: c.muted },
  track: { height: 6, borderRadius: 8, backgroundColor: c.pale, marginTop: 12, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 8, backgroundColor: c.progressFill },
  levelCaption: { fontFamily: fonts.body400, fontSize: 12, color: c.muted, marginTop: 10 },
  mindset: { backgroundColor: c.mindBg, borderWidth: 1, borderColor: c.mindBorder, borderRadius: 14, padding: 22 },
  quoteMark: { fontFamily: fonts.heading800, fontSize: 46, lineHeight: 46, color: c.quoteMark, marginBottom: -6 },
  quote: { fontFamily: fonts.heading600, fontSize: 23, lineHeight: 36, letterSpacing: -0.55, color: c.mindText },
  quoteEm: { color: c.mindEm },
  mindsetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 },
  mindsetLabel: { fontFamily: fonts.body600, fontSize: 10, letterSpacing: 1.4, color: c.mindFooter },
  crew: { paddingHorizontal: 4, paddingTop: 4 },
  crewAvatars: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  online: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.online, borderWidth: 2, borderColor: c.bg, marginLeft: -9, marginTop: 24 },
  crewTitle: { fontFamily: fonts.heading700, fontSize: 15, color: c.text },
  crewText: { fontFamily: fonts.body400, fontSize: 13.5, lineHeight: 21, color: c.muted, marginTop: 7 },
});
