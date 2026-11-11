/* Easter egg: click the starling in the top bar and it takes off, swoops
   down across the window, turns round at the right-hand side, and flies back
   to land on its perch, never leaving the screen.

   The bird in flight is a copy appended to <body>, outside React, so it keeps
   flying whatever the page does meanwhile. The perched mark is hidden by a
   class on <body> until the copy lands. In the air it is drawn from three
   wing frames (up, level, down), cycled up-level-down-level so it flaps. */

import wingUp from "../assets/starling-flight-1.png";
import wingLevel from "../assets/starling-flight-2.png";
import wingDown from "../assets/starling-flight-3.png";

// One wingbeat: each step is a frame, how long it shows, and a small lift
// (px) so the body rises on the downstroke and sinks on the upstroke.
const WINGBEAT = [
  { src: wingUp, ms: 75, lift: 1.5 },
  { src: wingLevel, ms: 55, lift: 0 },
  { src: wingDown, ms: 75, lift: -1.5 },
  { src: wingLevel, ms: 55, lift: 0 },
];
// The flight frames' width / height, so the box keeps their shape.
const FRAME_ASPECT = 240 / 263;

let preloaded = false;
// Fetch the wing frames ahead of the first click (called when the pointer reaches the mark),
// so the first flap doesn't flicker while they load.
export function preloadStarling() {
  if (preloaded) return;
  preloaded = true;
  for (const { src } of WINGBEAT) new Image().src = src;
}

let flying = false;

export function flyStarling(markEl) {
  if (flying || !markEl) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  flying = true;
  preloadStarling();

  // The flying bird is as wide as the perched mark, and centred on it.
  const m = markEl.getBoundingClientRect();
  const h = m.width / FRAME_ASPECT;
  const r = { left: m.left, top: m.top + (m.height - h) / 2, width: m.width, height: h };
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
  img.src = WINGBEAT[0].src;
  img.alt = "";
  bird.appendChild(img);
  document.body.appendChild(bird);
  document.body.classList.add("starling-flying");

  // dir -1 mirrors the bird so it faces the way it is flying; the scale
  // passing through zero between keyframes reads as the bird turning round.
  const at = (x, y, rot = 0, sc = 1, dir = 1) => ({
    transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc * dir}, ${sc})`,
  });

  // The flight stays on screen: a new random route round the window every
  // time, then home again. Points are fractions of the room the bird has,
  // so it never leaves the window, at any size.
  const pad = 16;
  const roomX = Math.max(0, vw - r.left - r.width * 1.5 - pad);
  const roomY = Math.max(0, vh - r.top - r.height * 1.5 - pad);
  const { frames, duration } = randomRoute(roomX, roomY, at);

  const tour = bird.animate(frames, { duration, easing: "ease-in-out", fill: "forwards" });
  // Each flight beats its wings at a slightly different pace.
  const tempo = rand(0.85, 1.15);

  // Flap: step through the wingbeat frames until the bird lands.
  let step = 0;
  let flapTimer;
  const flap = () => {
    const { src, ms, lift } = WINGBEAT[step];
    img.src = src;
    img.style.transform = `translateY(${lift}px)`;
    step = (step + 1) % WINGBEAT.length;
    flapTimer = setTimeout(flap, ms * tempo);
  };
  flap();

  tour.finished
    .catch(() => {})
    .finally(() => {
      clearTimeout(flapTimer);
      bird.remove();
      document.body.classList.remove("starling-flying");
      flying = false;
    });
}

const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* A random route: take off with a dip to the right, wander through three to
   five waypoints spread across the room (each at least a fifth of the room
   from the last, sideways or up/down, so no two legs bunch up), swing back
   near the perch and land. The bird faces the way it is going and tilts its
   nose along its climb or dive; where it doubles back it turns round quickly,
   just after the waypoint, rather than over the whole next leg. It looks a
   little bigger lower down, as if nearer. Keyframe offsets follow distance,
   so its speed stays even. */
function randomRoute(roomX, roomY, at) {
  const pts = [{ fx: rand(0.2, 0.5), fy: rand(0.25, 0.75) }];
  const n = 2 + Math.floor(Math.random() * 3);
  while (pts.length <= n) {
    const prev = pts[pts.length - 1];
    const fx = rand(0.05, 0.98);
    const fy = rand(0.05, 0.9);
    if (Math.abs(fx - prev.fx) < 0.2 && Math.abs(fy - prev.fy) < 0.2) continue;
    pts.push({ fx, fy });
  }
  // Swing back near the perch, so the last long leg heads home.
  pts.push({ fx: rand(0.08, 0.2), fy: rand(0.1, 0.3) });

  const path = [
    { x: 0, y: 0 },
    { x: 14, y: Math.min(20, roomY * 0.05) },
    ...pts.map(({ fx, fy }) => ({ x: roomX * fx, y: roomY * fy })),
    { x: 12, y: 10, land: true },
    { x: 0, y: 0 },
  ];
  const dist = [0];
  for (let i = 1; i < path.length; i++) {
    dist.push(dist[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
  }
  const total = dist[dist.length - 1] || 1;

  // How the bird holds itself on the leg into path[i].
  const pose = (i) => {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const dir = path[i].land || dx >= 0 ? 1 : -1; // it perches facing right
    const climb = (Math.atan2(dy, Math.abs(dx) || 1) * 180) / Math.PI;
    return { dir, rot: dir * clamp(climb * 0.5, -18, 14) };
  };
  const size = (i) =>
    i === 1 || path[i].land ? 1.05 : 1.15 + 0.3 * (path[i].y / (roomY || 1)) + rand(-0.05, 0.05);

  const frames = [{ ...at(0, 0), offset: 0 }];
  for (let i = 1; i < path.length - 1; i++) {
    const { dir, rot } = pose(i);
    const sc = size(i);
    frames.push({ ...at(path[i].x, path[i].y, rot, sc, dir), offset: dist[i] / total });
    // Doubling back: turn round a tenth of the way into the next leg.
    const next = pose(i + 1);
    if (i + 1 < path.length - 1 && !path[i + 1].land && next.dir !== dir) {
      const t = 0.1;
      const x = path[i].x + (path[i + 1].x - path[i].x) * t;
      const y = path[i].y + (path[i + 1].y - path[i].y) * t;
      frames.push({ ...at(x, y, next.rot, sc, next.dir), offset: (dist[i] + (dist[i + 1] - dist[i]) * t) / total });
    }
  }
  frames.push({ ...at(0, 0), offset: 1 });

  const duration = clamp(1500 + total * 1.4, 4200, 7500);
  return { frames, duration };
}
