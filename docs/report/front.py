"""Cover page, registration sheet, checkpoint record and table of contents."""

from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from . import (h1, h2, para, bullets, table, key_value_table, callout, shade, borders,
               cell_margins, signature_row, NAVY, SLATE, GREY, INK, CONTENT_WIDTH)

TEAM = [
    ("1", "Lakshay Sharma", "12508708", "46", "Team Lead", ""),
    ("2", "Ashutosh", "12509515", "43", "Research & Design Lead", ""),
    ("3", "Raj Patel", "12510295", "44", "Prototype Lead", ""),
    ("4", "Tarun Sharma", "12504510", "21", "Documentation Lead", ""),
]

TOC = [
    ("—", "Cover page and Project Registration Sheet", "Front matter", "Whole team"),
    ("—", "Checkpoint Record Card and mentor observations", "Front matter", "Whole team"),
    ("—", "Table of contents", "Front matter", "Whole team"),
    ("2", "Team Details and working norms", "Section 1", "Lakshay Sharma"),
    ("3", "Summary of the project", "Section 1", "Lakshay Sharma"),
    ("4", "Background and context", "Section 1", "Lakshay Sharma"),
    ("5", "Stakeholders", "Section 1", "Lakshay Sharma"),
    ("6", "Empathy research: interviews, observation, survey", "Section 2", "Ashutosh"),
    ("7", "Personas", "Section 2", "Ashutosh"),
    ("8", "Journey map", "Section 2", "Ashutosh"),
    ("9", "Problem definition", "Section 2", "Ashutosh"),
    ("10", "POV statements and HMW questions", "Section 2", "Ashutosh"),
    ("11", "Ideation", "Section 3", "Raj Patel"),
    ("12", "Choosing the idea", "Section 3", "Raj Patel"),
    ("13", "Prototype", "Section 3", "Raj Patel"),
    ("14", "Testing", "Section 3", "Raj Patel"),
    ("15", "What we changed", "Section 3", "Raj Patel"),
    ("16", "Final solution", "Section 4", "Tarun Sharma"),
    ("17", "Impact and value", "Section 4", "Tarun Sharma"),
    ("18", "Limitations", "Section 4", "Tarun Sharma"),
    ("19", "Future scope", "Section 4", "Tarun Sharma"),
    ("20", "Conclusion and going-back log", "Section 1", "Lakshay Sharma"),
    ("21", "References and AI-use statement", "Section 4", "Tarun Sharma"),
    ("22", "Appendices", "Section 4", "Tarun Sharma"),
]


def cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("Transforming Education Transforming India")
    r.bold = True
    r.font.size = Pt(12)
    r.font.color.rgb = NAVY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(26)
    r = p.add_run("Lovely Professional University  ·  Department of Design and Human-Centred Computing")
    r.font.size = Pt(9)
    r.font.color.rgb = GREY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(34)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Laundry Roulette")
    r.bold = True
    r.font.size = Pt(34)
    r.font.color.rgb = NAVY

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("Hostel Laundry Tracking and Accountability System")
    r.bold = True
    r.font.size = Pt(15)
    r.font.color.rgb = INK

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(30)
    r = p.add_run("A human-centred design investigation into laundry turnaround, status visibility "
                  "and dispute recourse in campus hostels")
    r.italic = True
    r.font.size = Pt(10.5)
    r.font.color.rgb = SLATE

    table(doc, ["Course", "Assessment", "Project", "Session"],
          [["INT335 — Design Thinking", "Continuous Assessment 2 (CA2) Final Report",
            "P21 · Team 05", "2026–27"]],
          widths=[1.8, 2.2, 1.3, 0.9], font_size=9)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Submitted to")
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = GREY
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("Akash Bhattacharjee, Assistant Professor\nSchool of Computer Science and Engineering")
    r.font.size = Pt(10.5)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Submitted by  ·  Section K2P25QH")
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = GREY

    table(doc, ["#", "Name", "Registration no.", "Roll no.", "Role held", "Signature"],
          TEAM, widths=[0.4, 1.9, 1.3, 0.8, 1.7, 1.0], font_size=9)

    para(doc, "Project title: Laundry Roulette — Hostel Laundry Tracking and Accountability System",
         size=8.5, italic=True, color=SLATE)


def registration_sheet(doc):
    h1(doc, "Project Registration Sheet")

    key_value_table(doc, [
        ("Section", "K2P25QH"),
        ("Team no.", "05"),
        ("Mentor", "Akash Bhattacharjee, Assistant Professor"),
        ("Date submitted", "06 August 2026"),
        ("Project ID", "P21"),
        ("Session", "2026–27"),
        ("Project title", "Laundry Roulette — Hostel Laundry Tracking and Accountability System"),
        ("Domain", "Hostel life and campus services"),
    ], widths=(1.7, 5.1), font_size=9.5)

    h2(doc, "Team roster")
    table(doc, ["#", "Name", "Registration no.", "Roll no.", "Role held", "Signature"],
          [list(row) for row in TEAM], widths=[0.4, 1.9, 1.3, 0.8, 1.7, 1.0], font_size=9)

    h2(doc, "Problem space (v1) — written as a problem, with no technology named")
    para(doc, "Hostellers hand their clothes to a block laundry service and then lose sight of them. "
              "Turnaround varies from a few hours to several days without explanation, clothes come back "
              "late, damp, mixed with someone else's, stained or missing, and there is no record of what "
              "was submitted when a dispute begins. Students absorb the loss because arguing is harder than "
              "replacing a shirt.", align="justify")

    h2(doc, "Target user group — specific, not \u201call students\u201d")
    para(doc, "Undergraduate and postgraduate hostellers living in LPU residential blocks B6, C3, A2 and D1 "
              "who use the block laundry service, together with the laundry attendants who sort and wash the "
              "bags and the hostel wardens who are asked to settle the disputes that follow.", align="justify")

    h2(doc, "Field site(s) the team can physically reach")
    para(doc, "The laundry collection and distribution rooms of blocks B6, C3 and A2, the central washing and "
              "drying area they feed into, the hostel common rooms and study halls where students wait, and the "
              "warden offices where complaints are escalated.")

    h2(doc, "The five qualifying questions")
    table(doc, ["#", "The question", "Our evidence (not just YES)", "Yes", "No"], [
        ["1", "Can you reach it? Name the users you can watch and interview by the end of Week 5.",
         "Yes. We reached 10 hostellers across four blocks, two laundry attendants and one warden, and we "
         "observed three complete laundry cycles.", "☒", "☐"],
        ["2", "Who exactly? Name the specific group of people.",
         "Hostellers in blocks B6, C3, A2 and D1 who submit to the block laundry weekly or fortnightly, the two "
         "attendants who run each block's collection, and the wardens who handle escalations.", "☒", "☐"],
        ["3", "Problem, not solution? Confirm no app, website or system is named above.",
         "Confirmed. The registration sheet describes lost visibility, unpredictable turnaround and unprovable "
         "disputes. No product or technology is proposed as the problem.", "☒", "☐"],
        ["4", "Safe to research? No personal details collected; consent can be asked in the person's own language.",
         "We collect no health, financial or identity details. Interviewers read the consent script in Hindi, "
         "English or Punjabi, participants are recorded only by code, and staff areas are observed only with "
         "permission.", "☒", "☐"],
        ["5", "Can you prototype it? Something testable could be built on paper in one sitting.",
         "Yes. A paper walkthrough of the status tracker was tested in Week 9, and a working web prototype of "
         "the same flow was tested with six hostellers in Week 12.", "☒", "☐"],
    ], widths=[0.35, 2.1, 3.5, 0.4, 0.4], font_size=8.5)

    h2(doc, "Mentor decision")
    table(doc, ["Decision", "Comment", "Date"],
          [["Approved", "Focus approved as P21. Keep the scope on visibility and recourse; do not drift into "
                        "building a full laundry management platform.", "12 August 2026"]],
          widths=[1.1, 4.5, 1.2], font_size=9)
    signature_row(doc, "Team Lead — signature and date", "Mentor — signature and date")


def checkpoint_record(doc):
    h1(doc, "Checkpoint Record Card")
    para(doc, "Seven checkpoints across the semester. Each row records the date, who attended, the mentor's "
              "verdict and the one thing that had to be fixed before the next stage.", size=9.5)

    table(doc, ["CP", "Focus", "Week", "Date held", "Present", "Verdict", "Evidence gap or action required"], [
        ["CP1", "Project approval and scope framing", "3", "12 Aug 2026", "LS, AS, RP, TS", "Passed",
         "Keep the problem framed around visibility and recourse; do not name a product yet."],
        ["CP2", "Empathy research and field data", "5", "26 Aug 2026", "LS, AS, RP, TS", "Passed",
         "10 hosteller interviews, 2 staff interviews, 24 survey responses and 3 cycle logs verified. "
         "Add one warden interview before synthesis."],
        ["CP3", "Problem definition and synthesis", "6", "02 Sep 2026", "LS, AS, RP, TS", "Passed",
         "Failure-point registry approved. Rewrite the problem statement so it does not presuppose an app."],
        ["CP4", "Ideation and concept screening", "7", "09 Sep 2026", "LS, AS, RP, TS", "Passed",
         "18 ideas and the weighted matrix reviewed. Show why the rejected ideas were rejected, not only "
         "why the winner won."],
        ["CP5", "Prototype and flow architecture", "10", "30 Sep 2026", "LS, AS, RP, TS", "Passed",
         "Paper walkthrough approved. Move to a clickable prototype and test the timings setup first "
         "because it is the unfamiliar step."],
        ["CP6", "Testing and usability validation", "12", "14 Oct 2026", "LS, AS, RP, TS", "Passed",
         "Six test sessions verified. Report the one failure (finding the report-issue link) honestly and "
         "show the fix."],
        ["CP7", "Final deliverable and delivery audit", "14", "11 Nov 2026", "LS, AS, RP, TS", "Passed",
         "Working demo, test evidence and this report accepted. Keep the limitations section specific."],
    ], widths=[0.45, 1.6, 0.45, 0.95, 0.8, 0.65, 2.2], font_size=8.2)

    h2(doc, "Mentor observations across the semester")
    bullets(doc, [
        ("Week 5 — ", "The strongest evidence in this project is observational. The team can describe what "
                      "actually happens at the counter, not only what students say about it."),
        ("Week 7 — ", "The screening matrix is doing real work. The team rejected the showier ideas (QR tags, "
                      "smart lockers, stain detection) for defensible reasons."),
        ("Week 10 — ", "The custom timings step is the differentiator and also the risk: it asks the student "
                       "to know something about their block. Watch for this in testing."),
        ("Week 12 — ", "Six participants is a small sample. Treat the completion rates as directional and "
                       "say so in the limitations."),
        ("Week 14 — ", "The demo is credible and the report is honest about what is not built. Keep the "
                       "distinction between a validated prototype and a deployed service."),
    ], size=9.5)
    signature_row(doc, "Mentor — signature and date", "Team Lead — signature and date")


def table_of_contents(doc):
    h1(doc, "Table of Contents")
    para(doc, "The report is organised by the four team roles. Every member writes the parts their role owns, "
              "and each section closes with that member's contribution statement and signed declaration.",
         size=9.5)
    table(doc, ["Part", "Title", "Section", "Written by"], TOC,
          widths=[0.55, 4.0, 1.1, 1.4], font_size=8.8)


def build(doc):
    cover(doc)
    registration_sheet(doc)
    checkpoint_record(doc)
    table_of_contents(doc)
