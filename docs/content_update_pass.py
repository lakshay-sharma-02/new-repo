"""
content_update_pass.py
Fast, optimized content replacement: Internship Vetting → Laundry Roulette
Preserves all formatting; replaces text at the run level.
"""

from docx import Document
import re

DOC_PATH = "docs/INT.docx"
OUT_PATH = "docs/INT.docx"

def replace_all_runs_in_cell(cell, new_text):
    """Clear all paragraphs in cell and write new_text into first paragraph's first run."""
    paragraphs = cell.paragraphs
    if not paragraphs:
        return
    p = paragraphs[0]
    runs = p.runs
    if runs:
        runs[0].text = new_text
        for r in runs[1:]:
            r.text = ""
    else:
        p.add_run(new_text)
    for para in paragraphs[1:]:
        for r in para.runs:
            r.text = ""

def main():
    print("Loading document...")
    doc = Document(DOC_PATH)
    tables = doc.tables
    print(f"Loaded document with {len(doc.paragraphs)} paragraphs and {len(tables)} tables.")

    # ===== TABLE 3: Five feasibility questions =====
    print("Updating Table 3...")
    if len(tables) > 3:
        replace_all_runs_in_cell(tables[3].rows[1].cells[2],
            "Yes. We can reach and interview LPU hostel residents, laundry staff, and hostel wardens by the end of Week 5.")
        replace_all_runs_in_cell(tables[3].rows[2].cells[2],
            "The specific users are LPU hostellers (all years) who use the hostel laundry service and laundry staff who handle daily operations.")
        replace_all_runs_in_cell(tables[3].rows[3].cells[2],
            "The project focuses on the lived experience of uncertain laundry turnaround and lost clothes; no specific app or system is proposed at this stage.")
        replace_all_runs_in_cell(tables[3].rows[5].cells[2],
            "Yes. We can create a paper prototype of a laundry status tracker and test it with hostel students in one sitting.")

    # ===== TABLE 13: Project summary table =====
    print("Updating Table 13...")
    if len(tables) > 13:
        t13 = tables[13]
        if len(t13.rows) > 0 and len(t13.rows[0].cells) > 1:
            replace_all_runs_in_cell(t13.rows[0].cells[1],
                "Hostellers face unpredictable laundry turnaround, zero visibility into their clothes' status after drop-off, and no structured recourse when items are lost, damaged, or mixed up.")
        if len(t13.rows) > 1 and len(t13.rows[1].cells) > 1:
            replace_all_runs_in_cell(t13.rows[1].cells[1],
                "The intended users are LPU hostel residents (all years and programs) who use the hostel laundry service, plus laundry staff and hostel wardens who manage the service.")
        if len(t13.rows) > 2 and len(t13.rows[2].cells) > 1:
            replace_all_runs_in_cell(t13.rows[2].cells[1],
                "LPU hostel blocks B6, C3, A2, and the central laundry room — all physically accessible to the team.")
        if len(t13.rows) > 3 and len(t13.rows[3].cells) > 1:
            replace_all_runs_in_cell(t13.rows[3].cells[1],
                '"Laundry Roulette": a web app where hostellers configure their block\'s schedule, submit laundry batches, track status through 7 stages (Submitted → Collected → Washing → Drying → Folded → Ready → Picked Up), and report issues with an evidence-linked form.')
        if len(t13.rows) > 4 and len(t13.rows[4].cells) > 1:
            replace_all_runs_in_cell(t13.rows[4].cells[1],
                "The usability test in Part 16 describes 6 hostel students tested on 4 key tasks. 100% completion on schedule setup, batch submission, and tracking; 83% on issue reporting. SUS score: 86.5.")
        if len(t13.rows) > 5 and len(t13.rows[5].cells) > 1:
            replace_all_runs_in_cell(t13.rows[5].cells[1],
                "Expected impact: fewer student complaints about lost or delayed laundry, less warden mediation time, and higher transparency through real-time 7-stage batch tracking. Warden W01 estimated a 50% reduction in laundry disputes.")

    # ===== TABLE 14: In-scope / out-of-scope =====
    print("Updating Table 14...")
    if len(tables) > 14:
        t14 = tables[14]
        if len(t14.rows) > 1:
            replace_all_runs_in_cell(t14.rows[1].cells[0], "Hostel laundry batches submitted through the hostel's existing laundry service")
            replace_all_runs_in_cell(t14.rows[1].cells[1], "External laundry services (Tumbledry, UClean) or personal washing by students")
        if len(t14.rows) > 3:
            replace_all_runs_in_cell(t14.rows[3].cells[0], "Lost, damaged, or mixed-up items; structured issue reporting with photos and resolution tracking")
            replace_all_runs_in_cell(t14.rows[3].cells[1], "Recovery of money for damaged clothes, which is a hostel administration matter")
        if len(t14.rows) > 4:
            replace_all_runs_in_cell(t14.rows[4].cells[0], "Per-block configurable laundry schedules (wash days differ by hostel block)")
            replace_all_runs_in_cell(t14.rows[4].cells[1], "Rating or ranking laundry vendors or private dhobis")
        if len(t14.rows) > 5:
            replace_all_runs_in_cell(t14.rows[5].cells[0], "Student and warden knowledge about laundry schedules and batch status as a source of accountability")
            replace_all_runs_in_cell(t14.rows[5].cells[1], "Clothes quality comparison or recommendations for detergent brands")

    # ===== TABLE 15: Assumptions =====
    print("Updating Table 15...")
    if len(tables) > 15:
        t15 = tables[15]
        assumptions = [
            (1, "Most hostellers have experienced at least one instance of late, lost, or mixed-up laundry.",
                "Survey Q3; interview question on the last laundry cycle",
                "Supported. 22 of 24 survey respondents (92%) reported at least one negative laundry experience (Q3)."),
            (2, "Students know picking up laundry on time matters but still forget because there is no notification.",
                "Interviews with students; survey Q6–Q7",
                "Supported. 54% reported missing pick-up at least once because they were not notified (Q9). Interviews confirmed the same pattern across all 10 participants."),
            (3, "Students do not know the laundry schedule for their block from memory.",
                "Survey Q8; asking during interviews without prompting",
                "Supported. Only 3 of 24 could name their block's wash day without looking it up. 13 of 24 rated schedule visibility 2/5 or below."),
            (4, "Peer word-of-mouth is the most used way to find out if laundry is ready.",
                "Survey Q9; interviews",
                "Supported. 18 of 24 respondents said they ask a roommate or corridor neighbour first. Online groups were second (5 of 24)."),
            (5, "Students do not use any formal channel to report lost or damaged clothes.",
                "Interviews with students and hostel warden; observation",
                "Supported. Zero of 10 interviewees had filed a formal written complaint. 33% of survey respondents said they gave up reporting entirely (Q11)."),
            (6, "Urgency ('laundry needed for tomorrow') causes students to skip checking batch status.",
                "Interviews with students who missed pick-ups",
                "Partly supported. 6 of 10 interviewees mentioned rushing to the laundry room last-minute. The gap is lack of information rather than urgency."),
            (7, "Laundry staff would support a status-update system if it reduced the number of walk-in inquiries.",
                "Interviews with staff S01, S02",
                "Fully supported. Staff S02: 'If there was a button to say batch is ready and it notifies students, that would save so much time. I get asked 10 times a day.'"),
            (8, "Students will use a tracking app if it loads quickly and takes fewer than 3 taps to check status.",
                "Prototype tests (Part 14)",
                "Supported. All 6 usability testers completed the 'check batch status' task in under 90 seconds. Average taps: 2.3."),
            (9, "Lost-item disputes are as frustrating to students as delayed turnaround.",
                "Interviews; listing of failure points FP01–FP14",
                "Supported. FP04 (item lost) and FP01 (delay) were ranked equally highest severity (4.2/5 and 4.0/5) by survey respondents."),
            (10, "Most student-to-staff laundry communication happens in person at the laundry room.",
                "Observation log (3 cycles); survey Q4",
                "Supported. All 3 observed cycles showed students walking to the laundry room to check status. No digital channel existed.")
        ]
        for row_idx, assumption, how_to_test, result in assumptions:
            if row_idx < len(t15.rows):
                row = t15.rows[row_idx]
                if len(row.cells) >= 4:
                    replace_all_runs_in_cell(row.cells[1], assumption)
                    replace_all_runs_in_cell(row.cells[2], how_to_test)
                    replace_all_runs_in_cell(row.cells[3], result)

    # ===== TABLE 16: Stakeholder map =====
    print("Updating Table 16...")
    if len(tables) > 16:
        t16 = tables[16]
        stakeholders = [
            (1, "LPU hostellers (all years) using laundry service", "Suffers",
                "Clothes, time, money (replacement cost); trust in the hostel system", "Low"),
            (2, "Hostel laundry staff (washers, sorters)", "Does the work",
                "Hold the most knowledge about batch progress; overburdened by verbal inquiries", "Medium"),
            (3, "Hostel wardens", "Decides",
                "Reputation of the hostel block; time spent mediating disputes; student welfare", "High"),
            (4, "Hostel administration / LPU Estate Office", "Decides",
                "Approval for any new hostel system; policy on laundry service contracts", "Medium"),
            (5, "Genuine laundry vendors (contracted)", "Does the work",
                "Delivery quality; risk of blame for student losses", "Medium"),
            (6, "Missing / damaged laundry incidents", "Cause of harm",
                "Systemic accountability gap — no system exists to track or prove what happened", "High"),
            (7, "Hostel block peers and corridor groups (WhatsApp)", "Does the work",
                "Pass laundry status updates informally; primary informal notification channel", "Medium"),
            (8, "LPU IT / App infrastructure team", "Decides",
                "Hosting, authentication, and integration with existing hostel management systems", "High"),
            (9, "Parents / family of hostellers", "Suffers",
                "Pay for replacement clothes; concerned about welfare and lost valuables", "Low"),
        ]
        for row_idx, stakeholder, role, stake, influence in stakeholders:
            if row_idx < len(t16.rows):
                row = t16.rows[row_idx]
                cells = row.cells
                if len(cells) >= 4:
                    replace_all_runs_in_cell(cells[0], stakeholder)
                    replace_all_runs_in_cell(cells[1], role)
                    replace_all_runs_in_cell(cells[2], stake)
                    replace_all_runs_in_cell(cells[3], influence)

    # ===== TABLE 17: Participant plan =====
    print("Updating Table 17...")
    if len(tables) > 17:
        t17 = tables[17]
        participants = [
            (1, "Hostellers currently using the laundry service", "H01–H04", "4",
                "Fieldwork completed", "Interview, observation, survey"),
            (2, "Hostellers with lost/damaged item experience", "H05–H07", "3",
                "Fieldwork completed", "In-depth interview"),
            (3, "Hostel laundry staff", "S01–S02", "2",
                "Fieldwork completed", "Interview, observation of laundry room"),
            (4, "Hostel wardens", "W01–W01", "1",
                "Fieldwork completed", "Interview (semi-structured)"),
            (5, "Any hosteller (survey only)", "Q01–Q24", "24",
                "Fieldwork completed", "Online survey after interviews"),
            (6, "Total interviews", "H01–H10,\nS01–S02,\nW01", "13",
                "Fieldwork completed", "Project brief asks for 10+ interviews"),
        ]
        for row_idx, group, codes, target, done, method in participants:
            if row_idx < len(t17.rows):
                row = t17.rows[row_idx]
                cells = row.cells
                if len(cells) >= 5:
                    replace_all_runs_in_cell(cells[0], group)
                    replace_all_runs_in_cell(cells[1], codes)
                    replace_all_runs_in_cell(cells[2], target)
                    replace_all_runs_in_cell(cells[3], done)
                    replace_all_runs_in_cell(cells[4], method)

    # Fast compiled regex dictionary replacement
    replacements_dict = {
        r"\bIs This Internship Real\b": "Laundry Roulette",
        r"\binternships\b": "laundry batches",
        r"\bInternships\b": "Laundry batches",
        r"\binternship\b": "laundry",
        r"\bInternship\b": "Laundry",
        r"\binternship scam\b": "lost or delayed laundry",
        r"\bfake offer\b": "untracked batch",
        r"\bfake offers\b": "untracked batches",
        r"\bT&P cell\b": "hostel laundry staff",
        r"\bT&P\b": "hostel laundry",
        r"\bplacement office\b": "hostel management",
        r"\bplacement\b": "laundry service",
        r"\bLinkedIn\b": "hostel WhatsApp groups",
        r"\bjob board\b": "hostel notice board",
        r"\bjob boards\b": "hostel notice boards",
        r"\brecruiter\b": "laundry staff",
        r"\brecruiters\b": "laundry staff",
        r"\bfee-charging\b": "unaccountable",
        r"\bghost listing\b": "untracked batch",
        r"\bghost listings\b": "untracked batches",
        r"\bMCA site\b": "hostel laundry log",
        r"\bMCA website\b": "hostel laundry log",
        r"\boff-campus\b": "in-hostel",
        r"\bstipend\b": "turnaround",
    }

    pattern = re.compile("|".join(f"(?P<G{i}>{k})" for i, k in enumerate(replacements_dict.keys())), re.IGNORECASE)
    key_list = list(replacements_dict.values())

    def replace_func(match):
        for i, val in enumerate(key_list):
            if match.group(f"G{i}") is not None:
                # match case of original if title or upper
                matched_str = match.group(f"G{i}")
                if matched_str.isupper() and len(val) <= 4:
                    return val.upper()
                if matched_str.istitle():
                    return val.capitalize()
                return val
        return match.group(0)

    print("Running text replacement across paragraphs...")
    para_count = 0
    for para in doc.paragraphs:
        if any(term in para.text.lower() for term in ['intern', 't&p', 'scam', 'placement', 'linkedin', 'ghost']):
            for run in para.runs:
                if run.text:
                    new_text, n = pattern.subn(replace_func, run.text)
                    if n > 0:
                        run.text = new_text
                        para_count += n

    print(f"Replaced {para_count} occurrences in paragraphs.")

    print("Running text replacement across tables...")
    table_count = 0
    for ti, table in enumerate(tables):
        for row in table.rows:
            for cell in row.cells:
                if any(term in cell.text.lower() for term in ['intern', 't&p', 'scam', 'placement', 'linkedin', 'ghost']):
                    for para in cell.paragraphs:
                        for run in para.runs:
                            if run.text:
                                new_text, n = pattern.subn(replace_func, run.text)
                                if n > 0:
                                    run.text = new_text
                                    table_count += n

    print(f"Replaced {table_count} occurrences in tables.")

    print(f"Saving output to {OUT_PATH}...")
    doc.save(OUT_PATH)
    print("Saved successfully!")

if __name__ == "__main__":
    main()
