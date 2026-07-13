---
title: SonarCloud Issue Remediation
description: >-
  Remove all 72 active SonarCloud findings, review the security hotspot, and
  verify closure without unintended behavior changes.
status: in-progress
priority: P1
branch: main
tags:
  - bugfix
  - refactor
  - frontend
  - accessibility
  - security
  - critical
  - tech-debt
blockedBy: []
blocks:
  - 260619-2011-codecept-frontend-e2e-tests
created: '2026-07-13'
createdBy: 'ck:plan'
source: skill
---

# SonarCloud Issue Remediation

**Progress:** 4/5 phases complete (80%).

## Overview

Close the July 11 SonarCloud baseline: 72 active issues (4 critical, 48 major, 20 minor) plus one security hotspot. Work stays frontend-focused. Generated reports are removed from analysis; source findings are fixed with behavior-preserving refactors and regression tests; closure is verified by issue key after a fresh analysis.

## Scope Challenge

- Existing code: issue inventory already maps every finding; Vitest/Testing Library, Playwright, and Codecept exist; Firebase mock fallback and reusable UI helpers already exist.
- Minimum changes: remove one tracked generated report, update ignore/analysis scope, modify the 19 reported source files, add focused tests, rerun SonarCloud.
- Complexity: more than eight files is unavoidable because findings span 20 paths. No new service layer or broad UI redesign.
- Selected scope: **HOLD**. Fix all reported findings. Defer unrelated ESLint infrastructure repair and broad `MyGrades`/`Courses` decomposition.

## Cross-Plan Dependencies

- Blocks final verification of `260619-2011-codecept-frontend-e2e-tests`; rerun Codecept after auth/layout/profile changes.

## Finding Coverage

Phase allocation: 5 generated findings; 13 Firebase/Auth/StudentModal findings plus hotspot; 28 accessibility/`MyGrades` findings; 26 remaining maintainability findings. Total: 72 + 1 hotspot.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Establish Baseline and Analysis Scope](./phase-01-establish-baseline-and-analysis-scope.md) | Completed |
| 2 | [Resolve Critical Firebase Auth and Student Modal Findings](./phase-02-resolve-critical-firebase-auth-and-student-modal-findings.md) | Completed |
| 3 | [Repair Accessibility and Form Semantics](./phase-03-repair-accessibility-and-form-semantics.md) | Completed |
| 4 | [Clear Remaining Maintainability Findings](./phase-04-clear-remaining-maintainability-findings.md) | Completed |
| 5 | [Verify Reconcile and Close SonarCloud Findings](./phase-05-verify-reconcile-and-close-sonarcloud-findings.md) | Pending |

## Dependencies

- Baseline report: [SonarCloud issue inventory](../reports/260713-0616-sonarcloud-issue-report.md)
- SonarCloud project: `bruksama_UTH_OOSD`; use Automatic Analysis if enabled. Never store tokens in files.
- Existing frontend stack only: React 18, TypeScript, Vitest, Testing Library, Playwright. No new test dependency required.
- Known baseline: 13 failing Vitest tests, 25 TypeScript errors, and 48 ESLint parser errors. Phase 2 owns the auth/test failures and most type errors; Phase 4 owns the remaining `api.ts`/`mockAuth.ts` type cleanup. ESLint parser configuration stays separate and must be reported honestly.

## Acceptance Criteria

- [ ] All 72 baseline issue keys are fixed or removed through generated-file exclusion.
- [ ] Security hotspot `typescript:S2245` is reviewed Safe with the public-identifier threat model; server-side ID allocation remains a separate reliability improvement.
- [ ] No new blocker, critical, bug, vulnerability, or unreviewed hotspot is introduced.
- [ ] Focused tests, full Vitest, TypeScript check, production build, and selected Playwright scenarios pass.
- [ ] Authenticated Codecept passes when its documented environment prerequisites are available; otherwise its existing plan remains explicitly environment-blocked and does not block this plan's completion.
- [ ] Fresh SonarCloud report reconciles every baseline issue key and records any new finding before completion.

## Not In Scope

- Backend feature/API redesign or server-side student-code allocation.
- Full decomposition of 927-line `MyGrades.tsx` or other large pages.
- ESLint TypeScript parser/tooling repair; track separately unless required to execute a source fix.
- Editing generated Playwright HTML to silence findings.
- Student API authorization redesign. Current policy lacks admin/self ownership; track separately because identifier randomness would not repair it.

## Red Team Review

14 findings: 12 accepted, 2 rejected; 1 Critical, 9 High, 4 Medium. Details: [consolidated red-team report](./reports/from-code-reviewer-to-planner-red-team-consolidated-plan-review-report.md).

Whole-plan consistency sweep: all six plan files reread, 12 stale references reconciled, zero unresolved contradictions.

## Validation Log

### Session 1 — 2026-07-13

**Trigger:** User requested `ck:plan validate` for this plan.
**Questions asked:** 4

#### Verification Results

- **Tier:** Full; duplicate full-role pass skipped because the existing Red Team Review already contains verification evidence.
- **Claims checked:** 8
- **Verified:** 8 | **Failed:** 0 | **Unverified:** 0
- Current diagnostics confirmed 25 TypeScript errors, all within Phase 2/4 ownership; 13 failing Vitest tests plus three unhandled errors, all within Phase 2 auth/test ownership; and 48 ESLint parser errors intentionally outside remediation scope.
- `ck plan status` confirmed the bidirectional Codecept dependency. No `[UNVERIFIED]` tags remain.

#### Questions & Answers

1. **[Architecture]** When `/auth/me` fails with network/5xx, what should the UI do?
   - Options: Keep Firebase identity, withhold application authentication, show retryable unavailable state | Create a basic user inferred from Firebase email | Sign out Firebase immediately for every profile failure
   - **Answer:** Keep Firebase identity, withhold application authentication, show retryable unavailable state.
   - **Rationale:** Prevents role inference and unauthorized app access without revoking a valid Firebase session during a transient backend outage.
2. **[Security]** How should hotspot `typescript:S2245` be resolved?
   - Options: Mark Safe because the value is a public identifier with database uniqueness; track server allocation separately | Move student-ID allocation to the backend in this plan | Replace `Math.random()` with browser crypto while keeping client allocation
   - **Answer:** Mark Safe because the value is a public identifier with database uniqueness; track server allocation separately.
   - **Rationale:** Randomness is not an authorization boundary; backend allocation remains a collision-reliability improvement outside this remediation.
3. **[Scope]** Can this remediation plan complete when Codecept prerequisites are unavailable?
   - Options: Require source gates and Sonar closure while leaving Codecept environment-blocked | Require authenticated Codecept before completion | Remove the Codecept rerun requirement
   - **Answer:** Require source gates and Sonar closure while leaving Codecept environment-blocked.
   - **Rationale:** Keeps source-quality closure deterministic without misreporting an environment-dependent suite.
4. **[Operations]** May implementation update SonarCloud analysis exclusions?
   - Options: Allow narrowly scoped UI exclusions with actor/timestamp/before-after evidence | Permit checked-in scanner configuration only | Require separate approval immediately before every setting change
   - **Answer:** Allow narrowly scoped UI exclusions with actor/timestamp/before-after evidence.
   - **Rationale:** Automatic Analysis may require UI configuration; audit evidence and narrow generated/compiled-output patterns bound the mutation.

#### Confirmed Decisions

- Transient profile failure: retain Firebase identity, keep application user unauthenticated, expose retry.
- Student-ID hotspot: review Safe; server allocation remains separate reliability work.
- Codecept: run when prerequisites exist; an explicit environment deferral does not block remediation completion.
- SonarCloud: narrowly scoped analysis-exclusion changes are authorized with recorded audit evidence.

#### Action Items

- [x] Tighten the Phase 2 transient-profile application-state contract.
- [x] Confirm the hotspot disposition and separate reliability boundary.
- [x] Clarify Codecept completion/defer semantics in plan and Phase 5.
- [x] Clarify authorized SonarCloud UI mutation boundaries in Phases 1 and 5.

#### Impact on Phases

- Phase 1: authorize audited, narrowly scoped Automatic Analysis exclusions.
- Phase 2: define unauthenticated retry state for transient profile failures; confirm hotspot disposition.
- Phase 5: allow evidence-backed Codecept deferral and require audited SonarCloud exclusion evidence.

### Whole-Plan Consistency Sweep

- Files reread: `plan.md` and all five `phase-*.md` files.
- Decision deltas checked: 4.
- Reconciled stale references: 7.
- Unresolved contradictions: 0.

## Unresolved Questions

None. Execution-time check: confirm Automatic Analysis before choosing the authorized SonarCloud UI exclusion path versus an existing scanner configuration.
