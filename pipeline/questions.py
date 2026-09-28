"""What each session's question actually is, and roughly what grade it sits at.

The question images are NOT in the corpus — students say "this question" and the
tutor works from a picture we never see. Everything here is RECONSTRUCTED from
the dialogue, so each entry carries a `confidence`:

    high      the tutor read the numbers aloud; the question and answer are
              recoverable almost verbatim
    inferred  the stimulus was a diagram we never see, so the question is a
              best reconstruction from how the tutor talks about it. Still a
              concrete guess, but a guess.

`exemplar` marks the sessions the prototype actually shows. The bar is simple:
the session has to reach a genuine resolution, and the tutoring has to be sound
enough to hold up as an example of the practice. Five fail it, each with the
reason recorded in `excluded_because` — flip the flag to put one back.

Grades are inferred by matching content to US standards. The source platform is
Eedi, which is British, so `uk_year` records the original framing —
US grade = UK year - 1. One session pins this down: in 2846 the tutor says the
platform "is really meant for year 5s and upwards", i.e. US Grade 4+.
"""

QUESTIONS = {
    "12124": {
        "question": "Put 5099, 5619 and 5671 in ascending order, and pick the "
                    "matching option from A-D.",
        "answer": "D",
        "strand": "Number and place value",
        "grade": 3, "uk_year": 4, "confidence": "high",
        "exemplar": True,
    },
    "6213": {
        "question": "A number line runs from 125 to 150 with four marks between "
                    "them. What is the value one mark before 150?",
        "answer": "A (145)",
        "strand": "Number and place value",
        "grade": 3, "uk_year": 4, "confidence": "high",
        "exemplar": True,
    },
    "9956": {
        "question": "An array shows 5 x 8 = 40. Given A x 5 = B and C ÷ 5 = D, "
                    "which letters have equal values?",
        "answer": "C (A and D are 8; B and C are 40)",
        "strand": "Multiplication and division",
        "grade": 4, "uk_year": 5, "confidence": "high",
        "exemplar": True,
    },
    "4249": {
        "question": "Round 356,958 to the nearest 100.",
        "answer": "357,000",
        "strand": "Number and place value",
        "grade": 4, "uk_year": 5, "confidence": "high",
        "exemplar": True,
    },
    "2846": {
        "question": "Add 100 to 72,980.",
        "answer": "73,080",
        "strand": "Number and place value",
        "grade": 4, "uk_year": 5, "confidence": "high",
        # The tutor states this student is in Year 3 (US Grade 2) and is
        # working above the platform's intended level.
        "student_uk_year": 3,
        "exemplar": False,
        "excluded_because":
            "The tutor mistypes the number being counted from, and the student never reaches the answer themselves.",
    },
    "11646": {
        "question": "Two students factorise 12 x 21 differently — one as "
                    "12 x 7 x 3, the other as 21 x 6 then doubled. Are both "
                    "correct?",
        "answer": "Both are correct",
        "strand": "Multiplication and division",
        "grade": 4, "uk_year": 5, "confidence": "high",
        "exemplar": True,
    },
    "5983": {
        "question": "To multiply by 24, one student splits 24 into factors "
                    "(6 x 4) and another splits it as 20 x 4. Who has "
                    "factorised correctly?",
        "answer": "A — 24 factorises as 6 x 4 or 8 x 3; 20 x 4 is 80, not 24",
        "strand": "Multiplication and division",
        "grade": 4, "uk_year": 5, "confidence": "inferred",
        "exemplar": True,
    },
    "4069": {
        "question": "A rail timetable lists departures from Edinburgh "
                    "Waverley. The last train leaves at 15:40 — what time "
                    "does it arrive at Cambridge Central?",
        "answer": "Never stated — the student left before reaching it. Their "
                  "wrong guess of 6:00 came from reading across a row instead "
                  "of down the column.",
        "strand": "Measurement and data",
        "grade": 4, "uk_year": 5, "confidence": "inferred",
        "exemplar": False,
        "excluded_because":
            "The student walks off mid-problem — 'i dont need help anymore im good'. The question is never answered.",
    },
    "255": {
        "question": "Two students each claim their shape is a regular "
                    "polygon. One shape is marked with equal-side dashes and "
                    "equal-angle arcs (three of each, so most likely an "
                    "equilateral triangle); the other carries no markings. "
                    "Who is correct?",
        "answer": "Only the marked shape. The unmarked one cannot be judged — "
                  "nothing tells us about its sides or angles.",
        "strand": "Geometry",
        "grade": 5, "uk_year": 6, "confidence": "inferred",
        "exemplar": True,
    },
    "5268": {
        "question": "Of 45, 47 and 49, which number's factor tree branches "
                    "into two different numbers?",
        "answer": "45 (9 x 5)",
        "strand": "Factors and multiples",
        "grade": 5, "uk_year": 6, "confidence": "high",
        "exemplar": False,
        "excluded_because":
            "The tutor misreads the question and works the wrong task for most of the session; the student is the one who catches it.",
    },
    "7570": {
        "question": "Dividing 0.3 by a decimal gives 1.2 — larger than the "
                    "original. Which division is it?",
        "answer": "A (0.3 ÷ 0.25 = 1.2)",
        "strand": "Decimals",
        "grade": 6, "uk_year": 7, "confidence": "high",
        "exemplar": True,
    },
    "9407": {
        "question": "Which is larger, 5% of 20 or 20% of 5?",
        "answer": "C (both are 1)",
        "strand": "Percentages",
        "grade": 6, "uk_year": 7, "confidence": "high",
        "exemplar": True,
    },
    "5228": {
        "question": "Write 0.1% as a fraction, then 24.4% as a fraction.",
        "answer": "1/1000, then 244/1000",
        "strand": "Percentages",
        "grade": 6, "uk_year": 7, "confidence": "high",
        "exemplar": True,
    },
    "2186": {
        "question": "Sweets are shared in the ratio 3:2. The student with 3 "
                    "parts receives 60 sweets. How many does the other get?",
        "answer": "40",
        "strand": "Ratio and proportion",
        "grade": 6, "uk_year": 7, "confidence": "high",
        "exemplar": True,
    },
    "5642": {
        "question": "Write the ratio 3:2 in the form 1:n.",
        "answer": "B (1 : 2÷3)",
        "strand": "Ratio and proportion",
        "grade": 6, "uk_year": 7, "confidence": "high",
        "exemplar": False,
        "excluded_because":
            "The tutor reads the ratio the wrong way round, and the student reaches the answer by spotting it among the options rather than working it out.",
    },
    "7927": {
        "question": "An amount is increased by 50%, then that result is "
                    "increased by 10%. What percentage of the original is it?",
        "answer": "165%",
        "strand": "Percentages",
        "grade": 7, "uk_year": 8, "confidence": "high",
        "exemplar": True,
    },
    "3923": {
        "question": "A rectangle's length increases by 10% and its width "
                    "decreases by 10%. What happens to its area?",
        "answer": "B (it falls by 1%, to 99% of the original)",
        "strand": "Percentages",
        "grade": 7, "uk_year": 8, "confidence": "high",
        "exemplar": True,
    },
    "4123": {
        "question": "Solve (m - 1) / 4 = 20. One student multiplies by 4 "
                    "first, the other adds 1 first. Who is right?",
        "answer": "The one who multiplied by 4 first (m - 1 = 80)",
        "strand": "Algebra",
        "grade": 7, "uk_year": 8, "confidence": "high",
        "exemplar": True,
    },
    "657": {
        "question": "Given x + y + 2 = 10 and (x + y) / 2 = 6, which "
                    "rearranges to x + y = 12?",
        "answer": "B (only the second; the first gives x + y = 8)",
        "strand": "Algebra",
        "grade": 7, "uk_year": 8, "confidence": "high",
        "exemplar": True,
    },
    "258": {
        "question": "A glass is filled at a steady rate. The graph of water "
                    "depth against time rises steeply at first, then levels "
                    "off. Which of the four glasses produces this graph?",
        "answer": "D — narrow at the base so it fills fast, widening towards "
                  "the top so it slows",
        "strand": "Graphs and functions",
        "grade": 8, "uk_year": 9, "confidence": "inferred",
        "exemplar": False,
        "excluded_because":
            "The student says outright they still do not understand, then disengages. The explanation never lands.",
    },
}

GRADE_LABELS = {
    3: "Grade 3", 4: "Grade 4", 5: "Grade 5",
    6: "Grade 6", 7: "Grade 7", 8: "Grade 8",
}
