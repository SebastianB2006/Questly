import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { Screen } from '../../../components/Layout';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/Icon';
import { Button, Card, EmptyState, ErrorText, PageHeading, SectionHeading, StatusTag, Tag, firstName } from '../../../components/ui';
import { respondToQuest } from '../../../lib/quests';
import { useStyles, useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

function InboxCard({ quest }) {
  const s = useStyles(makeStyles);
  const notify = useToast();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  async function respond(accept) {
    setBusy(accept ? 'accept' : 'decline');
    setError('');
    try {
      await respondToQuest(quest.id, accept);
      notify(accept ? 'Quest accepted. Your next little adventure awaits!' : 'Quest declined. There’s always another adventure.');
    } catch {
      setError('Couldn’t save your answer. Try again.');
      setBusy(null);
    }
  }

  return (
    <View style={s.inboxCard}>
      <View style={s.inboxHeader}>
        <Avatar seed={quest.fromUid} />
        <View style={{ flex: 1 }}>
          <Text style={s.inboxFrom}>{firstName(quest.fromName)} sent you a quest</Text>
          <Text style={s.inboxSub}>A little nudge to try something new</Text>
        </View>
        <Tag category={quest.category} />
      </View>
      <Text style={s.inboxTitle}>{quest.title}</Text>
      <ErrorText message={error} style={{ marginBottom: 10 }} />
      {quest.status === 'pending' ? (
        <View style={s.actions}>
          <Button title="Accept quest" icon="check" small onPress={() => respond(true)} loading={busy === 'accept'} disabled={!!busy} />
          <Button title="Decline" variant="subtle" onPress={() => respond(false)} loading={busy === 'decline'} disabled={!!busy} />
        </View>
      ) : (
        <View style={[s.actions, { justifyContent: 'space-between' }]}>
          <StatusTag status="active" />
          <Button variant="text" title="Mark complete" arrow onPress={() => router.push(`/complete/${quest.id}`)} />
        </View>
      )}
    </View>
  );
}

export default function InboxScreen() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { inbox, active, sent } = useData();
  const madeForYou = [...inbox, ...active];

  return (
    <Screen>
      <PageHeading eyebrow="Good things are coming your way" title="Your quest inbox" subtitle="A little challenge from someone who knows you." />

      <View style={{ gap: 16 }}>
        <SectionHeading title="Made for you" count={madeForYou.length} />
        {madeForYou.map((q) => (
          <InboxCard key={q.id} quest={q} />
        ))}
        {madeForYou.length === 0 && <EmptyState>You’re all caught up. The next adventure is on its way.</EmptyState>}
      </View>

      <Card style={{ padding: 22 }}>
        <SectionHeading
          title="Sent with a little nudge"
          subtitle="Adventures you’ve put out into the world."
          right={<Icon name="arrow" size={18} color={c.muted} />}
        />
        {sent.map((q) => (
          <Pressable
            key={q.id}
            onPress={() => router.push(`/quest/${q.id}`)}
            style={({ pressed }) => [s.sentCard, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={`To ${q.ownerName}: ${q.title}`}
          >
            <Text style={s.sentTo}>To {firstName(q.ownerName)}</Text>
            <Text style={s.sentTitle}>{q.title}</Text>
            <StatusTag status={q.status} />
          </Pressable>
        ))}
        {sent.length === 0 && <Text style={s.noneSent}>Nothing sent yet. Brighten someone’s day!</Text>}
        <Button variant="secondary" title="Send a new quest" icon="plus" onPress={() => router.push('/send')} style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}

const makeStyles = (c) => ({
  inboxCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 20 },
  inboxHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inboxFrom: { fontFamily: fonts.body600, fontSize: 13, color: c.text },
  inboxSub: { fontFamily: fonts.body400, fontSize: 12, color: c.muted, marginTop: 2 },
  inboxTitle: { fontFamily: fonts.heading700, fontSize: 20, lineHeight: 28, letterSpacing: -0.6, color: c.text, marginVertical: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sentCard: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: c.border },
  sentTo: { fontFamily: fonts.body400, fontSize: 12.5, color: c.muted },
  sentTitle: { fontFamily: fonts.heading700, fontSize: 15, lineHeight: 21, color: c.text, marginTop: 6, marginBottom: 12 },
  noneSent: { fontFamily: fonts.body400, fontSize: 13, color: c.muted, marginTop: 16 },
});
