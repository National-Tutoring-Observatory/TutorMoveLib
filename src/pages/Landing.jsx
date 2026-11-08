import { Link } from "react-router-dom";

import { allGrades, gradeColor, sessionsByGrade } from "../data/corpus.js";
import { subjects } from "../data/subjects.js";
import "./subjects.css";
import Brand from "../components/Brand.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import useTitle from "../hooks/useTitle.js";

/* Choose a subject and grade.

   Only Math has sessions, so Math is the page: one card whose grade tiles go
   straight to each grade that has questions, each saying what is in it. The
   grades with nothing yet are one line, not empty tiles. Every other subject
   sits underneath as a quiet row of what is coming. */

const open = subjects.filter((s) => s.available);
const later = subjects.filter((s) => !s.available);

// A grade's strands, commonest first: the two biggest, then how many more.
function strandLine(grade) {
  const count = {};
  sessionsByGrade(grade).forEach((x) => (count[x.strand] = (count[x.strand] || 0) + 1));
  const names = Object.keys(count).sort((a, b) => count[b] - count[a]);
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const shown = names.slice(0, 2).map((t, i) => (i === 0 ? t : lower(t))).join(", ");
  const more = names.length - 2;
  return more > 0 ? `${shown} and ${more} more` : shown;
}

function listGrades(gs) {
  const n = gs.map((g) => g.grade);
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}` : `${n[0]}`;
}

function GradeRow({ path }) {
  const open = allGrades.filter((g) => g.available);
  const empty = allGrades.filter((g) => !g.available);
  return (
    <>
      <ol className="sp-grades" aria-label="Grades" style={{ "--n": open.length }}>
        {open.map((g) => (
          <li key={g.grade}>
            <Link
              className="sp-grade is-open"
              to={`${path}/g/${g.grade}`}
              style={{ "--g": gradeColor[g.grade] }}
              aria-label={`${g.label}: ${strandLine(g.grade)}`}
            >
              <span className="sp-grade-lbl">Grade</span>
              <span className="sp-grade-n">{g.grade}</span>
              <span className="sp-grade-strands">{strandLine(g.grade)}</span>
            </Link>
          </li>
        ))}
      </ol>
      {empty.length > 0 && (
        <p className="sp-grades-empty">
          {empty.length === 1 ? "Grade" : "Grades"} {listGrades(empty)}: no sessions yet.
        </p>
      )}
    </>
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
        <h2 id={`sp-${subject.id}`}>
          <span className="sp-feature-icon" aria-hidden="true">
            <Icon />
          </span>
          {subject.name}
        </h2>
        <p>{subject.blurb}</p>
      </div>

      <p className="sp-feature-ask">
        Pick a grade to see the questions students got stuck on.
      </p>
      <GradeRow path={subject.path} />
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
  useTitle("Choose a subject and grade");
  return (
    <main className="landing sp-page">
      <div className="topbar">
        <Brand />
        <Link className="researcher-link" to="/">
          Back to the front page
        </Link>
      </div>

      <div className="sp-wrap">
        <header className="sp-head">
          <h1>Choose a subject and grade</h1>
          <p>
            {open.length === 1
              ? `${open[0].name} is the first subject in Starling.`
              : "These subjects are in the library so far."}
          </p>
        </header>

        {open.map((s) => (
          <Featured key={s.id} subject={s} />
        ))}

        {later.length > 0 && <Later />}

      </div>
      <SiteFooter />
    </main>
  );
}
