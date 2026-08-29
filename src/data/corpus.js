import corpus from "./corpus.json";

export const { sessions, moves, categories, spectrum, grades, stats } = corpus;

export const moveName = (code) => (moves[code] ? moves[code].name : code);

export const sessionsByGrade = (grade) =>
  sessions.filter((s) => s.grade === Number(grade));

export const findSession = (id) => sessions.find((s) => s.id === id);

// Where a session sits among the others at its grade, so the session screen
// can offer previous / next without the reader going back up a level.
export function neighbours(id) {
  const session = findSession(id);
  if (!session) return { prev: null, next: null, index: 0, total: 0 };
  const siblings = sessionsByGrade(session.grade);
  const i = siblings.findIndex((s) => s.id === id);
  return {
    prev: i > 0 ? siblings[i - 1] : null,
    next: i < siblings.length - 1 ? siblings[i + 1] : null,
    index: i + 1,
    total: siblings.length,
  };
}

// Grade tiers in order, with what sits in each.
export const gradeTiers = Object.keys(grades)
  .map(Number)
  .sort((a, b) => a - b)
  .map((grade) => {
    const inTier = sessionsByGrade(grade);
    return {
      grade,
      label: grades[String(grade)],
      count: inTier.length,
      strands: [...new Set(inTier.map((s) => s.strand))],
    };
  });

// One colour per grade, ramping blue to crimson so the sequence itself reads
// as level ascending. Only the ink is stored; the card surface and border are
// derived from it in CSS with color-mix.
// The span the library is meant to cover. Only some of it is populated; the
// grade page shows the whole range so the gap is visible rather than implied.
export const GRADE_SPAN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const availableGrades = new Set(gradeTiers.map((t) => t.grade));

// A colour for every level in the span, ramping violet through to plum so
// the sequence itself reads as level ascending. Grades with no questions yet
// still carry their hue — they just sit dark, the way unbuilt subjects do.
export const gradeColor = {
  1: "#4a4fb5",
  2: "#1f5fa8",
  3: "#1976d2",
  4: "#0f7a86",
  5: "#2e7d32",
  6: "#827717",
  7: "#b06a00",
  8: "#c2521a",
  9: "#c2185b",
  10: "#a8226b",
  11: "#7b1fa2",
  12: "#5b3fa8",
};

export const gradeLabel = (g) => `Grade ${g}`;

// Every level in the span, each carrying whatever the corpus holds for it.
export const allGrades = GRADE_SPAN.map((grade) => {
  const inTier = sessionsByGrade(grade);
  return {
    grade,
    label: gradeLabel(grade),
    count: inTier.length,
    strands: [...new Set(inTier.map((s) => s.strand))],
    available: inTier.length > 0,
  };
});

// ---------------------------------------------------------------- moves
// The researcher path is the practitioner path inverted: instead of working
// down from a subject to one conversation, you start from a teaching move and
// see everywhere it is demonstrated.
//
// Built from the curated sessions only, so every example links through to a
// transcript you can actually read.

const emptyEntry = (code) => ({
  code,
  name: moves[code].name,
  def: moves[code].def,
  category: moves[code].category,
  rung: moves[code].rung,
  examples: [],
  contested: [],
});

const index = new Map();

sessions.forEach((s) => {
  const context = { sid: s.id, topic: s.topic, grade: s.grade, strand: s.strand };
  s.msgs.forEach((m) => {
    if (!m.x) return;

    // A confidently-labelled turn is an example of each move it carries.
    m.m.forEach((code) => {
      if (!moves[code]) return;
      if (!index.has(code)) index.set(code, emptyEntry(code));
      index.get(code).examples.push({
        ...context,
        n: m.n,
        text: m.s,
        // Generated explanations are per-move boilerplate — the same sentence
        // on every instance — so only a hand-written one earns a line here.
        // What varies per example is the cues, so those carry the card.
        why: m.hand ? m.x.why : null,
        clues: (m.x.clues || []).filter((c) => c.q),
        alsoTagged: m.m.filter((c) => c !== code),
      });
    });

    // A contested turn is not an example of either reading — but it is
    // evidence about where the boundary of each one is unclear.
    (m.alt || []).forEach((code) => {
      if (!moves[code]) return;
      if (!index.has(code)) index.set(code, emptyEntry(code));
      index.get(code).contested.push({
        ...context,
        n: m.n,
        text: m.s,
        against: (m.alt || []).filter((c) => c !== code),
      });
    });
  });
});

export const moveIndex = index;
export const findMove = (code) => index.get(code) || null;

// The four groups of the taxonomy, each holding the moves demonstrated in the
// corpus, commonest first.
export const moveGroups = Object.keys(categories).map((cat) => {
  const inGroup = [...index.values()]
    .filter((m) => m.category === cat)
    .sort((a, b) => b.examples.length - a.examples.length);
  return {
    category: cat,
    label: categories[cat],
    moves: inGroup,
    total: inGroup.reduce((n, m) => n + m.examples.length, 0),
  };
}).filter((g) => g.moves.length > 0);

// Categorical slots 1-4, in fixed order — validated for adjacent-pair CVD
// separation on a light surface. Counts are always shown as text beside each
// bar, which is what the contrast relief rule requires for the aqua and
// yellow slots.
export const categoryColor = {
  learning: "#2a78d6",
  tutoring: "#eb6834",
  social: "#1baf7a",
  logistical: "#eda100",
};

// One-hue sequential ramp for the six rungs of the cognitive-responsibility
// spectrum: light means the student holds the thinking, dark means the tutor
// has taken it over.
export const rungColor = {
  1: "#9ec5f4",
  2: "#6da7ec",
  3: "#3987e5",
  4: "#256abf",
  5: "#184f95",
  6: "#0d366b",
};
