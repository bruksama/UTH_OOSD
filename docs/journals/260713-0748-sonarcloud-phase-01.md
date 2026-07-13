---
date: 2026-07-13
session: sonarcloud-remediation-phase-01
plan: 260713-0640-sonarcloud-issue-remediation
status: completed
---

# Journal: 2026-07-13 — SonarCloud Phase 1

## Context

Phase 1 established the July 11 SonarCloud baseline and removed generated output from repository and analysis scope before source remediation. Scope: 72 active issues, one security hotspot, five findings located in a generated Playwright HTML report.

## What Happened

- Recorded 72 issue keys plus hotspot exactly once in the resolution ledger; phase allocation reconciled 5/13/28/26 across Phases 1–4.
- Completed generated-artifact lifecycle: delete three tracked outputs, ignore their directories, preserve Playwright generation config, regenerate output in a credential-free test, then clean it back to intended deletion state.
- Confirmed SonarCloud Automatic Analysis remains enabled. Applied eight generated/compiled-output exclusions for Playwright reports/results/screenshots, frontend coverage, compiled frontend bundle, frontend output, backend compiled output, and JaCoCo reports. No source directory excluded.
- Recorded external-setting evidence: empty project-level exclusion before, eight values after, administrator actor, and `2026-07-13T07:39:18+07:00` timestamp.
- Independent review passed. Credential-free Playwright navigation passed 1/1. No application source, API, schema, exported type, environment contract, test spec, or Playwright config changed.
- Full Vitest reproduced baseline exactly: 13 failed, 26 passed, three unhandled errors; delta zero. Attribution: eight failures in `auth.service.test.ts`, two in `AuthContext.test.tsx`, three in `Login.test.tsx`, plus three auth-related unhandled rejections. Phase 1 changed none of these source/test/config touchpoints, so failures remain Phase 2 auth debt, not Phase 1 regression.

## Reflection

Handling generated output at its lifecycle boundary worked cleanly: remove tracked artifacts, prevent re-tracking, keep local diagnostics available, exclude only generated/compiled paths. Key-by-key ledger made scope measurable and prevented silent loss. Main caveat operational, not behavioral: unstaged historical paths remain visible in the Git index until deletion is staged/committed.

## Decisions

| Decision | Rationale | Impact |
|---|---|---|
| Keep Automatic Analysis | Existing project analysis owner; no scanner config needed | Avoid dead `sonar-project.properties` |
| Exclude eight narrow output paths | Findings came from generated or compiled artifacts | Source findings remain visible |
| Preserve Playwright reporter/spec behavior | Reports still useful locally | Output remains reproducible but untracked |
| Treat Vitest result as unchanged baseline | Exact count/file match and zero Phase 1 touchpoint diff | Phase 2 owns auth failures; no false regression claim |
| Defer credential rotation choice to user | Disclosed credential requires owner decision and replacement timing | Revoke/rotate pending; never reproduce credential in records |

## Next

- Stage/commit `.gitignore` plus three generated-file deletions before relying on index-aware ignore behavior.
- Execute Phase 2 Firebase/Auth/StudentModal source remediation and auth test repair.
- Rotate or revoke the disclosed Sonar credential when user approves; use a fresh least-privilege secret for final verification.
- Fresh Sonar analysis later must confirm issue keys 005–009 disappear.

## Unresolved Questions

- Should the disclosed Sonar credential be revoked now and replaced before Phase 2/5 work?
- Should the scoped Phase 1 changes be committed now?
