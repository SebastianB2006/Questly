// Cardul centrat folosit pe ecranele de bun venit, înregistrare și autentificare (ca „welcome modal” din design).
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from './Icon';
import { useStyles, useTheme } from '../theme/ThemeContext';

export default function AuthCard({ children, back = false }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.card}>
            {back && (
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                hitSlop={10}
                style={s.back}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Icon name="back" size={20} color={c.muted} />
              </Pressable>
            )}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 14 },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 30,
    paddingHorizontal: 24,
    boxShadow: '0 25px 90px rgba(24, 14, 56, 0.08)',
  },
  back: { position: 'absolute', top: 16, left: 16, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
