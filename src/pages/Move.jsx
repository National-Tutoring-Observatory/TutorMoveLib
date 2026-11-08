import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { MoveTerm } from "../components/Dictionary.jsx";
import NavRow from "../components/NavRow.jsx";
import Shell, { RESEARCH_TINT } from "../components/Shell.jsx";
import {
  categories,
  categoryColor,
  findMove,
  gradeColor,
  grades,
  moveName,
  rungColor,
  spectrum,
} from "../data/corpus.js";
import "./move.css";

/* One move, and every turn where it is demonstrated. The head says what the
   move is and where it sits on the thinking scale; the examples are a compact
   list (the tutor's words with the cue words marked in place), filtered by
   grade and shown 25 at a time, each row opening the session at that turn. */

const PAGE = 25;
const fmt = (n) => n.toLocaleString("en-US");

// Split a line into plain text and the cue words, so the cues are marked
// inside the sentence instead of listed apart from it.
function marked(text, clues = []) {
  const spans = [];
  clues.forEach((c) => {
    if (!c.q) return;
    const at = text.indexOf(c.q);
    if (at < 0) return;
    const end = at + c.q.length;
    if (spans.some((s) => at < s.end && end > s.start)) return;
    spans.push({ start: at, end, why: c.why });
  });
  spans.sort((a, b) => a.start - b.start);
  const out = [];
  let i = 0;
  spans.forEach((s, k) => {
    if (s.start > i) out.push(text.slice(i, s.start));
    out.push(
      <mark key={k} title={s.why}>
        {text.slice(s.start, s.end)}
      </mark>
    );
    i = s.end;
  });
  if (i < text.length) out.push(text.slice(i));
  return out;
}

function Scale({ rung }) {
  if (!rung) return null;
  return (
    <section className="mv-scale" aria-labelledby="mv-scale-h">
      <h2 id="mv-scale-h" className="mv-sub">Who does the thinking</h2>
      <ol className="mv-scale-bar" aria-label="Thinking scale, from student to tutor">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li
            key={i}
            className={i === rung ? "is-on" : ""}
            style={{ "--r": rungColor[i] }}
            title={spectrum[String(i)]}
            aria-current={i === rung ? "true" : undefined}
          >
            <span className="sr-only">{spectrum[String(i)]}</span>
          </li>
        ))}
      </ol>
      <div className="mv-scale-cap">
        <span>Student holds the thinking</span>
        <span>Tutor has taken it over</span>
      </div>
      <p className="mv-scale-now">
        This move: <b>{spectrum[String(rung)]}</b>
      </p>
    </section>
  );
}

function ExampleRow({ ex, onOpen, note }) {
  return (
    <li>
      <button type="button" className="mv-row" onClick={() => onOpen(ex)}>
        <span className="mv-said">“{marked(ex.text, ex.clues)}”</span>
        <span className="mv-where">
          <span className="mv-grade" style={{ "--g": gradeColor[ex.grade] }}>
            {grades[String(ex.grade)]}
          </span>
          <span className="mv-topic">{ex.topic}</span>
          <span className="mv-msg">Message {ex.n}</span>
        </span>
        {note}
        {ex.why && <span className="mv-why">{ex.why}</span>}
        {ex.alsoTagged?.length > 0 && (
          <span className="mv-also">
            Also labelled{" "}
            {ex.alsoTagged.map((c, i) => (
              <span key={c}>
                {i > 0 && ", "}
                <MoveTerm code={c} clickable={false}>
                  {moveName(c)}
                </MoveTerm>
              </span>
            ))}
          </span>
        )}
      </button>
    </li>
  );
}

export default function Move() {
  const { code } = useParams();
  const navigate = useNavigate();
  const move = findMove(code);
  const [grade, setGrade] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const byGrade = useMemo(() => {
    const m = {};
    (move?.examples ?? []).forEach((e) => (m[e.grade] = (m[e.grade] || 0) + 1));
    return Object.keys(m)
      .map(Number)
      .sort((a, b) => a - b)
      .map((g) => ({ g, n: m[g] }));
  }, [move]);

  if (!move) {
    return (
      <Shell crumbs={[{ label: "Research", to: "/research" }]} tint={RESEARCH_TINT}>
        <main className="page">
          <p className="page-lede">No such move in this corpus.</p>
        </main>
      </Shell>
    );
  }

  // Carry the move along, so the session page can send you back to it rather
  // than dumping you in the grade listing you never came from.
  const open = (ex) => navigate(`/mathematics/s/${ex.sid}?turn=${ex.n}&from=${move.code}`);

  const list = grade === "all" ? move.examples : move.examples.filter((e) => e.grade === grade);
  const visible = list.slice(0, shown);
  const left = list.length - visible.length;
  const pick = (g) => {
    setGrade(g);
    setShown(PAGE);
  };

  return (
    <Shell crumbs={[{ label: "Research", to: "/research" }, { label: move.name }]} tint={RESEARCH_TINT}>
      <main className="page mv-page" style={{ "--cat": categoryColor[move.category] }}>
        <NavRow back={{ to: "/research", label: "All tutoring moves" }} />

        <header className="mv-head">
          <p className="mv-group">{categories[move.category]}</p>
          <h1 className="page-h1">{move.name}</h1>
          <p className="mv-def">{move.def}</p>
          <p className="mv-stats">
            <span>
              <b>{fmt(move.examples.length)}</b> {move.examples.length === 1 ? "example" : "examples"}
              {move.contested.length > 0 && <>, {move.contested.length} contested</>}
            </span>
            <span className="mv-code">Code {move.code}</span>
          </p>
        </header>

        <Scale rung={move.rung} />

        <section className="mv-examples" aria-labelledby="mv-ex-h">
          <div className="mv-ex-head">
            <h2 id="mv-ex-h" className="mv-sub">Examples</h2>
            {byGrade.length > 1 && (
              <div className="mv-filter" role="group" aria-label="Filter by grade">
                <button type="button" aria-pressed={grade === "all"} onClick={() => pick("all")}>
                  All <span>{fmt(move.examples.length)}</span>
                </button>
                {byGrade.map(({ g, n }) => (
                  <button
                    type="button"
                    key={g}
                    aria-pressed={grade === g}
                    style={{ "--g": gradeColor[g] }}
                    onClick={() => pick(g)}
                  >
                    {grades[String(g)]} <span>{n}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mv-hint">Cue words the label keyed on are marked. Open any row to read it in its session.</p>

          <ol className="mv-rows">
            {visible.map((ex) => (
              <ExampleRow key={`${ex.sid}-${ex.n}`} ex={ex} onOpen={open} />
            ))}
          </ol>
          {left > 0 && (
            <button type="button" className="mv-more" onClick={() => setShown((s) => s + PAGE)}>
              Show {Math.min(PAGE, left)} more <span>({fmt(left)} left)</span>
            </button>
          )}
        </section>

        {move.contested.length > 0 && (
          <section className="mv-examples" aria-labelledby="mv-c-h">
            <h2 id="mv-c-h" className="mv-sub">Where annotators did not agree</h2>
            <p className="mv-hint">
              These turns were not counted as examples. Two people trained on this framework
              considered {move.name.toLowerCase()} and did not settle it.
            </p>
            <ol className="mv-rows">
              {move.contested.map((ex) => (
                <ExampleRow
                  key={`c-${ex.sid}-${ex.n}`}
                  ex={ex}
                  onOpen={open}
                  note={
                    <span className="mv-why">
                      {ex.against.length > 0 ? (
                        <>
                          One annotator read this as <b>{move.name}</b>, the other as{" "}
                          <b>{ex.against.map((c) => moveName(c)).join(", ")}</b>.
                        </>
                      ) : (
                        <>
                          One annotator read this as <b>{move.name}</b>; the other saw no move here.
                        </>
                      )}
                    </span>
                  }
                />
              ))}
            </ol>
          </section>
        )}
      </main>
    </Shell>
  );
}
