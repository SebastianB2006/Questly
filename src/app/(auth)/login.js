import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import AuthCard from '../../components/AuthCard';
import Avatar from '../../components/Avatar';
import { Button, ErrorText, Field, ModalIcon } from '../../components/ui';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../lib/firebase';
import { authErrorMessage } from '../../lib/authErrors';
import { useStyles } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const s = useStyles(makeStyles);
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setInfo('');
    if (!EMAIL_RE.test(email.trim())) return setError('That email address doesn’t look right.');
    if (!password) return setError('Type your password.');
    setLoading(true);
    try {
      await signIn(email, password);
      // Succes: _layout.js te duce automat la ecranul Today.
    } catch (e) {
      setError(authErrorMessage(e));
      setLoading(false);
    }
  }

  async function handleForgot() {
    setError('');
    if (!EMAIL_RE.test(email.trim())) return setError('Type your email above, then tap “Forgot your password?” again.');
    try {
      await resetPassword(email);
    } catch {
      // Același mesaj indiferent dacă există contul.
    }
    setInfo('If there’s an account with this email, a reset link is on its way.');
  }

  return (
    <AuthCard back>
      <View style={{ alignItems: 'flex-end' }}>
        <ModalIcon name="user" />
      </View>
      <Text style={s.h2}>Welcome back,{'\n'}explorer.</Text>
      <Text style={s.p}>Your next little adventure is waiting.</Text>

      <View style={{ gap: 18 }}>
        <Field
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={!!error}
        />
        <Field
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          error={!!error}
        />
      </View>
      <Button variant="text" title="Forgot your password?" onPress={handleForgot} style={{ alignSelf: 'flex-end', marginTop: 10 }} />

      <ErrorText message={error} style={{ marginTop: 10 }} />
      {!!info && <Text style={s.info}>{info}</Text>}
      <Button title="Log in" arrow onPress={handleLogin} loading={loading} style={{ marginTop: 18 }} />
      <Button variant="text" title="New here? Create an account" center onPress={() => router.replace('/register')} style={{ alignSelf: 'center', marginTop: 16 }} />

      {!isFirebaseConfigured && (
        <View style={s.demo}>
          <Text style={s.demoTitle}>DEMO MODE · NO FIREBASE YET</Text>
          <Text style={s.demoText}>Pick a test explorer. Alex and Jamie are friends, so you can try both sides of a quest.</Text>
          <View style={s.demoRow}>
            {DEMO_ACCOUNTS.map((a) => (
              <Pressable
                key={a.email}
                onPress={() => {
                  setEmail(a.email);
                  setPassword(a.password);
                  setError('');
                }}
                style={s.demoChip}
                accessibilityRole="button"
              >
                <Avatar seed={a.email === 'alex@demo.com' ? 'demo-alex2' : 'demo-jamie'} size={26} />
                <Text style={s.demoChipText}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </AuthCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 29, lineHeight: 37, letterSpacing: -1.15, color: c.text, marginBottom: 12 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, marginBottom: 24 },
  info: { fontFamily: fonts.body500, fontSize: 13, lineHeight: 19, color: c.purple, marginTop: 10 },
  demo: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: c.pale, gap: 8 },
  demoTitle: { fontFamily: fonts.body700, fontSize: 10, letterSpacing: 1.3, color: c.purple },
  demoText: { fontFamily: fonts.body400, fontSize: 12.5, lineHeight: 19, color: c.secondary },
  demoRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  demoChipText: { fontFamily: fonts.body600, fontSize: 14, color: c.purple },
});
