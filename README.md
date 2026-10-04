# Laundry Roulette 🧺

**A Hostel Laundry Tracking & Accountability System**

> *Configure your hostel's schedule, submit laundry, track it through every stage, and get notified when it's ready — with built-in dispute resolution.*

---

## The Problem

Hostellers face three universal frustrations with campus laundry:

1. **Zero visibility** — "It's a black hole. You put clothes in, you get clothes out — maybe."
2. **Wasted trips** — 75% of students arrive to find clothes *not* ready
3. **Hopeless disputes** — 33% give up entirely when something goes wrong, with no evidence trail

This app was built from real research: **10 hosteller interviews, 24 survey responses, and 3 full laundry-cycle observations** across 5 hostel blocks.

## Key Features

### For Students
- **Submit batches** with item descriptions and size estimates
- **Track status** in real-time through 7 stages (Submitted → Received → Washing → Drying → Folding → Ready → Picked Up)
- **Get notified** when your batch is ready for pickup
- **Report issues** with a structured form — tied to your batch record, no more memory-vs-memory
- **View payment history** and download invoices
- **Leave reviews** for service quality

### For Staff
- **Block-specific schedules** — configure drop-off/pickup days and time windows
- **One-tap status updates** — advance batches through the pipeline
- **Dashboard** — see all active batches in your block at a glance
- **Issue management** — respond to disputes with a written resolution

### For Wardens
- **Admin panel** — view all batches across all blocks
- **Dispute resolution** — access all batch records and issue history

### Demo Mode
The app runs entirely in **mock mode** (no database needed). Just start the server and log in with pre-seeded demo accounts:

| Role | Email | Password |
|---|---|---|
| Student | `aarav@hostel.edu` | `demo123` |
| Student | `priya@hostel.edu` | `demo123` |
| Staff | `ramesh@hostel.edu` (B6 block) | `demo123` |
| Staff | `suresh@hostel.edu` (C3 block) | `demo123` |
| Warden | `meera@hostel.edu` | `demo123` |

A floating **Demo Simulator** widget (visible to student users) auto-advances batch stages in real-time so you can see the full lifecycle without manual staff input.

## Tech Stack

### Frontend
- **React 19** — component-based UI with hooks
- **Vite** — fast build tooling with HMR
- **Tailwind CSS** — utility-first styling
- **React Router v7** — client-side routing with role-based protected routes
- **Axios** — API client with JWT interceptor

### Backend
- **Express.js** — REST API with 10 route modules
- **JWT Authentication** — secure token-based auth with role-based middleware
- **MongoDB / Mongoose** — data models for 8 entities (User, Batch, Timings, Notification, Payment, Coupon, Review, Service)
- **In-memory Mock Store** — drop-in replacement for Mongoose that runs with `MOCK_MODE=true` (no MongoDB required for demo)

### Key Architectural Decisions
- **Mock mode by default** — run `npm run dev` in server and it works immediately, no DB setup
- **7-stage pipeline** — matches real observed laundry cycles
- **Custom schedules per block** — every hostel block has different days/times
- **Audit trail** — every status change is logged in `statusHistory` with timestamps

## Project Structure

```
laundry-roulette/
├── client/              # React + Vite frontend
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI (Navbar, StatusTracker, DemoSimulator, etc.)
│   │   ├── context/     # Auth context + provider
│   │   ├── lib/         # API client
│   │   ├── pages/       # 13 route pages
│   │   └── App.jsx      # Main app with role-based routing
│   ├── package.json
│   └── vite.config.js
│
├── server/              # Express backend
│   ├── src/
│   │   ├── models/      # 8 Mongoose schemas
│   │   ├── mock/        # In-memory store + seed data (demo mode)
│   │   ├── routes/      # 10 route modules
│   │   ├── middleware/  # JWT auth + role checks
│   │   └── index.js     # Server entry point
│   ├── .env.example
│   └── package.json
│
└── docs/                # Research & deliverables
    ├── design/          # Empathy map, journey map, failure points, idea log
    └── deliverables/    # Final report outline, presentation outline
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm (or yarn)

### Running the App (Demo Mode — No DB Required)

```bash
# Terminal 1 — Backend
cd server
cp .env.example .env
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with any demo account above.

### Running with a Real Database

```bash
# In server/.env:
MOCK_MODE=false
MONGODB_URI=your-mongodb-connection-string
```

Then run `npm run start` in the server directory.

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login + receive JWT |
| `/api/auth/me` | GET | Get current user |
| `/api/timings` | GET | List all published schedules |
| `/api/timings` | POST | Create/update schedule (staff) |
| `/api/batches` | GET | List batches (role-scoped) |
| `/api/batches` | POST | Submit a new batch |
| `/api/batches/:id` | GET | Batch detail view |
| `/api/batches/:id/status` | PATCH | Advance batch status |
| `/api/batches/:id/report-issue` | POST | Report an issue |
| `/api/batches/:id/resolve-issue` | POST | Resolve an issue (staff/warden) |
| `/api/payments` | GET | Payment history |
| `/api/reviews` | GET | Service reviews |
| `/api/admin/` | GET | Admin dashboard data |

## Research & Design

This project was built using a rigorous design process:

- **Research**: 10 hosteller interviews, 2 staff interviews, 1 warden interview, 24 survey responses, 3 laundry-cycle observations
- **Synthesis**: Personas, empathy maps, user journey maps, 14 failure points documented
- **Ideation**: 18 ideas screened against a weighted matrix (Impact ×5, Feasibility ×4, Desire ×3, Novelty ×2, Scope ×3)
- **Validation**: Usability testing with 6 hostellers (100% completion on 3/4 tasks, 4.3/5 ease-of-use rating)

See the `docs/` directory for full research artifacts.

---

*Built by students, for students. No more black holes.*
