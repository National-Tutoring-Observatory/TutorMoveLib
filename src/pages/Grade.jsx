import { useNavigate, useParams } from "react-router-dom";

import NavRow from "../components/NavRow.jsx";
import Shell from "../components/Shell.jsx";
import { grades, sessionsByGrade } from "../data/corpus.js";

export default function Grade() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const label = grades[grade];
  const list = sessionsByGrade(grade);

  // Grouped by strand, so the branch of maths leads each block rather than
  // being a small tag on every card.
  const byStrand = [...new Set(list.map((s) => s.strand))].map((strand) => [
    strand,
    list.filter((s) => s.strand === strand),
  ]);

  if (!label) {
    return (
      <Shell crumbs={[{ label: "Math", to: "/mathematics" }]}>
        <main className="page">
          <p className="page-lede">No such grade level.</p>
        </main>
      </Shell>
    );
  }

  return (
    <Shell
      crumbs={[{ label: "Math", to: "/mathematics" }, { label }]}
    >
      <main className="page">
        <NavRow back={{ to: "/mathematics", label: "All grade levels" }} />
        <p className="eyebrow">{label}</p>
        <h1 className="page-h1">Choose a question</h1>
        <p className="page-lede">
          Each one is a real question a student got stuck on, with the tutoring
          conversation that followed — grouped by the branch of maths it
          belongs to.
        </p>

        {byStrand.map(([strand, group]) => (
          <section className="strand-group" key={strand}>
            <header className="strand-head">
              <h2>{strand}</h2>
              <span className="strand-count">
                {group.length} {group.length === 1 ? "question" : "questions"}
              </span>
            </header>

            <div className="qlist">
              {group.map((s) => (
                <button
                  key={s.id}
                  className="qcard"
                  onClick={() => navigate(`/mathematics/s/${s.id}`)}
                >
                  <div className="qcard-top">
                    {s.confidence === "inferred" && (
                      <span
                        className="badge"
                        title="The question was a diagram we never see; this is a reconstruction from the dialogue"
                      >
                        Reconstructed
                      </span>
                    )}
                  </div>
                  <p className="qtext">{s.question}</p>
                  <div className="qcard-foot">
                    <span>{s.topic}</span>
                    <span className="dotsep">·</span>
                    <span>{s.msgs.length} messages</span>
                    <span className="open">Open →</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Shell>
  );
}
