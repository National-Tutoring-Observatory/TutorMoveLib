import { Link } from "react-router-dom";

import { DictionaryButton } from "./Dictionary.jsx";

// Math's colour from the landing page, carried through the subject section so
// the subject keeps its identity once you are inside it.
export const MATH_TINT = {
  "--ink-tint": "#4527a0",
  "--wash": "#f1eefb",
  "--line-tint": "#d2c7ed",
};

// The researcher path gets its own accent so it never reads as a subject.
export const RESEARCH_TINT = {
  "--ink-tint": "#2a78d6",
  "--wash": "#eef4fd",
  "--line-tint": "#c6daf1",
};

export default function Shell({ crumbs = [], tint = MATH_TINT, children }) {
  return (
    <div className="shell" style={tint}>
      <div className="topbar">
        <Link className="org-home" to="/" title="Back to the start">
          <span className="org-mark" aria-hidden="true" />
          <span className="org">National Tutoring Observatory</span>
        </Link>
        <DictionaryButton className="topbar-dict" />
        <nav className="crumbs">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="sep">/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <b>{c.label}</b>}
            </span>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
