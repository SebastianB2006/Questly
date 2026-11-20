/**
 * Generarea provocărilor cu Gemini, prin Firebase AI Logic (Gemini Developer API).
 * Cheia Gemini NU este în aplicație: apelurile trec prin proiectul Firebase.
 * Configurare: consola Firebase → AI Logic → Get started → Gemini Developer API (+ App Check, vezi firebase.js).
 *
 * Dacă Gemini nu răspunde (mod demo, fără internet, cotă depășită), folosim colecția locală din
 * constants/quests.js, ca utilizatorul să aibă mereu o provocare.
 */
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app, isFirebaseConfigured } from './firebase';
import { CATEGORIES, CATEGORY_KEYS, DIFFICULTIES, randomPoolQuest, randomFriendIdea, xpFor } from '../constants/quests';
import { WEEKDAYS, season } from './dates';

// Numele modelelor se schimbă des: verifică lista din consola AI Logic și schimbă doar aici (sau în .env).
export const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.5-flash-lite';

const SAFETY = `- Free or very cheap, safe and legal. No alcohol, no health risks, no trespassing.
- Never ask to film or photograph other people without their consent, and never ask for personal data.
- Be specific and playful; avoid generic advice like "drink water" or "be positive".`;

const DAILY_SYSTEM = `You write the daily side quest for Questly, an app that nudges people to step out of their routine.
Write in English, warm and playful, like the examples.

Rules:
- "title": two very short sentences separated by a newline, at most 60 characters in total.
  Examples: "Make someone’s day.\\nCompliment a stranger." / "Slow down.\\nLook up for a while."
- "description": 1–2 sentences, at most 200 characters: what to do and how you know you are done.
- Doable today, in any city, in 5–60 minutes.
${SAFETY}
- "category": one of ${CATEGORY_KEYS.join(', ')}.
- "difficulty": one of ${Object.keys(DIFFICULTIES).join(', ')}.
- "minutes": whole number between 5 and 60.

Return ONLY valid JSON, no other text:
{"title": string, "description": string, "category": string, "difficulty": string, "minutes": number}`;

const FRIEND_SYSTEM = `You suggest a fun side quest that one friend sends to another in the Questly app.
Write in English. Return ONE short, specific sentence (at most 90 characters), like
"Find something purple on a 10-minute walk." or "Make a playlist that feels like sunshine."
${SAFETY}
- "category": one of ${CATEGORY_KEYS.join(', ')}.

Return ONLY valid JSON, no other text: {"title": string, "category": string}`;

const models = {};

function getModel(kind) {
  if (!models[kind]) {
    // Tokenuri App Check de unică folosință (protecția anti-replay a AI Logic).
    const ai = getAI(app, { backend: new GoogleAIBackend(), useLimitedUseAppCheckTokens: true });
    models[kind] = getGenerativeModel(
      ai,
      {
        model: MODEL,
        systemInstruction: kind === 'daily' ? DAILY_SYSTEM : FRIEND_SYSTEM,
        generationConfig: { responseMimeType: 'application/json', temperature: 1.1, maxOutputTokens: 300 },
      },
      { timeout: 20000 }
    );
  }
  return models[kind];
}

const clip = (s, n) => String(s ?? '').trim().slice(0, n);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const randomCategory = () => CATEGORY_KEYS[Math.floor(Math.random() * CATEGORY_KEYS.length)];

function parseJson(text) {
  const cleaned = String(text ?? '')
    .trim()
    .replace(/^```(json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw { code: 'parse' };
  }
}

/** Curăță răspunsul modelului pentru provocarea zilei; aruncă eroare dacă nu e valid. */
export function normalizeDaily(raw) {
  const title = clip(raw?.title, 100).replace(/\\n/g, '\n');
  if (!title) throw { code: 'empty' };
  const difficulty = DIFFICULTIES[raw?.difficulty] ? raw.difficulty : 'easy';
  const minutes = Math.min(120, Math.max(5, Math.round(Number(raw?.minutes) || 10)));
  return {
    title,
    description: clip(raw?.description, 300),
    category: CATEGORIES[raw?.category] ? raw.category : 'social',
    difficulty,
    minutes,
    xp: xpFor(difficulty, minutes),
  };
}

function withXp(q) {
  return { ...q, xp: xpFor(q.difficulty, q.minutes) };
}

/**
 * Provocarea zilei. `recentTitles` = titlurile ultimelor provocări, ca să nu se repete.
 * Returnează { title, description, category, difficulty, minutes, xp, aiGenerated }.
 */
export async function generateDailyQuest(recentTitles = []) {
  if (!isFirebaseConfigured) {
    await wait(500);
    return { ...withXp(randomPoolQuest(recentTitles)), aiGenerated: false };
  }
  const now = new Date();
  const prompt =
    `Write today’s side quest.\nToday is ${WEEKDAYS[now.getDay()]}, season: ${season(now)}.\n` +
    `Suggested category: ${randomCategory()}.\n` +
    (recentTitles.length
      ? `Recent quests (do NOT repeat them or anything very similar):\n${recentTitles
          .slice(0, 15)
          .map((t) => `- ${t.replace(/\n/g, ' ')}`)
          .join('\n')}`
      : '');
  try {
    const result = await getModel('daily').generateContent(prompt);
    return { ...normalizeDaily(parseJson(result.response.text())), aiGenerated: true };
  } catch (e) {
    console.warn('[Questly] Gemini unavailable, using the local quest pool:', aiErrorMessage(e));
    return { ...withXp(randomPoolQuest(recentTitles)), aiGenerated: false };
  }
}

/**
 * Idee de provocare pentru un prieten: { title, category }.
 * Aici aruncăm eroarea, ca ecranul să-i poată spune utilizatorului ce s-a întâmplat.
 */
export async function generateFriendQuest({ friendName, current }) {
  if (!isFirebaseConfigured) {
    await wait(500);
    return randomFriendIdea(current);
  }
  const prompt =
    `Suggest a side quest for my friend ${clip(friendName, 40) || 'my friend'}.\n` +
    `Suggested category: ${randomCategory()}.` +
    (current ? `\nMake it different from: "${clip(current, 200)}"` : '');
  const result = await getModel('friend').generateContent(prompt);
  const raw = parseJson(result.response.text());
  const title = clip(raw?.title, 240);
  if (!title) throw { code: 'empty' };
  return { title, category: CATEGORIES[raw?.category] ? raw.category : 'social' };
}

/** Mesaj de eroare pe înțeles (în engleză, ca restul interfeței). */
export function aiErrorMessage(e) {
  const code = e?.code ?? '';
  const msg = String(e?.message ?? '').toLowerCase();
  if (code === 'api-not-enabled' || msg.includes('not been used') || msg.includes('disabled'))
    return 'Gemini isn’t enabled yet. Turn on Firebase AI Logic (Gemini Developer API) in the Firebase console.';
  if (msg.includes('app check') || msg.includes('appcheck') || msg.includes('app-check') || msg.includes('attestation'))
    return 'App Check blocked the request. Check EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN in .env and register it in the console.';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted'))
    return 'Too many requests right now. Try again in a minute.';
  if (msg.includes('not found') && msg.includes('model'))
    return `The model “${MODEL}” isn’t available. Pick another one in the AI Logic console (EXPO_PUBLIC_GEMINI_MODEL).`;
  if (code === 'fetch-error' || msg.includes('network')) return 'You seem to be offline.';
  if (code === 'parse' || code === 'empty' || msg.includes('safety') || msg.includes('blocked'))
    return 'Gemini didn’t come up with a good one. Try again.';
  return 'Gemini couldn’t write a quest right now. Try again.';
}
