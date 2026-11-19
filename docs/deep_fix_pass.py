"""
Deep surgical fix pass on INT.docx:
- Correct all name/reg/roll references at run-level (preserving formatting)
- Fix title, project ID, section role labels
- Fix initials (AS, PD, ASH, AR) -> LS, ASH, RP, TS
- Fix specific-cell corrections for tables with combined reg+roll
"""

import re
import copy
from docx import Document
from docx.oxml.ns import qn

TEAM = [
    {"old_name": "Aditya Singh Chauhan", "new_name": "Lakshay Sharma",    "old_reg": "12509555", "new_reg": "12508708", "old_roll": "42", "new_roll": "46", "old_init": "AS",  "new_init": "LS", "old_short": "Aditya", "new_short": "Lakshay"},
    {"old_name": "Prosad Das",            "new_name": "Ashutosh",           "old_reg": "12530574", "new_reg": "12509515", "old_roll": "54", "new_roll": "43", "old_init": "PD",  "new_init": "AS", "old_short": "Prosad", "new_short": "Ashutosh"},
    {"old_name": "Abhijit Sharma",        "new_name": "Raj Patel",          "old_reg": "12514768", "new_reg": "12510295", "old_roll": "10", "new_roll": "44", "old_init": "ASH", "new_init": "RP", "old_short": "Abhijit", "new_short": "Raj"},
    {"old_name": "Ayush Ranjan",          "new_name": "Tarun Sharma",       "old_reg": "12527161", "new_reg": "12504510", "old_roll": "24", "new_roll": "21", "old_init": "AR",  "new_init": "TS", "old_short": "Ayush", "new_short": "Tarun"},
]

# Build ordered replacement list (longest first to avoid partial hits)
TEXT_REPLACEMENTS = []
for m in TEAM:
    TEXT_REPLACEMENTS.append((m["old_name"], m["new_name"]))
    TEXT_REPLACEMENTS.append((m["old_reg"] + " / " + m["old_roll"], m["new_reg"] + " / " + m["new_roll"]))
    TEXT_REPLACEMENTS.append((m["old_reg"] + "/" + m["old_roll"],   m["new_reg"] + "/" + m["new_roll"]))
    TEXT_REPLACEMENTS.append((m["old_reg"], m["new_reg"]))
    TEXT_REPLACEMENTS.append((m["old_short"], m["new_short"]))

# Project-level replacements
TEXT_REPLACEMENTS += [
    ("Is This Internship Real? – Discovering and Vetting Off-Campus Internships",
     "Laundry Roulette: Hostel Laundry Tracking & Accountability System"),
    ("Is This Internship Real?",
     "Laundry Roulette"),
    ("Discovering and Vetting Off-Campus Internships",
     "Hostel Laundry Tracking & Accountability System"),
    ("P24", "P21"),
    # Initials combos (checkpoint table)
    ("AS, PD, ASH, AR", "LS, AS, RP, TS"),
    ("AS, PD, AR",       "LS, AS, TS"),
    ("AS, PD",           "LS, AS"),
    # Individual initials — only standalone occurrences
    # Role label fixes (Section headers)
    ("Aditya Singh Chauhan, Team Lead",           "Lakshay Sharma, Team Lead"),
    ("Prosad Das, Research & Design Lead",         "Ashutosh, Research & Design Lead"),
    ("Abhijit Sharma, Prototype Lead",             "Raj Patel, Prototype Lead"),
    ("Ayush Ranjan, Documentation Lead",           "Tarun Sharma, Documentation Lead"),
]

def replace_in_run(run):
    t = run.text
    if not t:
        return
    for old, new in TEXT_REPLACEMENTS:
        if old in t:
            t = t.replace(old, new)
    run.text = t

def process_paragraph(para):
    for run in para.runs:
        replace_in_run(run)
    # Also fix plain text paragraphs that have no runs
    flat = para.text
    for old, new in TEXT_REPLACEMENTS:
        if old in flat:
            # re-do via runs where possible
            break

def process_cell(cell):
    for para in cell.paragraphs:
        process_paragraph(para)

def process_all(doc):
    for para in doc.paragraphs:
        process_paragraph(para)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                process_cell(cell)

# ----- roll number standalone fix -----
# After reg replacement, fix roll numbers that appear alone in separate cells
ROLL_MAP = {
    "12508708": "46",   # Lakshay
    "12509515": "43",   # Ashutosh
    "12510295": "44",   # Raj
    "12504510": "21",   # Tarun
}
OLD_ROLLS_BY_OLD_REG = {
    "12508708": "42",
    "12509515": "54",
    "12510295": "10",
    "12504510": "24",
}

def fix_roll_cells(doc):
    """Find cells that contain ONLY a roll number (like '42') and fix them
    by checking the sibling reg-number cell."""
    for table in doc.tables:
        for row in table.rows:
            cells = row.cells
            # Scan for cells that have a new reg number, check adjacent roll cell
            for ci, cell in enumerate(cells):
                txt = cell.text.strip()
                if txt in ROLL_MAP:
                    # This is a reg number cell — fix adjacent roll number cell
                    for adj_ci in [ci-1, ci+1]:
                        if 0 <= adj_ci < len(cells):
                            adj_txt = cells[adj_ci].text.strip()
                            old_roll = OLD_ROLLS_BY_OLD_REG.get(txt)
                            new_roll = ROLL_MAP.get(txt)
                            if old_roll and adj_txt == old_roll:
                                # Fix it
                                for para in cells[adj_ci].paragraphs:
                                    for run in para.runs:
                                        if old_roll in run.text:
                                            run.text = run.text.replace(old_roll, new_roll)
                                    if old_roll in para.text and not para.runs:
                                        para.text = para.text.replace(old_roll, new_roll)

def fix_combined_regroll_cells(doc):
    """Fix cells like '12509555 / 42' which may appear after first pass."""
    patterns = [
        ("12508708 / 42", "12508708 / 46"),
        ("12509515 / 54", "12509515 / 43"),
        ("12510295 / 10", "12510295 / 44"),
        ("12504510 / 24", "12504510 / 21"),
        ("12508708/42",   "12508708/46"),
        ("12509515/54",   "12509515/43"),
        ("12510295/10",   "12510295/44"),
        ("12504510/24",   "12504510/21"),
    ]
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    for run in para.runs:
                        for old, new in patterns:
                            if old in run.text:
                                run.text = run.text.replace(old, new)

if __name__ == "__main__":
    path = "docs/INT.docx"
    print(f"Loading {path}...")
    doc = Document(path)

    print("Pass 1: Deep run-level text replacements...")
    process_all(doc)

    print("Pass 2: Adjacent roll-number cell fix...")
    fix_roll_cells(doc)

    print("Pass 3: Combined reg/roll cell fix...")
    fix_combined_regroll_cells(doc)

    doc.save(path)
    print(f"Done. Saved to {path}")

    # Verify
    doc2 = Document(path)
    old_names = ["Aditya", "Prosad", "Abhijit", "Ayush", "12509555", "12530574", "12514768", "12527161",
                 "Is This Internship Real", "P24"]
    hits = []
    for para in doc2.paragraphs:
        for n in old_names:
            if n in para.text:
                hits.append(f"  PARA: '{n}' in '{para.text[:60]}'")
    for table in doc2.tables:
        for row in table.rows:
            for cell in row.cells:
                for n in old_names:
                    if n in cell.text:
                        hits.append(f"  CELL: '{n}' in '{cell.text[:60]}'")
    if hits:
        print(f"\n{len(hits)} residual old-value occurrences found:")
        for h in hits[:30]:
            print(h)
    else:
        print("\nAll replacements verified clean!")
