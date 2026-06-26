---
phase: 1
title: "Configure CodeceptJS Runner"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 1: Configure CodeceptJS Runner

## Context Links

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/playwright.config.ts`
- `frontend/.gitignore`
- `frontend/.env.example`
- CodeceptJS docs: https://codecept.io/basics/
- CodeceptJS reports docs: https://codecept.io/reports/

<!-- Updated: Validation Session 1 - add HTML report config and align frontend API example port -->

## Overview

Install and configure CodeceptJS as a separate frontend E2E runner with local HTML reporting. Keep current Playwright scripts and config unchanged.

## Requirements

- Functional: add `npm run test:codecept` and `npm run test:codecept:headed`.
- Functional: generate `frontend/output/report/testomatio-report.html`.
- Functional: Codecept points at `http://localhost:5173` by default and uses Playwright helper with Chromium.
- Functional: align `frontend/.env.example` with backend port `8080`.
- Non-functional: no backend auto-start inside Codecept; services are explicit prerequisites.
- Non-functional: generated Codecept output must not be committed.

## Architecture

CodeceptJS acts as a high-level E2E layer over Playwright. It drives the browser through `I.*` steps while the app talks to Firebase and backend normally. A local HTML report is generated through the Testomat.io reporter plugin without cloud upload or API token.

Data flow:
`Codecept test -> browser -> Vite frontend -> Firebase auth -> backend /api/auth/me -> browser assertions`

Report flow:
`Codecept run -> @testomatio/reporter/codecept -> output/report/testomatio-report.html`

## Related Code Files

- Modify: `frontend/package.json` for scripts and dev dependency.
- Modify: `frontend/package-lock.json` through `npm install`.
- Modify: `frontend/.gitignore` to ignore `output/`.
- Modify: `frontend/.env.example` to use `VITE_API_URL=http://localhost:8080/api`.
- Create: `frontend/codecept.conf.js`.
- Create: `frontend/codecept-tests/` in Phase 2.

## Implementation Steps

1. Install CodeceptJS and local HTML report support in `frontend`: `npm install -D codeceptjs @testomatio/reporter`.
2. Add scripts:
   - `test:codecept`: `codeceptjs run --steps`
   - `test:codecept:headed`: `HEADLESS=false codeceptjs run --steps`
3. Create `frontend/codecept.conf.js` using ES module export because `frontend/package.json` has `"type": "module"`.
4. Configure Playwright helper:
   - URL from `CODECEPT_BASE_URL` or `http://localhost:5173`.
   - Browser `chromium`.
   - Headed mode when `HEADLESS=false`.
   - Output folder `./output`.
5. Configure local HTML reporting:
   - `plugins.testomatio.enabled = true`
   - `require = '@testomatio/reporter/codecept'`
   - `html = true`
   - `reportDir = 'output/report'`
6. Update `frontend/.env.example` from `VITE_API_URL=http://localhost:8081/api` to `VITE_API_URL=http://localhost:8080/api`.
7. Add `output/` to `frontend/.gitignore`.
8. Run a no-test smoke command or first test generation check after Phase 2.

## Success Criteria

- [x] `npm run test:codecept` command exists.
- [x] `npm run test:codecept:headed` command exists.
- [x] `frontend/codecept.conf.js` loads without module syntax errors.
- [x] `frontend/output/report/testomatio-report.html` is generated after a Codecept run.
- [x] `frontend/.env.example` uses backend port `8080`.
- [x] Existing `test:e2e` Playwright scripts remain unchanged.
- [x] `frontend/output/` is ignored.

## Risk Assessment

- Risk: Codecept config format differs in current version. Mitigation: validate with installed `codeceptjs` immediately.
- Risk: report plugin API changes. Mitigation: verify against installed `@testomatio/reporter` and keep config minimal.
- Risk: headed script is Unix-style. Mitigation: acceptable for current Linux environment; add `cross-env` later only if Windows needed.
- Risk: duplicate Playwright versions. Mitigation: reuse existing Playwright helper/browser where possible and keep versions npm-resolved.
