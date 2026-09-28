import { Link, useNavigate } from "react-router-dom";

import {
  findSession,
  gradeColor,
  gradeLabel,
  moveGroups,
  sessions,
  stats,
} from "../data/corpus.js";
import { entries, parts } from "../data/dictionary.js";
import { subjects } from "../data/subjects.js";
import { AskBox, DictionaryButton, MoveTerm, useDictionary } from "../components/Dictionary.jsx";
import useFanOut from "../hooks/useFanOut.js";
import "./door.css";

const icon = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// The same stroke style, drawn smaller for the how-to-read steps.
const small = { ...icon, width: 20, height: 20 };

const Classroom = () => (
  <svg {...icon}>
    <path d="M12 6.6C10.4 5.1 8.3 4.5 4.5 4.5v13c3.8 0 5.9.6 7.5 2.1 1.6-1.5 3.7-2.1 7.5-2.1v-13C15.7 4.5 13.6 5.1 12 6.6Z" />
    <path d="M12 6.6v13" />
  </svg>
);

const Taxonomy = () => (
  <svg {...icon}>
    <circle cx="6" cy="5.5" r="2.2" />
    <circle cx="6" cy="18.5" r="2.2" />
    <circle cx="18" cy="12" r="2.2" />
    <path d="M8.2 5.5H13a2 2 0 0 1 2 2v2.3M8.2 18.5H13a2 2 0 0 0 2-2v-2.3" />
  </svg>
);

const Lexicon = () => (
  <svg {...icon}>
    <path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H7.5A1.5 1.5 0 0 1 6 19V3.5Z" />
    <path d="M6 17.5A1.5 1.5 0 0 1 7.5 16H19" />
    <path d="M9.5 7.5h5M9.5 10.5h3.5" />
  </svg>
);

// A question card: the problem the student was stuck on.
const Question = () => (
  <svg {...small}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" />
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.3 2.2c-.6.3-.9.8-.9 1.4v.6" />
    <path d="M12 16.9h.01" />
  </svg>
);

// A line that rises and falls over a baseline: who holds the thinking, turn by turn.
const Timeline = () => (
  <svg {...small}>
    <path d="M3.5 20h17" />
    <path d="M4 15.5l4-4.5 3.5 3 4.5-7 4 4.5" />
    <circle cx="16" cy="7" r="1.3" />
  </svg>
);

// A speech bubble: one turn of the conversation, opened up.
const Moment = () => (
  <svg {...small}>
    <path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v8.5A1.5 1.5 0 0 1 19 16h-8l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5Z" />
    <path d="M7.5 8.8h9M7.5 11.8h5.5" />
  </svg>
);

// A pencil: your own reply, written before you see the tutor's.
const Pencil = () => (
  <svg {...small}>
    <path d="M15.8 4.2l4 4L9 19H5v-4L15.8 4.2Z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

const steps = [
  {
    icon: Question,
    title: "The question",
    text: "The math question the student was stuck on.",
  },
  {
    icon: Timeline,
    title: "Who's doing the thinking",
    text: "A timeline of when the student, or the tutor, carries the thinking.",
  },
  {
    icon: Moment,
    title: "Key moments",
    text: "What the student said, the tutor's move, and what happened next.",
  },
  {
    icon: Pencil,
    title: "Try it yourself",
    text: "Write your reply, then see what the tutor did.",
  },
];

// The first session we point newcomers to, and the one the guided tour runs
// on. Chosen by scoring every session on who does the thinking and whether
// the tutor gives the answer away, then keeping those long enough to show a
// whole approach and with a question anyone can read in a second. Here the
// tutor never gives the answer: the student works out 10% then 5% of 20,
// jumps ahead to "ahh so 20% is 1", and sees the two are the same; then the
// tutor asks what they notice, to draw out why. If the corpus ever loses the
// session, fall back to any session with hand-written notes.
const START_ID = "9407";
const START_BLURB =
  "The student works out both percentages step by step, and finds they are the same.";
const start =
  findSession(START_ID) ||
  sessions.find((s) => s.msgs.some((m) => m.hand)) ||
  sessions[0];
const isChosen = start?.id === START_ID;

const startFacts = start && {
  turns: start.msgs.length,
  blurb: isChosen ? START_BLURB : null,
  // The student's own first words, so the card shows a real person, not a pitch.
  opener: start.msgs.find((m) => m.t === 0)?.s,
};

const doors = [
  {
    id: "library",
    kicker: "For teachers and tutors",
    name: "Browse the library",
    blurb:
      "Pick a grade and a question, then read the tutoring conversation with every move explained.",
    path: "/subjects",
    icon: Classroom,
    tint: { ink: "#c8102e", wash: "#fff1f3", line: "#f4c6cd" },
    stat: () => `${subjects.length} subjects · ${stats.sessions} sessions`,
    action: "Choose a subject",
  },
  {
    id: "research",
    kicker: "For researchers",
    name: "Work from the taxonomy",
    blurb:
      "Every move in its group, and every place it shows up across the sessions.",
    path: "/research",
    icon: Taxonomy,
    tint: { ink: "#2a78d6", wash: "#eef4fd", line: "#c6daf1" },
    stat: () =>
      `${moveGroups.reduce((n, g) => n + g.moves.length, 0)} moves · ${
        moveGroups.length
      } groups`,
    action: "Open the taxonomy",
  },
  {
    id: "dictionary",
    kicker: "For everyone",
    name: "Look up a move",
    blurb:
      "Each move defined in a sentence, with the words tutors actually said.",
    // Not a route: it opens the dictionary panel over whatever page you are on.
    dictionary: true,
    icon: Lexicon,
    tint: { ink: "#1e3b32", wash: "#eef4f1", line: "#c3d6cd" },
    // The dictionary uses the taxonomy paper's full vocabulary, which is
    // wider than the set of codes that occur in the corpus.
    stat: () => `${entries.length} entries · ${Object.keys(parts).length} parts`,
    action: "Open the dictionary",
  },
];

function StartHere() {
  if (!start) return null;
  return (
    <Link
      className="door-start"
      // ?tour=1 opens the session with a guided walk through each part of
      // the page. Only this card starts it.
      to={`/mathematics/s/${start.id}?tour=1`}
      style={{ "--ink-tint": gradeColor[start.grade] || "var(--red)" }}
    >
      <p className="door-start-top">
        <span className="door-label">Start here</span>
        <span className="door-start-tag">Guided tour</span>
      </p>
      <h2>{start.topic}</h2>
      <p className="door-start-meta">
        {gradeLabel(start.grade)} · {start.strand}
      </p>
      {startFacts.blurb ? (
        <p className="door-start-quote">{startFacts.blurb}</p>
      ) : (
        startFacts.opener && (
          <p className="door-start-quote">
            The student opens with “{startFacts.opener.trim()}”
          </p>
        )
      )}
      <p className="door-start-why">
        We'll walk you through each part of the page as you read it.
      </p>
      <span className="door-start-foot">
        <span className="stat">
          {startFacts.turns} turns
        </span>
        <span className="go">
          Take the tour <span className="arrow">→</span>
        </span>
      </span>
    </Link>
  );
}

function HowToRead() {
  return (
    <section className="door-howto" aria-labelledby="howto-h">
      <h2 className="door-label" id="howto-h">
        How to read a session
      </h2>
      <ol className="door-steps">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title}>
              <span className="door-step-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="door-step-body">
                <b>
                  <span className="door-step-n">{i + 1}</span>
                  {s.title}
                </b>
                <span>{s.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function Door() {
  const navigate = useNavigate();
  const dict = useDictionary();
  const { ref: gridRef, ready } = useFanOut(doors.length);

  return (
    <main className="landing door-page">
      <div className="topbar">
        <span className="org-mark" aria-hidden="true" />
        <span className="org">National Tutoring Observatory</span>
        <DictionaryButton className="topbar-dict" />
      </div>

      <header className="landing-top">
        <h1>Tutoring Moves Library</h1>
        <p className="door-intro">
          This is a library of real online math tutoring conversations. Every tutor turn
          is labelled with the teaching move it shows, like{" "}
          <MoveTerm code="GIVING_HINT">giving a hint</MoveTerm> or{" "}
          <MoveTerm code="GIVING_ANSWER">giving the answer</MoveTerm>, and
          explained in plain language. It is for teachers, tutors and the people
          who train them: a place to practise noticing what a good tutor does in
          the moment a student is stuck.
        </p>
      </header>

      <div className="door-orient">
        <StartHere />
        <HowToRead />
      </div>

      <div className="landing-body door-body">
        <div className="doors-head">
          <h2 className="door-label">Three ways in</h2>
        </div>
        <div className={`grid grid-doors${ready ? " ready" : ""}`} ref={gridRef}>
          {doors.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                className="door"
                style={{
                  "--ink-tint": d.tint.ink,
                  "--wash": d.tint.wash,
                  "--line-tint": d.tint.line,
                }}
                onClick={() => (d.dictionary ? dict.openAt(null) : navigate(d.path))}
              >
                <div className="icon">
                  <Icon />
                </div>
                <p className="door-kicker">{d.kicker}</p>
                <h2>{d.name}</h2>
                <p className="door-blurb">{d.blurb}</p>
                <div className="foot">
                  <span className="stat">{d.stat()}</span>
                  <span className="go">
                    {d.action} <span className="arrow">→</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Where the library is headed: the same reading, applied to a
            session the tutor taught. A walk-through with a sample for now. */}
        <Link className="door-own" to="/your-session">
          <span className="door-own-badge">Preview · sample case</span>
          <span className="door-own-text">
            <b>Bring your own session.</b> Upload a transcript and see your key
            moments, with examples from other tutors.
          </span>
          <span className="door-own-go">
            See how it would work <span className="arrow">→</span>
          </span>
        </Link>
      </div>

      <AskBox />
    </main>
  );
}
