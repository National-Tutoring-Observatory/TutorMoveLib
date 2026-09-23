// Situation search: match a teacher's plain-language description of what is
// happening in a session against the 29 moves. Hand-written cues and a tip
// per move, plus token overlap with each definition and its examples as a
// fallback. Pure functions; nothing here touches the DOM.
import { entries as ENTRIES } from "./dictionary.js";

const ASK = {
  ASKING_TO_CLARIFY_CONTEXT: {
    cues: ["what the problem is asking", "not sure what the question wants", "unclear question", "what does the problem say", "dont understand the problem", "what are they asking", "clarify", "clarification", "unclear", "ambiguous", "which problem", "what are we working on", "what have you tried", "didnt catch what they said", "what do you mean", "what they meant", "context", "assignment", "instructions", "homework question", "the question is confusing", "cant tell what they mean", "student typed something confusing", "which part", "what exactly"],
    tip: "Ask what the problem is really asking, or what the student meant, before you try to help.",
  },
  PROBING_PRIOR_KNOWLEDGE: {
    cues: ["have they seen this before", "new topic", "have they learned", "familiar", "prior knowledge", "background", "what they already know", "covered in class", "first time", "starting a new topic", "never seen", "learned this yet", "do they know", "know about", "not sure what they know", "already know", "taught yet", "did they learn"],
    tip: "Ask a yes-or-no question about whether they have met this idea before, such as “Did you learn about this?”",
  },
  PROBING_UNDERSTAND: {
    cues: ["check understanding", "check whether they understood", "check if they understand", "make sense", "do they get it", "get it", "following along", "follow", "with me", "understood", "understand my explanation", "after i explained", "just explained", "confused", "lost", "blank", "quiet", "not responding", "silent", "no response", "nodding", "unsure if they followed", "keeping up", "is it clear", "did that land", "understand"],
    tip: "Pause and ask a quick yes-or-no check, such as “Does that make sense?”, then act on the answer.",
  },
  CORRECTING_OWN_ERROR: {
    cues: ["i made a mistake", "i was wrong", "my mistake", "i said the wrong thing", "i got it wrong", "student caught my error", "student corrected me", "i miscalculated", "i wrote the wrong", "own error", "i messed up", "student is right and i was wrong", "realised i was wrong", "realized i was wrong", "my error", "my bad", "i made an error", "i slipped", "my answer was wrong", "i misspoke"],
    tip: "Say plainly that you made the error and fix it; it shows that mistakes are normal.",
  },
  STRATEGIZING: {
    cues: ["plan", "approach", "where to start", "how to tackle", "learning goal", "goal for today", "start the session", "beginning of the session", "big problem", "multi step problem", "overwhelmed by the problem", "roadmap", "break it down", "break the problem into steps", "what we are going to do", "set up the session", "overview", "strategy", "strategize", "outline", "structure", "goal", "game plan", "big picture", "long problem", "many steps", "what to do first"],
    tip: "Say out loud what the goal is and the steps you will take to get there before diving in.",
  },
  PROMPTING_RELATED_KNOWLEDGE: {
    cues: ["connect", "connection", "related", "remind them of", "similar to what they learned", "they know a related concept", "link to what they know", "build on", "earlier topic", "last week", "previous lesson", "recall", "remember the rule", "what do you know about", "activate", "prerequisite", "definition they know", "tell me what you know", "what they know", "bring in what they know", "relate", "remember"],
    tip: "Ask what they already know about the related idea instead of explaining it for them.",
  },
  PROMPTING_RELATED_REPRESENTATION: {
    cues: ["draw", "graph", "diagram", "picture", "table", "number line", "write it as an equation", "different form", "visual", "represent", "representation", "model", "show it another way", "sketch", "plot", "chart", "equation form", "words to symbols", "visualize", "visualise", "another representation", "only thinking in numbers", "abstract", "different way of showing", "write it out", "in symbols", "in words"],
    tip: "Ask them to show the same idea in another form: a drawing, a graph, a table or an equation.",
  },
  PROMPTING_EXPLANATION: {
    cues: ["explain", "why did they do that", "reasoning", "justify", "how did they get that", "walk me through", "show their thinking", "talk through", "right answer but", "not sure if they understand why", "guessing", "guessed", "lucky guess", "thinking", "reason", "explain their steps", "tell me why", "in their own words", "why they did", "how they got", "understand why", "explain why", "explain how"],
    tip: "Ask why or how they did it, and let them talk before you judge the answer.",
  },
  PROMPTING_ACTION: {
    cues: ["stuck", "doesnt know what to do next", "wont start", "wont try", "next step", "hasnt started", "not started", "blank page", "waiting for me", "waiting for the answer", "wants me to do it", "passive", "what do you get", "try the next step", "first step", "do the step", "attempt", "have a go", "get them started", "get them to try", "not doing anything", "just watching", "expects me to solve", "nothing written", "sitting there", "doesnt want to try", "wont attempt", "wont do anything", "do it themselves", "make them do", "get started", "start"],
    tip: "Ask for one concrete step, such as “Can you do the first step?”, without adding new information.",
  },
  PROMPTING_CORRECTION: {
    cues: ["wrong answer", "mistake", "error", "incorrect", "small mistake", "arithmetic error", "sign error", "check their work", "recheck", "find their own mistake", "self correct", "fix it themselves", "double check", "look again", "almost right", "one part wrong", "careless", "slip", "typo", "spot the mistake", "catch the mistake", "correct it themselves", "fix their mistake", "mostly right", "got it wrong", "wrong"],
    tip: "Point to where to look, such as “Can you recheck the third line?”, and let them find the error.",
  },
  FEEDBACK_CORRECT: {
    cues: ["correct answer", "right answer", "got it right", "solved it", "solved it correctly", "answered correctly", "correct", "right", "good answer", "got the answer", "finished the problem", "is that right", "asks if they are right", "confirm", "checking their answer", "is it right", "wants to know if", "correctly", "did it right", "got it"],
    tip: "Tell them briefly that it is right, then move on or ask them to explain why.",
  },
  FEEDBACK_INCORRECT: {
    cues: ["wrong answer", "mistake", "incorrect", "got it wrong", "wrong", "not right", "error", "not quite", "answered wrong", "gave the wrong", "miscalculated", "close but", "let them know its wrong", "tell them its wrong", "wrong number", "wrong sign", "answer is off", "not correct", "incorrectly", "did it wrong", "made a mistake", "made an error"],
    tip: "Signal gently that it is not right yet (“Hmm, close”) without giving the answer.",
  },
  FEEDBACK_NEUTRAL: {
    cues: ["partly right", "half right", "not sure if right or wrong", "dont want to say if its right", "unusual answer", "different method", "different approach than expected", "not wrong but", "keep them going", "acknowledge without judging", "hold judgement", "neutral", "sort of", "in a sense", "on the right track", "dont want to give it away", "not the point", "minor detail", "dont worry about", "not what i expected", "unexpected", "avoid saying right or wrong", "without judging", "noncommittal"],
    tip: "Acknowledge the response (“okay, in a sense”) without confirming or rejecting it, so the thinking continues.",
  },
  REVOICING: {
    cues: ["rephrase", "restate in my words", "put it another way", "say it back", "clarify what they said", "explanation was messy", "muddled", "rambling", "sort of right", "make their idea precise", "mathematical language", "vocabulary", "correct terms", "informal", "reformulate", "summarise what they said", "summarize what they said", "summarise", "summarize", "paraphrase", "said something close", "said it clumsily", "right idea wrong words", "tidy up what they said", "in better words", "proper terms", "own words"],
    tip: "Repeat their idea in clearer or more mathematical words and check that is what they meant.",
  },
  RESTATING: {
    cues: ["repeat", "echo", "say back exactly", "repeat what they said", "verbatim", "confirm i heard", "did i hear right", "mumbled", "keep them talking", "acknowledge", "make sure i heard", "acknowledge what they said", "affirm", "word for word", "check i heard", "heard them right", "show i am listening", "listening", "repeat back", "say it back"],
    tip: "Repeat their words back exactly, as a way of confirming and keeping the floor with them.",
  },
  GIVING_HINT: {
    cues: ["hint", "nudge", "clue", "stuck", "tried a few times", "tried and failed", "cant figure out", "cant figure it out", "point them in the right direction", "small push", "without giving the answer", "not giving away", "suggestion", "which formula", "which method", "easier way", "help without telling", "dont want to give the answer", "almost there", "close to solving", "one idea", "gentle push", "struggling", "keeps getting stuck", "cant see how", "needs a push", "nudge them", "little help"],
    tip: "Offer one small pointer toward the method (“maybe use the line to find the slope”) and stop there.",
  },
  GIVING_EXAMPLE: {
    cues: ["example", "simpler example", "similar problem", "analogy", "smaller numbers", "concrete", "easier version", "another problem", "worked example", "different numbers", "same type", "abstract", "too abstract", "illustrate", "for instance", "pretend", "lets say", "instance", "try with easy numbers", "simpler case", "simpler version", "show with an example", "make it concrete", "easier numbers"],
    tip: "Work a different, simpler problem of the same kind, then send them back to theirs.",
  },
  EXPLAINING_CONCEPTUAL: {
    cues: ["explain the concept", "doesnt understand the concept", "why does it work", "why it works", "the idea behind", "meaning", "conceptual", "what is", "definition", "theory", "big idea", "dont understand why", "misconception", "fundamental", "doesnt know what it means", "never learned", "new concept", "teach the concept", "explain what it means", "understand the idea", "intuition", "rule", "fact", "principle", "concept", "what it means", "why is it", "explain why"],
    tip: "Explain the general idea or fact in plain terms, then check that they can use it.",
  },
  EXPLAINING_PROCEDURAL: {
    cues: ["explain the steps", "show them how", "how to do it", "procedure", "method", "steps to solve", "walk through the steps", "algorithm", "process", "doesnt know the method", "how to set it up", "set up the equation", "which steps", "formula", "how to solve", "teach the method", "demonstrate", "step by step", "show the process", "how do you", "no idea how to start", "doesnt know how", "dont know how", "the steps", "how to"],
    tip: "Lay out the steps for this problem in order (“substitute 1 for r, then...”), then hand the next one to them.",
  },
  GIVING_ANSWER: {
    cues: ["give the answer", "tell them the answer", "running out of time", "out of time", "time is up", "just tell them", "end of session", "almost out of time", "final answer", "state the answer", "they need the answer", "reveal", "solution", "just the answer", "no time", "quick answer", "last minute", "cant get it after many tries", "tried everything", "exhausted", "give up and tell", "should i just tell", "give them the answer", "tell the answer", "the answer"],
    tip: "State the answer plainly, and if time allows ask them to check it or explain why it works.",
  },
  BUILDING_RAPPORT: {
    cues: ["first session", "new student", "getting to know", "small talk", "ice breaker", "shy", "awkward", "quiet", "doesnt talk", "reserved", "warm up", "connect with them", "relationship", "personal", "trust", "distant", "nervous", "cold", "humanize", "joke", "chat", "about their day", "weekend", "hobbies", "interests", "introduce", "comfortable", "build rapport", "rapport", "relax", "friendly", "meet for the first time", "never met", "dont know each other", "one word answers", "wont open up", "open up"],
    tip: "Share something human of your own or ask about them; a little conversation before the math.",
  },
  ENCOURAGING: {
    cues: ["frustrated", "giving up", "give up", "discouraged", "doesnt want to try", "anxious", "nervous", "scared", "afraid to be wrong", "afraid", "hesitant", "low confidence", "confidence", "says they cant", "i cant do this", "bad at math", "hate math", "hates math", "stressed", "upset", "worried", "wants to quit", "losing motivation", "unmotivated", "reluctant", "embarrassed", "apologizing", "apologising", "sorry", "self doubt", "keep going", "motivate", "cheer", "encourage", "encouragement", "reassure", "you can do it", "take your time", "rushing", "panicking", "doubts themselves", "not good enough", "cant do it", "wont try", "defeated", "given up", "ready to quit", "not smart enough", "dumb", "stupid"],
    tip: "Say something that lowers the stakes and keeps them going (“Take your time”, “Good question”).",
  },
  ASKING_FEELING: {
    cues: ["how are they feeling", "check in", "seem off", "seem tired", "seem upset", "mood", "feeling", "feel", "hows it going", "start of session", "beginning", "quiet today", "not themselves", "distracted", "something is wrong", "sad", "down", "having a bad day", "stressed", "wellbeing", "emotion", "emotions", "how their day was", "sigh", "sighing", "tired", "bored", "disengaged", "ask how they are", "seems off", "not engaged", "low energy", "withdrawn", "flat", "how they are doing", "how they are"],
    tip: "Ask directly how they are doing (“How's it going?”) and listen before going on.",
  },
  VALIDATING_FEELING: {
    cues: ["frustrated", "says its hard", "this is hard", "too hard", "complains", "complaining", "vent", "venting", "overwhelmed", "acknowledge feelings", "acknowledge", "validate", "it is confusing", "confusing", "annoyed", "angry", "upset", "fair point", "makes sense that", "understandable", "empathize", "empathise", "empathy", "sympathize", "sympathise", "tough", "difficult", "boring", "unfair", "tired", "hates this", "doesnt like", "normal to feel", "feelings", "frustration", "says it is hard", "so hard", "hard", "tricky", "struggling"],
    tip: "Name the feeling and say it is reasonable (“Fair point, this part is confusing”) before moving on.",
  },
  PRAISING_PROCESS: {
    cues: ["effort", "tried hard", "working hard", "persisted", "kept trying", "good strategy", "good method", "nice approach", "showed their work", "careful", "checked their work", "improved", "improvement", "progress", "praise", "praise their effort", "praise how", "hard work", "kept going", "didnt give up", "worked through", "organized", "organised", "neat", "good thinking", "thoughtful", "good question", "attempted", "attempt", "perseverance", "persevered", "persevere", "good try", "nice try", "tried", "trying hard", "keeps trying", "working through it", "asked a good question", "praise the process", "how they worked"],
    tip: "Praise the specific thing they did (“Nice, you checked your work”), not the result or the person.",
  },
  PRAISING_OUTCOME: {
    cues: ["solved it", "solved it correctly", "got it right", "correct answer", "finished", "completed", "got an a", "test score", "grade", "aced", "passed", "success", "result", "celebrate", "well done", "great job", "congratulate", "did well", "scored", "finished the problem", "all correct", "good result", "won", "achievement", "accomplished", "streak", "got them all right", "did great on", "high score", "praise the result", "praise the outcome", "outcome", "nailed it"],
    tip: "Name the result they achieved (“Great job on your success!”) and connect it to what they did.",
  },
  PRAISING_TRAIT: {
    cues: ["smart", "clever", "talented", "brilliant", "genius", "natural", "gifted", "good at math", "quick learner", "praise them as a person", "praise the student", "compliment", "you are so", "bright", "intelligent", "math person", "call them smart", "character", "personality", "trait", "kind", "funny", "hardworking person", "dedicated", "praise who they are", "praise a quality", "sharp", "whiz"],
    tip: "Praise a quality of the student (“You are so smart!”); use sparingly, and prefer praising the process.",
  },
  TECHNICAL_ISSUES: {
    cues: ["cant see", "cannot see", "screen", "whiteboard", "white board", "audio", "microphone", "mic", "connection", "upload", "internet", "wifi", "lag", "lagging", "frozen", "froze", "disconnected", "camera", "video", "share screen", "screen share", "link", "zoom", "not loading", "loading", "chat", "typing", "text box", "photo", "image", "picture of work", "file", "sound", "cant hear", "cannot hear", "echo", "cut out", "cutting out", "glitch", "app", "platform", "tool", "browser", "log in", "login", "crash", "crashed", "tablet", "pen", "drawing tool", "technical", "tech", "blurry", "cant read their writing", "show me their work", "submit", "send", "muted", "mute", "not showing", "doesnt show", "cant load", "wont load", "board", "device", "computer", "laptop", "keyboard", "stylus", "reconnect", "kicked out", "dropped"],
    tip: "Say what you can or cannot see or hear and suggest a fix (“I don't see it on the whiteboard, try a text box”).",
  },
  MANAGING: {
    cues: ["time", "running late", "late", "schedule", "next session", "reschedule", "booking", "rules", "policy", "expectations", "ground rules", "how the session works", "how long", "minutes left", "wrap up", "wrapping up", "end the session", "ending", "off task", "off topic", "distracted", "not focused", "focus", "pacing", "too slow", "too fast", "break", "homework", "due", "deadline", "allowed", "not allowed", "cheating", "wants me to do their homework", "wants the answers", "do the work for them", "cell phone", "phone", "multitasking", "attendance", "no show", "logistics", "agenda", "manage", "behavior", "behaviour", "misbehaving", "rude", "solve on the board", "show your work", "use the board", "expect", "session ends", "session starts", "next time", "next week", "tomorrow", "calendar", "availability", "how many problems", "which problems", "order of problems", "set expectations", "keep on track", "on track", "time left", "out of time", "run out of time", "the clock"],
    tip: "State the rule, the time or the plan for next time plainly (“We have ten minutes left, let's finish this one”).",
  },
};

const ASK_STOP = new Set(("a an the and or but if so then than too also as of to in on at for with about from by into up out over " +
  "is are am was were be been being do does did done have has had having " +
  "i me my mine we us our you your he him his she her they them their this that these those there here " +
  "student students tutor tutors session kid kids learner child they're im ive i'm just very really quite some any " +
  "what when where which who whom how would could should will shall can may might must " +
  "not no yes ok okay while during because since although though still yet ever even").split(/\s+/));
// Deliberately kept out of the stopwords: it, get, got, want, cant, wont, dont, doesnt (they carry meaning in cues).
function askStem(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("ied")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed") && !w.endsWith("eed")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("ly")) w = w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es") && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}
function askTokens(text) {
  return String(text).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").split(" ")
    .filter(w => w && !ASK_STOP.has(w)).map(askStem).filter(w => w.length > 1);
}
// Contiguous sub-sequence test.
function askHasSeq(q, seq) {
  outer: for (let i = 0; i + seq.length <= q.length; i++) {
    for (let j = 0; j < seq.length; j++) if (q[i + j] !== seq[j]) continue outer;
    return true;
  }
  return false;
}
// Prepared per-entry data: cue token sequences and the bag of definition/example tokens.
const ASK_PREP = ENTRIES.map(e => {
  const lex = ASK[e.code] || { cues: [], tip: "" };
  const cues = lex.cues.map(c => ({ text: c, seq: askTokens(c) })).filter(c => c.seq.length);
  const exText = e.ex.map(it => it.t === "dialog" ? it.lines.map(l => l.say).join(" ") : it.q).join(" ");
  const bag = new Set(askTokens(e.def + " " + exText).filter(w => w.length > 2));
  return { cues, bag, tip: lex.tip };
});
const ASK_DF = new Map();
ASK_PREP.forEach(p => p.bag.forEach(w => ASK_DF.set(w, (ASK_DF.get(w) || 0) + 1)));
const ASK_FLOOR = 2;
// Score every entry against a situation. Returns [{n, score, cues, words}] sorted, best first,
// where n is the 1-based entry number, cues the lexicon phrases that matched, words the fallback overlap.
function askScore(text) {
  const q = askTokens(text);
  if (!q.length) return [];
  const qset = new Set(q);
  const N = ENTRIES.length;
  return ENTRIES.map((e, k) => {
    const p = ASK_PREP[k];
    const hits = [];
    for (const c of p.cues) {
      if (c.seq.length === 1) { if (qset.has(c.seq[0])) hits.push({ text: c.text, w: 2 }); }
      else if (askHasSeq(q, c.seq)) hits.push({ text: c.text, w: 2 + c.seq.length });
      else if (c.seq.every(t => qset.has(t))) hits.push({ text: c.text, w: 1 + c.seq.length * 0.5 });
    }
    hits.sort((a, b) => b.w - a.w);
    // The best cue counts in full, the others at half, so a long cue list cannot pile on.
    let score = hits.reduce((s, h, i) => s + (i ? h.w * 0.5 : h.w), 0);
    const words = [];
    let overlap = 0;
    for (const w of qset) {
      if (w.length > 2 && p.bag.has(w)) {
        const df = ASK_DF.get(w) || 1;
        overlap += 0.6 * Math.log((N + 1) / df) / Math.log(N + 1);
        words.push(w);
      }
    }
    score += Math.min(overlap, 2.5);
    return { n: k + 1, score, cues: hits.map(h => h.text), words };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score || a.n - b.n);
}
function askSuggest(text, limit = 4) {
  return askScore(text).filter(r => r.score >= ASK_FLOOR).slice(0, limit);
}

export { askSuggest, askScore, askTokens, ASK, ASK_PREP, ASK_FLOOR };
