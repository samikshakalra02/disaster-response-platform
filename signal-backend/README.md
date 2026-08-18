# SIGNAL Dispatch — Backend Foundation

Staff authentication + a basic alerts API for the SIGNAL emergency dispatch app.
This is a **starting foundation**, not the full system described in the earlier
feature list (AI triage, CV photo analysis, WebSockets, social ingestion, geo
clustering) — none of that exists yet. What's here now:

- JWT-based staff login/registration with roles (`dispatcher`, `admin`, `field_unit`)
- A public endpoint for citizens to submit an SOS/report (no login required —
  someone in an emergency should never be blocked by an auth screen)
- Staff-only endpoints to list alerts, view one, and advance its status
  (`new → ack → dispatched → resolved`)
- Simple rule-based priority (Fire/Medical/Assault/Gas Leak → P1, everything
  else → P2) as a placeholder for real triage logic later

Every endpoint below was actually run against a live server during development
(see the test transcript at the bottom) — not just written and assumed to work.

## Stack

Node.js + Express, `bcryptjs` for password hashing, `jsonwebtoken` for auth.
Storage is a small JSON-file datastore (`src/db/jsonStore.js`) — zero external
services to stand up, so you can clone and run this in under a minute. It is
explicitly **not** meant for concurrent production traffic; swap it for
Postgres/Mongo when you're ready (see "Swapping in a real database" below).

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit values, especially JWT_SECRET
npm run seed               # creates two demo staff accounts
npm start                  # http://localhost:4000
```

Demo accounts created by `npm run seed`:

| Role       | Email                  | Password    |
|------------|-------------------------|-------------|
| dispatcher | dispatcher@signal.app  | password123 |
| admin      | admin@signal.app       | password123 |

Change/remove these before deploying anywhere real.

## API Reference

### `GET /api/health`
No auth. Liveness check.

### `POST /api/auth/register`
Creates a staff account. Requires a shared `registrationKey` matching
`STAFF_REGISTRATION_KEY` in `.env` — this is a placeholder guard; replace with
a real admin-invite flow before production.

```json
// request
{ "name": "Dispatcher Two", "email": "d2@signal.app", "password": "min8chars",
  "role": "dispatcher", "badgeId": "D-05", "registrationKey": "..." }

// response 201
{ "token": "...", "staff": { "id": "...", "name": "...", "role": "dispatcher", ... } }
```

### `POST /api/auth/login`
```json
{ "email": "dispatcher@signal.app", "password": "password123" }
```
Returns `{ token, staff }` on success, `401` on bad credentials.

### `GET /api/auth/me`
Requires `Authorization: Bearer <token>`. Returns the logged-in staff profile.

### `POST /api/alerts`  — public, no auth
Citizen app calls this when an SOS is confirmed or a report form is submitted.
```json
{
  "type": "Fire",
  "name": "Reporter Name",
  "phone": "+91...",
  "count": 2,
  "description": "Optional free text",
  "location": { "lat": 28.61, "lng": 77.20, "address": "Optional reverse-geocoded address" }
}
```
Returns the created alert with a computed `priority` and `status: "new"`.

### `GET /api/alerts` — staff only (`dispatcher` or `admin`)
Optional query params: `?status=new` `?priority=1`. Returns alerts sorted
unresolved-first, then by priority, then newest first.

### `GET /api/alerts/:id` — staff only

### `PATCH /api/alerts/:id/status` — staff only
```json
{ "status": "ack" }
```
Valid values: `new`, `ack`, `dispatched`, `resolved`, and only moving forward
through that order is allowed (a `400` is returned for backward transitions).

## Roles

- `dispatcher` / `admin` — can list/view/update alerts
- `field_unit` — can authenticate (for a future "my assigned alerts" view) but
  is currently blocked (`403`) from the dispatcher queue endpoints; expand
  `requireRole(...)` in `src/routes/alerts.routes.js` when that view exists

## What was tested

Ran locally against a live instance: health check; login with wrong password
(401) and correct password (200 + token); `/auth/me` with and without a token
(401 / 200); listing alerts without a token (401); public alert creation with
correct auto-computed priority; listing as staff; a valid forward status
transition (`new → ack`); a rejected backward transition (400); registering a
`field_unit` and confirming it's blocked from the queue endpoint (403); and
registration rejected with a wrong registration key (403).

## Swapping in a real database

Every DB access goes through `src/db/staffRepo.js` and `src/db/alertsRepo.js`.
To move to Postgres/Mongo: rewrite those two files with the same exported
function signatures (`all`, `findById`, `create`, etc.) backed by real queries.
Nothing in `controllers/` or `routes/` needs to change.

## Suggested next slices

1. **Real-time updates** — add a WebSocket (or Server-Sent Events) layer that
   pushes on `alertsRepo.create()` / `updateStatus()` so the staff dashboard
   and citizen tracker update live instead of polling.
2. **Field unit assignment** — add `assignedTo` on an alert and a
   `GET /api/alerts/mine` endpoint for `field_unit` role.
3. **Input validation** — this foundation does hand-rolled checks; swap in
   `zod` or `joi` schemas once the shape of each payload is stable.
4. **AI triage** — a scoring service that reads `type`/`description`/photo
   and refines `priority` beyond the current fixed lookup table.
5. **Rate limiting on `POST /api/alerts`** — it's intentionally public, so add
   `express-rate-limit` to blunt abuse without adding a login wall.
