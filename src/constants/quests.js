// Categoriile, dificultățile, XP-ul și colecția locală de provocări (textele sunt în engleză, ca în design).
// Colecția se folosește când Gemini nu e disponibil (mod demo, fără internet, App Check neconfigurat)
// și pentru butonul „Surprise them with a random quest”.

export const CATEGORIES = {
  social: { label: 'Social' },
  active: { label: 'Active' },
  creative: { label: 'Creative' },
  chill: { label: 'Chill' },
};
export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export const DIFFICULTIES = {
  easy: { label: 'Easy', bars: 1 },
  medium: { label: 'Medium', bars: 2 },
  hard: { label: 'Hard', bars: 3 },
};

/** De câte ori poți schimba provocarea zilei („Not your vibe? Swap for another”). Verificat și în firestore.rules. */
export const MAX_REROLLS = 3;

/** XP pentru o provocare provenită de la un prieten. */
export const FRIEND_QUEST_XP = 50;

/** XP în funcție de dificultate și de durată. */
export function xpFor(difficulty, minutes = 10) {
  if (difficulty === 'hard') return 100;
  if (difficulty === 'medium') return 70;
  if (minutes <= 5) return 40;
  if (minutes <= 15) return 50;
  return 60;
}

// ── Niveluri ─────────────────────────────────────────────────────────────────
export const XP_PER_LEVEL = 500;
const RANKS = ['New explorer', 'Curious explorer', 'Brave explorer', 'Bold explorer', 'Seasoned explorer', 'Legendary explorer'];

/** { level, levelXp, toNext, rank } pentru un total de XP. */
export function levelInfo(totalXp = 0) {
  const level = 1 + Math.floor(totalXp / XP_PER_LEVEL);
  const levelXp = totalXp % XP_PER_LEVEL;
  return { level, levelXp, toNext: XP_PER_LEVEL - levelXp, rank: RANKS[Math.min(level - 1, RANKS.length - 1)] };
}

// ── Provocarea zilei (rezervă locală) ────────────────────────────────────────
export const QUEST_POOL = [
  { title: 'Make someone’s day.\nCompliment a stranger.', description: 'A little kindness goes a long way. Give someone a genuine compliment and watch a small moment become a good one.', category: 'social', difficulty: 'easy', minutes: 5 },
  { title: 'Take the scenic route.\nFind something new.', description: 'Turn down a street you’ve never explored. Keep your eyes open for one little detail you’d usually miss.', category: 'active', difficulty: 'easy', minutes: 15 },
  { title: 'Make a little art.\nJust for yourself.', description: 'Grab a pen and draw the first thing you see. No perfect lines, no expectations. Just a few minutes of making.', category: 'creative', difficulty: 'easy', minutes: 10 },
  { title: 'Slow down.\nLook up for a while.', description: 'Step outside, put your phone away, and spend five quiet minutes watching the clouds go by.', category: 'chill', difficulty: 'easy', minutes: 5 },
  { title: 'Cook something new.\nOne new ingredient.', description: 'Pick an ingredient you’ve never cooked with and make something simple. Snap a photo of the plate.', category: 'creative', difficulty: 'medium', minutes: 40 },
  { title: 'Call, don’t text.\nRing an old friend.', description: 'Pick someone you haven’t talked to in a while and actually call. Ten minutes is enough to make their day.', category: 'social', difficulty: 'easy', minutes: 10 },
  { title: 'Chase the golden hour.\nCatch the sunset.', description: 'Find a spot with a view and watch the sun go down. Film a short timelapse if you like.', category: 'chill', difficulty: 'easy', minutes: 20 },
  { title: 'Climb a little higher.\nTake the stairs.', description: 'Skip the elevator all day. Bonus points if you count the steps and beat your own record.', category: 'active', difficulty: 'medium', minutes: 15 },
  { title: 'Leave a trace of kindness.\nWrite a note.', description: 'Write a kind note and leave it somewhere someone will find it. A library book, a bench, a coworker’s desk.', category: 'social', difficulty: 'easy', minutes: 5 },
  { title: 'Unplug for an hour.\nNotice what you do.', description: 'Put your phone in another room for one full hour. Take a photo afterwards of what filled the time.', category: 'chill', difficulty: 'medium', minutes: 60 },
  { title: 'Make it colorful.\nFind five reds.', description: 'Go for a walk and spot five red things. Turn them into a little collage or a quick video.', category: 'active', difficulty: 'easy', minutes: 20 },
  { title: 'Learn a tiny skill.\nTen new words.', description: 'Pick a language you don’t speak and learn ten words. Record yourself saying them all.', category: 'creative', difficulty: 'medium', minutes: 20 },
  { title: 'Ask a better question.\nHear a good story.', description: 'Ask a grandparent or an older friend about their first job. Write down the best part.', category: 'social', difficulty: 'easy', minutes: 15 },
  { title: 'Build something silly.\nA tower of things.', description: 'Stack ten random objects into a tower, no glue allowed. Photograph it before it falls.', category: 'creative', difficulty: 'easy', minutes: 10 },
  { title: 'Move a little.\nFifty squats today.', description: 'Split them into sets across the day. Film the very last one.', category: 'active', difficulty: 'medium', minutes: 10 },
  { title: 'Taste the unknown.\nTry a new fruit.', description: 'Find a fruit you’ve never eaten and give it a go. Film your first bite.', category: 'chill', difficulty: 'easy', minutes: 10 },
  { title: 'Rearrange a corner.\nMake it feel new.', description: 'Move things around in one corner of your room. Take a before and an after photo.', category: 'creative', difficulty: 'medium', minutes: 30 },
  { title: 'Picnic anywhere.\nEven on a balcony.', description: 'A blanket, a snack, a song. Snap a photo of your little setup.', category: 'chill', difficulty: 'easy', minutes: 30 },
  { title: 'Say thank you.\nTo someone unexpected.', description: 'Thank someone you usually don’t, like a bus driver or a cleaner. Notice how they react.', category: 'social', difficulty: 'easy', minutes: 5 },
  { title: 'Walk without a plan.\n5,000 easy steps.', description: 'No headphones, no destination. Take a photo of the nicest spot you pass.', category: 'active', difficulty: 'easy', minutes: 45 },
  { title: 'Recreate a memory.\nCopy an old photo.', description: 'Find a childhood photo and recreate it as closely as you can. Add both pictures.', category: 'creative', difficulty: 'medium', minutes: 20 },
  { title: 'Find the oldest thing.\nLearn its story.', description: 'Look for the oldest object in your home and find out where it came from.', category: 'chill', difficulty: 'easy', minutes: 15 },
  { title: 'Hold the plank.\nTwo full minutes.', description: 'Breaks are allowed, but it has to add up to two minutes. Film the last twenty seconds.', category: 'active', difficulty: 'hard', minutes: 10 },
  { title: 'Have lunch with someone new.\nFind common ground.', description: 'Eat with a classmate or coworker you’ve never shared a meal with. Note one thing you have in common.', category: 'social', difficulty: 'medium', minutes: 45 },
];

/** O provocare la întâmplare din colecție, evitând titlurile date (ex. cele recente). */
export function randomPoolQuest(excludeTitles = []) {
  const exclude = new Set(excludeTitles.map((t) => t.toLowerCase()));
  const options = QUEST_POOL.filter((q) => !exclude.has(q.title.toLowerCase()));
  const list = options.length ? options : QUEST_POOL;
  return { ...list[Math.floor(Math.random() * list.length)] };
}

// ── Idei scurte pentru prieteni („Surprise them with a random quest”) ─────────
export const FRIEND_IDEAS = [
  { title: 'Buy a snack you’ve never tried before.', category: 'chill' },
  { title: 'Leave a kind note for someone to find.', category: 'social' },
  { title: 'Find something purple on a 10-minute walk.', category: 'active' },
  { title: 'Make a playlist that feels like sunshine.', category: 'creative' },
  { title: 'Try a coffee order you’ve never had before.', category: 'chill' },
  { title: 'Write a tiny poem about your day.', category: 'creative' },
  { title: 'Take a different route home.', category: 'active' },
  { title: 'Watch the sunset without your phone.', category: 'chill' },
  { title: 'Compliment three people before lunch.', category: 'social' },
  { title: 'Draw your pet (or your plant) from memory.', category: 'creative' },
  { title: 'Do ten jumping jacks somewhere unexpected.', category: 'active' },
  { title: 'Send a voice note to someone you miss.', category: 'social' },
  { title: 'Find the best bench in your neighborhood.', category: 'chill' },
  { title: 'Take a photo that looks like a movie poster.', category: 'creative' },
];

export function randomFriendIdea(excludeTitle) {
  const options = FRIEND_IDEAS.filter((q) => q.title !== excludeTitle);
  return { ...options[Math.floor(Math.random() * options.length)] };
}
