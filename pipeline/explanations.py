"""Hand-authored explanations for the two hero sessions.

Every other session gets a generated explanation (see build.py). These two are
written by hand because they are what advisory board members will read closely,
and template prose would not survive that attention.

Shape, per turn:
    "why"      one or two sentences, plain language, no jargon and no confidence
               numbers. Written for a teacher, not a modeller.
    "clues"    what the AI noticed. "q" must be an EXACT substring of the
               message so the UI can highlight it in the transcript; omit "q"
               for an observation about context rather than wording.
    "readings" contested turns only: the competing interpretations, unattributed.
"""

HERO = {
    # ================= 9956 · Arrays and inverse operations =================
    "9956": {
        5: {
            "why": "The student has just said they are confused. Rather than "
                   "going straight to the maths, the tutor names that feeling "
                   "and agrees with it.",
            "clues": [
                {"q": "It is confusing",
                 "why": "Picks up the student's own word from the message "
                        "before and agrees with it, instead of moving past it."},
                {"why": "The turn asks for nothing — no question, no "
                        "instruction. It only settles the student."},
            ],
        },
        7: {
            "why": "A question the student can answer from what is already on "
                   "screen. It targets a smaller sub-step — reading the array — "
                   "rather than the final answer they are stuck on, so the "
                   "thinking stays with the student.",
            "clues": [
                {"q": "what sum",
                 "why": "Opens with a question word, so this turn asks rather "
                        "than tells."},
                {"q": "the array",
                 "why": "Points at something already in front of the student, "
                        "which makes the step small enough to attempt."},
                {"q": "?",
                 "why": "Ends on a question mark — the tutor stops here and "
                        "waits for the student."},
            ],
        },
        9: {
            "why": "A short, purely evaluative reply straight after the student "
                   "gave an answer. It confirms the answer is right and adds "
                   "nothing else.",
            "clues": [
                {"q": "Great",
                 "why": "A positive evaluation word carrying no other content."},
                {"why": "It lands immediately after the student's answer "
                        "(5x8=40), which is what makes it feedback rather than "
                        "general praise."},
            ],
        },
        10: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "STRATEGIZING",
                 "why": "Read this way, the tutor is setting up the plan — "
                        "reframing the array as a different multiplication so "
                        "that the next step becomes visible."},
                {"move": "EXPLAINING_PROCEDURAL",
                 "why": "Read this way, the tutor is walking through the "
                        "procedure — showing the student how the sum gets "
                        "rewritten."},
            ],
            "clues": [
                {"q": "So,",
                 "why": "A sequencing word, which fits either reading: it can "
                        "open a plan or the next step of a procedure."},
                {"q": "8 x 5 = 40",
                 "why": "The tutor supplies the rewritten sum rather than "
                        "asking for it."},
            ],
        },
        11: {
            "why": "Having reframed the sum, the tutor hands the next piece "
                   "back rather than completing it. The trailing question mark "
                   "leaves a blank for the student to fill.",
            "clues": [
                {"q": "A = ?",
                 "why": "Leaves the value open for the student to supply."},
                {"q": "Because then we can see",
                 "why": "Links this step to the previous one, so the student "
                        "knows why they are being asked."},
            ],
        },
        13: {
            "why": "Marks the answer as wrong, gently, and points back at the "
                   "relevant part of the question instead of correcting it "
                   "outright.",
            "clues": [
                {"q": "Not quite",
                 "why": "A softened negative — signals the answer is wrong "
                        "without saying 'no'."},
                {"q": "it says A x 5 = B",
                 "why": "Redirects to the question's own wording rather than "
                        "supplying the right value."},
            ],
        },
        15: {
            "why": "After two attempts, the tutor supplies the value directly. "
                   "The student is no longer being asked to work it out.",
            "clues": [
                {"q": "A = 8",
                 "why": "States the value outright, with nothing left open."},
            ],
        },
        16: {
            "why": "The second half of the same handover — the remaining value "
                   "is given rather than asked for.",
            "clues": [
                {"q": "B = 40", "why": "States the value outright."},
            ],
        },
        19: {
            "why": "The tutor moves to a new step and asks the student to "
                   "produce it. The numbers are given, but the arrangement — "
                   "the actual thinking — is left to the student.",
            "clues": [
                {"q": "can you write",
                 "why": "Asks the student to do something, rather than "
                        "describing what to do."},
                {"q": "using 8, 5 and 40",
                 "why": "Constrains the task so it is attemptable, while still "
                        "leaving the reasoning open."},
            ],
        },
        22: {
            "why": "Confirms the student's division sum is right, immediately "
                   "and with nothing added.",
            "clues": [
                {"q": "Great!", "why": "A short positive evaluation, directly "
                                       "after a student answer."},
            ],
        },
        23: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "STRATEGIZING",
                 "why": "Read this way, the tutor is pointing out how this "
                        "piece fits the overall plan."},
                {"move": "EXPLAINING_PROCEDURAL",
                 "why": "Read this way, it is simply the next line of a "
                        "worked procedure."},
            ],
            "clues": [
                {"q": "that matches the sum",
                 "why": "Draws a connection between two steps — which can be "
                        "read as plan-making or as procedure."},
            ],
        },
        24: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "STRATEGIZING",
                 "why": "Read this way, the tutor is laying out the structure "
                        "the student should be matching against."},
                {"move": "EXPLAINING_PROCEDURAL",
                 "why": "Read this way, the tutor is writing out the next "
                        "line of the method."},
            ],
            "clues": [
                {"q": "C ÷ 5 = D",
                 "why": "Notation supplied by the tutor rather than elicited "
                        "from the student."},
            ],
        },
        25: {
            "why": "Hands the reading of that notation back to the student. "
                   "The tutor has set the structure up and now asks them to "
                   "fill it in.",
            "clues": [
                {"q": "what are the values",
                 "why": "A question word, asking the student to supply the "
                        "content."},
                {"q": "?", "why": "The tutor stops and waits."},
            ],
        },
        27: {
            "why": "Confirms both values are right, with nothing added.",
            "clues": [{"q": "Great!", "why": "Short positive evaluation "
                                             "following a student answer."}],
        },
        28: {
            "why": "The tutor starts assembling what has been established so "
                   "far into one place, so the student can compare the values "
                   "in the next step.",
            "clues": [
                {"q": "So, we have",
                 "why": "Gathers up prior results rather than introducing "
                        "anything new — the mark of setting up a plan."},
            ],
        },
        29: {
            "why": "Continues collecting the established values together ready "
                   "for comparison.",
            "clues": [{"q": "D = 8", "why": "A value already agreed earlier, "
                                            "restated as part of the summary."}],
        },
        31: {
            "why": "Still assembling — the tutor is lining all four letters up "
                   "so the pattern becomes visible to the student.",
            "clues": [{"q": "A = 8", "why": "Restates an established value as "
                                            "part of the line-up."}],
        },
        32: {
            "why": "Completes the set of four values, which is what makes the "
                   "next question answerable.",
            "clues": [{"q": "B = 40", "why": "The last of the four values "
                                             "being gathered."}],
        },
        34: {
            "why": "With everything laid out, the tutor asks the student to "
                   "spot the pattern themselves rather than pointing it out.",
            "clues": [
                {"q": "which letters",
                 "why": "A question word — the comparison is handed to the "
                        "student."},
                {"q": "same values",
                 "why": "Names exactly what to look for, keeping the step "
                        "small."},
            ],
        },
        36: {
            "why": "Marks the answer as wrong very softly — the student was "
                   "close, and the tutor says so without elaborating.",
            "clues": [
                {"q": "Nearly...",
                 "why": "A softened negative that also signals the student was "
                        "close. The trailing dots leave room for another try."},
            ],
        },
        37: {
            "why": "After a second near-miss, the tutor supplies the pairing "
                   "directly instead of asking again.",
            "clues": [{"q": "A and D both = 8",
                       "why": "States the relationship outright."}],
        },
        38: {
            "why": "The other half of the same direct handover.",
            "clues": [{"q": "B and C both = 40",
                       "why": "States the relationship outright."}],
        },
        39: {
            "why": "Turns the supplied pairing back into a question, asking "
                   "the student to select the matching multiple-choice answer.",
            "clues": [
                {"q": "you need which answer?",
                 "why": "Asks the student to make the final selection "
                        "themselves."},
            ],
        },
        42: {
            "why": "The selection is still wrong. The tutor marks it, again "
                   "softly, without yet explaining why.",
            "clues": [{"q": "Not quite...",
                       "why": "A softened negative, repeated from earlier in "
                              "the session."}],
        },
        43: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "STRATEGIZING",
                 "why": "Read this way, the tutor is restating what the task "
                        "actually asks for — resetting the plan."},
                {"move": "EXPLAINING_PROCEDURAL",
                 "why": "Read this way, the tutor is explaining the step the "
                        "student keeps missing."},
            ],
            "clues": [
                {"q": "we need to say",
                 "why": "Uses 'we', framing it as shared work — which reads as "
                        "either plan-setting or instruction."},
            ],
        },
        44: {
            "why": "The tutor gives the pairing again, this time with the "
                   "values in brackets, having seen two wrong selections.",
            "clues": [{"q": "A and D are the same (8)",
                       "why": "States the answer outright, now with the value "
                              "spelled out."}],
        },
        45: {
            "why": "The second pairing, also supplied directly.",
            "clues": [{"q": "B and C are the same (40)",
                       "why": "States the answer outright."}],
        },
        46: {
            "why": "Even after giving the pairings, the tutor still asks the "
                   "student to make the final match rather than naming the "
                   "option for them.",
            "clues": [
                {"q": "Which answer",
                 "why": "A question word — the last step stays with the "
                        "student."},
                {"q": "matches this?",
                 "why": "Frames it as a comparison the student can carry out."},
            ],
        },
        48: {
            "why": "Confirms the student has finally landed on the right "
                   "option.",
            "clues": [{"q": "Great!",
                       "why": "Short positive evaluation, directly after the "
                              "student's selection."}],
        },
        49: {
            "why": "Annotators did not agree on whether this closing line "
                   "counts as a pedagogical move at all.",
            "readings": [
                {"move": "PRAISING_PROCESS",
                 "why": "Read this way, 'Well done' credits the effort the "
                        "student put in across a long, difficult session."},
                {"move": None,
                 "why": "Read this way, it is simply a sign-off — social "
                        "closing language rather than a move that acts on "
                        "learning."},
            ],
            "clues": [
                {"q": "Well done!",
                 "why": "Positive, but not tied to anything specific the "
                        "student did — which is why the reading is contested."},
                {"q": "Bye for now",
                 "why": "Closing language, suggesting the turn may just be "
                        "ending the session."},
            ],
        },
    },

    # ===================== 7570 · Dividing by a decimal =====================
    "7570": {
        5: {
            "why": "Annotators did not agree on whether this short reply "
                   "counts as a move.",
            "readings": [
                {"move": "BUILDING_RAPPORT",
                 "why": "Read this way, the warmth of the reply is doing "
                        "relationship work before the maths starts."},
                {"move": None,
                 "why": "Read this way, it is ordinary conversational filler "
                        "and not a pedagogical move."},
            ],
            "clues": [
                {"q": "Of course",
                 "why": "Warm and immediate, but carries no teaching content — "
                        "which is exactly what makes it hard to code."},
            ],
        },
        7: {
            "why": "Before asking the student to do anything, the tutor says "
                   "outright that the question is hard. This gives the student "
                   "permission to find it difficult.",
            "clues": [
                {"q": "a little tricky",
                 "why": "Names the difficulty of the task, and softens it with "
                        "'a little'."},
                {"why": "It comes before any instruction — the tutor settles "
                        "the student first, then teaches."},
            ],
        },
        9: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "PROMPTING_SELF_EXPLANATION",
                 "why": "Read this way, 'what do you notice' asks the student "
                        "to articulate their own reasoning about the result."},
                {"move": "PROMPTING_NEXT_STEP",
                 "why": "Read this way, it is simply the next step in the "
                        "method — compare the two numbers."},
            ],
            "clues": [
                {"q": "What do you notice",
                 "why": "An open question with no single expected answer, "
                        "which is what pulls it toward self-explanation."},
                {"q": "compared to the original value (0.3)",
                 "why": "Names exactly what to compare, which is what pulls it "
                        "back toward a concrete next step."},
            ],
        },
        11: {
            "why": "The student noticed the answer got bigger. The tutor "
                   "confirms it and flags why that is surprising — dividing is "
                   "supposed to make things smaller. This explains why, not "
                   "how.",
            "clues": [
                {"q": "that is a bit strange",
                 "why": "Marks the result as counter-intuitive, which is a "
                        "signal the tutor is addressing understanding rather "
                        "than method."},
                {"q": "when we are dividing, that we get an answer that is "
                       "bigger",
                 "why": "States the underlying idea rather than a step to "
                        "carry out."},
            ],
        },
        12: {
            "why": "Two experienced annotators read this turn differently and "
                   "never reached agreement.",
            "readings": [
                {"move": "GIVING_HINT",
                 "why": "Read this way, rewriting the division as a "
                        "multiplication is a nudge — it points at the route "
                        "without walking it."},
                {"move": "GIVING_EXAMPLE",
                 "why": "Read this way, the tutor is offering a parallel case "
                        "for the student to reason from."},
            ],
            "clues": [
                {"q": "If it said",
                 "why": "Sets up a hypothetical rather than asserting "
                        "anything — characteristic of both hints and "
                        "examples."},
                {"q": "____",
                 "why": "A blank left deliberately for the student to fill."},
            ],
        },
        13: {
            "why": "Turns the rewritten sum into a direct question, handing "
                   "the step to the student.",
            "clues": [
                {"q": "What would we say?",
                 "why": "A question word plus 'we', asking the student to "
                        "supply the missing piece as joint work."},
            ],
        },
        14: {
            "why": "The tutor immediately restates the question more plainly, "
                   "having judged the first phrasing might be unclear. The "
                   "step asked of the student is unchanged.",
            "clues": [
                {"q": "what would fill in the blank",
                 "why": "A simpler rewording of the same request, narrowing "
                        "what is being asked for."},
            ],
        },
        17: {
            "why": "The student produced a long piece of reasoning and the "
                   "right answer. The tutor confirms it is right, emphatically "
                   "and without adding anything.",
            "clues": [
                {"q": "that is it exactly",
                 "why": "Confirms correctness directly, with 'exactly' marking "
                        "it as fully right rather than partly."},
            ],
        },
        18: {
            "why": "Annotators did not agree on how to read this reaction.",
            "readings": [
                {"move": "ENCOURAGING",
                 "why": "Read this way, the tutor is buoying the student up to "
                        "keep going."},
                {"move": "PRAISING_PROCESS",
                 "why": "Read this way, the applause is credit for the "
                        "reasoning the student had just laid out."},
            ],
            "clues": [
                {"q": "Wow",
                 "why": "An expression of surprise and approval that names "
                        "nothing specific — which is why it is hard to code."},
                {"q": "👏👏👏",
                 "why": "Applause emoji carrying the affective weight of the "
                        "turn rather than any words."},
            ],
        },
        20: {
            "why": "Annotators did not agree on what this praise is directed "
                   "at.",
            "readings": [
                {"move": "PRAISING_TRAITS",
                 "why": "Read this way, 'brilliant' praises the student as a "
                        "person — the kind of praise research suggests is "
                        "less durable."},
                {"move": "PRAISING_OUTCOME",
                 "why": "Read this way, it praises the result the student just "
                        "reached, not the student themselves."},
            ],
            "clues": [
                {"q": "Absolutely brilliant!",
                 "why": "Ambiguous target — 'brilliant' can attach to the "
                        "person or to the work, and the sentence does not say "
                        "which."},
                {"q": "wel done",
                 "why": "Praise addressed to the student by name, which pulls "
                        "the reading toward the person."},
            ],
        },
    },
}
