---
report_type: debugger-phase-03-regression-audit
created_at: 2026-07-13T17:52:00+07:00
phase: 3
status: pass-with-baseline-static-check-blockers
---

# Debugger Report — Phase 3 Regression Audit

## Verdict

No reproducible Phase 3 behavior regression found. Focused Phase 3 tests, full Vitest, and credential-free Playwright keyboard navigation pass. Compiler/package failures match the documented Phase 2 baseline and point only to out-of-phase `mockAuth.ts` and `vite.config.ts`. Repository lint is unusable because ESLint lacks TypeScript/module parsing configuration; this is repository-wide baseline, not introduced by Phase 3.

## Evidence

| Check | Result |
|---|---|
| Focused Phase 3 Vitest, 8 files | PASS: 10/10 |
| Full frontend Vitest | PASS: 60/60, 14 files |
| Playwright `e2e/accessibility.spec.ts`, Chromium | PASS: 2/2 |
| `npx tsc --noEmit` | FAIL: only `mockAuth.ts:38,58` unused `password` |
| Production package command | FAIL: same two `mockAuth.ts` errors plus `vite.config.ts:22` unsupported `test` property |
| `npm run lint` | FAIL: 61 repository-wide parser errors beginning at ES module/TypeScript syntax |

The compiler and package diagnostics are identical in ownership and substance to `tester-phase-02-verification.md`. No diagnostic references a Phase 3 implementation or test file. The lint command rejects untouched files such as `App.tsx`, `ConfirmDialog.tsx`, and `playwright.config.ts` at their first import/type syntax, proving a global ESLint configuration baseline rather than a Phase 3 rule regression.

## Regression Audit

### Backdrop layering and pointer behavior

- Layout backdrop remains `fixed inset-0 z-[60]`; sidebar remains `z-[70]`. Sidebar stays above the backdrop and remains clickable.
- Enrolled Students backdrop remains an `absolute inset-0` sibling before a `relative` modal content node. DOM paint order keeps content above backdrop; focused Enter closes in the component test.
- Native buttons provide click, Enter, and Space activation without custom key handlers. Tailwind preflight resets button border/background/font defaults, while explicit backdrop classes preserve the visible overlay.
- No changed backdrop wraps dialog content, so content clicks do not bubble through a backdrop close handler.

### Keyboard controls and navigation

- GPA card is now a native `type="button"`; focused Space toggles scale in Vitest. It is full-width and text-left, preserving the card layout rather than adopting intrinsic button sizing.
- Forgot Password and Register use React Router `Link` with unchanged visible copy and exact `/login` destination. Both Playwright keyboard cases pass.
- Layout and modal close controls have accessible names. Native button semantics cover keyboard activation.

### Labels and IDs

- Course Proposal labels target the currently rendered department control, including the alternate new-department input.
- MyGrades enrollment selectors and Student Profile fields have matching stable `htmlFor`/`id` pairs.
- Added IDs are unique within each rendered page/modal. No public data shape, service signature, route, or exported type changed.
- Student Profile disabled fields remain disabled until Edit Profile; focused test confirms transition to enabled state.

### MyGrades behavior

- Enrollment exclusion changes array membership to equivalent `Set` membership and retains the prior course-code and department fallback semantics.
- `parseBoundedNumber` accepts inclusive score boundaries 0 and 10, rejects out-of-range and nonnumeric values, and preserves the prior update-on-blur workflow.
- Weight entry retains the existing remaining-weight tolerance (`max + 0.1`) while rejecting negative/nonnumeric input.
- Loading/empty/content selection is mutually exclusive and equivalent to the removed nested ternary. Helper tests cover all three views.
- GPA scale state, enrollment selection, grade service payload types, disabled Enroll state, and edit/update service contracts are unchanged.

## Coverage Notes

- Component tests directly exercise Courses backdrop Enter and GPA Space. Layout backdrop is clicked rather than activated with Space, but it is a native button using the same browser activation contract.
- Playwright covers keyboard Back-to-login routes only, as planned. Modal pointer layering is supported by DOM/z-index inspection plus component interaction tests, not a browser coordinate-click assertion.
- `parseBoundedNumber` intentionally retains `Number.parseFloat` prefix parsing behavior (for example `"5abc"` parses as 5), matching the prior implementation. This is not a regression, though strict numeric-token validation would require a separate accepted behavior change.

## Conclusion

Phase 3 satisfies the audited accessibility, navigation, enrollment-filtering, numeric-boundary, view-selection, and disabled/edit-state contracts without a detected side effect. Static all-green acceptance remains blocked by known repository baseline work outside Phase 3.

## Unresolved Questions

None for Phase 3 regression scope.

Status: DONE_WITH_CONCERNS

Summary: No Phase 3 regression reproduced; focused tests 10/10, full Vitest 60/60, and Playwright 2/2 pass. Compiler/package/lint failures are documented repository baseline, not Phase 3-owned.

Concerns/Blockers: Final repository static gate still requires the planned `mockAuth.ts` unused-parameter fix, `vite.config.ts` Vitest typing fix, and a functional TypeScript-aware ESLint configuration.
