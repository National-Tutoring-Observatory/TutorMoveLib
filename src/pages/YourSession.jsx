import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { MoveTerms } from "../components/Dictionary.jsx";
import NavRow from "../components/NavRow.jsx";
import Shell from "../components/Shell.jsx";
import { grades, rungColor, spectrum } from "../data/corpus.js";
import { exemplarsFor, review } from "../data/exemplars.js";
import "./yoursession.css";

/* "Bring your own session": a walk-through of how the library could work
   with a tutor's own transcript. Upload, annotate, explore, then learn from
   how other tutors handled the same moments.

   The upload is simulated. A dropped or chosen file is never opened, read
   or sent anywhere: only its name is shown. Whatever is uploaded, the
   results are those of one real, de-identified session from the library,
   so everything on the page is computed from real data and nothing is
   invented. There is no AI and no annotation pipeline behind this page. */

// Chosen because its tutor both takes over the thinking and hands it back,
// and the library holds plenty of moments like it. Change it here.
const SAMPLE_ID = "603";

const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "annotate", label: "Annotate" },
  { id: "explore", label: "Explore" },
  { id: "learn", label: "Learn from others" },
];

const WORK = [
  "Removing names and personal details",
  "Labelling each tutor turn with its move",
  "Placing each move on the thinking scale",
  "Finding the key moments",
  "Matching moments with examples from the library",
];

function Steps({ at, reached, go }) {
  return (
    <ol className="ys-steps" aria-label="Steps">
      {STEPS.map((s, i) => {
        const state = i === at ? "now" : i <= reached ? "done" : "todo";
        const can = i <= reached && i !== 1 && i !== at;
        return (
          <li key={s.id} className={`ys-step is-${state}`}>
            <button
              type="button"
              disabled={!can}
              aria-current={i === at ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="ys-step-num">{i + 1}</span>
              <span className="ys-step-label">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Meter({ rung }) {
  if (!rung) return <p className="ys-meter-none">Not on the thinking scale</p>;
  return (
    <div className="ys-meter" title={spectrum[String(rung)]}>
      <div className="ys-meter-bar" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <i key={i} style={i === rung ? { background: rungColor[i] } : undefined} />
        ))}
      </div>
      <span>
        <b>{rung} of 6</b> {spectrum[String(rung)]}
      </span>
    </div>
  );
}

function Said({ who, children, n }) {
  return (
    <blockquote className={`ys-said is-${who}`}>
      <p>{children}</p>
      <footer>
        {who === "student" ? "Student" : who === "you" ? "You" : "Tutor"}
        {n ? ` · message ${n}` : ""}
      </footer>
    </blockquote>
  );
}

/* ---------------------------------------------------------------- upload */
function Upload({ onFile, onSample }) {
  const [over, setOver] = useState(false);
  const pick = (files) => {
    const f = files && files[0];
    if (f) onFile(f.name);
  };

  return (
    <section className="ys-card ys-upload">
      <label
        className={`ys-drop${over ? " is-over" : ""}`}
        onDragOver={(ev) => {
          ev.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(ev) => {
          ev.preventDefault();
          setOver(false);
          pick(ev.dataTransfer.files);
        }}
      >
        {/* Only the file's name is used; its contents are never read. */}
        <input
          type="file"
          className="sr-only"
          accept=".txt,.csv,.json,.docx,.pdf,.vtt,.srt"
          onChange={(ev) => pick(ev.target.files)}
        />
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M12 15V4m0 0-4 4m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="ys-drop-title">Drop a transcript from your tutoring session</p>
        <p className="ys-drop-note">
          or <span className="ys-drop-browse">choose a file</span>. A chat
          export, a text file or a document.
        </p>
      </label>
      <div className="ys-upload-side">
        <h2>No transcript to hand?</h2>
        <p>
          Use a sample session instead. It is a real, de-identified tutoring
          conversation, and you will see it exactly as you would see your own.
        </p>
        <button type="button" className="ys-primary" onClick={onSample}>
          Use a sample session
        </button>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- annotate */
function Annotate({ file, onDone }) {
  const [done, setDone] = useState(0);
  // Held in a ref so a new callback from the parent never restarts the timer.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const every = reduce ? 120 : 520;
    const t = setInterval(() => setDone((d) => Math.min(d + 1, WORK.length)), every);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (done < WORK.length) return;
    const t = setTimeout(() => doneRef.current(), 450);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <section className="ys-card ys-annotate" aria-live="polite">
      <h2>Reading your session</h2>
      {file && <p className="ys-file">{file}</p>}
      <ul className="ys-work">
        {WORK.map((w, i) => (
          <li key={w} className={i < done ? "is-done" : i === done ? "is-now" : ""}>
            <span className="ys-work-dot" aria-hidden="true" />
            {w}
            {i < done && <span className="sr-only"> (done)</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------------- explore */
function Verdict({ id, verdicts, setVerdict }) {
  const v = verdicts[id];
  if (v) {
    return (
      <p className="ys-verdict-done">
        {v === "agree"
          ? "Thanks. You agreed with this label."
          : "Thanks. You would label this differently, and that goes back to the research team."}{" "}
        <button type="button" className="ys-link" onClick={() => setVerdict(id, null)}>
          Undo
        </button>
      </p>
    );
  }
  return (
    <div className="ys-verdict">
      <span>Does this label fit?</span>
      <button type="button" onClick={() => setVerdict(id, "agree")}>
        Looks right
      </button>
      <button type="button" onClick={() => setVerdict(id, "differ")}>
        I'd read it differently
      </button>
    </div>
  );
}

function Explore({ data, file, verdicts, setVerdict, onNext }) {
  const { session, moments, labelled, scale } = data;
  const again = moments.filter((m) => m.flag === "again").length;
  const share = scale.total ? Math.round((scale.student / scale.total) * 100) : 0;

  return (
    <>
      <section className="ys-card ys-summary">
        <div>
          <p className="ys-kicker">
            {file ? (
              <>
                Your session · <span className="ys-kicker-file">{file}</span>
              </>
            ) : (
              "Sample session"
            )}
          </p>
          <h2>{session.topic}</h2>
          <p className="ys-meta">
            {grades[String(session.grade)]} · {session.msgs.length} messages ·{" "}
            {labelled} tutor turns labelled · {moments.length} key moments
          </p>
          <p className="ys-q">
            <span>Question</span> {session.question}
          </p>
        </div>
        <div className="ys-split">
          <p className="ys-kicker">Who did the thinking</p>
          <div className="ys-split-bar" aria-hidden="true">
            <i style={{ flex: scale.student, background: rungColor[2] }} />
            <i style={{ flex: scale.tutor, background: rungColor[5] }} />
          </div>
          <p className="ys-split-cap">
            The student carried the thinking in <b>{scale.student}</b> of your{" "}
            {scale.total} moves on the scale ({share}%). You took it over in{" "}
            <b>{scale.tutor}</b>.
          </p>
          <Link className="ys-link" to={`/mathematics/s/${session.id}`}>
            Open the full annotated transcript →
          </Link>
        </div>
      </section>

      <h2 className="ys-h">Your key moments</h2>
      <p className="ys-lede">
        The moments straight after the student spoke. {again > 0 && (
          <>
            <b>{again}</b> {again === 1 ? "is" : "are"} worth a second look:
            the student had just spoken, and you took over the thinking.
          </>
        )}
      </p>

      <ol className="ys-moments">
        {moments.map((m) => (
          <li key={m.n} className={`ys-card ys-moment${m.flag ? ` is-${m.flag}` : ""}`}>
            <div className="ys-moment-head">
              <span className="ys-num">{m.num}</span>
              <h3>{m.situation}</h3>
              {m.flag === "again" && <span className="ys-flag is-again">Worth a second look</span>}
              {m.flag === "well" && <span className="ys-flag is-well">Thinking handed back</span>}
            </div>
            <div className="ys-moment-body">
              <Said who="student" n={m.cue}>{m.cueText}</Said>
              <div>
                <Said who="you" n={m.n}>{m.said}</Said>
                <p className="ys-move">
                  <MoveTerms codes={m.moves} sep=" + " />
                </p>
                <Meter rung={m.rung} />
              </div>
              <div>
                <p className="ys-kicker">What happened next</p>
                {m.next ? (
                  <Said who="student" n={m.next.n}>{m.next.s.trim()}</Said>
                ) : (
                  <p className="ys-note">The session ended before the student replied.</p>
                )}
              </div>
            </div>
            <Verdict id={m.n} verdicts={verdicts} setVerdict={setVerdict} />
          </li>
        ))}
      </ol>

      <div className="ys-next">
        <button type="button" className="ys-primary" onClick={onNext}>
          See how other tutors handled these moments →
        </button>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- learn */
function Learn({ data }) {
  const { session, moments } = data;
  const again = moments.filter((m) => m.flag === "again");
  const well = moments.filter((m) => m.flag === "well");
  const groups = useMemo(() => {
    // Each example is shown once, under the first moment it fits.
    const skip = new Set();
    return again.map((m) => {
      const examples = exemplarsFor(m.kind, {
        excludeSid: session.id,
        grade: session.grade,
        skip,
      });
      examples.forEach((e) => skip.add(`${e.sid}-${e.n}`));
      return { m, examples };
    });
  }, [moments, session]);

  if (again.length === 0) {
    return (
      <section className="ys-card">
        <h2>Nothing to flag in this session</h2>
        <p className="ys-note">
          At every key moment the student was left to do the thinking.
        </p>
      </section>
    );
  }

  return (
    <>
      <p className="ys-lede">
        For each moment worth a second look, here is how tutors elsewhere in
        the library responded to the same kind of situation while leaving the
        thinking with the student. Read what the tutor said, then what the
        student did next.
      </p>

      {well.length > 0 && (
        <aside className="ys-card ys-own">
          <p className="ys-kicker">You already do this</p>
          {well.map((m) => (
            <p key={m.n}>
              At message {m.n} ({m.situation.toLowerCase()}), you used{" "}
              <MoveTerms codes={m.moves} sep=" + " />
              {m.next ? (
                <>
                  {" "}and the student replied “{m.next.s.trim()}”.
                </>
              ) : (
                "."
              )}
            </p>
          ))}
        </aside>
      )}

      {groups.map(({ m, examples }) => (
        <section key={m.n} className="ys-group">
          <header className="ys-group-head">
            <span className="ys-num">{m.num}</span>
            <div>
              <h3>{m.situation}</h3>
              <p>
                The student said “{m.cueText}”. You used{" "}
                <MoveTerms codes={m.moves} sep=" + " />
                {m.next ? <>, and the student replied “{m.next.s.trim()}”.</> : "."}
              </p>
            </div>
          </header>

          {examples.length === 0 ? (
            <p className="ys-note">No close examples in the library yet.</p>
          ) : (
            <ul className="ys-examples">
              {examples.map((e) => (
                <li key={`${e.sid}-${e.n}`} className="ys-card ys-example">
                  <p className="ys-example-src">
                    {grades[String(e.grade)]} · {e.topic}
                  </p>
                  <Said who="student">{e.cue}</Said>
                  <Said who="tutor">{e.said}</Said>
                  <p className="ys-move">
                    <MoveTerms codes={e.moves} sep=" + " />
                  </p>
                  <Meter rung={e.rung} />
                  <p className="ys-kicker">What happened next</p>
                  <Said who="student">{e.next}</Said>
                  <Link
                    className="ys-link"
                    to={`/mathematics/s/${e.sid}?turn=${e.n}`}
                  >
                    Open in context →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

export default function YourSession() {
  const data = useMemo(() => review(SAMPLE_ID), []);
  const [at, setAt] = useState(0);
  const [reached, setReached] = useState(0);
  const [verdicts, setVerdicts] = useState({});
  // The name of the "uploaded" file, or null for the sample.
  const [file, setFile] = useState(null);
  const topRef = useRef(null);

  const go = (i) => {
    setAt(i);
    setReached((r) => Math.max(r, i));
    topRef.current?.scrollIntoView({ block: "start" });
  };
  const setVerdict = (id, v) => setVerdicts((all) => ({ ...all, [id]: v }));

  return (
    <Shell crumbs={[{ label: "Your own session" }]}>
      <main className="page wide ys-page" ref={topRef}>
        <NavRow back={{ to: "/", label: "Home" }} />

        <header className="ys-head">
          <p className="ys-badge">Preview · sample case</p>
          <h1>Bring your own session</h1>
          <p className="ys-intro">
            Upload a transcript of a session you taught. It is read the same way
            as every session in the library: each of your turns is labelled,
            the key moments are found, and for the moments where you took over
            the thinking, you see how other tutors handled the same situation.
          </p>
        </header>

        <Steps at={at} reached={reached} go={go} />

        {!data ? (
          <p className="ys-note">The sample session is missing from the library.</p>
        ) : at === 0 ? (
          <Upload
            onFile={(name) => {
              setFile(name);
              go(1);
            }}
            onSample={() => {
              setFile(null);
              go(1);
            }}
          />
        ) : at === 1 ? (
          <Annotate file={file} onDone={() => go(2)} />
        ) : at === 2 ? (
          <Explore
            data={data}
            file={file}
            verdicts={verdicts}
            setVerdict={setVerdict}
            onNext={() => go(3)}
          />
        ) : (
          <Learn data={data} />
        )}
      </main>
    </Shell>
  );
}
