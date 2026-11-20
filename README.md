# Questly

Aplicație mobilă de „side quests” (Expo SDK 58 + React Native + Firebase + Gemini, JavaScript),
construită folosind Figma: designul a fost făcut în Figma (Figma Make). Textele din aplicație sunt în engleză, ca în design.

- **Today:** în fiecare zi, Gemini generează o provocare nouă („Your daily side quest”). O accepți, o poți schimba
  de cel mult 3 ori („Not your vibe? Swap for another”), apoi o termini cu poze, videoclipuri și o descriere.
  Tot aici: provocările primite de la prieteni, seria de zile 🔥, nivelul și XP-ul.
- **Friends:** îți adaugi prietenii după @username, accepți cereri și le trimiți provocări („Send a quest”).
- **Inbox:** provocările primite (Accept / Decline → Mark complete) și cele trimise de tine, cu statusul lor.
- **Profile:** statistici, mod întunecat, tagline și „Your adventure log” cu toate amintirile (poze + video).

## 1. Pornire rapidă în VS Code (mod demo, fără Firebase)

Ai nevoie de [Node.js LTS](https://nodejs.org), [VS Code](https://code.visualstudio.com) și aplicația **Expo Go** pe telefon.

```bash
git clone https://github.com/SebastianB2006/Questly.git
cd Questly
code .                 # deschide proiectul în VS Code
npm install
npx expo install --fix # aliniază versiunile pachetelor cu Expo SDK 58
npx expo start
```

În VS Code deschizi terminalul cu **Ctrl + `**. Scanezi codul QR cu **Expo Go** (Android) sau cu aplicația Cameră (iPhone).
Telefonul și laptopul trebuie să fie pe aceeași rețea Wi‑Fi; dacă nu merge, folosește `npx expo start --tunnel`.

Fără fișier `.env`, aplicația pornește în **modul demo** (datele din design, doar în memorie):
- `alex@demo.com` / `demo1234` (Alex Morgan)
- `jamie@demo.com` / `demo1234` (Jamie Chen)

Sau apasă „Just looking? Explore the demo” pe primul ecran. Alex are 4 prieteni, 3 provocări primite și o cerere de
prietenie de la @riley; poți adăuga și @sam.

## 2. Configurarea Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → `questly`.
2. **Project settings → Your apps → Web (</>)** → copiezi valorile `firebaseConfig`.
3. Copiezi `.env.example` în `.env` și completezi `EXPO_PUBLIC_FIREBASE_*`.
4. **Authentication → Sign-in method → Email/Password → Enable.**
5. **Firestore Database → Create database** → tabul **Rules** → lipești `firestore.rules` → **Publish**.
6. **Storage → Get started** (cere planul **Blaze**, care are o cotă gratuită; pune o alertă de buget mică).
   Tabul **Rules** → lipești `storage.rules` → **Publish**. Când consola întreabă dacă Storage poate citi din Firestore, accepți.
7. **AI Logic → Get started → Gemini Developer API.**
8. **App Check** (obligatoriu pentru AI Logic din 2 noiembrie 2026): App Check → Apps → aplicația Web → ⋮ →
   **Manage debug tokens** → **Add debug token**. Generezi un UUID, îl adaugi acolo și îl pui în `.env` la
   `EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN`.
9. Repornești serverul: `npx expo start -c`.

Dacă Gemini nu răspunde (App Check, cotă, fără internet), provocarea zilei vine din colecția locală
(`src/constants/quests.js`), ca aplicația să meargă mereu. Motivul apare în terminal ca `[Questly] Gemini unavailable`.

**Nu urca `.env` pe GitHub** (e deja în `.gitignore`).

## Ce diferă față de prototipul din Figma

Prototipul Figma Make e o pagină web cu date fictive. Aici totul e real, cu Firebase:
- conturi cu email și parolă (butonul „Continue with Google” nu e inclus: în Expo Go are nevoie de configurare nativă separată);
- „Add a friend” caută după @username și trimite o cerere reală; invitația se trimite cu meniul de share al telefonului;
- la terminarea unei provocări poți adăuga **poze și videoclipuri** (galerie sau cameră), salvate în Firebase Storage;
- butonul „Let Gemini write one” în fereastra „Send a little adventure”;
- XP-ul, nivelul și seria se calculează din provocările terminate; prietenii îți văd seria și nivelul.

## Structură

```
src/
  app/
    _layout.js                 # Theme + Auth + Toast, redirecționare (Stack.Protected)
    (auth)/index.js            # „One small adventure a day.” (bun venit)
    (auth)/register.js, login.js
    (app)/_layout.js           # DataProvider: abonările live la Firestore
    (app)/(tabs)/index.js      # Today
    (app)/(tabs)/friends.js    # Friends
    (app)/(tabs)/inbox.js      # Inbox
    (app)/(tabs)/profile.js    # Profile + adventure log
    (app)/complete/[id].js     # „How did your adventure go?” (poze, video, descriere)
    (app)/success.js           # „Look at you go!”
    (app)/send.js              # „Send a little adventure.”
    (app)/add-friend.js        # „Grow your adventure crew.”
    (app)/quest/[id].js        # o provocare / o amintire
  components/  FeaturedQuest, QuestArt (ilustrația), Avatar (avatarele ilustrate), Icon (iconițele din design),
               TabBar, Layout, ModalCard, AuthCard, Media, ui
  theme/       colors (light + dark din CSS-ul designului), fonts (Manrope + DM Sans), ThemeContext
  context/     AuthContext, DataContext, ToastContext
  lib/         firebase, ai (Gemini), quests, friends, users, media, demoStore, dates
  constants/   quests (categorii, XP, niveluri, colecția locală de provocări)
firestore.rules, storage.rules
```

## Date în Firestore

| Colecție | Conținut |
|---|---|
| `users/{uid}` | `name`, `username`, `bio`, `xp`, `completedCount`, `streak`, `lastCompletedDate` (profil public, fără email) |
| `usernames/{username}` | `uid` – garantează că @username e unic |
| `friendships/{uidA_uidB}` | `users`, `requester`, `status` (`pending` / `accepted`), `profiles` |
| `quests/{id}` | `ownerUid`, `fromUid`, `source` (`daily` / `friend`), `title`, `category`, `difficulty`, `minutes`, `xp`, `status` (`pending` → `active` → `completed` sau `declined`), `note`, `media[]` |

Provocarea zilei are id-ul `daily_{uid}_{AAAA-LL-ZZ}`, deci există una singură pe zi.
`firestore.rules` verifică pe server cine poate citi și modifica fiecare document
(de ex. poți trimite provocări doar prietenilor acceptați, iar XP-ul doar crește).
