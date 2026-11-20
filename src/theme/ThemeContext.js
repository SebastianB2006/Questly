// Modul luminos / întunecat („Switch to dark mode” din Profil). Alegerea se păstrează pe telefon.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, CATEGORY_TONES, STATUS_TONES } from './colors';

const STORAGE_KEY = 'questly.theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setMode] = useState(null); // null = urmează setarea telefonului

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => (v === 'light' || v === 'dark') && setMode(v))
      .catch(() => {});
  }, []);

  const isDark = (mode ?? system) === 'dark';

  const toggle = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, [isDark]);

  const value = useMemo(() => {
    const key = isDark ? 'dark' : 'light';
    return { colors: palettes[key], categories: CATEGORY_TONES[key], statuses: STATUS_TONES[key], isDark, toggle };
  }, [isDark, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme trebuie folosit în interiorul <ThemeProvider>');
  return ctx;
}

/** Stiluri care depind de temă: useStyles((c) => ({ box: { backgroundColor: c.surface } })). */
export function useStyles(factory) {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
