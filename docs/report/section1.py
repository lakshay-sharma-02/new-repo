"""Section 1 — Team Lead: Parts 2, 3, 4, 5 and 20."""

from . import (h1, h2, h3, para, bullets, quote, callout, table, key_value_table,
               figure, section_banner, contribution_block, part_status_table, SLATE)

FIG = "docs/figures"


def build(doc):
    section_banner(doc, 1, "Team Lead", "Lakshay Sharma", "12508708", "46")

    h1(doc, "Section 1 — Team Lead")
    para(doc, "This section covers how the team was organised, what the project found, who it affects and how "
              "the semester ended. It is written by the Team Lead and closes with the team's final "
              "contribution and declaration.", size=9.5, italic=True)

    h3(doc, "Report parts written in this section")
    part_status_table(doc, [
        ("2", "Team Details", "Organisation, working agreement and plan"),
        ("3", "Summary", "One-page overview of problem, solution and evidence"),
        ("4", "Background", "The situation we found, scope and starting assumptions"),
        ("5", "Stakeholders", "Who suffers, who decides and who does the work"),
        ("20", "Conclusion", "Going-back log, the story of the journey and final reflection"),
    ])

    h3(doc, "What this role is responsible for")
    bullets(doc, [
        "Keeps the calendar: CP1 to CP7 submissions, weekly meetings and the hand-in for each stage.",
        "Talks to the mentor, Akash Bhattacharjee, and raises blockers early rather than at the deadline.",
        "Owns problem framing, the stakeholder map and the conclusion, including the going-back log.",
        "Because the team has four members, documentation is owned by the Documentation Lead (Section 4).",
        "Like every member, also joins interviews and observation visits, gives ideas, watches a test session "
        "and speaks at the final presentation.",
    ], size=9.5)

    part2(doc)
    part3(doc)
    part4(doc)
    part5(doc)
    part20(doc)


# ------------------------------------------------------------------------ Part 2
def part2(doc):
    h2(doc, "Part 2. Team Details")

    h3(doc, "Who holds which role")
    table(doc, ["#", "Name", "Reg. no.", "Roll", "Role", "What the role covers"], [
        ["1", "Lakshay Sharma", "12508708", "46", "Team Lead",
         "Calendar and checkpoints, mentor communication, problem framing, stakeholder mapping, conclusion."],
        ["2", "Ashutosh", "12509515", "43", "Research & Design Lead",
         "Interview guide and consent, field observation, survey, personas, journey map, POV and HMW."],
        ["3", "Raj Patel", "12510295", "44", "Prototype Lead",
         "Ideation sessions, screening matrix, prototyping, usability testing, iterations."],
        ["4", "Tarun Sharma", "12504510", "21", "Documentation Lead",
         "Evidence repository, survey analysis, impact estimates, limitations, roadmap and final compilation."],
    ], widths=[0.35, 1.45, 0.85, 0.5, 1.35, 2.5], font_size=8.5)

    h3(doc, "How we agreed to work")
    bullets(doc, [
        ("One meeting a week. ", "Forty-five minutes, Tuesday evening, in the library discussion room. Every "
                                 "meeting ends with a named owner and a date for each open action."),
        ("Same-day evidence. ", "Interview notes, consent records, photographs and survey exports go into one "
                                "shared folder on the day they are collected. The Documentation Lead checks the "
                                "folder on Friday and chases anything missing."),
        ("Codes only. ", "Participants appear in every file as H01–H10, S01–S02 or W01. No names, room numbers, "
                         "registration numbers or phone numbers are written down."),
        ("Blockers within a day. ", "If a member is stuck or a deadline is at risk, they say so in the group "
                                    "chat the same day. The Team Lead either redistributes the work or raises it "
                                    "with the mentor."),
        ("Change is recorded, not hidden. ", "When new evidence contradicts an earlier decision, we write the "
                                             "reversal into the going-back log in Part 20 instead of quietly "
                                             "editing the old work."),
    ], size=9.5)

    h3(doc, "Our plan against the course calendar")
    table(doc, ["Week", "Stage", "What we did", "Hand-in", "Lead", "CP"], [
        ["2", "Set-up", "Project registration, research plan, interview guide and survey draft", "Registration sheet", "LS", "—"],
        ["3", "Empathise", "Cycle 1 observation (B6), first four hosteller interviews", "Observation log, notes", "AS", "CP1"],
        ["4", "Empathise", "Cycle 2 observation (C3), staff interviews, survey release", "Staff notes, survey live", "AS", "—"],
        ["5", "Empathise", "Cycle 3 observation (A2), warden interview, survey closes at 24 responses", "Full evidence pack", "AS", "CP2"],
        ["6", "Define", "Personas, empathy map, journey map, failure-point registry", "Parts 6–9", "AS", "CP3"],
        ["7", "Define", "POV and HMW statements, idea generation, screening matrix", "Parts 10–12", "RP", "CP4"],
        ["8", "Midterms", "No project work scheduled", "—", "—", "—"],
        ["9", "Ideate", "Paper walkthrough of the tracker tested with three students", "Paper prototype", "RP", "—"],
        ["10", "Prototype", "Working React prototype: timings, submission, tracking", "Parts 13–14", "RP", "CP5"],
        ["11", "Prototype", "Staff console, issue flow, notification bell, demo mode", "Working demo", "RP", "—"],
        ["12", "Test", "Six usability sessions, four tasks each, observer notes", "Part 14", "RP", "CP6"],
        ["13", "Iterate", "Six fixes from test feedback, re-test of the report-issue flow", "Part 15", "RP", "—"],
        ["14", "Deliver", "Final report, demo rehearsal, presentation", "This report", "LS", "CP7"],
    ], widths=[0.45, 0.85, 3.3, 1.25, 0.45, 0.4], font_size=8.2)

    h3(doc, "What each member must have done (tick when true)")
    table(doc, ["Duty", "LS", "AS", "RP", "TS"], [
        ["Attended at least two checkpoint meetings", "✓", "✓", "✓", "✓"],
        ["Joined at least two interviews and one observation visit", "✓", "✓", "✓", "✓"],
        ["Contributed at least five ideas to the ideation log", "✓", "✓", "✓", "✓"],
        ["Ran or observed at least one usability test", "✓", "✓", "✓", "✓"],
        ["Signed the contribution statement in their own section", "✓", "✓", "✓", "✓"],
        ["Spoke in the final presentation", "✓", "✓", "✓", "✓"],
    ], widths=[4.4, 0.6, 0.6, 0.6, 0.6], font_size=9, align=None)
    para(doc, "LS = Lakshay Sharma · AS = Ashutosh · RP = Raj Patel · TS = Tarun Sharma.",
         size=8.5, italic=True, color=SLATE)


# ------------------------------------------------------------------------ Part 3
def part3(doc):
    h2(doc, "Part 3. Summary")
    para(doc, "Hostel laundry is a service every resident uses and nobody can see. Clothes go in, and what "
              "happens next is invisible: no receipt, no status, no estimated time, no record to argue from "
              "when a shirt comes back stained or does not come back at all. Our project asked whether making "
              "that process visible would fix most of the frustration, and then built and tested the smallest "
              "product that could answer the question.", align="justify")

    key_value_table(doc, [
        ("The problem",
         "Hostellers face uncertain turnaround, mixed-up or damaged clothes and opaque schedules from the "
         "block laundry service, with no low-effort recourse and no evidence trail when something goes wrong. "
         "Survey satisfaction averaged 2.3/5 and turnaround predictability 1.9/5."),
        ("The users",
         "Primary: hostellers in blocks B6, C3, A2 and D1 who submit weekly or fortnightly. Secondary: laundry "
         "attendants who sort, wash and hand back the bags. Tertiary: wardens who arbitrate the disputes."),
        ("The core insight",
         "The problem is not that the washing is bad. It is that the process is invisible. Ten of ten "
         "interviewees could not tell us where their clothes were after drop-off, and seven of ten walked to "
         "the laundry room two to three times per cycle to find out."),
        ("The solution",
         "Laundry Roulette: a web app where a student configures their block's laundry days, windows and "
         "turnaround; submits a batch; follows it through seven stages (Submitted, Received, Washing, Drying, "
         "Folding, Ready, Picked up); and reports an issue against the batch record instead of against memory."),
        ("The evidence",
         "Ten hosteller interviews, two staff interviews, one warden interview, 24 survey responses and three "
         "complete cycle observations. Six hostellers then tested the working prototype on four tasks: timings "
         "setup, submission and tracking each completed 6/6; issue reporting 5/6. Ease of use 4.3/5, trust "
         "4.5/5, and five of six said they would use it."),
        ("Why it matters",
         "If the status is visible, the wasted trips stop; if the batch has a record, the dispute stops being "
         "memory against memory. The same build works for every block because the schedule is configured, "
         "not hard-coded."),
    ], widths=(1.55, 5.25), font_size=9.2)

    callout(doc, "The sentence we kept returning to",
            "\u201cThe core problem isn't that laundry is bad — it's that the process is invisible.\u201d "
            "Every design decision in this report traces back to that line.")


# ------------------------------------------------------------------------ Part 4
def part4(doc):
    h2(doc, "Part 4. Background")

    h3(doc, "The situation as we found it")
    para(doc, "Campus laundry runs in batches. A block is assigned certain days, students carry their clothes "
              "to a collection room during a drop-off window, and an attendant ties each bag with tape and "
              "writes the student's initials on it in marker. Bags from several students are then washed "
              "together, dried on rooftop lines or in a dryer, folded and returned to the shelf. The student "
              "is not part of any of this, and nothing is written down except, in one block, a freehand "
              "notebook.", align="justify")
    para(doc, "The schedules are not the same across blocks, and nothing publishes them. B6 collects on Monday, "
              "Wednesday and Friday between 9 AM and noon; C3 collects on Tuesday, Thursday and Saturday "
              "between 10 AM and 1 PM; A2 collects on Monday, Wednesday and Friday between 8 AM and 11 AM. "
              "Students learn their own block's days by asking a friend or reading a notice board, and they "
              "learn the rest by turning up and being sent away.", align="justify")
    para(doc, "Because there is no status, students guess. In the survey, 71% said they had arrived at the "
              "laundry room to find their clothes not ready, and 54% said they had missed a pickup because "
              "nobody told them it was ready. The cost is not only time: it is the repeated walk, the "
              "embarrassment of asking again and the low-level anxiety of not knowing whether a clean shirt "
              "exists for tomorrow.", align="justify")
    para(doc, "When something goes wrong, the process fails twice. There is no record of what was submitted, "
              "so the student cannot prove that a jacket went into the bag and the attendant cannot prove it "
              "did not. Sixty-seven per cent of survey respondents had experienced at least one lost, damaged, "
              "mixed-up or late batch; 33% said they had given up on reporting altogether. The warden, who is "
              "asked to settle these cases, has no evidence either. One warden summed it up as spending half "
              "their mediation time on situations that are \u201che said, she said\u201d.", align="justify")

    h3(doc, "What we covered, and what we left out")
    table(doc, ["Covered", "Left out on purpose"], [
        ["The block laundry service as it exists: drop-off, sorting, washing, drying, folding, pickup",
         "Private dhobis, external laundry services such as Tumbledry or UClean, and students washing by hand"],
        ["Lost, damaged and mixed-up items, and what happens after they are reported",
         "Refunds and compensation, which are decided by hostel administration and not by this product"],
        ["Per-block schedules, because the days, windows and turnaround genuinely differ",
         "Ranking or rating laundry vendors, and any commercial relationship with one"],
        ["Status visibility for students, staff and wardens as the basis of accountability",
         "Detergent, fabric-care or machine-maintenance advice"],
        ["The submission record as evidence in a dispute",
         "The physical tagging hardware: QR labels, RFID and smart lockers were considered and deferred"],
    ], widths=[3.4, 3.4], font_size=9)

    h3(doc, "What we assumed at the start")
    para(doc, "Before the first interview we wrote down what we believed. Each row below is a guess we made in "
              "Week 2, the way we tested it, and what the evidence actually said.", size=9.5)

    table(doc, ["ID", "Assumption", "How we tested it", "What the evidence said"], [
        ["A1", "Students are angry mainly because washing takes too long.",
         "Survey Q4 and Q6; interviews H01–H04",
         "Only partly true. Students tolerate two to three days when they are told in advance. What they "
         "resent is being told nothing and walking over to find out."],
        ["A2", "Every block follows the same campus-wide laundry timetable.",
         "Observation in B6, C3 and A2; interview S01",
         "False. The three blocks we observed had three different sets of days, windows and real turnaround."],
        ["A3", "Students want individual barcodes or chips on every garment.",
         "Interviews H05–H08; staff S01, S02",
         "False in practice. Attendants cannot scan 25 items per student during a morning rush. Batch-level "
         "records are what they can sustain."],
        ["A4", "There is a formal complaint register that disputes go through.",
         "Interviews S01, S02 and W01; observation",
         "False. Disputes happen verbally at the counter. The only written record we found was one block's "
         "freehand notebook."],
        ["A5", "A notification when the batch is ready would stop most missed pickups.",
         "Survey Q9 and Q13; usability testing",
         "Supported. \u201cReady for pickup\u201d was the most wanted notification (14 of 24) and 54% had "
         "already missed a pickup for lack of one."],
        ["A6", "Students would prefer WhatsApp to an app.",
         "Survey Q16; feedback from H08",
         "Mixed. 10 of 24 preferred an app notification and 8 preferred WhatsApp. We built in-app only and "
         "recorded WhatsApp as future work."],
        ["A7", "Staff resist any new system.",
         "Interviews S01 and S02; observation",
         "False. Both attendants asked for a way to tell students the batch was ready, because the questions "
         "interrupt their work."],
        ["A8", "Photo evidence at drop-off would be acceptable.",
         "Survey Q15; prototype feedback",
         "Not yet. Only 6 of 24 ranked photo proof in their top features and testers found photographing 20 "
         "items tedious, so we deferred it."],
    ], widths=[0.4, 2.1, 1.5, 2.8], font_size=8.4)


# ------------------------------------------------------------------------ Part 5
def part5(doc):
    h2(doc, "Part 5. Stakeholders")
    para(doc, "We mapped everyone who touches a laundry batch into three groups: those who suffer the friction, "
              "those who decide how the service runs, and those who do the daily work. The map is not a list of "
              "everyone on campus; it is the set of people whose behaviour our prototype has to fit into.",
         align="justify")
    figure(doc, f"{FIG}/fig_stakeholder_map.png",
           "Figure 5.1 — Stakeholder map for P21. S = suffers, D = decides, W = does the work.")

    h3(doc, "What each stakeholder has at stake")
    table(doc, ["Stakeholder", "Role", "What they have at stake", "Influence"], [
        ["Hostellers in blocks B6, C3, A2, D1", "Suffers (S)",
         "Clothes, time and replacement money; trust in the hostel service; the confidence to report a problem.",
         "High — primary user"],
        ["Laundry attendants (S01, S02)", "Does the work (W)",
         "Their working day: constant \u201cis it done?\u201d interruptions, no way to broadcast a delay, and "
         "accusations they cannot disprove.", "High — operates the batch"],
        ["Hostel wardens (W01)", "Decides (D)",
         "Time spent mediating disputes, the block's reputation, and student welfare.",
         "High — arbitrates"],
        ["Hostel administration / Estate office", "Decides (D)",
         "Approval for any new hostel system, the vendor contract and the policy on compensation.",
         "Medium — gatekeeper"],
        ["Contracted laundry vendor", "Does the work (W)",
         "Delivery quality and the risk of being blamed for losses it did not cause.",
         "Medium — downstream"],
        ["LPU IT / app hosting team", "Decides (D)",
         "Hosting, authentication and any integration with existing hostel systems.",
         "High — technical approval"],
        ["Parents and family", "Suffers (S)",
         "They pay to replace lost clothes and worry about valuables.",
         "Low — indirect"],
        ["Lost and damaged batches themselves", "Cause of the harm",
         "The systemic gap: nothing records what was in the bag, so nothing can be proven.",
         "High — the problem itself"],
    ], widths=[1.65, 0.95, 3.2, 1.0], font_size=8.5)

    h3(doc, "Who we actually researched")
    table(doc, ["Group", "Codes", "Target", "Done", "Method"], [
        ["Hostellers currently using the block laundry", "H01–H04", "4", "4", "Semi-structured interview and observation"],
        ["Hostellers with a lost or damaged item", "H05–H07", "3", "3", "In-depth interview"],
        ["Hostellers who had given up on a dispute", "H08–H10", "3", "3", "Semi-structured interview"],
        ["Laundry attendants", "S01–S02", "2", "2", "Interview and work-shadowing"],
        ["Hostel warden", "W01", "1", "1", "Semi-structured interview"],
        ["Any hosteller (survey only)", "Q01–Q24", "20", "24", "Online survey, five blocks"],
        ["Total interviews", "H01–H10, S01–S02, W01", "13", "13", "Exceeds the brief's 10-interview minimum"],
    ], widths=[2.5, 1.15, 0.55, 0.5, 2.1], font_size=8.8)
    para(doc, "The survey opened only after the eighth interview, so that the questions came from what we had "
              "already heard rather than from our assumptions.", size=9, italic=True)


# ----------------------------------------------------------------------- Part 20
def part20(doc):
    h2(doc, "Part 20. Conclusion")

    h3(doc, "The going-back log")
    para(doc, "Design work is not linear. Each time something we learned later proved an earlier decision "
              "wrong, we recorded it here instead of quietly rewriting the earlier section.", size=9.5)
    table(doc, ["#", "When", "What we had decided", "What we learned", "What we redid"], [
        ["1", "Week 3, Empathise",
         "One campus-wide laundry timer with a fixed 48-hour countdown.",
         "B6 runs Monday, Wednesday and Friday; C3 runs Tuesday, Thursday and Saturday; A2 finishes in seven "
         "hours when the machines are free.",
         "Replaced the fixed timer with a per-block schedule the student configures once."],
        ["2", "Week 4, Empathise",
         "Track every garment individually, because that is what a dispute is about.",
         "S01 showed us that counting 25 items per student at 9 AM creates a 40-minute queue. Attendants "
         "cannot sustain item-level logging.",
         "Moved to batch-level records with a free-text item note, and kept item-level tracking as future work."],
        ["3", "Week 6, Define",
         "Make photo evidence at drop-off mandatory to settle disputes.",
         "Students photograph clothes for themselves already (H04), but testers found photographing a full bag "
         "tedious and abandoned the flow.",
         "Made photos optional, and did not build capture into the prototype at all. Recorded it as v2."],
        ["4", "Week 11, Prototype",
         "Report an issue as a quiet text link at the bottom of the tracking page.",
         "H07 spent three minutes looking for it, then said he had expected it in the navigation.",
         "Turned it into a visible action on the batch page; all six later testers found it unaided."],
        ["5", "Week 13, Delivery",
         "Require a live MongoDB instance for the demonstration.",
         "The campus network blocked the database connection during a rehearsal, which would have killed the "
         "demo in front of the class.",
         "Added a mock mode with an in-memory store and seeded data, so the demo runs with no database at all."],
    ], widths=[0.3, 0.85, 1.7, 2.05, 1.9], font_size=8.3)

    h3(doc, "The story of our journey")
    para(doc, "We began with a complaint, not a question. Everyone on the team had a laundry story, and the "
              "first draft of the problem was simply that the service was slow. The first observation cycle "
              "changed that within an hour. Watching eight students hand over bags in fifteen minutes made it "
              "obvious that speed was not the issue: the batch was finished, at least roughly, when the block "
              "schedule said it would be. The failure was that nobody knew when.", align="justify")
    para(doc, "The interviews sharpened the point but also misled us in a useful way. Students asked for "
              "notifications, and a notification sounds like a small feature. The survey showed that 54% had "
              "missed a pickup and 71% had made a wasted trip, which turned a notification into the core of "
              "the product: a status a student can check without walking anywhere. Observation gave us the "
              "seven stages, because we watched a batch move through exactly those steps and saw that staff "
              "already think in them.", align="justify")
    para(doc, "The disagreement inside the team was about ambition. Two of us wanted QR tags, photo evidence "
              "and a staff mobile app; the screening matrix pushed all three down, not because they were bad "
              "ideas but because they were unbuildable in the time we had and, in the case of mandatory photos, "
              "unwanted by the people who would have to use them. Building one flow well was the harder and "
              "better choice.", align="justify")
    para(doc, "At the end, the evidence agrees with itself. The task that failed in testing was the one we had "
              "hidden in a corner, and it failed for the reason users told us it would. The task that succeeded "
              "best was the one that matched a habit students already had: tracking a food order. That is a "
              "modest result, and a real one. We have a validated prototype, not a deployed service, and the "
              "distance between those two things is written down in Parts 18 and 19 rather than glossed over.",
         align="justify")

    h3(doc, "What we would do differently")
    bullets(doc, [
        "Run the warden interview in Week 4 rather than Week 5. The warden's account of mediation changed how "
        "we framed the dispute feature, and we had already drafted it.",
        "Test the timings setup with a student who had never seen the app before building the rest of the flow. "
        "It is the least familiar step and the one most likely to lose a first-time user.",
        "Record the pre-interview assumptions in a file the whole team can edit. Two of the eight changed after "
        "the first interviews, and we only noticed because one member had kept their own notes.",
    ], size=9.5)

    contribution_block(
        doc,
        name="Lakshay Sharma",
        reg="12508708",
        roll="46",
        role="Team Lead",
        contributions=[
            "Ran the project calendar and submitted all seven checkpoints, including the two that had to be "
            "moved because of midterms.",
            "Wrote the problem framing, the stakeholder map and this conclusion, and edited every section "
            "before submission.",
            "Interviewed H01, H03 and W01, and joined the B6 observation cycle.",
            "Facilitated the Week 7 screening session and kept the score weights fixed before any idea was "
            "scored.",
            "Presented the problem and the conclusion at the final review.",
        ],
        team_statement="We set out to make hostel laundry visible, and we ended up with something narrower and "
                       "more useful: a record of a batch and a status a student can trust. The research changed "
                       "our minds more than once, and the report says so.",
    )
