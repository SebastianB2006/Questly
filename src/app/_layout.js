import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { useAppFonts } from '../theme/fonts';

/**
 * Stack.Protected ascunde rutele pentru care `guard` e fals, iar Expo Router
 * trimite automat utilizatorul la primul grup disponibil:
 *  - nelogat → (auth): ecranul de bun venit
 *  - logat   → (app)/(tabs): Today
 */
function RootNavigator() {
  const fontsReady = useAppFonts();
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (!fontsReady || loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
