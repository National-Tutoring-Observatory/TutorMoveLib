"""Move vocabulary, teacher-facing definitions, and the cognitive-responsibility
spectrum, for the Tutoring Moves Library prototype.

Codes here are the ones that actually occur in the NTO/Eedi consensus data. That
vocabulary predates the taxonomy paper (Taxnomy), which renamed three of the
PROMPTING_* codes; TAXONOMY_RENAMES records the mapping so the prototype can be
migrated to the paper's vocabulary later without re-deriving it.
"""

TAXONOMY_RENAMES = {
    "PROMPTING_NEXT_STEP": "PROMPTING_ACTION",
    "PROMPTING_SELF_EXPLANATION": "PROMPTING_EXPLANATION",
    "PROMPTING_RELATED_CONCEPTS": "PROMPTING_RELATED_KNOWLEDGE",
}

# The coded transcript uses the paper's spellings; the corpus keeps the codes
# the site was built on. Anything not listed is spelled the same in both.
SOURCE_CODES = {new: old for old, new in TAXONOMY_RENAMES.items()}
SOURCE_CODES["PRAISING_TRAIT"] = "PRAISING_TRAITS"

# category: one of tutoring | learning | social | logistical
# rung: position on the spectrum of cognitive responsibility, 1 = student holds
# the most thinking, 6 = tutor has taken it over. Only learning-support moves
# sit on the spectrum; None for everything else.
MOVES = {
    # ---- Learning support: the spectrum of cognitive responsibility ----
    "PROMPTING_SELF_EXPLANATION": {
        "name": "Prompting self-explanation", "category": "learning", "rung": 1,
        "def": "Asks the student to explain their own reasoning out loud.",
    },
    "PROMPTING_RELATED_CONCEPTS": {
        "name": "Prompting related concepts", "category": "learning", "rung": 1,
        "def": "Asks the student to connect this to something they already know.",
    },
    "REVOICING": {
        "name": "Revoicing", "category": "learning", "rung": 1,
        "def": "Restates what the student said in different words, keeping "
               "their idea at the centre.",
    },
    "PROMPTING_NEXT_STEP": {
        "name": "Prompting next step", "category": "learning", "rung": 2,
        "def": "Asks the student to take the next step themselves, instead of "
               "being told what it is.",
    },
    "PROMPTING_CORRECTION": {
        "name": "Prompting correction", "category": "learning", "rung": 2,
        "def": "Points the student back at their own mistake to fix, without "
               "showing the right way.",
    },
    "GIVING_HINT": {
        "name": "Giving a hint", "category": "learning", "rung": 3,
        "def": "Nudges toward the answer while leaving the work to the student.",
    },
    "GIVING_EXAMPLE": {
        "name": "Giving an example", "category": "learning", "rung": 4,
        "def": "Offers a parallel case for the student to reason from.",
    },
    "EXPLAINING_CONCEPTUAL": {
        "name": "Explaining a concept", "category": "learning", "rung": 4,
        "def": "Explains why something works, not just how to do it.",
    },
    "EXPLAINING_PROCEDURAL": {
        "name": "Explaining a procedure", "category": "learning", "rung": 5,
        "def": "Walks through the steps of how something is done.",
    },
    "GIVING_ANSWER": {
        "name": "Giving the answer", "category": "learning", "rung": 6,
        "def": "Supplies the answer outright.",
    },

    # ---- Tutoring support ----
    "STRATEGIZING": {
        "name": "Strategizing", "category": "tutoring", "rung": None,
        "def": "Sets out the plan or structure for tackling the problem.",
    },
    "PROBING_UNDERSTAND": {
        "name": "Probing understanding", "category": "tutoring", "rung": None,
        "def": "Checks what the student currently understands.",
    },
    "PROBING_PRIOR_KNOWLEDGE": {
        "name": "Probing prior knowledge", "category": "tutoring", "rung": None,
        "def": "Checks what the student already knew coming in.",
    },
    "FEEDBACK_CORRECT": {
        "name": "Feedback: correct", "category": "tutoring", "rung": None,
        "def": "Confirms the student's answer is right.",
    },
    "FEEDBACK_INCORRECT": {
        "name": "Feedback: incorrect", "category": "tutoring", "rung": None,
        "def": "Signals the answer isn't right, without necessarily supplying "
               "the right one.",
    },
    "FEEDBACK_NEUTRAL": {
        "name": "Feedback: neutral", "category": "tutoring", "rung": None,
        "def": "Acknowledges the answer without marking it right or wrong.",
    },
    "CORRECTING_OWN_ERROR": {
        "name": "Correcting own error", "category": "tutoring", "rung": None,
        "def": "The tutor catches and repairs their own mistake.",
    },
    "ASKING_TO_CLARIFY_CONTEXT": {
        "name": "Asking to clarify context", "category": "tutoring", "rung": None,
        "def": "Asks what the student is looking at or working on.",
    },

    # ---- Social-emotional and motivational support ----
    "VALIDATING_FEELING": {
        "name": "Validating feeling", "category": "social", "rung": None,
        "def": "Names and accepts how the student is feeling.",
    },
    "BUILDING_RAPPORT": {
        "name": "Building rapport", "category": "social", "rung": None,
        "def": "Builds the relationship rather than working on the maths.",
    },
    "ENCOURAGING": {
        "name": "Encouraging", "category": "social", "rung": None,
        "def": "Urges the student to keep going.",
    },
    "PRAISING_PROCESS": {
        "name": "Praising process", "category": "social", "rung": None,
        "def": "Praises effort or strategy — what the student did.",
    },
    "PRAISING_OUTCOME": {
        "name": "Praising outcome", "category": "social", "rung": None,
        "def": "Praises the result the student reached.",
    },
    "PRAISING_TRAITS": {
        "name": "Praising traits", "category": "social", "rung": None,
        "def": "Praises the student as a person ('you're so clever').",
    },
    "ASKING_FEELING": {
        "name": "Asking about feeling", "category": "social", "rung": None,
        "def": "Asks how the student is doing.",
    },

    # ---- Logistical ----
    "MANAGING": {
        "name": "Managing the session", "category": "logistical", "rung": None,
        "def": "Handles the running of the session itself.",
    },
    "TECHNICAL_ISSUES": {
        "name": "Technical issues", "category": "logistical", "rung": None,
        "def": "Deals with the platform rather than the maths.",
    },
}

CATEGORIES = {
    "learning": "Learning support",
    "tutoring": "Tutoring support",
    "social": "Social-emotional support",
    "logistical": "Logistical",
}

SPECTRUM_RUNGS = {
    1: "Student does the explaining",
    2: "Student takes the step",
    3: "Student works from a nudge",
    4: "Student reasons from what's given",
    5: "Tutor walks it through",
    6: "Tutor supplies it",
}
