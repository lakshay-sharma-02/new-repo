"""Section 2 — Research and Design Lead: Parts 6 to 10."""

from . import (h1, h2, h3, para, bullets, quote, callout, table, key_value_table,
               figure, section_banner, contribution_block, part_status_table, plain_table)

FIG = "docs/figures"


def build(doc):
    section_banner(doc, 2, "Research & Design Lead", "Ashutosh", "12509515", "43")

    h1(doc, "Section 2 — Research and Design Lead")
    para(doc, "This section holds the field evidence: how we interviewed, what we watched, what the survey "
              "said, and how we turned all of it into personas, a journey map, a problem statement and the "
              "POV and HMW questions that framed the build.", size=9.5, italic=True)

    h3(doc, "Report parts written in this section")
    part_status_table(doc, [
        ("6", "Empathy Research", "Interview guide, consent, AEIOU observation, survey, empathy map"),
        ("7", "Personas", "Three evidence-backed personas from the interviews"),
        ("8", "Journey Map", "Stage-by-stage journey with the emotion curve"),
        ("9", "Problem Definition", "Grouped findings, insights and the final problem statement"),
        ("10", "POV and HMW", "Five POV statements and the chosen how-might-we question"),
    ])

    h3(doc, "What this role is responsible for")
    bullets(doc, [
        "Owns the interview guide, the consent script, the observation sheets and the survey.",
        "Makes sure consent is taken properly and that no participant can be identified from our files.",
        "Leads the Define stage: grouping findings, writing the personas and journey map, and framing the POV "
        "and HMW questions.",
        "Like every member, also joins interviews and observation visits, gives ideas, watches a test session "
        "and speaks at the final presentation.",
    ], size=9.5)

    part6(doc)
    part7(doc)
    part8(doc)
    part9(doc)
    part10(doc)


# ------------------------------------------------------------------------ Part 6
def part6(doc):
    h2(doc, "Part 6. Empathy Research")

    h3(doc, "How we researched")
    para(doc, "We reviewed our assumptions and the public evidence first, then ran three kinds of fieldwork: "
              "interviews, observation of complete laundry cycles and a survey. The survey opened only after "
              "the eighth interview so that its questions came from what we had heard rather than from what we "
              "expected.", align="justify")

    table(doc, ["Method", "What it gives us", "Minimum we set", "What we did"], [
        ["Semi-structured interviews", "The student's own account, in their words, including the parts we did "
                                       "not know to ask about", "10 hostellers, 2 staff",
         "10 hostellers (H01–H10), 2 attendants (S01–S02) and 1 warden (W01)"],
        ["Complete-cycle observation", "What actually happens at the counter, in what order, and how long each "
                                       "step takes", "3 full cycles",
         "B6 Wednesday, C3 Friday, A2 Monday, using the AEIOU frame"],
        ["Online survey", "How widespread each frustration is across blocks and years", "20 responses",
         "24 responses across five blocks"],
        ["Prior-art and literature review", "Patterns already proven in other services that we can borrow",
         "8 sources", "Package tracking, commercial laundry apps, service blueprinting and dispute patterns"],
    ], widths=[1.4, 2.4, 1.2, 2.2], font_size=8.6)

    h3(doc, "Ethics we follow")
    bullets(doc, [
        "We say who we are, that we are INT335 students, what the research is for and that the person can say no.",
        "We ask before recording audio or taking a photograph. If the answer is no, we still interview and take "
        "written notes.",
        "We never ask for health details, money details, identity numbers, passwords, room numbers or "
        "registration numbers.",
        "Every participant appears only as a code: H01–H10, S01–S02 and W01. No real name appears anywhere in "
        "our files or in this report.",
        "We ask permission before entering a staff area, never block the counter, a queue or a corridor, and "
        "leave when the attendant asks us to.",
        "A participant can stop at any point. If a conversation about a lost item becomes upsetting, we stop and "
        "remind them that they can withdraw their answers.",
    ], size=9.5)

    h3(doc, "Interview guide")
    para(doc, "Questions are open and asked in this order. Participants may answer in English, Hindi or Punjabi, "
              "and the interviewer follows the language the participant chooses.", size=9.5)

    para(doc, "Opening, for everyone (2 minutes)", bold=True, size=10)
    bullets(doc, [
        "Read the consent script and record the answer to each consent question.",
        "Warm-up: \u201cWhich block are you in, which year, and how often do you send laundry?\u201d",
    ], style="List Number", size=9.5)

    para(doc, "Guide A. Hostellers who use the service (H01–H07)", bold=True, size=10)
    bullets(doc, [
        "Walk me through the last time you sent laundry, from deciding to collecting it.",
        "How do you know which days your block collects?",
        "How do you find out when your clothes are ready?",
        "Tell me about a time you went to collect and they were not ready. What did you do next?",
        "How many times in a cycle do you go to the laundry room? Why that many?",
        "Have you ever missed a pickup window? What happened?",
        "When something came back late, damp or mixed up, who did you tell?",
        "Have you ever reported a lost or damaged item? Walk me through what happened.",
        "What would you need to see to trust a status update?",
        "If you could change one thing about the service, what would it be?",
    ], style="List Number", size=9.5)

    para(doc, "Guide B. Hostellers with a lost, damaged or mixed-up item (H08–H10)", bold=True, size=10)
    bullets(doc, [
        "In your own time, tell me what happened, only as much as you are comfortable sharing.",
        "How did you notice the problem, and when?",
        "What did you do first? Who did you speak to?",
        "What did they ask you for? Could you provide it?",
        "Was there any written record of what you submitted?",
        "How did the conversation end?",
        "Did you try again through another route, such as the warden?",
        "What would have changed the outcome?",
        "Did the experience change how you use the service now?",
    ], style="List Number", size=9.5)

    para(doc, "Guide C. Laundry attendants (S01–S02)", bold=True, size=10)
    bullets(doc, [
        "Describe a normal collection morning: who arrives, what you do first.",
        "How do you keep track of which bag belongs to whom?",
        "What happens when a tag comes off or the initials look the same?",
        "How many times a day are you asked whether a batch is ready?",
        "What do you do when a machine breaks down or it rains during drying?",
        "How do students find out the batch is ready today?",
        "When a student says an item is missing, what can you check?",
        "If you could press one button to tell every student something, what would it say?",
    ], style="List Number", size=9.5)

    para(doc, "Guide D. Hostel warden (W01)", bold=True, size=10)
    bullets(doc, [
        "How many laundry complaints reach you in a month, and what are they about?",
        "Walk me through how you handle one.",
        "What evidence do you have when you decide?",
        "Where do you send a student when the case cannot be settled?",
        "Do you know which block schedules are published, and where?",
        "What would make a complaint easier to settle fairly?",
        "What limits what you can do: time, policy, or records?",
        "Would you support a system that logged batches, and what would you need from it?",
    ], style="List Number", size=9.5)
    para(doc, "Closing for all: \u201cIs there something I did not ask that I should have? Who else should we "
              "talk to?\u201d Then we thank the person and confirm how their answers will be stored.",
         size=9.5, italic=True)

    h3(doc, "Consent script")
    para(doc, "Read aloud in the language the person is comfortable with. Each answer is ticked on the "
              "interview record.", size=9.5)
    table(doc, ["Consent question", "Yes", "No"], [
        ["I have explained who we are and what the project is for.", "☐", "☐"],
        ["The participant agrees to be interviewed and understands they can stop at any time.", "☐", "☐"],
        ["The participant agrees to audio recording (notes are taken either way).", "☐", "☐"],
        ["The participant agrees that anonymised quotes may appear in the report under a code.", "☐", "☐"],
        ["The participant understands that no name, room number or contact detail will be recorded.", "☐", "☐"],
    ], widths=[5.4, 0.7, 0.7], font_size=9)
    callout(doc, "Hindi / Hinglish version used on campus",
            "\u201cHum INT335 Design Thinking ke students hain. Hum hostel laundry ke baare mein samajhna "
            "chahte hain — aapka experience. Aapka naam kahin nahi likha jayega, sirf ek code rahega. Aap "
            "kabhi bhi ruk sakte hain. Kya main shuru kar sakta hoon?\u201d")

    h3(doc, "Observation visits (AEIOU)")
    para(doc, "We watched three complete cycles at the real busy time and recorded Activities, Environments, "
              "Interactions, Objects and Users. The right-hand column is our interpretation, kept separate from "
              "what we actually saw.", size=9.5)

    para(doc, "Visit 1 — Block B6, Wednesday morning, clear weather", bold=True, size=10)
    table(doc, ["AEIOU", "What we saw (facts only)", "What we think it means"], [
        ["Activities", "Eight students arrived within fifteen minutes. Two attendants tagged each bag with tape "
                       "and marker initials, then sorted by colour. Three machine loads ran. Folding happened "
                       "the next afternoon; bags went on the shelf at 4:30 PM with no announcement.",
         "The work is organised and reasonably fast; the information about it never leaves the room."],
        ["Environment", "A narrow counter with a queue that reached the corridor. Rooftop drying lines with no "
                        "cover. Bags stacked on open shelving.",
         "There is no surface for a screen at the counter, which matters for any staff-side tool."],
        ["Interactions", "Students asked \u201chow long will it take?\u201d and were told \u201ctwo days, maybe "
                         "three\u201d. Three students arrived at 3 PM and were sent away. One student took the "
                         "wrong bag and brought it back twenty minutes later.",
         "The absence of a status is filled by repeated visits and by guesswork at the shelf."],
        ["Objects", "Tape, marker pen, cloth tags, a plastic crate, a shared shelf, no notebook at this block.",
         "The tag is the only identifier, and it is fragile in hot water."],
        ["Users", "Second- and third-year hostellers, two attendants, one warden passing through.",
         "The people who could answer the question are the same people busy doing the work."],
    ], widths=[0.85, 3.4, 2.55], font_size=8.4)

    para(doc, "Visit 2 — Block C3, Friday morning, overcast turning to rain", bold=True, size=10)
    table(doc, ["AEIOU", "What we saw (facts only)", "What we think it means"], [
        ["Activities", "Twelve students dropped off on the busiest day. One machine broke mid-cycle and its load "
                       "was redistributed, adding about thirty minutes. Rain started at 4 PM; attendants rushed "
                       "to bring clothes in and some were folded damp. One bag could not be found for fifteen "
                       "minutes. A t-shirt was missing at pickup and was never located.",
         "Delays are caused by things outside anyone's control; what is missing is a way to tell students that "
         "the delay happened."],
        ["Environment", "Open drying area exposed to weather; four machines, one unreliable; a table where "
                        "non-washable items were set aside with no label.",
         "Weather and machine failure are predictable risks that the current process has no channel for."],
        ["Interactions", "Attendants apologised repeatedly. A student asked where the missing t-shirt was and was "
                         "told to \u201ccheck the shelf\u201d. Nobody wrote the missing item down.",
         "The dispute begins and ends at the counter, with no record created at either end."],
        ["Objects", "Colour-coded bags per block, generic plastic bags for students who forgot theirs, a shared "
                    "drying rack.",
         "The bag, not the student, is the unit of work; a bag without an owner is invisible."],
        ["Users", "Mostly third-year hostellers, two attendants, one student who had missed two previous pickup "
                  "windows.",
         "Peak load is a predictable Friday pattern, and it is exactly when errors are most likely."],
    ], widths=[0.85, 3.4, 2.55], font_size=8.4)

    para(doc, "Visit 3 — Block A2, Monday morning, clear and warm", bold=True, size=10)
    table(doc, ["AEIOU", "What we saw (facts only)", "What we think it means"], [
        ["Activities", "Six students dropped off between 8:30 and 9:00. An attendant logged names and item "
                       "counts in a freehand notebook. Two loads ran, clothes dried on lines, were folded by "
                       "2 PM and were on the shelf by 3:30. A white shirt came back with a blue stain at 4:15.",
         "Same-day turnaround is possible; the notebook proves a record is wanted, but it is illegible and "
         "not shared with the student."],
        ["Environment", "A small office with a desk, a notebook and a shelf. Clear weather, no drying problem.",
         "The physical conditions were the best of the three visits, and the outcome was still a dispute."],
        ["Interactions", "The student showed a phone photograph of the stain to an attendant, who said \u201cwe "
                         "wash everything the same way\u201d. The photograph had nowhere to go.",
         "Students already collect evidence; there is no channel that accepts it."],
        ["Objects", "Notebook, pen, phone camera, shelf, one shared marker.",
         "A phone is already in the student's hand at the moment of the problem."],
        ["Users", "First- to fourth-year hostellers, one attendant on duty.",
         "One attendant cannot both process batches and answer questions, which is why status matters."],
    ], widths=[0.85, 3.4, 2.55], font_size=8.4)

    h3(doc, "What published sources tell us: laundry failure pattern catalogue")
    para(doc, "Before our own fieldwork we collected failures already documented in public sources, so that we "
              "would recognise a pattern when we saw it rather than inventing one. This is background evidence, "
              "not a substitute for the interviews.", size=9.5)
    table(doc, ["#", "Pattern", "How it shows up in campus laundry", "Signal a student would notice", "Source"], [
        ["1", "Status vacuum", "A batch is processed but no stage is communicated to the owner",
         "\u201cI don't know if it is washing or ready\u201d", "Nielsen (1994), visibility of system status"],
        ["2", "Unpublished schedule", "Each block has different days and windows, announced informally",
         "\u201cI turned up on the wrong day\u201d", "Observation cycles 1–3"],
        ["3", "Fragile identifier", "Tape and marker initials detach or smudge; two students share initials",
         "\u201cThat's not my bag\u201d", "Observation cycle 1; UClean tag model"],
        ["4", "Memory-against-memory dispute", "No submission record exists on either side",
         "\u201cProve it was in the bag\u201d", "Shostack (1984) service blueprinting"],
        ["5", "Weather and machine delay", "Drying is outdoors; machines fail roughly monthly",
         "\u201cIt came back damp\u201d", "Observation cycle 2; S02 interview"],
        ["6", "Peak-load collapse", "Friday and Monday collections exceed capacity",
         "\u201cEveryone is here at once\u201d", "Observation cycles 2–3"],
        ["7", "No accepted evidence channel", "A student photographs a stain and has no place to send it",
         "\u201cWhat do I do with this photo?\u201d", "Observation cycle 3"],
    ], widths=[0.3, 1.35, 2.35, 1.55, 1.25], font_size=8.3)

    h3(doc, "Interview record summary")
    table(doc, ["Code", "Group", "Date", "Language", "Mode", "One-line takeaway"], [
        ["H01", "B6, 2nd year, weekly", "Week 3", "English", "In person",
         "Turnaround varies with no pattern; would check a status screen before walking over."],
        ["H02", "C3, 3rd year, fortnightly", "Week 3", "Hindi", "In person",
         "Has stopped complaining; assumes nothing will change."],
        ["H03", "B6, 1st year, weekly", "Week 3", "Hindi", "In person",
         "New to the hostel and did not know the block's days."],
        ["H04", "A2, 4th year, fortnightly", "Week 3", "English", "In person",
         "\u201cBlack hole\u201d: lost a jacket and could not prove it."],
        ["H05", "D1, 2nd year, monthly", "Week 4", "English", "In person",
         "Low engagement; goes daily at pickup time because there is no other signal."],
        ["H06", "C3, 3rd year, weekly", "Week 4", "English", "Video call",
         "Wants food-delivery-style stages and an ETA."],
        ["H07", "B6, 1st year, weekly", "Week 4", "Hindi", "In person",
         "Went three days in one week; found the report-issue wording confusing."],
        ["H08", "A2, 3rd year, fortnightly", "Week 4", "Hindi", "In person",
         "Time-constrained; wants the schedule published and a pickup alert."],
        ["H09", "D1, 4th year, rarely", "Week 5", "English", "In person",
         "Went from staff to warden to giving up; no longer uses the service."],
        ["H10", "C3, 2nd year, weekly", "Week 5", "English", "In person",
         "Sorts clothes before drop-off; keeps her own photographs as proof."],
        ["S01", "Attendant, B6", "Week 4", "Hindi", "At the counter",
         "Cannot prove what was in a bag; would use a one-tap status update."],
        ["S02", "Attendant, C3", "Week 4", "Hindi", "At the counter",
         "\u201cA button that tells students the batch is ready would save me so much time.\u201d"],
        ["W01", "Warden, B6 and A2", "Week 5", "English", "Office",
         "Three or four complaints a month, all settled on memory; wants a record."],
    ], widths=[0.55, 1.6, 0.6, 0.7, 0.85, 2.5], font_size=8.2)

    h3(doc, "Illustrative quotes")
    table(doc, ["Code", "In their words", "What it tells us"], [
        ["H04", "\u201cIt's a black hole. You put clothes in, you get clothes out — maybe.\u201d",
         "The problem is framed as absence of information, not quality of washing."],
        ["H07", "\u201cI went on Tuesday, Wednesday, AND Thursday. It was finally ready Thursday evening.\u201d",
         "Wasted trips are measurable and repeated."],
        ["H02", "\u201cThere's no system. You just… hope.\u201d", "Resignation has set in before we arrived."],
        ["H06", "\u201cJust give me a screen that says \u2018washing\u2019 or \u2018ready\u2019. Like Swiggy for "
                "laundry.\u201d", "The mental model for the solution already exists in another service."],
        ["H09", "\u201cThe warden said \u2018talk to staff\u2019. Staff said \u2018talk to the warden\u2019. I gave "
                "up.\u201d", "The escalation path is a loop with no record."],
        ["S01", "\u201cI can't prove what was in a bag. Neither can they.\u201d",
         "The record gap is felt by staff as well as students."],
        ["S02", "\u201cIf there was a button I could press to say \u2018batch is ready\u2019 and it automatically "
                "tells students, that would save me so much time.\u201d",
         "Staff are a willing user group, not a barrier."],
        ["W01", "\u201cA tracking system would reduce complaints to me by at least half.\u201d",
         "The warden's workload is an organisational argument for the product."],
    ], widths=[0.55, 3.9, 2.35], font_size=8.5)

    h3(doc, "Survey")
    para(doc, "The survey went out in hostel WhatsApp groups and on notice boards after the eighth interview. "
              "It closed at 24 responses from five blocks: B6 (8), C3 (6), A2 (5), D1 (3) and two from other "
              "blocks. Years: first (4), second (9), third (7), fourth (3) and one postgraduate. Frequency: "
              "weekly (11), fortnightly (8), monthly (3), rarely (2).", align="justify")

    table(doc, ["Q", "Question", "Answer options"], [
        ["1", "Which hostel block do you live in?", "B6 / C3 / A2 / D1 / other"],
        ["2", "Which year are you in?", "1st / 2nd / 3rd / 4th / PG"],
        ["3", "How often do you send laundry?", "Weekly / fortnightly / monthly / rarely"],
        ["4", "Overall satisfaction with the laundry service", "1–5 scale"],
        ["5", "How do you know when your clothes are ready?", "Check in person / someone tells me / notice board / I don't know / other"],
        ["6", "How predictable is the turnaround time?", "1–5 scale"],
        ["7", "How long does laundry usually take?", "Same day / 1–2 days / 3–4 days / 5+ days / varies wildly / don't know"],
        ["8", "Have you arrived to find clothes not ready?", "Yes, many times / once or twice / no / no way to know"],
        ["9", "Have you missed a pickup because you were not told?", "Yes / no / not sure"],
        ["10", "What have you experienced? (multi-select)", "Lost / damaged / mixed-up / late / wrong items returned / none"],
        ["11", "How did you resolve the last issue?", "Talked to staff / complained to warden / gave up / other"],
        ["12", "Would you use a tracking app?", "Yes / no / maybe"],
        ["13", "Which notification matters most?", "Ready for pickup / started washing / delayed / window opens / other"],
        ["14", "Rank the features you want", "Tracking, ETA, ready alert, easy complaint, custom schedule, photo proof, schedule feed"],
        ["15", "Would you use a QR or tag system?", "Yes / no / depends on simplicity"],
        ["16", "How would you prefer updates?", "App / WhatsApp / SMS / no updates"],
    ], widths=[0.4, 2.6, 3.8], font_size=8.4)

    table(doc, ["Q", "Replies (n)", "Most common answer", "%", "What it tells us"], [
        ["4", "24", "2 out of 5 (13 answered 1 or 2)", "54% rated 1–2",
         "Satisfaction is low, but not because of washing quality alone."],
        ["5", "24", "\u201cI just go and check in person\u201d (14)", "58%",
         "The default status channel is walking to the room."],
        ["6", "24", "1 out of 5 (17 answered 1 or 2)", "71% rated 1–2",
         "Turnaround is felt as unpredictable, not merely slow."],
        ["7", "24", "\u201cVaries wildly\u201d (7)", "29%",
         "There is no shared expectation to design against."],
        ["8", "24", "Yes, many times (9) plus once or twice (8)", "71%",
         "Wasted trips are the norm, not an exception."],
        ["9", "24", "Yes (13)", "54%", "A ready notification is not a convenience; it prevents a missed pickup."],
        ["10", "24", "Late delivery (16), mixed-up items (11)", "67% any issue",
         "Most students have at least one failure story."],
        ["11", "24", "Talked to staff (10), gave up (8)", "33% gave up",
         "The existing path loses a third of the people who try it."],
        ["12", "24", "Yes (19)", "79%", "Demand for the core idea is strong."],
        ["13", "24", "\u201cReady for pickup\u201d (14)", "58%",
         "The highest-value moment is the end of the cycle."],
        ["14", "24", "Real-time tracking ranked first (18)", "75%",
         "Students ask for visibility before they ask for features."],
        ["16", "24", "App (10), WhatsApp (8)", "42% / 33%",
         "In-app is defensible for a prototype; WhatsApp is future work."],
    ], widths=[0.4, 0.7, 2.2, 0.9, 2.6], font_size=8.2)

    h3(doc, "Empathy map")
    para(doc, "Built from the interview and observation records for the main user group, the student waiting for "
              "a batch. Each entry is traceable to at least one record code.", size=9.5)
    plain_table(doc, [
        ["SAYS",
         "\u201cIs my laundry done yet?\u201d\n\u201cI'll go and check again.\u201d\n"
         "\u201cWhat's the point of complaining?\u201d\n\u201cJust tell me when it's ready.\u201d\n"
         "\u201cLast time they lost my shirt.\u201d"],
        ["THINKS",
         "\u201cWill it be ready before my 8 AM class?\u201d\n\u201cShould I walk over now or wait?\u201d\n"
         "\u201cThere's probably no record of what I gave.\u201d\n\u201cNobody will believe me.\u201d"],
        ["DOES",
         "Walks to the room two or three times per cycle.\nPhotographs clothes before drop-off.\n"
         "Asks a friend whether theirs is ready.\nGives up after the first failed complaint.\n"
         "Sorts clothes to speed up the process."],
        ["FEELS",
         "Anxious while waiting.\nFrustrated after a wasted trip.\nHelpless when an item is lost.\n"
         "Embarrassed at asking the attendant again.\nResigned: \u201cthis is just how it is\u201d."],
    ], widths=[0.85, 5.95], font_size=8.8)


# ------------------------------------------------------------------------ Part 7
def part7(doc):
    h2(doc, "Part 7. Personas")
    para(doc, "A persona is one made-up person who stands for a real group we interviewed. Every detail below "
              "comes from our notes, and the right-hand column names the record it came from. Nothing in a "
              "persona is invented for colour.", size=9.5, align="justify")

    def persona(title, rows):
        h3(doc, title)
        table(doc, ["Detail", "What our notes say", "Evidence"], rows,
              widths=[1.25, 4.25, 1.3], font_size=8.6)

    persona("Persona 1. Aarav — the student who wants to know", [
        ["Profile", "Second-year Computer Science student in B6; sends laundry every Monday; comfortable with "
                    "apps and expects them to tell him things.", "H01"],
        ["Week", "Monday drop-off between 9 AM and noon; collects when he remembers, usually Wednesday or "
                 "Thursday.", "Observation cycle 1"],
        ["Goal", "Know exactly when the batch is ready, without walking to the room to find out.", "H01, H06"],
        ["Goal", "Have a record of what he submitted in case something goes missing.", "H04, H10"],
        ["Frustration", "Turnaround has no pattern: sometimes same day, sometimes three days, and nobody says "
                        "which it will be.", "H01, survey Q6"],
        ["Frustration", "He lost a jacket worth about ₹600 and was told there was no proof, so nothing "
                        "happened.", "H04"],
        ["Behaviour", "Checks the shelf when passing, asks friends in the corridor, and takes a photograph of "
                      "his bag before handing it over.", "H01, H10"],
        ["Quote", "\u201cIt's a black hole. You put clothes in, you get clothes out — maybe.\u201d", "H04"],
        ["Design implication", "Status first. The dashboard and tracker must answer \u201cwhere is it?\u201d in "
                               "under three taps.", "Testing, Part 14"],
    ])

    persona("Persona 2. Priya — the student who wants proof", [
        ["Profile", "Third-year Electronics student in C3; sends laundry fortnightly; medium comfort with apps; "
                    "already sorts her clothes by colour.", "H10"],
        ["Week", "Tuesday, Thursday or Saturday collection; a white top once came back with a blue stain.",
         "Observation cycle 3"],
        ["Goal", "Confidence that her clothes will not be damaged or mixed with someone else's.", "H06, H10"],
        ["Goal", "A simple way to report damage that does not depend on persuading an attendant in person.", "H04, H09"],
        ["Frustration", "She photographed a stain and had nobody to show it to.", "Observation cycle 3"],
        ["Frustration", "The response she gets is \u201cwe wash everything the same way\u201d, which closes the "
                        "conversation rather than the case.", "Observation cycle 3"],
        ["Behaviour", "Keeps her own photographs as proof; has stopped expecting compensation.", "H10"],
        ["Quote", "\u201cI took a photo of the stain but… what do I do with it? There's no one to show.\u201d",
         "Observation cycle 3"],
        ["Design implication", "The issue form must live on the batch, carry the batch record with it, and "
                               "create a timestamped entry that staff and warden can both see.", "Part 15"],
    ])

    persona("Persona 3. Rajesh — the attendant in the middle", [
        ["Profile", "Head laundry attendant at B6, eight years in the role, one assistant; handles about forty "
                    "students on a peak day and twenty on a quiet one.", "S01"],
        ["Routine", "Tags bags with tape and initials, sorts by colour, loads machines, hangs clothes, folds the "
                    "next afternoon and puts bags on the shelf.", "Observation cycle 1"],
        ["Goal", "Fewer interruptions: he is asked \u201cis my laundry done?\u201d about ten times a day.",
         "S01, S02"],
        ["Goal", "A way to say \u201cthe batch is ready\u201d once, instead of telling each student "
                 "individually.", "S02"],
        ["Frustration", "He cannot prove what was in a bag, so every dispute is his word against the "
                        "student's.", "S01"],
        ["Frustration", "Machine breakdowns and rain delay batches, and he has no way to warn anyone.",
         "Observation cycle 2, S02"],
        ["Behaviour", "Uses tape, marker and memory; at A2 the process also uses a freehand notebook.",
         "Observation cycles 1 and 3"],
        ["Quote", "\u201cIf there was a button I could press to say \u2018batch is ready\u2019 and it "
                  "automatically tells students, that would save me so much time.\u201d", "S02"],
        ["Design implication", "The staff console must be one tap per stage on a phone, with no typing and no "
                               "queue at the counter.", "Part 13, Part 15"],
    ])


# ------------------------------------------------------------------------ Part 8
def part8(doc):
    h2(doc, "Part 8. Journey Map")
    para(doc, "This map follows one student through one cycle today. The stages come from the three observed "
              "cycles, the feeling scores are our synthesis of interview language, and the last column names the "
              "record behind each row.", size=9.5, align="justify")

    table(doc, ["Stage", "What the student does", "Feeling (1–5)", "Pain point we found", "Evidence"], [
        ["1. Set up the schedule", "Finds out the block's days by asking a friend or reading the notice board",
         "3", "No published schedule; the semester's change was never announced", "H03, H08"],
        ["2. Decide to wash", "Checks whether today is a collection day and gathers a bag", "3",
         "Uncertain whether today is the right day", "Survey Q5"],
        ["3. Drop off", "Hands the bag to an attendant and gets nothing back", "2",
         "No receipt, no timeline, no confirmation", "Observation all cycles, FP-01"],
        ["4. Wait", "Goes about the day with no information about the batch", "1.8",
         "Zero visibility; no ETA", "H01, H02"],
        ["5. Check status", "Walks to the laundry room, is told \u201cnot yet\u201d, walks back", "1.4",
         "Two to three wasted trips per cycle", "H07, survey Q8"],
        ["6. Know it is ready", "Hears from a friend or happens to see the bag on the shelf", "2.4",
         "54% have missed a pickup window", "Survey Q9"],
        ["7. Pick up", "Searches the shelf for the bag, sometimes takes the wrong one", "3.8",
         "No verification and no bag numbering", "Observation cycle 1"],
        ["8. Check the items", "Opens the bag and finds a damp shirt, a stain or a missing item", "2",
         "Problems are discovered after the batch has left the counter", "Observation cycles 2–3"],
        ["9. Report a problem", "Tells an attendant, who has no record to check", "1.2",
         "No structured channel and no evidence", "H09, S01"],
        ["10. Try to resolve", "Goes to the warden, is sent back to staff, and gives up", "1",
         "The escalation loop has no endpoint", "H09, W01"],
    ], widths=[1.15, 2.2, 0.6, 1.8, 1.05], font_size=8.3)

    figure(doc, f"{FIG}/fig_emotion_curve.png",
           "Figure 8.1 — Emotion curve for the current journey. The low points are waiting, checking and the "
           "dispute dead end.", width=6.5)

    callout(doc, "Three moments of truth",
            "Drop-off: do I get a confirmation and a timeline? Waiting: can I check without walking? Dispute: is "
            "there a record that makes my account believable? Today the answer to all three is no. Everything in "
            "the prototype is aimed at these three points.")

    h3(doc, "Note")
    table(doc, ["Lowest point of the journey", "What would move it"], [
        ["Stage 10, trying to resolve (score 1/5). The student has no record, the attendant has no record, and "
         "the warden is asked to decide between two memories.",
         "A batch record created at drop-off and an issue entry created against it, both timestamped and visible "
         "to staff and warden."],
        ["Stage 5, checking status (score 1.4/5). The only way to learn anything is to walk over.",
         "A status the student can check from the corridor, the library or the classroom, with the estimated "
         "ready date visible before they decide to walk."],
    ], widths=[3.4, 3.4], font_size=9)


# ------------------------------------------------------------------------ Part 9
def part9(doc):
    h2(doc, "Part 9. Problem Definition")

    h3(doc, "Grouped findings")
    para(doc, "We put every interview note, observation note and open survey answer on its own card, grouped "
              "similar cards and named the group. Counts are the number of records that supported the theme, not "
              "the number of people who mentioned it in passing.", size=9.5)

    table(doc, ["Theme", "What we heard or saw", "Record codes", "Records"], [
        ["Status invisibility", "No stage, no ETA and no ready signal after drop-off", "H01–H10, Q5, Q8, cycles 1–3", "17"],
        ["Wasted trips", "Students walk over two to three times per cycle to check", "H05, H07, H08, Q8", "9"],
        ["Unpredictable turnaround", "Same-day to five days with no pattern, and no explanation for delays",
         "H01, H03, H08, Q6, Q7, cycle 2", "14"],
        ["No submission record", "Nothing states what went into the bag or when", "H04, H10, S01, cycle 3", "6"],
        ["Dispute dead end", "Staff, then warden, then give up; no evidence survives", "H09, W01, Q11, cycle 3", "7"],
        ["Block-specific schedules", "Three blocks, three different sets of days and windows", "H03, H08, cycles 1–3", "5"],
        ["Staff have no channel", "Attendants want to broadcast status but cannot", "S01, S02, cycle 2", "3"],
        ["Peak and weather load", "Friday and Monday crowds; rain and machine failure cause cascading delay",
         "Cycle 2, S02, Q10", "6"],
    ], widths=[1.35, 3.0, 1.65, 0.8], font_size=8.4)

    table(doc, ["What people disagreed about", "How we resolved it"], [
        ["Some students wanted an app (10 of 24) and some wanted WhatsApp (8 of 24).",
         "We built the in-app version, because it is the one we could test end to end in the time available, and "
         "recorded WhatsApp as future work rather than claiming it."],
        ["Two teammates wanted item-level tracking; the attendants said it would create a queue.",
         "We followed the attendants. The batch is the unit of record; item-level tracking is in Part 19."],
        ["Some students wanted photo evidence; most testers found photographing every item tedious.",
         "We made no photograph mandatory. The issue form accepts a description, and image upload is future work."],
    ], widths=[3.4, 3.4], font_size=9)

    h3(doc, "Failure point registry")
    para(doc, "Fourteen failure points were recorded across the three observation cycles and the interviews. "
              "Frequency is the share of records in which the failure appeared; severity is our 1–5 judgement of "
              "how much it costs the student. The failures carried into the prototype are listed under the "
              "table.", size=9.5)
    table(doc, ["ID", "Stage", "What goes wrong", "Frequency", "Severity", "Current resolution"], [
        ["FP-01", "Drop-off", "No confirmation or receipt is given", "Every drop-off", "4", "None"],
        ["FP-02", "Tagging", "Tags fall off or two students share initials", "2 of 3 cycles", "3", "Re-tag if noticed"],
        ["FP-03", "Washing", "Clothes from different students are mixed", "Every cycle", "2", "Colour sorting only"],
        ["FP-04", "Drying", "Clothes are left out and get rained on", "1 of 3 cycles", "3", "Rush to bring them in"],
        ["FP-05", "Folding", "Items are folded into the wrong bag", "1 of 3 cycles", "3", "Caught if staff are careful"],
        ["FP-06", "Ready notification", "The student is not told the batch is ready", "Every cycle", "5", "None"],
        ["FP-07", "Pickup", "The student cannot find the bag on the shelf", "1 of 3 cycles", "2", "Staff help search"],
        ["FP-08", "Pickup", "The bag contains someone else's items", "2 of 3 cycles", "4", "Item returned by the student"],
        ["FP-09", "Post-pickup", "An item is missing from the bag", "1 of 3 cycles; 25% of survey", "5", "\u201cCheck the shelf\u201d"],
        ["FP-10", "Post-pickup", "An item is damaged (torn, stained, shrunken)", "33% of survey", "4", "Denied; no record"],
        ["FP-11", "Dispute", "There is no structured way to report a problem", "Every dispute", "5", "Staff, then warden, then give up"],
        ["FP-12", "Dispute", "No evidence exists, so it is memory against memory", "Every dispute", "5", "Warden arbitrates manually"],
        ["FP-13", "Peak load", "Weekend and season surges cause delay", "67% of survey", "3", "Staff work harder"],
        ["FP-14", "Communication", "There is no channel for a status update", "Every cycle", "5", "None"],
    ], widths=[0.55, 1.0, 2.5, 1.5, 0.6, 1.3], font_size=8.3)
    para(doc, "Carried into the prototype: FP-14 (status), FP-06 (ready notification), FP-11 and FP-12 (issue "
              "report and record), FP-01 (submission record) and FP-13 (configured turnaround). FP-02, FP-05, "
              "FP-09 and FP-10 need either hardware or item-level tracking, which Part 19 defers.", size=9,
         italic=True)

    h3(doc, "Key insights")
    table(doc, ["#", "We expected", "We found", "So it means", "Evidence"], [
        ["1", "Students are angry about washing quality",
         "They tolerate the wash; they cannot tolerate not knowing",
         "Design for visibility, not for cleaning performance", "H01, H04, Q4, Q17"],
        ["2", "A notification is a nice extra",
         "54% had missed a pickup; the ready alert was the single most wanted feature",
         "The alert is core, not a stretch goal", "Q9, Q13"],
        ["3", "One campus timetable exists",
         "Three blocks ran three different schedules, none published",
         "The schedule must be configured per block", "H03, H08, cycles 1–3"],
        ["4", "Disputes are rare edge cases",
         "33% had given up on a dispute and the warden handles three or four a month",
         "Recourse is a primary flow, not an exception", "Q11, W01"],
        ["5", "Staff will resist a new system",
         "Both attendants asked for a way to notify students",
         "Staff are users of the product, not obstacles to it", "S01, S02"],
    ], widths=[0.3, 1.5, 1.9, 1.85, 1.25], font_size=8.3)

    h3(doc, "Problem statement")
    key_value_table(doc, [
        ("Version 1 (Week 2, from the brief)",
         "LPU hostellers send clothes to a block laundry and cannot find out when the batch will be ready or what "
         "happened when something goes wrong."),
        ("Version 2 (Week 5, after observation)",
         "Hostellers in blocks with different, unpublished schedules lose track of a batch for one to four days, "
         "walk to the room two or three times to check, and have no submission record when an item is lost or "
         "damaged, so disputes end in resignation."),
        ("Why version 2 is better",
         "It names the block-level schedule difference and the missing record, both of which came from "
         "observation rather than from the interview script."),
    ], widths=(1.9, 4.9), font_size=9.2)

    callout(doc, "Final problem statement",
            "Hostellers face uncertain turnaround, mixed-up or damaged clothes and opaque schedules from the "
            "block laundry service, with no low-effort recourse and no evidence trail when something goes wrong.")


# ----------------------------------------------------------------------- Part 10
def part10(doc):
    h2(doc, "Part 10. POV and HMW")

    h3(doc, "Point of view statements")
    para(doc, "Each statement follows the pattern: [user] needs [need] because [insight]. The right-hand column "
              "is the evidence we would show if challenged.", size=9.5)
    table(doc, ["#", "POV statement", "Trace to evidence"], [
        ["POV-1", "A hosteller needs real-time status because they have zero visibility after drop-off and make "
                  "two or three wasted trips per cycle.",
         "10/10 interviews; Q8 (71% arrived to find clothes not ready); cycles 1–3"],
        ["POV-2", "A hosteller needs a pickup notification because 54% have missed a window without knowing the "
                  "batch was ready.", "Q9 (13 of 24); H07; cycle 1 (three students sent away)"],
        ["POV-3", "A hosteller needs a predictable turnaround because the delay is unpredictable (1.9/5) and "
                  "creates anxiety when clean clothes are needed.", "Q6 (17 of 24 rated 1–2); H01, H03, H08"],
        ["POV-4", "A hosteller needs a submission record because disputes are memory against memory and students "
                  "cannot prove what was in the bag.", "H04, H09, S01, W01; cycle 3"],
        ["POV-5", "A hosteller needs a configurable schedule because each block has different days, windows and "
                  "turnaround, and nobody publishes them.", "H03, H08; cycles 1–3"],
    ], widths=[0.6, 4.0, 2.2], font_size=8.6)

    h3(doc, "How Might We questions")
    para(doc, "We wrote five and checked each one against size: not so large that it cannot be tested this "
              "semester, not so small that it contains the answer.", size=9.5)
    table(doc, ["#", "How might we…", "Size check", "Why"], [
        ["HMW-1", "give students real-time visibility into their laundry status so they stop wasting trips?",
         "Right size", "Testable as one screen with a status and a history."],
        ["HMW-2", "notify students the moment clothes are ready so they do not miss pickup windows?",
         "Right size", "Testable as a notification and a ready state."],
        ["HMW-3", "set expectations for turnaround so students are not guessing?",
         "Right size", "Testable as an ETA shown before and after submission."],
        ["HMW-4", "create a submission record so disputes have evidence instead of memory?",
         "Right size", "Testable as a batch record with a timestamped issue entry."],
        ["HMW-5", "let students configure their own block's schedule so the app works anywhere?",
         "Right size but risky", "Testable in one sitting; the risk is that students do not know their schedule."],
        ["HMW-6", "replace the laundry service with a fully automated locker system?",
         "Too large", "Requires hardware, capital and administration approval; out of scope for one semester."],
    ], widths=[0.7, 3.3, 1.1, 1.7], font_size=8.6)

    callout(doc, "Our chosen HMW question",
            "How might we make hostel laundry predictable and accountable for both the student and the service?",
            fill="F0FDF4", bar="16A34A", title_color=None)

    para(doc, "\u201cPredictable\u201d maps to HMW-1 to HMW-3 (status, notification, ETA). \u201cAccountable\u201d "
              "maps to HMW-4 (record and recourse). \u201cFor both\u201d is deliberate: the student sees the status, "
              "the attendant updates it, and the warden can read the record. A product that only served the "
              "student would fail the moment the attendant did not use it.", align="justify")

    contribution_block(
        doc,
        name="Ashutosh",
        reg="12509515",
        roll="43",
        role="Research and Design Lead",
        contributions=[
            "Wrote the interview guide and consent script, and ran nine of the thirteen interviews.",
            "Recorded the AEIOU notes for the C3 and A2 observation cycles and co-wrote the B6 notes.",
            "Built and distributed the survey, and coded the open-ended answers into the themes in Part 9.",
            "Wrote the personas, the journey map and the POV and HMW statements in this section.",
            "Ran the Week 6 synthesis session and argued for keeping the problem statement free of any named "
            "product.",
        ],
        team_statement="The fieldwork changed the project. We thought we were studying slow laundry; we were "
                       "studying an information gap that students were paying for in time, clothes and trust.",
    )
