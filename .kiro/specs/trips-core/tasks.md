# Implementation Plan: trips-core

## Overview

Replace all hardcoded trip and user data in the TravelBuddy dashboard with a real backend. Add JSON-file-backed persistence for trips and connections, expose REST endpoints on the existing Express server, and wire the React dashboard panels to those endpoints.

## Tasks

- [x] 1. Create data stores
  - [x] 1.1 Create `server/data/tripStore.js` mirroring `userStore.js`, reading/writing `trips.json`
    - Implement `readAll`, `findById`, `findByCreator`, `create`, `update`, `remove`
    - Auto-initialise `trips.json` as `[]` if it does not exist
    - _Requirements: 8.1, 8.3_
  - [x] 1.2 Create `server/data/connectionStore.js` mirroring `userStore.js`, reading/writing `connections.json`
    - Implement `readAll`, `findByFrom`, `exists`, `create`
    - Auto-initialise `connections.json` as `[]` if it does not exist
    - _Requirements: 8.2, 8.4_
  - [ ]* 1.3 Write property test for store round-trip (Property 12)
    - **Property 12: Store read/write round-trip**
    - **Validates: Requirements 8.1, 8.2**

- [x] 2. Implement trips router
  - [x] 2.1 Create `server/trips/router.js` with `GET /api/trips` (public, filterable)
    - Apply destination, style, minBudget, maxBudget, duration, gender filters
    - Sort results by `startDate` ascending
    - _Requirements: 3.1, 3.2, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 2.2 Add `GET /api/trips/mine` (auth required)
    - Return only trips where `creatorId === req.user.id`
    - _Requirements: 2.1, 2.2_
  - [x] 2.3 Add `POST /api/trips` (auth required)
    - Validate required fields: destination, startDate, endDate, budget
    - Set `id` (uuid), `creatorId`, `joinRequests: []`, `createdAt` on server
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.4 Add `POST /api/trips/:id/join` (auth required)
    - Add user id to `joinRequests`; return 409 if already joined, 403 if creator, 404 if not found
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  - [ ]* 2.5 Write property test for trip creation round-trip (Property 1)
    - **Property 1: Trip creation round-trip**
    - **Validates: Requirements 1.1**
  - [ ]* 2.6 Write property test for auth rejection (Property 2)
    - **Property 2: Auth rejection for any invalid token**
    - **Validates: Requirements 1.3, 3.8, 7.5**
  - [ ]* 2.7 Write property test for required-field validation (Property 3)
    - **Property 3: Required-field validation rejects incomplete trips**
    - **Validates: Requirements 1.4**
  - [ ]* 2.8 Write property test for My Trips isolation (Property 4)
    - **Property 4: My Trips isolation**
    - **Validates: Requirements 2.2**
  - [ ]* 2.9 Write property test for sorted startDate (Property 5)
    - **Property 5: Trip list is sorted by startDate ascending**
    - **Validates: Requirements 3.2**
  - [ ]* 2.10 Write property test for join adds to joinRequests (Property 6)
    - **Property 6: Join request adds user to joinRequests**
    - **Validates: Requirements 3.4**
  - [ ]* 2.11 Write property test for duplicate join returns 409 (Property 7)
    - **Property 7: Duplicate join request returns 409**
    - **Validates: Requirements 3.5**
  - [ ]* 2.12 Write property test for filter constraints (Property 8)
    - **Property 8: Filter results satisfy all active filter constraints simultaneously**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement users router
  - [x] 4.1 Create `server/users/router.js` with `GET /api/users/matches` (auth required)
    - Implement buddy matching algorithm: collect current user's destinations, find overlapping users, sort by style overlap, return top 5 with `{ id, name, matchedDestination }`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 4.2 Add `POST /api/users/:id/connect` (auth required)
    - Record connection in `connections.json`; return 409 if duplicate, 404 if user not found
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 4.3 Write property test for buddy match invariants (Property 9)
    - **Property 9: Buddy matches exclude current user and have destination overlap**
    - **Validates: Requirements 6.2**
  - [ ]* 4.4 Write property test for connection round-trip (Property 10)
    - **Property 10: Connection record round-trip**
    - **Validates: Requirements 7.2**
  - [ ]* 4.5 Write property test for duplicate connection returns 409 (Property 11)
    - **Property 11: Duplicate connection returns 409**
    - **Validates: Requirements 7.3**

- [x] 5. Mount routers in server.js and update .gitignore
  - [x] 5.1 Import and mount `tripsRouter` at `/api/trips` and `usersRouter` at `/api/users` in `server/server.js`
    - _Requirements: 8.5_
  - [x] 5.2 Add `server/data/trips.json` and `server/data/connections.json` to `.gitignore`
    - _Requirements: 8.1, 8.2_

- [x] 6. Create client API helpers
  - [x] 6.1 Create `client/src/utils/api.js` with `getToken`, `authHeaders`, `fetchTrips`, `fetchMyTrips`, `createTrip`, `joinTrip`, `fetchMatches`, `connectUser`
    - Follow the pattern of `auth.js`; use `Authorization: Bearer <token>` for auth calls
    - _Requirements: 1.2, 2.1, 3.1, 3.3, 4.1, 5.3, 6.1, 7.1_

- [x] 7. Wire Dashboard panels to API
  - [x] 7.1 Lift `searchQuery` state to `Dashboard` root; pass `searchQuery` + `setSearchQuery` to `PanelHome` and `PanelFilter`
    - _Requirements: 5.1, 5.2_
  - [x] 7.2 Update `PanelHome`: search bar calls `setSearchQuery` + `onSwitch('filter')` on Enter; fetch buddy matches from `fetchMatches` API; render real matches with Connect button wired to `connectUser`
    - _Requirements: 5.1, 6.1, 6.3, 6.4, 6.5, 7.1, 7.6_
  - [x] 7.3 Update `PanelCreate`: wire form to `createTrip` API; navigate to `mytrips` on success; show error on failure
    - _Requirements: 1.1, 1.5_
  - [x] 7.4 Update `PanelMyTrips`: fetch from `fetchMyTrips` on mount; render real trips; show empty state if none; show error on failure
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  - [x] 7.5 Update `PanelJoin`: fetch from `fetchTrips` on mount; wire join button to `joinTrip` API; handle 409 (keep "Requested" state); show error on failure
    - _Requirements: 3.1, 3.3, 3.5_
  - [x] 7.6 Update `PanelFilter`: accept `searchQuery` prop; pre-populate destination input; auto-fire filter fetch on mount when `searchQuery` is set; wire Apply Filters button to `fetchTrips` with all filter params; render results or "No trips found"
    - _Requirements: 4.1, 4.8, 4.9, 5.2, 5.3_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
