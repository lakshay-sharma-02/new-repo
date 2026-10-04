# Usability Test Results

> Tested the working demo with 6 hostellers (Week 12).

---

## Test Objectives

0. Can students set up their custom laundry timings without help?
1. Can students complete the core flow (submit → track → pickup) without help?
2. Do students understand the status tracking at each stage?
3. Is the dispute/report-issue flow clear and low-effort?
4. Does the prototype build trust compared to current experience?

---

## Test Setup

| Item | Detail |
|---|---|
| **Prototype** | Working React demo (localhost) |
| **Participants** | 6 hostellers: H01 (B6, 2nd yr), H03 (B6, 1st yr), H06 (C3, 3rd yr), H07 (B6, 1st yr), H08 (A2, 3rd yr), H10 (C3, 2nd yr) |
| **Duration** | 20–25 minutes per session |
| **Location** | Computer lab, laptop with working demo |
| **Recording** | Screen recording + observer notes |

---

## Task Results

### Task 0: Set Up Laundry Timings

| Metric | Result |
|---|---|
| Completion rate | **6/6 (100%)** |
| Average time | 2 min 15 sec |
| Errors | 0 |
| Help needed | 0 |

**Observations:** All participants found the timings page easily. Day selection (toggle buttons) was immediately understood. Time inputs were familiar. The slider for turnaround days was intuitive.

> "Oh this is nice — I just click my laundry days and set the times." — H03

### Task 1: Submit Laundry

| Metric | Result |
|---|---|
| Completion rate | **6/6 (100%)** |
| Average time | 1 min 45 sec |
| Errors | 0 |
| Help needed | 0 |

**Observations:** Participants appreciated seeing their configured timings displayed before the form. The size selector (Small/Medium/Large) with icons was clear. One participant (H08) wanted to add item counts — noted as future improvement.

> "I like that it shows my laundry schedule right there. Makes sense." — H06

### Task 2: Track Status

| Metric | Result |
|---|---|
| Completion rate | **6/6 (100%)** |
| Average time | 1 min 30 sec |
| Errors | 0 |
| Help needed | 0 |

**Observations:** The status tracker was immediately understood. Participants liked the animated progress bar and the timeline view. The "Mark as" button was discovered quickly. Two participants (H01, H10) said it felt "like Swiggy."

> "This is exactly what I wanted. I can see it's washing right now." — H01

> "It's like tracking a food order. Very clear." — H10

### Task 3: Report an Issue

| Metric | Result |
|---|---|
| Completion rate | **5/6 (83%)** |
| Average time | 2 min 0 sec |
| Errors | 1 participant couldn't find the report link initially |
| Help needed | 1 participant (H07) |

**Observations:** The "Report an issue" link on the tracking page was missed by H07 (1st year, less tech-savvy). He looked for it in the navbar instead. After pointing it out, he completed the form easily. Other participants found it naturally.

> "I was looking in the menu for it. But yeah, it makes sense to put it on the tracking page." — H07

---

## Post-Task Questions

| Question | Average Rating | Distribution |
|---|---|---|
| "How easy was this to use?" (1–5) | **4.3 / 5** | ★3: 1, ★4: 2, ★5: 3 |
| "Would you trust this more than the current process?" (1–5) | **4.5 / 5** | ★4: 2, ★5: 4 |
| "Would you actually use this?" | **5/6 Yes (83%)** | Yes: 5, Maybe: 1 |

### Open-ended feedback

> "Just make sure staff actually update the status. That's the only way this works." — H01

> "I'd love this. Even just the 'ready' notification would save me so many trips." — H06

> "Can you add a WhatsApp notification too? Not everyone opens apps." — H08

> "The timeline at the bottom — that's really cool. Shows the whole history." — H10

---

## Feedback Capture Matrix

| Category | What worked 👍 | What didn't work 👎 | Ideas 💡 |
|---|---|---|---|
| **Navigation** | Clean navbar, easy to find pages | H07 couldn't find report link | Add report option in navbar or as a more prominent CTA |
| **Timings setup** | Day toggle buttons, time inputs, slider | H08 wanted to see "next drop-off" on dashboard | Show countdown to next drop-off on dashboard |
| **Submit flow** | Timing context shown, size selector with icons | H08 wanted item count field | Add optional item count |
| **Tracking** | Animated progress bar, timeline view, "Mark as" button | Status history could show more detail | Add staff name/notes to history entries |
| **Disputes** | Structured form, clear prompt | Link placement (1 participant missed it) | Make report link more prominent on tracking page |
| **Trust/credibility** | 4.5/5 trust rating — significant improvement | H01: "depends on staff actually using it" | Staff onboarding, simplicity of status update |

---

## Success Criteria

| Metric | Target | Actual | Status |
|---|---|---|---|
| Task completion (timings setup) | ≥ 80% | 100% | ✅ |
| Task completion (submit) | ≥ 80% | 100% | ✅ |
| Task completion (track) | ≥ 80% | 100% | ✅ |
| Task completion (report) | ≥ 60% | 83% | ✅ |
| Average ease-of-use | ≥ 3.5/5 | 4.3/5 | ✅ |
| "Would use this" | ≥ 70% | 83% | ✅ |

**All success criteria met.**

---

*Tested Week 12. 6 participants, 4 tasks each.*
