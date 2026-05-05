# Implementation Plan: Backend Auth with OTP

## Overview

Migrate TravelBuddy authentication from the insecure frontend-only approach (djb2 + localStorage) to a proper Express backend with bcrypt, JWT, and email OTP verification. The work is split into server modules, server wiring, gitignore hygiene, and client updates.

## Tasks

- [x] 1. Install server dependencies and create environment file
  - In `server/`, install `bcrypt`, `jsonwebtoken`, `nodemailer`, and `uuid` as production dependencies
  - Create `server/.env` with placeholder values for `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `DEV_MODE=true`
  - _Requirements: 1.5, 2.6, 3.6, 6.2_

- [x] 2. Update .gitignore
  - Add `server/.env` to `.gitignore` (the root `.gitignore` currently only has `.env`)
  - Add `server/data/users.json` to `.gitignore`
  - _Requirements: (project hygiene — no specific requirement number, but implied by confirmed decisions)_

- [x] 3. Implement `server/data/userStore.js`
  - Create `server/data/` directory
  - Implement `findByEmail(email)`, `findById(id)`, `create(userData)`, and `update(id, changes)` using synchronous `fs.readFileSync` / `fs.writeFileSync` on `server/data/users.json`
  - `create` assigns a UUID v4 and an ISO `createdAt` timestamp before writing
  - Initialise the file with an empty array `[]` if it does not exist
  - [x] 3.1 Implement userStore read/write helpers
    - _Requirements: 1.5, 2.5, 3.1_
  - [ ]* 3.2 Write property test for userStore round-trip
    - **Property 1 (partial): Valid registration produces a stored user**
    - **Validates: Requirements 1.5**
    - Use a temp file path so real data is never touched

- [x] 4. Implement `server/auth/jwtService.js`
  - Implement `sign(payload)` — signs with `JWT_SECRET` env var, `HS256`, 7-day expiry
  - Implement `verify(token)` — throws on invalid/expired/malformed token
  - [x] 4.1 Implement sign and verify helpers
    - _Requirements: 2.6, 3.6_
  - [ ]* 4.2 Write property test for JWT round-trip
    - **Property 6: JWT round-trip preserves payload**
    - **Validates: Requirements 2.6, 3.6**

- [x] 5. Implement `server/auth/otpService.js`
  - Module-level `Map` keyed by lowercase email holding `{ code, expiresAt }`
  - Implement `generateAndStore(email)` — generates a 6-digit zero-padded string, stores with `Date.now() + 10 * 60 * 1000` expiry, returns the code
  - Implement `verify(email, code)` — throws `AppError` for missing entry (400), expired entry (400, deletes entry), wrong code (400); deletes entry on success
  - [x] 5.1 Implement OTP generation and verification
    - _Requirements: 1.6, 2.1, 2.2, 2.3, 2.4_
  - [ ]* 5.2 Write property test for OTP expiry and correctness
    - **Property 5: Expired or wrong OTP is rejected**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  - [ ]* 5.3 Write property test for correct OTP verification
    - **Property 4: Correct OTP verifies and issues a JWT**
    - **Validates: Requirements 2.1, 2.5**

- [x] 6. Implement `server/auth/emailService.js`
  - Implement `sendOtp(email, code)` — if `DEV_MODE === 'true'`, log the code to console; otherwise create a Nodemailer transporter from `SMTP_*` env vars and send an email containing the 6-digit code
  - Throw an `AppError` (500) if the send fails
  - [x] 6.1 Implement sendOtp with DEV_MODE fallback
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 6.2 Write property test for OTP email content
    - **Property 11: OTP email contains the code**
    - **Validates: Requirements 6.1, 6.4**

- [x] 7. Implement `server/auth/authService.js` and shared error utilities
  - Create `server/auth/AppError.js` — `class AppError extends Error` with `statusCode` field
  - Create `server/auth/asyncHandler.js` — wraps an async route handler and forwards thrown errors to `next`
  - Implement `register(name, email, password)` — validates fields, checks for duplicate verified email (409), bcrypts password (cost 10), calls `userStore.create`, calls `otpService.generateAndStore`, calls `emailService.sendOtp`, returns `{ message }`
  - Implement `verifyOtp(email, code)` — calls `otpService.verify`, calls `userStore.update` to set `verified: true`, calls `jwtService.sign`, returns `{ token, user }`
  - Implement `login(email, password)` — looks up user, checks verified (403), bcrypt-compares password (401 on mismatch), calls `jwtService.sign`, returns `{ token, user }`
  - [x] 7.1 Implement register, verifyOtp, and login business logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 7.2 Write property test for valid registration
    - **Property 1: Valid registration produces a stored, unverified user**
    - **Validates: Requirements 1.1, 1.5, 1.6**
  - [ ]* 7.3 Write property test for duplicate email rejection
    - **Property 2: Duplicate email is rejected**
    - **Validates: Requirements 1.4**
  - [ ]* 7.4 Write property test for invalid registration inputs
    - **Property 3: Invalid registration inputs are rejected**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [ ]* 7.5 Write property test for login with correct credentials
    - **Property 7: Login with correct credentials returns a matching JWT**
    - **Validates: Requirements 3.1, 3.4, 3.6**
  - [ ]* 7.6 Write property test for login rejecting invalid attempts
    - **Property 8: Login rejects all invalid attempts**
    - **Validates: Requirements 3.2, 3.3, 3.5**

- [x] 8. Implement `server/auth/middleware.js`
  - Implement `requireAuth(req, res, next)` — reads `Authorization` header, extracts Bearer token, calls `jwtService.verify`, attaches decoded payload to `req.user`, calls `next()`
  - Return 401 for missing header, non-Bearer scheme, expired token, invalid signature, or malformed token
  - [x] 8.1 Implement requireAuth middleware
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 8.2 Write property test for requireAuth
    - **Property 9: requireAuth passes valid tokens and rejects all others**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 9. Implement `server/auth/router.js`
  - Create an Express router with three routes, each wrapped in `asyncHandler`:
    - `POST /register` → calls `authService.register`, responds 201
    - `POST /verify-otp` → calls `authService.verifyOtp`, responds 200
    - `POST /login` → calls `authService.login`, responds 200
  - Add an Express error-handling middleware at the bottom of the router file that reads `err.statusCode` (defaulting to 500) and returns `{ error: err.message }`
  - _Requirements: 1.7, 2.5, 3.6_

- [x] 10. Mount auth router in `server/server.js`
  - Add `express.json()` middleware before the router
  - Import and mount the auth router at `/api/auth`
  - Load `dotenv` (or read `process.env` directly) so env vars from `server/.env` are available at startup
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 11. Checkpoint — verify server endpoints manually or with a REST client
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Replace `client/src/utils/auth.js` with API helpers
  - Remove `hashPassword`, `getUsers`, `saveUsers`
  - Add `registerUser(name, email, password)` — `fetch` POST `/api/auth/register`, throws `Error` with server's `error` field on non-2xx
  - Add `verifyOtp(email, code)` — `fetch` POST `/api/auth/verify-otp`
  - Add `loginUser(email, password)` — `fetch` POST `/api/auth/login`
  - Update `setSession(name, email, token)` to also store `token` in `localStorage` under `tb_token`
  - Update `clearSession()` to also remove `tb_token` from `localStorage`
  - Keep `getSession()` and `isValidEmail()` unchanged
  - [x] 12.1 Implement API helpers and updated session utilities
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [ ]* 12.2 Write property test for client session storage round-trip
    - **Property 10: Client session storage round-trip**
    - **Validates: Requirements 5.5, 5.6**

- [x] 13. Update `client/src/components/SignupForm.jsx`
  - Replace all imports from `../utils/auth.js` with `registerUser` and `isValidEmail`
  - Remove local duplicate-check and `saveUsers` / `setSession` calls
  - On submit, call `registerUser(name, email, password)` inside a `try/catch`; on success (201) call `onSuccess({ email })` to signal the OTP step; on error display the server message
  - Keep client-side pre-validation (non-empty name, valid email, password ≥ 8 chars) to avoid unnecessary round-trips
  - _Requirements: 5.1, 5.2_

- [x] 14. Create `client/src/components/OtpForm.jsx`
  - Props: `{ email, onSuccess, onBack }`
  - Renders a single 6-digit code input, a submit button, and a "Back" link that calls `onBack`
  - On submit, calls `verifyOtp(email, code)` from `../utils/auth.js`; on success calls `setSession(user.name, user.email, token)` then `onSuccess({ name: user.name, email: user.email })`; on error displays the server message
  - Include a disabled "Resend code" link (placeholder for future iteration)
  - _Requirements: 5.2, 5.3, 5.5_

- [x] 15. Update `client/src/components/LoginForm.jsx`
  - Replace all imports from `../utils/auth.js` with `loginUser`, `setSession`, and `isValidEmail`
  - Remove `hashPassword`, `getUsers` calls
  - On submit, call `loginUser(email, password)` inside a `try/catch`; on success call `setSession(user.name, user.email, token)` then `onSuccess({ name: user.name, email: user.email })`; on error display the server message (handles 401 and 403 messages from the server)
  - _Requirements: 5.4, 5.5_

- [x] 16. Update `client/src/components/AuthModal.jsx`
  - Add `otpEmail` state (string, initially `''`)
  - Add a third internal view state `'otp'` alongside `'login'` and `'signup'`
  - When `SignupForm` calls `onSuccess({ email })`, set `otpEmail` to that email and switch view to `'otp'`
  - Render `OtpForm` when view is `'otp'`, passing `email={otpEmail}`, `onSuccess={onSuccess}`, and `onBack={() => setView('signup')}`
  - Hide the tab bar (`modal-tabs`) when view is `'otp'`
  - _Requirements: 5.2_

- [x] 17. Final checkpoint — end-to-end smoke test
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` and should be placed in a `server/__tests__/` directory
- `DEV_MODE=true` is set in `server/.env` by default so no SMTP server is needed during development — the OTP will appear in the server console
- `server/data/users.json` and `server/.env` are gitignored and must never be committed
- The `requireAuth` middleware is implemented in task 8 but not yet applied to any routes — Socket.io JWT auth is out of scope for this feature
