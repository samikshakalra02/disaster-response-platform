# 🆘 SIGNAL — Emergency Dispatch Network

**One tap to raise an alarm. One live map to close the distance.**

SIGNAL is a two-sided emergency response platform: a zero-friction SOS app for citizens in danger, and a real-time triage-and-navigation dashboard for dispatch staff to act on it — **no app download, no login wall between a person and help.**

🔗 **Live app:** [disaster-response-platform.netlify.app](https://disaster-response-platform.netlify.app)
🔗 **Live API:** [signal-backend-production-3aea.up.railway.app/api/health](https://signal-backend-production-3aea.up.railway.app/api/health)

---

## 🚨 The Problem

When something goes wrong — a fire, a medical emergency, an assault — every second between "it's happening" and "help is on the way" matters. Most reporting tools fail at exactly the moment they're needed most:

- They gate reporting behind sign-up/login screens
- They dump every report into an undifferentiated queue with no triage
- They give dispatchers no fast, visual way to see what's urgent, where it is, and how to get there

## 💡 Our Solution

**SIGNAL removes every point of friction between a citizen and a responder** — then closes the loop with real, live-updating maps and one-tap turn-by-turn navigation on both sides, not static pins on a mock grid.

| For Citizens | For Dispatch Staff |
|---|---|
| One-tap SOS with live, cancel-able countdown + siren | Secure JWT-based staff login (dispatcher / admin / field unit) |
| No account, no login — ever | Auto-prioritized alert queue (P1 / P2 / P3 by incident type) |
| Live GPS position shared + reverse-geocoded to a real address | Full alert lifecycle: `new → ack → dispatched → resolved` |
| Real-time responder tracking on an interactive map | One-tap "Open in Google Maps" directions straight to the victim |
| Nearby-incidents map with live priority-coded pins | Live queue stats + forward-only status transitions |
| Manual report form for non-urgent issues | Built to scale into real-time push updates (see roadmap) |

## 🗺️ New: Real Maps, Real Navigation

The original build used static mock grids with fake percentage-based pins. Every map in the app is now a real, interactive **Leaflet map on OpenStreetMap tiles**, driven by real coordinates — with a direct handoff into **Google Maps** for actual turn-by-turn navigation.

- ✅ **Live Position tracking (citizen)** — the responder marker moves toward the citizen's real GPS fix in real time, computed with great-circle bearing/distance math (haversine), not a canned CSS animation
- ✅ **Nearby Reported Issues map (citizen)** — every open incident renders as a live, color-coded, priority-sized pin; tapping a list row pans/pops the matching map marker and vice versa
- ✅ **Victim location map (staff)** — dispatchers open any queued alert on a live map centered on the caller's real (or shared) coordinates
- ✅ **"Open in Google Maps" deep links** on every map — citizens see the responder's live route to them, dispatchers get one-tap directions from their own position to the victim
- ✅ **Reverse geocoding (Nominatim)** turns raw lat/long into a human-readable address the moment location is captured

## ⚡ Try It Live Right Now

**Citizen side** — no login needed:
1. Open the [live app](https://disaster-response-platform.netlify.app)
2. Stay on the **Citizen** tab, tap **SOS**
3. Watch the siren + countdown — cancel it, or let it complete to file a report
4. Switch to **Track** to watch the responder converge on your live location on the map, or **Reports** to see nearby incidents plotted around you

**Staff side** — dispatcher dashboard:
1. Click the **Staff** tab
2. Sign in with the demo account below
3. Watch alerts land, sorted by priority, tap **MAP** on any alert for the live location + one-tap directions, and walk one through its lifecycle

| Role | Email | Password |
|---|---|---|
| dispatcher | `dispatcher@signal.app` | `password123` |
| admin | `admin@signal.app` | `password123` |

---

## 🏗️ Architecture

```
signal-dispatch/
├── frontend/ → single-page citizen + staff app (Leaflet maps, live tracking), deployed on Netlify
└── backend/  → REST API (auth, alerts, triage), deployed on Railway
```

Frontend talks to the backend over HTTPS/JSON, CORS-locked to only accept requests from the deployed frontend origin. Backend data is currently a JSON-file store, structured so it's a one-file swap to Postgres/Mongo later — unchanged from the original design.

## 🛠️ Tech Stack

- **Frontend:** vanilla HTML/CSS/JS — zero build step, deploys anywhere in seconds
- **Maps & navigation:** Leaflet.js + OpenStreetMap tiles for live in-app maps, Nominatim for reverse geocoding, Google Maps deep links for turn-by-turn handoff
- **Device APIs:** Geolocation API (live GPS), Contacts Picker API with a graceful manual-entry fallback, Web Audio API for the SOS siren
- **Backend:** Node.js, Express, JWT auth (`jsonwebtoken`), `bcryptjs` password hashing
- **Data:** JSON-file store for a zero-setup local dev experience
- **Deployment:** Netlify (frontend) + Railway (backend)

## ✅ What's Actually Built and Tested

Every endpoint below was run end-to-end against a live server, not just written and assumed to work:

- [x] Health check
- [x] Staff login (success + wrong-password rejection)
- [x] Authenticated `/me`
- [x] Alert creation with auto-computed priority and captured GPS location
- [x] Staff-only alert listing and status updates
- [x] Forward-only status transitions enforced (`new → ack` allowed, backward rejected)
- [x] Role-gating (`field_unit` blocked from dispatcher queue)
- [x] Registration key enforcement
- [x] Live map render + marker sync verified on both citizen and staff views, with real device geolocation

## 🗺️ Roadmap

We scoped this as a **solid, working foundation** rather than overbuilding a demo that breaks under questions. Next slices, in priority order:

1. **Real-time push** — WebSocket/SSE layer so the dashboard and live maps update instantly instead of polling
2. **AI-assisted triage** — replace the rule-based priority lookup with a model that reads description/photo context
3. **Field unit assignment** — `assignedTo` + a "my alerts" view for responders in the field, with live position on the same map layer
4. **Geo-clustering** — group simultaneous nearby reports into one incident on the map
5. **Production-grade datastore** — swap the JSON store for Postgres (repo interfaces are already designed for a drop-in replacement)

Full API reference and setup instructions: [`backend/README.md`](backend/README.md)

## 🚀 Running Locally

```bash
# backend
cd backend
npm install
cp .env.example .env   # set JWT_SECRET, STAFF_REGISTRATION_KEY
npm run seed            # creates demo staff accounts
npm start                # → http://localhost:4000

# frontend
cd frontend
npx serve .              # or just open index.html directly
```

No API keys or paid map services required — Leaflet + OpenStreetMap tiles and Nominatim geocoding all work out of the box. The Google Maps directions buttons are plain deep links, so they need no SDK or key either.

## 👥 Team CodeNewbees

Samiksha Kalra
Shivanshu Pandey
Tanya Tiwari
Nivika Goyal— built for AUTOMATE INDIA 2026 — NIET CHAPTER 
