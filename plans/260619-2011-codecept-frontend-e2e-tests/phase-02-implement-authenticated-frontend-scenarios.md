---
phase: 2
title: "Implement Authenticated Frontend Scenarios"
status: in-progress
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Implement Authenticated Frontend Scenarios

## Context Links

- `frontend/src/pages/auth/Login.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/pages/student/Dashboard.tsx`
- `frontend/src/components/Layout.tsx`

## Overview

Create Codecept scenarios that prove a real user can log in and access protected frontend pages. Backend and Firebase support the test, but assertions stay UI-focused.

## Requirements

- Functional: read test credentials from environment variables only.
- Functional: verify login redirects to the expected student dashboard.
- Functional: verify protected route stays accessible after login.
- Functional: verify sign-out returns to login.
- Non-functional: no committed credentials, no hardcoded private Firebase data.
- Non-functional: avoid backend data assumptions beyond successful authentication.

## Architecture

Default test account is a student account because backend JIT provisioning defaults new Firebase users to `student`. Admin-role testing is deferred unless a stable admin account is provided.

Primary assertions:
- `/login` shows `SPTS Login`.
- Login form accepts credentials.
- Authenticated UI shows `Sign Out`.
- Student dashboard shows `Welcome back` or student portal chrome.
- `/student/profile` remains protected but reachable after login.
- Logout navigates back to `/login`.

## Related Code Files

- Create: `frontend/codecept-tests/authenticated-login_test.js`.
- Optional modify: `frontend/src/pages/auth/Login.tsx` only if selectors are too brittle; prefer existing placeholders/text first.

## Implementation Steps

1. Create `authenticated-login_test.js` with `Feature('Authenticated frontend login')`.
2. Add a small credential helper inside the test:
   - Require `CODECEPT_TEST_EMAIL`.
   - Require `CODECEPT_TEST_PASSWORD`.
   - Default expected role to `student`.
3. Add a `Before` hook to clear cookies/local storage to avoid session leakage.
4. Scenario 1: login.
   - `I.amOnPage('/login')`.
   - `I.see('SPTS Login')`.
   - Fill email and password.
   - Click `Sign In`.
   - Wait for `/student/dashboard`.
   - Assert `Sign Out` and `Welcome back`.
5. Scenario 2: protected frontend route.
   - Reuse login helper.
   - Go to `/student/profile`.
   - Assert student profile UI or authenticated layout text.
6. Scenario 3: logout.
   - Reuse login helper.
   - Click `Sign Out`.
   - Wait for `/login`.
   - Assert `SPTS Login`.
7. Keep selectors text/CSS based. Do not add `data-testid` unless current UI is unreliable.

## Success Criteria

- [x] Missing credential env vars fail with a clear message.
- [ ] Login scenario passes with a real Firebase-backed test user.
- [ ] Protected route scenario passes after login.
- [ ] Logout scenario passes and returns to `/login`.
- [ ] Codecept terminal output shows passing scenarios with steps.

## Risk Assessment

- Risk: Firebase account password changes. Mitigation: store credentials only in local env or shell profile, document rotation.
- Risk: backend creates/revokes token state and blocks reused token. Mitigation: clear session before each scenario and avoid logout before scenarios that need auth.
- Risk: dashboard API calls fail due empty DB. Mitigation: assert layout/auth text; student dashboard already handles empty enrollments.
- Risk: UI text changes break tests. Mitigation: add stable selectors only where existing text/placeholder selectors fail.
