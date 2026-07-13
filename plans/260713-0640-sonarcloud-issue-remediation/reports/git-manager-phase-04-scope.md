# Git Handoff — SonarCloud Remediation Phase 4

## Decision

Do not stage or commit in this finalization step. The user approved the narrow Vite/Vitest configuration repair, not a commit. The index is empty and the worktree contains combined Phase 1-4 edits, generated build output, and unrelated user artifacts.

If the user later approves a Phase 4 commit, use explicit paths and hunk staging for files shared with earlier phases. Never use `git add .`, `git add -A`, broad `frontend/`, or the whole remediation plan directory.

## Phase 4 implementation and configuration scope

Phase 4-only or primarily Phase 4 production/configuration paths:

- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/components/charts/ChartComponents.tsx`
- `frontend/src/pages/admin/Alerts.tsx`
- `frontend/src/pages/admin/Dashboard.tsx`
- `frontend/src/pages/student/MyAlerts.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/services/mockAuth.ts`
- `frontend/src/utils/helpers.ts`
- `frontend/vite.config.ts` — approved narrow type-only Vite/Vitest build repair

Shared paths containing Phase 4 work plus earlier-phase work; do not stage whole-file without accepting mixed-phase history:

- `frontend/src/components/CourseProposalModal.tsx` — Phase 3 accessibility plus Phase 4 hash/default-parameter cleanup
- `frontend/src/pages/admin/Courses.tsx` — Phase 3 form semantics plus Phase 4 existence checks/content refactor
- `frontend/src/pages/admin/Students.tsx` — Phase 2 modal/error flow plus Phase 4 GPA classes/fragment cleanup
- `frontend/src/pages/auth/Register.tsx` — Phase 3 form semantics plus Phase 4 numeric API cleanup

For a strictly Phase 4 commit, interactively stage only Phase 4 hunks from these four shared files. If reliable hunk separation is impractical, either commit Phases 1-4 together with explicit user approval or leave the shared files for a later consolidated remediation commit.

## Phase 4 tests

Phase 4-focused test paths:

- `frontend/src/components/charts/ChartComponents.test.ts`
- `frontend/src/services/api.test.ts`
- `frontend/src/utils/helpers.test.ts`

Shared test paths whose current contents also verify earlier phases:

- `frontend/src/components/CourseProposalModal.test.tsx`
- `frontend/src/pages/admin/Courses.test.tsx`
- `frontend/src/pages/admin/Students.test.tsx`

The shared tests are appropriate only with hunk review or a consolidated multi-phase commit. Their full-file addition would not represent Phase 4 alone.

## Phase 4 plan, report, and journal artifacts

Appropriate current Phase 4 artifacts:

- `plans/260713-0640-sonarcloud-issue-remediation/phase-04-clear-remaining-maintainability-findings.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/tester-phase-04-verification.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/debugger-phase-04-regression-audit.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/code-reviewer-phase-04-implementation-review.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/phase-04-review-artifacts/adversarial-validation.json`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/phase-04-review-artifacts/review-decision.json`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/phase-04-review-artifacts/risk-gate.json`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/git-manager-phase-04-scope.md`

Shared synchronization artifacts require diff/hunk review because they cover the whole remediation plan:

- `plans/260713-0640-sonarcloud-issue-remediation/plan.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`

No Phase 4 journal or project-management progress report exists at audit time. If finalization creates them, include only the Phase 4-specific files after checking their claims match the final green build, TypeScript, and 76/76 Vitest results. Do not include Phase 1 or Phase 3 journals/reports in a Phase 4 commit.

## Earlier-phase files to exclude from a focused Phase 4 commit

Phase 1 lifecycle/scope changes:

- `frontend/.gitignore`
- deleted `frontend/e2e/screenshots/registration-result.png`
- deleted `frontend/playwright-report/index.html`
- `plans/260619-2011-codecept-frontend-e2e-tests/plan.md`

Phase 2 implementation/tests:

- `frontend/src/components/StudentModal.tsx`
- `frontend/src/components/StudentModal.test.tsx`
- `frontend/src/components/student-modal-helpers.ts`
- `frontend/src/components/student-modal-helpers.test.ts`
- `frontend/src/config/firebase.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/AuthContext.test.tsx`
- `frontend/src/pages/auth/Login.test.tsx`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/auth.service.test.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/types/index.ts`

Phase 3 implementation/tests:

- `frontend/src/components/Layout.tsx`
- `frontend/src/components/Layout.test.tsx`
- `frontend/src/pages/auth/ForgotPassword.tsx`
- `frontend/src/pages/auth/ForgotPassword.test.tsx`
- `frontend/src/pages/student/MyGrades.tsx`
- `frontend/src/pages/student/MyGrades.test.tsx`
- `frontend/src/pages/student/StudentProfile.tsx`
- `frontend/src/pages/student/StudentProfile.test.tsx`
- `frontend/src/pages/student/my-grades-helpers.ts`
- `frontend/src/pages/student/my-grades-helpers.test.ts`
- `frontend/e2e/accessibility.spec.ts`

Also exclude all Phase 1-3 phase reports, progress reports, git-manager reports, and journals from a Phase 4-only commit.

## Generated and unrelated exclusions

Generated TypeScript/Vite outputs; never stage:

- `frontend/tsconfig.node.tsbuildinfo`
- `frontend/tsconfig.tsbuildinfo`
- `frontend/vite.config.js` — emitted/stale generated configuration; it also contains an unrelated proxy-port diff

Unrelated user/project artifacts to preserve unstaged:

- `AGENTS.md`
- `docs/bao-cao-dong-gop-thanh-vien.docx`
- `backend/jacoco-report/**`
- `backend/postman/**`
- `docs/scrum-38-vba-test-report-grade-entry.md`
- `docs/scrum-40-vba-test-report-statistics.md`
- unrelated `plans/reports/**`
- all dotenv, credential, token, key, and secret-bearing files

## Proposed commit

```text
fix(frontend): resolve remaining maintainability findings
```

This message covers the behavior-preserving maintainability fixes and the narrow build-configuration typing repair without claiming fresh SonarCloud closure, which remains Phase 5 work.

## Verification before any approved commit

After explicit path/hunk staging:

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Confirm the index excludes earlier phases, generated outputs, unrelated artifacts, and secrets. Re-run the focused Phase 4 tests if staged hunks differ from the already reviewed working tree.

## Unresolved Questions

- Whether the user wants a strictly hunk-separated Phase 4 commit or a consolidated Phases 1-4 remediation commit.
- Whether final project-management sync and the Phase 4 journal will be created before commit approval.

Status: DONE_WITH_CONCERNS

Summary: Read-only audit identified Phase 4-only paths, shared files requiring hunk staging, finalization artifacts, and explicit generated/unrelated exclusions. No git mutation performed.

Concerns/Blockers: Four production files and three tests mix Phase 4 with earlier uncommitted phases; broad path staging would misrepresent commit scope. Commit still requires explicit user approval.
