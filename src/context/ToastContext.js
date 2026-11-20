// Notificarea scurtă de jos („Quest accepted. Your next little adventure awaits!”), ca în design.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useStyles } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const ToastContext = createContext(() => {});
const DURATION = 3500;

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const s = useStyles(makeStyles);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setMessage(''));
  }, [opacity]);

  const notify = useCallback(
    (text) => {
      clearTimeout(timer.current);
      setMessage(text);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, DURATION);
    },
    [opacity, hide]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {!!message && (
        <Animated.View
          pointerEvents="box-none"
          style={[s.wrap, { bottom: insets.bottom + 92, opacity }]}
          accessibilityLiveRegion="polite"
        >
          <View style={s.toast} accessibilityRole="alert">
            <View style={s.check}>
              <Icon name="check" size={16} color="#fff" />
            </View>
            <Text style={s.text}>{message}</Text>
            <Pressable onPress={hide} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dismiss notification">
              <Icon name="close" size={16} color="#B9B4C6" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const makeStyles = (c) => ({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 480,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: c.dark ? '#F3EFFB' : '#282735',
    boxShadow: '0 12px 30px rgba(24, 14, 56, 0.22)',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7950DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, fontFamily: fonts.body500, fontSize: 13.5, lineHeight: 19, color: c.dark ? '#282735' : '#FFFFFF' },
});
