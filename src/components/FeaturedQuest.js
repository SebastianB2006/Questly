// Cardul mare „Your daily side quest” de pe ecranul Today.
// Pașii: Accept quest → Complete your quest (deschide fereastra de terminare) → Quest completed!
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import Icon from './Icon';
import QuestArt from './QuestArt';
import { Button, ErrorText } from './ui';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { questErrorMessage } from '../lib/quests';
import { CATEGORIES, DIFFICULTIES, MAX_REROLLS } from '../constants/quests';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

function DifficultyBars({ level }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[4, 6, 8].map((h, i) => (
        <View key={h} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: c.bars, opacity: i < level ? 1 : 0.45 }} />
      ))}
    </View>
  );
}

export function QuestMeta({ quest }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const difficulty = DIFFICULTIES[quest.difficulty] ?? DIFFICULTIES.easy;
  return (
    <View style={s.meta}>
      <View style={s.metaItem}>
        <DifficultyBars level={difficulty.bars} />
        <Text style={s.metaText}>{difficulty.label} difficulty</Text>
      </View>
      {!!quest.minutes && (
        <View style={s.metaItem}>
          <Icon name="clock" size={15} color={c.questMeta} />
          <Text style={s.metaText}>{quest.minutes} min</Text>
        </View>
      )}
      <View style={s.metaItem}>
        <Icon name="bolt" size={15} color={c.xp} />
        <Text style={[s.metaText, s.xp]}>+{quest.xp ?? 0} XP</Text>
      </View>
    </View>
  );
}

export function CategoryChip({ category }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.category}>
      <View style={s.categoryDot} />
      <Text style={s.categoryText}>{CATEGORIES[category]?.label ?? 'Social'}</Text>
    </View>
  );
}

function Shell({ children, number }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={s.eyebrowRow}>
          <Icon name="spark" size={13} color={c.questEyebrow} />
          <Text style={s.eyebrow}>YOUR DAILY SIDE QUEST</Text>
        </View>
        {!!number && <Text style={s.number}>NO. {String(number).padStart(3, '0')}</Text>}
      </View>
      <QuestArt />
      {children}
    </View>
  );
}

export default function FeaturedQuest() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const notify = useToast();
  const { daily, dailyError, retryDaily, reroll, accept } = useData();
  const [busy, setBusy] = useState(null); // 'accept' | 'swap'
  const [error, setError] = useState('');

  if (!daily) {
    return (
      <Shell>
        {dailyError ? (
          <View style={{ gap: 14, marginTop: 8 }}>
            <ErrorText message={dailyError} />
            <Button title="Try again" variant="secondary" onPress={retryDaily} />
          </View>
        ) : (
          <View style={s.loading}>
            <ActivityIndicator color={c.purple} />
            <Text style={s.loadingText}>Gemini is dreaming up today’s quest…</Text>
          </View>
        )}
      </Shell>
    );
  }

  const completed = daily.status === 'completed';
  const accepted = Boolean(daily.acceptedAt);
  const swapsLeft = MAX_REROLLS - (daily.rerolls ?? 0);

  async function run(kind, action, success) {
    setError('');
    setBusy(kind);
    try {
      await action();
      if (success) notify(success);
    } catch (e) {
      setError(questErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  function onMain() {
    if (completed) router.push(`/quest/${daily.id}`);
    else if (accepted) router.push(`/complete/${daily.id}`);
    else run('accept', accept, 'Quest accepted. Your next little adventure awaits!');
  }

  return (
    <Shell number={daily.number}>
      <CategoryChip category={daily.category} />
      <Text style={s.title}>{daily.title}</Text>
      {!!daily.description && <Text style={s.description}>{daily.description}</Text>}
      <QuestMeta quest={daily} />

      <Button
        title={completed ? 'Quest completed!' : accepted ? 'Complete your quest' : 'Accept quest'}
        icon={completed ? 'check' : accepted ? 'flag' : 'plus'}
        arrow
        onPress={onMain}
        loading={busy === 'accept'}
      />
      <ErrorText message={error} style={{ marginTop: 10, textAlign: 'center' }} />

      {!accepted && !completed ? (
        <Pressable
          onPress={() => run('swap', reroll)}
          disabled={!!busy || swapsLeft <= 0}
          style={({ pressed }) => [s.swap, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          {busy === 'swap' ? (
            <ActivityIndicator size="small" color={c.questMeta} />
          ) : (
            <>
              <Icon name="shuffle" size={15} color={c.questMeta} />
              <Text style={s.swapText}>{swapsLeft > 0 ? 'Not your vibe? Swap for another' : 'That’s all the swaps for today'}</Text>
            </>
          )}
        </Pressable>
      ) : (
        <View style={s.caption}>
          <Icon name="check" size={14} color={c.questMeta} />
          <Text style={s.captionText}>
            {completed ? 'One small adventure. One very good feeling.' : 'You’re in! Go make a little good happen.'}
          </Text>
        </View>
      )}
    </Shell>
  );
}

const makeStyles = (c) => ({
  card: { backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 16, paddingTop: 20, paddingHorizontal: 21, paddingBottom: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { fontFamily: fonts.body700, fontSize: 10, letterSpacing: 1.4, color: c.questEyebrow },
  number: { fontFamily: fonts.body400, fontSize: 10, letterSpacing: 1, color: c.questNumber },
  loading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 18 },
  loadingText: { fontFamily: fonts.body500, fontSize: 14, color: c.questEyebrow },
  category: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: c.categoryBg,
    borderWidth: 1,
    borderColor: c.categoryBorder,
    marginTop: 6,
  },
  categoryDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: c.categoryDot },
  categoryText: { fontFamily: fonts.body500, fontSize: 11.5, color: c.categoryText },
  title: { fontFamily: fonts.heading800, fontSize: 27, lineHeight: 35, letterSpacing: -1.1, color: c.questTitle, marginTop: 12 },
  description: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.questText, marginTop: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 18, rowGap: 8, marginVertical: 18 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fonts.body400, fontSize: 12, color: c.questMeta },
  xp: { fontFamily: fonts.body600, color: c.xp },
  swap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, minHeight: 28 },
  swapText: { fontFamily: fonts.body400, fontSize: 12.5, color: c.questMeta },
  caption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  captionText: { fontFamily: fonts.body400, fontSize: 12.5, color: c.questMeta },
});
