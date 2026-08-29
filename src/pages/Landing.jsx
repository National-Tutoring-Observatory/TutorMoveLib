import { Link, useNavigate } from "react-router-dom";

import { subjects } from "../data/subjects.js";
import useFanOut from "../hooks/useFanOut.js";

function SubjectCard({ subject, navigate }) {
  const Icon = subject.icon;
  const tint = {
    "--ink-tint": subject.tint.ink,
    "--wash": subject.tint.wash,
    "--line-tint": subject.tint.line,
  };

  if (!subject.available) {
    return (
      <div
        className="subject locked"
        style={tint}
        aria-disabled="true"
        title={`${subject.name} is not part of this preview yet`}
      >
        <div className="icon">
          <Icon />
        </div>
        <div>
          <h3>{subject.name}</h3>
          <p className="blurb">{subject.blurb}</p>
        </div>
        <div className="foot">
          <span className="soon">Coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <button
      className="subject"
      style={tint}
      onClick={() => navigate(subject.path)}
    >
      <div className="icon">
        <Icon />
      </div>
      <div>
        <h3>{subject.name}</h3>
        <p className="blurb">{subject.blurb}</p>
      </div>
      <div className="foot">
        <span className="stat">5 of 12 grade levels</span>
        <span className="go">
          Explore <span className="arrow">→</span>
        </span>
      </div>
    </button>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { ref: gridRef, ready } = useFanOut(subjects.length);

  return (
    <main className="landing">
      <div className="topbar">
        <Link className="org-home" to="/" title="Back to the start">
          <span className="org-mark" aria-hidden="true" />
          <span className="org">National Tutoring Observatory</span>
        </Link>
        <Link className="researcher-link" to="/">
          ← Choose a different view
        </Link>
      </div>

      <header className="landing-top">
        <h1>Choose a subject</h1>
      </header>

      <div className="landing-body">
        <div className={`grid${ready ? " ready" : ""}`} ref={gridRef}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
