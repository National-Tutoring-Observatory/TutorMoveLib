#!/usr/bin/env python3
"""Turn the NTO/Eedi coded transcript into the corpus the site reads.

    npm run data        (or: python3 pipeline/build.py)

Reads source/codedTranscript_Eedi.xlsx (one sheet, one row per message), takes
each session's question text and answer options from Eedi's published question
metadata and its strand from Eedi's subject tags, de-identifies every
transcript, attaches a plain-language explanation to each classified tutor
turn, and writes src/data/corpus.json for the React app to import. Re-run it
whenever the source files or the explanation copy change.

The workbook's OOXML parts are read directly, so nothing beyond the standard
library is needed.
"""
import csv
import datetime
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

from answers import ANSWERS
from explanations import HERO
from questions import GRADE_LABELS, QUESTIONS
from moves import (CATEGORIES, MOVES, SOURCE_CODES, SPECTRUM_RUNGS,
                   TAXONOMY_RENAMES)
from subjects import PRIMARY_SUBTOPIC, SUBTOPICS

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

HERE = Path(__file__).parent
ROOT = HERE.parent
SOURCE = ROOT / "source"
SRC = SOURCE / "codedTranscript_Eedi.xlsx"
# From Eedi's Question-Anchored-Tutoring-Dialogues-2k release (CC BY-NC 4.0).
QUESTION_META = SOURCE / "dq-question-metadata.csv"
DIALOGUE_SUBJECTS = SOURCE / "dialogue-subjects.csv"
OUT = ROOT / "src" / "data" / "corpus.json"

# Topic titles for the sessions analysed by hand. Every other session is titled
# with its Eedi subtopic.
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
    "REVOICING": "The tutor says back what the student said in other words, "
        "so the idea stays the student's.",
    "PROMPTING_CORRECTION": "The tutor sends the student back to find and fix "
        "their own mistake, without showing the right way.",
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


class DateSerial(str):
    """A cell Excel stored as a date. It reads as the serial number, like any
    other cell, but can say what was typed."""

    def typed(self):
        # A message of just "3/15" was taken by Excel as 15 March and stored
        # as 46096. Students and tutors type fractions, never dates, so the
        # month and day are the numerator and denominator.
        day = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(self)))
        return f"{day.month}/{day.day}"


def date_styles(z):
    """Indices of the cell styles whose number format is a date."""
    if "xl/styles.xml" not in z.namelist():
        return set()
    root = ET.fromstring(z.read("xl/styles.xml"))
    custom = {int(f.get("numFmtId")): f.get("formatCode", "")
              for f in root.iter(NS + "numFmt")}

    def is_date(fid):
        if 14 <= fid <= 22 or 45 <= fid <= 47:
            return True
        code = re.sub(r'"[^"]*"|\[[^]]*\]', "", custom.get(fid, "")).lower()
        return bool(re.search(r"[dy]", code) and "m" in code)

    xfs = root.find(NS + "cellXfs")
    return {i for i, xf in enumerate(xfs if xfs is not None else [])
            if is_date(int(xf.get("numFmtId", 0)))}


def read_workbook(path):
    z = zipfile.ZipFile(path)
    dates = date_styles(z)
    shared = ["".join(t.text or "" for t in si.iter(NS + "t"))
              for si in ET.fromstring(z.read("xl/sharedStrings.xml"))] \
        if "xl/sharedStrings.xml" in z.namelist() else []
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
                    if c.get("t") in (None, "n") and int(c.get("s", 0)) in dates:
                        val = DateSerial(val)
                cells[col] = val
            out.append(cells)
        return out

    return {name: rows(target) for name, target in sheets}


def read_transcript(path):
    """Every message row, keyed by the header names, grouped by session."""
    sheet = next(iter(read_workbook(path).values()))
    header = sheet[0]
    by_session = {}
    for cells in sheet[1:]:
        row = {name: cells.get(col) for col, name in header.items()}
        if row["provider"] != "Eedi":
            continue
        by_session.setdefault(str(int(float(row["session_id"]))), []).append(row)
    for rows in by_session.values():
        rows.sort(key=lambda r: int(float(r["sequence_id"])))
    return by_session


def plain_math(text):
    """Eedi's LaTeX, flattened to something readable as plain text."""
    t = text.replace("\\(", "").replace("\\)", "")
    t = t.replace("\\[", "").replace("\\]", "")
    t = re.sub(r"\\(?:begin|end)\{(?:array|tabular)\}(\{[^}]*\})?|\\hline", " ", t)
    t = re.sub(r"\\(?:mathrm|mathbf|boldsymbol|text)\{([^{}]*)\}", r"\1", t)
    t = re.sub(r"\^\{?([0-9])\}?", lambda m: "⁰¹²³⁴⁵⁶⁷⁸⁹"[int(m.group(1))], t)
    t = re.sub(r"\^\{([^{}]*)\}", r"^\1", t)
    t = re.sub(r"_\{([^{}]*)\}", r"\1", t)
    t = re.sub(r"\\sqrt\[3\]\{([^{}]*)\}", r"∛\1", t)
    t = re.sub(r"\\sqrt\{([^{}]*)\}", r"√\1", t)
    t = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"(\1)/\2", t)
    t = re.sub(r"\(([^()\s+\-]*)\)/", r"\1/", t)   # (3)/4 -> 3/4
    for cmd, sym in (("times", "×"), ("div", "÷"), ("pi", "π"), ("degree", "°"),
                     ("leq", "≤"), ("geq", "≥"), ("equiv", "≡"), ("ldots", "…"),
                     ("bigstar", "★"), ("quad", " "), ("left", ""), ("right", "")):
        t = re.sub(r"\\" + cmd + r"(?![a-zA-Z])", sym, t)
    t = t.replace("\\\\", " ").replace("\\%", "%").replace("\\ ", " ")
    t = re.sub(r"\\sqrt", "√", t)
    t = t.replace("&", " ").replace("|", " ").replace("\\", " ")
    return re.sub(r"\s+", " ", t).strip()


def read_questions(path):
    """Question text and answer options per session, from Eedi's metadata.

    Where the question or an option was an image, Eedi supplies a description
    of it instead; that is kept, marked as an image.
    """
    parts = {}
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            parts.setdefault(r["InterventionId"], []).append(r)
    out = {}
    for sid, rows in parts.items():
        rows.sort(key=lambda r: int(r["Sequence"]))
        pieces = {}
        for r in rows:
            label = r["Label"]
            text = plain_math(r["Text"])
            if label.endswith("Image"):
                text = f"[Image: {text}]"
            key = label.rsplit(" ", 1)[0]   # "Question", "Answer A", ...
            pieces.setdefault(key, []).append(text)
        options = []
        for k in ("Answer A", "Answer B", "Answer C", "Answer D"):
            if k in pieces:
                letter, text = k[-1], " ".join(pieces[k])
                # Some options repeat their own letter ("A 3.77"), but in
                # others the letter is the answer ("A and B C and D").
                if text.startswith(letter + " ") and not re.match(
                        r"(and|or)\b", text[2:]):
                    text = text[2:]
                options.append({"k": letter, "t": text})
        out[sid] = {"question": " ".join(pieces.get("Question", [])),
                    "options": options}
    return out


def read_subjects(path):
    """Each session's Eedi subtopics, as a list of names."""
    out = {}
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["SubjectType"] == "Subtopic":
                out.setdefault(r["InterventionId"], []).append(r["SubjectName"])
    return out


def option_answer(sid, options):
    """The worked-out correct option, as "C) its text"."""
    if sid not in ANSWERS:
        return "Not recorded in the source data."
    k = ANSWERS[sid]
    return f"{k}) " + next(o["t"] for o in options if o["k"] == k)


def placement(sid, subtopics):
    """(topic, strand, grade) — hand analysis first, else the Eedi subtopic.

    A session tagged with several subtopics is placed by PRIMARY_SUBTOPIC.
    """
    if sid in QUESTIONS:
        q = QUESTIONS[sid]
        return TOPICS[sid], q["strand"], q["grade"]
    if len(subtopics) == 1:
        name = subtopics[0]
    else:
        assert sid in PRIMARY_SUBTOPIC, \
            f"session {sid} has tags {subtopics}: pick one in PRIMARY_SUBTOPIC"
        name = PRIMARY_SUBTOPIC[sid]
    assert name in SUBTOPICS, f"session {sid}: add to subjects.py: {name}"
    strand, grade = SUBTOPICS[name]
    return name, strand, grade


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

    raw = read_transcript(SRC)
    questions = read_questions(QUESTION_META)
    subjects = read_subjects(DIALOGUE_SUBJECTS)
    sessions, excluded, labels = [], [], Counter()
    tutor = student = total = classified = 0

    for sid, body in raw.items():
        msgs = []
        for r in body:
            is_tutor = r["speaker"] == "tutor"
            content = r["content"]
            if isinstance(content, DateSerial):
                content = content.typed()
            text = deidentify(content or "")
            # Primary then secondary agreed label, in the site's spelling.
            codes = []
            for col in ("p_agreed_annotation", "s_agreed_annotation"):
                for code in (r[col] or "").split(","):
                    code = SOURCE_CODES.get(code.strip(), code.strip())
                    if code and code not in codes:
                        codes.append(code)
                        labels[code] += 1

            msg = {"n": int(float(r["sequence_id"])), "t": 1 if is_tutor else 0,
                   "s": text, "m": codes}

            if codes:
                hand = HERO.get(sid, {}).get(msg["n"])
                # Written about a disagreement between annotators, which the
                # agreed labels in this source no longer carry.
                if hand and "readings" in hand:
                    hand = None
                if hand:
                    msg["x"] = hand
                    msg["hand"] = 1
                else:
                    msg["x"] = generate_explanation(text, codes, None)
                classified += 1

            msgs.append(msg)
            total += 1
            tutor += is_tutor
            student += not is_tutor

        topic, strand, grade = placement(sid, subjects.get(sid, []))
        q = QUESTIONS.get(sid, {})
        if q and not q["exemplar"]:
            excluded.append((sid, topic, q["excluded_because"]))
            continue
        eedi = questions[sid]
        sessions.append({
            "id": sid,
            "topic": topic,
            "question": eedi["question"],
            "options": eedi["options"],
            "answer": q.get("answer") or option_answer(sid, eedi["options"]),
            "strand": strand,
            "grade": grade,
            "ukYear": q.get("uk_year", grade + 1),
            # The question is Eedi's own text now, not a reconstruction.
            "confidence": "high",
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
        "grades": {str(g): GRADE_LABELS.get(g, f"Grade {g}") for g in sorted(
            {s["grade"] for s in sessions})},
        "stats": stats,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(corpus, ensure_ascii=False, indent=1))

    # ---- checks that would otherwise only fail in front of the board ----
    leaked = sorted({n for s in sessions for m in s["msgs"] for n in PSEUDONYMS
                     if re.search(r"\b" + n + r"s?\b", m["s"], re.I)})
    assert not leaked, f"original names survived: {leaked}"
    assert (len(raw), total, tutor, student) == (76, 2665, 1597, 1068), \
        f"corpus changed: {len(raw)}/{total}/{tutor}/{student}"
    unknown = {c for s in sessions for m in s["msgs"] for c in m["m"]
               if c not in MOVES}
    assert not unknown, f"moves missing from moves.py: {unknown}"
    missing = {s["id"] for s in sessions if not s["question"]}
    assert not missing, f"sessions with no Eedi question text: {missing}"
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
    print(f"read          {len(raw)} sessions, {total} messages "
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
