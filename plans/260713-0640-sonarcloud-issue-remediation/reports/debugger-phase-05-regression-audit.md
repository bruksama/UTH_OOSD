# Debugger Report — Phase 5 Regression Audit

## Verdict

Phase 1–4 implementation is regression-safe based on current source, callers, focused tests recorded by prior phase agents, and the clean Phase 4 full gates. No accidental backend/API/schema change found. Phase 5 must not finalize or stage the worktree wholesale: generated compiler and test-report files plus unrelated user files are mixed into the working tree.

## Evidence and attribution

- `git diff --check`: clean; no whitespace/error-marker regression.
- Prior verified gates: Phase 4 post-repair report records `npm run test:run` 76/76, `npx tsc --noEmit` pass, `npm run package` equivalent pass through the project script, and focused Phase 4 tests 19/19.
- Phase 3 reports record focused accessibility tests, full Vitest, and selected Playwright passing. Phase 2 reports record auth/modal suites passing with zero unhandled errors.
- `git diff --name-status` confirms implementation is frontend-only except plan/report lifecycle files and unrelated dirty artifacts. No backend Java, database migration, REST payload, or persisted schema file changed.
- `git diff --numstat` shows the broadest source edit is `AuthContext.tsx` (+125/-161), but its callers retain the existing `useAuth()` contract; new profile-unavailable state and retry members are additive.

## Touchpoint and public-contract audit

### Authentication

- `frontend/src/config/firebase.ts`, `frontend/src/services/auth.service.ts`, and `frontend/src/contexts/AuthContext.tsx` preserve nullable Firebase/mock mode while removing configured-provider fallback. This is an intentional security contract from Phase 2, not an accidental regression.
- `AuthState.isProfileUnavailable`, `retryProfile`, and `signOutLocally` are additive exports. Existing consumers that destructure only prior fields remain compatible.
- `AuthContext.tsx` invalidates profile generations on auth changes/logout/unmount. Unauthorized profile cleanup and transient retry behavior match the accepted plan. Prior deferred-promise tests cover stale responses.
- `api.ts` changes interceptor rejection from `return Promise.reject(error)` to `throw error`; Axios callers still receive a rejected promise with the same error object. Phase 4 `api.test.ts` verifies the 401 redirect/error contract.

### Student modal and callers

- `StudentModal` still accepts `onSubmit: (StudentDTO) => Promise<void>`. `Students.handleModalSubmit` now rethrows create/update failure, so the modal remains open; successful submit still closes once in the modal after the parent completes.
- Student ID format remains `STU-YYYY-#####`. The `Math.random()` hotspot is explicitly reviewed Safe as a public identifier; no authorization boundary was weakened.
- Email validation is bounded and linear. It is intentionally slightly stricter through the 254-character cap; tests in `student-modal-helpers.test.ts` characterize accepted, rejected, and hostile long input.

### Maintainability refactors

- Course hash compatibility, duplicate chart-label keys, nullish grade color behavior, filters, status labels, and bounded grade entry parsing have focused tests per the Phase 4 tester report.
- No changed exported DTO shape, endpoint path, service signature, environment variable, or backend contract found beyond the additive auth state noted above.

## Accessibility audit

- Changed interactive non-button containers were converted to buttons or given native control associations. Added accessible names cover mobile navigation, modal close controls, grade component inputs/actions, and form fields.
- `Layout` mobile backdrop is now a full-screen native button; Tailwind preflight removes default browser button styling, and `Layout.test.tsx` verifies open/close behavior and accessible names.
- `MyGrades` preserves keyboard activation by using a native button for the GPA scale. Focused test verifies Space activation and enrollment form labels.
- Residual risk, not introduced here: modal components still do not uniformly expose `role="dialog"`, `aria-modal`, focus trapping, or Escape handling. This was not among the baseline Sonar findings and should not expand Phase 5 without approval.

## Accidental scope and staging risks

1. **Generated TypeScript artifacts are tracked and dirty:** `frontend/tsconfig.tsbuildinfo`, `frontend/tsconfig.node.tsbuildinfo`, and compiled `frontend/vite.config.js`. These are compiler outputs, not required source edits. Staging them adds noisy machine/tool-version churn; `vite.config.js` also contains a generated proxy delta (`8081` to `8080`) derived from the TypeScript config rather than a reviewed Phase 1–4 source decision.
2. **Backend JaCoCo output is untracked but not repository-ignored:** `git status --short --untracked-files=all` lists the full `backend/jacoco-report/**` tree. SonarCloud excludes it, but the repository lifecycle boundary is incomplete because `backend/.gitignore` does not ignore `jacoco-report/`. This does not break runtime behavior or current Sonar scope, but creates a high-risk accidental-stage surface. Adding the ignore rule is a narrow Phase 1 lifecycle correction if controller approves; otherwise explicitly exclude it during staging.
3. **Unrelated dirty/user artifacts:** `docs/bao-cao-dong-gop-thanh-vien.docx`, backend Postman/report files, Scrum docs, and `AGENTS.md` are outside this remediation. Preserve and exclude from any commit.
4. `plans/260619-2011-codecept-frontend-e2e-tests/plan.md` only adds the documented dependency on this remediation; this is intentional plan synchronization, not product scope expansion.

## Failure classification

- Historical Vitest/type/package failures were baseline or owned by earlier phases and are reported resolved by the Phase 4 post-repair verification.
- Repository lint remains a known baseline/tooling failure: ESLint lacks TypeScript/module parser configuration. It is explicitly outside scope and must be reported, not hidden or attributed to these changes.
- Codecept may remain environment-blocked when PostgreSQL, backend/frontend services, Firebase configuration, or credentials are unavailable. That is environment attribution under the accepted Phase 5 contract, not a source regression.
- Fresh SonarCloud closure is still an external verification gate. Until the analyzed revision matches the intended commit and all 72 keys are reconciled, source changes remain `fresh-analysis-pending`.

## Unresolved Questions

- Should Phase 5 add `jacoco-report/` to `backend/.gitignore`, or leave cleanup/staging exclusion to the controller?
- Which tracked generated files (`*.tsbuildinfo`, `vite.config.js`) are intentionally versioned by project policy, if any?

Status: DONE_WITH_CONCERNS

Summary: No Phase 1–4 source regression or breaking backend/API contract found. Auth, modal, maintainability, and accessibility touchpoints match the accepted plan and prior green tests.

Concerns/Blockers: Do not stage wholesale. Generated TypeScript artifacts, compiled Vite config, a large unignored JaCoCo report, and unrelated user files are mixed into the worktree; fresh SonarCloud reconciliation remains mandatory.
