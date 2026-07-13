---
phase: 1
title: "Establish Baseline and Analysis Scope"
status: completed
priority: P1
dependencies: []
effort: "1h"
---

# Phase 1: Establish Baseline and Analysis Scope

<!-- Updated: Validation Session 1 - authorized audited, narrowly scoped SonarCloud UI exclusions when Automatic Analysis is active -->

## Overview

Remove five generated-artifact findings safely, establish a key-by-key resolution ledger, and confirm how SonarCloud analyzes this repository before source edits begin.

## Context Links

- [Baseline issue report](../reports/260713-0616-sonarcloud-issue-report.md)
- [Project README](../../README.md)

## Requirements

- Functional: preserve Playwright report generation locally while removing generated output from version control and source analysis.
- Non-functional: do not create, commit, or log a Sonar token; do not suppress source-code findings.

## Architecture

The repository has no Sonar workflow or properties file, so execution first confirms SonarCloud Automatic Analysis. Generated output is handled at its lifecycle boundary: untrack it, ignore regeneration, then configure the matching SonarCloud analysis-scope exclusion. Add repository scanner configuration only if execution proves Automatic Analysis is not active.

## Related Code Files

- Delete: `/home/bruk/Projects/UTH_OOSD/frontend/playwright-report/index.html`
- Delete/untrack: `/home/bruk/Projects/UTH_OOSD/frontend/test-results/.last-run.json`
- Delete/untrack if confirmed generated: `/home/bruk/Projects/UTH_OOSD/frontend/e2e/screenshots/registration-result.png`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/.gitignore`
- Read/verify: `/home/bruk/Projects/UTH_OOSD/frontend/playwright.config.ts`
- Create: `/home/bruk/Projects/UTH_OOSD/plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`

## Implementation Steps

1. Record baseline analysis date, revision, 72 issue keys, one hotspot key, severity, rule, and planned phase in the resolution ledger.
2. Confirm SonarCloud project key, default branch, Automatic Analysis state, current exclusions, hotspot state, and administrator. When Automatic Analysis is active, narrowly scoped UI exclusion changes for generated/compiled outputs are authorized. Record actor, timestamp, and before/after values for every external setting change.
3. Delete tracked `frontend/playwright-report/index.html`; keep `playwright.config.ts` report generation unchanged.
4. Inventory tracked generated paths with `git ls-files`; untrack all Playwright reports, result metadata, traces, video, failure screenshots, and generated E2E screenshots. Ignore their directories in `frontend/.gitignore`; preserve existing `output/` and `coverage` rules.
5. Configure defense-in-depth exclusions for generated and compiled outputs: Playwright reports/results, coverage, dist, frontend output, backend compiled output, and JaCoCo reports.
6. Verify `git ls-files frontend/playwright-report frontend/test-results frontend/e2e/screenshots` returns no generated artifact and a local test run can regenerate ignored output.
7. Mark baseline issues 005–009 as `removed-generated-artifact`, pending fresh-analysis confirmation.

## Success Criteria

- [x] Five generated HTML/CSS findings have an explicit removal path.
- [x] Generated reports remain locally producible but are untracked and ignored.
- [x] Analysis-scope ownership is confirmed; no dead `sonar-project.properties` is added.
- [x] Resolution ledger covers all 72 issues plus the hotspot exactly once.

## Risk Assessment

- Risk: deleting the report could be mistaken for deleting tests. Mitigation: retain Playwright config/specs and verify regeneration.
- Risk: exclusions hide real source. Mitigation: patterns target generated and compiled directories only.

## Security Considerations

- A named SonarCloud administrator owns revocation of the disclosed token and creation of a least-privilege replacement.
- Supply tokens through a masked environment/CI secret, never command arguments or query strings; disable shell tracing and record command templates only.
