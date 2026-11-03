# Final Report — Laundry Roulette

## A Hostel Laundry Tracking & Accountability System

---

## Abstract

**Problem:** Hostellers face unpredictable laundry turnaround, zero visibility into their clothes' status after drop-off, and no structured recourse when items are lost, damaged, or mixed up.

**Approach:** We conducted field research across 5 hostel blocks — 10 hosteller interviews, 24 survey responses, 3 full laundry-cycle observations, and 2 staff + 1 warden interviews. We synthesized findings into personas, empathy maps, user journey maps, and a registry of 14 failure points. Through ideation and a weighted screening matrix, we selected the top 5 concepts and combined them into a single product: **Laundry Roulette** — a web app where students configure their hostel's schedule, submit batches, track status through 7 stages, and report issues with a structured, evidence-linked form.

**Implementation:** A React + Vite + Tailwind CSS frontend with a role-based access control system (student, staff, warden) paired with an Express.js backend. The backend runs in demo mode using an in-memory mock store (no MongoDB required) with pre-seeded users, batches, schedules, payments, reviews, and coupons. A floating "Demo Simulator" widget auto-advances batch stages in real-time, enabling a compelling live demo without manual staff intervention.

**Validation:** We tested with 6 hostellers on 4 key tasks. Results: 100% completion on timings setup, submit, and track; 83% on issue reporting. Ease-of-use rating was 4.3/5, trust was 4.5/5, and 83% said they would use the app.

**Conclusion:** The core problem is not that laundry is bad — it's that the process is invisible. Making it visible through real-time tracking solves the majority of student frustrations. The app validates with users as "like Swiggy for laundry."

---

## 1. Introduction

### 1.1 Project Context

This project was completed as part of a college-level design and development course (P21: Laundry Day Roulette), following a structured human-computer interaction methodology: Discovery → Ideation → Design → Validation → Delivery. The semester spanned 14 weeks, with Week 8 reserved for midterms.

### 1.2 Problem Statement

> Hostellers face uncertain turnaround, mixed-up or damaged clothes, and opaque schedules from laundry services, with no low-effort recourse when things go wrong.

**Design Challenge:** *How might we make hostel laundry predictable and accountable for both the student and the service?*

### 1.3 Scope

This system addresses five primary failure points identified through research:
1. No channel for status updates (100% of users affected)
2. No ready-for-pickup notification (100% of users affected)
3. No dispute system / no evidence trail (100% of users affected, 33% give up)
4. No submission confirmation or receipt (100% of users affected)
5. Unpredictable turnaround due to peak-load delays (67% of users affected)

**Out of scope (v2):** QR/barcode scanning on bags, smart lockers, AI-based stain detection, WhatsApp integration, and production-grade staff/warden portals.

---

## 2. Research

### 2.1 Methodology

| Method | Participants | Duration | Tools |
|---|---|---|---|
| Semi-structured interviews | 10 hostellers (H01–H10), 2 staff (S01–S02), 1 warden (W01) | 15–20 min each | Audio recorder, notebook |
| Online survey | 24 hostellers across 5 blocks | 5–8 min each | Google Forms |
| Full-cycle observation | 3 laundry cycles (B6 Wed, C3 Fri, A2 Mon) | 4–6 hours per cycle | Observation log, field notes |

### 2.2 Participant Demographics

**Survey (N=24):**
- Hostel blocks: B6 (8), C3 (6), A2 (5), D1 (3), other (2)
- Year: 1st year (4), 2nd year (9), 3rd year (7), 4th year (3), PG (1)
- Laundry frequency: Weekly (11), bi-weekly (8), monthly (3), rarely (2)

### 2.3 Key Findings

#### Finding 1: Zero Visibility After Drop-Off
**Evidence:** 10/10 interviewees reported having no visibility into their laundry's status once submitted.
> "It's a black hole. You put clothes in, you get clothes out — maybe." — H01

67% of survey respondents (Q5) cited "no visibility" as their top frustration.

#### Finding 2: Wasted Trips to the Laundry Room
**Evidence:** 7/10 interviewees reported physically checking 2–3 times per cycle.
> "I went Tuesday, Wednesday, AND Thursday." — H07

Survey Q8: 75% of respondents arrived to find clothes not ready.
Survey Q9: 54% missed a pickup because they didn't know it was ready.

#### Finding 3: No Recourse for Lost/Damaged Items
**Evidence:** 6/10 interviewees reported attempting to dispute a lost or damaged item.
> "I lost a jacket worth ₹800. Just gone." — H04

Survey Q11: 33% said they gave up on disputes entirely.

#### Finding 4: Memory-vs-Memory Disputes
**Evidence:** Staff interviews revealed no system for recording what was submitted.
> "I can't prove what was in a bag. Neither can they." — S01

Observation Cycle 3: A student took a photo of a stain, but had nowhere to submit it as evidence.

#### Finding 5: Unpredictable Turnaround Times
**Evidence:** Survey Q6 rated turnaround predictability at 1.9/5 (75% rated 1–2).
8/10 interviewees cited unpredictable delays. Peak loads (weekends, season changes) cause predictable surges that overwhelm capacity.

#### Finding 6: Staff Want to Communicate But Can't
**Evidence:** 2/2 staff interviews.
> "If there was a button I could press to say 'batch is ready' and it automatically tells students, that would save me so much time." — S02

Staff currently use a notebook + tape tags — functional but fragile and not communicative.

#### Finding 7: Every Block Has a Different Schedule
**Evidence:** 5/10 interviewees noted schedule differences between blocks.
- B6: Mon/Wed/Fri
- C3: Tue/Thu/Sat
- A2: Mon/Wed/Fri

No existing solution accounts for per-hostel custom schedules.

### 2.4 Survey Results Summary

| Question | Average | Key Takeaway |
|---|---|---|
| Overall satisfaction with laundry service (1–5) | **2.3 / 5** | 58% rated 1–2 |
| Turnaround predictability (1–5) | **1.9 / 5** | 75% rated 1–2 |
| How often do you arrive to find clothes not ready? | **75%** | Wasted trips are the norm |
| Did you ever miss a pickup? | **54%** | No notification system exists |
| What's your biggest frustration? | "No visibility" — 67% | Visibility is the core problem |
| Would you use a tracking app? | **79%** | Strong market demand |

### 2.5 Laundry Cycle Observations

| Cycle | Block | Schedule | Key Failures Observed |
|---|---|---|---|
| 1 | B6 | Mon/Wed/Fri | 3 students arrived before clothes were ready; 1 wrong-bag incident (tag fell off) |
| 2 | C3 | Tue/Thu/Sat | Machine breakdown (30 min delay); rain dampened clothes on drying rack; 1 missing t-shirt, unresolved |
| 3 | A2 | Mon/Wed/Fri | Stain dispute dismissed; notebook records illegible; staff couldn't verify what student submitted |

---

## 3. Synthesis

### 3.1 Personas

**Primary: Aarav Mehta** (2nd year, CS, B6)
- Tech-savvy, sends laundry weekly
- "It's a black hole. You put clothes in, you get clothes out — maybe."
- Lost a ₹600 jacket and gave up disputing
- Goals: real-time tracking, pickup notification, submission record
- Needs: Swiggy-style tracking, notifications, digital proof

**Secondary: Priya Sharma** (3rd year, Electronics, C3)
- Medium tech comfort, bi-weekly laundry
- White top returned with blue stain; no way to submit photo evidence
- Goals: confidence in submission, structured complaints, photo proof
- Needs: item-level tracking, evidence capture, complaint system

**Staff: Rajesh (S01)** (8 years experience, B6)
- Wants to help but overwhelmed by "is it done?" questions
- Uses a notebook + tape tags
- Needs: one-tap status update, batch notifications, simple item log

### 3.2 Empathy Map

**Thinking:**
- "Will it be ready today?" / "Should I go check now?"

**Feeling:**
- Anxious, frustrated, helpless, resigned, distrustful

**Saying:**
- "Is my laundry done yet?" / "What's the point of complaining?"

**Doing:**
- Checks 2–3× per cycle, takes photos for personal records, gives up on disputes

### 3.3 User Journey Map

```
Set Up Timings → Decide to Do Laundry → Drop Off → Wait → Check Status
    → Pick Up → Post-Pickup → (Dispute if needed)
```

| Stage | What Student Does | What Happens Backstage | Emotion | Pain Point | Opportunity |
|---|---|---|---|---|---|
| Set Up Timings | Figures out block schedule by asking friends | — | 😐 Confused | Every hostel is different | **Custom timings** in app |
| Drop Off | Takes bag, hands to staff | Staff tag with tape + marker | 😟 Anxious | No receipt, no timeline | **Digital receipt + ETA** |
| Waiting | Has no idea where clothes are | Washing → Drying → Folding | 😟 Anxious | Zero visibility | **Real-time tracking** |
| Check Status | Walks to laundry room 2–3 times | Staff may or may not know | 😟 Frustrated | Wasted trips | **Check app — no trip needed** |
| Pickup | Rumages through bags on shelf | Staff help locate | 😊 Relieved | Wrong bags possible | **Named/numbered bags** |
| Dispute | Notices damage, doesn't know who to tell | Staff deny responsibility | 😡 Frustrated | No records | **Structured complaint system** |
| Resolve | Goes staff → warden → gives up | No visibility for wardens | 😡→😞 Resigned | Dead end | **Digital audit trail** |

**Emotion curve:** Starts neutral (setup), dips sharply at drop-off (anxiety), stays low during waiting/checking (frustration), recovers briefly at pickup, then crashes if there's a dispute (anger → resignation).

### 3.4 Failure Point Registry

From research, 14 failure points were documented (FP-01 through FP-14), each validated with interview, survey, or observation evidence.

| # | Stage | Failure | Frequency | Severity |
|---|---|---|---|---|
| FP-01 | Drop-off | No confirmation or receipt given | 100% | 4 |
| FP-02 | Tagging | Tags fall off / get mixed up | 2/3 cycles | 3 |
| FP-03 | Washing | Clothes from different students mixed | Every cycle | 2 |
| FP-04 | Drying | Clothes left out, get rained on | 1/3 cycles | 3 |
| FP-05 | Folding | Items folded into wrong bag | 1/3 cycles | 3 |
| FP-06 | Ready notification | Student doesn't know clothes are ready | 100% | 5 |
| FP-07 | Pickup | Student can't find their bag | 1/3 cycles | 2 |
| FP-08 | Pickup | Wrong items in bag | 2/3 cycles | 4 |
| FP-09 | Post-pickup | Item missing from bag | 25% survey | 5 |
| FP-10 | Post-pickup | Item damaged | 33% survey | 4 |
| FP-11 | Dispute | No structured way to report | 100% | 5 |
| FP-12 | Dispute | Memory-vs-memory (no evidence) | Every dispute | 5 |
| FP-13 | Peak load | Weekend/season surges cause delays | 67% | 3 |
| FP-14 | Communication | No channel for status updates | 100% | 5 |

**Top 5 to address:**
1. FP-14 (No status channel) — 100% frequency, 5/5 severity → Real-time tracking
2. FP-06 (No ready notification) — 100% frequency, 5/5 severity → Push notifications
3. FP-11/FP-12 (No dispute system + no evidence) — 100% frequency, 5/5 severity → Structured complaint form + audit trail
4. FP-01 (No confirmation/receipt) — 100% frequency, 4/5 severity → Digital submission record
5. FP-13 (Peak load delays) — 67% frequency, 3/5 severity → Custom timings + ETA estimates

### 3.5 POV + HMW Statements

**POV-1:** A hosteller needs real-time laundry tracking because they have zero visibility after drop-off and waste 2–3 trips per cycle checking if clothes are ready.

**POV-2:** A hosteller needs pickup notifications because 54% have missed pickup windows due to not knowing clothes were ready.

**POV-3:** A hosteller needs predictable turnaround times because laundry delays are unpredictable (1.9/5 satisfaction) and cause anxiety when clean clothes are needed.

**POV-4:** A hosteller needs a submission record because there's no receipt or proof when disputes arise, leaving students helpless against memory-vs-memory claims.

**POV-5:** A hosteller needs a configurable schedule because every hostel block has different laundry days, times, and turnaround — one-size-fits-all doesn't work.

**Key Insight:** *The core problem isn't that laundry is bad — it's that the process is invisible. Making the process visible through tracking solves the majority of frustrations.*

---

## 4. Ideation & Concept Selection

### 4.1 Ideation Method

Brainstorm + Crazy 8s + SCAMPER, conducted over Week 7 by a team of 3 members. 18 ideas were generated.

### 4.2 Full Idea Log

| # | Idea | Score |
|---|---|---|
| 1 | **Batch status tracker** (food-delivery style tracking) | 81 |
| 2 | Custom laundry timings | 75 |
| 3 | Push notifications | 72 |
| 4 | Digital submission receipt | 73 |
| 5 | QR code on bags | 48 |
| 6 | Photo evidence at drop-off | 58 |
| 7 | Structured complaint form | 73 |
| 8 | ETA countdown | 73 |
| 9 | Staff dashboard | 56 |
| 10 | Peak load alerts | 58 |
| 11 | Off-peak incentives | 40 |
| 12 | Slot booking | 48 |
| 13 | Warden dashboard | 48 |
| 14 | WhatsApp integration | 54 |
| 15 | Laundry schedule feed | 48 |
| 16 | Item-level tracking | 44 |
| 17 | Smart locker system | 51 |
| 18 | AI stain detection | 38 |

### 4.3 Screening Matrix

Weighted criteria: Impact (×5), Feasibility (×4), User desire (×3), Novelty (×2), Scope (×3).

| # | Idea | Impact | Feasibility | Desire | Novelty | Scope | **Total** |
|---|---|---|---|---|---|---|---|
| 1 | Batch status tracker | 5 (25) | 5 (20) | 5 (15) | 3 (6) | 5 (15) | **81** |
| 2 | Custom laundry timings | 4 (20) | 5 (20) | 4 (12) | 4 (8) | 5 (15) | **75** |
| 4 | Digital submission receipt | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 7 | Structured complaint form | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 8 | ETA countdown | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 3 | Push notifications | 5 (25) | 4 (16) | 5 (15) | 2 (4) | 4 (12) | **72** |

### 4.4 Selected Concept

**Laundry Roulette** combines the top 5 scoring ideas (#1, #2, #4, #7, #8) into one cohesive product:

1. **Batch status tracking** (core feature) — real-time visibility through 7 stages
2. **Custom laundry timings** (differentiator) — works for any hostel, not just one
3. **Digital submission record** (accountability) — timestamped batch with item description
4. **Structured complaint form** (resolution) — report tied to batch record, not conversation
5. **ETA countdown** (prediction) — based on configured turnaround days

Explicitly **not** built: QR scanning (hardware infrastructure), smart lockers (hardware), AI detection (out of scope), full staff/warden portals (v2).

---

## 5. Implementation

### 5.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                     │
│                                                             │
│  Navbar ── Routes ── ProtectedRoute ── Role-based routing   │
│     │                                                       │
│     ├── AuthContext (JWT)                                   │
│     ├── ToastProvider                                       │
│     ├── 15 Pages                                            │
│       ├── Landing, Login, Register                          │
│       ├── Dashboard, TimingsSetup, SubmitLaundry            │
│       ├── TrackStatus, ReportIssue                          │
│       ├── Payments, Invoice, Reviews, Profile               │
│       ├── StaffConsole, AdminPanel, Support                 │
│     ├── Components                                          │
│       ├── Navbar, StatusTracker, DemoSimulator              │
│       ├── NotificationsBell, Toast,                           │
│     └── API client (Axios) ── /api/* ── Server              │
│                                                             │
│  Vite proxy: /api → http://localhost:5000                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Express.js)                        │
│                                                             │
│  Middleware: CORS, express.json, authenticate (JWT)        │
│                                                             │
│  Routes (11 modules):                                      │
│  ┌──────────┬──────────┬────────────┬──────────┬──────────┬──────────┐ │
│  │ auth.js  │ timings  │ batches    │ demo.js  │ payments │ support  │ │
│  │          │ routes   │ routes     │          │ routes   │ routes   │ │
│  ├──────────┼──────────┼────────────┼──────────┼──────────┼──────────┤ │
│  │ notif.   │ reviews  │ services   │ users    │ admin    │          │ │
│  │ routes   │ routes   │ routes     │ routes   │ routes   │          │ │
│  └──────────┴──────────┴────────────┴──────────┴──────────┴──────────┘ │
│                                                             │
│  Data Layer (switchable):                                  │
│  MOCK_MODE=true → In-memory store (no DB)                   │
│    • Collection class mimicking Mongoose ops              │
│    • Seed data (5 users, 2 schedules, 5 batches, etc.)    │
│  MOCK_MODE=false → MongoDB/Mongoose                        │
│    • 8 schemas: User, LaundryBatch, LaundryTimings,       │
│      Notification, Payment, Coupon, Review, Service      │
│                                                             │
│  Port 5000 (configurable via .env)                        │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Timings** | User-configurable per hostel | Every hostel has different days/times (research: 5/10 cited this) |
| **Status stages** | 7 stages: Submitted → Received → Washing → Drying → Folding → Ready → Picked Up | Matches 3 observed laundry cycles exactly |
| **Mock mode** | In-memory store mimicking Mongoose | Demo works without database setup — just `npm run dev` |
| **Role routing** | ProtectedRoute, StaffRoute, AdminRoute | Students see their batches + demo; staff see block console; warden sees all |
| **Status tracker** | Animated progress bar (compact) + timeline (detail) | Food-delivery-style familiarity (tested: "like Swiggy") |
| **Demo simulator** | Floating widget, student-only, auto-advances batches | Enables live demo without manual staff interaction |
| **Issue resolution** | Structured form → batch record → staff response | Addresses FP-11 (no complaint system) and FP-12 (no evidence) |
| **Notifications** | In-app bell + database-backed records | Students see status updates without leaving the app |

### 5.3 API Design

All routes are under `/api/` and require JWT authentication (except `/api/health`).

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register as student |
| `/api/auth/login` | POST | Public | Login, receive JWT |
| `/api/auth/me` | GET | Any | Get current user profile |
| `/api/timings` | GET | Student/Staff/Warden | List schedules for user's block |
| `/api/timings/all` | GET | Staff/Warden | List all schedules (admin) |
| `/api/timings` | POST | Staff | Create/update block schedule |
| `/api/batches` | GET | Role-scoped | List batches (own / block / all) |
| `/api/batches` | POST | Student | Submit a new batch |
| `/api/batches/:id` | GET | Owner/Manager | Batch detail view |
| `/api/batches/:id/status` | PATCH | Owner(pick only) or Staff | Advance batch through pipeline |
| `/api/batches/:id/report-issue` | POST | Owner/Manager | Report an issue |
| `/api/batches/:id/resolve-issue` | POST | Staff/Warden | Respond to an issue |
| `/api/batches/:id` | DELETE | Owner/Manager | Delete a batch |
| `/api/payments` | GET | Student | Payment history |
| `/api/reviews` | GET | Student | Service reviews |
| `/api/reviews` | POST | Student | Submit a review |
| `/api/admin/users` | GET | Warden | List all users |
| `/api/admin/analytics` | GET | Warden | Overview statistics |
| `/api/support` | POST | Any user | Submit a support/contact request |
| `/api/demo/advance` | POST | Student (demo only) | Auto-advance demo batches |

### 5.4 Demo Accounts

Pre-seeded in mock mode:

| Role | Email | Password | Notes |
|---|---|---|---|
| Student | `aarav@hostel.edu` | `demo123` | B6 block, 3 batches (washing, ready, picked up) |
| Student | `priya@hostel.edu` | `demo123` | C3 block, 2 batches (folding+issue, ready) |
| Staff | `ramesh@hostel.edu` | `demo123` | B6 block staff |
| Staff | `suresh@hostel.edu` | `demo123` | C3 block staff |
| Warden | `meera@hostel.edu` | `demo123` | All blocks access |

---

## 6. Validation & Iteration

### 6.1 Usability Testing

**Method:** Think-aloud protocol, 6 hostellers, 4 tasks each, 20–25 minutes per session.
**Setup:** Working React demo on localhost, screen recording + observer notes.

### 6.2 Test Results

| Task | Success Rate | Avg Time | Help Needed |
|---|---|---|---|
| Set up laundry timings | **100% (6/6)** | 2:15 | 0 |
| Submit laundry batch | **100% (6/6)** | 1:45 | 0 |
| Track status | **100% (6/6)** | 1:30 | 0 |
| Report an issue | **83% (5/6)** | 2:00 | 1 (link placement) |

**Post-task ratings:**
| Question | Average | Distribution |
|---|---|---|
| Ease of use (1–5) | **4.3** | ★★★: 1, ★★★★: 2, ★★★★★: 3 |
| Trust vs. current process (1–5) | **4.5** | ★★★★: 2, ★★★★★: 4 |
| Would you use this? | **83% yes** | Yes: 5, Maybe: 1 |

### 6.3 Iterations Applied

| Iter # | What Changed | Why | Result |
|---|---|---|---|
| 1 | Report issue link made prominent button | H07 couldn't find the text link | ✅ All testers found it |
| 2 | Skeleton loading states | "Loading..." felt amateurish | ✅ Better perceived performance |
| 3 | Toast notifications added | Users needed confirmation after actions | ✅ 0 "did it work?" questions |
| 4 | Demo account hint on login page | Testers didn't know what credentials to use | ✅ Self-service onboarding |
| 5 | Animated hamburger menu for mobile | Mobile nav needed polish | ✅ Professional mobile experience |
| 6 | Stats cards on dashboard | Dashboard felt empty without context | ✅ At-a-glance overview |

### 6.4 Key Feedback Quotes

> "This is exactly what I wanted. I can see it's washing right now." — H01

> "It's like tracking a food order. Very clear." — H10

> "I'd love this. Even just the 'ready' notification would save me so many trips." — H06

> "Just make sure staff actually update the status. That's the only way this works." — H01

> "Can you add a WhatsApp notification too? Not everyone opens apps." — H08

### 6.5 Success Criteria

| Criterion | Target | Actual | Status |
|---|---|---|---|
| Task completion (timings setup) | ≥ 80% | 100% | ✅ |
| Task completion (submit) | ≥ 80% | 100% | ✅ |
| Task completion (track) | ≥ 80% | 100% | ✅ |
| Task completion (report) | ≥ 60% | 83% | ✅ |
| Average ease-of-use | ≥ 3.5/5 | 4.3/5 | ✅ |
| Would use this | ≥ 70% | 83% | ✅ |

**All success criteria met.**

---

## 7. Impact & Reflection

### 7.1 Expected Impact

- **Students:** No wasted trips (est. 2–3 saved per cycle), know exactly when to come, have evidence for disputes
- **Staff:** Fewer "is it done?" interruptions, one-tap status updates reduce friction
- **Wardens:** Digital records for fair dispute arbitration
- **Universality:** Custom timings mean any hostel can use the system

### 7.2 What Worked

1. **Research grounded every decision** — We didn't guess. We observed 3 real laundry cycles and interviewed 13 people. The 7-stage pipeline maps exactly to what happens in the real world.

2. **Observation revealed what interviews missed** — Students said they wanted notifications, but seeing them *walk to the laundry room 3 times* made us realize the real cost was *time wasted*, not just uncertainty.

3. **Screening ideas against user desire, not just novelty** — QR scanning and AI stain detection were novel ideas, but scored low on desire and feasibility. The simple status tracker scored highest because it directly addressed what users asked for.

4. **Demo simulator enabled live demonstration** — The floating widget that auto-advances batches let us demo the full lifecycle without needing manual staff interaction, making the presentation compelling.

### 7.3 What Didn't Work

1. **Recruiting participants took longer than expected** — Convincing students to sit through 20-minute sessions during exam season was challenging. We ended up with 6 testers instead of the planned 8+.

2. **Could not test QR/staff-side flows** — We explicitly chose not to build these, but some users naturally asked "will staff have an app too?" We directed them to the staff login account for a minimal preview.

3. **No mobile device testing** — All testing was done on laptop browsers. The mobile experience is designed but untested with real users.

### 7.4 Lessons Learned

1. **Observe the process — interviews alone miss reality.** Talking to students about their laundry experience gave us the *what*, but watching a full cycle gave us the *how* and *when* — the timing of failures, the frequency of trips, the actual handoff between tag and bag.

2. **Screen ideas against user desire, not just novelty.** The temptation in a design course is to build the most innovative thing. But the screening matrix kept us honest — we built what users actually asked for, not what sounded cool.

3. **A simple system users will adopt beats a complex one they won't.** We could have built QR scanning, photo evidence, WhatsApp integration, and a full staff app. Instead, we built one feature excellently: seeing where your laundry is, right now.

### 7.5 Future Work

1. **Push/WhatsApp notifications** — Currently in-app only. A service worker + push API or Twilio integration would deliver status updates to phones.
2. **Photo evidence** — At drop-off, students could attach a photo of their items. This directly addresses FP-09 (missing items) and FP-10 (damage).
3. **Item-level tracking** — Instead of batch-level, track individual items with descriptions. Addresses FP-02 (tags falling off) and FP-08 (wrong items).
4. **Staff mobile app** — A simplified mobile interface for staff to update status with one tap, eliminating the notebook entirely.
5. **Real MongoDB deployment** — The schema and models exist; deploying with `MOCK_MODE=false` requires only a MongoDB URI in `.env`.
6. **"Next drop-off" countdown** — Multiple testers asked for a countdown on the dashboard showing when the next collection window opens.
7. **Item count field** — A small addition to submission form, requested by H08.

---

## 8. Conclusion

This project demonstrates that a simple, well-researched solution can address a deeply felt everyday problem. Hostel laundry isn't glamorous, but it affects every hosteller — and the stress, wasted time, and lost items add up.

By making the invisible visible — showing students exactly where their laundry is at any moment — we've solved the majority of frustrations that research uncovered. The 7-stage tracking pipeline, custom per-hostel schedules, digital submission records, and structured dispute system together create a system that is simultaneously more transparent, more accountable, and more humane than what exists today.

The working demo validates this approach: 83% of testers said they would use it, and 100% completed the core tracking flow without assistance. The app feels familiar ("like Swiggy for laundry") while solving a uniquely hostel-specific problem (different schedules for every block).

The project is not a finished product — it's a validated prototype that proves the concept works. The architecture supports a production MongoDB deployment, and the roadmap for v2 (notifications, photo evidence, staff mobile app) is clear and research-backed.

---

## 9. References

- Shostack, G. L. (1984). Designing services that deliver. *Harvard Business Review*, 62(6), 132–140.
- Nielsen, J. (1994). *Usability Engineering*. Academic Press.
- Christensen, C. M. (1997). *The Innovator's Dilemma*. Harvard Business Review Press.
- Norman, D. A. (2013). *The Design of Everyday Things*. Basic Books.
- XPLANE. (n.d.). *Empathy Map Canvas*.
- Tumbledry (2023). Commercial laundry service platform. [https://tumbledry.com](https://tumbledry.com)
- UClean (2023). Laundry service with tracking. [https://uclean.in](https://uclean.in)

---

## 10. Appendices

### Appendix A: Interview Transcript Excerpts

*(Full excerpts shown here — raw interview data captured in `docs/research/observations-log.md`)*

**H01 (B6, 2nd year):**
> "It's a black hole. You put clothes in, you get clothes out — maybe. Sometimes my roommate's blue shirt comes back with a red stain. We never know what happened in between."

**H04:**
> "I lost a jacket worth ₹800. Just gone. I complained to the warden, they said 'there's no proof, what can we do?' I showed up at laundry every day for a week after that. Now I just... don't use the service."

**S02 (Staff):**
> "If there was a button I could press to say 'batch is ready' and it automatically tells students, that would save me so much time. I get asked 'is my laundry done?' like 10 times a day."

**W01 (Warden):**
> "A tracking system would reduce complaints by at least half. Half of my time is spent mediating laundry disputes, and half of those are 'he said/she said' situations."

### Appendix B: Survey Raw Data

24 responses across 5 hostel blocks. Key questions:
- Q5: "What's your biggest frustration with the laundry service?" → 67% answered "no visibility"
- Q6: "How would you rate the predictability of turnaround times?" → Average: 1.9/5
- Q8: "How often do you arrive at the laundry room to find clothes not ready?" → 75% "more than half the time"
- Q9: "Have you ever missed picking up your laundry because you didn't know it was ready?" → 54% yes
- Q11: "Have you ever given up on reporting a laundry issue?" → 33% yes

### Appendix C: Observation Logs

*(3 full cycle observations — see `research/observations-log.md` for full details)*

**Cycle 1 (B6, Wednesday):**
- 09:00: Student drops off bag, staff tags with tape + marker (no receipt given)
- 12:00: Student returns to check — "not ready, try Thursday"
- 15:00: Student returns again — still not ready
- 10:30 (Thursday): Student finally gets clothes, but roommate's shirt is missing from the bag

**Cycle 2 (C3, Friday):**
- Machine breaks down mid-cycle, 30-minute delay
- Rain event: clothes left on drying rack get damp
- Student's t-shirt goes missing, staff can't find it in the notebook log

**Cycle 3 (A2, Monday):**
- Student reports white shirt stained blue
- Staff: "We wash everything the same, can't help"
- Student shows photo — staff: "No system to log that"

### Appendix D: System Architecture

See Section 5.1 for the full architecture diagram. The system uses a client-server pattern with JWT-based authentication, role-based access control, and a switchable data layer between in-memory mock and MongoDB.

### Appendix E: Working Demo

The application runs in demo mode out of the box:

```bash
# Start backend (port 5000)
cd server && npm install && npm run dev

# Start frontend (port 5173)
cd client && npm install && npm run dev
```

**Demo flow:**
1. Log in as `aarav@hostel.edu` / `demo123`
2. See 3 batches on the dashboard (washing, ready, completed)
3. Watch the **Demo Simulator** widget (bottom-right) auto-advance batch stages
4. Click on a batch to track its status in real-time
5. When a batch reaches "Ready", mark it as "Picked up"
6. Report an issue on any active batch — staff gets notified in-app

---

*Total word count: ~4,200 (excluding tables and appendices)*

*Estimated page count: 25–30 pages when formatted with standard margins and 12pt font.*
