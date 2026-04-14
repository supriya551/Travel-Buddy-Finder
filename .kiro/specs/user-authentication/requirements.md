# Requirements Document

## Introduction

This feature adds real client-side authentication to the Travel Buddy Finder web app. Currently the login and signup forms redirect to the dashboard without any validation or credential storage. The goal is to implement a complete authentication flow using `localStorage` for persistent user storage and `sessionStorage` for session management — all in vanilla JavaScript with no backend or build tools.

The existing modal UI in `index.html` (login form: email + password; signup form: name + email + password) will be wired up to real logic. The dashboard will be protected so only authenticated users can access it, and the hardcoded username "Supriya" will be replaced with the actual logged-in user's name.

---

## Glossary

- **Auth_Module**: The JavaScript authentication logic in `script.js` responsible for signup, login, session management, and validation.
- **Dashboard_Guard**: The JavaScript logic in `dashboard.js` responsible for protecting the dashboard page from unauthenticated access.
- **User_Store**: The `localStorage` key (`tb_users`) that holds the array of registered user objects (name, email, hashed password).
- **Session_Store**: The `sessionStorage` key (`tb_session`) that holds the currently logged-in user's data (name, email).
- **Login_Form**: The `#form-login` HTML form in `index.html` containing email and password fields.
- **Signup_Form**: The `#form-signup` HTML form in `index.html` containing name, email, and password fields.
- **Error_Message**: An inline `<p>` element rendered beneath a form to display validation or authentication failure feedback.
- **Password_Hash**: A deterministic string derived from the plain-text password using a simple client-side hashing function (e.g., a djb2-style hash), stored in the User_Store instead of plain text.

---

## Requirements

### Requirement 1: User Registration (Sign Up)

**User Story:** As a new visitor, I want to create an account with my name, email, and password, so that I can access the Travel Buddy Finder dashboard.

#### Acceptance Criteria

1. WHEN the Signup_Form is submitted, THE Auth_Module SHALL validate that the name field is not empty.
2. WHEN the Signup_Form is submitted, THE Auth_Module SHALL validate that the email field contains a properly formatted email address matching the pattern `[characters]@[characters].[characters]`.
3. WHEN the Signup_Form is submitted, THE Auth_Module SHALL validate that the password field contains at least 8 characters.
4. WHEN the Signup_Form is submitted with a valid name, email, and password, THE Auth_Module SHALL check the User_Store for an existing account with the same email address.
5. IF an account with the submitted email already exists in the User_Store, THEN THE Auth_Module SHALL display an Error_Message stating "An account with this email already exists."
6. WHEN the Signup_Form is submitted with a valid name, email, and password that does not already exist in the User_Store, THE Auth_Module SHALL store a new user object containing the name, email, and Password_Hash in the User_Store.
7. WHEN a new user is successfully stored, THE Auth_Module SHALL create a session in the Session_Store containing the new user's name and email.
8. WHEN a new session is created after signup, THE Auth_Module SHALL redirect the browser to `dashboard.html`.

---

### Requirement 2: User Login

**User Story:** As a returning user, I want to log in with my email and password, so that I can access my personalized dashboard.

#### Acceptance Criteria

1. WHEN the Login_Form is submitted, THE Auth_Module SHALL validate that the email field is not empty.
2. WHEN the Login_Form is submitted, THE Auth_Module SHALL validate that the password field is not empty.
3. WHEN the Login_Form is submitted with a non-empty email and password, THE Auth_Module SHALL look up the email in the User_Store.
4. IF the submitted email is not found in the User_Store, THEN THE Auth_Module SHALL display an Error_Message stating "No account found with this email."
5. IF the submitted email is found but the Password_Hash of the submitted password does not match the stored Password_Hash, THEN THE Auth_Module SHALL display an Error_Message stating "Incorrect password."
6. WHEN the submitted email and password match a record in the User_Store, THE Auth_Module SHALL create a session in the Session_Store containing the matched user's name and email.
7. WHEN a session is created after a successful login, THE Auth_Module SHALL redirect the browser to `dashboard.html`.

---

### Requirement 3: Input Validation and Error Display

**User Story:** As a user filling in the auth forms, I want to see clear inline error messages for invalid inputs, so that I know exactly what to fix before submitting.

#### Acceptance Criteria

1. WHEN a validation error occurs on the Signup_Form or Login_Form, THE Auth_Module SHALL display the Error_Message directly beneath the relevant form, inside the modal.
2. WHEN the user corrects the form and resubmits, THE Auth_Module SHALL clear any previously displayed Error_Message before re-validating.
3. IF the name field on the Signup_Form is empty on submission, THEN THE Auth_Module SHALL display an Error_Message stating "Name is required."
4. IF the email field on the Signup_Form or Login_Form contains an invalid format on submission, THEN THE Auth_Module SHALL display an Error_Message stating "Please enter a valid email address."
5. IF the password field on the Signup_Form contains fewer than 8 characters on submission, THEN THE Auth_Module SHALL display an Error_Message stating "Password must be at least 8 characters."
6. IF the password field on the Login_Form is empty on submission, THEN THE Auth_Module SHALL display an Error_Message stating "Password is required."

---

### Requirement 4: Dashboard Session Protection

**User Story:** As the application, I want to prevent unauthenticated users from viewing the dashboard, so that only logged-in users can access their travel data.

#### Acceptance Criteria

1. WHEN `dashboard.html` is loaded, THE Dashboard_Guard SHALL read the Session_Store to check for an active session.
2. IF no active session exists in the Session_Store when `dashboard.html` loads, THEN THE Dashboard_Guard SHALL immediately redirect the browser to `index.html`.
3. WHILE an active session exists in the Session_Store, THE Dashboard_Guard SHALL allow the dashboard page to render normally.

---

### Requirement 5: Dashboard Personalization

**User Story:** As a logged-in user, I want to see my own name on the dashboard, so that the experience feels personal and confirms I am logged in as myself.

#### Acceptance Criteria

1. WHEN `dashboard.html` loads with an active session, THE Dashboard_Guard SHALL read the logged-in user's name from the Session_Store.
2. WHEN the user's name is retrieved from the Session_Store, THE Dashboard_Guard SHALL replace the text content of the `.profile-name` element with the user's name.
3. WHEN the user's name is retrieved from the Session_Store, THE Dashboard_Guard SHALL replace the text content of the `.avatar` element with the first letter of the user's name, uppercased.

---

### Requirement 6: Logout

**User Story:** As a logged-in user, I want to log out, so that my session is cleared and no one else can access my account on this device.

#### Acceptance Criteria

1. WHEN a logout link is clicked on `dashboard.html`, THE Dashboard_Guard SHALL remove the active session from the Session_Store.
2. WHEN the session is removed, THE Dashboard_Guard SHALL redirect the browser to `index.html`.
3. THE Dashboard_Guard SHALL attach logout behavior to all anchor elements with the class `logout-link` and to the "Logout" link inside `#profile-dropdown`.

---

### Requirement 7: Password Hashing

**User Story:** As the application, I want to avoid storing plain-text passwords in localStorage, so that user credentials are not trivially exposed if localStorage is inspected.

#### Acceptance Criteria

1. THE Auth_Module SHALL implement a Password_Hash function that accepts a plain-text string and returns a deterministic numeric or alphanumeric hash string.
2. WHEN storing a new user in the User_Store, THE Auth_Module SHALL store the Password_Hash of the password, not the plain-text password.
3. WHEN verifying a login attempt, THE Auth_Module SHALL compare the Password_Hash of the submitted password against the stored Password_Hash.
4. FOR ALL plain-text password strings, applying the Password_Hash function twice SHALL produce the same result as applying it once (idempotence of the stored value — hashing the hash is not used in verification, but the function itself must be deterministic and stable).
