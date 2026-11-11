import { useEffect, useRef, useState } from "react";

/* A rail down the far left of the front page: a teal line that fills as
   the page scrolls, a glowing dot riding its leading edge, and one marker per
   section that lights up as the dot reaches it. Each marker sits where the
   scroll is when its section comes into view, so the dot meets the marker
   just as the section arrives. Click a marker to glide to its section.

   `sections` is a list of { id, label, name }: the element id to watch, the
   short label beside the marker, and the full name for screen readers.
   Only drawn on wide windows, where the margin has room for it (CSS). */
export default function ScrollRail({ sections }) {
  const railRef = useRef(null);
  const [stops, setStops] = useState([]); // 0..1 down the rail, per section
  const [active, setActive] = useState(0);
  const stopsRef = useRef([]);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const at = sections.map(({ id }, i) => {
        const el = document.getElementById(id);
        if (!el || i === 0 || max <= 0) return 0;
        // A section "arrives" when its top is a third of the way down the window.
        const top = el.getBoundingClientRect().top + window.scrollY;
        return Math.min(1, Math.max(0, (top - window.innerHeight * 0.35) / max));
      });
      stopsRef.current = at;
      setStops(at);
      return max;
    };
    let max = measure();

    const update = () => {
      frame = 0;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      railRef.current?.style.setProperty("--p", p.toFixed(4));
      let a = 0;
      stopsRef.current.forEach((s, i) => {
        if (p >= s - 0.002) a = i;
      });
      setActive(a);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      max = measure();
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Fonts and images change the page height after first paint.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [sections]);

  const go = (i) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: (stops[i] ?? 0) * max, behavior: still ? "auto" : "smooth" });
  };

  return (
    <nav className="rail" ref={railRef} aria-label="Sections of this page">
      <span className="rail-track" aria-hidden="true">
        <span className="rail-fill" />
        <span className="rail-dot" />
      </span>
      <ol className="rail-stops">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className={`rail-stop${i <= active ? " is-reached" : ""}${i === active ? " is-active" : ""}`}
            style={{ top: `${(stops[i] ?? 0) * 100}%` }}
          >
            <button
              type="button"
              onClick={() => go(i)}
              aria-label={s.name}
              aria-current={i === active ? "true" : undefined}
            >
              <span className="rail-mark" aria-hidden="true" />
              <span className="rail-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
