import NavRow from "../components/NavRow.jsx";
import Shell from "../components/Shell.jsx";
import AppleTree from "../components/AppleTree.jsx";
import { allGrades, stats } from "../data/corpus.js";

export default function Mathematics() {
  const live = allGrades.filter((g) => g.available).length;

  return (
    <Shell crumbs={[{ label: "Math" }]}>
      <main className="page wide">
        <NavRow back={{ to: "/subjects", label: "All subjects" }} />
        <p className="eyebrow">Math</p>
        <h1 className="page-h1">Pick a grade from the tree</h1>
        <p className="page-lede">
          Grades 1 through 12. {live} of them hold questions so far —{" "}
          {stats.sessions} tutoring sessions in total. Grade levels are inferred
          from the content of each question; the transcripts themselves carry no
          grade label.
        </p>

        <AppleTree />
      </main>
    </Shell>
  );
}
