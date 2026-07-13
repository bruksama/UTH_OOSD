# Git Handoff — SonarCloud Remediation Phase 1

## Decision

Prepare one focused commit from explicit paths. Do not use `git add -A`, `git add .`, or broad directory staging outside the remediation plan directory.

Current branch: `main`, aligned with `origin/main` at `157ed1d` before these changes. Index currently empty.

## Phase 1 commit scope

### Repository lifecycle changes

- Modify `frontend/.gitignore` with generated Playwright directory rules.
- Delete `frontend/playwright-report/index.html`.
- Delete `frontend/test-results/.last-run.json`.
- Delete `frontend/e2e/screenshots/registration-result.png`.

### Plan, baseline, and audit evidence

The complete untracked remediation plan package belongs in the same handoff. Staging only `plan.md` and Phase 1 would create broken phase/report links and omit the reviewed acceptance evidence.

- `plans/reports/260713-0616-sonarcloud-issue-report.md`
- `plans/260619-2011-codecept-frontend-e2e-tests/plan.md`
- `plans/260713-0640-sonarcloud-issue-remediation/plan.md`
- `plans/260713-0640-sonarcloud-issue-remediation/phase-01-establish-baseline-and-analysis-scope.md`
- `plans/260713-0640-sonarcloud-issue-remediation/phase-02-resolve-critical-firebase-auth-and-student-modal-findings.md`
- `plans/260713-0640-sonarcloud-issue-remediation/phase-03-repair-accessibility-and-form-semantics.md`
- `plans/260713-0640-sonarcloud-issue-remediation/phase-04-clear-remaining-maintainability-findings.md`
- `plans/260713-0640-sonarcloud-issue-remediation/phase-05-verify-reconcile-and-close-sonarcloud-findings.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/from-code-reviewer-to-planner-red-team-consolidated-plan-review-report.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/code-reviewer-phase-01-implementation-review.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/tester-phase-01-verification.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/debugger-phase-01-regression-audit.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/docs-manager-phase-01-impact.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/pm-260713-0748-sonarcloud-phase-01-progress.md`
- `plans/260713-0640-sonarcloud-issue-remediation/reports/git-manager-phase-01-scope.md`

The Codecept plan change is in scope because it records the reviewed bidirectional dependency. It has no implementation behavior change.

## Explicit exclusions

Preserve these unrelated user/worktree changes; do not stage them:

- `AGENTS.md`
- `docs/bao-cao-dong-gop-thanh-vien.docx`
- `backend/jacoco-report/**`
- `backend/postman/**`
- `docs/scrum-38-vba-test-report-grade-entry.md`
- `docs/scrum-40-vba-test-report-statistics.md`
- Any other file under `plans/reports/` except `plans/reports/260713-0616-sonarcloud-issue-report.md`
- `.env` and every secret-bearing dotenv/credential file

`backend/jacoco-report/**` is generated output covered by the external Sonar exclusion, not an artifact to commit.

## Safe staging command

Run from `/home/bruk/Projects/UTH_OOSD`:

```bash
git add -- \
  frontend/.gitignore \
  frontend/e2e/screenshots/registration-result.png \
  frontend/playwright-report/index.html \
  frontend/test-results/.last-run.json \
  plans/reports/260713-0616-sonarcloud-issue-report.md \
  plans/260619-2011-codecept-frontend-e2e-tests/plan.md \
  plans/260713-0640-sonarcloud-issue-remediation
```

Then verify before committing:

```bash
git diff --cached --stat
git diff --cached --name-status
git diff --cached --check
```

Expected secret-file check: `.env` must not appear in `git diff --cached --name-only`. Repository inspection confirms `.env` is untracked and ignored by `.gitignore:13`; its contents were not read for this handoff.

## Proposed commit

```text
fix(sonar): establish analysis scope baseline
```

This is a `fix`, not a documentation-only commit: it removes tracked generated findings and changes future artifact lifecycle/analysis behavior.

## Credential follow-up

The Sonar token was disclosed during execution. Revoke or rotate it now that the Phase 1 setting mutation is complete. If later phases require API access, provide the replacement least-privilege token through a masked runtime environment or CI secret only. Never store it in a repository file, stage it, commit it, paste it into command arguments, or record it in reports.

## Unresolved Questions

None. Commit execution still requires user approval.

Status: DONE_WITH_CONCERNS

Summary: Exact Phase 1 staging scope identified, including generated-artifact lifecycle changes and the complete linked remediation plan/evidence package. Safe explicit-path command and commit message prepared; no git mutation performed.

Concerns/Blockers: Rotate the disclosed Sonar token. Keep `.env` and all unrelated dirty worktree files unstaged.
