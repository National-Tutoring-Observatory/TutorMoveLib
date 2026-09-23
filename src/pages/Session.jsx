import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { MoveTerm, MoveTerms } from "../components/Dictionary.jsx";
import NavRow from "../components/NavRow.jsx";
import Shell, { MATH_TINT, RESEARCH_TINT } from "../components/Shell.jsx";
import {
  findMove,
  findSession,
  grades,
  moveName,
  moves,
  neighbours,
  spectrum,
} from "../data/corpus.js";

// Split a message into plain text and highlighted clue spans, so hovering a
// cue on the right lights the matching words on the left.
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

function Tags({ msg }) {
  if (!msg.t) return <span className="tag none">Student</span>;
  if (msg.c) return <span className="tag unc">△ Uncertain</span>;
  if (!msg.m.length) return <span className="tag none">No move detected</span>;
  return msg.m.map((code) => (
    <MoveTerm className="tag move" code={code} key={code}>
      {moveName(code)}
    </MoveTerm>
  ));
}

function Spectrum({ code }) {
  const rung = moves[code]?.rung;
  if (!rung) return null;
  return (
    <div className="spec">
      <div className="spec-lbl">How much thinking stays with the student</div>
      <div className="spec-bar">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`spec-seg${i <= rung ? " fill" : ""}`} />
        ))}
      </div>
      <div className="spec-cap">
        <span>Student leads</span>
        <span>Tutor leads</span>
      </div>
      <div className="spec-now">{spectrum[String(rung)]}</div>
    </div>
  );
}

export default function Session() {
  const { id } = useParams();
  const session = findSession(id);
  const classified = useMemo(
    () => (session ? session.msgs.filter((m) => m.x) : []),
    [session]
  );
  // Arriving from a move page lands directly on the turn that demonstrates it.
  const [params] = useSearchParams();
  const wanted = Number(params.get("turn"));
  const [focus, setFocus] = useState(
    classified.some((m) => m.n === wanted) ? wanted : classified[0]?.n ?? null
  );
  const [hot, setHot] = useState(null);
  // Bumped only by the stepper, so walking the labelled turns scrolls the
  // conversation but clicking one directly never yanks it.
  // Start at 1 when deep-linked, so the effect below scrolls that turn into
  // view rather than leaving it selected somewhere off-screen.
  const [stepped, setStepped] = useState(wanted ? 1 : 0);
  const scriptRef = useRef(null);

  const here = classified.findIndex((m) => m.n === focus);
  const prevTurn = here > 0 ? classified[here - 1] : null;
  const nextTurn =
    here >= 0 && here < classified.length - 1 ? classified[here + 1] : null;

  function step(target) {
    if (!target) return;
    setFocus(target.n);
    setHot(null);
    setStepped((n) => n + 1);
  }

  useEffect(() => {
    if (!stepped || !scriptRef.current) return;
    const el = scriptRef.current.querySelector(`[data-turn="${focus}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [stepped, focus]);

  if (!session) {
    return (
      <Shell crumbs={[{ label: "Math", to: "/mathematics" }]}>
        <main className="page">
          <p className="page-lede">No such session.</p>
        </main>
      </Shell>
    );
  }

  // Two ways in, and each keeps its own trail. Arriving from a move steps
  // through that move's examples; arriving from a grade steps through that
  // grade's questions.
  const cameFrom = findMove(params.get("from"));
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
      { label: "Math", to: "/mathematics" },
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

  const focused = session.msgs.find((m) => m.n === focus);
  const clues = focused?.x?.clues ?? [];

  return (
    <Shell crumbs={crumbs} tint={cameFrom ? RESEARCH_TINT : MATH_TINT}>
      <main className="page wide">
        <NavRow back={back} prev={prev} next={next} />

        <div className="split">
          {/* ---------------- left: the question, then the conversation --- */}
          <section className="pane">
            <p className="pane-kicker">The question</p>
            <h2>{session.topic}</h2>
            <p className="meta">
              {[position, session.strand, `${session.msgs.length} messages`]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {/* Where the video clip sits in the wireframe. Until the clips are
                cleared for use, the question itself lives here — it is the
                context a teacher needs before reading a single turn. */}
            <div className="question">
              <div className="question-label">Question the student was stuck on</div>
              <p className="question-text">{session.question}</p>
              <p className="question-answer">
                <b>Answer</b> {session.answer}
              </p>
              {session.confidence === "inferred" && (
                <p className="question-note">
                  The question was shown as a diagram that is not part of the
                  transcript. This is a reconstruction from how the tutor talks
                  about it.
                </p>
              )}
            </div>

            <p className="legend">
              <span className="legend-key" /> Turns with a coloured edge can be
              opened — those are the ones the AI classified. Student turns and
              small talk stay flat.
            </p>

            {/* Scrolls in its own box, so the question above stays put. */}
            <div
              className="script"
              ref={scriptRef}
              role="log"
              aria-label="Tutoring conversation"
            >
              {session.msgs.map((m) => {
                const on = m.n === focus;
                const body =
                  on && focused?.x
                    ? segment(m.s, clues).map((p, i) =>
                        p.idx === undefined ? (
                          <span key={i}>{p.text}</span>
                        ) : (
                          <span
                            key={i}
                            className={`mark${hot === p.idx ? " lit" : ""}`}
                          >
                            {p.text}
                          </span>
                        )
                      )
                    : m.s;

                const inner = (
                  <>
                    <div className="said">{body}</div>
                    <div className="tagline">
                      <Tags msg={m} />
                    </div>
                  </>
                );

                return (
                  <div
                    key={m.n}
                    data-turn={m.n}
                    className={`turn${m.t ? "" : " student"}${on ? " focus" : ""}`}
                  >
                    <span className="seq">{m.n}</span>
                    {m.x ? (
                      <button
                        className="said-btn openable"
                        aria-pressed={on}
                        onClick={() => {
                          setFocus(m.n);
                          setHot(null);
                        }}
                      >
                        {inner}
                        <span className="openhint">
                          {on ? "Shown" : "Why?"}
                        </span>
                      </button>
                    ) : (
                      <div className="said-btn static">{inner}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------------- right: why this label ----------------------- */}
          <section className="pane">
            {focused?.x ? (
              <>
                <div className="pane-head">
                  <div>
                    <p className="pane-kicker">Why this label</p>
                    <h2>
                      Message {focused.n} ·{" "}
                      {focused.c
                        ? "two readings"
                        : <MoveTerms codes={focused.m} sep=" + " />}
                    </h2>
                  </div>
                  <div className="stepper">
                    <button
                      className="stepbtn"
                      onClick={() => step(prevTurn)}
                      disabled={!prevTurn}
                      title="Previous labelled turn"
                      aria-label="Previous labelled turn"
                    >
                      ←
                    </button>
                    <span className="stepcount">
                      {here + 1} / {classified.length}
                    </span>
                    <button
                      className="stepbtn"
                      onClick={() => step(nextTurn)}
                      disabled={!nextTurn}
                      title="Next labelled turn"
                      aria-label="Next labelled turn"
                    >
                      →
                    </button>
                  </div>
                </div>

                {focused.x.readings ? (
                  <>
                    <div className="uncbox">
                      <b>The AI is not confident here</b>
                      Two people trained on this framework labelled this turn
                      differently and never settled it. Rather than pick one and
                      look certain, the library shows you both readings.
                    </div>
                    {focused.x.readings.map((r, i) => (
                      <div className="reading" key={i}>
                        {r.move ? (
                          <MoveTerm className="tag move" code={r.move}>{moveName(r.move)}</MoveTerm>
                        ) : (
                          <span className="tag none">Not a move at all</span>
                        )}
                        <p>{r.why}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="why">{focused.x.why}</p>
                    <Spectrum code={focused.m[0]} />
                    <p className="defn">
                      <b><MoveTerm code={focused.m[0]}>{moveName(focused.m[0])}</MoveTerm></b> — {moves[focused.m[0]]?.def}
                    </p>
                  </>
                )}

                {clues.length > 0 && (
                  <>
                    <p className="meta top-gap">What the AI noticed</p>
                    {clues.map((cue, i) => (
                      <div
                        key={i}
                        className={`cue${hot === i ? " hot" : ""}`}
                        onMouseEnter={() => setHot(i)}
                        onMouseLeave={() => setHot(null)}
                      >
                        <span className="dot" />
                        <span>
                          {cue.q && <span className="cuephrase">{cue.q}</span>}
                          {cue.q && " — "}
                          {cue.why}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <p className="page-lede">
                Choose any tagged tutor message to see why it was classified
                that way.
              </p>
            )}
          </section>
        </div>
      </main>
    </Shell>
  );
}
