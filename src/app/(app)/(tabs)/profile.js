import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { Screen } from '../../../components/Layout';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/Icon';
import { MediaThumb } from '../../../components/Media';
import { Button, Card, EmptyState, ErrorText, PageHeading, SectionHeading } from '../../../components/ui';
import { updateBio, MAX_BIO, DEFAULT_BIO } from '../../../lib/users';
import { formatDay } from '../../../lib/dates';
import { isFirebaseConfigured } from '../../../lib/firebase';
import { useStyles, useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

const MAX_THUMBS = 4;

function Stat({ icon, value, label, last }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={[s.stat, !last && s.statDivider]}>
      <Icon name={icon} size={22} color={c.dark ? c.purple : '#A085C3'} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, onPress }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.settingsRow, pressed && { opacity: 0.6 }]} accessibilityRole="button">
      <Icon name={icon} size={19} color={c.secondary} />
      <Text style={s.settingsLabel}>{label}</Text>
      <Icon name="chevron" size={17} color={c.secondary} />
    </Pressable>
  );
}

function HistoryCard({ quest, today }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const media = quest.media ?? [];
  return (
    <Card onPress={() => router.push(`/quest/${quest.id}`)} accessibilityLabel={quest.title.replace('\n', ' ')} style={{ padding: 21 }}>
      <View style={s.historyTop}>
        <View style={s.historyDate}>
          <Icon name="check" size={13} color={c.muted} />
          <Text style={s.historyDateText}>
            {formatDay(quest.completedDate || quest.completedAt, today)}
            {quest.source === 'friend' ? ` · from ${quest.fromName?.split(' ')[0]}` : ''}
          </Text>
        </View>
        <Text style={s.historyXp}>+{quest.xp ?? 0} XP</Text>
      </View>
      <Text style={s.historyTitle}>{quest.title.replace('\n', ' ')}</Text>
      {!!quest.note && <Text style={s.historyNote}>“{quest.note}”</Text>}
      {media.length > 0 && (
        <View style={s.thumbs}>
          {media.slice(0, MAX_THUMBS).map((m, i) => (
            <MediaThumb key={m.url ?? i} item={m} size={64} />
          ))}
          {media.length > MAX_THUMBS && (
            <View style={s.more}>
              <Text style={s.moreText}>+{media.length - MAX_THUMBS}</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

export default function ProfileScreen() {
  const s = useStyles(makeStyles);
  const { isDark, toggle } = useTheme();
  const notify = useToast();
  const { user, signOut } = useAuth();
  const { stats, completed, profile, today, loading } = useData();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  function startEdit() {
    setBio(profile?.bio ?? DEFAULT_BIO);
    setEditing(true);
  }

  async function saveBio() {
    setError('');
    try {
      await updateBio(user.uid, bio);
      setEditing(false);
      notify('Tagline saved.');
    } catch {
      setError('Couldn’t save your tagline. Try again.');
    }
  }

  return (
    <Screen keyboard>
      <PageHeading eyebrow="Look how far you’ve wandered" title="A little more you, every day" subtitle="Every small adventure is part of your story." />

      <View style={s.profileCard}>
        <View style={{ alignItems: 'center' }}>
          <Avatar seed={user.uid} size={92} />
          <Text style={s.level}>LEVEL {stats.level} EXPLORER</Text>
          <Text style={s.name}>{user.name}</Text>
          {editing ? (
            <View style={{ alignItems: 'center', gap: 6 }}>
              <TextInput
                style={s.bioInput}
                value={bio}
                onChangeText={setBio}
                maxLength={MAX_BIO}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveBio}
                accessibilityLabel="Your tagline"
              />
              <Button variant="text" title="Save tagline" onPress={saveBio} />
            </View>
          ) : (
            <Pressable onPress={startEdit} accessibilityRole="button" accessibilityHint="Edit your tagline">
              <Text style={s.bio}>{profile?.bio ?? DEFAULT_BIO}</Text>
            </Pressable>
          )}
          <Text style={s.handle}>@{user.username}</Text>
          <ErrorText message={error} style={{ marginTop: 8 }} />
        </View>

        <View style={s.stats}>
          <Stat icon="flame" value={stats.streak} label="Day streak" />
          <Stat icon="flag" value={stats.completedCount} label="Quests done" />
          <Stat icon="bolt" value={stats.totalXp} label="Total XP" last />
        </View>

        <SettingsRow icon={isDark ? 'sun' : 'moon'} label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onPress={toggle} />
        <SettingsRow icon="edit" label="Edit your tagline" onPress={startEdit} />
        <SettingsRow icon="logout" label="Log out" onPress={signOut} />

        {!isFirebaseConfigured && (
          <Text style={s.demoNote}>
            Your little demo adventure.{'\n'}Progress is saved for this session.
          </Text>
        )}
      </View>

      <View style={{ gap: 16 }}>
        <SectionHeading title="Your adventure log" count={completed.length} subtitle="Small moments worth remembering." />
        {completed.map((q) => (
          <HistoryCard key={q.id} quest={q} today={today} />
        ))}
        {!loading && completed.length === 0 && (
          <EmptyState>Your log is waiting for its first story. Finish today’s quest to start it.</EmptyState>
        )}
      </View>
    </Screen>
  );
}

const makeStyles = (c) => ({
  profileCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 22 },
  level: { fontFamily: fonts.body700, fontSize: 10.5, letterSpacing: 1.5, color: c.purple, marginTop: 22 },
  name: { fontFamily: fonts.heading800, fontSize: 26, letterSpacing: -0.8, color: c.text, marginTop: 8, textAlign: 'center' },
  bio: { fontFamily: fonts.body400, fontSize: 14, color: c.muted, marginTop: 8, textAlign: 'center' },
  bioInput: {
    fontFamily: fonts.body400,
    fontSize: 14,
    color: c.text,
    marginTop: 8,
    minWidth: 220,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: c.purple,
    paddingVertical: 4,
    outlineStyle: 'none',
  },
  handle: { fontFamily: fonts.body500, fontSize: 12.5, color: c.faint, marginTop: 6 },
  stats: { flexDirection: 'row', marginTop: 14, paddingVertical: 26, borderBottomWidth: 1, borderBottomColor: c.border },
  stat: { flex: 1, alignItems: 'center', gap: 8 },
  statDivider: { borderRightWidth: 1, borderRightColor: c.border },
  statValue: { fontFamily: fonts.heading800, fontSize: 22, color: c.text },
  statLabel: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: c.border },
  settingsLabel: { flex: 1, fontFamily: fonts.body400, fontSize: 14, color: c.secondary },
  demoNote: { fontFamily: fonts.body400, fontSize: 12, lineHeight: 19, color: c.muted, textAlign: 'center', marginTop: 22 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  historyDateText: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  historyXp: { fontFamily: fonts.body700, fontSize: 12, color: c.dark ? c.purple : '#9C80BD' },
  historyTitle: { fontFamily: fonts.heading800, fontSize: 17, lineHeight: 25, letterSpacing: -0.4, color: c.text, marginTop: 14 },
  historyNote: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 22, color: c.secondary, marginTop: 8 },
  thumbs: { flexDirection: 'row', gap: 8, marginTop: 14 },
  more: { width: 64, height: 64, borderRadius: 10, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' },
  moreText: { fontFamily: fonts.body700, fontSize: 15, color: c.purple },
});
