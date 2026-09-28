import { moves } from "./corpus.js";

/* Key moments.

   A whole transcript is too much to learn from at once. What novice tutors
   find hardest is the moment straight after the student has spoken — an
   answer, a mistake, "I don't get it" — so those are the turns worth pausing
   on. Everything here is derived from the transcript itself; nothing is
   hand-picked, so every session gets the same treatment.

   A key moment is a labelled tutor turn that answers a student message. In
   priority order:
     1. the tutor's response to a wrong answer (marked by feedback or a
        correction prompt somewhere in the tutor's reply);
     2. the tutor's first substantive move after the student says they are
        stuck — past any "let me have a look" or small talk;
     3. the tutor handing over the answer, or a large jump in who holds the
        thinking compared with the tutor's previous move;
     4. then questions, right answers and other replies, as filler.
   Picks are spread through the session and varied in kind, capped at five.
   Pure functions of the session: no state, safe to call on every render. */

const WRONG = ["FEEDBACK_INCORRECT", "PROMPTING_CORRECTION"];
const RIGHT = ["FEEDBACK_CORRECT", "PRAISING_OUTCOME"];
const SUPPLY = ["GIVING_ANSWER", "GIVING_HINT"];
// Moves that do not yet engage with the maths, so they are not the tutor's
// real answer to "I'm stuck".
const NOT_YET = [
  "BUILDING_RAPPORT",
  "VALIDATING_FEELING",
  "ENCOURAGING",
  "ASKING_FEELING",
  "MANAGING",
  "TECHNICAL_ISSUES",
  "FEEDBACK_NEUTRAL",
];

const STUCK =
  /confus|stuck|\blost\b|no idea|\bidk\b|\bhard\b|can'?t (find|do|work|get|see)|(don'?t|dont|don’t|do not|didn'?t|still)\s+(really\s+)?(get|understand|know)|help (me|with|pl|please)|(need|have|get|want|some) (some )?help|(you|u) help|please help|^\s*help|(talk|walk) me through|how (do|would|can) (i|you)\b(?! say)|what do i do|what to do|how to (do|work|solve|start)|^\s*\?+\s*$/i;
// Hedging — the student has a go but says they are not sure.
const UNSURE = /not (really |too |to |very |quite )?sure|unsure|^\s*(erm+|um+|hmm+|uh+)\W*$/i;
// Thanks and "I get it now" mention help and understanding without being stuck.
const NOT_STUCK = /thank|thnk|thx|helped|helping|helper|understand (it )?now|i understand|get it now/i;
const AGREE = /^\s*(ok(ay)?|o+h+( ?ok(ay)?)?|ye(s|ah|p|s please)?|yep+b?|mhm|sure|right|cool|thanks?( you)?|ty|alright|fine|k)\b[\s\p{P}\p{Extended_Pictographic}]*$/iu;
const DISAGREE = /^\s*(no|nope|nah)\b[\s\p{P}\p{Extended_Pictographic}]*$/iu;
// Emoji or punctuation on its own is a nod, not a reply with content.
const NOD = /^[\s!.\p{Extended_Pictographic}\u200d\ufe0f]*$/u;
const isAck = (t) => AGREE.test(t) || DISAGREE.test(t) || NOD.test(t);
const REASON = /\b(i think|because|cos|cause|since|so the|so it|that means|would be)\b/i;
const ANSWERISH =
  /\d|^\s*[a-d]\s*[?!.)]*\s*$|\b(is|it'?s|its|be|got|answer|choose|pick)\s+[a-d]\s*[?!.)]*\s*$|\bis it\b|\b(is|are) (correct|right)\b|\bneither\b|\bboth\b|^\s*\S+( \S+)?\s*\?\s*$/i;
// Chat that is about the tutor or the service rather than the maths.
const OFFTASK = /\b(are (you|u) (a |an )?(real|human|robot|bot|ai|person)|robot|do (you|u) teach|how are (you|u)|how old|your name|where do (you|u) live|(are|r) (you|u) a (teacher|tutor)|coins)\b/i;
const HELLO = /^\s*(hi+|hello+|hey+|hiya|good (morning|afternoon|evening))\b[\s\w]{0,12}[\s\p{P}\p{Extended_Pictographic}]*$/iu;
const GETIT = /\b(i get it|get it now|i understand|understand (it )?now|makes sense|i see)\b/i;
const QUESTION = /\?\s*$|^\s*(how|what|why|when|where|which|can|could|do|does|is|are|should|would|will)\b/i;

// The rung of a tutor turn: the first of its moves that sits on the ladder.
export function turnRung(msg) {
  if (!msg || !msg.t) return null;
  for (const code of msg.m) {
    const r = moves[code]?.rung;
    if (r) return r;
  }
  return null;
}

const substantive = (msg) =>
  msg.x && msg.m.some((c) => !NOT_YET.includes(c));

// The tutor messages that follow message index i, up to the next student one.
function runAfter(msgs, i) {
  const run = [];
  for (let j = i + 1; j < msgs.length && msgs[j].t; j++) run.push(msgs[j]);
  return run;
}

// A plain-language name for what the student just did, read from their words
// and from how the tutor took them.
function classify(student, run) {
  const text = student.s.trim();
  const codes = run.flatMap((m) => m.m);
  const has = (list) => codes.some((c) => list.includes(c));
  const stuck = STUCK.test(text) && !NOT_STUCK.test(text);
  const chatOnly =
    run.length > 0 &&
    run.every((m) => !m.x || m.m.every((c) => moves[c]?.category === "social")) &&
    !ANSWERISH.test(text) &&
    !/answer|\bright\b|correct/i.test(text);

  if (OFFTASK.test(text)) return { kind: "social", label: "Student chats" };
  if (has(WRONG)) return { kind: "wrong", label: "Student gives a wrong answer" };
  if (stuck) return { kind: "stuck", label: "Student says they're stuck" };
  if (UNSURE.test(text)) return { kind: "unsure", label: "Student isn't sure" };
  if (HELLO.test(text)) return { kind: "social", label: "Student says hello" };
  if (chatOnly) return { kind: "social", label: "Student chats" };
  if (/thank|thnk|thx|\bty\b/i.test(text) && !ANSWERISH.test(text))
    return { kind: "social", label: "Student thanks the tutor" };
  if (has(RIGHT) && !isAck(text))
    return { kind: "right", label: "Student answers correctly" };
  if (GETIT.test(text) && !/\b(don'?t|dont|don’t|not)\b/i.test(text))
    return { kind: "getit", label: "Student says they get it" };
  if (QUESTION.test(text) && !ANSWERISH.test(text))
    return { kind: "question", label: "Student asks a question" };
  if (REASON.test(text) && text.length > 15)
    return { kind: "explains", label: "Student explains their thinking" };
  if (ANSWERISH.test(text))
    return { kind: "attempt", label: "Student offers an answer" };
  if (has(RIGHT)) return { kind: "right", label: "Student answers correctly" };
  if (DISAGREE.test(text)) return { kind: "ack", label: "Student says no" };
  if (isAck(text)) return { kind: "ack", label: "Student agrees" };
  if (text.length > 40)
    return { kind: "explains", label: "Student explains their thinking" };
  return { kind: "reply", label: "Student replies" };
}

const BASE = {
  wrong: 100,
  stuck: 95,
  unsure: 80,
  question: 55,
  getit: 50,
  right: 45,
  attempt: 42,
  explains: 40,
  reply: 20,
  social: 10,
  ack: 8,
};

// Every student message that the tutor answers with a labelled turn, scored.
function candidates(session) {
  const msgs = session.msgs;
  const out = [];
  let stuckOpen = false; // a stuck message already has its moment

  msgs.forEach((student, i) => {
    if (student.t) return;
    const run = runAfter(msgs, i);
    const sit = classify(student, run);

    let turn;
    const stuckish = sit.kind === "stuck" || sit.kind === "unsure";
    if (stuckish) {
      if (stuckOpen) return;
      // Look past small talk, and past the student's "ok" while the tutor
      // settles in, for the first move that engages with the maths.
      let seenStudents = 0;
      for (let j = i + 1; j < msgs.length; j++) {
        const m = msgs[j];
        if (!m.t) {
          if (++seenStudents > 2 || !isAck(m.s)) break;
          continue;
        }
        if (substantive(m)) {
          turn = m;
          break;
        }
      }
      if (!turn) turn = run.find((m) => m.x);
    } else if (sit.kind === "wrong") {
      // The turn that actually marks it wrong, not the "don't worry" before it.
      turn = run.find((m) => m.m.some((c) => WRONG.includes(c)));
    } else {
      turn = run.find((m) => m.x);
    }
    if (!turn) return;
    stuckOpen = stuckish;

    let score = BASE[sit.kind];
    const rung = turnRung(turn);
    const supplies = turn.m.some((c) => SUPPLY.includes(c));
    if (turn.m.includes("GIVING_ANSWER")) score = Math.max(score, 85);
    else if (supplies && !stuckish) score = Math.max(score, 70);
    // The tutor's previous move on the ladder, wherever it fell.
    const at = msgs.indexOf(turn);
    let lastRung = null;
    for (let j = at - 1; j >= 0 && !lastRung; j--) lastRung = turnRung(msgs[j]);
    const shift = rung && lastRung ? Math.abs(rung - lastRung) : 0;
    const chat = sit.kind === "ack" || sit.kind === "social";
    if (shift >= 3 && !chat) score = Math.max(score, 60 + shift * 5);
    if (rung) score += 3; // a move on the ladder says more about the thinking
    if (turn.hand) score += 10; // and a hand-written explanation says more still

    out.push({
      n: turn.n,
      cue: student.n,
      kind: sit.kind,
      situation: sit.label,
      score,
      index: at,
    });
  });
  return out;
}

/** The session's key moments, in transcript order. Three to five where the
    conversation allows, fewer only when the student barely speaks. */
export function keyMoments(session) {
  if (!session) return [];
  const pool = candidates(session);
  const len = session.msgs.length;
  const gap = Math.max(2, Math.floor(len / 9));
  const picked = [];
  const kinds = {};

  const pick = (spread, floor) => {
    while (picked.length < 5) {
      let best = null;
      let bestScore = -Infinity;
      pool.forEach((c) => {
        // Two student messages can lead to the same tutor turn; keep one.
        if (picked.some((p) => p.n === c.n)) return;
        if (spread && picked.some((p) => Math.abs(p.index - c.index) < gap)) return;
        const s = c.score - 30 * (kinds[c.kind] || 0);
        if (s > bestScore) {
          best = c;
          bestScore = s;
        }
      });
      if (!best || (picked.length >= 3 && bestScore < floor)) return;
      picked.push(best);
      kinds[best.kind] = (kinds[best.kind] || 0) + 1;
    }
  };

  pick(true, 40);
  if (picked.length < 3) pick(false, -Infinity);

  return picked
    .sort((a, b) => a.index - b.index)
    .map((m, i) => ({ ...m, num: i + 1 }));
}

/** One line to read before watching, built from the moments that are there. */
export function framing(moments) {
  const has = (k) =>
    moments.some((m) => m.kind === k || (k === "stuck" && m.kind === "unsure"));
  if (has("stuck") && has("wrong"))
    return "how the tutor responds when the student is stuck or wrong.";
  if (has("stuck"))
    return "how the tutor responds when the student gets stuck.";
  if (has("wrong"))
    return "what the tutor does straight after a wrong answer.";
  if (has("question"))
    return "whether the tutor answers the student's questions, or asks one back.";
  if (has("right"))
    return "what the tutor does after a right answer.";
  return "who is doing the thinking at each step, the student or the tutor.";
}

/** What the student said in reply to tutor message n, skipping any further
    tutor messages. `reply` is null when the session ends first. */
export function whatNext(session, n) {
  const msgs = session.msgs;
  const i = msgs.findIndex((m) => m.n === n);
  let between = 0;
  for (let j = i + 1; j < msgs.length; j++) {
    if (!msgs[j].t) return { reply: msgs[j], between };
    between++;
  }
  return { reply: null, between };
}

/** The tutor messages from n up to the student's next message — the whole of
    the tutor's reply, since tutors often answer in several short lines. */
export function tutorRun(session, n) {
  const msgs = session.msgs;
  const i = msgs.findIndex((m) => m.n === n);
  if (i < 0) return [];
  return [msgs[i], ...runAfter(msgs, i)];
}

/** The situation a tutor turn is responding to: the nearest student message
    before it, and a plain name for it. Key moments carry their own. */
export function situationFor(session, n, moments = []) {
  const km = moments.find((m) => m.n === n);
  const msgs = session.msgs;
  if (km) return { cue: msgs.find((m) => m.n === km.cue), label: km.situation };
  const i = msgs.findIndex((m) => m.n === n);
  for (let j = i - 1; j >= 0; j--) {
    if (!msgs[j].t) {
      return { cue: msgs[j], label: classify(msgs[j], runAfter(msgs, j)).label };
    }
  }
  return { cue: null, label: "The tutor opens, before the student has said anything" };
}

// Short names for the key-moment pills; the full situation is in the side
// panel and in each pill's tooltip.
export const SHORT = {
  stuck: "Stuck",
  unsure: "Not sure",
  wrong: "Wrong answer",
  attempt: "Tries an answer",
  right: "Right answer",
  question: "Asks a question",
  getit: "Gets it",
  explains: "Explains",
  social: "Chats",
  ack: "Agrees",
  reply: "Replies",
};
