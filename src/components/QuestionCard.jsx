import { Link } from "react-router-dom";

import { SHORT, keyMoments } from "../data/moments.js";

/* A question card on the grade page. It previews
   the session before you open it: the question and the situations at its
   key moments. Styles live in src/pages/grade.css. */

export function QuestionCard({ s }) {
  const moments = keyMoments(s);
  // Situations in the order they happen, each named once.
  const kinds = [...new Set(moments.map((m) => m.kind))];
  return (
    <li>
      <Link className="gr-card" to={`/mathematics/s/${s.id}`}>
        <span className="gr-topic">{s.topic}</span>
        <span className="gr-q">{s.question}</span>
        <span className="gr-foot">
          {kinds.length > 0 && (
            <span className="gr-kinds">
              {kinds.map((k) => (
                <span key={k} className="gr-kind">
                  {SHORT[k] ?? k}
                </span>
              ))}
            </span>
          )}
          <span className="gr-len">{s.msgs.length} messages</span>
        </span>
        {s.confidence === "inferred" && (
          <span className="gr-note">
            The question was a diagram; its text is rebuilt from the conversation.
          </span>
        )}
      </Link>
    </li>
  );
}
