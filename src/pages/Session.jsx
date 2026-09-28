import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { MoveTerm, MoveTerms } from "../components/Dictionary.jsx";
import Shell, { MATH_TINT, RESEARCH_TINT } from "../components/Shell.jsx";
import Tour from "../components/Tour.jsx";
import {
  findMove,
  findSession,
  grades,
  moveName,
  moves,
  neighbours,
  rungColor,
  spectrum,
} from "../data/corpus.js";
import {
  SHORT,
  framing,
  keyMoments,
  situationFor,
  studentRun,
  turnRung,
  whatNext,
} from "../data/moments.js";
import "./session.css";

/* The session screen, built for a tutor learning from someone else's session.
   It reads top to bottom the way a video club works: a question to hold in
   mind first ("Watch for…"), a handful of moments worth pausing on, then the
   conversation itself. For any tutor turn the side pane answers four plain
   questions — what had the student just said, what did the tutor do, who was
   left doing the thinking, and what happened next. How the AI arrived at its
   label is still there for researchers, folded away underneath. */

// Split a message into plain text and highlighted clue spans, so hovering a
// cue in the explanation lights the matching words in the message.
function segment(text, clues) {
  const spans = [];
  clues.forEach((cue, i) => {
    if (!cue.q) return;
    const at = text.indexOf(cue.q);
    if (at < 0) return;
    const end = at + cue.q.length;
    if (spans.some((s) => at < s.end && end > s.start)) return;
    spans.push({ start: at, end, idx: i });
  });
  spans.sort((a, b) => a.start - b.start);

  const parts = [];
  let cursor = 0;
  spans.forEach((s) => {
    if (s.start > cursor) parts.push({ text: text.slice(cursor, s.start) });
    parts.push({ text: text.slice(s.start, s.end), idx: s.idx });
    cursor = s.end;
  });
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

function Marked({ text, clues, hot }) {
  return segment(text, clues).map((p, i) =>
    p.idx === undefined ? (
      <span key={i}>{p.text}</span>
    ) : (
      <span key={i} className={`ss-mark${hot === p.idx ? " lit" : ""}`}>
        {p.text}
      </span>
    )
  );
}

// Below the breakpoint the panes stack, and the detail is drawn inline under
// the chosen turn — otherwise it would sit a whole transcript away.
function useNarrow(query = "(max-width: 900px)") {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [query]);
  return narrow;
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------ the question */

// The answer is stored as text such as "A) Only Jake", "A (145)" or
// "C (A and D are 8; B and C are 40)". Pull out the letter, and any working
// in brackets that says more than the option itself.
function parseAnswer(answer, options = []) {
  const m = /^\s*([A-D])\b\)?\s*(?:\((.*)\))?/.exec(answer || "");
  if (!m) return { key: null, note: null };
  const opt = options.find((o) => o.k === m[1]);
  const note = m[2] && (!opt || m[2].trim() !== opt.t.trim()) ? m[2].trim() : null;
  return { key: m[1], note };
}

function QuestionHeader({ session, position, watch }) {
  const [open, setOpen] = useState(false);
  const inferred = session.confidence === "inferred";
  const options = session.options ?? [];
  const { key, note } = parseAnswer(session.answer, options);
  return (
    <header className={`ss-head${options.length ? " has-opts" : ""}`}>
      <div className="ss-head-main">
      <p className="ss-kicker">
        {grades[String(session.grade)]} · {session.strand} · {position}
      </p>
      <h1 className="ss-title">{session.topic}</h1>
      <div className={`ss-q${open ? " open" : ""}`} id="ss-question">
        <div className="ss-q-row">
          <p className="ss-q-text">
            <span className="ss-q-lbl">Question</span>
            {session.question}
          </p>
          <button
            className="ss-linkbtn"
            aria-expanded={open}
            aria-controls="ss-question"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Show less" : "Show all"}
          </button>
        </div>
        {open && !key && (
          <p className="ss-q-answer">
            <b>Answer</b> {session.answer}
          </p>
        )}
        {inferred && (
          <p className="ss-q-note">
            The question was shown as a diagram that is not part of the
            transcript. This is a reconstruction from how the tutor talks about
            it.
          </p>
        )}
      </div>
      {watch && (
        <p className="ss-watch">
          <span className="ss-watch-lbl">Watch for</span>
          {watch}
        </p>
      )}
      </div>

      {options.length > 0 && (
        <div className="ss-opts">
          <ol aria-label="Answer options">
            {options.map((o) => (
              <li key={o.k} className={o.k === key ? "is-answer" : ""}>
                <b>{o.k}</b>
                <span>{o.t}</span>
                {o.k === key && <span className="ss-opt-tag">Answer</span>}
              </li>
            ))}
          </ol>
          {note && <p className="ss-opts-note">{note}</p>}
          {!key && <p className="ss-opts-note">Answer: {session.answer}</p>}
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------ who's doing the thinking */

// One mark per message, in order. Tutor turns on the ladder stand above the
// line, taller and darker the more of the thinking the tutor took; tutor turns
// off the ladder (feedback, rapport) are a short grey tick; the student hangs
// below the line. Arrow keys move along it; only one mark is a tab stop.
function Timeline({ msgs, focus, keyByN, hideAfter, onPick }) {
  const trackRef = useRef(null);
  // The last mark that can take focus: in try-it mode, everything after the
  // student's message is hidden and disabled.
  const last = hideAfter ?? msgs.length - 1;
  const focusIdx = Math.min(last, Math.max(0, msgs.findIndex((m) => m.n === focus)));
  const [roving, setRoving] = useState(focusIdx);
  useEffect(() => setRoving(focusIdx), [focusIdx]);

  // Keep the chosen mark in view when the strip scrolls sideways on a phone.
  // Done by hand: scrollIntoView would also scroll the page to the strip.
  useEffect(() => {
    const track = trackRef.current;
    const el = track?.querySelector('[aria-current="true"]');
    if (!el) return;
    const t = track.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.left < t.left) track.scrollLeft -= t.left - r.left + 24;
    else if (r.right > t.right) track.scrollLeft += r.right - t.right + 24;
  }, [focus]);

  const move = (ev, i) => {
    let to = null;
    if (ev.key === "ArrowRight") to = Math.min(last, i + 1);
    if (ev.key === "ArrowLeft") to = Math.max(0, i - 1);
    if (ev.key === "Home") to = 0;
    if (ev.key === "End") to = last;
    if (to === null) return;
    ev.preventDefault();
    setRoving(to);
    trackRef.current?.querySelectorAll("button")[to]?.focus();
  };

  return (
    <section
      className="ss-strip"
      aria-labelledby="ss-strip-lbl"
      title="One mark per message. Bars above the line are the tutor: taller and darker means the tutor took more of the thinking. Marks below are the student."
    >
      <div className="ss-strip-head">
        <p className="ss-kicker" id="ss-strip-lbl">
          Who's doing the thinking
        </p>
        <span className="ss-scale" aria-hidden="true">
          <span>Student</span>
          <span className="ss-ramp">
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <i key={r} style={{ background: rungColor[r] }} />
            ))}
          </span>
          <span>Tutor</span>
        </span>
      </div>
      <div
        className="ss-track"
        ref={trackRef}
        role="toolbar"
        aria-label="Messages in order. Use the arrow keys to move along."
      >
        {msgs.map((m, i) => {
          const hidden = hideAfter !== null && i > hideAfter;
          const rung = turnRung(m);
          const km = keyByN.get(m.n);
          const on = m.n === focus;
          let kind = "student";
          if (m.t) kind = rung ? "rung" : "tick";
          const label = hidden
            ? `Message ${m.n}, hidden while you try it`
            : [
                `Message ${m.n}`,
                m.t
                  ? m.x
                    ? `tutor: ${m.m.map(moveName).join(" and ")}${rung ? ` (${spectrum[String(rung)]})` : ""}`
                    : "tutor, not labelled"
                  : "student",
                km && `key moment ${km.num}`,
              ]
                .filter(Boolean)
                .join(", ");
          return (
            <button
              key={m.n}
              className={`ss-seg is-${hidden ? "hidden" : kind}${on ? " is-on" : ""}${km ? " is-key" : ""}`}
              style={
                !hidden && rung
                  ? { "--h": `${4 + rung * 3}px`, "--c": rungColor[rung] }
                  : undefined
              }
              tabIndex={i === roving ? 0 : -1}
              aria-label={label}
              aria-current={on ? "true" : undefined}
              title={hidden ? undefined : label}
              disabled={hidden}
              onKeyDown={(ev) => move(ev, i)}
              onFocus={() => setRoving(i)}
              onClick={() => onPick(m)}
            >
              <span className="ss-seg-mark" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------ top-bar navigation */

// Back to the list, and the previous / next question, in the top bar so the
// page itself opens straight onto the session.
function TopNav({ back, prev, next }) {
  const Step = ({ to, label, dir }) =>
    to ? (
      <Link className="ss-topnav-btn" to={to.to} title={to.label} aria-label={`${label}: ${to.label}`}>
        {dir}
      </Link>
    ) : (
      <span className="ss-topnav-btn is-off" aria-hidden="true">
        {dir}
      </span>
    );
  return (
    <div className="ss-topnav">
      <Link className="ss-topnav-back" to={back.to}>
        ← {back.label}
      </Link>
      <Step to={prev} label="Previous question" dir="←" />
      <Step to={next} label="Next question" dir="→" />
    </div>
  );
}

/* ------------------------------------------------------- the side pane */

const lowerFirst = (t) => (t ? t[0].toLowerCase() + t.slice(1) : t);

function Quote({ who, n, children }) {
  return (
    <blockquote className={`ss-quote ${who}`}>
      <p>{children}</p>
      <footer>
        {who === "student" ? "Student" : "Tutor"} · message {n}
      </footer>
    </blockquote>
  );
}

function Detail({
  session,
  focused,
  moment,
  moments,
  situation,
  trying,
  draft,
  setDraft,
  reveal,
  hot,
  setHot,
  howOpen,
  setHowOpen,
  stepper,
}) {
  const msgs = session.msgs;
  const x = focused.x;
  const clues = x?.clues ?? [];
  const marks = howOpen ? clues : [];
  const primary = focused.m[0];
  const rung = turnRung(focused);
  const next = whatNext(session, focused.n);

  return (
    <div className="ss-detail">
      <div className="ss-detail-head">
        <p className="ss-kicker">
          {moment ? (
            <>
              <span className="ss-knum">{moment.num}</span> Key moment {moment.num} of{" "}
              {moments.length}
            </>
          ) : (
            `Message ${focused.n}`
          )}
        </p>
      </div>

      <section className="ss-sec">
        <h3 className="ss-sec-h">The situation</h3>
        <p className="ss-situation">{situation.label}</p>
        {situation.cue &&
          studentRun(session, situation.cue.n).map((m) => (
            <Quote who="student" n={m.n} key={m.n}>{m.s.trim()}</Quote>
          ))}
      </section>

      {trying ? (
        <section className="ss-sec ss-try">
          <h3 className="ss-sec-h">Your turn</h3>
          <label className="ss-try-lbl" htmlFor={`ss-draft-${focused.n}`}>
            The student just said this. What would you say?
          </label>
          <textarea
            id={`ss-draft-${focused.n}`}
            className="ss-try-box"
            rows={4}
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            placeholder="Write your reply. It stays on this page and is not saved."
          />
          <button className="ss-btn" onClick={reveal}>
            Reveal what the tutor did
          </button>
          {stepper}
        </section>
      ) : (
        <>
          <section className="ss-sec">
            <h3 className="ss-sec-h">What the tutor did</h3>
            {draft.trim() && (
              <div className="ss-compare">
                <div>
                  <p className="ss-compare-lbl">You would have said</p>
                  <p className="ss-compare-text">{draft}</p>
                </div>
                <div>
                  <p className="ss-compare-lbl">The tutor said</p>
                  <p className="ss-compare-text">{focused.s.trim()}</p>
                </div>
              </div>
            )}
            <Quote who="tutor" n={focused.n}>
              <Marked text={focused.s.trim()} clues={marks} hot={hot} />
            </Quote>
            {focused.c ? (
              <p className="ss-move">Two readings — see how this was labelled, below.</p>
            ) : (
              <>
                <p className="ss-move">
                  <MoveTerms codes={focused.m} sep=" + " />
                  {/* Where the move sits on the thinking scale, when it has a
                      place there. Most feedback and rapport moves do not. */}
                  {rung && (
                    <span className="ss-move-rung">
                      <i style={{ background: rungColor[rung] }} aria-hidden="true" />
                      {lowerFirst(spectrum[String(rung)])}
                    </span>
                  )}
                </p>
                {moves[primary]?.def && <p className="ss-def">{moves[primary].def}</p>}
              </>
            )}
          </section>

          <section className="ss-sec">
            <h3 className="ss-sec-h">What happened next</h3>
            {next.replies.length ? (
              next.replies.map((r) => (
                <Quote who="student" n={r.n} key={r.n}>{r.s.trim()}</Quote>
              ))
            ) : (
              <p className="ss-none">
                The session ended here — the student did not reply.
              </p>
            )}
          </section>

          {stepper}

          {x && (
            <details
              className="ss-how"
              open={howOpen}
              onToggle={(ev) => setHowOpen(ev.currentTarget.open)}
            >
              <summary>How this was labelled</summary>
              {x.readings ? (
                <>
                  <div className="ss-unc">
                    <b>The AI is not confident here</b>
                    Two people trained on this framework labelled this turn
                    differently and never settled it. Rather than pick one and
                    look certain, the library shows you both readings.
                  </div>
                  {x.readings.map((r, i) => (
                    <div className="ss-reading" key={i}>
                      {r.move ? (
                        <MoveTerm code={r.move}>{moveName(r.move)}</MoveTerm>
                      ) : (
                        <span>Not a move at all</span>
                      )}
                      <p>{r.why}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="ss-why">{x.why}</p>
              )}
              {clues.length > 0 && (
                <>
                  <p className="ss-clue-lbl">Cues in the wording</p>
                  <ul className="ss-clues">
                    {clues.map((cue, i) => (
                      <li
                        key={i}
                        className={hot === i ? "hot" : ""}
                        onMouseEnter={() => setHot(i)}
                        onMouseLeave={() => setHot(null)}
                      >
                        {cue.q && <span className="ss-cuephrase">{cue.q}</span>}
                        {cue.q && " — "}
                        {cue.why}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </details>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ guided tour */

// The walk-through shown when someone arrives from "Start here": one stop per
// part of the page, in reading order, each saying what the part is and what
// it is there to show. Parts that are not on the page are skipped, and on a
// phone the side panel is the one shown inline under the chosen turn.
function tourSteps(session, moments, focus) {
  const n = moments.length;
  const at = moments.find((m) => m.n === focus)?.num;
  return [
    {
      target: ".ss-head",
      title: "The question",
      text: (
        <p>
          The math problem the student was working on, with its answer choices.
          The correct answer is marked, so you can tell straight away when the
          student is right and when they are wrong.
        </p>
      ),
      why: "You can only judge a tutor's reply once you know where the student went wrong.",
    },
    {
      target: ".ss-watch",
      title: "What to watch for",
      text: <p>One thing to keep in mind as you read this session.</p>,
      why: "Reading with a question in mind helps you notice the tutor's choices, not only the chat.",
    },
    {
      target: ".ss-moments-row",
      title: "Key moments",
      text: (
        <p>
          The {n} {n === 1 ? "turn" : "turns"} worth pausing on, picked from the
          moments just after the student speaks: when they are stuck, give a
          wrong answer, or have a go. Click one to jump straight to it.
        </p>
      ),
      why: "A whole transcript is a lot to take in. These are the points where the tutor's next move matters most.",
    },
    {
      target: ".ss-strip",
      title: "Who's doing the thinking",
      text: (
        <p>
          One mark per message, left to right. Bars above the line are the
          tutor: short and light when the student was left to think, tall and
          dark when the tutor took the thinking over. Marks below the line are
          the student. Dots mark the key moments.
        </p>
      ),
      why: "It shows at a glance where the tutor stepped in and where the student carried the work.",
    },
    {
      target: ".ss-convo",
      title: "The conversation",
      text: (
        <p>
          The whole chat, with names changed. Tutor messages are on the left,
          the student's on the right, and a numbered badge marks each key
          moment. Click any tutor message to see how it was labelled.
        </p>
      ),
      why: "The real words, so you can read each moment in the context it happened in.",
    },
    {
      target: ".ss-side, .ss-inline",
      title: "What this moment shows",
      text: (
        <>
          <p>
            For the chosen moment: what the student said, what the tutor did,
            the name of that teaching move, and what the student did next.
          </p>
          <p>
            Underlined move names open the dictionary. Use Previous and Next at
            the bottom to step through the moments.
          </p>
        </>
      ),
      why: "Seeing the move alongside what happened next is how you learn which moves keep the student thinking.",
    },
    {
      target: ".ss-switch",
      title: "Try it yourself",
      text: (
        <p>
          Turn this on and the conversation stops just after the student speaks.
          Write what you would say, then reveal what the tutor did and compare.
        </p>
      ),
      why: "Deciding for yourself first is the practice. Reading the answer straight away is easier but teaches less.",
    },
    {
      title: "That's the tour",
      text: (
        <p>
          {at === 1
            ? `You're on key moment 1 of ${n}. Read it, then use Next moment to step through the rest, or turn on Try it yourself and have a go first.`
            : at
              ? `You're on key moment ${at} of ${n}. Read what happens next, then go back to moment 1 and read from the start.`
              : "Pick a key moment above to begin, or turn on Try it yourself and have a go first."}{" "}
          Every session in the library works the same way.
        </p>
      ),
      done: "Start reading",
    },
  ];
}

/* ------------------------------------------------------------------ page */

export default function Session() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  if (!findSession(id)) {
    return (
      <Shell crumbs={[{ label: "Math", to: "/subjects" }]}>
        <main className="page">
          <p className="page-lede">No such session.</p>
        </main>
      </Shell>
    );
  }
  // Keyed so that moving to another session (or another deep-linked turn)
  // starts fresh, rather than carrying the old selection across.
  // ?tour=1 comes only from the front door's "Start here" card. Ending the
  // tour drops it, so a refresh or a shared link opens the plain session.
  const endTour = () => {
    const next = new URLSearchParams(params);
    next.delete("tour");
    setParams(next, { replace: true });
  };
  return (
    <SessionScreen
      key={`${id}:${params.get("turn") ?? ""}`}
      id={id}
      params={params}
      tour={params.get("tour") === "1"}
      endTour={endTour}
    />
  );
}

function SessionScreen({ id, params, tour, endTour }) {
  const session = findSession(id);
  const narrow = useNarrow();

  const classified = useMemo(() => session.msgs.filter((m) => m.x), [session]);
  const moments = useMemo(() => keyMoments(session), [session]);
  const keyByN = useMemo(() => new Map(moments.map((m) => [m.n, m])), [moments]);

  const cameFrom = findMove(params.get("from"));
  const wanted = Number(params.get("turn"));
  const deepLinked = classified.some((m) => m.n === wanted);

  const [focus, setFocus] = useState(
    deepLinked ? wanted : moments[0]?.n ?? classified[0]?.n ?? null
  );
  // Walking key moments is the default; arriving from a move page, where the
  // point is the move itself, walks every labelled turn instead.
  const [stepAll, setStepAll] = useState(Boolean(cameFrom) || moments.length === 0);
  const [trying, setTrying] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [drafts, setDrafts] = useState({});
  const [hot, setHot] = useState(null);
  // The classifier's cue phrases are research detail: they are marked in the
  // conversation only while "How this was labelled" is open.
  const [howOpen, setHowOpen] = useState(false);
  const [flash, setFlash] = useState(null);
  // Bumped whenever the page should bring a turn into view: stepping, the
  // timeline, the key-moment list. Clicking a turn directly never scrolls.
  const [jump, setJump] = useState(deepLinked ? { n: wanted, instant: true } : null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(t);
  }, [flash]);

  // Two ways in, and each keeps its own trail. Arriving from a move steps
  // through that move's examples; arriving from a grade steps through that
  // grade's questions.
  let crumbs;
  let back;
  let prev;
  let next;
  let position;

  if (cameFrom) {
    const list = cameFrom.examples.concat(cameFrom.contested);
    const at = list.findIndex((e) => e.sid === id && e.n === wanted);
    const link = (e) =>
      `/mathematics/s/${e.sid}?turn=${e.n}&from=${cameFrom.code}`;
    crumbs = [
      { label: "Research", to: "/research" },
      { label: cameFrom.name, to: `/research/m/${cameFrom.code}` },
      { label: session.topic },
    ];
    back = { to: `/research/m/${cameFrom.code}`, label: `All ${cameFrom.name.toLowerCase()} examples` };
    prev = at > 0 ? { to: link(list[at - 1]), label: list[at - 1].topic } : null;
    next =
      at >= 0 && at < list.length - 1
        ? { to: link(list[at + 1]), label: list[at + 1].topic }
        : null;
    position =
      at >= 0
        ? `Example ${at + 1} of ${list.length}`
        : `One of ${list.length} examples`;
  } else {
    const n = neighbours(id);
    crumbs = [
      { label: "Math", to: "/subjects" },
      { label: grades[String(session.grade)], to: `/mathematics/g/${session.grade}` },
      { label: session.topic },
    ];
    back = {
      to: `/mathematics/g/${session.grade}`,
      label: `All ${grades[String(session.grade)]} questions`,
    };
    prev = n.prev && { to: `/mathematics/s/${n.prev.id}`, label: n.prev.topic };
    next = n.next && { to: `/mathematics/s/${n.next.id}`, label: n.next.topic };
    position = `Question ${n.index} of ${n.total} at this grade`;
  }

  const msgs = session.msgs;
  const focused = msgs.find((m) => m.n === focus) ?? null;
  const moment = keyByN.get(focus) ?? null;
  const clues = focused?.x?.clues ?? [];

  // Try-it mode: on an unrevealed key moment, the conversation stops at the
  // student's message, so the reader answers before seeing the tutor's reply.
  const hiding = trying && moment && !revealed[moment.n];
  const hideAfter = hiding ? msgs.findIndex((m) => m.n === moment.cue) : null;

  // A layout effect, so the box has its new content measured before it moves.
  useLayoutEffect(() => {
    if (!jump || !scriptRef.current) return;
    const find = (n) => scriptRef.current.querySelector(`[data-turn="${n}"]`);
    // A key moment starts with what the student said (the wrong answer, the
    // "I'm stuck"), so that line goes to the top of the box and the tutor's
    // reply and what happened next read on below it. Any other turn goes to
    // the top itself. In try-it mode the student's line is all that shows.
    const km = keyByN.get(jump.n);
    const el =
      (km && find(km.cue)) ||
      find(jump.n) ||
      (hideAfter !== null ? find(msgs[hideAfter].n) : null);
    if (!el) return;
    // The conversation scrolls in its own box, so only that box moves.
    const box = scriptRef.current;
    const top =
      el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTo({
      top: Math.max(0, top - 10),
      behavior: jump.instant || reducedMotion() ? "auto" : "smooth",
    });
  }, [jump]); // eslint-disable-line react-hooks/exhaustive-deps

  // The stepper walks key moments, or every labelled turn.
  const walkAll = stepAll && !trying && classified.length > 0;
  const stops = walkAll ? classified.map((m) => m.n) : moments.map((m) => m.n);
  const order = (n) => msgs.findIndex((m) => m.n === n);
  const here = order(focus);
  const prevStop = [...stops].reverse().find((n) => order(n) < here) ?? null;
  const nextStop = stops.find((n) => order(n) > here) ?? null;
  const stopAt = stops.indexOf(focus);

  function select(n, { scroll = false } = {}) {
    setFocus(n);
    setHot(null);
    if (scroll) setJump({ n });
  }

  function pickFromTimeline(m) {
    if (m.x) {
      select(m.n, { scroll: true });
    } else {
      setFlash(m.n);
      setJump({ n: m.n });
    }
  }

  function toggleTrying() {
    const on = !trying;
    setTrying(on);
    // Trying works on key moments; land on one if the reader is elsewhere.
    if (on) select(keyByN.has(focus) ? focus : moments[0].n, { scroll: true });
  }

  const situation = focused ? situationFor(session, focused.n, moments) : null;

  const unit = walkAll ? "labelled turn" : "moment";
  const stepper = (
    <nav className="ss-stepper" aria-label="Step through">
      {/* Arriving from a move page, a researcher may want every labelled
          turn; everyone else just walks the key moments. */}
      {cameFrom && moments.length > 0 && classified.length > 0 && !trying && (
        <div className="ss-mode" role="group" aria-label="Step through">
          <button aria-pressed={!stepAll} onClick={() => setStepAll(false)}>
            Key moments
          </button>
          <button aria-pressed={stepAll} onClick={() => setStepAll(true)}>
            All labelled
          </button>
        </div>
      )}
      <div className="ss-steps">
        <button
          className="ss-stepbtn"
          onClick={() => prevStop !== null && select(prevStop, { scroll: true })}
          disabled={prevStop === null}
        >
          ← Previous
        </button>
        <button
          className="ss-stepbtn ss-next"
          onClick={() => nextStop !== null && select(nextStop, { scroll: true })}
          disabled={nextStop === null}
        >
          {nextStop === null
            ? walkAll
              ? "Last labelled turn"
              : "That was the last moment"
            : `Next ${unit} →`}
        </button>
      </div>
    </nav>
  );

  const detail = focused?.x ? (
    <Detail
      session={session}
      focused={focused}
      moment={moment}
      moments={moments}
      situation={situation}
      trying={Boolean(hiding)}
      draft={drafts[focused.n] ?? ""}
      setDraft={(v) => setDrafts((d) => ({ ...d, [focused.n]: v }))}
      reveal={() => setRevealed((r) => ({ ...r, [focused.n]: true }))}
      hot={hot}
      setHot={setHot}
      howOpen={howOpen}
      setHowOpen={setHowOpen}
      stepper={stepper}
    />
  ) : (
    <p className="ss-empty">
      Choose a tutor message to see what the student had just said, what the
      tutor did, and what happened next.
    </p>
  );

  // Where the inline detail goes on a phone: under the chosen turn, or under
  // the student's message when the tutor's reply is hidden.
  const inlineAt = narrow ? (hiding ? moment.cue : focus) : null;

  let lastSpeaker = null;

  return (
    <Shell
      crumbs={crumbs}
      tint={cameFrom ? RESEARCH_TINT : MATH_TINT}
      aside={<TopNav back={back} prev={prev} next={next} />}
    >
      <main className="page wide ss-page">
        <QuestionHeader session={session} position={position} watch={framing(moments)} />

        {/* ------------- before reading: a question to hold in mind ------- */}
        <section className="ss-frame" aria-label="Key moments">
          <div className="ss-frame-top">
            {moments.length > 0 && (
              <div className="ss-moments-row">
                <p className="ss-moments-lbl" id="ss-moments-lbl">
                  Step through {moments.length} key moments
                </p>
                <ol className="ss-moments" aria-labelledby="ss-moments-lbl">
                  {moments.map((km) => {
                    const cue = msgs.find((m) => m.n === km.cue);
                    return (
                      <li key={km.n}>
                        <button
                          className={`ss-moment${km.n === focus ? " on" : ""}`}
                          aria-current={km.n === focus ? "true" : undefined}
                          title={`${km.situation}${cue ? `: “${cue.s.trim()}”` : ""}`}
                          onClick={() => select(km.n, { scroll: true })}
                        >
                          <span className="ss-knum">{km.num}</span>
                          <span className="ss-moment-sit">{SHORT[km.kind] ?? km.situation}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
            {moments.length > 0 && (
              <button
                className="ss-switch"
                role="switch"
                aria-checked={trying}
                onClick={toggleTrying}
                title="At each key moment, write what you would say before seeing the tutor's reply."
              >
                <span className="ss-switch-track" aria-hidden="true">
                  <span className="ss-switch-knob" />
                </span>
                Try it yourself
              </button>
            )}
          </div>
          {trying && (
            <p className="ss-try-note">
              The conversation stops where the student has just spoken. Write
              what you would say, then reveal what the tutor did.
            </p>
          )}
        </section>

        <Timeline
          msgs={msgs}
          focus={focus}
          keyByN={keyByN}
          hideAfter={hideAfter}
          onPick={pickFromTimeline}
        />

        <div className="ss-body">
          {/* ---------------- the conversation ------------------------- */}
          <section className="ss-convo" aria-label="Tutoring conversation">
            <div className="ss-script" ref={scriptRef} role="log" tabIndex={0} aria-label="Conversation, scrolls on its own">
              {msgs.map((m, i) => {
                if (hideAfter !== null && i > hideAfter) return null;
                const who = m.t ? "tutor" : "student";
                const firstOfRun = who !== lastSpeaker;
                lastSpeaker = who;
                const on = m.n === focus;
                const km = keyByN.get(m.n);
                const showChip = m.x && on;
                const text = m.s.trim();
                const body = on && m.x ? <Marked text={text} clues={howOpen ? clues : []} hot={hot} /> : text;

                const inner = (
                  <>
                    <span className="ss-said">{body}</span>
                    {showChip && (
                      <span className="ss-chips">
                        {m.m.map((code) => (
                          <MoveTerm className="ss-chip" code={code} key={code} clickable={false}>
                            {moveName(code)}
                          </MoveTerm>
                        ))}
                      </span>
                    )}
                  </>
                );

                return (
                  <div key={m.n}>
                    <div
                      data-turn={m.n}
                      className={`ss-msg ${who}${on ? " on" : ""}${km ? " key" : ""}${
                        m.x ? " labelled" : ""
                      }${flash === m.n ? " flash" : ""}${firstOfRun ? " first" : ""}`}
                    >
                      {firstOfRun && <p className="ss-who">{m.t ? "Tutor" : "Student"}</p>}
                      <div className="ss-row">
                        {km && (
                          <span
                            className="ss-knum ss-kbadge"
                            title={`Key moment ${km.num}: ${km.situation}`}
                          >
                            {km.num}
                          </span>
                        )}
                        {m.x ? (
                          <button
                            className="ss-bubble"
                            aria-pressed={on}
                            aria-label={`Message ${m.n}, tutor. ${on ? "Shown" : "Show"} in the side panel.`}
                            onClick={() => select(m.n)}
                          >
                            {inner}
                          </button>
                        ) : (
                          <div className="ss-bubble">{inner}</div>
                        )}
                        <span className="ss-seq" aria-hidden="true">{m.n}</span>
                      </div>
                    </div>
                    {inlineAt === m.n && <div className="ss-inline">{detail}</div>}
                  </div>
                );
              })}
              {hiding && (
                <p className="ss-cut">
                  The rest of the conversation is hidden until you reveal what
                  the tutor did.
                </p>
              )}
            </div>
          </section>

          {/* ---------------- what this turn shows --------------------- */}
          {!narrow && (
            <aside className="ss-side" aria-label="About the chosen turn">
              {detail}
            </aside>
          )}
        </div>
      </main>
      {tour && <Tour steps={tourSteps(session, moments, focus)} onClose={endTour} />}
    </Shell>
  );
}
