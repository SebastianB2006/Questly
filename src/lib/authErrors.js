// Traduce codurile de eroare Firebase Auth în mesaje clare (în engleză, ca restul interfeței).
// Nu spunem niciodată dacă un email are cont (protecție împotriva enumerării conturilor).
const messages = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'Wrong email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/network-request-failed': 'You seem to be offline.',
  'auth/email-already-in-use': 'There’s already an account with this email. Try logging in.',
  'auth/weak-password': 'Your password needs at least 6 characters.',
  'app/username-taken': 'That username is taken. Try another one.',
  'app/no-profile': 'This account has no profile. Create a new account.',
};

export function authErrorMessage(error) {
  if (error?.code === 'app/invalid-username') return error.message;
  return messages[error?.code] ?? 'Something went wrong. Try again.';
}
