// Zilele se calculează după ora locală a telefonului: „azi” = data din calendarul utilizatorului.

const pad = (n) => String(n).padStart(2, '0');

/** Data locală în formatul AAAA-LL-ZZ. */
export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Transformă AAAA-LL-ZZ într-un Date la miezul nopții, ora locală. */
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** Timestamp Firestore | Date | număr → milisecunde (0 dacă lipsește). */
export function toMillis(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return 0;
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function season(d = new Date()) {
  const m = d.getMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

/** „Friday, November 20” */
export function formatLongDay(d = new Date()) {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** „Today” / „Yesterday” / „November 18” dintr-o cheie AAAA-LL-ZZ sau un timestamp. */
export function formatDay(v, today = dateKey()) {
  const key = typeof v === 'string' ? v : v ? dateKey(new Date(toMillis(v))) : '';
  if (!key) return '';
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  const d = parseKey(key);
  const sameYear = d.getFullYear() === parseKey(today).getFullYear();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}${sameYear ? '' : `, ${d.getFullYear()}`}`;
}

/** „2h ago”, „5m ago”, „3d ago” */
export function timeAgo(v, now = Date.now()) {
  const ms = toMillis(v);
  if (!ms) return '';
  const min = Math.max(0, Math.round((now - ms) / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Zilele săptămânii curente (duminică → sâmbătă), ca în cardul „Your little wins”. */
export function currentWeek(today = dateKey()) {
  const d = parseKey(today);
  const start = addDays(today, -d.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Sortează descrescător după un câmp de timp (cele mai noi primele). */
export function newestFirst(field) {
  return (a, b) => toMillis(b[field]) - toMillis(a[field]);
}
