import { useNavigate } from "react-router-dom";

import NavRow from "../components/NavRow.jsx";
import { MoveTerm } from "../components/Dictionary.jsx";
import Shell, { RESEARCH_TINT } from "../components/Shell.jsx";
import { categoryColor, moveGroups } from "../data/corpus.js";
import "./research.css";

/* The taxonomy as it appears in the corpus. Four cards at the top give each
   group's share of every label, each with its own bar on a 0 to 100% scale,
   so the groups compare at a glance; then each
   group is a panel of its moves, two panels to a row, every bar on the one
   scale so a bar in one group can be read against a bar in another. */

const PAPER_URL = "https://arxiv.org/abs/2603.05778";

const fmt = (n) => n.toLocaleString("en-US");

export default function Research() {
  const navigate = useNavigate();
  const widest = Math.max(...moveGroups.flatMap((g) => g.moves.map((m) => m.examples.length)));
  const moveCount = moveGroups.reduce((n, g) => n + g.moves.length, 0);
  const allTurns = moveGroups.reduce((n, g) => n + g.total, 0);
  const pct = (n) => {
    const p = (n / allTurns) * 100;
    return p < 1 ? "<1%" : `${Math.round(p)}%`;
  };
  // Two columns balanced by row count (biggest group first into the shorter
  // column), each keeping the page's order; on a phone they unwrap into one.
  const cols = [[], []];
  const load = [0, 0];
  [...moveGroups]
    .map((g, i) => ({ g, i }))
    .sort((a, b) => b.g.moves.length - a.g.moves.length)
    .forEach(({ g, i }) => {
      const c = load[0] <= load[1] ? 0 : 1;
      cols[c].push({ g, i });
      load[c] += g.moves.length + 2;
    });
  cols.forEach((c) => c.sort((a, b) => a.i - b.i));

  return (
    <Shell crumbs={[{ label: "Research" }]} tint={RESEARCH_TINT}>
      <main className="page rs-page">
        <NavRow back={{ to: "/", label: "Home" }} />
        <h1 className="page-h1">Tutoring moves, by group</h1>
        <p className="page-lede">
          The Tutor Move Taxonomy{" "}
          (<a className="rs-cite-link" href={PAPER_URL} target="_blank" rel="noreferrer">Zhou et al., 2026</a>)
          as it appears in this corpus: {moveCount} moves across{" "}
          {moveGroups.length} groups, drawn from real tutoring sessions. Open any
          move to see every turn where it is demonstrated.
        </p>

        {/* Every label, split by group. */}
        <section className="rs-overview" aria-label="Labels by group">
          <ol className="rs-keys">
            {moveGroups.map((g) => (
              <li key={g.category} style={{ "--cat": categoryColor[g.category] }}>
                <a href={`#rs-${g.category}`} onClick={(ev) => {
                  ev.preventDefault();
                  document.getElementById(`rs-${g.category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}>
                  <span className="rs-key-name">{g.label}</span>
                  <span className="rs-key-share">{pct(g.total)}</span>
                  <span className="rs-key-bar" aria-hidden="true">
                    <span style={{ width: `${Math.max((g.total / allTurns) * 100, 0.8)}%` }} />
                  </span>
                  <span className="rs-key-meta">
                    {fmt(g.total)} labels, {g.moves.length} {g.moves.length === 1 ? "move" : "moves"}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p className="rs-note">
            {fmt(allTurns)} labels in all. Below, every bar is drawn on one scale, so a bar in one
            group can be read against a bar in another.
          </p>
        </section>

        <div className="rs-groups">
          {cols.map((col, ci) => (
            <div className="rs-col" key={ci}>
              {col.map(({ g: group, i }) => (
                <section
                  className="rs-group"
                  id={`rs-${group.category}`}
                  key={group.category}
                  style={{ "--cat": categoryColor[group.category], order: i }}
                  aria-labelledby={`rs-h-${group.category}`}
                >
                  <header className="rs-group-head">
                    <h2 id={`rs-h-${group.category}`}>{group.label}</h2>
                    <span className="rs-group-meta">
                      {group.moves.length} {group.moves.length === 1 ? "move" : "moves"}, {fmt(group.total)} labels
                    </span>
                  </header>

                  <ol className="rs-rows">
                    {group.moves.map((m) => (
                      <li key={m.code}>
                        <button
                          type="button"
                          className="rs-row"
                          onClick={() => navigate(`/research/m/${m.code}`)}
                        >
                          <MoveTerm className="rs-name" code={m.code} clickable={false}>
                            {m.name}
                          </MoveTerm>
                          <span className="rs-bar" aria-hidden="true">
                            <span style={{ width: `${Math.max((m.examples.length / widest) * 100, 0.6)}%` }} />
                          </span>
                          <span className="rs-count">{fmt(m.examples.length)}</span>
                          {m.contested.length > 0 && (
                            <span
                              className="rs-contested"
                              title={`${m.contested.length} further turns where annotators considered this label but did not agree`}
                            >
                              +{m.contested.length} contested
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ))}
        </div>

        {/* Where the taxonomy comes from. */}
        <section className="rs-ref" aria-labelledby="rs-ref-h">
          <h2 id="rs-ref-h">Reference</h2>
          <p>
            Zhou, Z., Vanacore, K., Thompson, T., St John, J., &amp; Kizilcec, R. (2026).{" "}
            <i>Tutor Move Taxonomy: A Theory-Aligned Framework for Analyzing Instructional
            Moves in Tutoring</i>. arXiv:2603.05778.{" "}
            <a href={PAPER_URL} target="_blank" rel="noreferrer">{PAPER_URL}</a>
          </p>
        </section>
      </main>
    </Shell>
  );
}
