import { Stack } from 'expo-router';
import { DataProvider } from '../../context/DataContext';
import { useTheme } from '../../theme/ThemeContext';

// Ferestrele din design (complete, send, success, add friend) se deschid peste ecranul curent.
const modal = { presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } };

export default function AppLayout() {
  const { colors } = useTheme();
  return (
    <DataProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quest/[id]" />
        <Stack.Screen name="complete/[id]" options={modal} />
        <Stack.Screen name="success" options={modal} />
        <Stack.Screen name="send" options={modal} />
        <Stack.Screen name="add-friend" options={modal} />
      </Stack>
    </DataProvider>
  );
}
