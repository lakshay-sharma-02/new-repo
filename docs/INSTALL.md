# Installation & Setup Guide

## Quick Start (Demo Mode — No Database Required)

The app runs entirely in demo mode with an in-memory store. No MongoDB, no external dependencies — just Node.js.

### 1. Clone & Install

```bash
git clone https://github.com/lakshay-sharma-02/new-repo.git
cd new-repo

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure (Optional)

Copy the example env file. By default, demo mode is enabled:

```bash
cd server
cp .env.example .env
# .env already has MOCK_MODE=true — you're good to go
```

To use a real MongoDB instance instead:
```bash
# In server/.env:
MOCK_MODE=false
MONGODB_URI=mongodb://localhost:27017/laundry-roulette
```

### 3. Run the App

Open two terminal windows:

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

### 4. Open & Explore

Navigate to [http://localhost:5173](http://localhost:5173) and click **"Try live demo"** or log in manually with:

| Role | Email | Password |
|---|---|---|
| Student | `aarav@hostel.edu` | `demo123` |
| Staff | `ramesh@hostel.edu` | `demo123` |
| Warden | `meera@hostel.edu` | `demo123` |

### 5. Demo Flow

1. **Student view:** Log in as `aarav@hostel.edu` — you'll see 3 batches on the dashboard (washing, ready, completed). The floating **Demo Simulator** widget (bottom-right) will auto-advance batch stages in real-time.

2. **Track a batch:** Click any batch to see its live status timeline, ETA, and history.

3. **Report an issue:** On a batch's tracking page, click "Report an issue" — fill out the structured form. The issue is now tied to your batch record.

4. **Staff view:** Log out and log in as `ramesh@hostel.edu` — you'll see the Ops Console with all B6 block batches, one-click status advances, and a weekly activity chart.

5. **Warden view:** Log in as `meera@hostel.edu` — access the Admin Panel with revenue analytics and all-block oversight.

---

## Project Structure

```
laundry-roulette/
├── README.md                    # Project overview
├── docs/INSTALL.md             # This file
├── .gitignore
│
├── client/                     # React frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js        # Test runner config
│   ├── .gitignore
│   ├── index.html
│   └── src/
│       ├── main.jsx            # Entry point
│       ├── App.jsx             # Routing + role-based protection
│       ├── App.css             # Vite default styles (unused — see index.css)
│       ├── index.css           # Tailwind base + design system (glass morphism, gradients)
│       ├── lib/
│       │   └── api.js          # Axios client with JWT interceptor (baseURL: /api)
│       ├── components/
│       │   ├── Navbar.jsx        # Top navigation
│       │   ├── StatusTracker.jsx # Stage progress bar
│       │   ├── DemoSimulator.jsx # Live demo widget
│       │   ├── NotificationsBell.jsx # In-app notifications
│       │   └── Toast.jsx         # Toast provider
│       ├── context/
│       │   └── AuthContext.jsx   # JWT auth state
│       └── pages/              # 15 route pages
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── StaffConsole.jsx
│           ├── TimingsSetup.jsx
│           ├── SubmitLaundry.jsx
│           ├── TrackStatus.jsx
│           ├── ReportIssue.jsx
│           ├── Payments.jsx
│           ├── Invoice.jsx
│           ├── Reviews.jsx
│           ├── Profile.jsx
│           ├── Support.jsx
│           └── AdminPanel.jsx
│
├── server/                     # Express backend
│   ├── package.json
│   ├── .env.example
│   ├── .env                    # Local env (not committed)
│   └── src/
│       ├── index.js            # Entry point, mode detection, route mounting
│       ├── middleware/
│       │   └── auth.js         # JWT + role authorization
│       ├── models/             # 8 Mongoose schemas
│       │   ├── User.js
│       │   ├── LaundryBatch.js
│       │   ├── LaundryTimings.js
│       │   ├── Notification.js
│       │   ├── Payment.js
│       │   ├── Coupon.js
│       │   ├── Review.js
│       │   ├── Service.js
│       │   └── index.js        # Exports all models (mock/real adapter)
│       ├── mock/               # Demo mode infrastructure
│       │   ├── store.js        # In-memory Collection class (Mongoose-compatible)
│       │   ├── models.js       # Mock model wrappers
│       │   └── seed.js         # Seeds demo world (5 users, 2 schedules, 5 batches, etc.)
│       └── routes/             # 11 route modules
│           ├── auth.js          # Login, register, /me
│           ├── batches.js       # CRUD + status updates + issues
│           ├── timings.js       # Schedule publish/list/delete
│           ├── payments.js      # Pricing, processing, invoices, stats
│           ├── notifications.js # Notification bell data
│           ├── reviews.js       # Service reviews
│           ├── services.js      # Service tiers
│           ├── users.js         # User management
│           ├── admin.js         # Warden-only endpoints (analytics, users, services)
│           ├── demo.js          # Demo simulator engine (MOCK_MODE only)
│           └── support.js       # Contact form submissions → warden notifications
│
└── docs/                       # Research & deliverables
    ├── README.md               # Project spec
    ├── timeline.md             # Semester milestones
    ├── INSTALL.md              # This file
    ├── research/               # Raw research artifacts
    │   ├── interview-guide.md
    │   ├── survey-template.md
    │   ├── observations-log.md
    │   └── literature-review.md
    ├── design/                 # Personas, journey maps, failure points
    └── deliverables/           # Final report + presentation
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ECONNREFUSED` on API calls | Make sure the server is running (`npm run dev` in `server/`) |
| Login fails with demo account | Check that server shows `🎭 Running in DEMO MODE` on startup |
| Port 5000 already in use | Change `PORT=5000` to another port in `server/.env` |
| Port 5173 already in use | Run frontend with a different port: `npx vite --port 3000` |
| Styles look broken | Make sure `npm install` completed in both `client/` and `server/` |
| MongoDB connection error | Ensure `MOCK_MODE=true` in `server/.env` (this is the default) |
| Test command fails | Make sure `npm install` completed in `client/` (includes vitest) |

---

## Production Notes

- JWT secret is in `.env` — change it for real deployment; the server warns if the default placeholder is used in production mode
- The 5% tax rate is hardcoded in `server/src/routes/payments.js`
- Demo accounts are seeded only in `MOCK_MODE=true` — in production, users register as students only
- Staff/warden accounts must be created manually via MongoDB or an admin seed script
- Run tests: `cd client && npm test`
