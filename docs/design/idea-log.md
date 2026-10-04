# Idea Log & Screening Matrix

> Brainstormed 18 ideas, screened against criteria to select the best concept for prototyping.

---

## Ideation Session

**Date:** Week 7
**Participants:** Team (3 members)
**Method:** Brainstorm + Crazy 8s + SCAMPER

### Ideas

| # | Idea | Description |
|---|---|---|
| 1 | **Batch status tracker** | Food-delivery-style tracking: Submitted → Received → Washing → Drying → Ready → Picked Up |
| 2 | **Custom laundry timings** | Student configures their hostel's laundry days, time slots, and turnaround estimate |
| 3 | **Push notifications** | Auto-notify students at each stage transition (especially "ready for pickup") |
| 4 | **Digital submission receipt** | Log what was submitted (items, time, batch ID) — proof for disputes |
| 5 | **QR code on bags** | Staff scan QR when processing — auto-updates status in app |
| 6 | **Photo evidence at drop-off** | Student takes photo of clothes before submitting — proof of what was in the bag |
| 7 | **Structured complaint form** | Replace "talk to staff" with a form: batch ID, issue type, description, photo |
| 8 | **ETA countdown** | Show estimated time remaining based on turnaround days configured by student |
| 9 | **Staff dashboard** | Web interface for staff to update batch status with one tap |
| 10 | **Peak load alerts** | Warn students when it's a busy day: "Expect longer turnaround today" |
| 11 | **Off-peak incentives** | Discount or priority for students who submit during off-peak hours |
| 12 | **Slot booking** | Students book a drop-off time slot to reduce peak congestion |
| 13 | **Warden dashboard** | Admin view for wardens to see disputes, status, and resolution history |
| 14 | **WhatsApp integration** | Send status updates via WhatsApp messages instead of app notifications |
| 15 | **Laundry schedule feed** | Show upcoming laundry days for all blocks in a shared feed |
| 16 | **Item-level tracking** | Track individual items (not just batches) — scan each item |
| 17 | **Smart locker system** | Automated lockers where students deposit/pickup — no staff interaction needed |
| 18 | **AI stain detection** | Camera detects stains at drop-off — pre-emptive dispute resolution |

---

## Screening Matrix

| Criteria | Weight |
|---|---|
| **Impact** — How much does it solve the core pain? | 5 |
| **Feasibility** — Can we prototype it in the remaining time? | 4 |
| **User desire** — Did students actually ask for this? | 3 |
| **Novelty** — Is this different from existing solutions? | 2 |
| **Scope** — Is it achievable for a solo/small team build? | 3 |

| # | Idea | Impact (×5) | Feasibility (×4) | User desire (×3) | Novelty (×2) | Scope (×3) | **Total** |
|---|---|---|---|---|---|---|---|
| 1 | Batch status tracker | 5 (25) | 5 (20) | 5 (15) | 3 (6) | 5 (15) | **81** |
| 2 | Custom laundry timings | 4 (20) | 5 (20) | 4 (12) | 4 (8) | 5 (15) | **75** |
| 3 | Push notifications | 5 (25) | 4 (16) | 5 (15) | 2 (4) | 4 (12) | **72** |
| 4 | Digital submission receipt | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 5 | QR code on bags | 3 (15) | 3 (12) | 3 (9) | 3 (6) | 2 (6) | **48** |
| 6 | Photo evidence | 3 (15) | 4 (16) | 3 (9) | 3 (6) | 4 (12) | **58** |
| 7 | Structured complaint form | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 8 | ETA countdown | 4 (20) | 5 (20) | 4 (12) | 3 (6) | 5 (15) | **73** |
| 9 | Staff dashboard | 4 (20) | 3 (12) | 4 (12) | 3 (6) | 2 (6) | **56** |
| 10 | Peak load alerts | 3 (15) | 4 (16) | 3 (9) | 3 (6) | 4 (12) | **58** |
| 11 | Off-peak incentives | 2 (10) | 3 (12) | 2 (6) | 3 (6) | 2 (6) | **40** |
| 12 | Slot booking | 3 (15) | 3 (12) | 3 (9) | 3 (6) | 2 (6) | **48** |
| 13 | Warden dashboard | 3 (15) | 3 (12) | 3 (9) | 3 (6) | 2 (6) | **48** |
| 14 | WhatsApp integration | 4 (20) | 3 (12) | 4 (12) | 2 (4) | 2 (6) | **54** |
| 15 | Laundry schedule feed | 2 (10) | 4 (16) | 2 (6) | 2 (4) | 4 (12) | **48** |
| 16 | Item-level tracking | 4 (20) | 1 (4) | 3 (9) | 4 (8) | 1 (3) | **44** |
| 17 | Smart locker system | 5 (25) | 1 (4) | 3 (9) | 5 (10) | 1 (3) | **51** |
| 18 | AI stain detection | 3 (15) | 1 (4) | 2 (6) | 5 (10) | 1 (3) | **38** |

---

## Top 5 Ideas

| Rank | Idea | Score |
|---|---|---|
| 1 | Batch status tracker | 81 |
| 2 | Custom laundry timings | 75 |
| 3 | Digital submission receipt / ETA / Complaint form (tied) | 73 |
| 4 | Push notifications | 72 |
| 5 | Photo evidence / Peak load alerts (tied) | 58 |

---

## Selected Concept

| | |
|---|---|
| **Winner:** | Ideas #1 + #2 + #3 + #4 + #7 (combined into one concept) |
| **Concept name:** | **Laundry Roulette** — A hostel laundry tracking app |
| **One-line description:** | Configure your hostel's schedule, submit laundry, track it through every stage, and get notified when it's ready — with built-in dispute resolution. |
| **Why it won:** | Highest combined impact. Addresses the top 5 failure points (FP-14, FP-06, FP-11, FP-12, FP-01) in one cohesive product. 79% of students want a tracking app. Custom timings make it work for any hostel. |
| **What we're NOT building:** | QR scanning (too much physical infrastructure), smart lockers (hardware), AI detection (out of scope), staff dashboard (v2), warden portal (v2) |

---

## Concept Rationale

The winning concept combines the top 5 scoring ideas into a single, coherent product:

1. **Batch status tracker** (core feature) — real-time visibility into laundry progress
2. **Custom laundry timings** (differentiator) — works for any hostel, not just one
3. **Push notifications** (engagement) — students know when to come, no wasted trips
4. **Digital submission receipt** (accountability) — proof of what was submitted
5. **Structured complaint form** (resolution) — replaces memory-vs-memory disputes

This directly addresses the HMW: *"How might we make hostel laundry predictable and accountable for both the student and the service?"*

---

*Completed Week 7 ideation session.*
