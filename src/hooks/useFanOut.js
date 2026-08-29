import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures where each child of a grid lands, then hands it the vector back to
 * the grid's centre as --dx / --dy. The `fanOut` keyframes play that vector in
 * reverse, so the boxes appear to be thrown outward from a single point.
 *
 * Returns a ref for the grid and a `ready` flag — the grid stays hidden until
 * it has been measured, so nothing flashes in its final position first.
 */
export default function useFanOut(count) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }

    const box = grid.getBoundingClientRect();
    const cx = box.width / 2;
    const cy = box.height / 2;

    Array.from(grid.children).forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const dx = cx - (r.left - box.left + r.width / 2);
      const dy = cy - (r.top - box.top + r.height / 2);
      card.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      card.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      // Fan outward from the middle of the set rather than left-to-right.
      const rank = Math.abs(i - (count - 1) / 2);
      card.style.setProperty("--delay", `${150 + rank * 62}ms`);
    });

    setReady(true);
  }, [count]);

  return { ref, ready };
}
