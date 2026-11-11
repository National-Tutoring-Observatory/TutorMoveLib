import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AskBox, DictionaryButton, MoveTerm, useDictionary } from "../components/Dictionary.jsx";
import {
  allGrades,
  categoryColor,
  findSession,
  gradeColor,
  gradeLabel,
  moveGroups,
  moveName,
  moves,
} from "../data/corpus.js";
import { entries, parts } from "../data/dictionary.js";
import { subjects } from "../data/subjects.js";
import logo from "../assets/logo.png";
import award from "../assets/nsf-career-award.png";
import { FundingNote } from "../components/SiteFooter.jsx";
import "./newlanding.css";
import Brand from "../components/Brand.jsx";
import ScrollRail from "../components/ScrollRail.jsx";
import useTitle from "../hooks/useTitle.js";

/* The front door. The previous one is kept at /#/classic.
   A landing page, not a tour of the features: what the library is, one real
   moment from it to try, and the ways in. The features live on their own pages. */

// The practice round beside the headline. Chosen by scoring every session:
// a question readable on its own (no image), four answer choices, the
// student stuck within the first turns, a tutor reply that teaches rather
// than gives the answer, and a student who then takes the step. Session 3514
// (grade 6) came out on top: "i dont get 0.3 times * =0.0006", and the tutor
// shrinks it to "3 x ___ = 6".
const PRACTICE_ID = "3514";
const STUCK_AT = 2; // "i dont get 0.3 times * =0.0006"
const ANSWERED_AT = 4; // "2", the student's first step

// The guided tour still runs on the session the previous front door used.
const TOUR_ID = "9407";

const practice = findSession(PRACTICE_ID);
const before = practice ? practice.msgs.filter((m) => m.n <= STUCK_AT) : [];
const reveal = practice ? practice.msgs.filter((m) => m.n > STUCK_AT && m.n < ANSWERED_AT) : [];
const answer = practice ? practice.msgs.find((m) => m.n === ANSWERED_AT) : null;
const answerKey = practice ? /^\s*([A-D])\b/.exec(practice.answer || "")?.[1] ?? null : null;
// The stops on the scroll rail down the left margin.
const RAIL = [
  { id: "nl-s-hero", label: "Welcome", name: "Welcome: learn from real tutoring" },
  { id: "nl-s-ask", label: "Ask", name: "Describe your situation" },
  { id: "nl-s-ways", label: "Start here", name: "Where to start" },
  { id: "nl-s-about", label: "About", name: "About Starling" },
];
const moveCount = moveGroups.reduce((n, g) => n + g.moves.length, 0);
// The grades the library covers, for the "Choose a subject" row.
const liveGrades = allGrades.filter((g) => g.available).map((g) => g.grade);
const gradeSpan = liveGrades.length
  ? `Grades ${liveGrades[0]} to ${liveGrades[liveGrades.length - 1]}`
  : "";

function Turn({ m, showWhy = false }) {
  const tutor = m.t === 1;
  return (
    <li className={`nl-turn ${tutor ? "is-tutor" : "is-student"}`}>
      <span className="nl-who">{tutor ? "Tutor" : "Student"}</span>
      <div className="nl-said">
        <p>{m.s}</p>
        {m.m.length > 0 && (
          <div className="nl-label">
            {m.m.map((code) => (
              <span
                key={code}
                className="nl-tag"
                style={{ "--cat": categoryColor[moves[code]?.category] || "var(--ink-3)" }}
              >
                <MoveTerm code={code}>{moveName(code)}</MoveTerm>
              </span>
            ))}
            {showWhy && m.x?.why && <p className="nl-why">{m.x.why}</p>}
          </div>
        )}
      </div>
    </li>
  );
}

function Practice() {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const replyId = useId();
  const revealId = useId();
  if (!practice) return null;

  return (
    <section
      className="nl-practice"
      aria-labelledby="nl-practice-h"
      style={{ "--grade": gradeColor[practice.grade] }}
    >
      <header className="nl-practice-head">
        <h2 id="nl-practice-h" className="nl-practice-title">Try it yourself</h2>
        <span className="nl-grade">{gradeLabel(practice.grade)}</span>
      </header>
      <p className="nl-question">
        <span className="nl-question-lbl">{practice.topic}</span>
        {practice.question}
      </p>

      {practice.options?.length > 0 && (
        <ol className="nl-opts" aria-label="Answer choices">
          {practice.options.map((o) => {
            const right = open && o.k === answerKey;
            return (
              <li key={o.k} className={right ? "is-answer" : ""}>
                <b>{o.k}</b>
                <span>{o.t}</span>
                {right && <span className="nl-opt-tag">Answer</span>}
              </li>
            );
          })}
        </ol>
      )}

      <ol className="nl-turns">
        {before.map((m) => (
          <Turn key={m.n} m={m} />
        ))}
      </ol>

      <form
        className="nl-reply"
        onSubmit={(ev) => {
          ev.preventDefault();
          setOpen(true);
        }}
      >
        <label htmlFor={replyId}>You are the tutor. What would you say?</label>
        <textarea
          id={replyId}
          rows={2}
          value={reply}
          onChange={(ev) => setReply(ev.target.value)}
          placeholder="Write your reply. Nothing is sent or saved."
        />
        <button type="submit" className="nl-btn nl-btn-grade" aria-expanded={open} aria-controls={revealId}>
          See what the tutor did
        </button>
      </form>

      <div id={revealId} className="nl-reveal" aria-live="polite" hidden={!open}>
        {open && (
          <>
            {reply.trim() && (
              <p className="nl-yours">
                <span className="nl-who">You</span>
                {reply.trim()}
              </p>
            )}
            <ol className="nl-turns">
              {reveal.map((m) => (
                <Turn key={m.n} m={m} showWhy />
              ))}
            </ol>
            {answer && (
              <p className="nl-next">
                <span className="nl-who">What happened next</span>
                The student answered “{answer.s}”, their first step on the question.
              </p>
            )}
            <Link className="nl-link" to={`/mathematics/s/${practice.id}`}>
              Read the whole session
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function NewLanding() {
  const navigate = useNavigate();
  const dict = useDictionary();
  useTitle(null);

  const ways = [
    {
      who: "For teachers and tutors",
      name: "Choose a subject",
      what: "Pick a grade and a question, then read the conversation with every move explained.",
      count: gradeSpan,
      color: "var(--c-accent)",
      go: () => navigate("/subjects"),
    },
    {
      who: "For researchers",
      name: "Explore the taxonomy",
      what: "Every move in its group, and every place it shows up across the sessions.",
      count: `${moveCount} moves`,
      color: "var(--plum)",
      go: () => navigate("/research"),
    },
    {
      who: "For everyone",
      name: "Look up a move",
      what: "Each move defined in a sentence, with the words tutors actually said.",
      count: `${entries.length} entries`,
      color: "var(--ochre)",
      go: () => dict.openAt(null),
    },
  ];

  return (
    <main className="nl">
      <div className="topbar nl-top">
        <Brand sub />
        <DictionaryButton className="nl-dict" />
      </div>

      <ScrollRail sections={RAIL} />

      <div className="nl-wrap">
        <section className="nl-hero" id="nl-s-hero">
          <div className="nl-hero-text">
            <h1>Learn from real tutoring</h1>
            <p className="nl-lede">
              Real tutoring sessions, with every tutor turn labelled by its teaching move.
            </p>
            <div className="nl-actions">
              <Link className="nl-btn nl-btn-primary" to={`/mathematics/s/${TOUR_ID}?tour=1`}>
                Take the guided tour
              </Link>
              {/* The tour on its own row; the two ways in share the next. */}
              <span className="nl-actions-break" aria-hidden="true" />
              <Link className="nl-btn" to="/subjects">
                Choose a subject
              </Link>
              <Link className="nl-btn" to="/research">
                Explore the taxonomy
              </Link>
            </div>
            <p className="nl-from">
              <img src={logo} alt="" />
              <span>Starling is part of the National Tutoring Observatory.</span>
            </p>
          </div>
          <Practice />
        </section>
      </div>

      {/* Describe your situation: the search, right under the hero. */}
      <div className="nl-band nl-band-ask" id="nl-s-ask">
        <section className="nl-wrap nl-ask" aria-labelledby="nl-ask-h">
          <div className="nl-ask-head">
            <h2 id="nl-ask-h" className="nl-h2">Describe your situation</h2>
            <p>
              Tell Starling what is happening in your session, and it suggests the moves that
              fit, with a tip for each.
            </p>
          </div>
          <AskBox />
        </section>
      </div>

      <div className="nl-wrap nl-grow">

        <section className="nl-section" id="nl-s-ways" aria-labelledby="nl-ways-h">
          <h2 id="nl-ways-h" className="nl-h2">Where to start</h2>
          <ul className="nl-ways">
            {ways.map((w) => (
              <li key={w.name}>
                <button type="button" className="nl-way" onClick={w.go} style={{ "--way": w.color }}>
                  <span className="nl-way-who">{w.who}</span>
                  <span className="nl-way-name">{w.name}</span>
                  <span className="nl-way-what">{w.what}</span>
                  <span className="nl-way-count">{w.count}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="nl-preview">
            <span className="nl-preview-badge">Preview</span>
            Bring your own session: upload a transcript and see your key moments.{" "}
            <Link className="nl-link" to="/your-session">See how it would work</Link>
          </p>
        </section>
      </div>

      <footer className="nl-foot" id="nl-s-about">
        <div className="nl-wrap nl-foot-inner">
          <div className="nl-foot-logos">
            <img className="nl-foot-logo" src={logo} alt="National Tutoring Observatory" />
            <img
              className="nl-foot-award"
              src={award}
              alt="NSF Faculty Early Career Development Program (CAREER) Award"
            />
          </div>
          <div className="nl-foot-text">
            <p>
              Starling, the Tutoring Moves Library, is part of the National Tutoring Observatory.{" "}
              Every tutoring session is de-identified, from Eedi. {subjects.length} subjects
              planned; math is the first. The
              dictionary holds {entries.length} moves in {Object.keys(parts).length} parts.
            </p>
            <p className="nl-foot-fund">
              <FundingNote />
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
