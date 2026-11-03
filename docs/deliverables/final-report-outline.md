# Final Report — Outline & Draft Content

> Structure for the final project report. Each section below includes the key points and evidence to write up. Expand each into full prose for the final document.

---

## 1. Cover Page
- Project title: **Laundry Roulette** — A Hostel Laundry Tracking & Accountability System
- Team members
- Course / professor
- Date

## 2. Executive Summary (1 page)

**Problem in one sentence:**
> Hostellers face unpredictable turnaround, zero visibility into laundry status after drop-off, and no structured recourse when clothes are lost, damaged, or mixed up.

**What we did:**
- Conducted **10 hosteller interviews, 2 staff interviews, 1 warden interview**, **24 survey responses**, and **3 full laundry-cycle observations** across 3 hostel blocks
- Synthesized findings into personas, empathy map, journey map, and 14 registered failure points
- Brainstormed and screened **18 ideas** against impact, feasibility, user desire, novelty, and scope
- Selected and built a working demo: a web app where students configure their hostel's laundry schedule, submit batches, track status through 7 stages, and report issues with a structured form

**Key finding:**
> The core problem is not that laundry is bad — it's that the process is **invisible**. Students cannot see where their clothes are, staff cannot communicate status, and disputes have no evidence trail.

**Outcome:**
> All usability-test success criteria met (100% task completion on 3 of 4 tasks, 4.3/5 ease-of-use, 83% would use it). Prototype validated with 6 hostellers.

---

## 3. Problem Definition (2–3 pages)

### 3.1 Problem Statement
Hostellers face uncertain turnaround, mixed-up or damaged clothes, and opaque schedules from laundry services, with no low-effort recourse when things go wrong.

### 3.2 Background & Context
- Laundry runs on batch cycles and tagging systems (tape + marker initials) students never see
- Disputes are memory-vs-memory; no submission records exist
- Peak loads (weekends, season changes) overwhelm capacity predictably
- **Every hostel block has a different schedule** — days, drop-off windows, pickup windows, turnaround all vary

### 3.3 Target Users
| User | Role |
|---|---|
| **Hostellers** | Primary — submit clothes, track status, raise disputes |
| **Laundry service staff** | Secondary — manage batches, update status, respond to issues |
| **Wardens** | Tertiary — handle escalation/disputes |

### 3.4 Design Challenge (HMW)
> How might we make hostel laundry predictable and accountable for both the student and the service?

---

## 4. Research (5–6 pages)

### 4.1 Research Methodology
- **Interviews:** Semi-structured, 15–20 min, 10 hostellers (H01–H10), 2 staff (S01–S02), 1 warden (W01). Guide in `research/interview-guide.md`
- **Survey:** Google Forms, 24 responses, 5 blocks. Template + results in `research/survey-template.md`
- **Observations:** 3 full laundry cycles (B6 Wed, C3 Fri, A2 Mon). Log in `research/observations-log.md`
- **Literature review:** Package tracking, commercial laundry apps, academic frameworks. In `research/literature-review.md`

### 4.2 Participant Demographics
- 24 survey respondents across blocks B6 (8), C3 (6), A2 (5), D1 (3), other (2)
- Years: 1st (4), 2nd (9), 3rd (7), 4th (3), PG (1)
- Frequency: weekly (11), bi-weekly (8), monthly (3), rarely (2)

### 4.3 Key Findings from Interviews
1. **Zero visibility after drop-off** (10/10 hostellers) — "It's a black hole. You put clothes in, you get clothes out — maybe." (H01)
2. **Unpredictable turnaround** (8/10) — same-day to 5+ days with no pattern
3. **Wasted trips** (7/10) — students physically check 2–3× per cycle
4. **Disputes are hopeless** (6/10) — no structured way to report; 33% of survey respondents gave up
5. **Staff want to communicate** (2/2) — "If there was a button I could press to say 'batch is ready,' that would save me so much time." (S02)
6. **Custom schedules needed** (5/10) — every block differs

### 4.4 Survey Results
- Satisfaction: **2.3/5** average (58% rated 1–2)
- Turnaround predictability: **1.9/5** (75% rated 1–2)
- **79% would use a tracking app**
- 67% cite "no visibility" as their biggest frustration
- 54% have missed a pickup because they didn't know clothes were ready

### 4.5 Laundry Cycle Observations
| Cycle | Block | Key Failure |
|---|---|---|
| 1 (Wed, B6) | Mon/Wed/Fri | 3 students arrived before ready; wrong-bag incident |
| 2 (Fri, C3) | Tue/Thu/Sat | Machine breakdown (30 min); rain dampened clothes; missing t-shirt unresolved |
| 3 (Mon, A2) | Mon/Wed/Fri | Stain dispute dismissed; illegible notebook records |

### 4.6 Literature Review Summary
- Borrowed: stage-based tracking (food delivery), ETA estimates (Uber), structured disputes (airlines), photo proof (Amazon)
- Gap: **no existing app targets hostel-batch laundry** with custom per-hostel schedules

---

## 5. Synthesis & Framing (3–4 pages)

### 5.1 Empathy Map
Full map in `design/empathy-map.md`. Highlights:
- **Thinks:** "Will it be ready today?" / "Should I go check now?"
- **Feels:** anxious, frustrated, helpless, resigned, distrustful
- **Says:** "Is my laundry done yet?" / "What's the point of complaining?"
- **Does:** checks 2–3×, takes photos, gives up on disputes

### 5.2 Persona(s)
Primary: **Aarav** (2nd yr, CS, B6) — tech-savvy, wants tracking, gave up after a ₹600 loss.
Secondary: **Priya** (3rd yr, C3) — organized, sorter, burned by stains, wants proof.
Staff: **Rajesh** (S01) — 8 yrs experience, wants to notify students, notebook-based.

### 5.3 User Journey Map
10 stages from "set up timings" to "resolve dispute." Emotion curve dips from drop-off through pickup, recovering only if clothes return OK. Three moments of truth: **drop-off confirmation, waiting visibility, dispute resolution.** Full map in `design/user-journey.md`.

### 5.4 Failure Points
14 registered (FP-01 to FP-14). **Top 5 addressed:**
1. FP-14: No channel for status updates
2. FP-06: No ready notification
3. FP-11/12: No dispute system / no evidence
4. FP-01: No submission receipt
5. FP-13: Peak-load delays

### 5.5 POV + HMW Statements
- POV-1: Hosteller needs real-time tracking because they have zero visibility and waste trips
- POV-2: Needs pickup notifications because 54% missed windows
- POV-3: Needs predictable turnaround because delays are unpredictable (1.9/5)
- POV-4: Needs a submission record because disputes are memory-vs-memory
- POV-5: Needs configurable schedule because every block differs

### 5.6 Key Insight
> The core problem isn't that laundry is bad — it's that the process is invisible. Making it visible solves most frustrations.

---

## 6. Ideation & Selection (2–3 pages)

### 6.1 Ideation Methods
Brainstorm + Crazy 8s + SCAMPER (Week 7, 3 team members)

### 6.2 Full Idea Log
18 ideas in `design/idea-log.md` — from batch status tracker to smart lockers to AI stain detection.

### 6.3 Screening Matrix
Weighted criteria: Impact (×5), Feasibility (×4), User desire (×3), Novelty (×2), Scope (×3).
**Top scores:** Batch status tracker (81), Custom timings (75), Receipt/ETA/Complaint form (73), Push notifications (72).

### 6.4 Selected Concept + Rationale
**Laundry Roulette** — combines #1, #2, #3, #4, #7 into one product:
1. Batch status tracking (7 stages)
2. Custom per-hostel laundry timings
3. Push notifications when ready
4. Digital submission record
5. Structured complaint form

**Explicitly NOT building:** QR scanning, smart lockers, AI detection, staff/warden portals (v2).

---

## 7. Prototype (3–4 pages)

### 7.1 Design Decisions
| Decision | Choice | Rationale |
|---|---|---|
| Timings | User-configurable | Every hostel differs (research-validated) |
| Status stages | 7 stages | Matches observed cycles |
| Palette | Indigo + warm neutrals | Trust + approachability |
| Typography | Inter | Clean, modern |
| Navigation | Top navbar + mobile hamburger | Standard patterns |

### 7.2 Screen Flow
```
Login/Register → Dashboard → Timings Setup
                         ↘ Submit Laundry → Track Status → Report Issue
```

### 7.3 Key Screens
1. Login / Register
2. Dashboard (stats, active batches, quick actions)
3. Timings Setup (days, time windows, turnaround slider)
4. Submit Laundry (size selector with icons)
5. Track Status (animated progress bar + history timeline)
6. Report Issue (structured form)

### 7.4 Figma Link
> https://www.figma.com/proto/laundry-roulette/prototype?node-id=0-1 (Figma clickable prototype — see `docs/prototype/figma-notes.md` for design decisions)

### 7.5 Working Demo
React + Vite + Tailwind CSS frontend, Express backend, JWT auth. Runs in mock mode (no DB needed) with demo accounts:
- `aarav@hostel.edu` / `demo123` (3 batches seeded)
- `priya@hostel.edu` / `demo123` (1 batch with issue)

---

## 8. Validation & Iteration (3–4 pages)

### 8.1 Test Plan
6 hostellers, 4 tasks (timings setup, submit, track, report issue). Details in `prototype/testing-plan.md`.

### 8.2 Usability Test Results
| Task | Completion | Avg time |
|---|---|---|
| Set up timings | 100% | 2 min 15 s |
| Submit laundry | 100% | 1 min 45 s |
| Track status | 100% | 1 min 30 s |
| Report issue | 83% (1 needed help) | 2 min |

**Ratings:** Ease-of-use 4.3/5 · Trust 4.5/5 · Would use: 83%

### 8.3 Iteration Record
6 iterations in `prototype/iteration-log.md`: report-link visibility, skeleton loaders, toasts, demo hints, mobile menu, dashboard stats.

### 8.4 Final Outcome
All success criteria met. Participants described it as "like Swiggy for laundry."

---

## 9. Impact & Reflection (2 pages)

### 9.1 Expected Impact
- Eliminate wasted trips (est. 2–3 saved per student per cycle)
- Give staff a status-communication channel
- Give wardens evidence for dispute arbitration
- Works for any hostel via custom timings

### 9.2 What Worked / What Didn't
- **Worked:** research grounded every design decision; observations revealed real process details interviews missed; custom timings validated as the differentiator
- **Didn't:** recruiting participants took longer than expected; could not test QR/staff-side flows

### 9.3 Lessons Learned
- Observe the process — interviews alone miss what actually happens
- Screen ideas against user desire, not just novelty
- A simple system users will adopt beats a complex one they won't

### 9.4 Future Work
- Staff dashboard for one-tap status updates
- Push/WhatsApp notifications at stage transitions
- Photo evidence at drop-off and pickup
- Warden portal for dispute escalation
- Real MongoDB deployment (schema already exists)

---

## 10. References
- Shostack, G. L. (1984). Designing services that deliver. *Harvard Business Review*
- Nielsen, J. (1994). *Usability Engineering*
- Christensen, C. — Jobs-to-be-Done framework
- XPLANE — Empathy map methodology
- Commercial laundry apps: Tumbledry, UClean, Dhobilite

## 11. Appendices
- A. Full interview transcripts (H01–H10, S01–S02, W01)
- B. Survey raw data (24 responses)
- C. Observation logs (3 cycles)
- D. Figma prototype link
- E. Working demo code + README

---

*Estimated total: 25–35 pages.*
