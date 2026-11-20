import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '../../../context/AuthContext';
import { useData, useQuest } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import Icon from '../../../components/Icon';
import { MediaGallery } from '../../../components/Media';
import { CategoryChip, QuestMeta } from '../../../components/FeaturedQuest';
import { Button, EmptyState, ErrorText, Eyebrow, StatusTag, firstName } from '../../../components/ui';
import { cancelQuest, respondToQuest } from '../../../lib/quests';
import { confirm } from '../../../lib/confirm';
import { formatDay } from '../../../lib/dates';
import { useStyles, useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** „today” / „yesterday” / „on November 18” */
function completedWhen(quest, today) {
  const day = formatDay(quest.completedDate || quest.completedAt, today);
  return day === 'Today' || day === 'Yesterday' ? day.toLowerCase() : `on ${day}`;
}

export default function QuestDetailScreen() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const notify = useToast();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { today } = useData();
  const quest = useQuest(id);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  async function run(kind, action, success, after) {
    setError('');
    setBusy(kind);
    try {
      await action();
      if (success) notify(success);
      after?.();
    } catch {
      setError('Couldn’t save that. Try again.');
    } finally {
      setBusy(null);
    }
  }

  async function takeBack() {
    const ok = await confirm('Take this quest back?', `${firstName(quest.ownerName)} won’t see it anymore.`, 'Take back');
    if (ok) run('cancel', () => cancelQuest(quest.id), 'Quest taken back.', goBack);
  }

  const header = (
    <View style={s.header}>
      <Pressable onPress={goBack} hitSlop={8} style={s.back} accessibilityRole="button" accessibilityLabel="Back">
        <Icon name="back" size={20} color={c.text} />
      </Pressable>
      <Text style={s.headerTitle}>{quest?.status === 'completed' ? 'A memory' : 'Quest'}</Text>
    </View>
  );

  if (!quest) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.content}>
          {header}
          <EmptyState>This quest isn’t here anymore. It may have been taken back.</EmptyState>
        </View>
      </SafeAreaView>
    );
  }

  const mine = quest.ownerUid === user.uid;
  const sentByMe = quest.fromUid === user.uid;
  const eyebrow =
    quest.source === 'daily' ? 'Your daily side quest' : sentByMe ? `Sent to ${firstName(quest.ownerName)}` : `From ${firstName(quest.fromName)}`;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        {header}

        <View style={s.card}>
          <View style={s.cardTop}>
            <Eyebrow color={c.questEyebrow} style={{ marginBottom: 0 }}>
              {eyebrow}
            </Eyebrow>
            <StatusTag status={quest.status} />
          </View>
          <CategoryChip category={quest.category} />
          <Text style={s.title}>{quest.title}</Text>
          {!!quest.description && <Text style={s.description}>{quest.description}</Text>}
          <QuestMeta quest={quest} />

          {mine && quest.status === 'pending' && (
            <View style={s.actions}>
              <Button
                title="Accept quest"
                icon="check"
                small
                loading={busy === 'accept'}
                disabled={!!busy}
                onPress={() => run('accept', () => respondToQuest(quest.id, true), 'Quest accepted. Your next little adventure awaits!')}
              />
              <Button
                variant="subtle"
                title="Decline"
                loading={busy === 'decline'}
                disabled={!!busy}
                onPress={() => run('decline', () => respondToQuest(quest.id, false), 'Quest declined. There’s always another adventure.', goBack)}
              />
            </View>
          )}
          {mine && quest.status === 'active' && (
            <Button title="Complete your quest" icon="flag" arrow onPress={() => router.push(`/complete/${quest.id}`)} />
          )}
          {sentByMe && quest.status === 'pending' && (
            <Button variant="secondary" title="Take it back" onPress={takeBack} loading={busy === 'cancel'} />
          )}
          <ErrorText message={error} style={{ marginTop: 12 }} />
        </View>

        {sentByMe && quest.status === 'pending' && (
          <Text style={s.info}>Waiting for {firstName(quest.ownerName)} to say yes.</Text>
        )}
        {sentByMe && quest.status === 'active' && (
          <Text style={s.info}>{firstName(quest.ownerName)} said yes and is on it. 💪</Text>
        )}
        {sentByMe && quest.status === 'declined' && (
          <Text style={s.info}>{firstName(quest.ownerName)} passed on this one. Try another little adventure!</Text>
        )}

        {quest.status === 'completed' && (
          <View style={{ gap: 16 }}>
            <View style={s.doneRow}>
              <Icon name="check" size={14} color={c.medalIcon} strokeWidth={2} />
              <Text style={s.doneText}>
                Completed {completedWhen(quest, today)}
                {sentByMe ? ` by ${firstName(quest.ownerName)}` : ''}
              </Text>
              <Text style={s.doneXp}>+{quest.xp ?? 0} XP</Text>
            </View>
            {!!quest.note && (
              <View style={s.note}>
                <Text style={s.noteText}>“{quest.note}”</Text>
              </View>
            )}
            <MediaGallery media={quest.media} />
            {!quest.note && !quest.media?.length && <EmptyState>No photos or words for this one. Just the good feeling.</EmptyState>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.bg },
  content: { padding: 22, gap: 22, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.heading800, fontSize: 20, letterSpacing: -0.5, color: c.text },
  card: { backgroundColor: c.card, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 16, padding: 21 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontFamily: fonts.heading800, fontSize: 25, lineHeight: 33, letterSpacing: -1, color: c.questTitle, marginTop: 12 },
  description: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.questText, marginTop: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, textAlign: 'center' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  doneText: { flex: 1, fontFamily: fonts.body500, fontSize: 13, color: c.medalIcon },
  doneXp: { fontFamily: fonts.body700, fontSize: 12.5, color: c.purple },
  note: { backgroundColor: c.mindBg, borderWidth: 1, borderColor: c.mindBorder, borderRadius: 14, padding: 20 },
  noteText: { fontFamily: fonts.heading600, fontSize: 17, lineHeight: 26, letterSpacing: -0.3, color: c.mindText },
});
