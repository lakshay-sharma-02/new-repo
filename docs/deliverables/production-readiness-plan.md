# Laundry Roulette — Production Readiness Assessment & Roadmap

**Prepared:** 16 November 2026
**Scope:** full repository review — `client/` (React 19 + Vite), `server/` (Express + Mongoose/in-memory mock), `docs/`
**Purpose:** identify what is missing or ill-built, and define a realistic path from "impressive capstone demo" to "production-ready pilot".

---

## 0. Verdict up front

| Level | Status | Meaning |
|---|---|---|
| **Demo-ready** | ⚠️ Almost — 5 pages currently 404 | The core student/staff flow works; Payments, Invoice, Reviews, Profile activity and the **entire Admin panel** are broken by a URL bug (fixable in under an hour). |
| **Pilot-ready** (one hostel, real users) | ❌ No | Payments are simulated, no email/SMS, no validation/rate limits, no audit trail of *who* changed a status, no automated tests for business logic, no deployment story. |
| **Production-ready** | ❌ No | Missing security hardening, data integrity, observability, backups, CI/CD, accessibility, and compliance basics. |

The product idea, information architecture, role model and UI craft are genuinely strong for a capstone. The gap is not design — it is **correctness, security, and operational maturity**.

> Recommended framing for faculty: *"We have a validated prototype with a working end-to-end demo. This document is our productionisation plan — here is exactly what is broken, what it costs to fix, and in what order."* That is a stronger story than claiming it is already production-ready.

> **Phase 0 status (16 Nov 2026): complete.** The five P0 defects in §3, the `/api/users` serialiser bug (P1-1) and the reviews response contract (P1-2) are fixed and verified against a live mock-mode server. Sections 3–4 are kept as the audit record; the remaining P1/P2 items are still open.
>
> **Phase 1 status (16 Nov 2026): complete in the mock/demo runtime.** Server-authoritative pricing and a single checkout endpoint with idempotency; zod validation and central error handling; short-lived access tokens with rotating refresh cookies, revocation, reset and verification flows; role/block scoping; forward-only status machine with actor history and warden override; schedule/ETA enforcement; soft deletion and last-warden guards; support tickets routed to wardens; invoice HTML escaping. `server/test/api.test.js` covers the rules (17 tests) and the client builds, tests and lints clean. **Not yet verified:** the real-Mongo path (no database available here) and actual email delivery (tokens are logged and returned only outside production). Both are Phase 2 work.
>
> **Phase 2 status (16 Nov 2026): started.** Added a multi-stage Dockerfile, Compose stack with MongoDB, `SERVE_CLIENT` single-process SPA serving, fail-fast config for client builds/cookies, structured pino logging with redaction, health readiness, DB indexes, a real-DB `seed:warden` script, `VITE_API_BASE_URL`, `.nvmrc`/engines and a GitHub Actions CI workflow. Critical/high server advisories were fixed; two moderate `qs` advisories remain through Express 4. The image and CI workflow have **not been executed** yet. See §14 for the full gap register and the rest of Phase 2.

---

## 1. What was reviewed and how

- Read every source file in `client/src` (15 pages, 5 components, auth context, API client) and `server/src` (11 route modules, 8 Mongoose models, mock store/seed, auth middleware).
- Read the research, design and deliverable docs to compare **claims vs implementation**.
- Ran the real toolchain: production build, test suite, linter.
- Started the server in mock mode and probed the API with authenticated requests to confirm suspected bugs (evidence in §12).

### Health snapshot

| Check | Command | Result |
|---|---|---|
| Production build | `cd client && npm run build` | ✅ Passes — 99 modules, 433 kB JS (122 kB gzip), 61 kB CSS |
| Client tests | `cd client && npm test` | ✅ 4/4 pass — but they only assert that modules import and that a hard-coded array has 7 items. **Zero business logic is covered.** |
| Lint | `cd client && npm run lint` | ✅ 0 errors, **34 warnings** (setState-in-effect, unused vars, missing deps) |
| Server tests | — | ❌ No test script, no test files, no supertest/jest/vitest |
| Type checking | — | ❌ Plain JS, no JSDoc types, no `tsc --checkJs` |
| API smoke tests | see §12 | ❌ 5 confirmed defects (below) |

---

## 2. What is well built (keep this)

1. **Clear domain model.** Batch → 7-stage lifecycle, per-block schedule, notifications, payments, reviews, coupons. It maps to the research rather than to a generic CRUD tutorial.
2. **Server-side authorization, not just UI hiding.** `authenticate` + `requireRole` on every sensitive route; staff scoped to their block; students only mark *their own* batch picked up. This is better than most capstones.
3. **Audit trail concept.** `statusHistory` with timestamps is the right primitive for the "memory-vs-memory" problem.
4. **Mock-mode architecture.** Being able to demo without MongoDB is a real strength for evaluation and CI.
5. **Design system.** Consistent tokens, glass surfaces, skeletons, toasts, empty states, reduced-friction quick-fill logins. The UI looks like a product, not a class assignment.
6. **Documentation depth.** Research artefacts, personas, failure points, demo script and report are unusually thorough.

Everything below is about closing the gap between that foundation and a system you can put real students' laundry through.

---

## 3. P0 — Demo-blocking defects (verified)

These five are confirmed against a running server. Four of them will be visible during a faculty demo if the script follows `docs/DEMO.md`.

### P0-1. Doubled `/api` prefix breaks 5 pages / 18 requests
**Where:** `client/src/pages/Payments.jsx:30`, `Invoice.jsx:22`, `Reviews.jsx:42,54,78`, `Profile.jsx:72,88,115`, `AdminPanel.jsx:56,69,82,96,99,128,140,158,173,184`
**Cause:** `api` already has `baseURL: "/api"`, but these pages call `api.get("/api/...")`. Axios concatenates → `/api/api/...`.
**Verified:** `GET /api/api/payments` → **404**.
**Impact:** payment history, invoice, review submission and stats, profile order history, and **all four Admin tabs** fail. The warden demo step in `DEMO.md` (Step 5 in `INSTALL.md`, admin analytics) cannot work today.
**Fix:** strip the leading `/api` from those 18 call sites (or set `baseURL: ""` and prefix everywhere — do not mix). **~30 min**, then click through all five pages.

### P0-2. XL / "extra-large" laundry is priced at ₹0
**Where:** `server/src/models/Service.js` `priceFor`, `server/src/mock/models.js` `priceFor`, `client/src/pages/SubmitLaundry.jsx` `SIZES`
**Cause:** `priceFor` builds `price` + Capitalised first letter + lowercase rest → `"xl"` becomes `priceXl`, but the schema field is `priceXL`. `"extra-large"` becomes `priceExtra-large`. Both are `undefined → 0`.
**Verified:** `POST /api/payments/calculate {"itemEstimate":"xl"}` → `{"subtotal":0,"total":0}`; same for `extra-large`.
**Impact:** free laundry; also `"extra-large"` is not in the Payment item enum (`small|medium|large|xl`), so in real MongoDB mode payment creation fails validation.
**Fix:** map size → price explicitly (`{small: priceSmall, ..., xl: priceXL}`), normalise `extra-large → xl` on both client and server, and reject unknown sizes. **~40 min.**

### P0-3. Changing your password locks you out (mock mode)
**Where:** `server/src/routes/users.js:110`, `server/src/mock/models.js`, `server/src/mock/store.js`
**Cause:** the route assigns `user.password = newPassword` and calls `save()`. In Mongoose, the `pre("save")` hook hashes it. The mock model has **no hash-on-save hook**, so plaintext is stored; then `bcrypt.compare(candidate, plaintext)` always fails.
**Verified:** change password → success; login with the **new** password → **401**; login with the **old** password → **401**. Account permanently locked until server restart.
**Fix:** hash in `MockUser` save path (or in the route, shared by both modes), and validate `newPassword` exists/length before use (currently `newPassword.length` throws a 500 if omitted). **~30 min.**

### P0-4. Password hashes leaked in auth responses (mock mode)
**Where:** `server/src/routes/auth.js` (`/register`, `/login`), `server/src/mock/models.js`
**Cause:** real Mongoose `toJSON` deletes `password`; the mock user object is serialised as-is.
**Verified:** login response contains `"password":"$2a$10$lJH..."`.
**Impact:** the demo mode (the one you present) exposes bcrypt hashes; the same pattern means any future mock-only route can leak fields. `GET /auth/me` too.
**Fix:** central `sanitizeUser()` used by every route; add a test asserting no `password` key. **~20 min.**

### P0-5. Payment amount is trusted from the client
**Where:** `server/src/routes/payments.js` `POST /process`
**Cause:** takes `amount` and `breakdown` straight from the request body and marks the payment successful.
**Verified:** `POST /api/payments/process {"amount":1,...}` → `201 success`, a ₹1 payment for any batch.
**Impact:** total loss of pricing integrity; coupons/usage limits also bypassed (see P1-3).
**Fix:** recompute price server-side from the batch/service/coupon; treat the client total as display-only. Do this before any real payment gateway. **~2–4 h** (or half a day with idempotency, see P1-4).

> **Do these five before tomorrow's demo.** They are all small, local, and testable by clicking. Fixing P0-1 alone restores two whole demo sections.

---

## 4. P1 — Correctness and security defects

### P1-1. `/api/users` returns empty user objects in mock mode
**Where:** `server/src/routes/users.js:32` — `{ ...u._doc, ... }`
**Cause:** mock docs have no `_doc`. Spreading `undefined` yields only the computed fields.
**Verified:** response contains `[{"batchCount":3,"completedCount":1,"totalSpent":776}, ...]` — no names, emails, roles; `byRole` is `{student:0,staff:0,warden:0}`.
**Fix:** one `toPlain(doc)` helper (`doc._doc ?? doc`), already present in `payments.js` — extract it to `server/src/lib/serialize.js` and reuse everywhere. **~15 min.**

### P1-2. Reviews page expects a different response shape
**Where:** `client/src/pages/Reviews.jsx` vs `server/src/routes/reviews.js GET /`
**Cause:** client reads `data.average` / `data.total`; API returns `averageRating` / `totalReviews`. `/reviews/stats` (which returns `average`/`total`) is never called.
**Impact:** once P0-1 is fixed, the rating summary shows **0.0** and "undefined reviews".
**Fix:** pick one contract (recommend the `/stats` shape) and align; add a response-shape test. **~30 min.**

### P1-3. Coupons are validated but never consumed
**Where:** `payments.js` calculate/process; `Coupon` model
**Cause:** `usedCount` is never incremented, no per-user limit, no re-validation at process time.
**Impact:** unlimited reuse; `usageLimit` is decorative.
**Fix:** validate + increment atomically at checkout, store the coupon snapshot, enforce per-user redemption. **~3 h.**

### P1-4. Batch creation and payment are not atomic
**Where:** `client/src/pages/SubmitLaundry.jsx` `handleComplete`
**Cause:** client creates the batch, then calls `/payments/process`. If step 2 fails, an unpaid batch already exists.
**Impact:** orphan batches, no reliable "unpaid" state, double-submit on retry.
**Fix:** one `POST /api/checkout` endpoint that prices, validates, creates the batch and payment in a transaction (MongoDB session) with an idempotency key; client sends only the cart. **~1 day.**

### P1-5. Any status transition is accepted
**Where:** `server/src/routes/batches.js` (`ORDER.includes(status)` only)
**Cause:** no adjacency check; staff can jump `submitted → picked_up` or move backwards. The history then records a fictional pipeline.
**Impact:** destroys the credibility of the tracker — the app's core promise.
**Fix:** explicit state machine (`allowedNext[status]`), 409 on invalid transition, admin-only override with a mandatory note. **~4 h.**

### P1-6. The audit trail does not record *who* did anything
**Where:** `statusHistory` schema, issue resolution, admin actions
**Cause:** entries store `status`, `note`, `updatedAt` — no actor; `note` is never populated from the UI.
**Impact:** "accountability" is the product's thesis, but a dispute cannot show which staff member advanced the batch.
**Fix:** add `by` (user id + name snapshot), `reason`, and surface it in the timeline; same for issue responses and admin overrides. **~4 h.**

### P1-7. The published schedule is not enforced
**Where:** `POST /api/batches`, `timings.cutoffTime`
**Cause:** submission never checks laundry days, drop-off window, or cut-off; `cutoffTime` is stored and displayed but used nowhere.
**Impact:** a student can submit on a non-laundry day at 2 a.m.; `estimatedReady` is a rough guess, not derived from the cut-off.
**Fix:** enforce day/window/cut-off (with a documented "late drop" flag), compute ETA from the next valid cycle, and show the rule in the error message. **~6 h.**

### P1-8. Support tickets go to the person who sent them
**Where:** `server/src/routes/support.js`
**Cause:** creates `Notification.create({ user: req.user.id, ... })` — the comment says wardens. No ticket entity, no status, no assignment, name/email fields from the form are ignored.
**Impact:** support is a black hole; `/support` is a public page but its API requires auth, so logged-out visitors get a 401 after filling the form.
**Fix:** `SupportTicket` model (`open/in_progress/resolved`, requester, subject, messages), notify wardens, admin queue, optional email; make the public route read-only or allow guest tickets. **~1 day.**

### P1-9. Deleting a user leaves orphaned data; admin can demote the last warden
**Where:** `server/src/routes/users.js DELETE`, `server/src/routes/admin.js PATCH/DELETE`
**Cause:** the comment says "Cascade", the code performs a read and then deletes only the user. `admin.js` has no self/last-warden guard and no block normalisation (only `users.js` does).
**Impact:** batches/payments/reviews with dangling `user` ids; analytics and invoices show "—"; possible lockout of the admin role.
**Fix:** shared `deleteUserCascade()` (soft-delete + anonymise financial records; never hard-delete payments), guard last warden and self-demotion, normalise block. **~4 h.**

### P1-10. Stored XSS in the invoice print window
**Where:** `client/src/pages/Invoice.jsx` `handleDownload`
**Cause:** `studentName`, `batch.description`, item types and coupon code are interpolated raw into an HTML string written to `window.open("", "_blank")`. `about:blank` inherits the opener's origin.
**Impact:** a user-controlled name such as `<img src=x onerror=...>` executes with access to the app's origin and `localStorage` token.
**Fix:** escape all interpolated values (or build the DOM with `textContent`); do not use `document.write`; generate a real PDF server-side. **~2 h.**

### P1-11. Admin surface inconsistencies
- `DELETE /api/admin/services/:id` allows deleting the **default** tier; `/api/services/:id` blocks it. (15 min)
- `POST /api/admin/services` accepts prices without numeric/positive validation.
- Admin "Open issues" KPI is computed from `issuesByDay` (issues *reported* per day), not open issues. (30 min)
- `PATCH /api/admin/users/:id` can change your own role or demote the only warden.
**Fix:** one service layer, one set of invariants, used by both namespaces. **~3 h.**

### P1-12. Auth hardening missing
- JWT in `localStorage` (XSS-exfiltratable), 7-day lifetime, no refresh, no revocation, logout is client-only.
- No rate limiting on login/register/support (credential stuffing, spam).
- `cors()` allows every origin; no `helmet`, no body-size limit, no `trust proxy`.
- No email verification, no password reset, no account lockout, password minimum is 6 with no complexity policy.
- Errors return raw `err.message` (Mongoose internals) to clients; no central error handler, no request ids, no structured logs.
- Mock-mode email lookup is case-sensitive, so `Aarav@…` cannot log in, while real Mongo lowercases.
**Fix:** see Phase 1. **~5–7 dev-days.**

### P1-13. Validation is ad-hoc and inconsistent
No schema validation library. Examples: `issueDescription` unbounded; review comments unlimited in the API (model caps at 1000); `hostelBlock` accepted as arbitrary string with different normalisation in different routes; `turnaroundDays` not range-checked in the mock path; missing `newPassword` throws.
**Fix:** zod (or express-validator) schemas per route + shared block/status enums. **~3 days.**

---

## 5. P2 — Architecture, scale and quality issues

| # | Issue | Why it matters | Effort |
|---|---|---|---|
| P2-1 | **Mock and real models behave differently** | Root cause of P0-2/3/4 and P1-1. Two implementations = two products. Fix: one service layer + contract tests run against both (or use `mongodb-memory-server`). | 2–3 d |
| P2-2 | **Queries fetch whole collections and filter in JS** (`LaundryBatch.find({})`, `User.find({})`, analytics) | Indexes are unused; O(n) memory per request; collapses at a few thousand batches. | 2–3 d |
| P2-3 | **N+1 lookups** (payments list, users list, batch owner names) | 20 payments → 21 queries. Use aggregation/`populate`. | 1–2 d |
| P2-4 | **No pagination / server-side filtering** on batches, payments, admin users | Response growth and slow UI. | 1 d |
| P2-5 | **Duplicated domain constants** (`ORDER`/`LABELS` in 3 server + 4 client files) | Adding a stage requires 7 coordinated edits; drift already exists (`META` misses `submitted`). | 4 h |
| P2-6 | **Fat route handlers** — pricing, notifications, permissions, transitions all inline | Hard to test, easy to diverge; extract `pricing`, `lifecycle`, `notifications`, `access` services. | 3–4 d |
| P2-7 | **UI polls every 3–5 s** (`Dashboard`, `StaffConsole`, `TrackStatus`, notifications bell) | 20 students × 4 s polls = constant load; no push. Move to SSE (simple) or WebSocket, keep polling as fallback. | 2–3 d |
| P2-8 | **Demo simulator always mounted for students** | In live mode it fires 404s and shows a dead widget. Gate on a server-provided `demoMode` flag; hide demo logins too. | 1 h |
| P2-9 | **No request/error logging, health only reports mode** | Cannot debug production. Add pino + request ids, `/health` with DB readiness, graceful shutdown, `unhandledRejection` handlers. | 1 d |
| P2-10 | **No CI/CD, Dockerfile, or env-based API URL** | `baseURL: "/api"` only works behind the Vite dev proxy. Production needs same-origin serving or `VITE_API_BASE_URL`. | 2 d |
| P2-11 | **Tests are decorative** | 4 tests assert that modules import. Add API integration tests for auth, role scoping, pricing, transitions, coupons; component tests for critical forms. Target 60%+ on services. | 5–7 d |
| P2-12 | **Accessibility gaps** | Emoji-only buttons without labels, no `aria-live` on toasts, dropdown without menu semantics/focus trap/Escape, `details` arrow static, no skip link, low-contrast body text (`#5d6577` on `#05060a`), keyboard testing absent. | 2–3 d |
| P2-13 | **Docs overclaim** | `vitest.config.js` referenced but absent; README says "download invoices" and shows a QR that is a text box + `window.print()`; route counts inconsistent; API table omits ~15 endpoints. Faculty will probe this. | 2 h |
| P2-14 | **No product analytics or audit log viewer** | Cannot answer "did usage improve?" or "who resolved this?". Add event log + admin viewer. | 2 d |
| P2-15 | **No email/SMS/push** | Notifications exist only while the app is open and polling. A ready-for-pickup alert that requires the user to be looking at the app misses the core job-to-be-done. | 3–5 d |
| P2-16 | **No PWA/offline, no i18n** | Campus wifi is unreliable; Hindi/Marathi labels likely needed. | 2–4 d |
| P2-17 | **Repo hygiene** | No `engines`, no `.nvmrc`, no LICENSE, no CONTRIBUTING, no PR template, `client/README.md` is the Vite template, logs present locally, no `npm audit` in CI. | 4 h |

---

## 6. Feature roadmap (what to add, and when)

### Tier 1 — Cheap, high perceived value (do during hardening)
1. **Photo evidence on issues** — 1–3 images per report (S3/Cloudinary/local disk), shown to staff and warden. Directly answers research Finding 4 ("I can't prove what was in a bag"). *2–3 d.*
2. **Real QR pickup code** — one-time code per batch, staff scan/enter to confirm handover. Replaces the fake QR box. *2 d.*
3. **Real PDF invoices** — server-generated, immutable, downloadable. Removes the XSS + "print is not PDF" problem. *1–2 d.*
4. **Overdue / SLA alerts** — flag batches past `estimatedReady`, notify staff, show a red badge. Uses existing data. *1–2 d.*
5. **Status change notes** — the `note` field already exists in the schema; expose it in the staff console with preset reasons. *4 h.*
6. **Admin audit log viewer** — filter by actor/batch/date. *1 d.*
7. **CSV export** for payments and batches. *4 h.*
8. **Demo/live mode banner + hidden demo logins** in live mode. *2 h.*
9. **Email notifications** (ready-for-pickup, issue resolved, password reset). *2–3 d.*
10. **In-app dispute thread** instead of a single response field. *2 d.*

### Tier 2 — Pilot requirements (one hostel, real money)
11. **Real payment gateway** (UPI/cards/refunds/webhooks) + reconciliation. *1–2 w.*
12. **Account lifecycle**: email verification, password reset, session list/revoke. *3–5 d.*
13. **Capacity & scheduling**: max batches per slot/day, machine slots, waitlist, block closure/holidays. *1 w.*
14. **Role/permission matrix** instead of three hard-coded roles (e.g., supervisor read-only, warden finance-only). *3–4 d.*
15. **Multi-tenant structure** (institution → hostel → block → service) if this is ever used beyond one campus. *2 w.*
16. **Admin service/coupon management** consolidation, with audit + soft delete. *3 d.*
17. **SLA dashboard**: turnaround percentiles, damage rate by block, repeat-issue detection. *3–4 d.*

### Tier 3 — Differentiators (post-pilot)
18. **WhatsApp notifications** (dominant channel for Indian campuses).
19. **PWA + offline queue** for submissions in poor connectivity.
20. **Weight-based or item-count pricing** with photo-assisted counting.
21. **Smart locker / QR bag-tag integration.**
22. **Demand forecasting** to smooth peak laundry days (the #5 failure point).
23. **Loyalty/referral + semester pass subscription.**
24. **SSO with college email / OTP login.**
25. **Accessibility + Hindi localisation.**

> Sequencing rule: **do not add features until P0/P1 are closed.** Every new feature multiplies the untested surface.

---

## 7. The plan

### Phase 0 — Before tomorrow's demo (≈2–3 hours)
Frozen scope, surgical fixes, rehearse twice.

| Step | Action | Time | Done when |
|---|---|---|---|
| 0.1 | Fix the 18 doubled `/api` paths | 30 m | Payments, Invoice, Reviews, Profile history, all 4 Admin tabs load |
| 0.2 | Fix XL/extra-large pricing (server ×2 + client normalise) | 40 m | "View price" shows ₹350 for XL; process rejects unknown size |
| 0.3 | Strip `password` from register/login/me responses | 20 m | Network tab shows no `password` key |
| 0.4 | Fix password change in mock mode | 30 m | Change → logout → login with new password works |
| 0.5 | Fix `/api/users` (`u._doc`) and `/reviews` contract | 20 m | Staff list shows names/roles; Reviews summary is non-zero |
| 0.6 | Restart server to reseed, run `npm run build` + `npm test` | 10 m | Both green |
| 0.7 | Rehearse `docs/DEMO.md` end-to-end, twice; keep screenshots as fallback | 30 m | All six steps pass without a hitch |

**Demo guardrails:** do not live-demo a ₹0 XL quote, a refund, or a status jump. If asked "is this real payment?" say: *"Payments are simulated in this build; the production plan specifies a gateway, server-side pricing and idempotency — see the roadmap."*

### Phase 1 — Correctness & security hardening (Week 1–2, ≈10 dev-days)

1. **Single source of truth for domain rules** — shared enums, state machine, pricing service, access service. (2 d)
2. **Validation layer** — zod schemas for every route, response serialisers, central error handler with request ids. (2 d)
3. **Auth hardening** — 8+ password policy, rate limits, helmet, CORS allowlist, body limits, refresh tokens or httpOnly cookies, revocation, reset flow, email verification, `npm audit` gate. (3 d)
4. **Data integrity** — atomic checkout + idempotency, coupon consumption, soft delete/cascade, last-warden guard, actor in history. (2 d)
5. **Schedule enforcement + ETA calculation** from cut-off/day. (1 d)
6. **Contract tests for mock vs real** — same suite, plus auth/role-scoping/pricing/transition integration tests. (2 d — overlaps with 1–4)

**Acceptance:** a written test list of every role × endpoint; all P0/P1 closed; `npm test` covers ≥60% of service logic; no secrets in responses.

### Phase 2 — Deployable pilot (Week 3–4, ≈8 dev-days)

1. **Config & deployment**: `VITE_API_BASE_URL`, same-origin static serving, Dockerfile, `.env.example` complete, fail-fast config validation, `engines`, `.nvmrc`. (2 d)
2. **Observability**: pino logs, `/health` with DB readiness, error tracking, uptime probe, graceful shutdown. (1 d)
3. **CI/CD**: GitHub Actions — install, lint, test, build, audit, deploy preview. (1 d)
4. **Managed MongoDB + backups + restore drill**, indexes for real query patterns, pagination. (2 d)
5. **Email notifications** + templates (ready, issue resolved, reset). (1 d)
6. **Accessibility pass + Lighthouse ≥90** on key pages, keyboard-only run-through. (1 d)

**Acceptance:** one-command deploy; anonymous uptime check; restore from backup demonstrated; seeded production data script; a staff member can run a full cycle with no developer present.

### Phase 3 — Feature build (Week 5–8+)
Deliver Tier 1 first (photo evidence, QR pickup, PDF invoices, SLA alerts, audit viewer, dispute thread, demo gating), then Tier 2 as the pilot demands.

### Roles if this is a 3-person team
- **Backend/Data:** services, state machine, checkout, validation, DB indexes, tests.
- **Frontend/UX:** API prefix fixes, response contracts, accessibility, empty/error states, Tier 1 UI.
- **QA/DevOps:** CI, deploy, monitoring, backups, test matrix, demo rehearsal, docs accuracy.

---

## 8. Target production architecture

```
Browser (React/Vite build)
   │  HTTPS
   ▼
Reverse proxy / platform (TLS, gzip, rate limit, static assets)
   ├── /            → client/dist (immutable, hashed assets)
   └── /api         → Express (2+ instances, stateless JWT)
                        ├── MongoDB (replica set, daily backups, PITR)
                        ├── Object storage (issue photos, signed URLs)
                        ├── Email/notification provider (queued, retried)
                        └── Payment gateway (webhooks + reconciliation job)
Observability: structured logs → hosted log drain; error tracker; uptime probe; alert on 5xx/latency
```

**Non-negotiables:** server-side pricing, idempotent checkout, HTTPS-only, secret manager (never `.env` in git), least-privilege DB user, nightly backups with tested restore, audit log retention.

### Stack research notes
I checked an integration catalog for the pieces you'll need. Results were mixed, so treat these as **research items to verify pricing/terms**, not final decisions:

| Need | Finding |
|---|---|
| App hosting | **Hostinger** is a catalog match for low-cost Node-capable hosting with domain + SSL; it is traditional hosting, not git-push PaaS — expect more manual ops. Alternative to evaluate: Render/Railway/Fly for git-based deploys. |
| Managed MongoDB | No managed-MongoDB option in the catalog. Evaluate **MongoDB Atlas** (free/shared tier, backups) or self-managed Mongo on a VPS **with a tested backup job** — do not run a pilot without backups. |
| Payments (India, UPI/cards/refunds/webhooks) | No gateway in the catalog. Evaluate a UPI-first Indian gateway; the architecture requirement is non-negotiable: **server-side amount, signed webhook verification, idempotency key, refund records.** |
| Email | **Knock** is the catalog match — but it orchestrates notifications and still needs an email provider connected (e.g., SendGrid/Postmark). For a capstone, a direct transactional-email API may be simpler; pick one and add retries. |
| Error monitoring / uptime | No catalog match. Evaluate a free error-tracking tier plus an external uptime probe; at minimum, log 5xx with request ids and alert by email. |

---

## 9. Definition of "production ready" (release checklist)

**Security**
- [ ] No secrets in the repo; env validated at boot; strong JWT secret rotated
- [ ] Rate limits on auth/support/checkout; helmet; CORS allowlist; body size caps
- [ ] Password policy, reset flow, email verification, session revocation
- [ ] Every route has a validation schema and an authorization test
- [ ] No PII/hashes in any response; no raw HTML interpolation (invoice XSS fixed)
- [ ] `npm audit` clean or documented exceptions

**Correctness**
- [ ] One pricing implementation, server-authoritative, integer paise
- [ ] State machine enforced; every transition records actor + reason
- [ ] Checkout is atomic and idempotent; coupons consumed exactly once
- [ ] Schedule/cut-off enforced; ETA derived from the real cycle
- [ ] Cascade/soft-delete verified; last-warden guard
- [ ] Mock and real modes pass the same contract tests

**Operations**
- [ ] One-command deploy; rollback documented
- [ ] Health/readiness endpoints; structured logs; error tracking; uptime alert
- [ ] Backups scheduled **and restore tested**
- [ ] Indexes match queries; pagination everywhere; no whole-collection scans
- [ ] Load test at 10× expected pilot traffic

**Quality**
- [ ] ≥60% coverage on services/routes; CI blocks on red
- [ ] Keyboard-only + screen-reader pass; Lighthouse ≥90
- [ ] Error/empty/loading states on every page
- [ ] Docs match reality (routes, scripts, features, screenshots)

**Product**
- [ ] Real notifications reach the user when the app is closed
- [ ] Refund path exercised end-to-end
- [ ] Support tickets have an owner and a status
- [ ] Privacy note on what data is stored (names, blocks, photos, payments)

---

## 10. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Demo-time failure in an unfixed page | High today | High | Phase 0; rehearse twice; screenshots as fallback |
| Mock/real divergence causes "works in demo, breaks live" | High | High | Contract tests, single service layer, Mongo in CI |
| Payment/pricing tampering | High (confirmed) | Critical | Server-side pricing, idempotency, gateway webhooks |
| Account lockout on password change | Confirmed | High | Fix hashing in both modes + regression test |
| Data loss (in-memory demo, no backups) | Medium | Critical | Atlas/backups; never present in-memory as persistent |
| Last warden deleted / role lockout | Medium | High | Guard + audit + break-glass account |
| Scope creep before review | High | Medium | Tier gating; freeze features until P1 closed |
| Accessibility complaints / low adoption | Medium | Medium | Audit + keyboard testing before pilot |
| Faculty probing overclaimed features (PDF, QR, payments) | High if unaddressed | Medium | Label clearly as simulated; show roadmap |

---

## 11. Likely faculty questions — and honest answers

1. **"Is this production ready?"**
   "The demo is end-to-end, but no — payments are simulated, there is no automated coverage of business logic, and we have a documented list of security and integrity gaps. This plan is the productionisation path, with effort estimates."

2. **"What happens if two staff advance the same batch?"**
   "Today, last write wins and history may duplicate. The plan adds optimistic concurrency (`__v`/version check) and a state machine with 409 responses."

3. **"Can a student fake a payment?"**
   "Yes, in the current build the client sends the amount and the server accepts it — that's exactly why server-authoritative pricing and gateway webhooks are Phase 1, before any real money."

4. **"How do you know the tracker is trustworthy?"**
   "Today the history has timestamps but not the actor. We're adding `by`, `reason`, and immutable entries, so a dispute can show who moved the batch and when."

5. **"How does this scale to 2,000 students?"**
   "Not yet: queries load collections into memory and the UI polls every few seconds. Phase 2 adds indexed queries, pagination and SSE; a load test at 10× pilot traffic is part of the release gate."

6. **"What did users actually validate?"**
   "The workflow and information architecture — 6 hostellers, 4 tasks, 4.3/5 ease of use. Not production reliability; that's the work described here."

7. **"Why MongoDB and mock mode?"**
   "Mock mode made the project demoable and CI-friendly without infrastructure, and it let us iterate fast. Its cost was behavioural drift from Mongoose — which produced four of the bugs in §3. The fix is contract tests and a shared service layer, not removing mock mode."

---

## 12. Appendix — verification evidence

Commands run (Windows, Git Bash), from the repo root:

```bash
cd client && npm run build
# ✓ 99 modules transformed, dist/assets/index-*.js 433.45 kB (gzip 122.44 kB), built in 1.87s

cd client && npm test
# Test Files 1 passed (1) · Tests 4 passed (4)

cd client && npm run lint
# Found 34 warnings and 0 errors. (oxlint, 27 files)

cd server && MOCK_MODE=true JWT_SECRET=testsecret PORT=5055 node src/index.js
```

Authenticated probes:

| Probe | Result |
|---|---|
| `POST /api/auth/login` (aarav) | `200` but response includes `"password":"$2a$10$…"` |
| `GET /api/users` (warden token) | `{"users":[{"batchCount":3,...}], "byRole":{"student":0,"staff":0,"warden":0}}` — names/roles missing |
| `POST /api/payments/calculate {"itemEstimate":"xl"}` | `{"subtotal":0,"tax":0,"total":0}` |
| `POST /api/payments/calculate {"itemEstimate":"extra-large"}` | `{"subtotal":0,...,"total":0}` |
| `GET /api/api/payments` | `404` (the path the client actually calls) |
| `POST /api/payments/process {"amount":1}` | `201 {"success":true,...}` |
| `PATCH /api/users/:id/password` then login with new password | `200` → then `401` (locked out) |
| Login with old password after change | `401` |
| `GET /api/health` | `{"status":"ok","mode":"demo"}` |

Additional static findings: support notifications target the requester (`support.js`); user deletion has no cascade (`users.js`); admin service deletion has no default guard (`admin.js`); invoice HTML interpolates user data unescaped (`Invoice.jsx`); `cutoffTime` is stored but never read; `ORDER`/`LABELS` duplicated across `batches.js`, `demo.js`, `admin.js`, `Dashboard.jsx`, `StaffConsole.jsx`, `TrackStatus.jsx`, `App.test.jsx`; `vitest.config.js` referenced in docs but absent.

---

## 13. Bottom line

You have a **well-designed, research-grounded prototype with a working core loop** and a demo that will land well — provided the five P0 defects are fixed and the demo avoids the simulated-payment edges. Do not present it as production-ready; present it as **validated and productionisation-planned**, using the tables above as evidence of engineering maturity.

The single highest-leverage structural change is **one source of truth for domain rules** (pricing, lifecycle, permissions, notifications). It removes the mock/real drift that caused most of these bugs, makes testing possible, and cuts the cost of every feature that follows.

---

## 14. Honest gap register (P0 + P1)

This is the list of things that are **not proven, not automated, or still absent** after Phase 0 and Phase 1. It exists so the project is described as *validated and productionisation-planned*, never as production-ready. Phase 2 items marked *started* now have scaffolding in the repo but have not been executed against a real environment here.

### 14.1 P0 fixes — verified vs. not verified

| P0 fix | Verified | Not verified |
|---|---|---|
| 18 doubled `/api` prefixes | Client build + all 4 client tests; routes inspected | No browser click-through of Payments, Invoice, Reviews, Profile or Admin after the change |
| XL pricing / unknown sizes | Live curl and API tests: XL = ₹350, total ₹368; unknown size = 400 | Admin editing service-tier prices, and quotes for every tier/combination |
| Mock password hashing + change lockout | API tests: change 200, old password 401, new password 200; seeds hashed on create | Any mock path that writes directly to the collection instead of `MockUser.create`/`save` (none found, but not enforced at the store layer) |
| Password hashes stripped | Tests assert login and `/api/users`; every serializer call site inspected | Automated coverage for admin user detail, payment detail, invoice and profile endpoints |
| Server-side payment pricing | Tests: tampered `/process` amount stored ₹189; checkout ignores client totals | A real gateway/webhook that would confirm the captured amount |
| `/api/users` + `/api/reviews` contract | API test asserts no hashes, names/roles and `byRole`; reviews return `average`/`total` | Admin analytics UI and the Reviews page rendered in a browser |

### 14.2 P1 behaviour — residual gaps

| # | Gap | Current reality | Impact | Target |
|---|---|---|---|---|
| 1 | Real-Mongo path never executed | All 17 API tests run against the mock store; no MongoDB instance was available | Unique indexes, TTL cleanup, coupon atomic reservation and idempotency constraints are unproven | Phase 2 |
| 2 | No email delivery | Verify/reset tokens are logged and returned only when `NODE_ENV !== production`; no provider or templates | Users cannot self-serve verification or password reset outside the dev helper | Phase 2 |
| 3 | No email-verification UI | Endpoints exist (`verify-email`, `resend-verification`) but no page or banner | A real user has no way to complete verification in the app | Phase 2 |
| 4 | `REQUIRE_VERIFIED_EMAIL` defaults off | Unverified accounts can submit and pay | Acceptable for the demo, not a verified-user policy | Phase 2 |
| 5 | Payments are simulated | No gateway, no webhook, refunds are local status changes | Cannot take real money; reconciliation is manual | Phase 3 |
| 6 | Access tokens cannot be revoked mid-life | Refresh tokens revoke immediately; an access JWT stays valid up to 15 minutes | A stolen access token has a short but real window | Phase 2 |
| 7 | Multi-tab refresh race | Each tab rotates independently; two simultaneous refreshes can invalidate the loser | A second tab may be signed out | Phase 2 |
| 8 | Coupon one-per-user is check-then-insert | `Payment.findOne` then create; no unique index on `(user, couponCode)` | Two concurrent checkouts could both redeem the same coupon | Phase 2 |
| 9 | Routes load whole collections | `find({})` then filter/sort in JS across batches, payments, users, reviews, notifications | Indexes were added but are not used yet; performance degrades with real data | Phase 2 |
| 10 | No pagination | Lists return everything (payments admin has offset/limit, others do not) | Slow responses and large payloads at pilot scale | Phase 2 |
| 11 | Rate limits are per-process memory | `express-rate-limit` default store | Multiple instances do not share limits | Phase 2/3 |
| 12 | CSRF relies on SameSite + origin check | Cookie endpoints check trusted origin; no CSRF token | Residual risk for cross-site cookie flows | Phase 2 |
| 13 | Secrets are plain env vars | `.env` / Compose environment | No rotation or secret manager | Phase 2 |
| 14 | No 2FA or account lockout | Rate limiting only | Credential stuffing is slowed, not stopped | Phase 3 |
| 15 | No error tracking or uptime monitor | pino JSON logs with request ids only | Nobody is paged when production breaks | Phase 2 |
| 16 | No backup/restore drill | Compose volume only | Data-loss recovery is untested | Phase 2 |
| 17 | Docker/CI not executed | Dockerfile, Compose and workflow were written; no Docker daemon here and CI has not run | Image build, healthcheck and pipeline are unverified | Phase 2 (now) |
| 18 | Two moderate `qs` advisories remain | Express 4 transitive dependency; critical/high advisories were fixed | Moderate DoS surface until Express ships the fix | Phase 2 |
| 19 | Client dependency audit not run | Registry audit endpoint failed with a TLS error locally | Unknown client-side advisories | Phase 2 |
| 20 | No accessibility/Lighthouse pass | No automated a11y checks; React pages only manually reviewed | Keyboard/screen-reader gaps unknown | Phase 2 |
| 21 | 32 client lint warnings | Unused vars, effect-state patterns, fast-refresh warnings; 0 errors | Noise that can hide real issues | Phase 2 |
| 22 | No UI/E2E tests | 4 client unit tests (axios client) and API tests only | Login, checkout, invoice and staff flows are not browser-tested | Phase 2 |
| 23 | No load test | Nothing beyond the unit/API suite | Pilot capacity is unknown | Phase 2 |
| 24 | Support is in-app only | Tickets notify wardens; no email, assignment or SLA | Tickets can sit unseen outside the app | Phase 3 |
| 25 | Invoice is print-HTML | Escaped popup window; no PDF | Popup blockers can prevent printing; no downloadable PDF | Phase 3 |
| 26 | XSS fix has no regression test | Escaping added in `Invoice.jsx`; React escapes on-screen output | A future edit could reintroduce raw interpolation | Phase 2 |
| 27 | Last-warden and default-service guards untested | Implemented in services/routes | Regressions would go unnoticed | Phase 2 |
| 28 | Support update and review submission untested | Implemented and manually exercised | Lower confidence in those paths | Phase 2 |
| 29 | Staff console and state machine UI untested | API transitions covered; the demo uses the simulator | A UI-only bug could block a real staff member | Phase 2 |
| 30 | Schedule tests use synthetic blocks | T1/Z9 schedules created in tests; seeded B6/C3 only exercised through demo behaviour | Real published schedules and late-drop windows are less covered | Phase 2 |
| 31 | Soft delete keeps financial history | User is anonymised; batches/payments remain linked | Invoices for deleted users show the anonymised account; no retention policy | Phase 3 |
| 32 | Demo driver remains reachable in mock mode | `/api/demo/advance` is 404 unless `MOCK_MODE=true`; any student can advance their own batch | Intended for the demo, must never be exposed in a real deployment | Acceptable (documented) |
| 33 | No session/device list | Logout-all exists; users cannot see or revoke individual sessions | Limited account-security UX | Phase 3 |
| 34 | No email-change or account-recovery flow | Password reset only | A locked-out user with no mailbox access is stuck | Phase 3 |
| 35 | No audit-log viewer | `statusHistory`, refund reason and resolver fields exist | Investigators must read the database | Phase 3 |

### 14.3 What Phase 2 still needs

1. Execute the real-Mongo suite and the Docker/Compose stack; verify indexes, TTL and constraints.
2. Add transactional email (verification, reset, ready/issue alerts) with templates and a provider.
3. Add error tracking and an external uptime probe; keep the JSON logs.
4. Refactor list endpoints to indexed queries with pagination, then load-test at pilot volume.
5. Run a backup/restore drill and document recovery time.
6. Accessibility/Lighthouse pass and client dependency audit; reduce lint warnings.
7. Add browser E2E coverage for login → submit → track → invoice → staff console.

Phase 3 remains the feature build (photo evidence, QR pickup, PDF invoices, SLA alerts, audit viewer, dispute thread, demo gating).
