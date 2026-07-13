---
report_type: debugger-phase-01-regression-audit
created_at: 2026-07-13T07:47:00+07:00
phase: 1
status: pass-with-pre-commit-caveat
---

# Debugger Report — Phase 1 Regression Audit

## Verdict

PASS. Phase 1 changes remove generated artifacts and narrow future analysis scope without changing application behavior, public contracts, or test configuration. Current Vitest failures exactly reproduce the documented Phase 2 auth baseline; no Phase 1 regression found.

## Generated-only deletion audit

| Deleted path | Provenance | Result |
|---|---|---|
| `frontend/playwright-report/index.html` | Contains `<title>Playwright Test Report</title>`; `frontend/playwright.config.ts` still emits its HTML report to `playwright-report` | Generated-only; safe deletion |
| `frontend/test-results/.last-run.json` | Playwright run metadata with `status` and `failedTests`; credential-free Playwright verification regenerated it | Generated-only; safe deletion |
| `frontend/e2e/screenshots/registration-result.png` | PNG artifact; `frontend/e2e/registration.spec.ts:57` explicitly writes this exact path with `page.screenshot(...)` | Generated-only; safe deletion |

The Playwright specs and `frontend/playwright.config.ts` remain unchanged. Reporter, trace, failure-screenshot, and video generation remain enabled.

## Ignore lifecycle audit

`frontend/.gitignore` now covers:

- `playwright-report/`
- `test-results/`
- `e2e/screenshots/`

`git check-ignore --no-index -v` maps representative HTML report, last-run metadata, trace ZIP, video, failure screenshot, and explicit E2E screenshot paths to these rules. Existing test-output rules remain present.

Pre-commit caveat: the three historical files remain visible to ordinary `git ls-files` because their deletions are unstaged. They are all reported by `git ls-files --deleted`; staging/committing the deletion patch completes literal index removal. The tester regenerated and cleaned the report/results successfully and introduced no new index path.

## Source, contract, and config isolation

- `git diff -- frontend/src backend/src`: empty.
- `git diff -- frontend/playwright.config.ts`: empty.
- `git diff -- frontend/package.json backend/pom.xml`: empty.
- No API route, schema, exported type, environment-variable contract, application logic, test spec, or Playwright behavior changed.
- Phase 1 scoped tracked diff is only `frontend/.gitignore` plus the three generated-file deletions.

Unrelated dirty worktree files exist outside Phase 1. Preserve them during staging.

## Regression and failure attribution

Tester evidence:

- Credential-free Playwright navigation: 1 selected, 1 passed; report/result output regenerated.
- Full Vitest: 13 failed, 26 passed, 3 unhandled errors.
- Documented baseline: 13 failed and 3 unhandled errors.
- Delta: zero failures and zero unhandled errors.

All failures remain in Phase 2-owned auth touchpoints:

- `src/services/auth.service.test.ts`: 8 failures.
- `src/contexts/AuthContext.test.tsx`: 2 failures.
- `src/pages/auth/Login.test.tsx`: 3 failures.
- Three unhandled auth rejections remain in the same Phase 2 ownership area.

Attribution is conclusive: counts and files match the validated baseline, while Phase 1 has no diff in source, auth tests, or Playwright config.

## Sonar analysis-scope audit

Auth-free SonarCloud API verification returns Automatic Analysis enabled and exactly these eight exclusions:

- `frontend/playwright-report/**`
- `frontend/test-results/**`
- `frontend/e2e/screenshots/**`
- <code>frontend/cover&#97;ge/**</code>
- <code>frontend/di&#115;t/**</code>
- `frontend/output/**`
- <code>backend/tar&#103;et/**</code>
- `backend/jacoco-report/**`

These are exact generated, report, or compiled-output directory prefixes. None targets or contains `frontend/src/**` or `backend/src/**`; no source-code finding is hidden. Public API values exactly match the resolution-ledger audit evidence.

## Credential hygiene

This audit did not read `.env`, use a token, place credentials in commands, or log credentials. Git reports the relevant `.env` paths untracked and ignored. Because the credential was disclosed, rotate/revoke it after the authenticated settings work, consistent with the phase security note.

## Unresolved Questions

None. Operational follow-up only: stage/commit the generated-file deletions before relying on ordinary index-aware ignore behavior, and rotate the disclosed credential.

Status: DONE_WITH_CONCERNS

Summary: Phase 1 is regression-safe. Generated deletions, ignore coverage, ledger scope, and eight Sonar exclusions are correct; known test failures remain unchanged Phase 2 auth debt.

Concerns/Blockers: No Phase 1 behavior blocker. Pre-commit index cleanup and credential rotation remain operational follow-ups.
