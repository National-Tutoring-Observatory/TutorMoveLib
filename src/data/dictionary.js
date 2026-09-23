import corpus from "./corpus.json";
import raw from "./dictionary.json";

const { renames } = corpus;

// The 29 moves of the taxonomy paper, with a teacher-facing definition and
// the example quotations from the definitions sheet. This is a wider
// vocabulary than the 25 codes that occur in the corpus.
export const entries = raw;

export const parts = {
  tutoring: {
    name: "Tutoring support",
    blurb: "Moves that support the tutor's own decisions about how to tutor.",
  },
  learning: {
    name: "Learning support",
    blurb:
      "Moves that support learning, from the most to the least student thinking expected.",
  },
  social: {
    name: "Social and emotional support",
    blurb: "Moves that support the student's wellbeing and motivation.",
  },
  logistical: {
    name: "Logistical support",
    blurb: "Moves that deal with the running of the session.",
  },
};

export const partOrder = ["tutoring", "learning", "social", "logistical"];

export const learningRungs = entries.filter((e) => e.cat === "learning").length;

const byCode = new Map(entries.map((e) => [e.code, e]));

// The corpus predates the paper and spells a few codes differently. Map any
// code the site uses onto the dictionary's spelling.
const aliases = { ...renames, PRAISING_TRAITS: "PRAISING_TRAIT" };
export const toDictionaryCode = (code) => aliases[code] || code;

// And back again, so a dictionary entry can link to its corpus page.
const toCorpus = new Map(Object.entries(aliases).map(([from, to]) => [to, from]));
export const toCorpusCode = (code) => toCorpus.get(code) || code;

export const findEntry = (code) => byCode.get(toDictionaryCode(code)) || null;

export const entriesIn = (cat) => entries.filter((e) => e.cat === cat);

// The first quotation of an entry, as plain text, for compact displays.
export function firstQuote(e) {
  const it = e.ex[0];
  if (!it) return "";
  if (it.t === "dialog") {
    const line = it.lines.find((l) => /tutor/i.test(l.who)) || it.lines[0];
    return line.say;
  }
  return it.q;
}
