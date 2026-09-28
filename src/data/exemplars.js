import { findSession, sessions } from "./corpus.js";
import { keyMoments, turnRung, whatNext } from "./moments.js";

/* Exemplars for a tutor's own session.

   The "bring your own session" preview reads a transcript the same way the
   library does (key moments, the thinking scale) and then, for each moment
   where the tutor took over the thinking, finds moments elsewhere in the
   library where a tutor in the same spot handed it back to the student.

   "The same spot" means the same kind of student message: stuck, a wrong
   answer, an attempt. "Handed it back" means the tutor's move sits at rung 3
   or below (student does the explaining / takes the step / works from a
   nudge). Only moments where the student then replied are used, so every
   exemplar can show what happened next. */

// The situations worth learning from. Hedging is close enough to stuck to
// share its examples; a question is answered like an attempt is.
const POOL_FOR = {
  stuck: ["stuck", "unsure"],
  unsure: ["unsure", "stuck"],
  wrong: ["wrong"],
  attempt: ["attempt", "wrong"],
  question: ["question", "attempt"],
};
export const REVIEWABLE = Object.keys(POOL_FOR);

// Took over: the tutor walked it through or supplied it (rung 4 and up).
export const TOOK_OVER = 4;
// Handed back: the student is doing the thinking (rung 1 to 3).
export const HANDED_BACK = 3;

let index = null;

/** Every key moment in the library, with what the reader needs to show it.
    Built once, on first use. */
function allMoments() {
  if (index) return index;
  index = [];
  sessions.forEach((s) => {
    keyMoments(s).forEach((k) => {
      const turn = s.msgs.find((m) => m.n === k.n);
      const cue = s.msgs.find((m) => m.n === k.cue);
      const next = whatNext(s, k.n).reply;
      index.push({
        sid: s.id,
        topic: s.topic,
        grade: s.grade,
        kind: k.kind,
        situation: k.situation,
        n: k.n,
        rung: turnRung(turn),
        moves: turn.m,
        said: turn.s.trim(),
        cue: cue ? cue.s.trim() : "",
        next: next ? next.s.trim() : null,
        hand: Boolean(turn.hand),
      });
    });
  });
  return index;
}

/** Up to `limit` moments from other sessions where a tutor met the same kind
    of situation and left the thinking with the student. The exact situation
    first, then the closest grade, then hand-explained ones, then a stable
    order so the page never shuffles. `skip` holds "sid-n" keys already shown
    elsewhere on the page, so each example appears once. */
export function exemplarsFor(kind, { excludeSid, grade, limit = 3, skip = new Set() } = {}) {
  const pool = POOL_FOR[kind];
  if (!pool) return [];
  return allMoments()
    .filter(
      (e) =>
        e.sid !== excludeSid &&
        !skip.has(`${e.sid}-${e.n}`) &&
        pool.includes(e.kind) &&
        e.rung &&
        e.rung <= HANDED_BACK &&
        e.next
    )
    .map((e) => ({
      e,
      rank:
        pool.indexOf(e.kind) * 100 +
        Math.abs((grade ?? e.grade) - e.grade) * 10 +
        (e.hand ? 0 : 1),
    }))
    .sort((a, b) => a.rank - b.rank || a.e.sid.localeCompare(b.e.sid) || a.e.n - b.e.n)
    // One per session, so the examples show different tutors.
    .filter((x, i, arr) => arr.findIndex((y) => y.e.sid === x.e.sid) === i)
    .slice(0, limit)
    .map((x) => x.e);
}

/** A session read as if it had just been uploaded: its key moments, each
    marked as a moment to look at again, a moment that went well, or neither. */
export function review(sessionId) {
  const s = findSession(sessionId);
  if (!s) return null;
  const moments = keyMoments(s).map((k) => {
    const turn = s.msgs.find((m) => m.n === k.n);
    const cue = s.msgs.find((m) => m.n === k.cue);
    const rung = turnRung(turn);
    const reviewable = REVIEWABLE.includes(k.kind) && rung;
    return {
      ...k,
      rung,
      moves: turn.m,
      said: turn.s.trim(),
      cueText: cue ? cue.s.trim() : "",
      next: whatNext(s, k.n).reply,
      flag: !reviewable ? null : rung >= TOOK_OVER ? "again" : "well",
    };
  });

  const onScale = s.msgs.filter((m) => m.t && turnRung(m));
  const student = onScale.filter((m) => turnRung(m) <= HANDED_BACK).length;

  return {
    session: s,
    moments,
    labelled: s.msgs.filter((m) => m.x).length,
    scale: { total: onScale.length, student, tutor: onScale.length - student },
  };
}
