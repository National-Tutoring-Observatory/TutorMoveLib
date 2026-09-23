import { useEffect, useRef, useState } from "react";

// Shown once per visit (sessionStorage, not localStorage): someone who comes
// back tomorrow, or opens the link from a slide in a fresh tab, sees it again.
// Bump the key if the wording changes enough that everyone should re-read it.
const KEY = "tml-prototype-notice-v1";

function alreadySeen() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export default function PrototypeNotice() {
  const [open, setOpen] = useState(() => !alreadySeen());
  const okRef = useRef(null);

  const close = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode etc. — just close for now */
    }
    setOpen(false);
  };

  // Focus the button on open; Escape closes.
  useEffect(() => {
    if (!open) return;
    okRef.current?.focus();
    const onKey = (ev) => {
      if (ev.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="notice-scrim" onClick={close} />
      <div
        className="notice-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        aria-describedby="notice-body"
      >
        <p className="notice-kicker">Early prototype · Testing in progress</p>
        <h2 id="notice-title">Thanks for taking a look</h2>
        <div id="notice-body" className="notice-body">
          <p>
            This is a very early prototype of the Tutoring Moves Library, and we
            are still testing it.
          </p>
          <p>
            Everything here is a work in progress. The design, the content, and
            the features may all change, and nothing you see should be taken as
            a preview of a future or final product.
          </p>
        </div>
        <div className="notice-foot">
          <button type="button" className="notice-ok" ref={okRef} onClick={close}>
            Got it, continue
          </button>
        </div>
      </div>
    </>
  );
}
