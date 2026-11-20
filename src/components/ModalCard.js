// Fereastra centrată peste un fundal întunecat, ca modalele din design (complete, send, success, add friend).
// Rutele care o folosesc sunt deschise cu presentation: 'transparentModal' (vezi app/(app)/_layout.js).
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from './Icon';
import { useStyles, useTheme } from '../theme/ThemeContext';

export function closeModal() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function ModalCard({ children, onClose = closeModal, style }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={s.backdrop}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 14 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={s.dismissArea} onPress={onClose} accessible={false} />
          <View style={[s.modal, style]} accessibilityViewIsModal>
            <Pressable onPress={onClose} hitSlop={10} style={s.close} accessibilityRole="button" accessibilityLabel="Close dialog">
              <Icon name="close" size={21} color={c.muted} />
            </Pressable>
            {children}
          </View>
          <Pressable style={s.dismissArea} onPress={onClose} accessible={false} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (c) => ({
  backdrop: { flex: 1, backgroundColor: c.backdrop },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 14 },
  dismissArea: { flexGrow: 1, minHeight: 14 },
  modal: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 30,
    paddingHorizontal: 24,
    boxShadow: '0 25px 90px rgba(24, 14, 56, 0.16)',
  },
  close: { position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
