---
title: "Codecept Frontend E2E Tests"
description: "Add CodeceptJS beside Playwright to test authenticated frontend behavior with backend and Firebase support, plus local HTML reports."
status: in-progress
priority: P2
effort: 5h
branch: "main"
tags: [feature, frontend, auth, testing]
blockedBy: []
blocks: []
created: "2026-06-19"
createdBy: "ck:plan"
source: skill
---

# Codecept Frontend E2E Tests

## Overview

Add CodeceptJS as a separate frontend E2E runner. Existing Playwright E2E tests stay untouched. Codecept tests run against the live Vite UI, use real Firebase/backend login, assert browser-visible frontend behavior only, and generate a local HTML report.

## Scope Challenge

- Existing code: Playwright E2E exists in `frontend/e2e`; auth pages, `ProtectedRoute`, and Firebase/backend profile flow already exist.
- Minimum changes: add Codecept/report dependencies, config/scripts/tests, fix frontend API example port, ignore generated output, document run commands.
- Complexity: about 6 files touched/created, no app logic changes unless selectors prove too brittle.
- Selected mode: HOLD scope from brainstorm agreement.

## Not In Scope

- Replacing Playwright or deleting current `frontend/e2e` tests.
- Backend API correctness testing.
- Firebase account provisioning in code.
- Admin dashboard coverage unless a stable admin test account is provided.

## Cross-Plan Dependencies

None detected in `./plans/`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Configure CodeceptJS Runner](./phase-01-configure-codeceptjs-runner.md) | Completed |
| 2 | [Implement Authenticated Frontend Scenarios](./phase-02-implement-authenticated-frontend-scenarios.md) | In Progress |
| 3 | [Document and Verify Test Results](./phase-03-document-and-verify-test-results.md) | In Progress |

## Dependencies

- Runtime services: PostgreSQL, Spring Boot backend, Vite frontend.
- Secrets: `frontend/.env` Firebase config plus uncommitted `CODECEPT_TEST_EMAIL` and `CODECEPT_TEST_PASSWORD`.
- Main validation: `cd frontend && npm run test:codecept`.
- Expected report: `frontend/output/report/testomatio-report.html`.

## Validation Log

### Session 1 — 2026-06-19
**Trigger:** `/ck:plan validate /home/bruk/Projects/UTH_OOSD/plans/260619-2011-codecept-frontend-e2e-tests/plan.md`
**Questions asked:** 2

#### Verification Results

- **Tier:** Standard
- **Claims checked:** 24
- **Verified:** 22 | **Failed:** 1 | **Unverified:** 1

##### Verified Highlights

- `frontend/package.json` uses ESM and already has Playwright/Vitest scripts.
- `/login`, `/student/dashboard`, `/student/profile`, and protected route guards exist.
- Login uses Firebase email/password first, then backend `/api/auth/me`.
- Backend `/api/auth/me` exists and can create/login student-role users.
- Default frontend API base is `http://localhost:8080/api`.
- CodeceptJS npm package currently exposes `codeceptjs` CLI.

##### Failures

1. [Contract Verifier] Frontend env example conflicts with the planned backend port.
   - Plan/docs use backend `8080`.
   - `frontend/src/services/api.ts` default is `http://localhost:8080/api`.
   - `frontend/.env.example` currently says `VITE_API_URL=http://localhost:8081/api`.

##### Unverified

1. [Assumption] Lecturer-visible "result of Codecept" is now resolved as terminal output plus a local HTML report artifact.

#### Questions & Answers

1. **[Contract]** Should implementation update `frontend/.env.example` from `8081` to `8080`?
   - Options: Yes, fix env example to `8080` (Recommended) | No, only document local override | Ask lecturer first
   - **Answer:** Yes, fix env example to `8080`.
   - Rationale: copied `.env.example` can make login/profile calls hit the wrong backend port.

2. **[Scope]** What Codecept result artifact should be delivered?
   - Options considered: Terminal output only | Add local HTML report | Ask lecturer first
   - **Answer:** Add local HTML report.
   - Rationale: an HTML report is clearer for lecturer submission/demo than terminal output alone.

#### Confirmed Decisions

- Frontend API example port: update `frontend/.env.example` to `http://localhost:8080/api`.
- Report artifact: generate local HTML report at `frontend/output/report/testomatio-report.html`.

#### Action Items

- [ ] Phase 1: add `@testomatio/reporter` dev dependency and Codecept plugin config with `html: true`.
- [ ] Phase 1: update `frontend/.env.example` API URL from `8081` to `8080`.
- [ ] Phase 3: verify and document the HTML report path.

#### Impact on Phases

- Phase 1: dependency/config scope expands slightly to include report plugin and env example correction.
- Phase 3: verification must check HTML report existence, not only terminal output.

### Session 2 — 2026-06-19
**Trigger:** `/ck:cook /home/bruk/Projects/UTH_OOSD/plans/260619-2011-codecept-frontend-e2e-tests/plan.md --auto`

#### Implementation Results

- Added CodeceptJS and Testomatio reporter dependencies.
- Added `test:codecept` and `test:codecept:headed` scripts.
- Added `frontend/codecept.conf.js` with Playwright Chromium helper and HTML report output.
- Added authenticated frontend Codecept scenarios for login, protected route access, and logout.
- Updated `frontend/.env.example` to backend port `8080`.
- Ignored generated `frontend/output/`.
- Documented Codecept prerequisites, commands, result path, and troubleshooting in `docs/CONTRIB.md`.

#### Verification Results

- `npx codeceptjs list`: passed; config loads and exposes Playwright actions.
- `npm run test:codecept` without credentials: fails with clear missing `CODECEPT_TEST_EMAIL` / `CODECEPT_TEST_PASSWORD` message.
- `CODECEPT_TEST_EMAIL=dummy@example.com CODECEPT_TEST_PASSWORD=dummy npm run test:codecept`: reaches browser navigation, then fails because `http://localhost:5173` is not running; HTML report generated at `frontend/output/report/testomatio-report.html`.
- Code review tightened follow-up: login now requires a successful `/api/auth/me` response, and profile route now asserts profile-specific content plus absence of `Student not found`.
- `npm run build`: blocked by existing TypeScript errors in Vite/Firebase/mock auth code, not Codecept files.
- `npm run lint`: blocked by existing ESLint parser config that cannot parse TS/ESM files.

#### Remaining Work

- Run Codecept with real Firebase test credentials for a backend `student` user with valid `studentId`, plus live PostgreSQL/backend/frontend services.
- Resolve existing frontend build/lint configuration errors if build/lint must be green for this plan.

#### Whole-Plan Consistency Sweep

- Files reread: `plan.md`, all 3 phase files.
- Decision deltas checked: 2 (`8080` env example fix, HTML report requirement).
- Reconciled stale references: 4.
- Unresolved contradictions: 0.
