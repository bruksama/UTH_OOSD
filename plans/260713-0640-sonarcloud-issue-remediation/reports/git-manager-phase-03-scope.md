# Git Handoff — SonarCloud Remediation Phase 3

## Decision

Do not stage or commit in this finalization step. The user requested Phase 3 execution, not a commit, the index is empty, and the worktree mixes Phase 1, Phase 2, Phase 3, generated output, and unrelated user changes.

If the user later approves a Phase 3 commit, stage only explicit paths after rechecking the diff. Do not use `git add .`, `git add -A`, broad `frontend/`, or the whole remediation plan directory.

## Exact Phase 3 implementation scope

Production files:

- `frontend/src/components/CourseProposalModal.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/pages/admin/Courses.tsx`
- `frontend/src/pages/auth/ForgotPassword.tsx`
- `frontend/src/pages/auth/Register.tsx`
- `frontend/src/pages/student/MyGrades.tsx`
- `frontend/src/pages/student/StudentProfile.tsx`
- `frontend/src/pages/student/my-grades-helpers.ts`

Phase 3 tests and browser spec:

- `frontend/src/components/CourseProposalModal.test.tsx`
- `frontend/src/components/Layout.test.tsx`
- `frontend/src/pages/admin/Courses.test.tsx`
- `frontend/src/pages/auth/ForgotPassword.test.tsx`
- `frontend/src/pages/auth/Register.test.tsx`
- `frontend/src/pages/student/MyGrades.test.tsx`
- `frontend/src/pages/student/StudentProfile.test.tsx`
- `frontend/src/pages/student/my-grades-helpers.test.ts`
- `frontend/e2e/accessibility.spec.ts`

Phase 3 planning and verification artifacts:

- `plans/260713-0640-sonarcloud-issue-remediation/phase-03-repair-accessibility-and-form-semantics.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/tester-phase-03-verification.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/debugger-phase-03-regression-audit.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/code-reviewer-phase-03-implementation-review.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/git-manager-phase-03-scope.md`

`plan.md` may be included only if its current diff is reviewed and contains the Phase 3 progress sync without unrelated later-phase changes. The remediation directory is currently wholly untracked, so Git cannot separate earlier Phase 1/2 artifact creation from the current Phase 3 updates by history alone.

## Explicit exclusions

Earlier remediation phases, not Phase 3:

- `frontend/src/config/firebase.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/AuthContext.test.tsx`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/auth.service.test.ts`
- `frontend/src/components/StudentModal.tsx`
- `frontend/src/components/StudentModal.test.tsx`
- `frontend/src/components/student-modal-helpers.ts`
- `frontend/src/components/student-modal-helpers.test.ts`
- `frontend/src/pages/admin/Students.tsx`
- `frontend/src/pages/admin/Students.test.tsx`
- `frontend/src/pages/auth/Login.test.tsx`
- `frontend/src/test/setup.ts`
- `frontend/src/types/index.ts`
- Phase 1/2 plan reports and `docs/journals/260713-0748-sonarcloud-phase-01.md`
- `frontend/.gitignore`, deleted Playwright artifacts, and `plans/260619-2011-codecept-frontend-e2e-tests/plan.md` belong to Phase 1 lifecycle/scope work

Unrelated or generated dirty files to preserve unstaged:

- `AGENTS.md`
- `docs/bao-cao-dong-gop-thanh-vien.docx`
- `backend/jacoco-report/**`
- `backend/postman/**`
- `docs/scrum-38-vba-test-report-grade-entry.md`
- `docs/scrum-40-vba-test-report-statistics.md`
- unrelated files under `plans/reports/**`
- `frontend/tsconfig.node.tsbuildinfo`
- `frontend/tsconfig.tsbuildinfo`
- `frontend/vite.config.js`
- all dotenv, credential, token, and secret-bearing files

## Proposed commit

```text
fix(frontend): repair accessibility and form semantics
```

This is a `fix` because it changes rendered semantics, keyboard behavior, form label associations, navigation elements, and maintainability logic while preserving public behavior.

## Pre-commit verification if approved later

After explicit-path staging, verify:

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --stat
```

Confirm the index contains every intended Phase 3 source/test artifact, no Phase 1/2 implementation file, no generated cache/report output, and no secret-bearing file.

## Unresolved Questions

- Whether the user wants Phase 3 committed separately or the completed remediation phases squashed into one later commit.
- Whether `plan.md` will receive additional Phase 3 finalization sync before any approved commit.

Status: DONE_WITH_CONCERNS

Summary: Read-only audit identified the exact Phase 3 source, test, browser, ledger, and verification scope. No git mutation performed. Proposed commit: `fix(frontend): repair accessibility and form semantics`.

Concerns/Blockers: Worktree is heavily mixed and the remediation directory is untracked, so broad staging would capture earlier phases and unrelated user/generated files. Commit requires explicit user approval and path-by-path staging.
