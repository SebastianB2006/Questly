// Structura comună a ecranelor: bara de sus (logo, inbox, avatar), conținutul și subsolul din design.
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from './Icon';
import Avatar from './Avatar';
import { Brand } from './ui';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

export function TopBar() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { user } = useAuth();
  const { inbox } = useData();

  return (
    <View style={s.topbar}>
      <Pressable onPress={() => router.navigate('/')} accessibilityRole="button" accessibilityLabel="Questly, go to Today">
        <Brand size={24} />
      </Pressable>
      <View style={s.topRight}>
        <Pressable onPress={() => router.navigate('/inbox')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Open inbox">
          <Icon name="inbox" size={22} color={c.secondary} />
          {inbox.length > 0 && <View style={s.dot} />}
        </Pressable>
        <Pressable onPress={() => router.navigate('/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
          <Avatar seed={user.uid} size={33} />
        </Pressable>
      </View>
    </View>
  );
}

/** Ecran cu bară de sus și conținut derulabil. */
export function Screen({ children, footer = true, keyboard = false }) {
  const s = useStyles(makeStyles);
  const content = (
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {children}
      {footer && (
        <View style={s.footer}>
          <Text style={s.footerText}>A small quest. A good story. A little more life.</Text>
        </View>
      )}
    </ScrollView>
  );
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <TopBar />
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.bg },
  topbar: {
    height: 64,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.bg,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  dot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.purple,
    borderWidth: 1.5,
    borderColor: c.bg,
  },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28, gap: 26, maxWidth: 640, width: '100%', alignSelf: 'center' },
  footer: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 19 },
  footerText: { fontFamily: fonts.body400, fontSize: 11.5, color: c.faint },
});
