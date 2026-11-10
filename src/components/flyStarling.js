/* Easter egg: click the starling in the top bar and it takes off, swoops
   down across the window, turns round at the right-hand side, and flies back
   to land on its perch, never leaving the screen.

   The bird in flight is a copy appended to <body>, outside React, so it keeps
   flying whatever the page does meanwhile. The perched mark is hidden by a
   class on <body> until the copy lands. */

let flying = false;

export function flyStarling(markEl) {
  if (flying || !markEl) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  flying = true;

  const r = markEl.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Outer box moves along the path; the image inside flaps.
  const bird = document.createElement("div");
  bird.className = "starling-flight";
  Object.assign(bird.style, {
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  });
  const img = document.createElement("img");
  img.src = markEl.currentSrc || markEl.src;
  img.alt = "";
  bird.appendChild(img);
  document.body.appendChild(bird);
  document.body.classList.add("starling-flying");

  // dir -1 mirrors the bird so it faces the way it is flying; the scale
  // passing through zero between keyframes reads as the bird turning round.
  const at = (x, y, rot = 0, sc = 1, dir = 1) => ({
    transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc * dir}, ${sc})`,
  });

  // The flight stays on screen: a loop around the window and home again.
  // Points are fractions of the room the bird has, so it never leaves the
  // window, at any size.
  const pad = 16;
  const roomX = Math.max(0, vw - r.left - r.width * 1.5 - pad);
  const roomY = Math.max(0, vh - r.top - r.height * 1.5 - pad);
  const p = (fx, fy, rot, sc, dir) => at(roomX * fx, roomY * fy, rot, sc, dir);

  const tour = bird.animate(
    [
      { ...at(0, 0), offset: 0 },
      { ...at(14, Math.min(20, roomY * 0.05), 8, 1.05), offset: 0.06 },
      { ...p(0.3, 0.35, 12, 1.3), offset: 0.2 },
      { ...p(0.62, 0.7, 4, 1.45), offset: 0.36 },
      { ...p(0.95, 0.45, -18, 1.4), offset: 0.5 },
      { ...p(0.88, 0.15, 10, 1.35, -1), offset: 0.6 },
      { ...p(0.5, 0.3, -6, 1.3, -1), offset: 0.72 },
      { ...p(0.15, 0.2, 8, 1.15, -1), offset: 0.84 },
      { ...at(12, 10, -6, 1.05), offset: 0.94 },
      { ...at(0, 0), offset: 1 },
    ],
    { duration: 4200, easing: "ease-in-out", fill: "forwards" }
  );

  const flap = img.animate(
    [
      { transform: "scaleY(1) translateY(0)" },
      { transform: "scaleY(0.72) translateY(3px)" },
      { transform: "scaleY(1) translateY(0)" },
    ],
    { duration: 220, iterations: Infinity }
  );

  tour.finished
    .catch(() => {})
    .finally(() => {
      flap.cancel();
      bird.remove();
      document.body.classList.remove("starling-flying");
      flying = false;
    });
}
