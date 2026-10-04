# P21 · Laundry Day Roulette
## Hostel Laundry Services and Clothes

| Field | Detail |
|---|---|
| **Domain** | Hostel life · campus services |
| **Difficulty** | Easy |
| **Duration** | Full semester (Weeks 2–14, skip Week 8 for midterms) |
| **Team** | 3–4 members (solo build) |
| **Weekly Effort** | ~5–6 hours/member |

---

## Problem Statement

> Hostellers face uncertain turnaround, mixed-up or damaged clothes and opaque schedules from laundry services, with no low-effort recourse when things go wrong.

## Background

> Laundry runs on batch cycles and tagging systems students never see; disputes are memory-vs-memory; peak loads (weekends, season changes) overwhelm capacity predictably.

## Design Challenge (HMW)

> **How might we make hostel laundry predictable and accountable for both the student and the service?**

## Expected Outcome

> A mapped laundry journey with failure points; a tested transparency or tracking concept.

## Target Users

| User | Role |
|---|---|
| **Hostellers** | Primary — submit clothes, track status, raise disputes |
| **Laundry service staff** | Secondary — manage batches, update status, respond to issues |
| **Wardens** | Tertiary — handle escalation/disputes |

## Possible Directions

1. Batch-status visibility (students see where their laundry is in the cycle)
2. Simple tagging/verification steps (QR/barcode on bags)
3. Dispute-log flows (structured, evidence-based complaint system)
4. Peak-load smoothing incentives (off-peak discounts, slot booking)
5. **Custom laundry timings** — each student configures their own hostel's laundry schedule (days, drop-off/pickup windows, turnaround time) since every hostel is different

## Tools

- **Research:** Google Forms, in-person interviews, observation
- **Design:** Figma (wireframes → hi-fi prototype)
- **Prototype:** Figma clickable prototype + lightweight working demo

---

## Project Structure

```
laundry-day-roulette/
├── docs/
│   ├── README.md                  ← you are here
│   ├── timeline.md                ← semester milestones
│   ├── research/
│   │   ├── interview-guide.md     ← semi-structured interview script
│   │   ├── survey-template.md     ← Google Forms structure
│   │   ├── observations-log.md    ← laundry cycle observation records
│   │   └── literature-review.md   ← prior work / analogous solutions
│   ├── design/
│   │   ├── persona.md             ← hosteller persona(s)
│   │   ├── empathy-map.md         ← empathy mapping exercise
│   │   ├── user-journey.md        ← end-to-end laundry journey map
│   │   ├── failure-points.md      ← mapped failure points from research
│   │   ├── pov-hmw.md             ← POV statements + refined HMW
│   │   └── idea-log.md            ← ideation log + screening matrix
│   ├── prototype/
│   │   ├── figma-notes.md         ← Figma prototype design decisions
│   │   ├── testing-plan.md        ← usability test plan
│   │   ├── feedback-capture.md    ← feedback capture matrix
│   │   └── iteration-log.md       ← iteration record
│   └── deliverables/
│       ├── final-report-outline.md
│       └── presentation-outline.md
├── prototype/                     ← Figma files / working demo code
└── research-data/                 ← raw interview transcripts, survey data
```

## Key Deliverables Checklist

- [x] Empathy evidence pack (interviews, observations, survey)
- [x] Empathy map
- [x] Persona
- [x] POV + HMW statements
- [x] Idea log + screening matrix
- [x] Prototype (working demo — React + Express)
- [x] Test plan + feedback capture matrix
- [x] Iteration record
- [ ] Final report
- [ ] Presentation
- [x] Working demo

---

## Design Principle

> **The strongest direction is NOT building a huge laundry-management platform.** The project asks us to research actual failure points and validate a practical tracking/transparency system through real laundry cycles.

## Tech Stack (for working demo)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Tailwind CSS | Fast to build, familiar |
| Backend | Node.js + Express | Simple API |
| Database | MongoDB | Flexible schema for laundry batches |
| Auth | JWT (simple) | Student/staff login |
| Hosting | Vercel (FE) + Railway (BE) | Free tier, easy deploy |

*Keep the working demo lightweight — it exists to prove the tracking concept, not to be a production system.*

---

*Last updated: Week 13*
