# Git Handoff — SonarCloud Remediation Phase 5

## Decision

A focused consolidated Phase 1–5 remediation commit and push are required before Phase 5 can close. SonarCloud Automatic Analysis currently reports baseline revision `157ed1d0199d2959c36bfe9f085369528477417a`; it cannot analyze the uncommitted working tree. Commit alone is insufficient: the intended revision must be pushed to the analyzed branch, expected to be `main`, then the SonarCloud analyzed revision must match that pushed SHA.

No git mutation was performed by this audit. Use explicit paths; never use `git add .`, `git add -A`, broad `frontend/`, or the whole repository.

## Required remediation implementation scope

Include these production and configuration files in one consolidated remediation commit:

- `frontend/.gitignore`
- `frontend/src/components/CourseProposalModal.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/components/StudentModal.tsx`
- `frontend/src/components/charts/ChartComponents.tsx`
- `frontend/src/components/student-modal-helpers.ts`
- `frontend/src/config/firebase.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/pages/admin/Alerts.tsx`
- `frontend/src/pages/admin/Courses.tsx`
- `frontend/src/pages/admin/Dashboard.tsx`
- `frontend/src/pages/admin/Students.tsx`
- `frontend/src/pages/auth/ForgotPassword.tsx`
- `frontend/src/pages/auth/Register.tsx`
- `frontend/src/pages/student/MyAlerts.tsx`
- `frontend/src/pages/student/MyGrades.tsx`
- `frontend/src/pages/student/StudentProfile.tsx`
- `frontend/src/pages/student/my-grades-helpers.ts`
- `frontend/src/services/api.ts`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/mockAuth.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/types/index.ts`
- `frontend/src/utils/helpers.ts`
- `frontend/vite.config.ts` — reviewed source configuration/type repair, not generated output

Include the intentional generated-artifact lifecycle deletions:

- delete `frontend/playwright-report/index.html`
- delete `frontend/e2e/screenshots/registration-result.png`

These deletions plus `frontend/.gitignore` are required to keep regenerated Playwright artifacts out of repository and Sonar analysis scope.

## Required remediation tests

Include all focused regression tests introduced or updated by Phases 2–5:

- `frontend/e2e/accessibility.spec.ts`
- `frontend/src/components/CourseProposalModal.test.tsx`
- `frontend/src/components/Layout.test.tsx`
- `frontend/src/components/StudentModal.test.tsx`
- `frontend/src/components/charts/ChartComponents.test.ts`
- `frontend/src/components/student-modal-helpers.test.ts`
- `frontend/src/contexts/AuthContext.test.tsx`
- `frontend/src/pages/admin/Courses.test.tsx`
- `frontend/src/pages/admin/Students.test.tsx`
- `frontend/src/pages/auth/ForgotPassword.test.tsx`
- `frontend/src/pages/auth/Login.test.tsx`
- `frontend/src/pages/auth/Register.test.tsx`
- `frontend/src/pages/student/MyGrades.test.tsx`
- `frontend/src/pages/student/StudentProfile.test.tsx`
- `frontend/src/pages/student/my-grades-helpers.test.ts`
- `frontend/src/services/api.test.ts`
- `frontend/src/services/auth.service.test.ts`
- `frontend/src/utils/helpers.test.ts`

## Plan and verification artifacts

Include the complete `plans/260713-0640-sonarcloud-issue-remediation/` plan and report set only after final sync verifies its claims. At the current audit point, Phase 5 and the master plan must remain pending/in-progress because fresh SonarCloud analysis and key reconciliation have not completed.

The following related artifacts are reasonable in the consolidated remediation commit because they document scope, verification, or workflow dependency:

- `plans/reports/260713-0616-sonarcloud-issue-report.md`
- `plans/260619-2011-codecept-frontend-e2e-tests/plan.md` — records the accepted cross-plan blocker
- `docs/journals/260713-0748-sonarcloud-phase-01.md`
- `docs/journals/260713-1759-sonarcloud-phase-03.md`
- `docs/journals/260713-2056-sonarcloud-phase-04-maintainability.md`

These documentation artifacts are not required for Automatic Analysis itself. If commit minimization is preferred, they may be placed in a separate follow-up commit, but the analyzed source revision must still contain all implementation, tests, ignore changes, and artifact deletions listed above.

## Exclude generated or stale files

Do not stage:

- `frontend/tsconfig.node.tsbuildinfo`
- `frontend/tsconfig.tsbuildinfo`
- `frontend/vite.config.js` — generated/stale compiled configuration and includes an unrelated proxy-port change
- `backend/jacoco-report/**`

SonarCloud already excludes the JaCoCo directory, but it remains an accidental-stage risk because it is untracked and not repository-ignored.

## Exclude unrelated user/project files

Preserve unstaged:

- `AGENTS.md`
- `docs/bao-cao-dong-gop-thanh-vien.docx`
- `backend/postman/**`
- `docs/scrum-38-vba-test-report-grade-entry.md`
- `docs/scrum-40-vba-test-report-statistics.md`
- unrelated `plans/reports/**` other than the baseline Sonar issue report named above
- all dotenv, credential, token, key, and secret-bearing files

## Commit and push requirement

Recommended consolidated commit message:

```text
fix(frontend): remediate SonarCloud findings
```

Before committing, inspect the exact index:

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --stat
git diff --cached
```

After commit, push the intended analyzed branch. For the recorded Automatic Analysis configuration and default branch, Phase 5 requires a push to `main` unless SonarCloud project settings prove another branch is analyzed. Record the pushed SHA, wait for analysis completion, and accept closure only when SonarCloud reports that exact SHA. Then reconcile all 72 issue keys and the hotspot; any source change after the analyzed commit restarts the verification cycle.

## Unresolved Questions

- Whether the user authorizes committing and pushing the focused consolidated remediation to `main`.
- Whether final plan/report/journal sync artifacts should share the analyzed source commit or follow in a separate documentation commit.

Status: DONE_WITH_CONCERNS

Summary: Read-only audit defined the focused consolidated remediation scope and explicit exclusions. A commit plus push is required for Automatic Analysis; no git mutation performed.

Concerns/Blockers: Worktree mixes intended remediation with generated and unrelated files. Phase 5 remains externally blocked until an authorized focused commit is pushed and SonarCloud analyzes the exact pushed SHA.
