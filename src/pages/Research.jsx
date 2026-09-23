import { useNavigate } from "react-router-dom";

import NavRow from "../components/NavRow.jsx";
import { MoveTerm } from "../components/Dictionary.jsx";
import Shell, { RESEARCH_TINT } from "../components/Shell.jsx";
import { categoryColor, moveGroups, stats } from "../data/corpus.js";

export default function Research() {
  const navigate = useNavigate();
  const widest = Math.max(
    ...moveGroups.flatMap((g) => g.moves.map((m) => m.examples.length))
  );
  const moveCount = moveGroups.reduce((n, g) => n + g.moves.length, 0);

  return (
    <Shell crumbs={[{ label: "Research" }]} tint={RESEARCH_TINT}>
      <main className="page">
        <NavRow back={{ to: "/", label: "Home" }} />
        <p className="eyebrow">Researcher view</p>
        <h1 className="page-h1">Tutoring moves, by group</h1>
        <p className="page-lede">
          The taxonomy as it appears in this corpus: {moveCount} moves across{" "}
          {moveGroups.length} groups, drawn from {stats.sessions} tutoring
          sessions. Open any move to see every turn where it is demonstrated.
        </p>

        <div className="legend-row">
          {moveGroups.map((g) => (
            <span className="legend-item" key={g.category}>
              <span
                className="legend-swatch"
                style={{ background: categoryColor[g.category] }}
              />
              {g.label}
            </span>
          ))}
        </div>

        {moveGroups.map((group) => (
          <section className="movegroup" key={group.category}>
            <header
              className="movegroup-head"
              style={{ "--cat": categoryColor[group.category] }}
            >
              <h2>{group.label}</h2>
              <span className="movegroup-count">
                {group.moves.length} moves · {group.total} turns
              </span>
            </header>

            <div className="movelist">
              {group.moves.map((m) => (
                <button
                  key={m.code}
                  className="moverow"
                  style={{ "--cat": categoryColor[group.category] }}
                  onClick={() => navigate(`/research/m/${m.code}`)}
                >
                  <MoveTerm className="movename" code={m.code} clickable={false}>{m.name}</MoveTerm>
                  <span className="movebar">
                    <span
                      className="movebar-fill"
                      style={{
                        width: `${(m.examples.length / widest) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="movecount">{m.examples.length}</span>
                  {m.contested.length > 0 && (
                    <span
                      className="movecontested"
                      title={`${m.contested.length} further turns where annotators considered this label but did not agree`}
                    >
                      +{m.contested.length} contested
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Shell>
  );
}
