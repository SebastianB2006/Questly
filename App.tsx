import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type Tab = "Today" | "Friends" | "Inbox" | "Profile";
type IconName =
  | "spark"
  | "sun"
  | "friends"
  | "inbox"
  | "user"
  | "arrow"
  | "chevron"
  | "flame"
  | "check"
  | "shuffle"
  | "plus"
  | "close"
  | "moon"
  | "logout"
  | "search"
  | "bolt"
  | "flag"
  | "clock"
  | "heart";
function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    spark: (
      <>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    friends: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2" />
      </>
    ),
    inbox: (
      <>
        <path d="m3 4-1 12v4h20v-4L21 4H3Zm-1 11h6l2 3h4l2-3h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    flame: (
      <path d="M13 2c2 6-3 6-1 10 2-1 3-3 3-5 5 4 7 8 3 12-5 6-15 2-14-5 0-3 2-5 4-7-1 5 2 5 2 5-1-4 2-6 3-10Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    shuffle: (
      <>
        <path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 5-5m3-4c1-2 3-3 4-3h3m-4-4 4 4-4 4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    moon: <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />,
    logout: (
      <>
        <path d="M9 3H3v18h6m5-16 7 7-7 7M7 12h14" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    flag: (
      <>
        <path d="M5 22V3c5-5 9 5 15 0v11c-6 5-10-5-15 0" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    heart: <path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 3 11 8 15 5-4 13-10 8-15Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
const friends = [
  {
    name: "Jamie Chen",
    first: "Jamie",
    initials: "JC",
    color: "peach",
    streak: 12,
    label: "Always up for an adventure",
  },
  {
    name: "Sofia Miller",
    first: "Sofia",
    initials: "SM",
    color: "lilac",
    streak: 8,
    label: "Finding magic in the little things",
  },
  {
    name: "Alex Rivera",
    first: "Alex",
    initials: "AR",
    color: "mint",
    streak: 5,
    label: "A little more curious every day",
  },
  {
    name: "Taylor Kim",
    first: "Taylor",
    initials: "TK",
    color: "blue",
    streak: 3,
    label: "Here for the side quests",
  },
];
const quests = [
  {
    title: "Make someone’s day.\nCompliment a stranger.",
    category: "Social",
    description:
      "A little kindness goes a long way. Give someone a genuine compliment and watch a small moment become a good one.",
    xp: 50,
    time: "5 min",
    difficulty: "Easy",
  },
  {
    title: "Take the scenic route.\nFind something new.",
    category: "Active",
    description:
      "Turn down a street you’ve never explored. Keep your eyes open for one little detail you’d usually miss.",
    xp: 60,
    time: "15 min",
    difficulty: "Easy",
  },
  {
    title: "Make a little art.\nJust for yourself.",
    category: "Creative",
    description:
      "Grab a pen and draw the first thing you see. No perfect lines, no expectations. Just a few minutes of making.",
    xp: 50,
    time: "10 min",
    difficulty: "Easy",
  },
  {
    title: "Slow down.\nLook up for a while.",
    category: "Chill",
    description:
      "Step outside, put your phone away, and spend five quiet minutes watching the clouds go by.",
    xp: 40,
    time: "5 min",
    difficulty: "Easy",
  },
];
type Incoming = { id: number; friend: number; title: string; category: string; status: string };
type Sent = { id: number; name: string; title: string; status: string };
type History = { title: string; note: string; date: string; xp: number };
function Avatar({ index = 0, size = "" }: { index?: number; size?: string }) {
  const f = friends[index % friends.length];
  return (
    <span className={`avatar ${f.color} ${size}`}>
      <span className="avatar-hair" />
      <span className="avatar-face">
        <i />
        <i />
        <b />
      </span>
    </span>
  );
}
function QuestArt({ small = false }: { small?: boolean }) {
  return (
    <div className={`quest-art ${small ? "small" : ""}`} aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-star star-one">✦</span>
      <span className="art-star star-two">✦</span>
      <span className="art-star star-three">+</span>
      <div className="speech speech-back">
        <span />
        <span />
        <span />
      </div>
      <div className="speech speech-front">
        <Icon name="heart" size={45} />
      </div>
      <div className="art-badge">
        <Icon name="spark" size={22} />
      </div>
      <div className="art-shadow" />
    </div>
  );
}
export default function App() {
  const [tab, setTab] = useState<Tab>("Today");
  const [dark, setDark] = useState(false);
  const [questIndex, setQuestIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [modal, setModal] = useState<
    "complete" | "success" | "send" | "add" | "welcome" | "email" | null
  >(null);
  const [note, setNote] = useState("");
  const [sendTo, setSendTo] = useState("Jamie");
  const [custom, setCustom] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [name, setName] = useState("Alex");
  const [incoming, setIncoming] = useState<Incoming[]>([
    {
      id: 1,
      friend: 0,
      title: "Find a little piece of nature in the city.",
      category: "Active",
      status: "Pending",
    },
    {
      id: 2,
      friend: 1,
      title: "Make a playlist for your current mood.",
      category: "Creative",
      status: "Pending",
    },
    {
      id: 3,
      friend: 2,
      title: "Watch the sunset without your phone.",
      category: "Chill",
      status: "Pending",
    },
  ]);
  const [sent, setSent] = useState<Sent[]>([
    {
      id: 1,
      name: "Jamie",
      title: "Try a coffee order you’ve never had before.",
      status: "Accepted",
    },
    { id: 2, name: "Sofia", title: "Write a tiny poem about your day.", status: "Completed" },
    { id: 3, name: "Taylor", title: "Take a different route home.", status: "Declined" },
  ]);
  const [history, setHistory] = useState<History[]>([
    {
      title: "Go for a walk with no destination.",
      note: "Found a tiny bookstore tucked away on a street I’d never noticed. Definitely going back.",
      date: "Yesterday",
      xp: 50,
    },
    {
      title: "Reach out to an old friend.",
      note: "Called my college roommate. We ended up talking for an hour.",
      date: "June 12",
      xp: 50,
    },
    {
      title: "Try something new for breakfast.",
      note: "Made shakshuka for the first time. A little messy, a lot delicious.",
      date: "June 11",
      xp: 40,
    },
  ]);
  const quest = quests[questIndex];
  const [activeIncoming, setActiveIncoming] = useState<Incoming | null>(null);
  const completingQuest = activeIncoming ? { title: activeIncoming.title, xp: 50 } : quest;
  const todayHistory = history.filter((item) => item.date === "Today");
  const totalXp = 420 + todayHistory.reduce((sum, item) => sum + item.xp, 0);
  const level = 4 + Math.floor(totalXp / 500);
  const levelXp = totalXp % 500;
  const streak = todayHistory.length ? 8 : 7;
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    dialog?.querySelector<HTMLElement>("button, input, textarea, select")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModal(null);
      if (event.key !== "Tab" || !dialog) return;
      const elements = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input, textarea, select, a[href]",
        ),
      ];
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal]);
  const pending = incoming.filter((q) => q.status === "Pending");
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };
  const changeStatus = (id: number, status: string) => {
    setIncoming((items) => items.map((q) => (q.id === id ? { ...q, status } : q)));
    notify(
      status === "Accepted"
        ? "Quest accepted. Your next little adventure awaits!"
        : "Quest declined. There’s always another adventure.",
    );
  };
  const complete = () => {
    setHistory((items) => [
      {
        title: completingQuest.title.replace("\n", " "),
        note: note || "A small adventure, a good day.",
        date: "Today",
        xp: completingQuest.xp,
      },
      ...items,
    ]);
    if (activeIncoming) {
      setIncoming((items) =>
        items.map((item) =>
          item.id === activeIncoming.id ? { ...item, status: "Completed" } : item,
        ),
      );
    } else {
      setCompleted(true);
    }
    setModal("success");
  };
  const sendQuest = () => {
    if (!custom.trim()) return;
    setSent((items) => [
      { id: Date.now(), name: sendTo, title: custom.trim(), status: "Pending" },
      ...items,
    ]);
    setModal(null);
    setCustom("");
    notify(`A little adventure is on its way to ${sendTo}.`);
  };
  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("Today");
          }}
        >
          <span className="brand-mark">
            <Icon name="spark" size={25} />
          </span>
          questly<span className="brand-dot">.</span>
        </a>
        <div className="sidebar-caption">A LITTLE ADVENTURE, EVERY DAY.</div>
        <nav className="side-nav">
          {(["Today", "Friends", "Inbox", "Profile"] as Tab[]).map((t) => (
            <button
              className={tab === t ? "nav-item active" : "nav-item"}
              onClick={() => setTab(t)}
              key={t}
            >
              <Icon
                name={
                  t === "Today"
                    ? "sun"
                    : t === "Friends"
                      ? "friends"
                      : t === "Inbox"
                        ? "inbox"
                        : "user"
                }
              />
              <span>{t}</span>
              {t === "Inbox" && pending.length > 0 && (
                <span className="nav-count">{pending.length}</span>
              )}
              {tab === t && t !== "Inbox" && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="adventure-note">
            <div className="tiny-stars">
              <Icon name="spark" size={25} />
              <Icon name="spark" size={12} />
            </div>
            <b>
              Small quests.
              <br />
              Bigger days.
            </b>
            <p>
              A little outside your routine.
              <br />A little more you.
            </p>
          </div>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            <Icon name={dark ? "sun" : "moon"} size={18} />
            <span>{dark ? "Light" : "Dark"} mode</span>
            <span className={`switch ${dark ? "on" : ""}`} />
          </button>
          <button className="sidebar-user" onClick={() => setTab("Profile")}>
            <Avatar index={2} />
            <span>
              <b>{name} Morgan</b>
              <small>Level {level} explorer</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            Your everyday adventure <span>/</span> <b>{tab}</b>
          </div>
          <a className="mobile-brand" onClick={() => setTab("Today")}>
            <Icon name="spark" /> questly.
          </a>
          <div className="topbar-right">
            <span className="date-label">Friday, June 14</span>
            <span className="topbar-divider" />
            <button
              className="notification-button"
              aria-label="Open inbox"
              onClick={() => setTab("Inbox")}
            >
              <Icon name="inbox" size={20} />
              {pending.length > 0 && <i />}
            </button>
            <button
              className="top-avatar"
              onClick={() => setTab("Profile")}
              aria-label="Open profile"
            >
              <Avatar index={2} size="tiny" />
            </button>
          </div>
        </header>
        <main>
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                {tab === "Today"
                  ? "MAKE ROOM FOR A LITTLE WONDER"
                  : tab === "Friends"
                    ? "BETTER WITH YOUR PEOPLE"
                    : tab === "Inbox"
                      ? "GOOD THINGS ARE COMING YOUR WAY"
                      : "LOOK HOW FAR YOU’VE WANDERED"}
              </div>
              <h1>
                {tab === "Today"
                  ? `Hey ${name}, let’s make today count`
                  : tab === "Friends"
                    ? "Your adventure crew"
                    : tab === "Inbox"
                      ? "Your quest inbox"
                      : "A little more you, every day"}
                {tab === "Today" && (
                  <span className="greeting-spark">
                    <Icon name="spark" size={29} />
                  </span>
                )}
              </h1>
              <p>
                {tab === "Today"
                  ? "Step out of your routine. Your next little adventure is waiting."
                  : tab === "Friends"
                    ? "A nudge, a challenge, a shared little adventure."
                    : tab === "Inbox"
                      ? "A little challenge from someone who knows you."
                      : "Every small adventure is part of your story."}
              </p>
            </div>
            {tab === "Today" && (
              <div className="streak-pill">
                <Icon name="flame" size={21} />
                <strong>{streak}</strong>
                <span>day streak</span>
              </div>
            )}
          </section>
          {tab === "Today" && (
            <div className="today-grid">
              <div className="main-column">
                <section className={`featured-quest ${completed ? "is-completed" : ""}`}>
                  <div className="featured-top">
                    <span className="quest-eyebrow">
                      <Icon name="spark" size={15} /> YOUR DAILY SIDE QUEST
                    </span>
                    <span className="daily-number">NO. 028</span>
                  </div>
                  <QuestArt />
                  <div className="featured-content">
                    <span className="category">
                      <span />
                      {quest.category}
                    </span>
                    <h2>{quest.title}</h2>
                    <p>{quest.description}</p>
                    <div className="quest-meta">
                      <span>
                        <i className="difficulty-bars">
                          <i />
                          <i />
                          <i />
                        </i>
                        {quest.difficulty} difficulty
                      </span>
                      <span>
                        <Icon name="clock" size={15} />
                        {quest.time}
                      </span>
                      <span className="xp-text">
                        <Icon name="bolt" size={15} />+{quest.xp} XP
                      </span>
                    </div>
                    <button
                      className="primary quest-accept"
                      onClick={() => {
                        if (completed) setTab("Profile");
                        else if (accepted) {
                          setActiveIncoming(null);
                          setNote("");
                          setModal("complete");
                        } else setAccepted(true);
                      }}
                    >
                      <Icon name={completed ? "check" : accepted ? "flag" : "plus"} size={19} />
                      {completed
                        ? "Quest completed!"
                        : accepted
                          ? "Complete your quest"
                          : "Accept quest"}
                      <Icon name="arrow" size={19} />
                    </button>
                    {!accepted && !completed ? (
                      <button
                        className="swap-button"
                        onClick={() => setQuestIndex((questIndex + 1) % quests.length)}
                      >
                        <Icon name="shuffle" size={15} />
                        Not your vibe? Swap for another
                      </button>
                    ) : (
                      <div className="accepted-caption">
                        <Icon name="check" size={14} />
                        {completed
                          ? "One small adventure. One very good feeling."
                          : "You’re in! Go make a little good happen."}
                      </div>
                    )}
                  </div>
                </section>
                <section className="from-friends">
                  <div className="section-heading">
                    <h2>
                      From your friends <span className="count">{pending.length}</span>
                    </h2>
                    <button className="text-button" onClick={() => setTab("Inbox")}>
                      View inbox <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  <p className="section-subtitle">
                    Because adventures are better when they’re shared.
                  </p>
                  {pending.slice(0, 2).map((q) => (
                    <div className="friend-quest-row" key={q.id}>
                      <Avatar index={q.friend} />
                      <div>
                        <div className="friend-sender">
                          {friends[q.friend].first} sent you a quest{" "}
                          <span>· {q.id === 1 ? "2h" : "4h"} ago</span>
                        </div>
                        <h3>{q.title}</h3>
                        <span className={`mini-category ${q.category.toLowerCase()}`}>
                          {q.category}
                        </span>
                      </div>
                      <button
                        className="circle-button"
                        aria-label={`View quest from ${friends[q.friend].first}`}
                        onClick={() => setTab("Inbox")}
                      >
                        <Icon name="arrow" size={19} />
                      </button>
                    </div>
                  ))}
                  {pending.length === 0 && (
                    <div className="empty-state">
                      All caught up. Send a friend a little adventure!
                    </div>
                  )}
                </section>
              </div>
              <aside className="right-column">
                <section className="progress-card">
                  <div className="section-heading">
                    <h2>Your little wins</h2>
                    <Icon name="spark" size={19} />
                  </div>
                  <div className="week-streak">
                    <span className="streak-icon">
                      <Icon name="flame" size={30} />
                    </span>
                    <div>
                      <strong>
                        {streak}
                        <span> day streak</span>
                      </strong>
                      <p>
                        {completed
                          ? "You showed up. That’s what counts."
                          : "Look at you, showing up for life."}
                      </p>
                    </div>
                  </div>
                  <div className="week-days">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div key={i}>
                        <span>{d}</span>
                        <i
                          className={
                            i < 5 || (i === 5 && streak > 7)
                              ? "day done"
                              : i === 5
                                ? "day current"
                                : "day"
                          }
                        >
                          {i < 5 || (i === 5 && streak > 7) ? (
                            <Icon name="check" size={13} />
                          ) : i === 5 ? (
                            <span />
                          ) : (
                            "·"
                          )}
                        </i>
                      </div>
                    ))}
                  </div>
                  <div className="level-info">
                    <span>
                      <b>Level {level}</b> · Curious explorer
                    </span>
                    <strong>
                      {levelXp}
                      <span> / 500 XP</span>
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: `${levelXp / 5}%` }} />
                  </div>
                  <p className="level-caption">
                    {500 - levelXp} XP to your next level. You’ve got this.
                  </p>
                </section>
                <section className="mindset-card">
                  <span className="quote-mark">“</span>
                  <blockquote>
                    Life gets a little bigger
                    <br />
                    when you try something
                    <br />
                    <em>a little different.</em>
                  </blockquote>
                  <div className="mindset-footer">
                    <span>THE QUESTLY MINDSET</span>
                    <Icon name="spark" size={22} />
                  </div>
                </section>
                <section className="crew-card">
                  <div className="crew-avatars">
                    <Avatar index={0} size="tiny" />
                    <Avatar index={1} size="tiny" />
                    <Avatar index={3} size="tiny" />
                    <span className="online-dot" />
                  </div>
                  <h3>A little friendly motivation</h3>
                  <p>
                    Your crew is out making memories.
                    <br />
                    Send a little adventure their way.
                  </p>
                  <button className="text-button" onClick={() => setTab("Friends")}>
                    Visit your friends <Icon name="arrow" size={16} />
                  </button>
                </section>
              </aside>
            </div>
          )}
          {tab === "Friends" && (
            <>
              <div className="list-toolbar">
                <div className="search-field">
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Search friends"
                    placeholder="Find someone in your crew…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    setSearch("");
                    setModal("add");
                  }}
                >
                  <Icon name="plus" size={18} />
                  Add a friend
                </button>
              </div>
              <div className="friends-grid">
                {friends
                  .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
                  .map((f) => {
                    const i = friends.indexOf(f);
                    return (
                      <article className="friend-card" key={f.name}>
                        <div className="friend-card-top">
                          <Avatar index={i} size="large" />
                          <span className="friend-streak">
                            <Icon name="flame" size={17} />
                            {f.streak}
                          </span>
                        </div>
                        <h2>{f.name}</h2>
                        <p>{f.label}</p>
                        <div className="friend-level">
                          Level {i + 3} explorer <span>· {f.streak} day streak</span>
                        </div>
                        <button
                          className="secondary"
                          onClick={() => {
                            setSendTo(f.first);
                            setCustom("");
                            setModal("send");
                          }}
                        >
                          <Icon name="plus" size={17} />
                          Send a quest
                          <Icon name="arrow" size={17} />
                        </button>
                      </article>
                    );
                  })}
              </div>
              {!friends.some((f) => f.name.toLowerCase().includes(search.toLowerCase())) && (
                <div className="empty-state">No friends found. Try another name.</div>
              )}
              <div className="friends-banner">
                <Icon name="friends" size={34} />
                <div>
                  <h3>Good adventures deserve good company.</h3>
                  <p>Send a quest to someone who could use a little unexpected joy.</p>
                </div>
                <span className="banner-spark">
                  <Icon name="spark" size={35} />
                </span>
              </div>
            </>
          )}
          {tab === "Inbox" && (
            <div className="inbox-grid">
              <section>
                <div className="section-heading">
                  <h2>
                    Made for you{" "}
                    <span className="count">
                      {
                        incoming.filter((q) => q.status !== "Declined" && q.status !== "Completed")
                          .length
                      }
                    </span>
                  </h2>
                </div>
                <div className="inbox-list">
                  {incoming
                    .filter((q) => q.status !== "Declined" && q.status !== "Completed")
                    .map((q) => (
                      <article className="inbox-card" key={q.id}>
                        <div className="inbox-card-header">
                          <Avatar index={q.friend} />
                          <div>
                            <b>{friends[q.friend].first} sent you a quest</b>
                            <span>A little nudge to try something new</span>
                          </div>
                          <span className={`mini-category ${q.category.toLowerCase()}`}>
                            {q.category}
                          </span>
                        </div>
                        <h3>{q.title}</h3>
                        <div className="inbox-actions">
                          {q.status === "Pending" ? (
                            <>
                              <button
                                className="primary"
                                onClick={() => changeStatus(q.id, "Accepted")}
                              >
                                <Icon name="check" size={17} />
                                Accept quest
                              </button>
                              <button
                                className="subtle-button"
                                onClick={() => changeStatus(q.id, "Declined")}
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="status accepted">
                                <Icon name="check" size={14} />
                                Accepted
                              </span>
                              <button
                                className="text-button"
                                onClick={() => {
                                  setActiveIncoming(q);
                                  setNote("");
                                  setModal("complete");
                                }}
                              >
                                Mark complete <Icon name="arrow" size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    ))}
                  {incoming.every((q) => q.status === "Declined" || q.status === "Completed") && (
                    <div className="empty-state">
                      You’re all caught up. The next adventure is on its way.
                    </div>
                  )}
                </div>
              </section>
              <section className="sent-section">
                <div className="section-heading">
                  <h2>Sent with a little nudge</h2>
                  <Icon name="arrow" size={18} />
                </div>
                <p className="section-subtitle">Adventures you’ve put out into the world.</p>
                {sent.map((q) => (
                  <article className="sent-card" key={q.id}>
                    <span className="sent-to">To {q.name}</span>
                    <h3>{q.title}</h3>
                    <span className={`status ${q.status.toLowerCase()}`}>
                      {q.status === "Completed" && <Icon name="check" size={13} />}
                      {q.status}
                    </span>
                  </article>
                ))}
                <button
                  className="secondary full"
                  onClick={() => {
                    setSendTo("Jamie");
                    setCustom("");
                    setModal("send");
                  }}
                >
                  <Icon name="plus" size={17} />
                  Send a new quest
                </button>
              </section>
            </div>
          )}
          {tab === "Profile" && (
            <div className="profile-grid">
              <section className="profile-card">
                <Avatar index={2} size="extra-large" />
                <span className="profile-level">LEVEL {level} EXPLORER</span>
                <h2>{name} Morgan</h2>
                <p>Collecting moments, not things.</p>
                <div className="profile-stats">
                  <div>
                    <Icon name="flame" size={22} />
                    <b>{streak}</b>
                    <span>Day streak</span>
                  </div>
                  <div>
                    <Icon name="flag" size={22} />
                    <b>{27 + history.length - 3}</b>
                    <span>Quests done</span>
                  </div>
                  <div>
                    <Icon name="bolt" size={22} />
                    <b>{totalXp}</b>
                    <span>Total XP</span>
                  </div>
                </div>
                <button className="settings-row" onClick={() => setDark(!dark)}>
                  <Icon name={dark ? "sun" : "moon"} size={19} />
                  <span>{dark ? "Switch to light mode" : "Switch to dark mode"}</span>
                  <Icon name="chevron" size={17} />
                </button>
                <button className="settings-row" onClick={() => setModal("welcome")}>
                  <Icon name="logout" size={19} />
                  <span>View welcome screen</span>
                  <Icon name="chevron" size={17} />
                </button>
                <p className="demo-note">
                  Your little demo adventure.
                  <br />
                  Progress is saved for this session.
                </p>
              </section>
              <section className="history-section">
                <div className="section-heading">
                  <h2>Your adventure log</h2>
                  <span className="count">{history.length}</span>
                </div>
                <p className="section-subtitle">Small moments worth remembering.</p>
                {history.map((q, i) => (
                  <article className="history-card" key={i}>
                    <div className="history-date">
                      <span>
                        <Icon name="check" size={13} />
                        {q.date}
                      </span>
                      <b>+{q.xp} XP</b>
                    </div>
                    <h3>{q.title}</h3>
                    <p>“{q.note}”</p>
                  </article>
                ))}
              </section>
            </div>
          )}
          <footer className="page-footer">
            <span>A small quest. A good story. A little more life.</span>
            <span>
              Made for the everyday adventurer <Icon name="spark" size={12} />
            </span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav">
        {(["Today", "Friends", "Inbox", "Profile"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            <span>
              <Icon
                name={
                  t === "Today"
                    ? "sun"
                    : t === "Friends"
                      ? "friends"
                      : t === "Inbox"
                        ? "inbox"
                        : "user"
                }
                size={22}
              />
              {t === "Inbox" && pending.length > 0 && <i />}
            </span>
            {t}
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast("")}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`modal ${modal === "success" ? "success-modal" : ""} ${modal === "welcome" ? "welcome-modal" : ""}`}
          >
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <Icon name="close" size={21} />
            </button>
            {modal === "complete" && (
              <>
                <span className="modal-icon">
                  <Icon name="flag" size={28} />
                </span>
                <div className="eyebrow">A MOMENT WORTH REMEMBERING</div>
                <h2 id="modal-title">
                  How did your
                  <br />
                  adventure go?
                </h2>
                <div className="completing-title">{completingQuest.title.replace("\n", " ")}</div>
                <label className="field-label" htmlFor="reflection">
                  Tell your future self a little about it <span>(optional)</span>
                </label>
                <textarea
                  id="reflection"
                  placeholder="What happened? How did it make you feel?"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="field-hint">
                  {note.length}/500 · Just for you and your adventure log.
                </div>
                <button className="primary full" onClick={complete}>
                  <Icon name="check" size={18} />
                  Mark as completed
                  <Icon name="arrow" size={18} />
                </button>
              </>
            )}
            {modal === "success" && (
              <>
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as CSSProperties} />
                  ))}
                </div>
                <div className="success-medal">
                  <Icon name="check" size={45} />
                </div>
                <div className="eyebrow">ONE SMALL QUEST. ONE BIG FEELING.</div>
                <h2 id="modal-title">Look at you go!</h2>
                <p>
                  You stepped outside your routine.
                  <br />
                  That’s where the good stuff happens.
                </p>
                <div className="success-rewards">
                  <div>
                    <Icon name="bolt" size={23} />
                    <b>+{completingQuest.xp} XP</b>
                    <span>A little more legendary</span>
                  </div>
                  <div>
                    <Icon name="flame" size={23} />
                    <b>{streak} day streak</b>
                    <span>Keep that spark going</span>
                  </div>
                </div>
                <button className="primary full" onClick={() => setModal(null)}>
                  Take that good feeling with you
                  <Icon name="arrow" size={18} />
                </button>
                <button
                  className="text-button centered"
                  onClick={() => {
                    setModal(null);
                    setTab("Profile");
                  }}
                >
                  See your adventure log
                </button>
              </>
            )}
            {modal === "send" && (
              <>
                <span className="modal-icon">
                  <Icon name="spark" size={27} />
                </span>
                <div className="eyebrow">A LITTLE NUDGE GOES A LONG WAY</div>
                <h2 id="modal-title">Send a little adventure.</h2>
                <p>Give a friend something unexpected to smile about.</p>
                <label className="field-label" htmlFor="friend-select">
                  Who’s your lucky adventurer?
                </label>
                <select
                  id="friend-select"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                >
                  {friends.map((f) => (
                    <option key={f.first}>{f.first}</option>
                  ))}
                </select>
                <label className="field-label" htmlFor="custom-quest">
                  Your quest for {sendTo}
                </label>
                <textarea
                  id="custom-quest"
                  placeholder="Try a new café. Say hello to a neighbor. Make a little magic…"
                  value={custom}
                  maxLength={240}
                  onChange={(e) => setCustom(e.target.value)}
                />
                <button
                  className="surprise-button"
                  onClick={() =>
                    setCustom(
                      [
                        "Buy a snack you’ve never tried before.",
                        "Leave a kind note for someone to find.",
                        "Find something purple on a 10-minute walk.",
                        "Make a playlist that feels like sunshine.",
                      ][Math.floor(Math.random() * 4)],
                    )
                  }
                >
                  <Icon name="shuffle" size={18} />
                  Surprise them with a random quest
                </button>
                <button disabled={!custom.trim()} className="primary full" onClick={sendQuest}>
                  Send quest to {sendTo}
                  <Icon name="arrow" size={18} />
                </button>
              </>
            )}
            {modal === "add" && (
              <>
                <span className="modal-icon">
                  <Icon name="friends" size={28} />
                </span>
                <h2 id="modal-title">Grow your adventure crew.</h2>
                <p>
                  This is a demo crew. Invite a real-life friend by copying a little invitation to
                  share.
                </p>
                <div className="invitation-note">
                  Join me on Questly. One small adventure a day, and a few better stories along the
                  way.
                </div>
                <button
                  className="primary full"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        "Join me on Questly. One small adventure a day, and a few better stories along the way.",
                      );
                      notify("Invitation copied. Share it with your next adventure buddy.");
                      setModal(null);
                    } catch {
                      notify("Select and copy the invitation text above to share it.");
                    }
                  }}
                >
                  Copy invitation
                  <Icon name="arrow" size={18} />
                </button>
                <span className="demo-note">
                  Friend search and accounts are not connected in this prototype.
                </span>
              </>
            )}
            {modal === "welcome" && (
              <>
                <div className="welcome-brand">
                  <span className="brand-mark">
                    <Icon name="spark" size={27} />
                  </span>
                  questly.
                </div>
                <QuestArt small />
                <div className="eyebrow">LESS ROUTINE. MORE LIFE.</div>
                <h2 id="modal-title">
                  One small
                  <br />
                  adventure a day.
                </h2>
                <p>
                  A little nudge to try something new.
                  <br />A little more magic in the everyday.
                </p>
                <button
                  className="google-button"
                  onClick={() => {
                    notify("Google sign-in isn’t connected. You’re exploring the demo as Alex.");
                    setModal(null);
                    setTab("Today");
                  }}
                >
                  <b>G</b>Continue with Google
                </button>
                <button className="primary full" onClick={() => setModal("email")}>
                  Sign up with email
                  <Icon name="arrow" size={18} />
                </button>
                <button
                  className="text-button centered"
                  onClick={() => {
                    setModal(null);
                    setTab("Today");
                  }}
                >
                  Just looking? Explore the demo
                  <Icon name="arrow" size={15} />
                </button>
              </>
            )}
            {modal === "email" && (
              <>
                <span className="modal-icon">
                  <Icon name="spark" size={28} />
                </span>
                <h2 id="modal-title">
                  Your next chapter
                  <br />
                  starts small.
                </h2>
                <p>Personalize your demo adventure. No account is created.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setModal(null);
                    setTab("Today");
                    notify(`Welcome to the adventure, ${name}!`);
                  }}
                >
                  <label className="field-label" htmlFor="name">
                    Your first name
                  </label>
                  <input
                    id="name"
                    className="text-input"
                    required
                    maxLength={30}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                  />
                  <button className="primary full" type="submit">
                    Let’s find an adventure
                    <Icon name="arrow" size={18} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
