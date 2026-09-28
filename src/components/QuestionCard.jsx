import { Link } from "react-router-dom";

import { rungColor } from "../data/corpus.js";
import { SHORT, keyMoments, turnRung } from "../data/moments.js";

/* A question card on the grade page. It previews
   how the session went before you open it: a thin thinking strip (one mark
   per message, taller and darker where the tutor took over) and the
   situations at its key moments. Styles live in src/pages/grade.css. */

function MiniStrip({ msgs }) {
  return (
    <span className="gr-strip" aria-hidden="true">
      {msgs.map((m) => {
        if (!m.t) return <i key={m.n} className="is-student" />;
        const rung = turnRung(m);
        return rung ? (
          <i
            key={m.n}
            className="is-rung"
            style={{ height: `${3 + rung * 2.5}px`, background: rungColor[rung] }}
          />
        ) : (
          <i key={m.n} className="is-tick" />
        );
      })}
    </span>
  );
}

export function QuestionCard({ s }) {
  const moments = keyMoments(s);
  // Situations in the order they happen, each named once.
  const kinds = [...new Set(moments.map((m) => m.kind))];
  return (
    <li>
      <Link className="gr-card" to={`/mathematics/s/${s.id}`}>
        <span className="gr-topic">{s.topic}</span>
        <span className="gr-q">{s.question}</span>
        <MiniStrip msgs={s.msgs} />
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
