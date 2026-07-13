---
date: 2026-07-13
session: sonarcloud-phase-04-maintainability
status: completed-with-deferred-tooling-debt
---

# Journal: 2026-07-13 — SonarCloud Phase 4 Maintainability

## Context

Phase 4 addressed 26 remaining frontend maintainability findings through narrow, behavior-preserving refactors. Scope protected GPA presentation, alert/status colors, enrollment filtering, generated course codes, chart identity, route authorization, and API redirect behavior. Broad component decomposition stayed deferred.

## What Happened

- Replaced nested ternaries and indirect existence checks with named lookups, precomputed branches, and `.some` while retaining fallback classes, ordering, and rendered states.
- Replaced chart array-index keys with explicit or content-derived keys; dashboard status payloads now carry stable domain keys.
- Modernized numeric/string APIs, readonly bindings/props, optional access, JSX structure, and interceptor rejection handling.
- Preserved the legacy UTF-16 course-code hash exactly, including ASCII, BMP, and surrogate-pair behavior.
- Added characterization tests for course codes, chart keys, GPA boundaries, enrollment behavior, modal failures, and API 401 redirect/sign-out branches.
- Verified focused tests 19/19, full Vitest 76/76, standalone TypeScript, and production build. Reviewer passed Phase 4 at 94/100 with no demonstrated business or UI regression.
- Applied the user-approved Vite/Vitest type-only repair in `frontend/vite.config.ts`. Module augmentation fixes project-reference compilation without dependency, runtime, proxy, route, schema, or test-option changes.
- Left repository-wide ESLint parsing debt explicit: missing TypeScript/ES-module-aware configuration causes 64 syntax-stage failures before rules run.

## Reflection

Characterization tests made mechanical Sonar remediation safer than relying on visual similarity or source inspection alone. The course-code hash was the sharpest edge: a superficially modern string iteration would change persisted identifiers, so compatibility required preserving UTF-16 code-unit contributions. Separating the type-only Vite repair from the 26 source findings also kept ownership honest. Green product gates do not imply SonarCloud closure; server-side reconciliation still needs fresh analysis.

## Decisions

| Decision | Rationale | Impact |
|---|---|---|
| Keep refactors local | Reduce regression surface while clearing rule-focused findings | No broad page/component split |
| Preserve legacy course-code hashing | Existing generated identifiers are a compatibility contract | ASCII, BMP, surrogate-pair fixtures remain identical |
| Add characterization tests around touchpoints | Prove colors, filtering, keys, modal, and redirect behavior | Focused and full suites green |
| Approve only Vite/Vitest type repair | Required to restore the committed production-build gate | Build green; runtime unchanged |
| Defer ESLint parser infrastructure | User selected narrow repair; master plan treats tooling setup separately | Known 64 parser errors remain documented |
| Keep issue closure pending fresh analysis | Local source changes cannot prove SonarCloud server state | Phase 5 owns reconciliation |

## Next

- Run Phase 5 fresh SonarCloud analysis.
- Reconcile all Phase 4 issue keys against server results; reopen only evidence-backed misses.
- Scope TypeScript-aware ESLint parser/plugin configuration separately before treating lint as a meaningful rule gate.
- Keep generated build metadata and unrelated dirty files out of any focused Phase 4 commit.

## Unresolved Questions

- When should the separately scoped ESLint infrastructure repair be scheduled?
- Will fresh SonarCloud analysis confirm closure of all 26 Phase 4 issue keys?
