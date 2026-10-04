# Figma Prototype — Design Decisions

> Documented design decisions, screen inventory, and rationale for the prototype.
> Updated to reflect the working demo (React + Tailwind CSS).

---

## Core Flow

```
Set Up Laundry Timings → Submit Laundry → Track Status → Get Notified → Pick Up → Report Issue (if needed)
```

## Screen Inventory

| # | Screen | Purpose | Fidelity |
|---|---|---|---|
| 1 | **Login / Register** | Student authentication | Hi-fi (working) |
| 2 | **Dashboard** | Overview: stats, active batches, quick actions, schedule | Hi-fi (working) |
| 3 | **Laundry Timings Setup** | Configure hostel's laundry days + time slots | Hi-fi (working) |
| 4 | **Submit Laundry** | Fill form, submit batch with description + size | Hi-fi (working) |
| 5 | **Track Status** | Live status bar + status history timeline | Hi-fi (working) |
| 6 | **Report Issue** | Structured complaint form | Hi-fi (working) |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Laundry timings** | User-configurable | Every hostel block has different days/schedules. Making it custom means the app works for any hostel. (Research: 5/10 hostellers cited schedule differences) |
| **Status stages** | 7 stages: Submitted → Received → Washing → Drying → Folding → Ready → Picked Up | Based on observed laundry cycles (3 observations). Each stage is a distinct, visible step that students care about. |
| **Color palette** | Indigo brand (#4f46e5) with warm neutrals | Professional, trustworthy feel. Indigo conveys reliability. Warm neutrals feel approachable. |
| **Typography** | Inter (Google Fonts) | Clean, readable, modern. Works well at all sizes. |
| **Navigation** | Top navbar with mobile hamburger | Standard pattern. Desktop: horizontal links. Mobile: animated hamburger menu. |
| **Status indicators** | Animated progress bar (compact) + timeline (detail) | Compact for dashboard cards (quick scan). Full timeline for detail page (deep understanding). |
| **Toast notifications** | Context-aware (success/error/warning/info) | Non-blocking feedback. Users see confirmation without leaving the page. |
| **Loading states** | Skeleton shimmer placeholders | Better perceived performance than "Loading..." text. Matches the design system. |
| **Dark mode** | System preference detection | No manual toggle needed. Respects OS setting. Glass morphism adapts. |
| **Submission record** | Batch ID + item description + timestamp | Provides evidence for disputes. Addresses FP-01 (no receipt) and FP-12 (memory-vs-memory). |
| **Complaint flow** | Separate page with structured form | Dedicated space for issue reporting. Not buried in settings. Addresses FP-11 (no complaint system). |

---

## How Timings Flow Into the App

```
Student sets timings → Dashboard shows schedule summary
                     → Submit button available with timing context
                     → ETA calculated from turnaround estimate
                     → Dashboard shows "Next drop-off: Mon 9 AM"
```

**Key insight:** The app adapts to the student's hostel, not the other way around.

---

## Tech Stack (Working Demo)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 | Fast to build, modern tooling |
| Backend | Node.js + Express | Simple API, familiar stack |
| Database | In-memory mock (MOCK_MODE) + MongoDB ready | Demo works without DB; production-ready schema exists |
| Auth | JWT (simple) | Student/staff login as required |
| Animations | CSS keyframes + Tailwind transitions | No extra dependencies, smooth performance |

---

## Figma File Link

> [Figma prototype link to be added after Week 11 hi-fi design]

---

*Updated to reflect working demo (Week 13). Original design decisions documented Week 11.*
