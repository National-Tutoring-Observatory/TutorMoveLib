import { useNavigate } from "react-router-dom";

import NavRow from "../components/NavRow.jsx";
import Shell from "../components/Shell.jsx";
import { allGrades, gradeColor, stats } from "../data/corpus.js";
import useFanOut from "../hooks/useFanOut.js";

export default function Mathematics() {
  const navigate = useNavigate();
  const { ref: gridRef, ready } = useFanOut(allGrades.length);
  const live = allGrades.filter((g) => g.available).length;

  return (
    <Shell crumbs={[{ label: "Math" }]}>
      <main className="page wide">
        <NavRow back={{ to: "/subjects", label: "All subjects" }} />
        <p className="eyebrow">Math</p>
        <h1 className="page-h1">Choose a grade level</h1>
        <p className="page-lede">
          Grades 1 through 12. {live} of them hold questions so far —{" "}
          {stats.sessions} tutoring sessions in total. Grade levels are inferred
          from the content of each question; the transcripts themselves carry no
          grade label.
        </p>

        <div className={`grid grid-grades${ready ? " ready" : ""}`} ref={gridRef}>
          {allGrades.map((tier) => {
            const tint = { "--ink-tint": gradeColor[tier.grade] };

            if (!tier.available) {
              return (
                <div
                  key={tier.grade}
                  className="gradebox locked"
                  style={tint}
                  aria-disabled="true"
                  title={`${tier.label} has no questions in this preview yet`}
                >
                  <div className="gradenum">{tier.grade}</div>
                  <h3>{tier.label}</h3>
                  <div className="foot">
                    <span className="soon">No questions yet</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={tier.grade}
                className="gradebox"
                style={tint}
                onClick={() => navigate(`/mathematics/g/${tier.grade}`)}
              >
                <div className="gradenum">{tier.grade}</div>
                <div>
                  <h3>{tier.label}</h3>
                  <p className="gradestrands">{tier.strands.join(" · ")}</p>
                </div>
                <div className="foot">
                  <span className="stat">
                    {tier.count} {tier.count === 1 ? "question" : "questions"}
                  </span>
                  <span className="go">
                    Open <span className="arrow">→</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </Shell>
  );
}
