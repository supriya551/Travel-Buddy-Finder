# Implementation Tasks: User Authentication

## Tasks

- [x] 1. Implement Auth_Module core utilities in script.js
  - [x] 1.1 Add `hashPassword(str)` — djb2-style hash returning unsigned decimal string
  - [x] 1.2 Add `getUsers()` / `saveUsers(users)` — localStorage read/write with try/catch
  - [x] 1.3 Add `getSession()` / `setSession(name, email)` / `clearSession()` — sessionStorage helpers
  - [x] 1.4 Add `showError(form, message)` / `clearError(form)` — inline error DOM helpers

- [x] 2. Implement signup handler in script.js
  - [x] 2.1 Replace existing `formSignup` submit handler with `handleSignup`
  - [x] 2.2 Validate name not empty (show "Name is required.")
  - [x] 2.3 Validate email format (show "Please enter a valid email address.")
  - [x] 2.4 Validate password length ≥ 8 (show "Password must be at least 8 characters.")
  - [x] 2.5 Check for duplicate email in User_Store (show "An account with this email already exists.")
  - [x] 2.6 Store new user `{name, email, passwordHash}` in User_Store
  - [x] 2.7 Create session via `setSession` and redirect to `dashboard.html`

- [x] 3. Implement login handler in script.js
  - [x] 3.1 Replace existing `formLogin` submit handler with `handleLogin`
  - [x] 3.2 Validate email not empty (show "Please enter a valid email address.")
  - [x] 3.3 Validate password not empty (show "Password is required.")
  - [x] 3.4 Look up email in User_Store (show "No account found with this email." if missing)
  - [x] 3.5 Compare `hashPassword(submitted)` against stored hash (show "Incorrect password." if mismatch)
  - [x] 3.6 Create session via `setSession` and redirect to `dashboard.html`

- [x] 4. Implement Dashboard_Guard in dashboard.js
  - [x] 4.1 Add `clearSession` helper (mirrors Auth_Module, needed in dashboard.js scope)
  - [x] 4.2 Add `initGuard()` — reads session, redirects to `index.html` if null
  - [x] 4.3 Add `personalizeUI(session)` — sets `.profile-name` and `.avatar` from session
  - [x] 4.4 Add `attachLogout()` — wires all `.logout-link` elements and `#profile-dropdown` Logout link
  - [x] 4.5 Call `initGuard()` at the top of `dashboard.js` before any existing code runs

- [x] 5. Add auth-error styles to style.css
  - [x] 5.1 Add `.auth-error` style — red text, small font, margin-top beneath form fields
