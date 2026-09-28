import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import "./tour.css";

/* A guided tour: the page goes grey except for one part, and a small card
   beside it, joined by a short line, says what that part is and what it is
   for. Clicking the grey moves on; Next / Back / End tour are always there.

   Each step is { target, title, text }. `target` is a CSS selector (a list
   is fine: the first match on the page is used, so ".ss-side, .ss-inline"
   finds the side panel on a wide screen and the inline one on a phone).
   A step whose target is missing is skipped. A step with no target is a
   centred card with nothing lit, used for the ending. */

const PAD = 8; // breathing room between the part and the lit outline
const GAP = 26; // length of the line joining the card to the part
const EDGE = 12; // nearest the card comes to the window edge
const CARD_W = 320;

const find = (sel) => (sel ? document.querySelector(sel) : null);

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// The lit box, kept inside the window: a part taller than the window (the
// conversation, on a short screen) is lit only where it shows.
function litBox(el) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = Math.max(EDGE / 2, r.top - PAD);
  const left = Math.max(EDGE / 2, r.left - PAD);
  const bottom = Math.min(vh - EDGE / 2, r.bottom + PAD);
  const right = Math.min(vw - EDGE / 2, r.right + PAD);
  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

// Where the card goes: below the part if it fits, else above, else to the
// side with more room, else over the part's lower edge. Returns the card's
// position and the line that joins it to the part.
function placeCard(box, cardH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(CARD_W, vw - EDGE * 2);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const clampX = (x) => Math.min(Math.max(x, EDGE), vw - w - EDGE);
  const clampY = (y) => Math.min(Math.max(y, EDGE), vh - cardH - EDGE);
  // The line meets the card away from its rounded corners.
  const along = (v, lo, hi) => Math.min(Math.max(v, lo + 18), hi - 18);

  const below = vh - (box.top + box.height);
  const above = box.top;
  const right = vw - (box.left + box.width);
  const left = box.left;

  if (below >= cardH + GAP + EDGE) {
    const x = clampX(cx - w / 2);
    const lx = along(cx, x, x + w);
    const y1 = box.top + box.height;
    return { x, y: y1 + GAP, w, line: { x: lx, y: y1, len: GAP, dir: "v" } };
  }
  if (above >= cardH + GAP + EDGE) {
    const x = clampX(cx - w / 2);
    const lx = along(cx, x, x + w);
    const y = box.top - GAP - cardH;
    return { x, y, w, line: { x: lx, y: box.top - GAP, len: GAP, dir: "v" } };
  }
  if (Math.max(right, left) >= w + GAP + EDGE) {
    const onRight = right >= left;
    const y = clampY(cy - cardH / 2);
    const ly = along(cy, y, y + cardH);
    const x = onRight ? box.left + box.width + GAP : box.left - GAP - w;
    const lx = onRight ? box.left + box.width : box.left - GAP;
    return { x, y, w, line: { x: lx, y: ly, len: GAP, dir: "h" } };
  }
  // No room anywhere (a phone, a very tall part): dock to the foot of the
  // window, so the top of the part, where its heading is, stays readable.
  return { x: clampX(cx - w / 2), y: clampY(vh - cardH - EDGE), w, line: null };
}

export default function Tour({ steps, onClose }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState(null);
  const [card, setCard] = useState(null);
  // Wait for the first-visit notice, so the two never sit on top of each other.
  const [ready, setReady] = useState(() => !document.querySelector(".notice-card"));
  const cardRef = useRef(null);
  const nextRef = useRef(null);

  const step = steps[i];
  const last = i === steps.length - 1;

  // Skip steps whose part is not on the page, in the direction of travel.
  const go = useCallback(
    (dir) => {
      let j = i + dir;
      while (j > 0 && j < steps.length - 1 && steps[j].target && !find(steps[j].target)) j += dir;
      if (j >= steps.length) return onClose();
      if (j >= 0) setI(j);
    },
    [i, steps, onClose]
  );

  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => {
      if (!document.querySelector(".notice-card")) setReady(true);
    }, 250);
    return () => clearInterval(t);
  }, [ready]);

  // Bring the part into view, then keep the light on it through scrolling
  // (the page's or the smooth scroll we just started) and resizing.
  useLayoutEffect(() => {
    if (!ready) return;
    const el = find(step.target);
    if (!el) {
      setBox(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const fits = r.height < window.innerHeight - 160;
    if (r.top < 80 || r.bottom > window.innerHeight - 20) {
      el.scrollIntoView({
        block: fits ? "center" : "start",
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    }
    const measure = () => setBox(litBox(el));
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [i, ready, step.target]);

  // Place the card once its height is known.
  useLayoutEffect(() => {
    if (!ready || !cardRef.current) return;
    const h = cardRef.current.offsetHeight;
    if (!box) {
      const w = Math.min(CARD_W + 60, window.innerWidth - EDGE * 2);
      setCard({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2, w, line: null });
    } else {
      setCard(placeCard(box, h));
    }
  }, [box, i, ready]);

  useEffect(() => {
    if (ready) nextRef.current?.focus({ preventScroll: true });
  }, [i, ready]);

  useEffect(() => {
    if (!ready) return;
    const onKey = (ev) => {
      if (ev.key === "Escape") onClose();
      else if (ev.key === "ArrowRight") go(1);
      else if (ev.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ready, go, onClose]);

  if (!ready) return null;

  // A click on the grey moves on; a click on the lit part does nothing.
  const onScrim = (ev) => {
    if (
      box &&
      ev.clientX >= box.left &&
      ev.clientX <= box.left + box.width &&
      ev.clientY >= box.top &&
      ev.clientY <= box.top + box.height
    )
      return;
    go(1);
  };

  return (
    <div className="tour" role="presentation">
      <div className="tour-scrim" onClick={onScrim} />
      {box ? (
        <div
          className="tour-light"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      ) : (
        <div className="tour-shade" />
      )}
      {card?.line && (
        <span
          className={`tour-line is-${card.line.dir}`}
          style={
            card.line.dir === "v"
              ? { left: card.line.x, top: card.line.y, height: card.line.len }
              : { left: card.line.x, top: card.line.y, width: card.line.len }
          }
          aria-hidden="true"
        />
      )}
      <div
        ref={cardRef}
        key={i}
        className={`tour-card${box ? "" : " is-center"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        style={
          card
            ? { left: card.x, top: card.y, width: card.w }
            : { visibility: "hidden", width: CARD_W }
        }
      >
        {!last && (
          <p className="tour-count">
            {i + 1} of {steps.length - 1}
          </p>
        )}
        <h2 id="tour-title">{step.title}</h2>
        <div id="tour-text" className="tour-text">
          {step.text}
        </div>
        {step.why && (
          <p className="tour-why">
            <span className="tour-why-lbl">Why it's here</span>
            {step.why}
          </p>
        )}
        <div className="tour-foot">
          {last ? (
            <>
              {i > 0 && (
                <button type="button" className="tour-btn is-quiet" onClick={() => go(-1)}>
                  ← Back
                </button>
              )}
              <button type="button" className="tour-btn is-main" ref={nextRef} onClick={onClose}>
                {step.done ?? "Done"}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="tour-btn is-quiet" onClick={onClose}>
                End tour
              </button>
              <span className="tour-foot-nav">
                {i > 0 && (
                  <button type="button" className="tour-btn" onClick={() => go(-1)}>
                    ← Back
                  </button>
                )}
                <button type="button" className="tour-btn is-main" ref={nextRef} onClick={() => go(1)}>
                  Next →
                </button>
              </span>
            </>
          )}
        </div>
        {!last && <p className="tour-hint">Click the grey area to move on · Esc to end</p>}
      </div>
    </div>
  );
}
