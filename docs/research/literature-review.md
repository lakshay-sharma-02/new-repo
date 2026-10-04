# Literature Review & Analogous Solutions

> **Purpose:** Understand what already exists in laundry tracking, package tracking, and service transparency — and what patterns we can borrow.

---

## 1. Package/Delivery Tracking Systems

| Service | Tracking Mechanism | What We Can Learn |
|---|---|---|
| **Swiggy/Zomato** | Real-time order stages with ETA (Preparing → On the way → Delivered) | Granular status updates reduce anxiety. The "preparing" stage sets expectations. |
| **Amazon** | "Out for delivery" → "Delivered" with photo proof | Photo proof resolves disputes definitively. |
| **Uber/Grab** | Live map + ETA + driver identity | Transparency builds trust. Knowing *who* is handling your order matters. |
| **FedEx/DHL** | Multi-stage tracking with timestamps at each scan | Timestamps create accountability — each handoff is recorded. |

**Key insight:** Students already expect tracking for food and rides — laundry feels outdated by comparison. The mental model of "stages with ETA" is already established.

---

## 2. Laundry Service Apps (External)

| App/Service | Features | Relevance |
|---|---|---|
| **Tumbledry** | Pickup/drop, status updates, digital payments | End-to-end laundry service with tracking — but designed for home users, not hostel batch systems. |
| **UClean** | Bag-based pickup, QR tagging | Similar hostel-like batch model. QR tagging is a proven pattern. |
| **Dhobilite** | Scheduled pickup, notifications | Booking/scheduling patterns. Slot-based systems reduce peak congestion. |
| **GrabHub** (campus) | Shared laundry room management for apartments | Closest analogy to hostel — batch processing, shared facilities. |

**Key insight:** Commercial laundry apps exist but assume individual pickup, not batch distribution. No app targets hostel-batch laundry specifically.

---

## 3. Academic / Research

| Source | Key Finding | Application |
|---|---|---|
| **Service Blueprinting** (Shostack, 1984) | Map frontend (student-facing) and backend (staff-facing) steps to find failure points | Used to create our user journey map and identify invisible failure points |
| **Empathy Mapping** (XPLANE) | Structured way to capture user feelings, thoughts, says, and does | Used to synthesize interview findings into actionable design insights |
| **Jobs-to-be-Done** (Christensen) | Focus on what "job" the student hires laundry to do — "get clean clothes without hassle" | Framed our design challenge around reducing hassle, not building features |
| **Nielsen's Usability Heuristics** (1994) | Visibility of system status, user control, error prevention | Directly applied — "visibility of system status" is our core design principle |
| **Flow Theory** (Csikszentmihalyi) | Optimal experience = clear goals + immediate feedback | Laundry tracking provides clear goals (get clothes back) + immediate feedback (status updates) |

---

## 4. Analogous Domains

| Domain | Similarity | Pattern to Borrow |
|---|---|---|
| **Hospital lab results** | Patient sends sample, waits, gets result | Status stages, waiting with info, clear output |
| **Library book returns** | Drop off → processing → shelf | Simple tracking, fines for issues |
| **Dry cleaning** | Tag-based, batch processing, customer trust | Physical token + digital backup |
| **Event check-in** | Bag drop → tagging → retrieval | Numbered tags, claim system |
| **Airport baggage claim** | Checked bag → processed → delivered to carousel | Transparency at each stage reduces anxiety |

---

## 5. Notification & Communication Patterns

| Pattern | Example | Relevance |
|---|---|---|
| **Push notifications at stage transitions** | Food delivery apps | Immediate awareness when status changes |
| **ETA countdown** | Uber, Google Maps | Sets expectations, reduces "is it done yet?" anxiety |
| **Opt-in channels** | WhatsApp Business API, SMS | Students prefer WhatsApp (survey: 33%) — but app notifications are #1 (42%) |
| **Batch notifications** | Slack, Discord | Can notify all students in a batch at once |

---

## 6. Dispute Resolution Patterns

| Pattern | Example | Relevance |
|---|---|---|
| **Photo evidence** | Amazon delivery proof | At drop-off and before pickup — proves what was submitted |
| **Structured complaint forms** | airline baggage claims | Replaces memory-vs-memory with structured data |
| **Digital audit trail** | Banking transactions | Every action timestamped — creates accountability |
| **Escalation tiers** | Customer support (staff → manager → ombudsman) | Clear path: staff → warden → administration |

---

## Summary of Borrowable Patterns

1. **Stage-based tracking** (like food delivery) — "Received → Washing → Drying → Ready → Picked Up"
2. **Photo proof** at drop-off and before pickup to resolve disputes
3. **ETA/turnaround estimate** given at drop-off
4. **QR code or tag** for quick lookup (like package tracking numbers)
5. **Push notifications** at key stage transitions
6. **Simple complaint button** with structured form (not memory-vs-memory)
7. **Timestamped audit trail** — every action logged with time
8. **Customizable schedules** — each hostel has different timings

---

## Gaps in Existing Solutions

1. **No commercial app targets hostel-batch laundry specifically** — all assume individual home pickup
2. **Existing apps assume individual pickup**, not batch distribution to shelves
3. **Dispute resolution is almost always manual** — "talk to someone" is the only path
4. **No system integrates with hostel admin/warden workflow** — wardens have no visibility
5. **No system adapts to different hostel schedules** — one-size-fits-all doesn't work

---

*Last updated: Week 5*
