# ✈️ TravelBuddy

A full-stack web app for finding travel companions. Create trips, discover buddies heading to the same destinations, chat in real time, and connect with like-minded travelers.

---

## Features

- **Authentication** — Signup with email OTP verification, login with JWT sessions, password visibility toggle
- **Create Trips** — Post your travel plans with destination, dates, budget, travel style, and gender preference
- **Browse & Join** — Browse all trips, filter by destination, style, budget, duration, and gender
- **Search** — Inline search on the home page by destination
- **My Trips** — View your created trips with a detail modal showing full trip info
- **Buddy Matches** — Discover other travelers heading to similar destinations, ranked by shared travel styles
- **Real-time Chat** — Socket.io powered messaging between users
- **Profile** — Edit your name, bio, location, travel styles, and social links
- **Settings** — Change password and delete account, both backed by the server

---

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Socket.io Client

**Backend**
- Node.js + Express
- Socket.io
- bcrypt, jsonwebtoken, nodemailer
- JSON file storage (no database required to run)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies for both client and server
npm run install:all
```
### Running the App

Open two terminals:

```bash
# Terminal 1 — backend (port 3001)
npm run server

# Terminal 2 — frontend (port 5173)
npm run client
```

Then open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/verify-otp` | — | Verify email OTP |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/change-password` | ✓ | Change password |
| DELETE | `/api/auth/account` | ✓ | Delete account |
| GET | `/api/trips` | ✓ | List/filter trips |
| GET | `/api/trips/mine` | ✓ | My trips |
| POST | `/api/trips` | ✓ | Create trip |
| POST | `/api/trips/:id/join` | ✓ | Join a trip |
| GET | `/api/users/matches` | ✓ | Buddy matches |
| POST | `/api/users/:id/connect` | ✓ | Connect with user |

---

## Data Storage

User, trip, and connection data is stored in JSON files under `server/data/`. These files are gitignored and created automatically on first use.

To migrate to a database later, only the store modules (`userStore.js`, `tripStore.js`, `connectionStore.js`) need to be updated — the rest of the codebase stays the same.

---

## Roadmap

- [ ] MongoDB integration for persistent chat history
- [ ] Socket.io JWT authentication
- [ ] Trip detail editing and deletion
- [ ] Real-time buddy match notifications
- [ ] Profile photo upload to cloud storage
- [ ] Mobile responsive improvements
