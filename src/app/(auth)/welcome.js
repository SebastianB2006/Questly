// Ecranul de bun venit („One small adventure a day.”), după fereastra „welcome” din design.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import AuthCard from '../../components/AuthCard';
import QuestArt from '../../components/QuestArt';
import Icon from '../../components/Icon';
import { Brand, Button, ErrorText, Eyebrow } from '../../components/ui';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../lib/firebase';
import { authErrorMessage } from '../../lib/authErrors';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

export default function WelcomeScreen() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function exploreDemo() {
    setError('');
    setBusy(true);
    try {
      await signIn(DEMO_ACCOUNTS[0].email, DEMO_ACCOUNTS[0].password);
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  }

  return (
    <AuthCard>
      <View style={{ alignItems: 'center', marginVertical: 5 }}>
        <Brand size={27} />
      </View>
      <View style={{ marginVertical: 12 }}>
        <QuestArt glow background={c.surface} />
      </View>
      <Eyebrow style={{ textAlign: 'center' }}>Less routine. More life.</Eyebrow>
      <Text style={s.h2}>One small{'\n'}adventure a day.</Text>
      <Text style={s.p}>A little nudge to try something new.{'\n'}A little more magic in the everyday.</Text>

      <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [s.loginButton, pressed && { backgroundColor: c.pale }]} accessibilityRole="button">
        <Icon name="user" size={19} color={c.purple} />
        <Text style={s.loginText}>I already have an account</Text>
      </Pressable>
      <Button title="Sign up with email" arrow onPress={() => router.push('/register')} style={{ marginTop: 12 }} />

      {!isFirebaseConfigured && (
        <Button
          variant="text"
          title={busy ? 'Opening the demo…' : 'Just looking? Explore the demo'}
          arrow
          center
          onPress={exploreDemo}
          disabled={busy}
          style={{ alignSelf: 'center', marginTop: 18 }}
        />
      )}
      <ErrorText message={error} style={{ textAlign: 'center', marginTop: 10 }} />
    </AuthCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 38, lineHeight: 45, letterSpacing: -1.15, color: c.text, textAlign: 'center', marginBottom: 14 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 22, color: c.secondary, textAlign: 'center', marginBottom: 28 },
  loginButton: {
    minHeight: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loginText: { fontFamily: fonts.body500, fontSize: 15, color: c.text },
});
