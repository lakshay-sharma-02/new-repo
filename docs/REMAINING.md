# What's left to call Laundry Roulette “complete”

**Last updated:** 16 November 2026
**Current state:** demo-complete; pilot deployment and Phase 2 hardening are still in progress.
This file is the short, honest checklist. The detailed audit is in
[`deliverables/production-readiness-plan.md`](deliverables/production-readiness-plan.md) §14.

---

## What is done and verified

| Area | Status |
|---|---|
| P0 defects (broken pages, pricing, password handling, API contracts) | Fixed and verified |
| P1 domain/security work (auth, checkout, lifecycle, schedules, support, invoices) | Complete in mock/demo mode |
| API test suite | 17/17 passing (`cd server && npm test`) |
| Client build / tests / lint | Build passes, 4/4 tests, 0 lint errors (32 warnings) |
| Dependency audit | No critical/high server advisories; 2 moderate `qs` advisories remain |
| Production-shaped smoke test | SPA + `/api/health` + JSON 404s verified with `SERVE_CLIENT=true` |
| Deployment foundation | Dockerfile, Compose, CI workflow, health check, pino logs, indexes, warden seeding |

**Not verified yet:** the real-MongoDB path, Docker image build, the GitHub Actions
workflow on GitHub, and actual email delivery. Do not mark those as done until
they have run successfully.

---

## Definition of “complete”

### Level 1 — capstone-complete (public, demoable, real data)

- [ ] Public HTTPS deployment, reachable without running anything locally
- [ ] Real MongoDB (managed), `MOCK_MODE=false`, warden seeded, demo seed **not** loaded
- [ ] Verification/reset email delivered (or verification temporarily disabled and documented)
- [ ] Deployed smoke test passes: login → submit → track → staff advance → invoice
- [ ] Secrets set in the host, `.env` never committed, demo endpoints unavailable
- [ ] CI green on the pushed commit
- [ ] README and deployment instructions match the deployed topology

### Level 2 — production-complete (one hostel, real users)

Everything in Level 1, plus:

- [ ] Email verification, password reset, ready/issue notifications
- [ ] Automated backups **and a restore drill**
- [ ] Error tracking and an external uptime monitor with alerts
- [ ] Payment gateway/webhooks, or an explicit “pay at the counter” scope decision
- [ ] Real-Mongo integration tests and a pilot-volume load test
- [ ] Indexed, paginated list queries (routes currently load whole collections)
- [ ] Remaining auth residuals: access-token revocation, multi-tab refresh race, coupon race
- [ ] Shared rate-limit store, CSRF token, secret manager/rotation
- [ ] Accessibility/Lighthouse pass and browser E2E coverage
- [ ] Client dependency audit and the two moderate `qs` advisories resolved
- [ ] Data retention, audit-log viewer and support SLA decided

---

## Deployment decision: Render + Vercel (or one Render service)

The goal is a public demo without running Docker locally.

### Recommended: one Render web service + managed MongoDB

- The existing Express app serves the built SPA (`SERVE_CLIENT=true`), so the
  browser sees **one origin**. Refresh cookies and CORS stay simple.
- Render can build the existing `Dockerfile` remotely, or run the monorepo
  natively (`client` build + `server` start). Nothing builds on this machine.
- The Dockerfile is optional at runtime; keeping it costs nothing and gives a
  reproducible build. Do **not** run `docker compose` locally unless you want to.
- One service + one database is the fewest moving parts for a capstone.

### If you want Vercel for the frontend

- Keep the API on Render and proxy `/api/*` through a Vercel rewrite. The
  browser still calls the Vercel origin, so cookies remain first-party.
- Do **not** set `VITE_API_BASE_URL` directly to the Render domain unless you
  accept cross-site cookies (`SameSite=None; Secure`), which some browsers
  block. That path is fragile and is not recommended.
- A Vercel rewrite needs the final Render URL, so it is a post-deploy step.

### Deployment checklist

- [ ] Create a managed MongoDB database; save the connection string
- [ ] Create the Render web service from this repo
- [ ] Set `NODE_ENV=production`, `MOCK_MODE=false`, `MONGODB_URI`, `JWT_SECRET`,
      `SERVE_CLIENT=true`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax`
- [ ] Deploy and wait for `GET /api/health` to return 200
- [ ] Run `npm run seed:warden` once against the real database
- [ ] Create staff accounts and publish schedules through the app
- [ ] Smoke-test the five core flows on the public URL
- [ ] Optional: add the Vercel frontend + `/api` rewrite, then retest cookies
- [ ] Record the deployed URLs and environment in the README

> Verify Render/Vercel plan limits and MongoDB network-access rules before
> committing to them. The service catalog did not contain a container-host or
> managed-MongoDB option, so those vendor choices still need a manual check.

---

## Remaining work, in order

### 1. Ship the pilot (Level 1)

- [ ] Choose the topology above and deploy
- [ ] Real Mongo: verify unique indexes, TTL cleanup, coupon reservation and
      idempotency constraints
- [ ] Turn off dev-only token responses and demo mode in production
- [ ] Confirm CI is green on GitHub (the workflow has not run yet)
- [ ] Build the Docker image once on the host, or delete the Docker path if the
      native Render build is chosen

### 2. Close the trust gaps

- [ ] Email provider + templates for verification, reset, ready and issue alerts
- [ ] Email-verification UI (backend endpoints already exist)
- [ ] Set `REQUIRE_VERIFIED_EMAIL=true` once delivery works
- [ ] Access-token revocation (15-minute window remains)
- [ ] Multi-tab refresh race and coupon one-per-user race
- [ ] Shared rate-limit store; CSRF token; secret rotation

### 3. Make it operable

- [ ] Error tracking (e.g. Sentry-class) and external uptime alerts
- [ ] Managed backups + documented restore drill
- [ ] Confirm log retention and request-id correlation on the host
- [ ] Load test the main endpoints; fix what falls over

### 4. Finish the data/UX work

- [ ] Replace full-collection reads with indexed, paginated queries
- [ ] Browser E2E: login → submit → track → staff console → invoice
- [ ] Accessibility/Lighthouse pass; reduce the 32 lint warnings
- [ ] Client dependency audit; resolve remaining `qs` advisories

### 5. Decide what is out of scope

- [ ] Payment gateway vs. pay-at-counter
- [ ] PDF invoices vs. print HTML
- [ ] SMS/WhatsApp alerts vs. in-app only
- [ ] Audit-log viewer, dispute thread, photo evidence, QR pickup

---

## Do not claim “production-ready” until

1. The deployed URL has passed the smoke test against a real database.
2. Email verification/reset actually delivers.
3. Backups have been restored once successfully.
4. Someone is alerted when the service is down.
5. The remaining §14 gaps are either fixed or explicitly accepted in writing.

Until then, the accurate description is: **validated capstone demo with a
working productionisation plan**, not a production system.
