# Requirements Document

## Introduction

TravelBuddy currently handles authentication entirely on the frontend — passwords are hashed with a weak djb2 algorithm and user records are stored in localStorage. This feature migrates authentication to the Express backend, replacing the insecure frontend approach with:

- bcrypt password hashing stored server-side
- JWT-based session tokens returned to and stored by the client
- Email OTP verification required during signup to confirm ownership of the email address
- Clean REST API endpoints that the existing React components will call instead of manipulating localStorage directly

The goal is a lean, correct auth system — no unnecessary complexity, no new frameworks beyond what is needed.

---

## Glossary

- **Auth_Service**: The Express backend module responsible for registration, login, OTP generation, and token issuance.
- **OTP**: A one-time password — a short-lived numeric code sent to a user's email address to verify ownership.
- **JWT**: JSON Web Token — a signed, stateless token the client stores and sends with authenticated requests.
- **Client**: The React + Vite frontend application running in the browser.
- **User**: A person registering or logging in to TravelBuddy.
- **Session**: The authenticated state represented by a valid JWT held by the Client.
- **OTP_Store**: An in-memory server-side map that holds pending OTPs keyed by email, each with a code and expiry timestamp.
- **User_Store**: The server-side persistent store (initially a JSON file) that holds registered user records.

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my name, email, and password, so that I can access TravelBuddy.

#### Acceptance Criteria

1. WHEN a registration request is received with a name, email, and password, THE Auth_Service SHALL validate that all three fields are present and non-empty.
2. WHEN a registration request contains an email that does not match the standard email format, THE Auth_Service SHALL return a 400 error with a descriptive message.
3. WHEN a registration request contains a password shorter than 8 characters, THE Auth_Service SHALL return a 400 error with a descriptive message.
4. WHEN a registration request contains an email already associated with a verified account, THE Auth_Service SHALL return a 409 error indicating the email is taken.
5. WHEN all registration fields are valid and the email is not already taken, THE Auth_Service SHALL hash the password using bcrypt with a cost factor of at least 10 and store the user record in the User_Store with `verified: false`.
6. WHEN a new user record is created, THE Auth_Service SHALL generate a 6-digit numeric OTP, store it in the OTP_Store with a 10-minute expiry, and send it to the user's email address.
7. WHEN the OTP is sent successfully, THE Auth_Service SHALL return a 201 response indicating that email verification is required before login is permitted.

---

### Requirement 2: Email OTP Verification

**User Story:** As a newly registered user, I want to verify my email address with a one-time code, so that my account is activated and I can log in.

#### Acceptance Criteria

1. WHEN an OTP verification request is received with an email and a code, THE Auth_Service SHALL look up the OTP_Store entry for that email.
2. IF no OTP entry exists for the provided email, THEN THE Auth_Service SHALL return a 400 error indicating the code is invalid or expired.
3. IF the current time is past the OTP entry's expiry timestamp, THEN THE Auth_Service SHALL delete the entry from the OTP_Store and return a 400 error indicating the code has expired.
4. IF the provided code does not match the stored code, THEN THE Auth_Service SHALL return a 400 error indicating the code is incorrect.
5. WHEN the provided code matches the stored code and has not expired, THE Auth_Service SHALL mark the user record as `verified: true`, delete the OTP entry from the OTP_Store, and return a signed JWT.
6. THE Auth_Service SHALL sign JWTs using a secret key loaded from an environment variable and set an expiry of 7 days.

---

### Requirement 3: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I receive a JWT to access the application.

#### Acceptance Criteria

1. WHEN a login request is received with an email and password, THE Auth_Service SHALL look up the user record in the User_Store by email.
2. IF no user record exists for the provided email, THEN THE Auth_Service SHALL return a 401 error with a generic "invalid credentials" message.
3. IF the user record exists but `verified` is `false`, THEN THE Auth_Service SHALL return a 403 error indicating the email has not been verified.
4. WHEN the user record is found and verified, THE Auth_Service SHALL compare the provided password against the stored bcrypt hash.
5. IF the password does not match the bcrypt hash, THEN THE Auth_Service SHALL return a 401 error with a generic "invalid credentials" message.
6. WHEN the password matches, THE Auth_Service SHALL return a signed JWT containing the user's id, name, and email, with a 7-day expiry.

---

### Requirement 4: JWT Authentication Middleware

**User Story:** As a developer, I want protected routes to verify the JWT automatically, so that only authenticated users can access them.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose a middleware function that reads the `Authorization` header and extracts a Bearer token.
2. IF the `Authorization` header is absent or does not contain a Bearer token, THEN THE Auth_Service SHALL return a 401 error.
3. IF the token is present but fails JWT verification (invalid signature, expired, malformed), THEN THE Auth_Service SHALL return a 401 error.
4. WHEN the token is valid, THE Auth_Service SHALL attach the decoded user payload to the request object and call the next middleware.

---

### Requirement 5: Client Integration

**User Story:** As a user, I want the login and signup forms to communicate with the backend, so that my credentials are handled securely.

#### Acceptance Criteria

1. WHEN the signup form is submitted, THE Client SHALL send a POST request to `/api/auth/register` with the user's name, email, and password.
2. WHEN the register response indicates OTP verification is required, THE Client SHALL display an OTP input step within the existing AuthModal flow.
3. WHEN the OTP form is submitted, THE Client SHALL send a POST request to `/api/auth/verify-otp` with the email and code.
4. WHEN the login form is submitted, THE Client SHALL send a POST request to `/api/auth/login` with the email and password.
5. WHEN a JWT is received from the Auth_Service, THE Client SHALL store it in localStorage under the key `tb_token` and store the user's name and email in sessionStorage under `tb_session`.
6. WHEN the user logs out, THE Client SHALL remove `tb_token` from localStorage and `tb_session` from sessionStorage.
7. THE Client SHALL remove all calls to the legacy `hashPassword`, `getUsers`, `saveUsers` functions and replace them with API calls.

---

### Requirement 6: OTP Email Delivery

**User Story:** As a user, I want to receive my OTP by email, so that I can verify my address.

#### Acceptance Criteria

1. WHEN an OTP is generated, THE Auth_Service SHALL send an email to the user's address containing the 6-digit code and a plain-language explanation of its purpose.
2. THE Auth_Service SHALL use Nodemailer with an SMTP configuration loaded from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
3. IF the SMTP configuration is missing or the email send fails, THEN THE Auth_Service SHALL log the error and return a 500 error to the caller.
4. WHERE a `DEV_MODE` environment variable is set to `true`, THE Auth_Service SHALL log the OTP to the server console instead of sending an email, to support local development without an SMTP server.
