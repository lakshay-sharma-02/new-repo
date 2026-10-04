# Demo Script — Live Walkthrough

> **Time target:** 3–4 minutes. Practice once before presenting.

---

## Prerequisites

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Backend should show: `🎭 Running in DEMO MODE (in-memory store)`
- Frontend available at [http://localhost:5173](http://localhost:5173)

**All demo logins:** password is `demo123` for every account.

---

## Step 1: Landing Page (30s)

Navigate to the root and show the landing page:
- Animated hero mockup with floating phone demo
- "Try live demo" button → auto-logs in as **Aarav (B6)**
- Features section — highlight "Real-time batch tracking" and "Per-block schedules"

**Say:** *"The problem is simple: no one knows where their laundry is. 75% of students arrive to find clothes not ready. This app turns laundry into a live tracker."*

---

## Step 2: Dashboard — Live Tracking (1 min)

1. Click **"Try live demo"** (or log in as `aarav@hostel.edu` / `demo123`)
2. Show the **dashboard**:
   - Block schedule strip: "B6 · Mon · Wed · Fri · Drop-off 9 AM – 12 PM · ETA ~2d"
   - Stats cards: "In progress: 1", "Ready for pickup: 1", "Completed: 1"
   - Active batches list with compact status bars

3. **Point to the Demo Simulator** (bottom-right corner):
   - "Simulating live…" pill with green pulse
   - Hover to open — shows activity feed
   - "This widget auto-advances batch stages exactly as the laundry staff would do from their ops console"

4. **Wait for the simulator to advance a batch** (takes ~7 seconds at 1× speed)
   - Dashboard polls every 4 seconds — you'll see status change live

**Say:** *"See how the batch moved from 'washing' to 'drying'? The student sees it instantly, no need to walk to the laundry room. That's 2–3 wasted trips saved per cycle."*

---

## Step 3: Batch Detail — Status Timeline (1 min)

1. Click on any active batch (e.g., "2 shirts, 3 t-shirts, 1 pair jeans")
2. Show the **Track Status** page:
   - Animated 7-stage progress tracker (Submitted → Received → Washing → Drying → Folding → Ready → Picked Up)
   - Status history timeline with timestamps
   - "Mark as picked up" button (student can only confirm pickup when ready)

3. **Let the demo simulator advance another batch** to "Ready"
   - You'll see a new badge appear: 🎉 "Ready!"
   - The pickup button unlocks for that batch

**Say:** *"Every batch gets a submission record — this directly addresses the memory-vs-memory problem. When a student reports a missing item, the staff can see exactly what was in this bag and when."*

---

## Step 4: Staff Console (45s)

1. Log out and log in as **Ramesh** (`ramesh@hostel.edu` / `demo123`)
2. Show the **Ops Console**:
   - Stats grid: Queued, In machines, Ready now, Open issues
   - Weekly activity bar chart
   - Block filter + view tabs (All / Queued / Machines / Ready / Issues)

3. Pick a "Ready" batch and advance it to "Picked up"
   - Show the toast notification: "✅ Batch picked up"

**Say:** *"Staff get a real ops console. One-click status advances, a live queue, and a weekly activity view. This addresses the staff pain point of constant 'is it done?' interruptions."*

---

## Step 5: Issue Reporting (45s)

1. Log in as **Priya** (`priya@hostel.edu` / `demo123`)
2. Show her dashboard — she has a batch in "folding" with a ⚠️ "issue" badge
3. Click on that batch
4. Show the **issue banner**: "⚠️ Issue reported — staff notified" with the description
5. Click **"Report an issue"** link
6. Show the structured form with quick-chips (e.g., "Item damaged (stain / tear / shrink)")

**Say:** *"Priya had a white top come back with a blue stain. She reported it through a structured form tied to her batch. No more 'talk to staff, talk to warden, give up.' The staff gets a notification, and there's a digital record."*

---

## Step 6: Payment & Invoice (30s)

1. Go to **Payments** page (as Aarav)
2. Show payment history with 3 demo transactions
3. Click on an invoice
4. Show the **invoice detail** — items, price breakdown, coupon applied (WELCOME10), tax, total
5. Show the QR code area and "Download PDF" button

**Say:** *"Built-in payments with coupons, tax calculation, and printable invoices. The invoice includes batch details, linking the financial record to the physical laundry."*

---

## Closing (30s)

Switch back to the **Landing page** (log out).

**Say the closing:**
> "In research, 79% of hostellers said they'd use a tracking app. Our usability tests showed 83% would use this, with 4.5/5 trust rating. The core insight was simple: the problem isn't that laundry is bad — it's that the process is invisible. Making it visible solves most frustrations."

**Key demo accounts to mention:**
- Student: `aarav@hostel.edu` / `demo123`
- Staff: `ramesh@hostel.edu` / `demo123`
- Warden: `meera@hostel.edu` / `demo123`

---

## Troubleshooting During Demo

| Issue | Fix |
|---|---|
| App not loading | Check both `server` and `client` are running |
| "Demo account unavailable" | Check server shows `🎭 Running in DEMO MODE` |
| Batches not advancing | Demo Simulator only works for student role, not staff/warden |
| Login fails | Double-check `demo123` password — all accounts use the same one |
| Port conflict | Kill processes on 5000 (server) and 5173 (client), restart |
