# Requirements Document

## Introduction

The trips-core feature replaces all hardcoded trip and user data in the TravelBuddy frontend with a real backend. It adds JSON-file-backed persistence for trips and connections, exposes a set of REST endpoints on the existing Express server, and wires the React dashboard panels to those endpoints. Auth follows the existing JWT pattern already used for the auth module. Read operations (browsing, searching, filtering trips) are public; write operations (create trip, join trip, connect with a user) require a valid JWT.

## Glossary

- **Trip**: A travel plan created by a registered user, stored in `server/data/trips.json`.
- **Trip_Creator**: The authenticated user who submitted `POST /api/trips`.
- **Join_Request**: A record indicating that a user wants to participate in a Trip they did not create, stored inside the trip document.
- **Connection**: A directional "connect" action from one user to another, stored in `server/data/connections.json`.
- **Buddy_Match**: A user who has at least one Trip whose destination overlaps with destinations in the current user's trips.
- **Trip_Store**: The server-side module that reads and writes `trips.json`, mirroring the pattern of `userStore.js`.
- **Connection_Store**: The server-side module that reads and writes `connections.json`.
- **API**: The Express HTTP server running on port 3001.
- **Client**: The React + Vite frontend running on port 5173.
- **JWT**: The JSON Web Token stored in `localStorage` under the key `tb_token`, used to authenticate write requests.

---

## Requirements

### Requirement 1: Create a Trip

**User Story:** As a logged-in user, I want to submit the Create Trip form and have my trip saved, so that other travelers can discover and join it.

#### Acceptance Criteria

1. WHEN an authenticated user submits the Create Trip form with a non-empty destination, start date, end date, and budget, THE API SHALL persist the trip to `trips.json` and return the created trip object with a generated `id` and `createdAt` timestamp.
2. WHEN the Create Trip form is submitted, THE Client SHALL include the JWT in the `Authorization: Bearer <token>` header of the `POST /api/trips` request.
3. IF the `Authorization` header is missing or invalid, THEN THE API SHALL return HTTP 401 with an `error` field.
4. IF any required field (destination, startDate, endDate, budget) is missing or empty, THEN THE API SHALL return HTTP 400 with a descriptive `error` field.
5. WHEN a trip is successfully created, THE Client SHALL navigate the user to the My Trips panel.

---

### Requirement 2: My Trips

**User Story:** As a logged-in user, I want to see only my own trips in the My Trips panel, so that I can track the trips I have created.

#### Acceptance Criteria

1. WHEN the My Trips panel mounts, THE Client SHALL send `GET /api/trips/mine` with the JWT in the `Authorization` header.
2. THE API SHALL return only trips whose `creatorId` matches the authenticated user's `id`.
3. WHEN the API returns trips, THE Client SHALL render each trip's title, destination, dates, budget, and status (upcoming vs. past based on whether `startDate` is in the future).
4. IF the user has no trips, THE Client SHALL display an empty-state message instead of the hardcoded placeholder cards.
5. IF the request fails or the token is invalid, THE Client SHALL display an error message and not crash.

---

### Requirement 3: Browse and Join Trips

**User Story:** As a user, I want to browse all open trips and request to join one, so that I can find travel companions.

#### Acceptance Criteria

1. WHEN the Join a Trip panel mounts, THE Client SHALL fetch `GET /api/trips` (no auth required) and render the returned trips.
2. THE API SHALL return all trips stored in `trips.json`, ordered by `startDate` ascending.
3. WHEN an authenticated user clicks "Request to Join" on a trip they did not create, THE Client SHALL send `POST /api/trips/:id/join` with the JWT.
4. THE API SHALL add the requesting user's `id` to the trip's `joinRequests` array and return the updated trip.
5. IF the user has already sent a join request for that trip, THEN THE API SHALL return HTTP 409 with an `error` field, and THE Client SHALL show the button in a "Requested" state without duplicating the request.
6. IF the user is the Trip_Creator of that trip, THEN THE API SHALL return HTTP 403 with an `error` field.
7. IF the trip `id` does not exist, THEN THE API SHALL return HTTP 404 with an `error` field.
8. IF the `Authorization` header is missing or invalid on a join request, THEN THE API SHALL return HTTP 401 with an `error` field.

---

### Requirement 4: Filter Trips

**User Story:** As a user, I want to filter the trip list by destination, travel style, budget range, duration, and gender preference, so that I can find trips that match my plans.

#### Acceptance Criteria

1. WHEN the user clicks "Apply Filters", THE Client SHALL send `GET /api/trips` with query parameters: `destination`, `style`, `minBudget`, `maxBudget`, `duration`, and `gender`.
2. THE API SHALL apply each provided filter parameter independently; omitted parameters SHALL NOT restrict results.
3. WHEN `destination` is provided, THE API SHALL return only trips whose `destination` field contains the query string (case-insensitive).
4. WHEN `style` is provided, THE API SHALL return only trips whose `styles` array includes the given value (case-insensitive).
5. WHEN `minBudget` and/or `maxBudget` are provided, THE API SHALL return only trips whose `budget` falls within the specified range (inclusive).
6. WHEN `duration` is provided, THE API SHALL return only trips whose day-count falls within the matching range: `weekend` = 1–3 days, `short` = 4–7 days, `medium` = 8–14 days, `long` = 15+ days.
7. WHEN `gender` is provided and is not `any`, THE API SHALL return only trips whose `genderPreference` matches the given value.
8. WHEN filters return results, THE Client SHALL render the matching trips in the filter results area.
9. WHEN filters return no results, THE Client SHALL display a "No trips found" message in the results area.

---

### Requirement 5: Search Bar

**User Story:** As a user, I want to type a destination in the Home panel search bar and be taken to filtered results, so that I can quickly find relevant trips.

#### Acceptance Criteria

1. WHEN a user types a non-empty query in the Home panel search bar and presses Enter, THE Client SHALL navigate to the Filter Trips panel with the search query pre-populated in the destination field.
2. WHEN the Filter Trips panel receives a pre-populated destination query, THE Client SHALL automatically trigger the filter request on mount.
3. THE Client SHALL pass the search query as the `destination` parameter to `GET /api/trips`.

---

### Requirement 6: Buddy Matches

**User Story:** As a logged-in user, I want to see real buddy match suggestions in the Home sidebar, so that I can discover other travelers heading to similar destinations.

#### Acceptance Criteria

1. WHEN the Home panel mounts and the user is authenticated, THE Client SHALL fetch `GET /api/users/matches` with the JWT.
2. THE API SHALL return up to 5 users (excluding the current user) who have at least one trip whose `destination` overlaps with any destination in the current user's trips.
3. WHEN the API returns matches, THE Client SHALL render each match's name and destination in the "New Buddy Matches" sidebar card.
4. IF the current user has no trips, THE API SHALL return an empty array and THE Client SHALL display an empty-state message in the sidebar card.
5. IF the request fails or the user is not authenticated, THE Client SHALL fall back to showing an empty list without crashing.

---

### Requirement 7: Connect with a User

**User Story:** As a logged-in user, I want to send a connection request to a buddy match, so that I can start building my travel network.

#### Acceptance Criteria

1. WHEN an authenticated user clicks "Connect" on a buddy match, THE Client SHALL send `POST /api/users/:id/connect` with the JWT.
2. THE API SHALL record the connection in `connections.json` as `{ fromId, toId, createdAt }` and return `{ success: true }`.
3. IF a connection from the current user to the target user already exists, THEN THE API SHALL return HTTP 409 with an `error` field, and THE Client SHALL keep the button in the "Sent" state.
4. IF the target user `id` does not exist, THEN THE API SHALL return HTTP 404 with an `error` field.
5. IF the `Authorization` header is missing or invalid, THEN THE API SHALL return HTTP 401 with an `error` field.
6. WHEN a connection is successfully recorded, THE Client SHALL update the button to show "Sent" and disable it for the remainder of the session.

---

### Requirement 8: Data Persistence

**User Story:** As a developer, I want trip and connection data stored in JSON files following the existing pattern, so that the codebase stays lean and consistent.

#### Acceptance Criteria

1. THE Trip_Store SHALL read from and write to `server/data/trips.json`, following the same read-all / write-all pattern as `server/data/userStore.js`.
2. THE Connection_Store SHALL read from and write to `server/data/connections.json`, following the same pattern.
3. IF `trips.json` does not exist when the server starts, THE Trip_Store SHALL initialise it as an empty array `[]`.
4. IF `connections.json` does not exist when the server starts, THE Connection_Store SHALL initialise it as an empty array `[]`.
5. THE API SHALL register the trips router at `/api/trips` and the users-matches/connect router at `/api/users` in `server/server.js`.
