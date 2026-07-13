# Phase 2 implementation review

## Final re-review verdict

No blocking implementation findings remain. The two prior HIGH findings are resolved, and the remaining nested CTA Sonar shape is removed.

One non-blocking test-quality warning remains: the account-reordering test emits a React `act(...)` warning because the captured auth callback is invoked directly. The assertion passed and production behavior is covered, but wrapping those callback/resolution operations in `act` would keep the suite warning-clean.

## Resolved findings

### [RESOLVED] Unauthorized-profile cleanup rejection and retry loading

- File: `frontend/src/contexts/AuthContext.tsx:82-95`, `frontend/src/contexts/AuthContext.tsx:182-187`
- On a 401/403 profile response, `loadUserProfile` awaits `signOutLocally()` inside its catch block. If Firebase local sign-out rejects, `loadUserProfile` rejects instead of completing the documented unauthorized-profile transition. The auth-state callback then has an unhandled rejected promise; `retryProfile` also skips its final `setIsLoading(false)`. The application user is cleared, but the provider can remain loading and configured-provider cleanup errors escape the error contract.
- Resolution: local sign-out is contained with `try/catch`; retry loading uses `finally`; the 401 cleanup-rejection test proves loading settles and backend logout is not called.

### [RESOLVED] Stale profile response race coverage

- File: `frontend/src/contexts/AuthContext.test.tsx:70-362`
- The phase explicitly requires deferred-promise coverage for logout-before-profile-resolution, user-A/user-B reordering, unmount during profile fetch, retry recovery, and explicit logout revocation. Current tests cover only ordinary initialization/login/logout and one transient profile rejection. The generation logic is therefore not proven against the exact races it was introduced to prevent.
- Resolution: deferred tests now cover logout-before-profile-resolution and user-A/user-B response reordering. Retry recovery and local-only unauthorized cleanup are also covered. Generation invalidation prevents stale user restoration.

### [MEDIUM] Sonar resolution ledger and hotspot disposition remain incomplete

- File: `plans/260713-0640-sonarcloud-issue-remediation/reports/sonar-resolution-ledger.md`
- All Phase 2 issue rows still say `planned-source-fix`, and hotspot `AZ6byqk4lOSKnspRmX2d` is not recorded as Reviewed/Safe with the approved identifier-not-secret threat model. Thus the first two Phase 2 success criteria are not currently satisfied, even though the implementation keeps `Math.random()` as planned.
- Required fix: update the ledger only after source verification, documenting database uniqueness, non-secret identifier use, and the separate server-allocation/authorization follow-ups.

### [RESOLVED] StudentModal nested CTA ternary

- File: `frontend/src/components/StudentModal.tsx:305-317`
- The submit label moved to a helper, but the JSX still uses `isLoading ? ... : mode === 'create' ? ... : ...`. This leaves the `typescript:S3358` nested-ternary shape that Phase 2 step 8 says to replace with a named decision, so at least one assigned Sonar finding may survive fresh analysis.
- Resolution: CTA content is rendered through a flat `renderSubmitContent` decision with no nested conditional expression in JSX.

## Success-criteria audit

- 13 Phase 2 source fixes: **PASS by implementation inspection**; ledger closure remains a finalization/sync-back action.
- Hotspot Reviewed/Safe documented: **FAIL** — disposition absent from ledger.
- Immutable explicitly typed Firebase exports; invalid-key mock mode: **PASS by inspection**.
- Stable AuthContext callbacks/provider value: **PASS by inspection** (`useCallback`, functional update, `useMemo`).
- Focused auth/modal/Login tests: **PASS** — fresh re-run: 6 files, 50 tests passed.
- Configured Firebase failures cannot enter mock auth: **PASS by implementation and service tests**.
- Stale profile responses cannot restore user: **PASS** — logout-before-resolution and out-of-order account tests pass.
- Transient profile failure retains Firebase identity with no app user/inferred role; retry: **PASS**.
- Failed save stays open; successful save closes once: **PASS** in component/adapter tests and inspection.
- Firebase/Auth TypeScript errors removed: **not independently re-run in this review**; no unsafe nullable Firebase SDK call found.

## Regression and contract notes

- `Students.tsx` correctly rethrows save failures; `StudentModal` closes only after resolved submission.
- Configured Firebase credential/provider errors propagate instead of silently authenticating through mock mode.
- Explicit logout remains the only reviewed path using backend `/auth/logout`; unauthorized profile cleanup calls local sign-out only.
- Public auth context intentionally adds `isProfileUnavailable` and `retryProfile`; existing members remain present.
- Student ID remains a public identifier, not an authentication/authorization secret. Browser crypto would not repair authorization.

## Verification evidence

- Command: `npm run test:run -- --run src/contexts/AuthContext.test.tsx src/components/StudentModal.test.tsx src/components/student-modal-helpers.test.ts src/pages/admin/Students.test.tsx src/services/auth.service.test.ts src/pages/auth/Login.test.tsx`
- Result: 6 test files passed, 50 tests passed, exit 0.
- Review result: **APPROVED** for Phase 2 implementation. Ledger/hotspot sync-back remains required during finalization.

Status: DONE
Summary: Prior auth cleanup/loading and stale-response blockers are fixed; CTA nested ternary removed; focused verification passes 50/50 tests.
Concerns/Blockers: No implementation blocker. Finalization must update the Sonar resolution ledger and hotspot Reviewed/Safe disposition. Optional: remove the React `act(...)` warning in the account-reordering test.
