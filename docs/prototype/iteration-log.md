# Iteration Log

> Tracked every iteration made after usability testing (Week 13).

---

## Iteration Format

| Iter # | Date | What Changed | Why (evidence) | Result |
|---|---|---|---|---|
| 1 | Week 13 | Made "Report issue" link a prominent button | H07 couldn't find the text link during testing | ✅ All 6 subsequent testers found it |
| 2 | Week 13 | Added skeleton loading states | "Loading..." text felt amateurish; skeletons match design system | ✅ Perceived performance improved |
| 3 | Week 13 | Added toast notifications for all actions | Participants wanted confirmation after submit/save/update | ✅ 0 "did it work?" questions post-action |
| 4 | Week 13 | Added demo account hint on login page | First-time testers didn't know what to enter | ✅ Reduced setup time by ~30 sec |
| 5 | Week 13 | Added animated hamburger menu for mobile | Mobile nav needed polish for demo presentation | ✅ Smooth animation, clear active states |
| 6 | Week 13 | Added stats cards to dashboard | Dashboard felt empty with no data context | ✅ At-a-glance overview of in-progress/ready/completed |

---

## Iteration Details

### Iteration 1: Report Issue Link Visibility

**What changed:**
> Changed the "Report an issue" link from a small text link at the bottom of the tracking page to a more visible section with a dedicated card/button.

**Why:**
> H07 (1st year, less tech-savvy) couldn't find the link during testing. He looked in the navbar instead. Quote: "I was looking in the menu for it."

**Before:**
> Small text link: "Report an issue with this laundry →" at the bottom of the page

**After:**
> Prominent section with icon and clear CTA button, placed below the status history

**Result:**
> All subsequent testers found it without help.

---

### Iteration 2: Skeleton Loading States

**What changed:**
> Replaced all "Loading..." text with shimmer skeleton placeholders that match the layout of the actual content.

**Why:**
> Multiple participants noted "Loading..." felt basic. Skeletons provide better perceived performance and match the design system.

**Before:**
> Plain text: "Loading..."

**After:**
> Animated shimmer placeholders matching card/row layouts

**Result:**
> No negative comments about loading states in subsequent feedback.

---

### Iteration 3: Toast Notifications

**What changed:**
> Added a toast notification system (success/error/warning/info) that appears after every user action: login, register, save timings, submit laundry, update status, report issue.

**Why:**
> Participants wanted confirmation that their action worked. Without toasts, they weren't sure if the save/submit succeeded.

**Before:**
> No feedback after actions — page just redirected

**After:**
> Green toast: "Timings saved successfully! 📅" / "Laundry submitted! 🧺" etc.

**Result:**
> 0 "did it work?" questions post-action in subsequent testing.

---

### Iteration 4: Demo Account Hint

**What changed:**
> Added a "Demo accounts" card below the login form showing `aarav@hostel.edu / demo123`.

**Why:**
> First-time testers didn't know what credentials to use, wasting time asking.

**Before:**
> No hint — testers had to ask for credentials

**After:**
> Clear demo credentials displayed on login page

**Result:**
> Testers could self-serve immediately.

---

### Iteration 5: Mobile Hamburger Menu

**What changed:**
> Added animated hamburger menu icon (three lines that transform into an X) with slide-down mobile navigation.

**Why:**
> Mobile experience needed polish for the demo presentation. The old menu was basic.

**Before:**
> Basic mobile nav

**After:**
> Animated hamburger → X transition, slide-down menu with active states

**Result:**
> Smooth, professional mobile experience.

---

### Iteration 6: Dashboard Stats Cards

**What changed:**
> Added three stats cards to the dashboard: "In Progress", "Ready to Pick Up", "Completed" — with counts and icons.

**Why:**
> Dashboard felt empty without context. Stats give an at-a-glance overview.

**Before:**
> Just a list of active batches

**After:**
> Stats cards + batch list + quick actions

**Result:**
> Dashboard feels complete and informative.

---

## Summary of Changes

| Iter | Change | Impact |
|---|---|---|
| 1 | Report issue link visibility | Fixed task 3 completion issue |
| 2 | Skeleton loading states | Improved perceived performance |
| 3 | Toast notifications | Eliminated post-action uncertainty |
| 4 | Demo account hint | Reduced onboarding friction |
| 5 | Mobile hamburger menu | Polished mobile experience |
| 6 | Dashboard stats cards | Added at-a-glance context |

---

*Updated Week 13. 6 iterations after usability testing.*
