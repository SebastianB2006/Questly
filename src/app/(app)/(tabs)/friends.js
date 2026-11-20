import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import { Screen } from '../../../components/Layout';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/Icon';
import { Button, Card, EmptyState, ErrorText, PageHeading, SectionHeading, firstName } from '../../../components/ui';
import { acceptFriend, removeFriendship } from '../../../lib/friends';
import { confirm } from '../../../lib/confirm';
import { useStyles, useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/fonts';

function FriendCard({ friend, onRemove }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const name = friend.other.name;
  return (
    <Pressable
      onLongPress={onRemove}
      delayLongPress={500}
      style={s.friendCard}
      accessibilityLabel={`${name}, level ${friend.level}, ${friend.streak} day streak`}
      accessibilityActions={[{ name: 'remove', label: 'Remove from your crew' }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'remove' && onRemove()}
    >
      <View style={s.friendTop}>
        <Avatar seed={friend.otherUid} size={64} />
        <View style={s.friendStreak}>
          <Icon name="flame" size={16} color={c.streakText} />
          <Text style={s.friendStreakText}>{friend.streak}</Text>
        </View>
      </View>
      <Text style={s.friendName}>{name}</Text>
      {!!friend.bio && <Text style={s.friendBio}>{friend.bio}</Text>}
      <Text style={s.friendLevel}>
        Level {friend.level} explorer <Text style={s.friendLevelMuted}>· {friend.streak} day streak</Text>
      </Text>
      <Button
        variant="secondary"
        title="Send a quest"
        icon="plus"
        arrow
        onPress={() => router.push({ pathname: '/send', params: { to: friend.otherUid } })}
      />
    </Pressable>
  );
}

function RequestRow({ request, children }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.request}>
      <View style={s.requestRow}>
        <Avatar seed={request.otherUid} />
        <View style={{ flex: 1 }}>
          <Text style={s.requestName}>{request.other.name}</Text>
          {!!request.other.username && <Text style={s.requestHandle}>@{request.other.username}</Text>}
        </View>
      </View>
      <View style={s.requestActions}>{children}</View>
    </View>
  );
}

export default function FriendsScreen() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const notify = useToast();
  const { friends, incomingRequests, outgoingRequests } = useData();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const q = search.trim().toLowerCase();
  const shown = friends.filter((f) => f.other.name.toLowerCase().includes(q) || f.other.username?.includes(q));

  async function run(action, success) {
    setError('');
    try {
      await action();
      if (success) notify(success);
    } catch {
      setError('Couldn’t save that. Try again.');
    }
  }

  async function remove(f) {
    const ok = await confirm(`Remove ${f.other.name} from your crew?`, 'Quests you already sent stay in your log.', 'Remove');
    if (ok) run(() => removeFriendship(f.id), `${firstName(f.other.name)} left your crew.`);
  }

  return (
    <Screen keyboard>
      <PageHeading eyebrow="Better with your people" title="Your adventure crew" subtitle="A nudge, a challenge, a shared little adventure." />

      <View style={s.toolbar}>
        <View style={s.search}>
          <Icon name="search" size={18} color={c.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Find someone in your crew…"
            placeholderTextColor={c.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            accessibilityLabel="Search friends"
          />
        </View>
        <Button title="Add a friend" icon="plus" small onPress={() => router.push('/add-friend')} />
      </View>

      <ErrorText message={error} />

      {incomingRequests.length > 0 && (
        <Card>
          <SectionHeading title="Wants to join your crew" count={incomingRequests.length} />
          {incomingRequests.map((r) => (
            <RequestRow key={r.id} request={r}>
              <Button variant="subtle" title="Decline" onPress={() => run(() => removeFriendship(r.id))} />
              <Button
                title="Accept"
                icon="check"
                small
                onPress={() => run(() => acceptFriend(r.id), `${firstName(r.other.name)} joined your crew!`)}
              />
            </RequestRow>
          ))}
        </Card>
      )}

      {friends.length === 0 ? (
        <EmptyState>Your crew is empty for now. Tap “Add a friend” and type their username.</EmptyState>
      ) : shown.length === 0 ? (
        <EmptyState>No friends found. Try another name.</EmptyState>
      ) : (
        <View style={{ gap: 16 }}>
          {shown.map((f) => (
            <FriendCard key={f.id} friend={f} onRemove={() => remove(f)} />
          ))}
          <Text style={s.hint}>Tip: press and hold a card to remove someone from your crew.</Text>
        </View>
      )}

      {outgoingRequests.length > 0 && (
        <Card>
          <SectionHeading title="Waiting for a yes" count={outgoingRequests.length} />
          {outgoingRequests.map((r) => (
            <RequestRow key={r.id} request={r}>
              <Button variant="subtle" title="Cancel" onPress={() => run(() => removeFriendship(r.id))} />
            </RequestRow>
          ))}
        </Card>
      )}

      <View style={s.banner}>
        <Icon name="friends" size={32} color={c.purple} />
        <View style={{ flex: 1 }}>
          <Text style={s.bannerTitle}>Good adventures deserve good company.</Text>
          <Text style={s.bannerText}>Send a quest to someone who could use a little unexpected joy.</Text>
        </View>
      </View>
    </Screen>
  );
}

const makeStyles = (c) => ({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  searchInput: { flex: 1, fontFamily: fonts.body400, fontSize: 14, color: c.text, outlineStyle: 'none' },
  friendCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 15, padding: 23 },
  friendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  friendStreak: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: c.streakBg },
  friendStreakText: { fontFamily: fonts.body500, fontSize: 14, color: c.streakText },
  friendName: { fontFamily: fonts.heading800, fontSize: 21, letterSpacing: -0.6, color: c.text, marginTop: 17 },
  friendBio: { fontFamily: fonts.body400, fontSize: 13.5, lineHeight: 20, color: c.muted, marginTop: 6 },
  friendLevel: { fontFamily: fonts.body400, fontSize: 12.5, color: c.secondary, marginTop: 14, marginBottom: 20 },
  friendLevelMuted: { color: c.muted },
  hint: { fontFamily: fonts.body400, fontSize: 12, color: c.faint, textAlign: 'center' },
  request: { marginTop: 16, gap: 12 },
  requestRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requestActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  requestName: { fontFamily: fonts.heading700, fontSize: 14.5, color: c.text },
  requestHandle: { fontFamily: fonts.body400, fontSize: 12, color: c.muted, marginTop: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 22, borderRadius: 14, backgroundColor: c.pale },
  bannerTitle: { fontFamily: fonts.heading700, fontSize: 15, lineHeight: 21, color: c.purple },
  bannerText: { fontFamily: fonts.body400, fontSize: 12.5, lineHeight: 19, color: c.secondary, marginTop: 6 },
});
