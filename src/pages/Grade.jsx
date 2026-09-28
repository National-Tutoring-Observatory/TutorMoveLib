import { Link, useParams, useSearchParams } from "react-router-dom";

import Shell from "../components/Shell.jsx";
import { QuestionCard } from "../components/QuestionCard.jsx";
import {
  allGrades,
  gradeColor,
  grades,
  rungColor,
  sessionsByGrade,
} from "../data/corpus.js";
import { kindsOf, slugify } from "../data/topics.js";
import "./grade.css";
import "./topic.css";

/* Choose a question.

   Each card previews how its session went before you open it: a thin
   thinking strip (one mark per message, taller and darker where the tutor
   took over) and the situations at its key moments. Grades switch in place
   from the row at the top, so nobody has to go back up a level. */

function GradeSwitch({ current }) {
  return (
    <nav className="gr-switch" aria-label="Grades">
      {allGrades
        .filter((g) => g.available)
        .map((g) =>
          g.grade === current ? (
            <span
              key={g.grade}
              className="gr-switch-g is-on"
              style={{ "--g": gradeColor[g.grade] }}
              aria-current="page"
            >
              {g.grade}
            </span>
          ) : (
            <Link
              key={g.grade}
              className="gr-switch-g"
              style={{ "--g": gradeColor[g.grade] }}
              to={`/mathematics/g/${g.grade}`}
              aria-label={g.label}
              title={`${g.label}: ${g.count} ${g.count === 1 ? "question" : "questions"}`}
            >
              {g.grade}
            </Link>
          )
        )}
    </nav>
  );
}

/* The left panel: every question in this grade, by topic and then by kind.
   A topic or a kind narrows the cards; the choice lives in the URL. */
function GradePanel({ label, total, byStrand, strandSlug, kindKey, base }) {
  const href = (strand, kind) => {
    const q = new URLSearchParams();
    if (strand) q.set("topic", strand);
    if (kind) q.set("kind", kind);
    const qs = q.toString();
    return qs ? `${base}?${qs}` : base;
  };
  return (
    <nav className="tp-panel" aria-label={`${label} questions`}>
      <p className="tp-panel-h">{label} questions</p>
      <ul className="tp-topics">
        <li className={!strandSlug ? "is-open" : ""}>
          <Link
            className="tp-topic"
            to={href()}
            aria-current={!strandSlug ? "true" : undefined}
          >
            <span>All questions</span>
            <span className="tp-n">{total}</span>
          </Link>
        </li>
        {byStrand.map((st) => {
          const on = st.slug === strandSlug;
          return (
            <li key={st.slug} className={on ? "is-open" : ""}>
              <Link
                className="tp-topic"
                to={href(st.slug)}
                aria-current={on && !kindKey ? "true" : undefined}
              >
                <span>{st.name}</span>
                <span className="tp-n">{st.sessions.length}</span>
              </Link>
              <ul className="tp-kinds" aria-label={`Kinds of ${st.name.toLowerCase()} question`}>
                {st.kinds.map((k) => (
                  <li key={k.key}>
                    <Link
                      className="tp-kind"
                      to={href(st.slug, k.key)}
                      aria-current={on && kindKey === k.key ? "true" : undefined}
                    >
                      <span>{k.name}</span>
                      <span className="tp-n">{k.sessions.length}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Grade() {
  const { grade } = useParams();
  const [params] = useSearchParams();
  const label = grades[grade];
  const list = sessionsByGrade(grade);
  const n = Number(grade);

  if (!label) {
    return (
      <Shell crumbs={[{ label: "Math", to: "/subjects" }]}>
        <main className="page">
          <p className="page-lede">No such grade level.</p>
        </main>
      </Shell>
    );
  }

  // Grouped by strand (the branch of math), and within it by kind of question.
  const byStrand = [...new Set(list.map((s) => s.strand))].map((name) => {
    const sessions = list.filter((s) => s.strand === name);
    return { name, slug: slugify(name), sessions, kinds: kindsOf(sessions) };
  });

  const strandSlug = byStrand.some((s) => s.slug === params.get("topic"))
    ? params.get("topic")
    : null;
  const current = byStrand.find((s) => s.slug === strandSlug) ?? null;
  const kind = current?.kinds.find((k) => k.key === params.get("kind")) ?? null;
  const shown = current ? [current] : byStrand;
  const base = `/mathematics/g/${grade}`;

  return (
    <Shell
      crumbs={[{ label: "Math", to: "/subjects" }, { label }]}
      aside={
        <Link className="gr-back" to="/subjects">
          ← All grades
        </Link>
      }
    >
      <main className="tp-page" style={{ "--g": gradeColor[n] }}>
        <GradePanel
          label={label}
          total={list.length}
          byStrand={byStrand}
          strandSlug={strandSlug}
          kindKey={kind?.key ?? null}
          base={base}
        />

        <div className="tp-main">
          <header className="gr-head">
            <div>
              <h1>{label} math</h1>
              <p>
                {list.length} {list.length === 1 ? "question" : "questions"} a
                student got stuck on. Open one to read the tutoring conversation.
              </p>
            </div>
            <GradeSwitch current={n} />
          </header>

          <p className="gr-legend" aria-hidden="true">
            <span className="gr-legend-strip">
              <i style={{ height: "5px", background: rungColor[1] }} />
              <i style={{ height: "10px", background: rungColor[3] }} />
              <i style={{ height: "15px", background: rungColor[5] }} />
              <i style={{ height: "18px", background: rungColor[6] }} />
            </span>
            Each strip is one session, a mark per message. Taller, darker marks
            are where the tutor took over the thinking.
          </p>

          {shown.map((st, i) => {
            const cards = kind ? kind.sessions : st.sessions;
            return (
              <section className="gr-strand" key={st.slug} aria-labelledby={`gr-s${i}`}>
                <h2 id={`gr-s${i}`}>
                  {st.name}
                  {kind && <> · {kind.name}</>}
                  <span>{cards.length}</span>
                  {(current || kind) && (
                    <Link className="gr-all gr-clear" to={base}>
                      Show all {label.toLowerCase()} questions
                    </Link>
                  )}
                </h2>
                <ul className="gr-cards">
                  {cards.map((s) => (
                    <QuestionCard key={s.id} s={s} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </Shell>
  );
}
