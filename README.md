# 🆘 SIGNAL — Emergency Dispatch Network

**One tap to raise an alarm. One dashboard to save the response time.**

SIGNAL is a two-sided emergency response platform: a zero-friction SOS app
for citizens in danger, and a real-time triage dashboard for dispatch staff
to act on it — no app download, no login wall between a person and help.

🔗 **Live app:** https://disaster-response-platform.netlify.app
🔗 **Live API:** https://signal-backend-production-3aea.up.railway.app/api/health

---

## 🚨 The Problem

When something goes wrong — a fire, a medical emergency, an assault — every
second between "it's happening" and "help is on the way" matters. Most
reporting tools fail at exactly the moment they're needed most:

- They gate reporting behind sign-up/login screens
- They dump every report into an undifferentiated queue with no triage
- They give dispatchers no fast way to see what's urgent vs. what can wait

## 💡 Our Solution

**SIGNAL removes every point of friction between a citizen and a responder,**
while giving dispatch staff a structured, prioritized queue to work from.

| For Citizens | For Dispatch Staff |
|---|---|
| One-tap SOS with live cancel-able countdown | Secure JWT-based staff login (role-based: dispatcher / admin / field unit) |
| No account, no login — ever | Auto-prioritized alert queue (P1/P2 by incident type) |
| Manual report form for non-urgent issues | Full alert lifecycle tracking: `new → ack → dispatched → resolved` |
| Works the instant the page loads | Built to scale into real-time push updates (see roadmap) |

---

## ⚡ Try it live right now

**Citizen side** — no login needed:
1. Open the [live app](https://disaster-response-platform.netlify.app)
2. Stay on the **Citizen** tab, tap **SOS**
3. Watch the countdown — cancel it, or let it complete to file a report

**Staff side** — dispatcher dashboard:
1. Click the **Staff** tab
2. Sign in with the demo account below
3. Watch alerts land, sorted by priority, and walk one through its lifecycle

| Role       | Email                   | Password    |
|------------|--------------------------|-------------|
| dispatcher | dispatcher@signal.app   | password123 |
| admin      | admin@signal.app        | password123 |

---

## 🏗️ Architecture

```
signal-dispatch/
├── frontend/     → single-page citizen + staff app, deployed on Netlify
└── backend/      → REST API (auth, alerts, triage), deployed on Railway
```

Frontend talks to the backend over HTTPS/JSON, CORS-locked to only accept
requests from the deployed frontend origin. Backend data is currently a
JSON-file store, structured so it's a one-file swap to Postgres/Mongo later.

## 🛠️ Tech Stack

- **Frontend:** vanilla HTML/CSS/JS — zero build step, deploys anywhere in seconds
- **Backend:** Node.js, Express, JWT auth (`jsonwebtoken`), `bcryptjs` password hashing
- **Data:** JSON-file store for a zero-setup local dev experience
- **Deployment:** Netlify (frontend) + Railway (backend)

## ✅ What's actually built and tested

Every endpoint below was run end-to-end against a live server, not just
written and assumed to work: health check; staff login (success + wrong-password
rejection); authenticated `/me`; alert creation with auto-computed priority;
staff-only alert listing and status updates; forward-only status transitions
enforced (`new → ack` allowed, backward rejected); role-gating (`field_unit`
blocked from dispatcher queue); registration key enforcement.

## 🗺️ Roadmap

We scoped this as a **solid, working foundation** rather than overbuilding a
demo that breaks under questions. Next slices, in priority order:

1. **Real-time push** — WebSocket/SSE layer so the dashboard updates live instead of polling
2. **AI-assisted triage** — replace the rule-based priority lookup with a model that reads description/photo context
3. **Field unit assignment** — `assignedTo` + a "my alerts" view for responders in the field
4. **Geo-clustering** — group simultaneous nearby reports into one incident
5. **Production-grade datastore** — swap the JSON store for Postgres (repo interfaces are already designed for a drop-in replacement)

Full API reference and setup instructions: [`backend/README.md`](backend/README.md)

## 🚀 Running locally

```bash
# backend
cd backend
npm install
cp .env.example .env      # set JWT_SECRET, STAFF_REGISTRATION_KEY
npm run seed               # creates demo staff accounts
npm start                  # → http://localhost:4000

# frontend
cd frontend
npx serve .                 # or just open index.html directly
```

## 👥 Team

[Your name(s) here] — built for [hackathon name], [date/year]
