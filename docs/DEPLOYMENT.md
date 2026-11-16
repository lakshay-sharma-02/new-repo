# Deployment (Phase 2)

The app ships as **one Node process + MongoDB**. The same process serves the
built React app, so there is no separate static host or CORS setup in the
default deployment.

## Environment

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | yes | `development` | Use `production` in deployments |
| `PORT` | no | `5000` | |
| `MOCK_MODE` | yes | `false` | `false` in production; boot fails otherwise |
| `MONGODB_URI` | yes | — | Required when `MOCK_MODE=false` |
| `JWT_SECRET` | yes | dev-only fallback | Must be strong in production |
| `ACCESS_TOKEN_TTL` | no | `15m` | Short-lived access token |
| `REFRESH_TOKEN_DAYS` | no | `30` | Refresh-token lifetime |
| `CORS_ORIGINS` | no | localhost dev origins | Comma-separated; same-origin deploys do not need it |
| `COOKIE_SAME_SITE` | no | `lax` | `none` for cross-site APIs (requires HTTPS) |
| `COOKIE_SECURE` | no | `true` in prod | Set `false` only for local HTTP |
| `REQUIRE_VERIFIED_EMAIL` | no | `false` | Turn on once email delivery exists |
| `SERVE_CLIENT` | no | `false` | `true` serves `/client/dist` |
| `CLIENT_DIST` | no | `../client/dist` | Absolute path in containers |
| `LOG_LEVEL` | no | `info` (prod) | pino level |

Client builds read `VITE_API_BASE_URL` (default `/api`; see
`client/.env.example`). Use the same-origin default for a single-container
deploy.

## Docker Compose (app + MongoDB)

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up --build -d
docker compose ps
curl -f http://localhost:5000/api/health
```

The app waits for MongoDB's healthcheck, then starts on
`http://localhost:5000`. For local HTTP keep `COOKIE_SECURE=false`; behind TLS
set it to `true`.

The real database starts empty and has **no demo seed**. Create the first
warden once:

```bash
docker compose exec \
  -e ADMIN_EMAIL=warden@campus.edu \
  -e ADMIN_PASSWORD='change-me-now' \
  -e ADMIN_NAME='Head Warden' \
  app npm run seed:warden
```

Re-running this promotes an existing account instead of duplicating it.
Staff accounts can then be created by the warden in the admin panel, and
schedules published from the staff console.

## Manual production run

```bash
cd client && npm ci && npm run build && cd ..
cd server && npm ci --omit=dev
NODE_ENV=production \
MOCK_MODE=false \
MONGODB_URI='mongodb://localhost:27017/laundry-roulette' \
JWT_SECRET='...' \
SERVE_CLIENT=true \
node src/index.js
```

## Health and shutdown

- `GET /api/health` returns `200` when the store is ready and `503` when a real
  MongoDB connection is down.
- `SIGTERM`/`SIGINT` close the HTTP server, disconnect MongoDB and exit; a
  10-second watchdog prevents a stuck shutdown.

## Logs

The API writes structured JSON through pino, including request id, method,
URL, status and duration. Authorization headers, cookies and password/token
fields are redacted. `X-Request-Id` is returned on every response.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests:

- server: `npm ci`, `npm test`, production dependency audit at `high`
- client: `npm ci`, `npm run lint`, `npm test`, `npm run build`

## Still to do before a real pilot

- Managed MongoDB with backups **and a restore drill**
- Transactional email for verification, password reset, ready/issue alerts
- Error tracking + external uptime monitor
- Real-mode API suite against MongoDB and a load test
- Pagination/query refactor (routes still load collections into memory)
- Accessibility/Lighthouse pass and client dependency audit
- Verified Docker/CI runs (the files exist; the image was not built on the
  development machine)
