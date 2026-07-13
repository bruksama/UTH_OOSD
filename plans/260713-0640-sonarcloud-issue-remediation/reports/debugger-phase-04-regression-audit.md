---
report_type: debugger-phase-04-regression-audit
created_at: 2026-07-13T00:00:00+07:00
phase: 4
status: pass-with-baseline-tooling-blockers
---

# Debugger Report — Phase 4 Regression Audit

## Verdict

Neither verification failure was introduced by Phase 4. The production-build TS2769 is a tracked configuration/dependency compatibility defect in committed `vite.config.ts`; the 64 lint diagnostics are a repository-wide ESLint parser/configuration baseline. Phase 4 source behavior is independently green: focused tests 19/19, full Vitest 76/76, and `npx tsc --noEmit` pass.

## Exact Root Cause and Attribution

### `npm run build`: `vite.config.ts:22` TS2769

`npm run build` executes `tsc -b && vite build`. Project-reference compilation includes `tsconfig.node.json`, which includes `vite.config.ts`. That file imports `defineConfig` from `vite`, but places Vitest's `test` property in the object. The currently resolved Vite `UserConfigExport` does not contain that property, so TypeScript stops before bundling.

The dependency tree is internally split:

- project Vite: `vite@5.4.21`
- `@vitejs/plugin-react@4.7.0`: uses project Vite 5
- `vitest@4.0.18`: installs its own `vite@7.3.1`
- TypeScript: `5.9.3`

The existing `/// <reference types="vitest" />` does not add the required `test` property to the Vite 5 config type in this installation. Current Vitest configuration typing uses `vitest/config` (or its config type reference), not the broad `vitest` reference used here.

Attribution evidence:

- `git diff` shows no Phase 4 change to `vite.config.ts`, `tsconfig.node.json`, `package.json`, or `package-lock.json`.
- `git blame` dates the `test` block to commit `5d7f59c` and the broad Vitest reference to `055a1e4`, months before this remediation.
- The same diagnostic is recorded by Phase 2 and Phase 3 tester/debugger reports.
- Phase 4 removed the prior `mockAuth.ts` diagnostics; the config diagnostic is now the only build failure.

Classification: **committed baseline/configuration debt, not Phase 4 and not an earlier dirty working-tree change**.

### `npm run lint`: 64 parser errors

The repository has no tracked or untracked ESLint configuration (`eslint.config.*` or `.eslintrc*`) and no TypeScript ESLint parser/plugin dependency. ESLint 8 therefore parses with its legacy defaults, rejecting ES-module imports/exports and TypeScript syntax before any lint rule can run.

Evidence:

- Errors occur at first-token syntax in untouched baseline files such as `src/App.tsx`, `src/components/ConfirmDialog.tsx`, and `playwright.config.ts`.
- The failure classes are `The keyword 'import' is reserved`, `The keyword 'export' is reserved`, and `Unexpected token` on TypeScript declarations.
- The count rose from 48/61 to 64 because Phase 3/4 added TypeScript tests/helpers that the broken repository-wide command now scans. Phase 4 increased the number of affected files but did not create the parser defect.
- `package.json`'s lint command and ESLint dependencies have no Phase 4 diff.

Classification: **committed baseline tooling omission**. Some new Phase 4 files contribute to the total count, but none caused the common root failure.

## Narrowest Safe Fix

### Build typing

First try the one-line, contract-correct config typing change in `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
```

Retain `defineConfig` from `vite` so the application remains a Vite 5 project, then run `npm run build` and `npm run test:run`. If the split Vite 5/Vite 7 dependency types still conflict, the next safe fix is to align Vitest to a Vite-5-compatible major version (with lockfile update), rather than suppressing the diagnostic. Upgrading the whole Vite toolchain is broader and riskier.

This fix is not one of Phase 4's listed source touchpoints or 26 Sonar findings. It is, however, required by Phase 4/5's explicit production-build success criterion. Treat as a narrowly approved verification-enabler in Phase 5 or a separately accepted tooling slice; do not mislabel it as a Phase 4 maintainability finding.

### ESLint

Add a real TypeScript-aware ESLint configuration and matching parser/plugin dependencies, then resolve actual rule findings exposed after parsing. This is not safely reducible to a parser flag in the existing command, and suppressing TypeScript files would hide errors.

The master plan explicitly places ESLint TypeScript parser/tooling repair out of scope, while Phase 5 requires recording the blocker honestly. Therefore do not expand Phase 4 to fix it without user approval.

## Alternative Build Commands

`npx tsc --noEmit && npx vite build` or `npx vite build` may produce application assets because they avoid `tsc -b`'s node-config check. They are useful diagnostic splits, but are **not valid substitutes** for the repository's intended `npm run build`: they bypass the exact committed configuration error and would falsely green the required gate.

Selecting the generated tracked `vite.config.js` explicitly has the same problem: it bypasses validation of the authoritative TypeScript config, and that generated file is already dirty for unrelated proxy/reference changes. No existing documented command provides a legitimate all-green production build without hiding the TS2769 failure.

## Scope Decision

- Phase 4 implementation regression: none found.
- Phase 4 success criterion blocker: build typing mismatch must be fixed or explicitly moved to Phase 5 before Phase 4 can claim the production-build checkbox.
- Phase 4 scope expansion recommended: no source refactor; only the narrowly approved config typing repair if the controller chooses to satisfy the gate now.
- ESLint repair: outside this plan's accepted scope; report in Phase 5.

## Unresolved Questions

- Will the controller approve the one-line `vitest/config` typing repair as a Phase 5 verification-enabler, with dependency alignment only if the one-line fix proves insufficient?

Status: DONE_WITH_CONCERNS

Summary: Phase 4 did not cause either failure. Build is blocked by an old Vite/Vitest config typing mismatch; lint is blocked by the old absence of TypeScript-aware ESLint configuration.

Concerns/Blockers: `npm run build` cannot validly be marked green by bypass commands. ESLint repair remains explicitly out of scope.
