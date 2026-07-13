---
phase: 3
title: Repair Accessibility and Form Semantics
status: completed
priority: P1
dependencies:
  - 2
effort: 4h
---

# Phase 3: Repair Accessibility and Form Semantics

## Overview

Resolve 28 findings: the remaining 21 accessibility findings plus all seven `MyGrades` maintainability findings. Preserve visible copy, routes, modal layering, grade calculations, and enrollment behavior.

## Requirements

- Functional: labels discover controls; Back to login navigation stays unchanged; modal backdrops and GPA toggle work with mouse, Enter, and Space.
- Non-functional: prefer native buttons/links over ARIA emulation; touched icon-only controls receive accessible names.

## Architecture

Fix semantics at the rendered element. Add stable `id`/`htmlFor` pairs for form controls. Convert click-only navigation to React Router `Link`. Convert interactive backdrops and the GPA card to native buttons while retaining visual layout through reset classes. Avoid new accessibility libraries or a full modal focus framework. Extract narrow pure `MyGrades` seams so its 927-line component is touched in one phase only.

## Related Code Files

- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/CourseProposalModal.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/Layout.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Courses.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/auth/ForgotPassword.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/auth/Register.tsx`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/MyGrades.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/my-grades-helpers.ts`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/my-grades-helpers.test.ts`
- Modify: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/StudentProfile.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/CourseProposalModal.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/components/Layout.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/admin/Courses.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/auth/ForgotPassword.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/auth/Register.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/MyGrades.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/src/pages/student/StudentProfile.test.tsx`
- Create: `/home/bruk/Projects/UTH_OOSD/frontend/e2e/accessibility.spec.ts`

## Implementation Steps

1. Add `htmlFor`/`id` pairs for all reported CourseProposalModal, MyGrades, and StudentProfile labels; include analogous fields in the same form for consistency.
2. Ensure StudentModal label coverage from Phase 2 remains included in shared accessibility tests.
3. Replace Layout and EnrolledStudentsModal click-only backdrop `div`s with named native buttons; preserve z-index, full-screen hit area, and underlying dialog content.
4. Replace ForgotPassword/Register clickable paragraphs with `Link` while preserving visible “Back to login” text and `/login` destination.
5. Extract pure `MyGrades` helpers for offering filtering and `Set` membership, numeric parsing/bounds, and loading/empty/content view selection. Replace reported `parseFloat`/`isNaN`, nested ternary, and array-membership findings through these tested seams.
6. Replace the MyGrades clickable GPA card with a named button; preserve card styling and scale-toggle state.
7. Add accessible names to close/regenerate icon buttons touched by these edits.
8. Add Testing Library tests using roles and `getByLabelText`; cover click, Enter, Space, disabled/edit states, navigation, enrollment filtering, and grade-entry numeric boundaries.
9. Add a narrow Playwright accessibility spec for credential-free Back-to-login and keyboard scenarios. Do not run the live registration attempt as a mandatory gate.
10. Run focused tests, TypeScript check, and production build. Record all 28 Phase 3 issue keys as fixed in the ledger.

## Success Criteria

- [x] All 12 reported labels are associated with controls; StudentModal label remains fixed from Phase 2.
- [x] Three non-native interactive findings, five click-only findings, and two non-interactive navigation findings close.
- [x] Visible labels, routes, modal layout, and pointer behavior remain unchanged.
- [x] Focused Vitest and Playwright keyboard scenarios pass.
- [x] All seven `MyGrades` maintainability findings close through direct helper/page tests.

## Risk Assessment

- Risk: full-screen button backdrops overlap dialog controls. Mitigation: keep backdrop as a separate lower-z-index sibling and test close/content clicks.
- Risk: changing container element affects CSS layout. Mitigation: reset button appearance explicitly and preserve existing layout classes.
