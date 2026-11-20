import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Valorile vin din fișierul .env (vezi .env.example).
// Variabilele EXPO_PUBLIC_* ajung în aplicație: sunt chei publice Firebase,
// securitatea reală vine din firestore.rules și storage.rules.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Fără config Firebase, aplicația rulează în „mod demo” (conturi și date fictive, doar în memorie),
// ca să poți vedea interfața în Expo Go înainte să configurezi proiectul Firebase.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      // Păstrează utilizatorul logat între deschideri ale aplicației.
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      auth = getAuth(app); // deja inițializat (ex. la fast refresh)
    }
  }
  db = getFirestore(app);
  storage = getStorage(app);

  // Din 2 noiembrie 2026, Firebase AI Logic (Gemini) cere App Check în toate proiectele.
  // În Expo Go folosim un TOKEN DE DEBUG înregistrat în consolă:
  // App Check → Apps → aplicația Web → ⋮ → Manage debug tokens.
  // Nu urca .env pe GitHub.
  const appCheckDebugToken = process.env.EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN;
  if (appCheckDebugToken) {
    globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken;
    try {
      initializeAppCheck(app, {
        // În modul debug furnizorul nu e folosit: tokenul de debug se schimbă direct cu Firebase.
        provider: new CustomProvider({ getToken: () => Promise.reject(new Error('Doar modul debug.')) }),
        isTokenAutoRefreshEnabled: false,
      });
    } catch {
      // deja inițializat (fast refresh)
    }
  }
}

export { app, auth, db, storage };
