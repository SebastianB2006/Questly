// „Your next chapter starts small.” – crearea contului (după fereastra „email” din design).
import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';

import AuthCard from '../../components/AuthCard';
import { Button, ErrorText, Field, ModalIcon } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { authErrorMessage } from '../../lib/authErrors';
import { normalizeUsername, usernameError } from '../../lib/users';
import { useStyles } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const s = useStyles(makeStyles);
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (name.trim().length < 2) return setError('Tell us what to call you (at least 2 characters).');
    const uErr = usernameError(username);
    if (uErr) return setError(uErr);
    if (!EMAIL_RE.test(email.trim())) return setError('That email address doesn’t look right.');
    if (password.length < 6) return setError('Your password needs at least 6 characters.');

    setLoading(true);
    try {
      await signUp({ name, username, email, password });
      // Succes: _layout.js te duce automat la ecranul Today.
    } catch (e) {
      setError(authErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <AuthCard back>
      <View style={{ alignItems: 'flex-end' }}>
        <ModalIcon name="spark" />
      </View>
      <Text style={s.h2}>Your next chapter{'\n'}starts small.</Text>
      <Text style={s.p}>Create your Questly account. Friends will find you by your username.</Text>

      <View style={{ gap: 18 }}>
        <Field
          label="Your name"
          placeholder="What should we call you?"
          value={name}
          onChangeText={setName}
          maxLength={40}
          autoComplete="name"
          textContentType="name"
        />
        <Field
          label="Username"
          placeholder="e.g. alex.morgan"
          value={username}
          onChangeText={(t) => setUsername(normalizeUsername(t))}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
          maxLength={20}
          hint="Letters, numbers, dots and underscores."
        />
        <Field
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleRegister}
        />
      </View>

      <ErrorText message={error} style={{ marginTop: 14 }} />
      <Button title="Let’s find an adventure" arrow onPress={handleRegister} loading={loading} style={{ marginTop: 22 }} />
      <Button variant="text" title="Already exploring? Log in" center onPress={() => router.replace('/login')} style={{ alignSelf: 'center', marginTop: 16 }} />
    </AuthCard>
  );
}

const makeStyles = (c) => ({
  h2: { fontFamily: fonts.heading800, fontSize: 29, lineHeight: 37, letterSpacing: -1.15, color: c.text, marginBottom: 12 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, marginBottom: 24 },
});
