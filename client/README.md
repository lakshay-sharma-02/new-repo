# Laundry Roulette — Client

React 19 + Vite frontend for **Laundry Roulette**, a hostel laundry tracking and
accountability system. See the [root README](../README.md) for the product story,
research, and architecture.

## Running

The client expects the API on `http://localhost:5000` (proxied via `/api`), so start
the server first:

```bash
cd ../server && npm install && npm run dev
```

Then, in this directory:

```bash
npm install
npm run dev        # http://localhost:5173
```

Log in with any seeded demo account, e.g. `aarav@hostel.edu` / `demo123`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR and `/api` proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest smoke tests |
| `npm run lint` | Lint with Oxlint |

## Layout

```
src/
├── components/   # Navbar, StatusTracker, DemoSimulator, NotificationsBell, Toast
├── context/      # Auth context + provider
├── lib/          # Axios client with JWT interceptor
├── pages/        # Route pages (student, staff, warden)
├── App.jsx       # Role-based routing
└── index.css     # Tailwind base + design system
```

Styling is Tailwind CSS v4 with a dark design system defined in `src/index.css`;
reusable classes (`card`, `btn-primary`, `field`, `badge`) live there rather than
being repeated per component.
