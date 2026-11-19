"""Section 3 — Prototype Lead: Parts 11 to 15."""

from . import (h1, h2, h3, para, bullets, quote, callout, table, key_value_table,
               figure, section_banner, contribution_block, part_status_table)

FIG = "docs/figures"


def build(doc):
    section_banner(doc, 3, "Prototype Lead", "Raj Patel", "12510295", "44")

    h1(doc, "Section 3 — Prototype Lead")
    para(doc, "This section records how we generated and screened ideas, what we built, how we tested it, and "
              "what we changed as a result. The prototype is a working web application, not a clickable mock-up, "
              "because the status flow had to be tested with a real backend behind it.", size=9.5, italic=True)

    h3(doc, "Report parts written in this section")
    part_status_table(doc, [
        ("11", "Ideation", "Methods, session records, the full idea log and idea groups"),
        ("12", "Choosing the Idea", "Criteria fixed before scoring, the matrix and the rejected concepts"),
        ("13", "Prototype", "Versions, screens, flow, storyboard and the MVP"),
        ("14", "Testing", "Plan, tasks, measures, observer log, feedback matrices and issue list"),
        ("15", "What We Changed", "Six changes, their evidence, and the re-test"),
    ])

    h3(doc, "What this role is responsible for")
    bullets(doc, [
        "Runs the ideation sessions and keeps the screening criteria fixed before any idea is scored.",
        "Owns the wireframes, the working prototype and the technical decisions behind it.",
        "Recruits and runs the usability sessions, keeps the observer notes and decides which fixes to make.",
        "Like every member, also joins interviews and observation visits, gives ideas and speaks at the final "
        "presentation.",
    ], size=9.5)

    part11(doc)
    part12(doc)
    part13(doc)
    part14(doc)
    part15(doc)


# ----------------------------------------------------------------------- Part 11
def part11(doc):
    h2(doc, "Part 11. Ideation")

    h3(doc, "Methods we used")
    table(doc, ["Method", "How we ran it", "Ideas produced"], [
        ["Brainstorm", "One rule: no criticism while generating. Every member wrote silently for eight minutes, "
                       "then we read the list aloud and merged duplicates.", "9"],
        ["Crazy 8s", "Eight sketches in eight minutes, one per sheet, each answering a different failure point "
                     "from the failure registry in Part 9.", "6"],
        ["SCAMPER", "We took the existing process and asked what could be substituted, combined, adapted, "
                    "modified, eliminated or reversed. \u201cEliminate the counter conversation\u201d produced "
                    "the structured issue form.", "3"],
    ], widths=[1.15, 4.55, 1.1], font_size=8.6)

    table(doc, ["Session", "Date", "Method", "Members present"], [
        ["Ideation 1", "09 September 2026 (Week 7)", "Brainstorm and affinity grouping", "LS, AS, RP, TS"],
        ["Ideation 2", "10 September 2026 (Week 7)", "Crazy 8s on three failure points", "LS, RP, TS"],
        ["Screening", "11 September 2026 (Week 7)", "SCAMPER and weighted matrix", "LS, AS, RP, TS"],
    ], widths=[1.1, 2.0, 2.4, 1.3], font_size=8.8)

    h3(doc, "Idea log")
    para(doc, "Eighteen ideas survived the first pass. They are listed once, with the method that produced them "
              "and the theme we grouped them under. Initials show who raised the idea.", size=9.5)
    ideas = [
        ("I01", "Batch status tracker with food-delivery stages", "Brainstorm", "Visibility", "AS"),
        ("I02", "Student-configurable block timings", "Brainstorm", "Visibility", "LS"),
        ("I03", "Notification when the batch is ready", "Brainstorm", "Visibility", "RP"),
        ("I04", "Digital submission receipt at drop-off", "Brainstorm", "Accountability", "TS"),
        ("I05", "QR code on the bag", "Crazy 8s", "Accountability", "RP"),
        ("I06", "Photo evidence at drop-off", "Crazy 8s", "Accountability", "AS"),
        ("I07", "Structured complaint form linked to a batch", "SCAMPER", "Recourse", "LS"),
        ("I08", "ETA countdown based on configured turnaround", "Brainstorm", "Visibility", "TS"),
        ("I09", "Staff dashboard with one-tap status updates", "Brainstorm", "Operations", "RP"),
        ("I10", "Peak-load alert on a busy day", "Brainstorm", "Visibility", "AS"),
        ("I11", "Off-peak discount for students", "SCAMPER", "Operations", "TS"),
        ("I12", "Slot booking for drop-off", "Crazy 8s", "Operations", "LS"),
        ("I13", "Warden dashboard for escalation", "Brainstorm", "Recourse", "TS"),
        ("I14", "WhatsApp status messages", "SCAMPER", "Visibility", "RP"),
        ("I15", "Published schedule feed for all blocks", "Brainstorm", "Visibility", "AS"),
        ("I16", "Item-level tracking of each garment", "Crazy 8s", "Accountability", "LS"),
        ("I17", "Smart lockers instead of a counter", "Crazy 8s", "Operations", "RP"),
        ("I18", "Camera-based stain detection", "Crazy 8s", "Accountability", "AS"),
    ]
    for start in (0, 6, 12):
        table(doc, ["ID", "Idea", "Method", "Theme", "By"],
              [list(row) for row in ideas[start:start + 6]],
              widths=[0.5, 3.5, 0.9, 1.2, 0.5], font_size=8.6)

    h3(doc, "Idea groups")
    table(doc, ["Theme", "What unites the ideas", "Idea IDs", "Count"], [
        ["Visibility", "The student can see what is happening without walking to the room",
         "I01, I02, I03, I08, I10, I14, I15", "7"],
        ["Accountability", "A record exists that can settle a dispute", "I04, I05, I06, I16, I18", "5"],
        ["Recourse", "There is a path to report and resolve a problem", "I07, I13", "2"],
        ["Operations", "The service runs differently, usually with hardware or policy", "I09, I11, I12, I17", "4"],
    ], widths=[1.1, 3.6, 1.55, 0.55], font_size=8.6)

    para(doc, "The mind map we drew on the whiteboard had one centre — \u201cthe student cannot see the batch\u201d "
              "— and four branches, one per theme above. Two branches (visibility and accountability) held "
              "twelve of the eighteen ideas, which was an early sign that the project should stay close to them.",
         align="justify", size=9.5)


# ----------------------------------------------------------------------- Part 12
def part12(doc):
    h2(doc, "Part 12. Choosing the Idea")

    h3(doc, "Criteria and weights, set before any scoring")
    para(doc, "We fixed the criteria and weights in a team meeting before we scored anything, and we did not "
              "change them afterwards. The weights encode a deliberate choice: impact matters most, and novelty "
              "matters least.", size=9.5)
    table(doc, ["ID", "Criterion", "What it means for this project", "Weight"], [
        ["C1", "Impact", "How much of the registered failure actually goes away", "×5"],
        ["C2", "Feasibility", "Can we build and test it this semester with the tools we have", "×4"],
        ["C3", "User desire", "Did students and staff ask for it in their own words", "×3"],
        ["C4", "Novelty", "Is it meaningfully different from what already exists", "×2"],
        ["C5", "Scope", "Can a small team maintain it, and does it fit one product", "×3"],
    ], widths=[0.5, 1.1, 4.3, 0.9], font_size=8.8)

    h3(doc, "Screening matrix")
    para(doc, "Each idea was scored 1–5 per criterion; the maximum possible score is 85. The matrix below is the "
              "one we used, including the ideas that lost.", size=9.5)
    scores = [
        ("I01", "Batch status tracker", 5, 5, 5, 3, 5, 81),
        ("I02", "Custom block timings", 4, 5, 4, 4, 5, 75),
        ("I03", "Ready notification", 5, 4, 5, 2, 4, 72),
        ("I04", "Digital submission receipt", 4, 5, 4, 3, 5, 73),
        ("I07", "Structured complaint form", 4, 5, 4, 3, 5, 73),
        ("I08", "ETA countdown", 4, 5, 4, 3, 5, 73),
        ("I09", "Staff status console", 4, 3, 4, 3, 2, 56),
        ("I10", "Peak-load alert", 3, 4, 3, 3, 4, 58),
        ("I06", "Photo evidence at drop-off", 3, 4, 3, 3, 4, 58),
        ("I05", "QR code on the bag", 3, 3, 3, 3, 2, 48),
        ("I13", "Warden dashboard", 3, 3, 3, 3, 2, 48),
        ("I14", "WhatsApp status messages", 4, 3, 4, 2, 2, 54),
        ("I12", "Slot booking", 3, 3, 3, 3, 2, 48),
        ("I15", "Published schedule feed", 2, 4, 2, 2, 4, 48),
        ("I11", "Off-peak discount", 2, 3, 2, 3, 2, 40),
        ("I16", "Item-level tracking", 4, 1, 3, 4, 1, 44),
        ("I17", "Smart lockers", 5, 1, 3, 5, 1, 51),
        ("I18", "Stain detection camera", 3, 1, 2, 5, 1, 38),
    ]
    table(doc, ["ID", "Concept", "C1", "C2", "C3", "C4", "C5", "Score"], [
        [i, name, str(a), str(b), str(c), str(d), str(e), str(f)]
        for i, name, a, b, c, d, e, f in scores
    ], widths=[0.45, 3.0, 0.45, 0.45, 0.45, 0.45, 0.45, 0.75], font_size=8.4)

    h3(doc, "The idea we chose, and why")
    callout(doc, "Chosen concept",
            "Laundry Roulette — combine I01 (status tracker, 81/85), I02 (custom timings, 75/85), I03 (ready "
            "notification, 72/85), I04 (submission receipt, 73/85), I07 (structured complaint form, 73/85) and "
            "I08 (ETA countdown, 73/85) into one product.",
            fill="F0FDF4", bar="16A34A")
    para(doc, "The six selected ideas were not six separate features. They describe one cycle: configure the "
              "schedule, submit and receive a record, watch the stages, get told when it is ready, and have "
              "somewhere to complain that keeps the record attached. No single component covers the whole "
              "journey, which is why we built the combination rather than the highest-scoring idea alone.",
         align="justify")

    h3(doc, "Why the other concepts were not built")
    table(doc, ["Concept", "Reason it was not built", "Where it went"], [
        ["I17 Smart lockers", "Requires hardware, a capital budget and admin approval; the semester could not "
                              "deliver even one locker.", "Part 19, long term"],
        ["I18 Stain detection camera", "Novelty was high but feasibility was 1/5; we could not build or test a "
                                       "reliable detector in the time available.", "Part 19, out of scope"],
        ["I16 Item-level tracking", "Attendants told us it would create a queue; the prototype follows the batch, "
                                    "which is what staff can sustain.", "Part 19, next version"],
        ["I05 QR code on the bag", "The value is real but the cost is physical: printing, applying and replacing "
                                   "tags, and a scanner at the counter.", "Part 19, with a vendor"],
        ["I14 WhatsApp messages", "Needs a business account and a template approval process; the in-app version "
                                  "tests the same behaviour.", "Part 19, first extension"],
        ["I11 Off-peak discount", "Changes pricing policy, which the hostel administration controls, not us.",
         "not pursued"],
    ], widths=[1.4, 3.5, 1.9], font_size=8.5)


# ----------------------------------------------------------------------- Part 13
def part13(doc):
    h2(doc, "Part 13. Prototype")

    h3(doc, "How it developed")
    table(doc, ["Version", "What it is", "When", "Status"], [
        ["V0", "Paper walkthrough: six screens drawn on A4, one student at a time, moderator turns the pages",
         "Week 9", "Completed and discarded after three sessions"],
        ["V1", "Clickable React prototype: timings setup, submission, tracking and issue reporting, mock data",
         "Week 10", "Tested in Week 12"],
        ["V1.1", "Staff console, notification bell, issue resolution by staff, warden panel", "Week 11",
         "Added after the paper sessions showed the staff side was missing"],
        ["V1.2", "Six fixes from usability testing, including the report-issue button", "Week 13", "Final tested build"],
        ["V1.3", "Demo mode with an in-memory store and a simulator that advances batches for a live demo",
         "Week 13", "Delivered with this report"],
    ], widths=[0.7, 4.0, 0.8, 1.5], font_size=8.6)

    h3(doc, "The six screens")
    table(doc, ["#", "Screen", "What it does", "User need it serves"], [
        ["1", "Timings setup", "The student picks the block, its collection days, the drop-off and pickup windows "
                               "and the expected turnaround in days.", "Every block is different and no schedule "
                                                                    "is published"],
        ["2", "Submit laundry", "Size selector, optional item note, the configured schedule shown for context, "
                                "and an automatic ready date.", "A submission record and an expectation at "
                                                               "drop-off"],
        ["3", "Dashboard", "Counts of batches in progress, ready and completed; the next collection window; the "
                           "active batches with compact status bars.", "An answer in one glance, without a walk"],
        ["4", "Track status", "Seven-stage animated tracker, timestamped history, and a single action when the "
                              "batch is ready.", "Visibility during the wait"],
        ["5", "Report issue", "Issue type chips, a description, and the batch attached automatically; the staff "
                              "response appears on the same page.", "Recourse with evidence"],
        ["6", "Staff console", "Queue, machines, ready shelf and open issues for the attendant's block, with a "
                               "one-tap stage advance.", "A way to broadcast status without leaving the counter"],
    ], widths=[0.35, 1.3, 3.5, 1.65], font_size=8.5)

    h3(doc, "User flow")
    figure(doc, f"{FIG}/fig_user_flow.png",
           "Figure 13.1 — User flow through the prototype, including the seven-stage pipeline.", width=6.5)

    h3(doc, "Storyboard")
    table(doc, ["Frame", "Scene", "What the student does", "What the system shows"], [
        ["1", "Monday, 8:50 AM, corridor", "Opens the app to check the next collection window",
         "\u201cB6 · Mon, Wed, Fri · Drop-off 9 AM–12 PM\u201d"],
        ["2", "At the counter, 9:15 AM", "Submits a medium batch with a note about a white shirt",
         "Batch number, submitted time and an estimated ready date"],
        ["3", "Tuesday, between classes", "Checks the tracker instead of walking to the block",
         "Washing stage highlighted, history shows Received at 10:40 AM"],
        ["4", "Wednesday, 4:00 PM", "Opens the app and sees a ready state and a notification",
         "\u201cReady for pickup\u201d and a pickup window"],
        ["5", "At the shelf, 4:20 PM", "Collects the bag and confirms pickup in the app",
         "Final stage completes and the batch moves to completed"],
        ["6", "Thursday, 11:00 AM", "Finds a blue stain and reports an issue on the batch",
         "Structured form, batch reference attached, staff response visible on the same page"],
    ], widths=[0.5, 1.55, 2.4, 2.35], font_size=8.5)

    h3(doc, "How each feature links to a user need")
    table(doc, ["Feature", "User need it serves", "Evidence it was needed", "Screen"], [
        ["Per-block timings", "Know when your block collects without asking someone", "H03, H08; three different "
                                                                                  "observed schedules", "1"],
        ["Submission record", "Have proof of what was handed over", "H04, H09, H10; S01", "2"],
        ["Seven-stage tracker", "Know where the batch is right now", "10/10 interviews; Q8", "4"],
        ["Ready notification", "Stop missing the pickup window", "Q9 (54%), Q13 (58%)", "3, 4"],
        ["ETA from configured turnaround", "Plan around the batch instead of guessing", "Q6, H01, H13", "2, 3"],
        ["Structured issue form", "Report a problem without a confrontation", "H09, W01, cycle 3", "5"],
        ["Staff one-tap advance", "Answer ten questions a day without leaving the machines", "S01, S02", "6"],
        ["Warden view", "Settle a dispute using a record rather than memory", "W01", "6 (admin panel)"],
    ], widths=[1.45, 2.0, 2.25, 0.9], font_size=8.5)

    h3(doc, "MVP: what it is and what it tests")
    key_value_table(doc, [
        ("What the MVP is",
         "A working web application: React 19 with Vite and Tailwind CSS on the client, Express 4 with JWT "
         "authentication on the server, and a switchable data layer that runs against an in-memory store in demo "
         "mode or MongoDB in pilot mode."),
        ("What it tests",
         "Whether a student can configure their block, submit a batch and understand its status without help, and "
         "whether a student can report an issue on a batch and be understood."),
        ("What it deliberately leaves out",
         "QR labels and smart lockers, photo upload, WhatsApp or SMS delivery, payments to the vendor, and any "
         "integration with the hostel's existing systems."),
        ("How it is demonstrated",
         "Demo mode seeds five accounts and several batches, and a floating simulator advances batches so a live "
         "audience can watch the stages change without a staff member typing anything."),
    ], widths=(1.8, 5.0), font_size=9.2)


# ----------------------------------------------------------------------- Part 14
def part14(doc):
    h2(doc, "Part 14. Testing")

    h3(doc, "Test plan")
    key_value_table(doc, [
        ("Goal", "Find out whether a hosteller who has never seen the app can set up their block's schedule, submit "
                 "a batch, track it and report an issue without help."),
        ("Participants", "Six hostellers: H01 (B6, 2nd year), H03 (B6, 1st year), H06 (C3, 3rd year), H07 (B6, "
                         "1st year), H08 (A2, 3rd year) and H10 (C3, 2nd year)."),
        ("Method", "Think-aloud, one participant at a time, 20–25 minutes, on a laptop with the working demo. "
                   "Screen recording plus written observer notes; the moderator did not help unless the participant "
                   "was stuck for more than two minutes."),
        ("Success measure", "Completion without help, time on task, and the participant's own rating of ease and "
                            "trust (1–5)."),
        ("What we did not test", "Mobile devices, the real MongoDB path, and staff use on a phone at the counter."),
    ], widths=(1.8, 5.0), font_size=9.2)

    h3(doc, "Tasks")
    table(doc, ["Task", "What we said to the participant", "What counted as success"], [
        ["T1 Set up timings", "\u201cSet the app up for your block: the days it collects and how long it usually "
                              "takes.\u201d", "Block, days, windows and turnaround saved without help"],
        ["T2 Submit a batch", "\u201cSend a medium load with about six shirts and a pair of jeans.\u201d",
         "Batch submitted and a ready date visible"],
        ["T3 Track the batch", "\u201cFind out where your laundry is right now.\u201d",
         "Correct stage identified and the history read aloud"],
        ["T4 Report an issue", "\u201cOne of your shirts came back stained. Report it.\u201d",
         "Issue submitted against the right batch"],
    ], widths=[1.3, 3.15, 2.35], font_size=8.7)

    h3(doc, "Measures and results")
    table(doc, ["Measure", "Target", "Result"], [
        ["T1 completion without help", "≥ 80%", "6/6 (100%)"],
        ["T2 completion without help", "≥ 80%", "6/6 (100%)"],
        ["T3 completion without help", "≥ 80%", "6/6 (100%)"],
        ["T4 completion without help", "≥ 60%", "5/6 (83%) — H07 needed help to find the link"],
        ["Average time, T1 to T4", "under 3 minutes each", "2:15, 1:45, 1:30, 2:00"],
        ["Ease of use (1–5)", "≥ 3.5", "4.3"],
        ["Trust compared with the current process (1–5)", "≥ 3.5", "4.5"],
        ["Would use it", "≥ 70%", "5/6 (83%), one \u201cmaybe\u201d"],
    ], widths=[3.4, 1.4, 2.0], font_size=8.8)

    h3(doc, "Observer log")
    para(doc, "Times are the observer's stopwatch readings for the session, rounded to the nearest five seconds. "
              "The notes column records where the participant hesitated, which is the part we used to choose "
              "fixes.", size=9.5)
    table(doc, ["No.", "User", "Tasks completed", "Time", "Where they hesitated", "Help given"], [
        ["U1", "H01, B6 2nd yr", "T1–T4", "8:20", "None; read the tracker as \u201clike Swiggy\u201d",
         "None"],
        ["U2", "H03, B6 1st yr", "T1–T4", "9:05", "Paused on the timings page, then used the day toggles "
                                                    "confidently", "None"],
        ["U3", "H06, C3 3rd yr", "T1–T4", "7:40", "Looked for a countdown on the dashboard that did not exist",
         "None"],
        ["U4", "H07, B6 1st yr", "T1–T3, T4 with help", "11:10",
         "Searched the navbar for \u201creport issue\u201d for about three minutes", "Pointed to the link"],
        ["U5", "H08, A2 3rd yr", "T1–T4", "8:55", "Wanted an item-count field on the submit form", "None"],
        ["U6", "H10, C3 2nd yr", "T1–T4", "8:15", "Read the full status history before answering T3", "None"],
    ], widths=[0.4, 1.45, 1.2, 0.55, 2.45, 0.85], font_size=8.4)

    h3(doc, "Feedback capture matrices")
    table(doc, ["Session", "What worked", "What did not", "Idea raised"], [
        ["U1 H01", "Understood the tracker immediately; liked the timeline",
         "Nothing blocking", "Add WhatsApp notifications"],
        ["U2 H03", "Day toggles and the turnaround slider were obvious", "None",
         "Show the next collection day on the dashboard"],
        ["U3 H06", "Schedule shown on the submit screen gave context", "\u201cLoading…\u201d felt unfinished",
         "Add an ETA countdown"],
        ["U4 H07", "The status page itself was clear", "Could not find the report-issue link",
         "Move the issue action somewhere visible"],
        ["U5 H08", "Fast to submit; liked the size selector", "No way to say how many items",
         "Add an optional item count"],
        ["U6 H10", "The history timeline made the batch feel documented", "Wanted staff names in the history",
         "Show who advanced each stage"],
    ], widths=[0.8, 2.4, 2.0, 1.6], font_size=8.4)

    table(doc, ["Category", "What worked", "What did not work", "Idea we kept"], [
        ["Navigation", "Clean navbar; pages easy to find", "H07 looked in the menu for the issue action",
         "Make the issue action a button on the batch page"],
        ["Timings", "Day toggles, time inputs, turnaround slider", "No visibility of the next collection",
         "Collection countdown on the dashboard"],
        ["Submission", "Schedule context and size icons", "No item count field", "Optional item count"],
        ["Tracking", "Progress bar and history timeline", "History lacked staff detail", "Add actor to history"],
        ["Disputes", "Structured form with issue types", "Link placement", "Prominent action, tested again"],
        ["Trust", "Trust rated 4.5/5", "\u201cDepends on staff actually updating it\u201d",
         "Keep the staff console one tap per stage"],
    ], widths=[0.9, 2.2, 2.0, 1.7], font_size=8.4)

    h3(doc, "Issue list")
    table(doc, ["ID", "Issue", "Seen in", "Severity", "Fix decided", "Status"], [
        ["IS-01", "Report-issue link not found", "U4 (H07)", "High",
         "Replace the text link with a visible action on the batch page", "Fixed"],
        ["IS-02", "Plain \u201cLoading…\u201d text feels unfinished", "U3, U6", "Low",
         "Skeleton placeholders that match the layout", "Fixed"],
        ["IS-03", "No confirmation after save or submit", "U1, U2, U5", "Medium",
         "Toast notification after every action", "Fixed"],
        ["IS-04", "Testers did not know the demo credentials", "U1, U2", "Low",
         "Show the demo account on the login page", "Fixed"],
        ["IS-05", "Mobile navigation was basic", "Moderator review", "Low",
         "Animated hamburger menu with active states", "Fixed"],
        ["IS-06", "Dashboard felt empty", "U1, U6", "Low",
         "Stats cards for in progress, ready and completed", "Fixed"],
        ["IS-07", "No item count field", "U5 (H08)", "Low", "Deferred to v2", "Open"],
        ["IS-08", "History does not say who advanced a stage", "U6 (H10)", "Low", "Deferred to v2", "Open"],
    ], widths=[0.55, 2.15, 0.85, 0.6, 1.9, 0.75], font_size=8.4)


# ----------------------------------------------------------------------- Part 15
def part15(doc):
    h2(doc, "Part 15. What We Changed")

    table(doc, ["#", "Change", "Feedback that caused it", "Issue", "Before", "After"], [
        ["1", "Report-issue action made prominent", "H07 could not find the text link and searched the navbar",
         "IS-01", "Small text link at the bottom", "Card with icon and a clear button under the history"],
        ["2", "Skeleton loading states", "\u201cLoading…\u201d was described as feeling basic", "IS-02",
         "Plain text placeholder", "Shimmer blocks matching the final layout"],
        ["3", "Toast notifications", "Participants were unsure whether a save had worked", "IS-03",
         "Silent redirect after an action", "Green success toast, red error toast"],
        ["4", "Demo credentials on the login page", "Testers did not know what to type", "IS-04",
         "No hint", "Demo account card below the form"],
        ["5", "Animated mobile menu", "Moderator review of the mobile layout", "IS-05",
         "Basic stacked links", "Hamburger that becomes a cross, slide-down panel"],
        ["6", "Dashboard statistics", "Dashboard felt empty without data context", "IS-06",
         "Only the batch list", "In progress, ready and completed counters above the list"],
    ], widths=[0.3, 1.35, 1.5, 0.55, 1.55, 1.65], font_size=8.3)

    h3(doc, "Re-test of the fixed version")
    para(doc, "We did not run a second full round of usability testing. The changed report-issue screen was checked "
              "in a short session with two hostellers who had taken part in Week 12 (H03 and H10). Both located the "
              "new action without help and both said it was where they had expected it. We report this as a check "
              "of one screen, not as validation of the whole build.", align="justify", size=9.5)
    table(doc, ["Check", "Before the change", "After the change"], [
        ["H07's original failure (find the issue action)", "3 minutes of searching, then help",
         "H03 and H10 found it unaided within a few seconds"],
        ["Perceived polish", "\u201cLoading…\u201d and no feedback after actions",
         "Skeletons and toasts; no \u201cdid it work?\u201d questions in the check"],
        ["First-time entry", "Testers asked for credentials", "Demo account visible on the login page"],
    ], widths=[2.4, 2.2, 2.2], font_size=8.7)

    callout(doc, "What the testing actually proved",
            "The core flow is learnable without a manual, and the status screen is understood by first-time users "
            "because they already know the pattern from food delivery. The failure was a placement mistake, and "
            "the fix was a placement fix. Six participants is a small sample; the completion rates are "
            "directional, not statistically meaningful.")

    contribution_block(
        doc,
        name="Raj Patel",
        reg="12510295",
        roll="44",
        role="Prototype Lead",
        contributions=[
            "Ran the two ideation sessions and recorded all eighteen ideas in the log.",
            "Built the paper prototype, the React client, the Express API and the demo simulator.",
            "Recruited and ran all six usability sessions, and wrote the observer notes and issue list.",
            "Made the six changes in Part 15 and checked the fixed report-issue screen.",
            "Presented the live demo at the final review.",
        ],
        team_statement="The idea that survived screening was the least exciting one on the board. Building it "
                       "properly taught us more than building three clever things badly would have.",
    )
