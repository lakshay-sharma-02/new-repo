"""Section 4 — Documentation Lead: Parts 16 to 19, 21 and 22."""

from . import (h1, h2, h3, para, bullets, quote, callout, table, key_value_table,
               figure, section_banner, contribution_block, part_status_table, signature_row)

FIG = "docs/figures"


def build(doc):
    section_banner(doc, 4, "Documentation Lead", "Tarun Sharma", "12504510", "21")

    h1(doc, "Section 4 — Documentation Lead")
    para(doc, "This section states exactly what exists at the end of the semester, what it is worth, what it "
              "cannot do, and what we would build next. It closes with the sources, the AI-use statement and the "
              "appendices that hold the raw evidence.", size=9.5, italic=True)

    h3(doc, "Report parts written in this section")
    part_status_table(doc, [
        ("16", "Final Solution", "What was built, who runs it and where it stands"),
        ("17", "Impact and Value", "Who benefits, how we estimate it and how we would measure it"),
        ("18", "Limitations", "What the evidence cannot support and what we did about it"),
        ("19", "Future Scope", "The roadmap, in the order it should be built"),
        ("21", "References and AI-use Statement", "Sources and a transparent account of tool use"),
        ("22", "Appendices", "Interview record, survey data, observation logs and demo instructions"),
    ])

    h3(doc, "What this role is responsible for")
    bullets(doc, [
        "Curates the shared evidence folder and checks that every claim in the report has a record behind it.",
        "Owns the survey analysis, the impact estimates, the limitations and the roadmap.",
        "Compiles the final document, checks the cross-references and keeps the reference list honest.",
        "Like every member, also joins interviews and observation visits, gives ideas and speaks at the final "
        "presentation.",
    ], size=9.5)

    part16(doc)
    part17(doc)
    part18(doc)
    part19(doc)
    part21(doc)
    part22(doc)


# ----------------------------------------------------------------------- Part 16
def part16(doc):
    h2(doc, "Part 16. Final Solution")

    h3(doc, "What the solution is")
    para(doc, "Laundry Roulette is a web application that gives a hostel laundry batch a visible life. A student "
              "configures the collection days, windows and turnaround for their own block once. From then on every "
              "submission creates a batch with a timestamp, an item note and an estimated ready date. The batch "
              "moves through seven stages — Submitted, Received, Washing, Drying, Folding, Ready and Picked up — "
              "and every change is written to a history the student can read. If something is wrong, the student "
              "reports it against the batch, and the attendant or warden answers on the same record.",
         align="justify")
    para(doc, "Three roles see three different views of the same data. A student sees their own batches. An "
              "attendant sees the queue, the machines, the ready shelf and the open issues for their block. A "
              "warden sees every block and can read the record behind a dispute. Nothing in the product changes "
              "how clothes are washed; it changes who can see what, and when.", align="justify")

    figure(doc, f"{FIG}/fig_architecture.png",
           "Figure 16.1 — System architecture. The same routes and screens work against the in-memory demo store "
           "or MongoDB.", width=6.6)

    h3(doc, "Who runs it")
    table(doc, ["Role", "What they do in the product", "What they cannot do"], [
        ["Student", "Configure the block schedule, submit a batch, track it, confirm pickup, report an issue",
         "Advance a batch through the early stages, which belong to staff"],
        ["Laundry attendant", "Advance batches one stage at a time, view the block queue and open issues, respond "
                              "to a reported issue", "See other blocks, change a student's schedule"],
        ["Warden", "View all blocks, read batch and issue records, manage users", "Edit a student's submission"],
        ["Administrator (demo)", "Seed or remove demo data, view analytics for the demo dataset",
         "Anything in a real deployment, which is intentionally not enabled"],
    ], widths=[1.2, 3.85, 1.75], font_size=8.7)

    h3(doc, "Where the solution stands now")
    table(doc, ["Part of the solution", "Status", "Evidence"], [
        ["Per-block timings setup", "Working and tested", "Task T1: 6/6 completed, 2:15 average"],
        ["Batch submission with record and ETA", "Working and tested", "Task T2: 6/6 completed, 1:45 average"],
        ["Seven-stage tracker and history", "Working and tested", "Task T3: 6/6 completed, 1:30 average"],
        ["Ready state and in-app notification", "Working", "Visible in the demo; the notification bell is database-backed"],
        ["Issue reporting tied to a batch", "Working and tested", "Task T4: 5/6, one placement failure, fixed"],
        ["Staff console with one-tap advance", "Working", "Demonstrated in the final walkthrough; not tested with an attendant"],
        ["Warden panel and analytics", "Working in demo mode", "Screens exist; the data is seeded demo data"],
        ["Authentication and roles", "Working", "JWT login, three roles, protected routes, 17 server tests"],
        ["Mock mode with seeded data", "Working", "The delivered demo runs with no database"],
        ["MongoDB persistence", "Implemented, not piloted", "Models and indexes exist; the real database path has not run"],
        ["Push or WhatsApp delivery", "Not built", "Recorded in Part 19"],
        ["Photo evidence and item-level tracking", "Not built", "Recorded in Part 19"],
    ], widths=[2.35, 1.55, 2.9], font_size=8.5)

    callout(doc, "What this is, in one sentence",
            "A validated capstone prototype with a working end-to-end flow and a credible plan for deployment — "
            "not a production service, and this report does not claim otherwise.")

    h3(doc, "Who benefits")
    table(doc, ["Who", "How they benefit"], [
        ["Students", "They stop walking over to ask. They know the stage and the expected date, and they have a "
                     "record when an item goes missing."],
        ["Attendants", "They answer \u201cis it done?\u201d by pressing one button, and they have something to "
                       "check when a student claims an item was in the bag."],
        ["Wardens", "A complaint arrives with a batch, a time and a description instead of two memories."],
        ["Hostel administration", "The same product works in every block without a separate configuration "
                                  "project, because the schedule is a setting rather than code."],
        ["The team", "A tested example of the difference between a feature request and a researched need."],
    ], widths=[1.6, 5.2], font_size=9)


# ----------------------------------------------------------------------- Part 17
def part17(doc):
    h2(doc, "Part 17. Impact and Value")

    h3(doc, "How we estimate it")
    para(doc, "We estimate impact per student per cycle rather than multiplying by an enrolment figure we cannot "
              "verify. Every input below comes from our own data, and the arithmetic is deliberately conservative: "
              "we count only trips that the survey suggests are wasted, not every trip.", size=9.5)

    table(doc, ["Input", "Symbol", "Where it comes from", "Value"], [
        ["Students who arrive to find clothes not ready", "p", "Survey Q8 (9 \u201cmany times\u201d + 8 "
                                                               "\u201conce or twice\u201d of 24)", "0.75"],
        ["Wasted trips per affected student per cycle", "t", "Interviews H05, H07, H08 (two to three)",
         "2.0 (low end)"],
        ["Minutes per round trip to the laundry room", "m", "Observed walking route, block to laundry room",
         "8 minutes"],
        ["Cycles per student per month", "c", "Survey Q3 (11 weekly, 8 fortnightly of 24)", "2.6"],
        ["Missed pickup windows", "u", "Survey Q9 (13 of 24)", "0.54"],
        ["Disputes abandoned before resolution", "d", "Survey Q11 (8 of 24 gave up)", "0.33"],
    ], widths=[2.45, 0.55, 2.8, 1.0], font_size=8.7)

    key_value_table(doc, [
        ("Wasted trips avoided",
         "p × t = 0.75 × 2.0 = 1.5 trips per student per cycle. At 8 minutes per trip that is about 12 minutes "
         "per cycle, or roughly 30 minutes a month for a student who washes fortnightly."),
        ("Missed pickups avoided",
         "If a ready notification reaches the student, the 54% who have missed a window have a way to know. We "
         "cannot put a number on the reduction from a six-person test, so we state the baseline and the "
         "mechanism rather than a percentage."),
        ("Disputes with a record",
         "One third of respondents had given up on a dispute. A batch record does not guarantee compensation, "
         "but it converts \u201cno proof\u201d into \u201ca timestamp, a description and a response\u201d, which "
         "is what the warden asked for."),
        ("Staff time",
         "S01 and S02 each report about ten \u201cis it done?\u201d questions a day. A status screen does not "
         "eliminate them, but it removes the need for a student to walk over to ask."),
    ], widths=(1.75, 5.05), font_size=9.2)

    para(doc, "We are not extrapolating these figures to the whole campus. Twenty-four survey responses and six "
              "test participants cannot support a campus-level claim, and Part 18 says so explicitly.",
         size=9, italic=True)

    h3(doc, "How we would measure it")
    table(doc, ["Measure", "How we would collect it", "Baseline today"], [
        ["Wasted trips per student per cycle", "Two-week diary or an in-app \u201cchecked status\u201d event log",
         "Self-reported 2–3 per cycle"],
        ["Share of batches collected within the pickup window", "Batch timestamps: ready time versus pickup time",
         "Not measured today; 54% report a missed window"],
        ["Issues reported versus issues resolved", "Issue table, with status and resolution time",
         "Not measured; 33% give up before reporting"],
        ["Time from drop-off to ready", "Batch timestamps per stage", "Seven hours to four days in observation"],
        ["Attendant interruptions per shift", "Short count sheet for one week",
         "About ten questions a day (S01)"],
        ["Task success on first use", "Same four tasks as Part 14", "100%, 100%, 100%, 83% with six testers"],
    ], widths=[2.25, 2.85, 1.7], font_size=8.7)

    h3(doc, "Why this beats doing nothing")
    para(doc, "Doing nothing is not neutral. The current process already costs students about 1.5 wasted trips per "
              "cycle, one third of them have stopped reporting problems because reporting does not work, and the "
              "warden spends time on cases that cannot be settled. The cheapest version of this product is a "
              "status a student can see and a record that survives the conversation, and both of those are "
              "deliverable without new hardware.", align="justify")

    h3(doc, "Risks and unintended effects")
    table(doc, ["Risk", "What we do about it"], [
        ["Staff do not update the status, so the app shows a stale stage and trust collapses.",
         "The staff console is one tap per stage, and the product shows the last update time so a stale record is "
         "visibly stale rather than silently wrong."],
        ["A student configures the wrong schedule and then blames the app.",
         "The schedule is editable, and the submission screen shows the configured schedule before the student "
         "confirms."],
        ["A record is treated as proof of ownership when it only proves what was declared.",
         "The issue form and report describe the record as a declaration, not an inventory; item counts and "
         "photographs are future work."],
        ["The app adds another channel that nobody monitors.",
         "Issues route to the staff console of the block, and the warden view exists so an unanswered issue is "
         "visible rather than lost."],
        ["Digital records create privacy obligations that a notebook did not.",
         "We store no payment details, no health data and no contact information beyond the account email; the "
         "pilot would need a retention policy before launch."],
    ], widths=[3.2, 3.6], font_size=8.8)


# ----------------------------------------------------------------------- Part 18
def part18(doc):
    h2(doc, "Part 18. Limitations")

    table(doc, ["Limitation", "Why it matters"], [
        ["Six usability participants, all hostellers, all on a laptop",
         "The completion rates are directional. We cannot claim a general improvement in usability, and we did "
         "not test on a phone, which is where a student would actually check status."],
        ["No attendant used the staff console in a live test",
         "The staff side is the load-bearing part of the product. It was demonstrated and reviewed, but the "
         "person who has to press the button never pressed it under observation."],
        ["The demo runs on seeded data in an in-memory store",
         "The flow is real, the data is not. The MongoDB path exists in code but has not been run, so persistence "
         "is an intention rather than a verified fact."],
        ["Survey sample is 24 and self-selected",
         "It is enough to establish that the frustrations are common, not enough to generalise to the hostel "
         "population or to estimate effect sizes."],
        ["The project covers three blocks and one campus",
         "The custom-timings design assumes blocks differ. That was true here; we did not verify it elsewhere."],
        ["No notifications leave the app",
         "There is no email, SMS or WhatsApp delivery. A student who does not open the app is not reached, which "
         "is exactly the gap H08 pointed out."],
        ["No photo upload, no item-level tracking, no QR labels",
         "These are the features most directly aimed at lost and damaged items. The product records a declared "
         "batch, not the contents of a bag."],
        ["No accessibility or performance audit",
         "We did not run an accessibility check or a load test. Neither is a claim this report makes."],
        ["Payments and invoices exist in the demo only",
         "They are outside the problem statement and are not integrated with any real vendor."],
    ], widths=[2.75, 4.05], font_size=8.8)

    callout(doc, "Constraints we accepted, and why",
            "One semester, four members, no hardware budget and no authority over the laundry contract. Within "
            "those limits we chose depth over breadth: one flow that works end to end rather than four features "
            "that half work. The things we left out are in Part 19 rather than hidden.", fill="FEF3C7",
            bar="D97706", title_color=None)


# ----------------------------------------------------------------------- Part 19
def part19(doc):
    h2(doc, "Part 19. Future Scope")

    table(doc, ["What we would do next", "Why", "What it depends on"], [
        ["Pilot with one block for four weeks on a real database", "Everything else is speculation until the "
                                                                   "record is real and staff are using it daily",
         "MongoDB hosting, warden approval, one willing attendant"],
        ["Staff mobile view, tested at the counter", "The console is the weakest tested part; it must work "
                                                     "one-handed while standing", "The pilot above"],
        ["Push or WhatsApp notification on the ready stage", "54% have missed a pickup; in-app only reaches "
                                                             "students who open the app", "A messaging provider "
                                                                                          "and a template"],
        ["Optional photo at drop-off and on an issue", "Directly addresses lost and damaged items without forcing "
                                                       "a photograph of every garment", "Image storage and a "
                                                                                        "retention policy"],
        ["Item count and named high-value items", "Requested by H08; a middle ground between a batch record and "
                                                  "unworkable item-level scanning", "Staff agreement on what "
                                                                                    "they can sustain"],
        ["Warden escalation and response times", "The warden currently has no view; an unanswered issue should "
                                                 "become visible", "Role permissions and a notification channel"],
        ["QR label for the bag", "Reduces tagging errors, but needs printing, application and a scanner",
         "A vendor and a hardware budget"],
        ["Off-peak incentives and slot booking", "Addresses the peak-load failure that caused the C3 delay",
         "A pricing decision by hostel administration"],
    ], widths=[2.35, 2.9, 1.55], font_size=8.7)

    para(doc, "The order matters. A pilot on real data comes first because it would tell us whether the staff "
              "console is used at all, which determines whether notification, photos or labels are worth building "
              "next.", size=9, italic=True)


# ----------------------------------------------------------------------- Part 21
def part21(doc):
    h2(doc, "Part 21. References and AI-use Statement")

    h3(doc, "Sources")
    table(doc, ["Tag", "Source"], [
        ["[1]", "Shostack, G. L. (1984). Designing services that deliver. Harvard Business Review, 62(6), "
                "132–140."],
        ["[2]", "Nielsen, J. (1994). Usability Engineering. Academic Press. (Heuristic: visibility of system "
                "status.)"],
        ["[3]", "Norman, D. A. (2013). The Design of Everyday Things (revised ed.). Basic Books."],
        ["[4]", "Christensen, C. M., Hall, T., Dillon, K., & Duncan, D. S. (2016). Competing Against Luck: The "
                "Story of Innovation and Customer Choice. HarperBusiness."],
        ["[5]", "XPLANE. (n.d.). Empathy Map Canvas. https://xmind.app/empathy-map/"],
        ["[6]", "Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row."],
        ["[7]", "Tumbledry. (2023). Laundry service platform. https://tumbledry.com"],
        ["[8]", "UClean. (2023). Laundry service with bag tagging. https://uclean.in"],
        ["[9]", "Dhobilite. (2023). Scheduled pickup and delivery laundry. https://dhobilite.com"],
        ["[10]", "Express.js documentation (2024). Routing, middleware and error handling. https://expressjs.com"],
        ["[11]", "React documentation (2024). Components, state and effects. https://react.dev"],
    ], widths=[0.6, 6.2], font_size=8.6)

    h3(doc, "AI-use statement")
    para(doc, "We used AI tools for drafting and code scaffolding, and we are specific about where. No "
              "participant data, quotation or test result in this report was generated by a tool; every one of "
              "them comes from our own records.", size=9.5)

    table(doc, ["Tool used", "What we used it for", "What we did not use it for", "How we checked it"], [
        ["ChatGPT and Claude", "Rewriting sentences for clarity, drafting the interview guide, and suggesting "
                               "wording for the consent script",
         "Generating interview quotes, survey numbers, personas or test results",
         "Every factual claim was checked against the evidence folder before it entered the report"],
        ["GitHub Copilot", "Scaffolding React components and Express route boilerplate",
         "Deciding the product behaviour or the data model",
         "Code was read, run and tested; 17 server tests pass and the client build succeeds"],
        ["Gemini / search assistants", "Finding public sources for the literature review",
         "Producing the competitor comparison without reading the source",
         "Each source in [7]–[11] was opened and summarised by a team member"],
    ], widths=[1.15, 2.0, 1.9, 1.75], font_size=8.4)

    para(doc, "The report’s research, design decisions, prototype behaviour and conclusions are our own work. "
              "Where a tool helped us write a sentence, we edited it; where a tool was wrong, we removed it.",
         size=9.5, italic=True)


# ----------------------------------------------------------------------- Part 22
def part22(doc):
    h2(doc, "Part 22. Appendices")

    h3(doc, "Appendix index")
    table(doc, ["Appendix", "Contents", "Where it lives"], [
        ["A", "Interview record: participant codes, dates, and one full transcript excerpt", "This report, below"],
        ["B", "Survey raw counts and open-ended themes", "This report, below; full export in the evidence folder"],
        ["C", "Observation logs for three complete cycles", "This report, below; field notes in "
                                                            "docs/research/observations-log.md"],
        ["D", "Demo walkthrough: accounts, commands and the flow to demonstrate", "This report, below"],
        ["E", "Prototype source and evidence repository", "The project repository: client/, server/, docs/"],
        ["F", "Personas, journey map, failure points and idea log", "docs/design/"],
        ["G", "Test plan, feedback matrices and iteration log", "docs/prototype/"],
    ], widths=[0.7, 3.9, 2.2], font_size=8.7)

    h3(doc, "Appendix A. Interview record")
    para(doc, "Full interview records are stored by code in the shared evidence folder. Below is one excerpt, "
              "included to show the level of detail and the way the notes were kept.", size=9.5)
    key_value_table(doc, [
        ("Participant code", "H04"),
        ("Group", "Hosteller, A2 block, fourth year, fortnightly"),
        ("Date and mode", "Week 3, in person, English"),
        ("Consent", "Interview, notes and anonymised quotation all agreed"),
    ], widths=(1.9, 4.9), font_size=9)
    table(doc, ["Question", "Exact words", "Observer's note"], [
        ["Tell me about the last time you sent laundry.",
         "\u201cI dropped it Monday, and I needed a shirt for Thursday. I went Wednesday, not ready. Thursday "
         "morning, not ready. Thursday evening I got it, and one shirt was missing.\u201d",
         "Describes the trip pattern before being asked about trips."],
        ["How did you find out it was ready?",
         "\u201cI didn't. I just kept going. You can't call anyone, there's no number.\u201d",
         "Frames the absence as a missing channel, not a slow service."],
        ["What happened about the missing shirt?",
         "\u201cI told the bhaiya. He said check the shelf. It wasn't there. I told the warden, he said talk to "
         "the laundry. So I left it.\u201d", "The loop described by H09 appears in this account too."],
        ["What would have helped?",
         "\u201cA message. Even a paper on the door with my name would be better than walking there.\u201d",
         "Low-tech alternatives are acceptable to this participant."],
    ], widths=[1.55, 3.55, 1.7], font_size=8.5)

    h3(doc, "Appendix B. Survey raw counts")
    table(doc, ["Question", "Counts"], [
        ["Q1 Block", "B6 8 · C3 6 · A2 5 · D1 3 · other 2"],
        ["Q2 Year", "1st 4 · 2nd 9 · 3rd 7 · 4th 3 · PG 1"],
        ["Q3 Frequency", "Weekly 11 · fortnightly 8 · monthly 3 · rarely 2"],
        ["Q4 Satisfaction", "★1: 4 · ★2: 9 · ★3: 8 · ★4: 2 · ★5: 1 (mean 2.3)"],
        ["Q6 Predictability", "★1: 8 · ★2: 9 · ★3: 4 · ★4: 2 · ★5: 1 (mean 1.9)"],
        ["Q8 Arrived and not ready", "Many times 9 · once or twice 8 · no 4 · no way to know 3"],
        ["Q9 Missed pickup", "Yes 13 · no 8 · not sure 3"],
        ["Q10 Experienced", "Late 16 · mixed-up 11 · damaged 8 · wrong items 7 · lost 6 · none 2"],
        ["Q11 Resolution", "Talked to staff 10 · warden 3 · gave up 8 · other 3"],
        ["Q12 Would use a tracker", "Yes 19 · maybe 4 · no 1"],
        ["Q13 Top notification", "Ready 14 · delayed 5 · started washing 2 · window opens 2 · other 1"],
        ["Q14 Top feature", "Real-time tracking 18 · ETA 15 · ready alert 14 · easy complaint 12 · custom "
                            "schedule 9 · photo proof 6 · schedule feed 4"],
        ["Q16 Channel", "App 10 · WhatsApp 8 · SMS 2 · no updates 4"],
    ], widths=[1.9, 4.9], font_size=8.6)

    h3(doc, "Appendix C. Observation logs")
    table(doc, ["Cycle", "Block and day", "Timeline", "Failures recorded"], [
        ["1", "B6, Wednesday, clear",
         "9:15 drop-off (8 students) · 9:45 sorting · 10:30 washing · 12:15 drying · 15:00 folding next day · "
         "16:30 ready · 17:15 pickup",
         "Three students arrived before ready; two bags with the same initials; one shirt folded into the wrong "
         "bag; one wrong bag taken and returned"],
        ["2", "C3, Friday, overcast then rain",
         "10:20 drop-off (12 students) · 11:00 sorting · 12:00 washing with a 30-minute breakdown · 14:30 drying "
         "next day · rain at 16:00 · 17:00 damp folding · 18:00 ready · 18:15 pickup",
         "Machine breakdown; damp clothes; bag lost for 15 minutes; missing t-shirt with no resolution; two "
         "non-washable items left unlabelled"],
        ["3", "A2, Monday, clear",
         "8:30 drop-off (6 students, notebook log) · 9:15 sorting · 10:00 washing · 12:00 drying · 14:00 folding "
         "· 15:30 ready · 15:45 pickup · 16:15 stain complaint",
         "Blue stain on a white shirt, dismissed; two students could not collect and had no way to be told; "
         "notebook entry illegible"],
    ], widths=[0.5, 1.35, 2.6, 2.35], font_size=8.3)

    h3(doc, "Appendix D. Demo walkthrough")
    para(doc, "The delivered demo runs without a database. From the repository root:", size=9.5)
    table(doc, ["Step", "Command or action"], [
        ["1. Start the API", "cd server && npm install && npm run dev  (port 5000, mock mode)"],
        ["2. Start the client", "cd client && npm install && npm run dev  (port 5173)"],
        ["3. Log in as a student", "aarav@hostel.edu / demo123"],
        ["4. Watch the stages", "The Demo Simulator advances the seeded batches; the dashboard polls for changes"],
        ["5. Track one batch", "Open a batch to see the seven-stage tracker and the history"],
        ["6. Log in as staff", "ramesh@hostel.edu / demo123 — advance a batch from the console"],
        ["7. Log in as warden", "meera@hostel.edu / demo123 — view all blocks and analytics"],
        ["8. Report an issue", "priya@hostel.edu / demo123 — her folding batch already carries a reported issue"],
    ], widths=[1.7, 5.1], font_size=8.7)
    para(doc, "Server tests: cd server && npm test (17 tests). Client build: cd client && npm run build.",
         size=9, italic=True)

    contribution_block(
        doc,
        name="Tarun Sharma",
        reg="12504510",
        roll="21",
        role="Documentation Lead",
        contributions=[
            "Maintained the shared evidence folder and checked every figure in this report against its record.",
            "Analysed the 24 survey responses and wrote the impact estimates in Part 17, including the decision "
            "not to extrapolate them to the whole campus.",
            "Wrote the limitations, roadmap, references and appendices.",
            "Compiled and proofread the final document, and kept the report's claims aligned with what was "
            "actually tested.",
            "Presented the limitations and future scope at the final review.",
        ],
        team_statement="The hardest part of this section was writing down what we did not prove. A report that "
                       "claims less than it did is easier to defend than one that claims more.",
    )

    h2(doc, "Final team declaration")
    para(doc, "We confirm that this report describes work carried out by the four members named on the cover, that "
              "the research evidence comes from real participants who consented, and that the prototype described "
              "in Section 3 is the version that was tested and demonstrated.", size=9.5)
    signature_row(doc, "Lakshay Sharma — Team Lead", "Ashutosh — Research & Design Lead")
    signature_row(doc, "Raj Patel — Prototype Lead", "Tarun Sharma — Documentation Lead")
