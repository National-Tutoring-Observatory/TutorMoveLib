#!/usr/bin/env python3
"""Turn the NTO/Eedi consensus workbook into the corpus the site reads.

    npm run data        (or: python3 pipeline/build.py)

De-identifies every transcript, attaches a plain-language explanation to each
classified tutor turn, and writes src/data/corpus.json for the React app to
import. Re-run it whenever the workbook or the explanation copy changes.

openpyxl cannot open this workbook (dangling xl/drawings/drawing1.xml
relationship), so the OOXML parts are read directly.
"""
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

from explanations import HERO
from questions import GRADE_LABELS, QUESTIONS
from moves import CATEGORIES, MOVES, SPECTRUM_RUNGS, TAXONOMY_RENAMES

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

# When annotators never reached consensus, take the first annotator's label
# rather than surfacing the disagreement. Set this False to go back to showing
# both readings side by side — the alternates are still read from the workbook
# either way, so nothing is lost by flipping it.
COLLAPSE_CONTESTED = True

HERE = Path(__file__).parent
ROOT = HERE.parent
SRC = (ROOT.parent / "TutoringMoveTaxnomy" / "ExampleTranscript" /
       "Copy of Copy of Consensus_Transcripts_MultiTab_Eedi_R1 (1).xlsx")
OUT = ROOT / "src" / "data" / "corpus.json"

TOPICS = {
    "9956": "Arrays and inverse operations",
    "6213": "Number lines and intervals",
    "9407": "Finding 5% using 10%",
    "4249": "Rounding to the nearest 100",
    "4069": "Reading a train timetable",
    "12124": "Ordering numbers, ascending",
    "4123": "Solving equations by inverse operations",
    "2186": "Sharing in a ratio",
    "3923": "Increasing a length by a percentage",
    "5268": "Factor trees and prime factors",
    "657": "Rearranging equations",
    "7570": "Dividing by a decimal",
    "5642": "Simplifying a ratio to 1",
    "5983": "Splitting numbers into factors",
    "7927": "Percentage increase and decrease",
    "5228": "Writing percents as fractions",
    "2846": "Adding by bridging to a round number",
    "11646": "Factorising two different ways",
    "255": "Angles in a regular polygon",
    "258": "Interpreting a depth-time graph",
}

# Every personal name in the corpus, mapped to a stable pseudonym. Applied
# uniformly: telling real participants apart from word-problem characters
# ("Uma and Vera have done it two different ways") is not reliably possible, and
# over-replacing is the safe direction. Place names (Edinburgh, Waverley,
# Cambridge) are question content and are kept. A bare initial ("Hi Z") is
# already de-identified, and Z is also a common algebra variable, so it is left.
PSEUDONYMS = {
    "Dimitri": "Adam", "Lina": "Bea", "Luna": "Cara", "Nora": "Dana",
    "Darius": "Eli", "Nina": "Faye", "Lucia": "Gia", "Sophia": "Hana",
    "Leo": "Ira", "Serenity": "Jo", "Emily": "Kira", "Elijah": "Lev",
    "Amelia": "Mira", "Liam": "Noor", "Maya": "Opal", "Sophie": "Pia",
    "Amina": "Quinn", "Samantha": "Rosa", "Ivy": "Sana", "Leon": "Tariq",
    "Jack": "Uma", "Emma": "Vera", "Lily": "Wren", "Ben": "Xan",
    "Maria": "Yara", "Zara": "Zuri", "ClaiRem": "Robin",
}

# One sentence per move, written for a teacher. The specifics come from the
# clues; this carries the shape of the move.
WHY = {
    "PROMPTING_NEXT_STEP": "The tutor puts a question to the student instead of "
        "supplying the step, so the work of answering stays with the student.",
    "PROMPTING_SELF_EXPLANATION": "The tutor asks the student to put their own "
        "reasoning into words.",
    "PROMPTING_RELATED_CONCEPTS": "The tutor asks the student to connect this to "
        "something they already know.",
    "GIVING_HINT": "The tutor nudges toward the answer while leaving the work "
        "with the student.",
    "GIVING_EXAMPLE": "The tutor offers a parallel case for the student to "
        "reason from.",
    "EXPLAINING_CONCEPTUAL": "The tutor explains why something works, rather "
        "than which steps to carry out.",
    "EXPLAINING_PROCEDURAL": "The tutor walks through how the step is done.",
    "GIVING_ANSWER": "The tutor supplies the answer outright — the student is "
        "no longer being asked to produce it.",
    "STRATEGIZING": "The tutor sets up how to approach the problem rather than "
        "working through it.",
    "PROBING_UNDERSTAND": "The tutor checks what the student understands before "
        "going on.",
    "PROBING_PRIOR_KNOWLEDGE": "The tutor checks what the student already knew "
        "coming into this question.",
    "FEEDBACK_CORRECT": "This lands straight after a student answer and marks "
        "it right, without adding anything new.",
    "FEEDBACK_INCORRECT": "This marks the student's answer as wrong, and does "
        "it gently rather than flatly.",
    "FEEDBACK_NEUTRAL": "This acknowledges what the student said without marking "
        "it right or wrong.",
    "CORRECTING_OWN_ERROR": "The tutor notices their own mistake and repairs it "
        "in front of the student.",
    "ASKING_TO_CLARIFY_CONTEXT": "The tutor asks what the student is looking at, "
        "to locate the problem.",
    "VALIDATING_FEELING": "The tutor names how the student is feeling and "
        "accepts it, before returning to the maths.",
    "BUILDING_RAPPORT": "This turn works on the relationship rather than on the "
        "maths.",
    "ENCOURAGING": "The tutor urges the student to keep going.",
    "PRAISING_PROCESS": "The praise is aimed at what the student did — their "
        "effort or their approach.",
    "PRAISING_OUTCOME": "The praise is aimed at the result the student reached.",
    "PRAISING_TRAITS": "The praise is aimed at the student as a person.",
    "ASKING_FEELING": "The tutor asks how the student is doing.",
    "MANAGING": "This handles the running of the session rather than the maths.",
    "TECHNICAL_ISSUES": "This deals with the platform rather than the maths.",
}

# (regex, why) — the phrase the AI "noticed" and what it took from it. Order is
# priority order; at most MAX_CUES are kept per turn.
CUE_RULES = [
    (r"^\s*\(?\s*(what|how|which|why|where|when)\b",
     "Opens with a question word, so this turn asks rather than tells."),
    (r"\b(can|could|would|do|did|shall|are)\s+(you|we)\b",
     "Addresses the student directly with a request, rather than a statement."),
    (r"\b(not quite|nearly|almost|not right|not the)\b",
     "A softened negative — marks the answer wrong without saying 'no' flatly."),
    (r"\b(well done|spot on|exactly|perfect|brilliant|excellent|correct)\b",
     "A strong positive evaluation of what the student just did."),
    (r"\b(great|good|yes|yep|fab|awesome|super|nice)\b",
     "A short positive evaluation word."),
    (r"\b(tricky|confusing|hard|difficult|strange|odd)\b",
     "Names the difficulty of the task out loud."),
    (r"\b(no worries|no problem|don'?t worry|that'?s ok|it'?s ok)\b",
     "Reassurance, offered before any teaching."),
    (r"\b(sorry|apolog\w+|my mistake|i read)\b",
     "The tutor flags something on their own side rather than the student's."),
    (r"\b(because|so that|which means|that means|since)\b",
     "Gives a reason, rather than only an instruction."),
    (r"\b(let'?s|we'?ll|we'?re|we need|we have|we can)\b",
     "Uses 'we', framing the work as shared."),
    (r"^\s*(so|first|next|now|then|finally)\b",
     "A sequencing word, marking this as a step in an order."),
    (r"\b(if it said|imagine|suppose|say we)\b",
     "Sets up a hypothetical rather than asserting anything."),
    (r"_{2,}",
     "Leaves a blank for the student to fill in."),
    (r"\?",
     "Ends on a question — the tutor stops here and waits for the student."),
]
MAX_CUES = 3


def deidentify(text):
    for name, repl in PSEUDONYMS.items():
        def sub(m, repl=repl):
            word, trailing_s = m.group(1), m.group(2)
            return (repl if word[0].isupper() else repl.lower()) + trailing_s
        text = re.sub(r"\b(" + name + r")(s?)\b", sub, text, flags=re.I)
    return text


def read_workbook(path):
    z = zipfile.ZipFile(path)
    shared = ["".join(t.text or "" for t in si.iter(NS + "t"))
              for si in ET.fromstring(z.read("xl/sharedStrings.xml"))]
    rels = {r.get("Id"): r.get("Target")
            for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
    book = ET.fromstring(z.read("xl/workbook.xml"))
    sheets = [(s.get("name"), rels[s.get(RNS + "id")])
              for s in book.iter(NS + "sheet")]

    def rows(target):
        part = "xl/" + target.lstrip("/").replace("xl/", "")
        out = []
        for row in ET.fromstring(z.read(part)).iter(NS + "row"):
            cells = {}
            for c in row.iter(NS + "c"):
                col = re.match(r"[A-Z]+", c.get("r")).group()
                v = c.find(NS + "v")
                if v is None:
                    inline = c.find(NS + "is")
                    val = ("".join(t.text or "" for t in inline.iter(NS + "t"))
                           if inline is not None else None)
                else:
                    val = shared[int(v.text)] if c.get("t") == "s" else v.text
                cells[col] = val
            out.append(cells)
        return out

    return {name: rows(target)[1:] for name, target in sheets}


def find_cues(text):
    cues = []
    for pattern, why in CUE_RULES:
        m = re.search(pattern, text, re.I)
        if not m:
            continue
        phrase = m.group(0).strip()
        if not phrase or any(c.get("q") == phrase for c in cues):
            continue
        cues.append({"q": phrase, "why": why})
        if len(cues) == MAX_CUES:
            break
    return cues


def generate_explanation(text, move_codes, alts):
    """Explanation for a turn in one of the 18 non-hero sessions."""
    if alts is not None:  # annotators never reached consensus
        readings = [
            {"move": a,
             "why": "Read this way, " + MOVES[a]["def"][0].lower() + MOVES[a]["def"][1:]}
            for a in alts if a in MOVES
        ]
        if len(readings) < 2:
            readings.append({
                "move": None,
                "why": "Read this way, the turn is ordinary conversation rather "
                       "than a move that acts on learning.",
            })
        return {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": readings,
            "clues": find_cues(text),
        }

    primary = move_codes[0]
    why = WHY.get(primary, MOVES[primary]["def"])
    if len(move_codes) > 1:
        second = move_codes[1]
        why += (" It is doing two things at once — it also counts as "
                + MOVES[second]["name"].lower() + ".")
    return {"why": why, "clues": find_cues(text)}


def main():
    if not SRC.exists():
        sys.exit(f"cannot find workbook: {SRC}")

    raw = read_workbook(SRC)
    sessions, excluded, labels = [], [], Counter()
    tutor = student = total = contested = classified = 0

    for sid, body in raw.items():
        msgs = []
        for r in body:
            annotation = r.get("D")
            is_tutor = r.get("B") == "1"
            text = deidentify(r.get("C") or "")
            codes = ([] if not annotation or annotation in ("None", "DISAGREEMENT")
                     else [p.strip() for p in annotation.split(",") if p.strip()])

            msg = {"n": int(r.get("A")), "t": 1 if is_tutor else 0,
                   "s": text, "m": codes}

            alts = None
            was_contested = annotation == "DISAGREEMENT"
            if was_contested:
                # The annotators' primary labels, in workbook column order.
                alts = []
                for col in ("E", "G"):
                    v = r.get(col)
                    if v and v != "None" and v not in alts:
                        alts.append(v)
                if COLLAPSE_CONTESTED:
                    # Take the first label and treat the turn as settled. A turn
                    # both annotators left blank stays unlabelled.
                    codes = alts[:1]
                    msg["m"] = codes
                    alts = None
                else:
                    msg["c"] = 1
                    msg["alt"] = alts
                contested += 1

            if codes or alts is not None:
                # A hand-written explanation for a contested turn is written
                # about the disagreement, so it does not apply once the turn
                # has been collapsed to a single label.
                hand = None if (was_contested and COLLAPSE_CONTESTED) else \
                    HERO.get(sid, {}).get(msg["n"])
                if hand:
                    msg["x"] = hand
                    msg["hand"] = 1
                else:
                    msg["x"] = generate_explanation(text, codes, alts)
                classified += 1

            msgs.append(msg)
            total += 1
            tutor += is_tutor
            student += not is_tutor
            labels[annotation] += 1

        q = QUESTIONS[sid]
        if not q["exemplar"]:
            excluded.append((sid, TOPICS[sid], q["excluded_because"]))
            continue
        sessions.append({
            "id": sid,
            "topic": TOPICS[sid],
            "question": q["question"],
            "answer": q["answer"],
            "strand": q["strand"],
            "grade": q["grade"],
            "ukYear": q["uk_year"],
            "confidence": q["confidence"],
            "msgs": msgs,
        })

    sessions.sort(key=lambda s: (s["grade"], s["strand"], s["topic"]))

    # Source-shape checks below run on the whole workbook; everything reported
    # and shipped is recomputed from the sessions that survive curation.
    shipped = [m for s in sessions for m in s["msgs"]]
    stats = {
        "sessions": len(sessions),
        "messages": len(shipped),
        "tutor": sum(m["t"] for m in shipped),
        "student": sum(1 - m["t"] for m in shipped),
        "contested": sum(1 for m in shipped if m.get("c")),
        "classified": sum(1 for m in shipped if m.get("x")),
    }

    corpus = {
        "sessions": sessions,
        "moves": MOVES,
        "categories": CATEGORIES,
        "spectrum": {str(k): v for k, v in SPECTRUM_RUNGS.items()},
        "renames": TAXONOMY_RENAMES,
        "grades": {str(g): GRADE_LABELS[g] for g in sorted(
            {s["grade"] for s in sessions})},
        "stats": stats,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(corpus, ensure_ascii=False, indent=1))

    # ---- checks that would otherwise only fail in front of the board ----
    leaked = sorted({n for s in sessions for m in s["msgs"] for n in PSEUDONYMS
                     if re.search(r"\b" + n + r"s?\b", m["s"], re.I)})
    assert not leaked, f"original names survived: {leaked}"
    assert (total, tutor, student, contested) == (668, 402, 266, 82), \
        f"corpus changed: {total}/{tutor}/{student}/{contested}"
    unknown = {c for s in sessions for m in s["msgs"] for c in m["m"]
               if c not in MOVES}
    assert not unknown, f"moves missing from moves.py: {unknown}"
    missing = {s["id"] for s in sessions} - set(QUESTIONS)
    assert not missing, f"sessions with no question analysis: {missing}"
    for s in sessions:
        for m in s["msgs"]:
            for cue in m.get("x", {}).get("clues", []):
                if "q" in cue:
                    assert cue["q"] in m["s"], \
                        f"clue not in text, {s['id']} m{m['n']}: {cue['q']!r}"

    print("excluded      " + (", ".join(sid for sid, _, _ in excluded) or "none"))
    for sid, topic, why in excluded:
        print(f"  - {sid} {topic}: {why}")

    hand = sum(1 for s in sessions for m in s["msgs"] if m.get("hand"))
    size = OUT.stat().st_size
    print(f"read          {len(QUESTIONS)} sessions, {total} messages "
          f"({tutor} tutor / {student} student)")
    print(f"shipped       {stats['sessions']} sessions, "
          f"{stats['messages']} messages")
    print(f"classified    {stats['classified']}  "
          f"({stats['contested']} contested)")
    print(f"explanations  {hand} hand-authored, {classified - hand} generated")
    print(f"names leaked  none")
    by_grade = Counter(s["grade"] for s in sessions)
    print("grades        " + ", ".join(
        f"G{g}:{n}" for g, n in sorted(by_grade.items())))
    print(f"corpus.json   {size / 1024:.0f} KB  ->  {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
