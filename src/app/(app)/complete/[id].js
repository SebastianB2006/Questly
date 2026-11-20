import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '../../../context/AuthContext';
import { useData, useQuest } from '../../../context/DataContext';
import ModalCard from '../../../components/ModalCard';
import { MediaThumb } from '../../../components/Media';
import { Button, EmptyState, ErrorText, Eyebrow, Field, ModalIcon, firstName } from '../../../components/ui';
import { completeQuest, computeStreak, questErrorMessage, MAX_NOTE } from '../../../lib/quests';
import { pickMedia, uploadQuestMedia, mediaErrorMessage, MAX_MEDIA } from '../../../lib/media';
import { useStyles } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

export default function CompleteQuestScreen() {
  const s = useStyles(makeStyles);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { completed, today } = useData();
  const quest = useQuest(id);

  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  async function add(source) {
    setError('');
    try {
      const picked = await pickMedia(source, MAX_MEDIA - items.length);
      if (picked.length) setItems((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
    } catch (e) {
      setError(mediaErrorMessage(e));
    }
  }

  async function save() {
    setError('');
    setSaving(true);
    setProgress(0);
    try {
      const media = items.length ? await uploadQuestMedia(quest.id, items, setProgress) : [];
      const streak = computeStreak([...completed, { completedDate: today }], today);
      await completeQuest(quest, { uid: user.uid, note, media, streak });
      router.replace({ pathname: '/success', params: { xp: String(quest.xp ?? 0), streak: String(streak) } });
    } catch (e) {
      console.warn('[Questly] Saving the quest:', e?.code ?? e);
      setError(questErrorMessage(e));
      setSaving(false);
    }
  }

  if (!quest || (quest.status !== 'active' && !saving)) {
    return (
      <ModalCard>
        <ModalIcon name="flag" />
        <Text style={s.h2}>{quest?.status === 'completed' ? 'Already in your log!' : 'Quest not found'}</Text>
        <EmptyState>
          {quest?.status === 'completed' ? 'You finished this one already. Nice.' : 'It may have been taken back by the friend who sent it.'}
        </EmptyState>
      </ModalCard>
    );
  }

  const fromFriend = quest.source === 'friend';

  return (
    <ModalCard>
      <ModalIcon name="flag" />
      <Eyebrow>A moment worth remembering</Eyebrow>
      <Text style={s.h2}>How did your{'\n'}adventure go?</Text>
      <View style={s.completingTitle}>
        <Text style={s.completingTitleText}>{quest.title.replace('\n', ' ')}</Text>
      </View>

      <Text style={s.label}>
        Add photos or videos <Text style={s.optional}>(optional)</Text>
      </Text>
      {items.length > 0 && (
        <View style={s.thumbs}>
          {items.map((m, i) => (
            <MediaThumb
              key={`${m.uri}-${i}`}
              item={m}
              size={70}
              onRemove={saving ? undefined : () => setItems((prev) => prev.filter((_, j) => j !== i))}
            />
          ))}
        </View>
      )}
      {items.length < MAX_MEDIA ? (
        <View style={s.pickRow}>
          <Button variant="dashed" title="Gallery" icon="image" onPress={() => add('library')} disabled={saving} style={{ flex: 1 }} />
          {Platform.OS !== 'web' && (
            <>
              <Button variant="dashed" title="Photo" icon="camera" onPress={() => add('photo')} disabled={saving} style={{ flex: 1 }} />
              <Button variant="dashed" title="Video" icon="video" onPress={() => add('video')} disabled={saving} style={{ flex: 1 }} />
            </>
          )}
        </View>
      ) : (
        <Text style={s.hint}>That’s the maximum of {MAX_MEDIA} files.</Text>
      )}

      <Field
        label="Tell your future self a little about it"
        optional
        placeholder="What happened? How did it make you feel?"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={MAX_NOTE}
        editable={!saving}
        hint={`${note.length}/${MAX_NOTE} · ${fromFriend ? `Saved to your log. ${firstName(quest.fromName)} will see it too.` : 'Just for you and your adventure log.'}`}
        style={{ marginTop: 22 }}
      />

      <ErrorText message={error} style={{ marginTop: 14 }} />

      {saving && items.length > 0 && (
        <View style={{ marginTop: 16, gap: 8 }} accessibilityLabel={`Uploading ${Math.round(progress * 100)}%`}>
          <Text style={s.hint}>Saving your memories… {Math.round(progress * 100)}%</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
      )}

      <Button title="Mark as completed" icon="check" arrow onPress={save} loading={saving} style={{ marginTop: 22 }} />
    </ModalCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 29, lineHeight: 37, letterSpacing: -1.15, color: c.text, marginBottom: 6 },
  completingTitle: { backgroundColor: c.pale, borderRadius: 10, padding: 15, marginTop: 18, marginBottom: 22 },
  completingTitleText: { fontFamily: fonts.heading700, fontSize: 14.5, lineHeight: 22, color: c.purple },
  label: { fontFamily: fonts.body600, fontSize: 13, color: c.text, marginBottom: 10 },
  optional: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 6, marginBottom: 12 },
  pickRow: { flexDirection: 'row', gap: 8 },
  hint: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  track: { height: 6, borderRadius: 8, backgroundColor: c.pale, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: c.progressFill },
});
