# Design Document: trips-core

## Overview

The trips-core feature replaces all hardcoded trip and user data in the TravelBuddy dashboard with a real backend. It adds JSON-file-backed persistence for trips and connections, exposes REST endpoints on the existing Express server, and wires the React dashboard panels to those endpoints.

The design follows the patterns already established in the codebase:
- **Server**: `userStore.js` read/write pattern, `asyncHandler` + `AppError` error handling, `requireAuth` middleware for protected routes.
- **Client**: `localStorage`-stored JWT (`tb_token`), `fetch` with `Authorization: Bearer <token>` header, panel-based navigation via `onSwitch`.

All write operations (create trip, join trip, connect with user) require a valid JWT. Read operations (browse trips, filter trips) are public.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React Client (port 5173)                                       │
│                                                                 │
│  Dashboard.jsx                                                  │
│  ├── PanelHome        ──── GET /api/users/matches (auth)        │
│  │   └── search bar  ──── navigates to PanelFilter w/ query    │
│  ├── PanelCreate      ──── POST /api/trips (auth)               │
│  ├── PanelMyTrips     ──── GET /api/trips/mine (auth)           │
│  ├── PanelJoin        ──── GET /api/trips                       │
│  │                    ──── POST /api/trips/:id/join (auth)      │
│  └── PanelFilter      ──── GET /api/trips?destination=&style=…  │
│                                                                 │
│  client/src/utils/api.js  (new — trip/user fetch helpers)       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (proxied via Vite)
┌────────────────────────────▼────────────────────────────────────┐
│  Express Server (port 3001)                                     │
│                                                                 │
│  server/server.js                                               │
│  ├── /api/auth   → auth/router.js  (existing)                   │
│  ├── /api/trips  → trips/router.js (new)                        │
│  └── /api/users  → users/router.js (new)                        │
│                                                                 │
│  server/data/                                                   │
│  ├── tripStore.js      → trips.json                             │
│  └── connectionStore.js → connections.json                      │
└─────────────────────────────────────────────────────────────────┘
```

### Search → Filter Flow

The Home panel search bar and the Filter panel share state via a **lifted `searchQuery` state** in `Dashboard.jsx`. When the user presses Enter in the search bar, `Dashboard` sets `searchQuery` and switches the active panel to `filter`. The Filter panel reads `searchQuery` as a prop, pre-populates its destination input, and fires the filter fetch on mount via a `useEffect` that depends on the query prop.

This avoids URL params (which would require a router change) and avoids a global store (overkill for one value). It is the simplest approach consistent with the existing panel-switching pattern.

---

## Components and Interfaces

### Server: `server/data/tripStore.js`

Mirrors `userStore.js` exactly. Reads and writes `server/data/trips.json`.

```js
export function readAll()           // → Trip[]
export function findById(id)        // → Trip | null
export function findByCreator(id)   // → Trip[]
export function create(tripData)    // → Trip  (adds createdAt)
export function update(id, changes) // → Trip
export function remove(id)          // → void
```

### Server: `server/data/connectionStore.js`

Same pattern. Reads and writes `server/data/connections.json`.

```js
export function readAll()                    // → Connection[]
export function findByFrom(fromId)           // → Connection[]
export function exists(fromId, toId)         // → boolean
export function create(fromId, toId)         // → Connection  (adds createdAt)
```

### Server: `server/trips/router.js`

```
GET  /api/trips              — list all trips (public), supports query filters
GET  /api/trips/mine         — list current user's trips (auth required)
POST /api/trips              — create a trip (auth required)
POST /api/trips/:id/join     — join a trip (auth required)
```

Each route uses `asyncHandler` and throws `AppError` for error cases. The router registers its own error-handling middleware (same pattern as `auth/router.js`).

### Server: `server/users/router.js`

```
GET  /api/users/matches      — buddy matches for current user (auth required)
POST /api/users/:id/connect  — send a connection request (auth required)
```

### Client: `client/src/utils/api.js` (new file)

Centralises all trip/user API calls, following the pattern of `auth.js`.

```js
export function getToken()                          // reads tb_token from localStorage
export function authHeaders()                       // → { Authorization: 'Bearer ...' }

export function fetchTrips(filters = {})            // GET /api/trips?...
export function fetchMyTrips()                      // GET /api/trips/mine (auth)
export function createTrip(tripData)                // POST /api/trips (auth)
export function joinTrip(tripId)                    // POST /api/trips/:id/join (auth)
export function fetchMatches()                      // GET /api/users/matches (auth)
export function connectUser(userId)                 // POST /api/users/:id/connect (auth)
```

### Client: `Dashboard.jsx` changes

- Add `searchQuery` state (string, default `''`) and `setSearchQuery` lifted to `Dashboard`.
- Pass `searchQuery` and `setSearchQuery` as props to `PanelHome` and `PanelFilter`.
- `PanelHome`: on Enter in search bar, call `setSearchQuery(value)` then `onSwitch('filter')`.
- `PanelFilter`: accept `searchQuery` prop, pre-populate destination input, fire fetch in `useEffect([searchQuery])`.
- `PanelCreate`, `PanelMyTrips`, `PanelJoin`, `PanelHome` (buddy matches): replace hardcoded data with `useEffect` + `useState` fetching from the API helpers.

---

## Data Models

### Trip

Stored as objects in `server/data/trips.json`.

```json
{
  "id": "uuid-v4",
  "creatorId": "uuid-v4",
  "title": "Tokyo to Kyoto",
  "destination": "Tokyo, Japan",
  "startDate": "2026-01-14",
  "endDate": "2026-01-28",
  "budget": 1400,
  "buddiesNeeded": 2,
  "description": "Exploring temples and street food.",
  "styles": ["Culture", "Food"],
  "genderPreference": "any",
  "joinRequests": ["uuid-v4", "uuid-v4"],
  "createdAt": "2026-05-03T11:00:00.000Z"
}
```

**Required fields on creation**: `destination`, `startDate`, `endDate`, `budget`.  
**Optional fields**: `title`, `buddiesNeeded`, `description`, `styles`, `genderPreference` (defaults to `"any"`).  
`id`, `creatorId`, `joinRequests` (default `[]`), and `createdAt` are set by the server.

### Connection

Stored as objects in `server/data/connections.json`.

```json
{
  "id": "uuid-v4",
  "fromId": "uuid-v4",
  "toId": "uuid-v4",
  "createdAt": "2026-05-03T11:00:00.000Z"
}
```

### User (existing, extended)

The existing user record in `users.json` does not need structural changes. The buddy matching algorithm reads `styles` from the user's profile if present (set via the Profile panel). The `styles` field is an array of strings (e.g. `["Adventure", "Culture"]`).

---

## Buddy Matching Algorithm

The `GET /api/users/matches` endpoint computes matches server-side:

1. Load all trips from `trips.json`.
2. Collect the **current user's destinations**: the set of `destination` values from trips where `creatorId === req.user.id` OR `joinRequests` includes `req.user.id`.
3. If the current user has no destinations, return `[]`.
4. Load all users from `users.json`. Exclude the current user.
5. For each other user, collect their destinations (same rule: created + joined trips).
6. **Destination overlap**: a candidate matches if their destination set intersects with the current user's destination set (case-insensitive substring match — e.g. `"Tokyo"` matches `"Tokyo, Japan"`).
7. **Style boost** (optional ranking): among matching candidates, sort those who share at least one travel style (from `user.styles`) to the top.
8. Return the top 5 candidates. Each result includes: `{ id, name, matchedDestination }` where `matchedDestination` is the first overlapping destination found.

```
matchedDestination = first destination in candidate's trips
                     that overlaps with any of the current user's destinations
```

---

## Filter Logic

The `GET /api/trips` handler applies filters in sequence. All filters are optional and independent.

| Query param   | Type   | Behaviour |
|---------------|--------|-----------|
| `destination` | string | Case-insensitive substring match on `trip.destination` |
| `style`       | string | `trip.styles` array includes value (case-insensitive) |
| `minBudget`   | number | `trip.budget >= minBudget` |
| `maxBudget`   | number | `trip.budget <= maxBudget` |
| `duration`    | string | Day count derived from `startDate`/`endDate`: `weekend`=1–3, `short`=4–7, `medium`=8–14, `long`=15+ |
| `gender`      | string | Skip if `"any"`; else `trip.genderPreference === gender` |

Results are always sorted by `startDate` ascending before returning.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Trip creation round-trip

*For any* valid trip payload (non-empty destination, startDate, endDate, budget), creating a trip via `POST /api/trips` and then fetching `GET /api/trips` should return a list that contains a trip with the same destination, startDate, endDate, and budget as the one submitted.

**Validates: Requirements 1.1**

---

### Property 2: Auth rejection for any invalid token

*For any* string that is not a valid JWT (empty string, random characters, expired token, truncated token), sending it as a Bearer token to any protected endpoint should always return HTTP 401 with an `error` field.

**Validates: Requirements 1.3, 3.8, 7.5**

---

### Property 3: Required-field validation rejects incomplete trips

*For any* trip payload with at least one required field (destination, startDate, endDate, budget) missing or set to an empty string, `POST /api/trips` should return HTTP 400 with an `error` field.

**Validates: Requirements 1.4**

---

### Property 4: My Trips isolation

*For any* two distinct authenticated users each with a non-empty set of trips, `GET /api/trips/mine` for user A should return only trips whose `creatorId` equals user A's id, and never include any trip created by user B.

**Validates: Requirements 2.2**

---

### Property 5: Trip list is sorted by startDate ascending

*For any* non-empty set of trips stored in `trips.json`, `GET /api/trips` (with no filters) should return a list where every consecutive pair of trips satisfies `trips[i].startDate <= trips[i+1].startDate`.

**Validates: Requirements 3.2**

---

### Property 6: Join request adds user to joinRequests

*For any* trip and any authenticated user who is not the trip's creator, sending `POST /api/trips/:id/join` should result in the trip's `joinRequests` array containing that user's id.

**Validates: Requirements 3.4**

---

### Property 7: Duplicate join request returns 409

*For any* trip and any user who has already joined it, sending a second `POST /api/trips/:id/join` should always return HTTP 409 with an `error` field, and the `joinRequests` array should not contain the user's id more than once.

**Validates: Requirements 3.5**

---

### Property 8: Filter results satisfy all active filter constraints simultaneously

*For any* combination of filter parameters (destination, style, minBudget, maxBudget, duration, gender) and any backing trip dataset, every trip returned by `GET /api/trips` with those filters applied must satisfy every active constraint. Omitted parameters must not restrict results.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

---

### Property 9: Buddy matches exclude current user and have destination overlap

*For any* authenticated user with at least one trip, `GET /api/users/matches` should return a list where: (a) no entry has `id` equal to the current user's id, (b) every entry has at least one trip whose destination overlaps with at least one of the current user's trip destinations, and (c) the list contains at most 5 entries.

**Validates: Requirements 6.2**

---

### Property 10: Connection record round-trip

*For any* two distinct valid user ids, calling `POST /api/users/:id/connect` should create a record in `connections.json` with `fromId` equal to the requesting user's id, `toId` equal to the target id, and a valid ISO `createdAt` timestamp.

**Validates: Requirements 7.2**

---

### Property 11: Duplicate connection returns 409

*For any* pair of users where a connection already exists from user A to user B, sending a second `POST /api/users/B/connect` as user A should always return HTTP 409 with an `error` field, and `connections.json` should not contain duplicate `(fromId, toId)` pairs.

**Validates: Requirements 7.3**

---

### Property 12: Store read/write round-trip

*For any* valid trip object written via `tripStore.create`, calling `tripStore.findById` with the returned id should produce an object with identical field values. The same property holds for `connectionStore.create` and a subsequent read.

**Validates: Requirements 8.1, 8.2**

---

## Error Handling

All server errors follow the existing `AppError` + `asyncHandler` pattern.

| Scenario | HTTP status | Response body |
|---|---|---|
| Missing/invalid JWT | 401 | `{ error: "Authentication required." }` |
| Creator tries to join own trip | 403 | `{ error: "You cannot join your own trip." }` |
| Trip not found | 404 | `{ error: "Trip not found." }` |
| User not found | 404 | `{ error: "User not found." }` |
| Duplicate join request | 409 | `{ error: "You have already requested to join this trip." }` |
| Duplicate connection | 409 | `{ error: "Connection already exists." }` |
| Missing required trip fields | 400 | `{ error: "destination, startDate, endDate, and budget are required." }` |
| Internal/unexpected error | 500 | `{ error: "Internal server error." }` |

Each router registers its own error-handling middleware (four-argument `(err, req, res, next)`) at the bottom, identical to `auth/router.js`.

**Client-side error handling**:
- Each panel wraps its fetch in a `try/catch`.
- On error, the panel sets an `error` state string and renders it in place of the data.
- The panel never crashes — it always renders either data, an empty state, or an error message.

---

## Testing Strategy

### Unit Tests

Focus on the pure logic layers that don't require a running server or file system:

- **Filter logic**: test each filter predicate in isolation with concrete examples and edge cases (empty string, case differences, boundary budget values, duration boundaries).
- **Buddy matching algorithm**: test destination overlap detection, style-boost sorting, and the 5-result cap with concrete user/trip fixtures.
- **Store helpers**: test `tripStore` and `connectionStore` read/write round-trips using a temp file path to avoid touching real data files.
- **Client `api.js` helpers**: test that `authHeaders()` reads from `localStorage` and that each helper constructs the correct URL and method.

### Property-Based Tests

Use a property-based testing library (e.g. **fast-check** for JavaScript/Node) with a minimum of **100 iterations per property**.

Each property test is tagged with a comment in the format:
`// Feature: trips-core, Property N: <property text>`

Properties to implement as property-based tests:

| Property | What to generate | What to assert |
|---|---|---|
| P1: Trip creation round-trip | Random valid trip payloads | Created trip appears in GET /api/trips with matching fields |
| P2: Auth rejection | Random invalid token strings | Always 401 + error field |
| P3: Required-field validation | Trip payloads with each required field missing/empty | Always 400 + error field |
| P4: My Trips isolation | Two users with random trip sets | GET /api/trips/mine returns only own trips |
| P5: Sorted by startDate | Random trip sets with varying dates | Returned list is always sorted ascending |
| P6: Join adds to joinRequests | Random trips and non-creator users | joinRequests contains user id after join |
| P7: Duplicate join → 409 | Any trip + user who already joined | Second join always returns 409, no duplicates in array |
| P8: Filter constraints | Random filter combos + trip datasets | All returned trips satisfy all active filters |
| P9: Buddy match invariants | Random users with random trips | No self-match, all have overlap, max 5 results |
| P10: Connection round-trip | Random user id pairs | Connection record has correct fromId, toId, valid createdAt |
| P11: Duplicate connection → 409 | Any existing connection pair | Second connect always returns 409, no duplicate records |
| P12: Store round-trip | Random trip/connection objects | findById returns identical data after create |

### Integration / Smoke Tests

- **Smoke**: verify `/api/trips` and `/api/users/matches` routes are registered and respond (not 404).
- **Integration**: end-to-end flow — register user → create trip → join trip → connect with another user — verifying the full chain works against the real JSON files (using a test-specific data directory).
