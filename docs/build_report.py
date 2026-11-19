"""Build the Laundry Roulette final report (docs/INT.docx).

Run from the repository root:
    python docs/build_report.py

The report follows the INT335 course scaffold: front matter, four role-based
sections, Parts 2 to 22, and a contribution statement and declaration at the
end of each member's section.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import report
from report import front, section1, section2, section3, section4

OUTPUT = os.path.join("docs", "INT.docx")
FIGURES = os.path.join("docs", "figures")


def main():
    if not os.path.isdir(FIGURES):
        raise SystemExit("Missing docs/figures. Run: python docs/make_figures.py")

    doc = report.setup_document()

    print("Front matter...")
    front.build(doc)

    print("Section 1 (Team Lead)...")
    section1.build(doc)

    print("Section 2 (Research & Design Lead)...")
    section2.build(doc)

    print("Section 3 (Prototype Lead)...")
    section3.build(doc)

    print("Section 4 (Documentation Lead)...")
    section4.build(doc)

    doc.save(OUTPUT)
    print("Saved", OUTPUT)


if __name__ == "__main__":
    main()
