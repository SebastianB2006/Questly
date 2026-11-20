import { useState } from 'react';
import { Share, Text, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ModalCard, { closeModal } from '../../components/ModalCard';
import { Button, ErrorText, Field, ModalIcon, firstName } from '../../components/ui';
import { findUserByUsername, normalizeUsername, usernameError } from '../../lib/users';
import { sendFriendRequest, friendErrorMessage } from '../../lib/friends';
import { useStyles } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

export default function AddFriendScreen() {
  const s = useStyles(makeStyles);
  const notify = useToast();
  const { user } = useAuth();
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const invitation = `Join me on Questly. One small adventure a day, and a few better stories along the way. Add me: @${user.username}`;

  async function add() {
    setError('');
    const invalid = usernameError(handle);
    if (invalid) return setError(invalid);
    setBusy(true);
    try {
      const other = await findUserByUsername(handle);
      if (!other) throw { code: 'not-found' };
      const result = await sendFriendRequest(user, other);
      notify(
        result === 'accepted'
          ? `You and ${firstName(other.name)} are now adventure buddies!`
          : `Request sent. ${firstName(other.name)} just needs to say yes.`
      );
      closeModal();
    } catch (e) {
      setError(friendErrorMessage(e));
      setBusy(false);
    }
  }

  async function share() {
    try {
      await Share.share({ message: invitation });
    } catch {
      setError('Couldn’t open the share sheet. Copy the invitation above instead.');
    }
  }

  return (
    <ModalCard>
      <ModalIcon name="friends" />
      <Text style={s.h2}>Grow your adventure crew.</Text>
      <Text style={s.p}>Add a friend by their Questly username, or send them a little invitation.</Text>

      <Field
        label="Their username"
        icon="search"
        placeholder="e.g. jamie"
        value={handle}
        onChangeText={(t) => setHandle(normalizeUsername(t))}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        returnKeyType="send"
        onSubmitEditing={add}
        error={!!error}
      />
      <ErrorText message={error} style={{ marginTop: 10 }} />
      <Button title="Send friend request" arrow onPress={add} loading={busy} style={{ marginTop: 18 }} />

      <View style={s.divider} />

      <View style={s.invitation}>
        <Text style={s.invitationText} selectable>
          {invitation}
        </Text>
      </View>
      <Button variant="secondary" title="Share invitation" icon="share" onPress={share} style={{ marginTop: 14 }} />
      <Text style={s.note}>Your username is @{user.username}</Text>
    </ModalCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 29, lineHeight: 37, letterSpacing: -1.15, color: c.text, marginBottom: 12 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, marginBottom: 22 },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 24 },
  invitation: { padding: 16, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: c.dark ? '#5B4A7A' : '#D5C6E9', backgroundColor: c.inputBg },
  invitationText: { fontFamily: fonts.body400, fontSize: 13.5, lineHeight: 21, color: c.secondary },
  note: { fontFamily: fonts.body400, fontSize: 12, color: c.muted, textAlign: 'center', marginTop: 14 },
});
