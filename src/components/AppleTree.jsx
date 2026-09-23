import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { allGrades, gradeColor } from "../data/corpus.js";

// One apple per grade, hung through the canopy. Coordinates are in the
// 640x600 viewBox; lower grades hang low, higher grades hang high, the way
// you would climb a ladder for them.
const SPOTS = {
  1: [168, 420],
  2: [262, 446],
  3: [372, 440],
  4: [478, 412],
  5: [122, 330],
  6: [232, 342],
  7: [342, 348],
  8: [452, 322],
  9: [532, 262],
  10: [186, 232],
  11: [300, 210],
  12: [436, 242],
};

// A proper apple: two lobes, a dimple at the top for the stem.
function applePath(r) {
  return [
    `M0 ${-0.55 * r}`,
    `C ${0.35 * r} ${-1.08 * r} ${1.08 * r} ${-0.75 * r} ${1.0 * r} ${-0.05 * r}`,
    `C ${0.95 * r} ${0.62 * r} ${0.5 * r} ${1.02 * r} 0 ${0.9 * r}`,
    `C ${-0.5 * r} ${1.02 * r} ${-0.95 * r} ${0.62 * r} ${-1.0 * r} ${-0.05 * r}`,
    `C ${-1.08 * r} ${-0.75 * r} ${-0.35 * r} ${-1.08 * r} 0 ${-0.55 * r}`,
    "Z",
  ].join(" ");
}

function Apple({ tier, hovered, onHover, onLeave, onPick }) {
  const [x, y] = SPOTS[tier.grade];
  const ripe = tier.available;
  const r = ripe ? 27 : 17;
  const fill = ripe ? gradeColor[tier.grade] : "#dbe7a6";
  const stroke = ripe ? "rgba(20, 30, 10, 0.35)" : "#93a862";

  return (
    <g
      className={`apple${ripe ? " ripe" : " unripe"}${hovered ? " hovered" : ""}`}
      style={{ "--drop-delay": `${tier.grade * 45}ms` }}
      transform={`translate(${x} ${y})`}
      tabIndex={ripe ? 0 : -1}
      role={ripe ? "button" : undefined}
      aria-label={
        ripe
          ? `${tier.label}, ${tier.count} ${tier.count === 1 ? "question" : "questions"}`
          : `${tier.label}, no questions yet`
      }
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={ripe ? onPick : undefined}
      onKeyDown={(e) => {
        if (ripe && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onPick();
        }
      }}
    >
      {/* fixed hit target: never scales, so hover can't flicker */}
      <circle r={r + 10} fill="transparent" />
      <g className="apple-drop">
        <g className="apple-body">
          {/* shadow on the leaves behind it */}
          <ellipse cy={r * 0.95} rx={r * 0.85} ry={r * 0.22} fill="#000" opacity="0.18" />
          {/* stem + leaf */}
          <path
            d={`M0 ${-r * 0.55} C ${r * 0.05} ${-r * 0.85} ${r * 0.15} ${-r * 1.05} ${r * 0.3} ${-r * 1.2}`}
            stroke="#5a3a1a"
            strokeWidth={ripe ? 3.2 : 2.2}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${r * 0.12} ${-r * 1.0} C ${r * 0.45} ${-r * 1.45} ${r * 0.95} ${-r * 1.3} ${r * 0.98} ${-r * 0.95} C ${r * 0.6} ${-r * 0.7} ${r * 0.3} ${-r * 0.78} ${r * 0.12} ${-r * 1.0} Z`}
            fill="#4f9a3a"
          />
          <path
            d={`M${r * 0.16} ${-r * 0.98} L ${r * 0.9} ${-r * 0.97}`}
            stroke="#2f6f2a"
            strokeWidth="1"
            opacity="0.6"
          />
          {/* body */}
          <path d={applePath(r)} fill={fill} stroke={stroke} strokeWidth={ripe ? 2 : 1.5} strokeLinejoin="round" />
          <path d={applePath(r)} fill="url(#appleShade)" />
          <ellipse
            cx={-r * 0.42}
            cy={-r * 0.32}
            rx={r * 0.17}
            ry={r * 0.3}
            transform={`rotate(-18 ${-r * 0.42} ${-r * 0.32})`}
            fill="#fff"
            opacity={ripe ? 0.5 : 0.7}
          />
          <text
            y={r * 0.34}
            textAnchor="middle"
            fontSize={ripe ? 21 : 13}
            fontWeight="700"
            fill={ripe ? "#fff" : "#5f7a2c"}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {tier.grade}
          </text>
        </g>
      </g>
    </g>
  );
}

// A friendly bear in Cornell red, sitting in front of the tree with an apple.
function Bear() {
  const red = "#b31b1b";
  const dark = "#7a1010";
  const tan = "#f2d3a7";
  return (
    <g className="bear" aria-hidden="true" transform="translate(440 0)">
      {/* shadow */}
      <ellipse cx="0" cy="556" rx="42" ry="7" fill="#2f6f2a" opacity="0.28" />
      {/* legs */}
      <ellipse cx="-24" cy="546" rx="17" ry="11" fill={red} stroke={dark} strokeWidth="1.5" />
      <ellipse cx="24" cy="546" rx="17" ry="11" fill={red} stroke={dark} strokeWidth="1.5" />
      <ellipse cx="-27" cy="548" rx="8" ry="5" fill={tan} />
      <ellipse cx="27" cy="548" rx="8" ry="5" fill={tan} />
      {/* body */}
      <ellipse cx="0" cy="516" rx="34" ry="38" fill={red} stroke={dark} strokeWidth="1.5" />
      <ellipse cx="0" cy="524" rx="20" ry="24" fill={tan} />
      {/* left arm resting */}
      <path d="M-28 506 C -46 514 -48 530 -36 538" stroke={dark} strokeWidth="1.5" fill={red} strokeLinecap="round" />
      <ellipse cx="-36" cy="536" rx="8" ry="6" fill={red} stroke={dark} strokeWidth="1.5" />
      {/* right arm holding an apple */}
      <path d="M26 504 C 46 500 56 488 52 476" stroke={dark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M26 504 C 42 506 54 498 52 476 L 46 478 C 46 492 38 498 26 500 Z" fill={red} />
      <ellipse cx="51" cy="474" rx="8" ry="6" fill={red} stroke={dark} strokeWidth="1.5" />
      <g transform="translate(58 462)">
        <path d="M0 -3 q1 -6 5 -8" stroke="#5a3a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M1 -8 q6 -6 11 -1 q-6 5 -11 1z" fill="#4f9a3a" />
        <path d={applePath(10)} fill="#c8102e" stroke="rgba(20,30,10,0.35)" strokeWidth="1.2" />
        <ellipse cx="-4" cy="-3" rx="2" ry="3" fill="#fff" opacity="0.55" />
      </g>
      {/* head */}
      <circle cx="-23" cy="450" r="10" fill={red} stroke={dark} strokeWidth="1.5" />
      <circle cx="23" cy="450" r="10" fill={red} stroke={dark} strokeWidth="1.5" />
      <circle cx="-23" cy="450" r="5" fill={tan} />
      <circle cx="23" cy="450" r="5" fill={tan} />
      <circle cx="0" cy="472" r="30" fill={red} stroke={dark} strokeWidth="1.5" />
      <ellipse cx="0" cy="482" rx="15" ry="11" fill={tan} />
      <ellipse cx="0" cy="477" rx="5.5" ry="4" fill="#2b1a12" />
      <path d="M-5 486 q5 4 10 0" stroke="#2b1a12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="-11" cy="466" r="3.2" fill="#2b1a12" />
      <circle cx="11" cy="466" r="3.2" fill="#2b1a12" />
      <circle cx="-10" cy="465" r="1" fill="#fff" />
      <circle cx="12" cy="465" r="1" fill="#fff" />
    </g>
  );
}

// A few round-topped tufts of grass along the hill so it isn't a bare line.
const TUFTS = [-150, -80, 70, 140, 215, 470, 545, 600, 700, 790];

// On a wide screen the panel is wider than it is tall, so the drawing shows
// more sky and hill either side of the tree instead of leaving pale gutters.
function useWide() {
  const q = "(min-width: 900px)";
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = (e) => setWide(e.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

export default function AppleTree() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);
  const active = hover ? allGrades.find((t) => t.grade === hover) : null;
  const ripeCount = allGrades.filter((t) => t.available).length;
  const wide = useWide();

  return (
    <div className="orchard">
      <div className="orchard-scene">
        <svg
          className="apple-tree"
          viewBox={wide ? "-160 0 960 600" : "0 0 640 600"}
          role="group"
          aria-label="Grade levels, one apple each"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dcedf6" />
              <stop offset="1" stopColor="#f6fbfd" />
            </linearGradient>
            <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c9e3ad" />
              <stop offset="1" stopColor="#b3d69a" />
            </linearGradient>
            <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9fcf7c" />
              <stop offset="1" stopColor="#77b85e" />
            </linearGradient>
            <radialGradient id="canopyBack" cx="0.5" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#3f8a34" />
              <stop offset="1" stopColor="#2c6b28" />
            </radialGradient>
            <radialGradient id="canopyFront" cx="0.38" cy="0.32" r="0.8">
              <stop offset="0" stopColor="#8fd170" />
              <stop offset="0.55" stopColor="#5fae4b" />
              <stop offset="1" stopColor="#3f8a34" />
            </radialGradient>
            <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8a5a33" />
              <stop offset="0.5" stopColor="#6b4526" />
              <stop offset="1" stopColor="#4f3219" />
            </linearGradient>
            <radialGradient id="appleShade" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* sky and hills */}
          <rect x="-200" width="1040" height="600" fill="url(#sky)" />
          <path d="M-200 480 C -100 450 -20 440 0 470 C 120 420 260 440 340 452 C 440 466 540 430 640 448 C 720 462 780 440 840 456 L840 600 L-200 600Z" fill="url(#hillFar)" />
          <path d="M-200 530 C -120 510 -60 512 0 520 C 140 490 250 512 330 508 C 430 502 520 484 640 512 C 720 530 780 520 840 528 L840 600 L-200 600Z" fill="url(#hillNear)" />
          {TUFTS.map((tx) => (
            <path
              key={tx}
              d={`M${tx} 548 q4 -14 8 0 M${tx + 8} 548 q3 -10 6 0 M${tx - 6} 548 q3 -9 6 0`}
              stroke="#4f9a3a"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* tree shadow on the grass */}
          <ellipse cx="322" cy="540" rx="160" ry="16" fill="#2f6f2a" opacity="0.22" />

          {/* trunk and boughs */}
          <path
            d="M292 540 C 300 480 292 430 280 392 L 360 392 C 348 430 340 480 348 540 Z"
            fill="url(#bark)"
          />
          <path d="M282 400 C 250 372 208 366 188 320 L 224 336 C 246 356 270 378 296 396 Z" fill="url(#bark)" />
          <path d="M358 400 C 390 372 432 366 452 320 L 416 336 C 394 356 370 378 344 396 Z" fill="url(#bark)" />
          <path d="M310 400 C 306 360 312 330 320 300" stroke="#4f3219" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M304 470 c 6 20 4 40 2 60 M336 480 c -4 18 -2 36 0 52" stroke="#4f3219" strokeWidth="1.6" fill="none" opacity="0.55" />

          {/* canopy: a dark back layer, a lit front layer */}
          <g fill="url(#canopyBack)">
            <circle cx="320" cy="250" r="150" />
            <circle cx="180" cy="330" r="122" />
            <circle cx="462" cy="330" r="122" />
            <circle cx="250" cy="410" r="108" />
            <circle cx="392" cy="410" r="108" />
            <circle cx="320" cy="160" r="105" />
          </g>
          <g fill="url(#canopyFront)">
            <circle cx="312" cy="236" r="132" />
            <circle cx="186" cy="322" r="104" />
            <circle cx="452" cy="318" r="104" />
            <circle cx="256" cy="398" r="92" />
            <circle cx="386" cy="398" r="92" />
            <circle cx="316" cy="152" r="90" />
          </g>
          {/* a little dappled light */}
          <g fill="#c8ec9f" opacity="0.5">
            <ellipse cx="270" cy="150" rx="34" ry="14" transform="rotate(-20 270 150)" />
            <ellipse cx="392" cy="260" rx="26" ry="10" transform="rotate(-25 392 260)" />
            <ellipse cx="150" cy="300" rx="22" ry="9" transform="rotate(-15 150 300)" />
          </g>

          <Bear />

          {allGrades.map((tier) => (
            <Apple
              key={tier.grade}
              tier={tier}
              hovered={hover === tier.grade}
              onHover={() => setHover(tier.grade)}
              onLeave={() => setHover(null)}
              onPick={() => navigate(`/mathematics/g/${tier.grade}`)}
            />
          ))}
        </svg>

        <aside className={`orchard-card${active ? " live" : ""}`} aria-live="polite">
          {active ? (
            <>
              <p className="orchard-grade" style={{ color: gradeColor[active.grade] }}>
                {active.label}
              </p>
              {active.available ? (
                <>
                  <p className="orchard-count">
                    {active.count} {active.count === 1 ? "question" : "questions"}
                  </p>
                  <p className="orchard-strands">{active.strands.join(", ")}</p>
                  <button
                    className="orchard-open"
                    style={{ "--apple": gradeColor[active.grade] }}
                    onClick={() => navigate(`/mathematics/g/${active.grade}`)}
                  >
                    Open {active.label}
                  </button>
                </>
              ) : (
                <p className="orchard-strands">
                  Still growing. No questions for this grade in the preview yet.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="orchard-grade">Pick an apple</p>
              <p className="orchard-strands">
                Each apple is a grade. {ripeCount} are ripe and hold questions. The small
                green ones are still growing.
              </p>
            </>
          )}
        </aside>
      </div>

      <ul className="orchard-legend" aria-label="Legend">
        <li>
          <span className="orchard-swatch ripe" /> Ripe: has questions
        </li>
        <li>
          <span className="orchard-swatch unripe" /> Growing: none yet
        </li>
      </ul>
    </div>
  );
}
