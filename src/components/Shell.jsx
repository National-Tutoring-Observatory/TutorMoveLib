import { Link } from "react-router-dom";

import { DictionaryButton } from "./Dictionary.jsx";
import Brand from "./Brand.jsx";
import SiteFooter from "./SiteFooter.jsx";
import useTitle from "../hooks/useTitle.js";

// Math's colour from the landing page, carried through the subject section so
// the subject keeps its identity once you are inside it.
export const MATH_TINT = {
  "--ink-tint": "#1a6768",
  "--wash": "#ebf4f1",
  "--line-tint": "#bcd8d1",
};

// The researcher path gets its own accent so it never reads as a subject:
// plum, the same colour as its row on the front page.
export const RESEARCH_TINT = {
  "--ink-tint": "#6b3d8f",
  "--wash": "#f4eef8",
  "--line-tint": "#dccbe8",
};

// `aside` is optional page navigation, drawn at the right end of the top bar.
export default function Shell({ crumbs = [], tint = MATH_TINT, aside = null, children }) {
  useTitle(crumbs.length ? crumbs[crumbs.length - 1].label : null);
  return (
    <div className="shell" style={tint}>
      <header className="topbar">
        <Brand />
        <DictionaryButton className="topbar-dict" />
        <nav className="crumbs" aria-label="You are here">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="sep" aria-hidden="true">/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <b aria-current="page">{c.label}</b>}
            </span>
          ))}
        </nav>
        {aside && <div className="topbar-aside">{aside}</div>}
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}
