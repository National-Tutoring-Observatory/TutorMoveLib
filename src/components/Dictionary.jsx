import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { categoryColor, moveIndex, moveName } from "../data/corpus.js";
import {
  entries,
  entriesIn,
  findEntry,
  learningRungs,
  partOrder,
  parts,
  toCorpusCode,
} from "../data/dictionary.js";
import { ASK_PREP, askSuggest } from "../data/askMoves.js";

/* ------------------------------------------------------------------ context
   One dictionary for the whole site. Any component can open the sidebar at a
   move, or peek at a definition, through this context. */
const DictionaryContext = createContext(null);

export const useDictionary = () => useContext(DictionaryContext);

export function DictionaryProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // dictionary code
  const [peek, setPeek] = useState(null); // dictionary code being hovered
  const returnTo = useRef(null);

  // The panel floats above the router, so close it when the page changes.
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    setPeek(null);
  }, [pathname]);

  const openAt = useCallback((code) => {
    returnTo.current = document.activeElement;
    setSelected(code ? findEntry(code)?.code ?? null : null);
    setPeek(null);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const el = returnTo.current;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const value = useMemo(
    () => ({ open, openAt, close, selected, setSelected, peek, setPeek }),
    [open, openAt, close, selected, peek]
  );

  return (
    <DictionaryContext.Provider value={value}>
      {children}
      <DefinitionPeek />
      <DictionaryDrawer />
    </DictionaryContext.Provider>
  );
}

/* --------------------------------------------------------------- MoveTerm
   Wrap a move name anywhere in the site. Hover or focus shows the definition
   in a small card at the top left; a click opens the dictionary at the move.
   `clickable={false}` keeps only the hover, for names inside another button. */
export function MoveTerm({ code, children, className = "", clickable = true }) {
  const dict = useDictionary();
  const entry = findEntry(code);
  if (!entry || !dict) return <span className={className}>{children}</span>;

  const show = () => dict.setPeek({ code: entry.code, clickable });
  const hide = () => dict.setPeek((p) => (p?.code === entry.code ? null : p));
  const open = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    dict.openAt(entry.code);
  };

  return (
    <span
      className={`move-term ${className}`}
      aria-label={`${entry.name}: ${entry.def}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...(clickable
        ? {
            tabIndex: 0,
            role: "button",
            onClick: open,
            onKeyDown: (ev) => {
              if (ev.key === "Enter" || ev.key === " ") open(ev);
            },
          }
        : {})}
    >
      {children ?? entry.name}
    </span>
  );
}

/* Several move names in a row, each hoverable. Uses the corpus's own display
   names so the wording matches the rest of the page. */
export function MoveTerms({ codes, sep = ", " }) {
  return codes.map((c, i) => (
    <span key={c}>
      {i > 0 && sep}
      <MoveTerm code={c}>{moveName(c)}</MoveTerm>
    </span>
  ));
}

/* ------------------------------------------------------------------ AskBox
   On the landing page: describe what is happening, get the moves that fit. */
export function AskBox() {
  const dict = useDictionary();
  const [text, setText] = useState("");
  const [asked, setAsked] = useState("");
  const hits = useMemo(() => (asked ? askSuggest(asked, 4) : []), [asked]);

  const submit = (ev) => {
    ev.preventDefault();
    setAsked(text.trim());
  };

  return (
    <section className="ask" aria-labelledby="ask-lbl">
      <p className="ask-lbl" id="ask-lbl">
        Not sure which move you need? Describe what is happening in your session.
      </p>
      <form className="ask-row" onSubmit={submit}>
        <input
          id="ask-input"
          type="text"
          autoComplete="off"
          placeholder="e.g. my student is stuck and won't try the next step"
          value={text}
          onChange={(ev) => setText(ev.target.value)}
        />
        <button type="submit">Find moves</button>
      </form>
      {!asked && (
        <div className="ask-egs">
          {[
            "student gave a wrong answer",
            "student is frustrated and says they are bad at math",
            "I want to check whether they understood",
            "we need a plan for a long problem",
          ].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => {
                setText(s);
                setAsked(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {asked && (
        <div className="ask-out" aria-live="polite">
          {hits.length ? (
            <>
              <h3>For this situation, try</h3>
              {hits.map((r) => {
                const e = entries[r.n - 1];
                return (
                  <button
                    type="button"
                    key={e.code}
                    className="ask-hit"
                    style={{ "--cat": categoryColor[e.cat] }}
                    onClick={() => dict.openAt(e.code)}
                  >
                    <span className="ask-hit-name">{e.name}</span>
                    <span className="ask-hit-part">{parts[e.cat].name}</span>
                    <span className="ask-hit-tip">{ASK_PREP[r.n - 1].tip}</span>
                    {r.cues.length > 0 && (
                      <span className="ask-hit-why">matched “{r.cues.slice(0, 2).join("”, “")}”</span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <p className="ask-none">
              Nothing in the dictionary matches that well. Try different words for what the
              student is doing or feeling, or open the dictionary and browse the four parts.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* Button for the top bar. */
export function DictionaryButton({ className = "" }) {
  const dict = useDictionary();
  return (
    <button
      type="button"
      className={`dict-btn ${className}`}
      onClick={() => dict.openAt(null)}
      aria-haspopup="dialog"
    >
      <BookIcon /> Dictionary
    </button>
  );
}

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H7.5A1.5 1.5 0 0 1 6 19V3.5Z" />
    <path d="M6 17.5A1.5 1.5 0 0 1 7.5 16H19" />
  </svg>
);

/* ---------------------------------------------------------- DefinitionPeek
   The small card at the top left of the window. */
function DefinitionPeek() {
  const dict = useDictionary();
  const entry = dict.peek && !dict.open ? findEntry(dict.peek.code) : null;
  if (!entry) return null;
  return (
    <div className="dict-peek" style={{ "--cat": categoryColor[entry.cat] }} role="status">
      <p className="dict-peek-part">{parts[entry.cat].name}</p>
      <p className="dict-peek-name">{entry.name}</p>
      <p className="dict-peek-def">{entry.def}</p>
      <p className="dict-peek-hint">
        {dict.peek.clickable
          ? "Click the term to open it in the dictionary"
          : "Open the dictionary from the top bar for examples"}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- DictionaryDrawer
   An open book: the four parts down the spine, the moves of the chosen part on
   the left page, and the chosen move's definition on the right page. */
function DictionaryDrawer() {
  const dict = useDictionary();
  const navigate = useNavigate();
  const [part, setPart] = useState("tutoring");
  const closeRef = useRef(null);

  // Opening on a move turns to that move's part.
  useEffect(() => {
    if (!dict.open) return;
    const e = dict.selected ? findEntry(dict.selected) : null;
    if (e) setPart(e.cat);
  }, [dict.open, dict.selected]);

  // Focus the panel on open; Escape closes.
  useEffect(() => {
    if (!dict.open) return;
    const t = setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (ev) => {
      if (ev.key === "Escape") dict.close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [dict.open, dict.close]);

  if (!dict.open) return null;

  const inPart = entriesIn(part);
  const current = dict.selected ? findEntry(dict.selected) : null;

  return (
    <>
      <div className="dict-scrim" onClick={dict.close} />
      <aside className="dict-drawer" role="dialog" aria-modal="true" aria-labelledby="dict-title">
        <header className="dict-head">
          <div>
            <h2 id="dict-title">Dictionary of tutoring moves</h2>
            <p>
              {entries.length} moves in {partOrder.length} parts
            </p>
          </div>
          <button type="button" className="dict-close" ref={closeRef} onClick={dict.close} aria-label="Close the dictionary">
            ×
          </button>
        </header>

        <div className="dict-book">
          <nav className="dict-spine" aria-label="Parts of the taxonomy">
            {partOrder.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`dict-partbtn${cat === part ? " on" : ""}`}
                style={{ "--cat": categoryColor[cat] }}
                onClick={() => setPart(cat)}
                aria-pressed={cat === part}
              >
                <span className="dict-partbtn-name">{parts[cat].name}</span>
                <span className="dict-partbtn-n">{entriesIn(cat).length}</span>
              </button>
            ))}
          </nav>

          <section className="dict-page dict-list" style={{ "--cat": categoryColor[part] }} aria-label={parts[part].name}>
            <h3>{parts[part].name}</h3>
            <p className="dict-part-blurb">{parts[part].blurb}</p>
            <ul>
              {inPart.map((e) => (
                <li key={e.code}>
                  <button
                    type="button"
                    className={`dict-row${current?.code === e.code ? " on" : ""}`}
                    onClick={() => dict.setSelected(e.code)}
                    aria-current={current?.code === e.code ? "true" : undefined}
                  >
                    {e.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="dict-page dict-detail" aria-live="polite">
            {current ? (
              <Definition entry={current} onCorpus={() => { dict.close(); navigate(`/research/m/${toCorpusCode(current.code)}`); }} />
            ) : (
              <div className="dict-empty">
                <p className="dict-empty-title">Pick a move to read its definition.</p>
                <p>The left page lists every move in the part you chose. Click one and its definition, examples and a tip appear here.</p>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

/* The definition page. */
function Definition({ entry: e, onCorpus }) {
  const inCorpus = moveIndex.has(toCorpusCode(e.code));
  return (
    <article className="dict-def-page" style={{ "--cat": categoryColor[e.cat] }} key={e.code}>
      <p className="dict-def-part">{parts[e.cat].name}</p>
      <h3 className="dict-def-name">{e.name}</h3>
      <p className="dict-def-code">{e.code}</p>
      <p className="dict-def">{e.def}</p>
      {e.rung != null && (
        <div className="dict-gauge" title={`Position ${e.rung} of ${learningRungs} on the learning-support spectrum`}>
          <div className="dict-ticks">
            {Array.from({ length: learningRungs }, (_, i) => (
              <i key={i} className={i + 1 === e.rung ? "on" : ""} />
            ))}
          </div>
          <div className="dict-gauge-cap">
            <span>student does the thinking</span>
            <span>tutor does it</span>
          </div>
        </div>
      )}
      {e.ex.length > 0 && (
        <div className="dict-ex">
          <p className="dict-ex-lbl">In use</p>
          {e.ex.map((it, i) =>
            it.t === "dialog" ? (
              <div className="dict-dialog" key={i}>
                {it.lines.map((l, j) => (
                  <div key={j}>
                    <span className="dict-sp">{l.who}</span>
                    {l.say}
                  </div>
                ))}
              </div>
            ) : it.t === "note" ? (
              <p className="dict-note" key={i}>{it.q}</p>
            ) : (
              <p className="dict-cite" key={i}>“{it.q}”</p>
            )
          )}
        </div>
      )}
      <p className="dict-tip">
        <b>Try</b> {ASK_PREP[entries.indexOf(e)].tip}
      </p>
      {inCorpus && (
        <button type="button" className="dict-link" onClick={onCorpus}>
          See where it is demonstrated in the corpus →
        </button>
      )}
    </article>
  );
}
