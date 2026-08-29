import { useNavigate, useParams } from "react-router-dom";

import NavRow from "../components/NavRow.jsx";
import Shell, { RESEARCH_TINT } from "../components/Shell.jsx";
import {
  categories,
  categoryColor,
  findMove,
  grades,
  moveName,
  rungColor,
  spectrum,
} from "../data/corpus.js";

function Rungs({ rung }) {
  if (!rung) return null;
  return (
    <div className="rungs">
      <div className="rungs-lbl">Where it sits on the spectrum of cognitive responsibility</div>
      <div className="rungs-bar">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`rung${i === rung ? " on" : ""}`}
            style={{ background: i <= rung ? rungColor[i] : undefined }}
            title={spectrum[String(i)]}
          />
        ))}
      </div>
      <div className="rungs-cap">
        <span>Student holds the thinking</span>
        <span>Tutor has taken it over</span>
      </div>
      <p className="rungs-now">{spectrum[String(rung)]}</p>
    </div>
  );
}

export default function Move() {
  const { code } = useParams();
  const navigate = useNavigate();
  const move = findMove(code);

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
  const open = (ex) =>
    navigate(`/mathematics/s/${ex.sid}?turn=${ex.n}&from=${move.code}`);

  return (
    <Shell
      crumbs={[{ label: "Research", to: "/research" }, { label: move.name }]}
      tint={RESEARCH_TINT}
    >
      <main className="page">
        <NavRow back={{ to: "/research", label: "All tutoring moves" }} />

        <p className="eyebrow" style={{ color: categoryColor[move.category] }}>
          {categories[move.category]}
        </p>
        <h1 className="page-h1">{move.name}</h1>
        <p className="page-lede">{move.def}</p>

        <div className="movemeta">
          <code>{move.code}</code>
          <span>
            {move.examples.length} demonstrated
            {move.contested.length > 0 && ` · ${move.contested.length} contested`}
          </span>
        </div>

        <Rungs rung={move.rung} />

        <h2 className="section-h">Where it is demonstrated</h2>
        <div className="exlist">
          {move.examples.map((ex) => (
            <button
              className="excard"
              key={`${ex.sid}-${ex.n}`}
              style={{ "--cat": categoryColor[move.category] }}
              onClick={() => open(ex)}
            >
              <p className="exsaid">“{ex.text}”</p>
              {ex.why ? (
                <p className="exwhy">{ex.why}</p>
              ) : ex.clues.length > 0 ? (
                <p className="excues">
                  <span className="excues-lbl">Cues</span>
                  {ex.clues.map((c, i) => (
                    <span className="excue" key={i} title={c.why}>
                      {c.q}
                    </span>
                  ))}
                </p>
              ) : null}
              <div className="exfoot">
                <span>{grades[String(ex.grade)]}</span>
                <span className="dotsep">·</span>
                <span>{ex.topic}</span>
                <span className="dotsep">·</span>
                <span>message {ex.n}</span>
                {ex.alsoTagged.length > 0 && (
                  <span className="alsotag">
                    also {ex.alsoTagged.map(moveName).join(", ")}
                  </span>
                )}
                <span className="open">Open in context →</span>
              </div>
            </button>
          ))}
        </div>

        {move.contested.length > 0 && (
          <>
            <h2 className="section-h">Where annotators did not agree</h2>
            <p className="page-lede">
              These turns were not counted as examples. Two people trained on
              this framework considered {move.name.toLowerCase()} and settled on
              nothing — which is the most direct evidence there is about where
              the edge of this move actually falls.
            </p>
            <div className="exlist">
              {move.contested.map((ex) => (
                <button
                  className="excard contested"
                  key={`c-${ex.sid}-${ex.n}`}
                  onClick={() => open(ex)}
                >
                  <p className="exsaid">“{ex.text}”</p>
                  <p className="exwhy">
                    {ex.against.length > 0 ? (
                      <>
                        One annotator read this as <b>{move.name}</b>, the other
                        as <b>{ex.against.map(moveName).join(", ")}</b>.
                      </>
                    ) : (
                      <>
                        One annotator read this as <b>{move.name}</b>; the other
                        saw no pedagogical move here at all.
                      </>
                    )}
                  </p>
                  <div className="exfoot">
                    <span>{grades[String(ex.grade)]}</span>
                    <span className="dotsep">·</span>
                    <span>{ex.topic}</span>
                    <span className="dotsep">·</span>
                    <span>message {ex.n}</span>
                    <span className="open">Open in context →</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </Shell>
  );
}
