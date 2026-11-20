import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import ModalCard, { closeModal } from '../../components/ModalCard';
import Avatar from '../../components/Avatar';
import { Button, EmptyState, ErrorText, Eyebrow, Field, ModalIcon, firstName } from '../../components/ui';
import { sendQuest, MAX_FRIEND_QUEST } from '../../lib/quests';
import { generateFriendQuest, aiErrorMessage } from '../../lib/ai';
import { CATEGORIES, randomFriendIdea } from '../../constants/quests';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

export default function SendQuestScreen() {
  const s = useStyles(makeStyles);
  const { categories, colors: c } = useTheme();
  const notify = useToast();
  const { user } = useAuth();
  const { friends } = useData();
  const { to } = useLocalSearchParams();

  const [friendUid, setFriendUid] = useState(typeof to === 'string' ? to : friends[0]?.otherUid ?? null);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('social');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [busy, setBusy] = useState(null); // 'ai' | 'send'
  const [error, setError] = useState('');

  const friend = friends.find((f) => f.otherUid === friendUid);
  const name = friend ? firstName(friend.other.name) : 'your friend';

  function fill(idea, fromAI) {
    setText(idea.title);
    setCategory(idea.category);
    setAiGenerated(fromAI);
  }

  async function askGemini() {
    setError('');
    setBusy('ai');
    try {
      fill(await generateFriendQuest({ friendName: friend?.other.name, current: text }), true);
    } catch (e) {
      setError(aiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    setError('');
    if (!friend) return setError('Pick who gets this little adventure.');
    setBusy('send');
    try {
      await sendQuest({ from: user, to: { uid: friend.otherUid, name: friend.other.name }, quest: { title: text, category, aiGenerated } });
      notify(`A little adventure is on its way to ${name}.`);
      closeModal();
    } catch {
      setError('Couldn’t send the quest. Check that you’re still friends and try again.');
      setBusy(null);
    }
  }

  if (friends.length === 0) {
    return (
      <ModalCard>
        <ModalIcon name="spark" />
        <Text style={s.h2}>Send a little adventure.</Text>
        <EmptyState>Your crew is empty. Add a friend first, then send them something fun.</EmptyState>
        <Button title="Add a friend" icon="plus" onPress={() => router.replace('/add-friend')} style={{ marginTop: 18 }} />
      </ModalCard>
    );
  }

  return (
    <ModalCard>
      <ModalIcon name="spark" />
      <Eyebrow>A little nudge goes a long way</Eyebrow>
      <Text style={s.h2}>Send a little adventure.</Text>
      <Text style={s.p}>Give a friend something unexpected to smile about.</Text>

      <Text style={s.label}>Who’s your lucky adventurer?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.friendRow} keyboardShouldPersistTaps="handled">
        {friends.map((f) => {
          const selected = f.otherUid === friendUid;
          return (
            <Pressable
              key={f.otherUid}
              onPress={() => setFriendUid(f.otherUid)}
              style={[s.friendChip, selected && s.friendChipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={f.other.name}
            >
              <Avatar seed={f.otherUid} size={28} />
              <Text style={[s.friendChipText, selected && s.friendChipTextOn]}>{firstName(f.other.name)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Field
        label={`Your quest for ${name}`}
        placeholder="Try a new café. Say hello to a neighbor. Make a little magic…"
        value={text}
        onChangeText={(t) => {
          setText(t);
          setAiGenerated(false);
        }}
        multiline
        maxLength={MAX_FRIEND_QUEST}
        hint={`${text.length}/${MAX_FRIEND_QUEST}`}
        style={{ marginTop: 20 }}
      />

      <View style={s.vibes}>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const selected = category === key;
          const tone = categories[key];
          return (
            <Pressable
              key={key}
              onPress={() => setCategory(key)}
              style={[s.vibe, { backgroundColor: selected ? tone.bg : 'transparent', borderColor: selected ? tone.fg : c.border }]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[s.vibeText, selected && { color: tone.fg }]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        variant="dashed"
        title="Surprise them with a random quest"
        icon="shuffle"
        onPress={() => fill(randomFriendIdea(text), false)}
        disabled={!!busy}
        style={{ marginTop: 14 }}
      />
      <Button variant="dashed" title="Let Gemini write one" icon="spark" onPress={askGemini} loading={busy === 'ai'} disabled={!!busy} style={{ marginTop: 10 }} />

      <ErrorText message={error} style={{ marginTop: 14 }} />

      <Button
        title={`Send quest to ${name}`}
        arrow
        onPress={send}
        loading={busy === 'send'}
        disabled={!text.trim() || busy === 'ai'}
        style={{ marginTop: 20 }}
      />
    </ModalCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 29, lineHeight: 37, letterSpacing: -1.15, color: c.text, marginBottom: 12 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, marginBottom: 22 },
  label: { fontFamily: fonts.body600, fontSize: 13, color: c.text, marginBottom: 10 },
  friendRow: { gap: 8, paddingVertical: 2 },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 5,
    paddingRight: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.inputBg,
  },
  friendChipOn: { borderColor: c.purple, backgroundColor: c.pale },
  friendChipText: { fontFamily: fonts.body500, fontSize: 14, color: c.text },
  friendChipTextOn: { color: c.purple, fontFamily: fonts.body600 },
  vibes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  vibe: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7, borderWidth: 1, borderColor: c.border },
  vibeText: { fontFamily: fonts.body500, fontSize: 12.5, color: c.muted },
});
