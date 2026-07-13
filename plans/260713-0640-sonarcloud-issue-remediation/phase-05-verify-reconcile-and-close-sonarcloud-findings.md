---
phase: 5
title: "Verify Reconcile and Close SonarCloud Findings"
status: completed
priority: P1
dependencies: [4]
effort: "2h"
---

# Phase 5: Verify Reconcile and Close SonarCloud Findings

<!-- Updated: Validation Session 1 - confirmed Codecept deferral and audited SonarCloud UI mutation policy -->

## Overview

Run regression gates, trigger a fresh SonarCloud analysis, and reconcile every baseline issue key before declaring completion.

## Requirements

- Functional: verify source behavior and close all original findings.
- Non-functional: no secret persistence; no hidden/ignored test failures; reports match the analyzed commit.

## Architecture

Verification is layered: focused tests per changed behavior, full frontend checks, browser scenarios, then external static analysis. The resolution ledger is authoritative for key-by-key closure; counts alone are insufficient because findings can move or be replaced by new issues.

## Related Code Files

- Modify: `/home/bruk/Projects/UTH_OOSD/plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`
- Create: `/home/bruk/Projects/UTH_OOSD/plans/260713-0640-sonarcloud-issue-remediation/reports/sonarcloud-final-verification-report.md`
- Read/verify: all files listed in Phases 1–4

## Implementation Steps

1. Run each new/modified Vitest file first; fix regressions without weakening assertions.
2. Run `npm run test:run`; require all tests and unhandled rejection checks to pass.
3. Run `npx tsc --noEmit` and `npm run build`; require both to pass.
4. Run `npm run lint` and record the existing TypeScript parser failure separately. Do not claim lint success, suppress files, or expand this plan into an unapproved tooling migration.
5. Run credential-free Playwright checks only: `e2e/accessibility.spec.ts` plus the exact Back-to-login navigation test title from `registration.spec.ts`. Run the live registration attempt only when Firebase/backend prerequisites are explicitly available.
6. Run the Codecept authenticated suite when PostgreSQL, backend, frontend, Firebase config, and test credentials are available. If any prerequisite is unavailable, record the missing prerequisite and timestamp, leave the existing Codecept plan blocked for environment-dependent final verification, and allow this remediation plan to complete after its deterministic source, browser, and Sonar gates pass.
7. Review changes for accidental large-file scope expansion, public contract changes, and new accessibility regressions.
8. Use the Phase 1-confirmed analysis path. For Automatic Analysis, apply only the authorized generated/compiled-output UI exclusions, record actor, timestamp, and before/after values, push the intended branch/commit, and poll until the analyzed revision matches. For a scanner path, record the exact checked-in command and configuration. Define timeout and failed-analysis recovery before waiting.
9. Capture external before/after evidence: project key, branch, exclusion patterns, hotspot status, actor, timestamp, analysis revision, and quality-gate result.
10. Retrieve a fresh issue inventory with a newly rotated least-privilege token supplied through a masked environment secret. Reconcile by issue key, rule, file, and status; verify generated files are absent from analyzed code.
11. If any source or setting changes after a Sonar result, restart the complete cycle: focused tests, full Vitest, typecheck, build, relevant browser/auth checks, fresh Sonar analysis, analyzed-SHA verification, then key reconciliation.
12. Finalize the verification report with command templates, results, remaining unrelated lint blocker, quality-gate status, ratings, and hotspot review evidence. Redact secrets and machine-specific values.

## Success Criteria

- [x] Focused and full Vitest pass with zero unhandled errors.
- [x] TypeScript check and production build pass.
- [x] Selected Playwright scenarios pass; Codecept passes when prerequisites are available or is explicitly deferred with missing-prerequisite evidence in its active plan.
- [x] Fresh SonarCloud analysis closes all 72 baseline issue keys and records zero active vulnerabilities, bugs, or critical issues.
- [x] Hotspot status is Reviewed/Safe; generated report is absent from analysis.
- [x] Final report states the unrelated ESLint parser blocker without hiding it.
- [x] Every accepted red-team change is reflected in the ledger and analyzed revision.

## Risk Assessment

- Risk: Automatic Analysis runs against a different revision. Mitigation: compare analyzed revision and timestamp before accepting results.
- Risk: fixes create new Sonar findings. Mitigation: reconcile keys and active totals, then loop back to the owning phase.
- Risk: external credentials unavailable. Mitigation: keep token runtime-only and distinguish environment-blocked Codecept verification from source regression gates.

## Security Considerations

- Rotate the previously disclosed Sonar token. Use a replacement only for the final read-only API query and never write it to the repository.
