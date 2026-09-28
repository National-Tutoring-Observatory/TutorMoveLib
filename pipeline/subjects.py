"""Strand and US grade for each Eedi subtopic in the source data.

Eedi tags every dialogue with one or more subtopics (source/dialogue-subjects.csv)
but carries no grade. The grade here is INFERRED by matching the subtopic to US
standards, the same way questions.py grades its hand-analysed sessions — Eedi is
British, so this is roughly UK year - 1. A session tagged with several subtopics
is placed by the one in PRIMARY_SUBTOPIC below.

Sessions analysed by hand in questions.py keep their own strand and grade; this
table covers everything else.
"""

# subtopic: (strand, grade)
SUBTOPICS = {
    "Place Value": ("Number and place value", 3),
    "Rounding to the Nearest Whole (10, 100, etc)": ("Number and place value", 4),
    "Estimation": ("Number and place value", 5),
    "Basic Calculator Use": ("Number and place value", 6),

    "Mental Addition and Subtraction": ("Addition and subtraction", 3),
    "Written Addition": ("Addition and subtraction", 3),
    "Written Subtraction": ("Addition and subtraction", 3),

    "Mental Multiplication and Division": ("Multiplication and division", 4),
    "Written Division": ("Multiplication and division", 5),
    "BIDMAS": ("Multiplication and division", 5),

    "Equivalent Fractions": ("Fractions", 4),
    "Simplifying Fractions": ("Fractions", 4),
    "Ordering Fractions": ("Fractions", 4),
    "Converting Mixed Number and Improper Fractions": ("Fractions", 4),
    "Adding and Subtracting Fractions": ("Fractions", 5),
    "Multiplying Fractions": ("Fractions", 5),
    "Fractions of an Amount": ("Fractions", 5),

    "Converting between Fractions and Decimals": ("Decimals", 4),
    "Adding and Subtracting with Decimals": ("Decimals", 5),
    "Multiplying and Dividing with Decimals": ("Decimals", 6),

    "Converting between Fractions and Percentages": ("Percentages", 6),
    "Percentages of an Amount": ("Percentages", 6),
    "Percentage Increase and Decrease": ("Percentages", 7),
    "Repeated Percentages and Compound Interest": ("Percentages", 7),
    "Reverse Percentages (Original Amount)": ("Percentages", 8),

    "Writing Ratios": ("Ratio and proportion", 6),
    "Simplifying and Equivalent Ratios": ("Ratio and proportion", 6),
    "Sharing in a Ratio": ("Ratio and proportion", 6),

    "Ordering Negative Numbers": ("Negative numbers", 6),
    "Adding and Subtracting Negative Numbers": ("Negative numbers", 6),
    "Multiplying and Dividing Negative Numbers": ("Negative numbers", 7),
    "Mixed operation Negative Numbers": ("Negative numbers", 7),

    "Squares, Cubes, etc": ("Powers and roots", 6),
    "Square Roots, Cube Roots, etc": ("Powers and roots", 8),
    "Standard Form": ("Powers and roots", 8),

    "Function Machines": ("Algebra", 6),
    "Writing Expressions": ("Algebra", 6),
    "Substitution into Formula": ("Algebra", 6),
    "Inequalities on Number Lines": ("Algebra", 6),
    "Linear Equations": ("Algebra", 7),
    "Solving Linear Inequalities": ("Algebra", 7),
    "Multiplying Terms": ("Algebra", 7),
    "Expanding Single Brackets": ("Algebra", 7),
    "Rearranging Formula and Equations": ("Algebra", 8),
    "Linear Sequences (nth term)": ("Algebra", 8),
    "Simplifying Algebraic Fractions": ("Algebra", 9),

    "Real Life Graphs": ("Graphs and functions", 8),
    "Plotting Lines from Tables of Values": ("Graphs and functions", 8),
    "Gradient as change in y over change in x": ("Graphs and functions", 8),
    "Finding the Gradient and Intercept of a Line from the Equation":
        ("Graphs and functions", 8),
    "Finding the Equation of a Line": ("Graphs and functions", 8),

    "Line Symmetry": ("Geometry", 4),
    "2D Names and Properties of Shapes-Others": ("Geometry", 4),
    "Properties of Polygons": ("Geometry", 5),
    "Area of Simple Shapes": ("Geometry", 6),
    "Basic Angle Facts (straight line, opposite, around a point, etc)":
        ("Geometry", 7),
    "Angles in Triangles": ("Geometry", 7),
    "Angles in Polygons": ("Geometry", 7),
    "Area of a Circle": ("Geometry", 7),
    "Surface Area of Non-Prisms": ("Geometry", 8),
    "Volume of Non-Prisms": ("Geometry", 8),

    "Time": ("Measurement and data", 3),
    "Temperature units": ("Measurement and data", 5),

    "Time Series and Line Graphs": ("Statistics", 5),
    "Averages (mean, median, mode) from a List of Data": ("Statistics", 6),
    "Pie Chart": ("Statistics", 7),
    "Venn Diagrams": ("Statistics", 7),
    "Averages and Range from Frequency Table": ("Statistics", 8),
    "Averages and Range from Grouped Data": ("Statistics", 9),
}

# Sessions Eedi tags with several subtopics, and the one that matches the
# question actually asked — the tags cover the whole conversation, so the first
# or the hardest is often not it. Chosen by reading each question; a session
# not analysed by hand in questions.py must appear here if it has more than
# one tag. The choice may be a subtopic Eedi did not tag, when none of its tags
# fit.
PRIMARY_SUBTOPIC = {
    "10626": "Written Addition",
    "9461": "Fractions of an Amount",
    "862": "Equivalent Fractions",
    "9248": "Function Machines",
    "11244": "Multiplying and Dividing with Decimals",
    "7084": "Fractions of an Amount",
    "9932": "Converting between Fractions and Percentages",
    "11085": "Ordering Negative Numbers",
    "436": "Ordering Negative Numbers",
    "603": "Multiplying and Dividing with Decimals",
    "10723": "Writing Ratios",
    "5367": "Sharing in a Ratio",
    "4022": "Solving Linear Inequalities",
    "11941": "Properties of Polygons",
    "6759": "Angles in Triangles",
    "6170": "Mixed operation Negative Numbers",
    "8942": "Linear Sequences (nth term)",
    "8286": "Standard Form",
    "6028": "Plotting Lines from Tables of Values",
    "672": "Surface Area of Non-Prisms",
}
