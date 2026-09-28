import { Link } from "react-router-dom";

import { allGrades, gradeColor, stats } from "../data/corpus.js";
import { subjects } from "../data/subjects.js";
import "./subjects.css";

/* Choose a subject.

   Only Math has sessions, so Math is the page: one wide card whose grade
   row goes straight to each grade that has questions. Every other subject
   sits underneath as a quiet list of what is coming, so the board sees the
   intended shape without it competing with the one thing that works. */

const open = subjects.filter((s) => s.available);
const later = subjects.filter((s) => !s.available);

function GradeRow({ path }) {
  return (
    <ol className="sp-grades" aria-label="Grades">
      {allGrades.map((g) =>
        g.available ? (
          <li key={g.grade}>
            <Link
              className="sp-grade is-open"
              to={`${path}/g/${g.grade}`}
              style={{ "--g": gradeColor[g.grade] }}
              aria-label={`${g.label}: ${g.count} ${g.count === 1 ? "session" : "sessions"}`}
            >
              <span className="sp-grade-n">{g.grade}</span>
              <span className="sp-grade-count">
                {g.count} {g.count === 1 ? "session" : "sessions"}
              </span>
            </Link>
          </li>
        ) : (
          <li key={g.grade}>
            <span className="sp-grade" title={`${g.label}: no sessions yet`}>
              <span className="sp-grade-n">{g.grade}</span>
              <span className="sp-grade-count">None yet</span>
            </span>
          </li>
        )
      )}
    </ol>
  );
}

function Featured({ subject }) {
  const Icon = subject.icon;
  return (
    <section
      className="sp-feature"
      style={{
        "--ink-tint": subject.tint.ink,
        "--wash": subject.tint.wash,
        "--line-tint": subject.tint.line,
      }}
      aria-labelledby={`sp-${subject.id}`}
    >
      <div className="sp-feature-head">
        <span className="sp-feature-icon" aria-hidden="true">
          <Icon />
        </span>
        <div className="sp-feature-title">
          <h2 id={`sp-${subject.id}`}>{subject.name}</h2>
          <p>{subject.blurb}</p>
        </div>
      </div>

      <p className="sp-feature-ask">
        Pick a grade to see the questions students got stuck on.
      </p>
      <GradeRow path={subject.path} />

      <p className="sp-feature-foot">
        {stats.sessions} tutoring sessions, all de-identified, from Eedi
        through the National Tutoring Observatory.
      </p>
    </section>
  );
}

function Later() {
  return (
    <section className="sp-later" aria-labelledby="sp-later-h">
      <h2 id="sp-later-h">Coming later</h2>
      <ul>
        {later.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.id} style={{ "--ink-tint": s.tint.ink }} title={s.blurb}>
              <span className="sp-later-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="sp-later-name">{s.name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Landing() {
  return (
    <main className="landing sp-page">
      <div className="topbar">
        <Link className="org-home" to="/" title="Back to the start">
          <span className="org-mark" aria-hidden="true" />
          <span className="org">National Tutoring Observatory</span>
        </Link>
        <Link className="researcher-link" to="/">
          ← Choose a different view
        </Link>
      </div>

      <div className="sp-wrap">
        <header className="sp-head">
          <h1>Choose a subject</h1>
          <p>
            {open.length === 1
              ? `${open[0].name} is the first subject in the library.`
              : "These subjects are in the library so far."}
          </p>
        </header>

        {open.map((s) => (
          <Featured key={s.id} subject={s} />
        ))}

        {later.length > 0 && <Later />}
      </div>
    </main>
  );
}
