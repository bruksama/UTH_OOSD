---
phase: 4
title: "Clear Remaining Maintainability Findings"
status: completed
priority: P2
dependencies: [3]
effort: "4h"
---

# Phase 4: Clear Remaining Maintainability Findings

## Overview

Clear the final 26 maintainability findings through small, rule-focused edits. Preserve UI output and business calculations; avoid broad large-file decomposition.

## Requirements

- Functional: no changes to alert/status colors, GPA calculations, enrollment filtering, generated ASCII course codes, API redirect behavior, or route authorization.
- Non-functional: named decisions replace nested ternaries; stable list keys; modern Number/string APIs; readonly bindings and props where valid.

## Architecture

Apply the narrowest change per rule. Extract pure local lookup functions/constants only when repeated ternaries obscure behavior. `Courses.tsx` and other files over 200 lines were considered for modularization; full decomposition is deferred because mixing file moves with issue fixes raises regression risk. All `MyGrades` edits are owned by Phase 3.

## Related Code Files

- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/charts/ChartComponents.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/CourseProposalModal.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Alerts.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Courses.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Dashboard.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Students.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/auth/Register.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/MyAlerts.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/ProtectedRoute.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/services/api.ts`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/services/mockAuth.ts`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/utils/helpers.ts`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/utils/helpers.test.ts`

## Implementation Steps

1. Replace the remaining reported global numeric APIs with `Number` methods; use optional chaining and default parameters where reported. `MyGrades` numeric/Set changes are already completed in Phase 3.
2. Replace `.find` and filtered-length existence checks with `.some` without changing data later rendered.
3. Replace alert, status, leaderboard, GPA, and loading/empty/content nested ternaries with named lookup functions or precomputed variables. Preserve every default branch and class string.
4. Define stable keys in the local chart payload/data contracts and update every producer in `Dashboard.tsx`; include duplicate-label fixtures. Do not modify unrelated shared types.
5. Replace `charCodeAt` while preserving the legacy UTF-16 code-unit hash exactly, including surrogate-pair fixtures. Derive equivalent code-unit contributions from `codePointAt` rather than accepting changed persisted course codes.
6. Mark `ProtectedRoute` props readonly, `MockAuthService.state` binding readonly, prefix intentionally unused mock password parameters for TypeScript, and remove the useless Students fragment and ambiguous JSX spacing.
7. Replace interceptor `Promise.reject(error)` return with `throw error`; test 401 profile/non-profile behavior and redirect contract.
8. Add or extend focused tests for helpers, course-code generation, chart keys, status-class lookup, and API interceptor behavior.
9. Run focused tests, full TypeScript check, and production build. Record all remaining issue keys as fixed.

## Success Criteria

- [x] All 26 Phase 4 issue keys are source-fixed; fresh-analysis closure remains Phase 5.
- [x] ASCII course codes, grade calculations, colors, and route/API behavior match characterization tests.
- [x] No array-index key remains at the two reported chart locations.
- [x] No broad page/component split is mixed into remediation commits.
- [x] TypeScript check and production build pass.

## Risk Assessment

- Risk: lookup refactors lose fallback styles. Mitigation: table-driven tests include unknown/default enum values.
- Risk: hash refactor alters persisted course codes. Mitigation: require exact legacy fixtures for ASCII, BMP, and surrogate-pair input.
- Risk: stable chart keys are not unique. Mitigation: verify upstream data; add an explicit domain ID only when required.
