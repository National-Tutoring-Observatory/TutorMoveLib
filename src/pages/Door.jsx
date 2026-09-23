import { useNavigate } from "react-router-dom";

import { stats } from "../data/corpus.js";
import { moveGroups } from "../data/corpus.js";
import { subjects } from "../data/subjects.js";
import { AskBox, DictionaryButton, useDictionary } from "../components/Dictionary.jsx";
import useFanOut from "../hooks/useFanOut.js";

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

const doors = [
  {
    id: "library",
    kicker: "For teachers and tutors",
    name: "Browse the library",
    blurb:
      "Start from a subject and a grade level, find a question a student got stuck on, and read the conversation that followed — with every tutoring move explained in plain language.",
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
      "Start from the moves themselves. Every move in its group, everywhere it is demonstrated across the corpus, and every turn where trained annotators read it two different ways.",
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
      "A dictionary you can flip through. Every move on its own page, defined in a sentence and illustrated with the words tutors actually said.",
    // Not a route: it opens the dictionary panel over whatever page you are on.
    dictionary: true,
    icon: Lexicon,
    tint: { ink: "#1e3b32", wash: "#eef4f1", line: "#c3d6cd" },
    // The dictionary uses the taxonomy paper's full vocabulary, which is
    // wider than the 25 codes that occur in the corpus.
    stat: () => "29 entries · 4 parts",
    action: "Open the dictionary",
  },
];

export default function Door() {
  const navigate = useNavigate();
  const dict = useDictionary();
  const { ref: gridRef, ready } = useFanOut(doors.length);

  return (
    <main className="landing">
      <div className="topbar">
        <span className="org-mark" aria-hidden="true" />
        <span className="org">National Tutoring Observatory</span>
        <DictionaryButton className="topbar-dict" />
      </div>

      <header className="landing-top">
        <h1>Tutoring Moves Library</h1>
        <p className="door-sub">Three ways in. All open on the same taxonomy.</p>
      </header>

      <AskBox />

      <div className="landing-body">
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
      </div>
    </main>
  );
}
