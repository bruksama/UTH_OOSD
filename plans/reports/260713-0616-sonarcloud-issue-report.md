---
report_type: sonarcloud-issue-inventory
generated_at: 2026-07-13T06:16:00+07:00
project_key: bruksama_UTH_OOSD
sonar_organization: bruksama
analysis_date: 2026-07-11T05:22:50Z
scope: active issues and security hotspots
---

# SonarCloud Issue Report — UTH_OOSD

## Summary

- Quality gate: **Passed**
- Active issues: **72** (7 bugs, 65 code smells, 0 vulnerabilities)
- Severity: **4 critical**, **48 major**, **20 minor**
- Security hotspots awaiting review: **1**
- Estimated remediation effort: **5h 36m**
- Generated-artifact findings: **5** in `frontend/playwright-report/index.html`; triage as scan exclusions before code fixes
- Source: SonarCloud Web API, active unresolved findings only
- Token handling: access token not stored in this report or project files

The quality gate passes because its current conditions apply to new code. Overall code still contains the active findings inventoried below.

## Project Metrics

| Metric | Value |
|---|---:|
| Lines of code | 6,644 |
| Bugs | 7 |
| Vulnerabilities | 0 |
| Code smells | 65 |
| Security hotspots | 1 |
| Hotspots reviewed | 0.0% |
| Reliability rating | C |
| Security rating | A |
| Maintainability rating | A |
| Technical debt | 5h 36m |
| Duplicated lines | 0.6% |

## Issue Distribution

| Severity | Bugs | Code smells | Vulnerabilities | Total |
|---|---:|---:|---:|---:|
| CRITICAL | 0 | 4 | 0 | 4 |
| MAJOR | 2 | 46 | 0 | 48 |
| MINOR | 5 | 15 | 0 | 20 |
| **Total** | **7** | **65** | **0** | **72** |

## Recommended Fix Queue

1. Fix the 4 critical issues.
2. Fix the 7 bugs, prioritizing keyboard/accessibility behavior and malformed generated markup.
3. Review the 1 security hotspot; decide whether the pseudorandom ID use is security-sensitive.
4. Fix repeated high-volume rules first: nested ternaries, unassociated form labels, and accessibility semantics.
5. Triage `frontend/playwright-report/**`; generated test output should usually be excluded from source analysis.
6. Clear remaining major and minor maintainability findings, then rerun SonarCloud.

## Most Frequent Rules

| Count | Severity | Type | Rule | Message |
|---:|---|---|---|---|
| 17 | MAJOR | CODE_SMELL | `typescript:S3358` | Extract this nested ternary operation into an independent statement. |
| 12 | MAJOR | CODE_SMELL | `typescript:S6853` | A form label must be associated with a control. |
| 6 | MINOR | CODE_SMELL | `typescript:S7773` | Prefer `Number.isNaN` over `isNaN`. |
| 5 | MINOR | BUG | `typescript:S1082` | Visible, non-interactive elements with click handlers must have at least one keyboard listener. |
| 3 | CRITICAL | CODE_SMELL | `typescript:S6861` | Exporting mutable 'let' binding, use 'const' instead. |
| 3 | MAJOR | CODE_SMELL | `css:S4666` | Duplicate selector ":root", first used at line 78 |
| 3 | MAJOR | CODE_SMELL | `typescript:S6848` | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. |
| 2 | MAJOR | CODE_SMELL | `typescript:S6479` | Do not use Array index in keys |
| 2 | MAJOR | CODE_SMELL | `typescript:S6772` | Ambiguous spacing after previous element span |
| 2 | MAJOR | CODE_SMELL | `typescript:S6847` | Non-interactive elements should not be assigned mouse or keyboard event listeners. |
| 2 | MINOR | CODE_SMELL | `typescript:S7754` | Prefer `.some(…)` over `.find(…)`. |
| 1 | CRITICAL | CODE_SMELL | `typescript:S3776` | Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed. |
| 1 | MAJOR | BUG | `css:S4656` | Duplicate property "font-weight" |
| 1 | MAJOR | CODE_SMELL | `typescript:S2933` | Member 'state' is never reassigned; mark it as `readonly`. |
| 1 | MAJOR | CODE_SMELL | `typescript:S6481` | The 'value' object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. |
| 1 | MAJOR | CODE_SMELL | `typescript:S7746` | Prefer `throw error` over `return Promise.reject(error)`. |
| 1 | MAJOR | CODE_SMELL | `typescript:S7760` | Prefer default parameters over reassignment. |
| 1 | MAJOR | CODE_SMELL | `typescript:S8786` | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. |
| 1 | MAJOR | BUG | `Web:S5254` | Add "lang" and/or "xml:lang" attributes to the "<html>" or "<body>" element |
| 1 | MINOR | CODE_SMELL | `typescript:S1128` | Remove this unused import of 'getFirebaseErrorMessage'. |
| 1 | MINOR | CODE_SMELL | `typescript:S6353` | Use concise character class syntax '\d' instead of '[0-9]'. |
| 1 | MINOR | CODE_SMELL | `typescript:S6582` | Prefer using an optional chain expression instead, as it's more concise and easier to read. |
| 1 | MINOR | CODE_SMELL | `typescript:S6749` | Passing a fragment to an HTML element is useless. |
| 1 | MINOR | CODE_SMELL | `typescript:S6759` | Mark the props of the component as read-only. |
| 1 | MINOR | CODE_SMELL | `typescript:S7758` | Prefer `String#codePointAt()` over `String#charCodeAt()`. |
| 1 | MINOR | CODE_SMELL | `typescript:S7776` | `enrolledCourseCodes` should be a `Set`, and use `enrolledCourseCodes.has()` to check existence or non-existence. |

## Files With Findings

| Count | Critical | Bugs | Effort | File |
|---:|---:|---:|---:|---|
| 11 | 0 | 1 | 0h 40m | `frontend/src/pages/student/MyGrades.tsx` |
| 8 | 1 | 0 | 1h 0m | `frontend/src/components/StudentModal.tsx` |
| 7 | 0 | 0 | 0h 32m | `frontend/src/components/CourseProposalModal.tsx` |
| 5 | 0 | 2 | 0h 6m | `frontend/playwright-report/index.html` |
| 5 | 0 | 1 | 0h 25m | `frontend/src/pages/admin/Courses.tsx` |
| 4 | 0 | 0 | 0h 20m | `frontend/src/pages/admin/Alerts.tsx` |
| 4 | 0 | 0 | 0h 20m | `frontend/src/pages/admin/Students.tsx` |
| 4 | 0 | 0 | 0h 20m | `frontend/src/pages/student/StudentProfile.tsx` |
| 3 | 0 | 0 | 0h 15m | `frontend/src/components/charts/ChartComponents.tsx` |
| 3 | 3 | 0 | 0h 15m | `frontend/src/config/firebase.ts` |
| 3 | 0 | 0 | 0h 15m | `frontend/src/pages/admin/Dashboard.tsx` |
| 3 | 0 | 1 | 0h 15m | `frontend/src/pages/auth/Register.tsx` |
| 2 | 0 | 1 | 0h 10m | `frontend/src/components/Layout.tsx` |
| 2 | 0 | 0 | 0h 6m | `frontend/src/contexts/AuthContext.tsx` |
| 2 | 0 | 1 | 0h 10m | `frontend/src/pages/auth/ForgotPassword.tsx` |
| 2 | 0 | 0 | 0h 10m | `frontend/src/pages/student/MyAlerts.tsx` |
| 1 | 0 | 0 | 0h 5m | `frontend/src/components/ProtectedRoute.tsx` |
| 1 | 0 | 0 | 0h 5m | `frontend/src/services/api.ts` |
| 1 | 0 | 0 | 0h 2m | `frontend/src/services/mockAuth.ts` |
| 1 | 0 | 0 | 0h 5m | `frontend/src/utils/helpers.ts` |

## Full Active Issue Inventory

Sorted by severity, issue type, file, and line. The sequence number is the recommended working order within this inventory.

| # | Severity | Type | Rule | Location | Effort | Finding | Sonar |
|---:|---|---|---|---|---:|---|---|
| 001 | CRITICAL | CODE_SMELL | `typescript:S3776` | `frontend/src/components/StudentModal.tsx:31` | 10min | Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed. | [AZ6byqk4lOSKnspRmX2e](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2e&id=bruksama_UTH_OOSD) |
| 002 | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:29` | 5min | Exporting mutable 'let' binding, use 'const' instead. | [AZ6byqlTlOSKnspRmX2q](https://sonarcloud.io/project/issues?open=AZ6byqlTlOSKnspRmX2q&id=bruksama_UTH_OOSD) |
| 003 | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:30` | 5min | Exporting mutable 'let' binding, use 'const' instead. | [AZ6byqlTlOSKnspRmX2r](https://sonarcloud.io/project/issues?open=AZ6byqlTlOSKnspRmX2r&id=bruksama_UTH_OOSD) |
| 004 | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:31` | 5min | Exporting mutable 'let' binding, use 'const' instead. | [AZ6byqlTlOSKnspRmX2s](https://sonarcloud.io/project/issues?open=AZ6byqlTlOSKnspRmX2s&id=bruksama_UTH_OOSD) |
| 005 | MAJOR | BUG | `Web:S5254` | `frontend/playwright-report/index.html:4` | 2min | Add "lang" and/or "xml:lang" attributes to the "<html>" or "<body>" element | [AZ6byqlllOSKnspRmX2u](https://sonarcloud.io/project/issues?open=AZ6byqlllOSKnspRmX2u&id=bruksama_UTH_OOSD) |
| 006 | MAJOR | BUG | `css:S4656` | `frontend/playwright-report/index.html:78` | 1min | Duplicate property "font-weight" | [AZ6byqlllOSKnspRmX2v](https://sonarcloud.io/project/issues?open=AZ6byqlllOSKnspRmX2v&id=bruksama_UTH_OOSD) |
| 007 | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1min | Duplicate selector ":root", first used at line 78 | [AZ6byqlllOSKnspRmX2w](https://sonarcloud.io/project/issues?open=AZ6byqlllOSKnspRmX2w&id=bruksama_UTH_OOSD) |
| 008 | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1min | Duplicate selector ":root", first used at line 78 | [AZ6byqlllOSKnspRmX2x](https://sonarcloud.io/project/issues?open=AZ6byqlllOSKnspRmX2x&id=bruksama_UTH_OOSD) |
| 009 | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1min | Duplicate selector ":root.dark-mode", first used at line 78 | [AZ6byqlllOSKnspRmX2y](https://sonarcloud.io/project/issues?open=AZ6byqlllOSKnspRmX2y&id=bruksama_UTH_OOSD) |
| 010 | MAJOR | CODE_SMELL | `typescript:S6479` | `frontend/src/components/charts/ChartComponents.tsx:69` | 5min | Do not use Array index in keys | [AZ6byqkilOSKnspRmX2Y](https://sonarcloud.io/project/issues?open=AZ6byqkilOSKnspRmX2Y&id=bruksama_UTH_OOSD) |
| 011 | MAJOR | CODE_SMELL | `typescript:S6479` | `frontend/src/components/charts/ChartComponents.tsx:240` | 5min | Do not use Array index in keys | [AZ6byqkilOSKnspRmX2Z](https://sonarcloud.io/project/issues?open=AZ6byqkilOSKnspRmX2Z&id=bruksama_UTH_OOSD) |
| 012 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:146` | 5min | A form label must be associated with a control. | [AZ6byqkalOSKnspRmX2R](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2R&id=bruksama_UTH_OOSD) |
| 013 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:159` | 5min | A form label must be associated with a control. | [AZ6byqkalOSKnspRmX2S](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2S&id=bruksama_UTH_OOSD) |
| 014 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:200` | 5min | A form label must be associated with a control. | [AZ6byqkalOSKnspRmX2U](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2U&id=bruksama_UTH_OOSD) |
| 015 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:216` | 5min | A form label must be associated with a control. | [AZ6byqkalOSKnspRmX2V](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2V&id=bruksama_UTH_OOSD) |
| 016 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:227` | 5min | A form label must be associated with a control. | [AZ6byqkalOSKnspRmX2W](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2W&id=bruksama_UTH_OOSD) |
| 017 | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/components/Layout.tsx:103` | 5min | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | [AZ6byqkwlOSKnspRmX2b](https://sonarcloud.io/project/issues?open=AZ6byqkwlOSKnspRmX2b&id=bruksama_UTH_OOSD) |
| 018 | MAJOR | CODE_SMELL | `typescript:S8786` | `frontend/src/components/StudentModal.tsx:62` | 20min | Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking. | [AZ8ERWZzResu2fFb_6RM](https://sonarcloud.io/project/issues?open=AZ8ERWZzResu2fFb_6RM&id=bruksama_UTH_OOSD) |
| 019 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/StudentModal.tsx:147` | 5min | A form label must be associated with a control. | [AZ6byqk4lOSKnspRmX2g](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2g&id=bruksama_UTH_OOSD) |
| 020 | MAJOR | CODE_SMELL | `typescript:S6772` | `frontend/src/components/StudentModal.tsx:187` | 5min | Ambiguous spacing after previous element span | [AZ6byqk4lOSKnspRmX2h](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2h&id=bruksama_UTH_OOSD) |
| 021 | MAJOR | CODE_SMELL | `typescript:S6772` | `frontend/src/components/StudentModal.tsx:290` | 5min | Ambiguous spacing after previous element span | [AZ6byqk4lOSKnspRmX2i](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2i&id=bruksama_UTH_OOSD) |
| 022 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:306` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqk4lOSKnspRmX2j](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2j&id=bruksama_UTH_OOSD) |
| 023 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:307` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqk4lOSKnspRmX2k](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2k&id=bruksama_UTH_OOSD) |
| 024 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:343` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqk4lOSKnspRmX2l](https://sonarcloud.io/project/issues?open=AZ6byqk4lOSKnspRmX2l&id=bruksama_UTH_OOSD) |
| 025 | MAJOR | CODE_SMELL | `typescript:S6481` | `frontend/src/contexts/AuthContext.tsx:223` | 5min | The 'value' object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. | [AZ6byqlGlOSKnspRmX2o](https://sonarcloud.io/project/issues?open=AZ6byqlGlOSKnspRmX2o&id=bruksama_UTH_OOSD) |
| 026 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:144` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqholOSKnspRmX1y](https://sonarcloud.io/project/issues?open=AZ6byqholOSKnspRmX1y&id=bruksama_UTH_OOSD) |
| 027 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:144` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqholOSKnspRmX1z](https://sonarcloud.io/project/issues?open=AZ6byqholOSKnspRmX1z&id=bruksama_UTH_OOSD) |
| 028 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:151` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqholOSKnspRmX10](https://sonarcloud.io/project/issues?open=AZ6byqholOSKnspRmX10&id=bruksama_UTH_OOSD) |
| 029 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:152` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqholOSKnspRmX11](https://sonarcloud.io/project/issues?open=AZ6byqholOSKnspRmX11&id=bruksama_UTH_OOSD) |
| 030 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Courses.tsx:315` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqh5lOSKnspRmX2A](https://sonarcloud.io/project/issues?open=AZ6byqh5lOSKnspRmX2A&id=bruksama_UTH_OOSD) |
| 031 | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/pages/admin/Courses.tsx:431` | 5min | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | [AZ6byqh5lOSKnspRmX2B](https://sonarcloud.io/project/issues?open=AZ6byqh5lOSKnspRmX2B&id=bruksama_UTH_OOSD) |
| 032 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Courses.tsx:470` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqh5lOSKnspRmX2D](https://sonarcloud.io/project/issues?open=AZ6byqh5lOSKnspRmX2D&id=bruksama_UTH_OOSD) |
| 033 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Dashboard.tsx:259` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqhhlOSKnspRmX1v](https://sonarcloud.io/project/issues?open=AZ6byqhhlOSKnspRmX1v&id=bruksama_UTH_OOSD) |
| 034 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Dashboard.tsx:260` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqhhlOSKnspRmX1w](https://sonarcloud.io/project/issues?open=AZ6byqhhlOSKnspRmX1w&id=bruksama_UTH_OOSD) |
| 035 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:259` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqhwlOSKnspRmX14](https://sonarcloud.io/project/issues?open=AZ6byqhwlOSKnspRmX14&id=bruksama_UTH_OOSD) |
| 036 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:260` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqhwlOSKnspRmX15](https://sonarcloud.io/project/issues?open=AZ6byqhwlOSKnspRmX15&id=bruksama_UTH_OOSD) |
| 037 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:326` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqhwlOSKnspRmX17](https://sonarcloud.io/project/issues?open=AZ6byqhwlOSKnspRmX17&id=bruksama_UTH_OOSD) |
| 038 | MAJOR | CODE_SMELL | `typescript:S6847` | `frontend/src/pages/auth/ForgotPassword.tsx:81` | 5min | Non-interactive elements should not be assigned mouse or keyboard event listeners. | [AZ6byqgTlOSKnspRmX1l](https://sonarcloud.io/project/issues?open=AZ6byqgTlOSKnspRmX1l&id=bruksama_UTH_OOSD) |
| 039 | MAJOR | CODE_SMELL | `typescript:S6847` | `frontend/src/pages/auth/Register.tsx:124` | 5min | Non-interactive elements should not be assigned mouse or keyboard event listeners. | [AZ6byqhZlOSKnspRmX1o](https://sonarcloud.io/project/issues?open=AZ6byqhZlOSKnspRmX1o&id=bruksama_UTH_OOSD) |
| 040 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyAlerts.tsx:69` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqeQlOSKnspRmX1G](https://sonarcloud.io/project/issues?open=AZ6byqeQlOSKnspRmX1G&id=bruksama_UTH_OOSD) |
| 041 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyAlerts.tsx:79` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqeQlOSKnspRmX1H](https://sonarcloud.io/project/issues?open=AZ6byqeQlOSKnspRmX1H&id=bruksama_UTH_OOSD) |
| 042 | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/pages/student/MyGrades.tsx:448` | 5min | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | [AZ6byqgMlOSKnspRmX1a](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1a&id=bruksama_UTH_OOSD) |
| 043 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/MyGrades.tsx:697` | 5min | A form label must be associated with a control. | [AZ6byqgMlOSKnspRmX1g](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1g&id=bruksama_UTH_OOSD) |
| 044 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/MyGrades.tsx:713` | 5min | A form label must be associated with a control. | [AZ6byqgMlOSKnspRmX1h](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1h&id=bruksama_UTH_OOSD) |
| 045 | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyGrades.tsx:782` | 5min | Extract this nested ternary operation into an independent statement. | [AZ6byqgMlOSKnspRmX1i](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1i&id=bruksama_UTH_OOSD) |
| 046 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:179` | 5min | A form label must be associated with a control. | [AZ6byqgBlOSKnspRmX1O](https://sonarcloud.io/project/issues?open=AZ6byqgBlOSKnspRmX1O&id=bruksama_UTH_OOSD) |
| 047 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:191` | 5min | A form label must be associated with a control. | [AZ6byqgBlOSKnspRmX1P](https://sonarcloud.io/project/issues?open=AZ6byqgBlOSKnspRmX1P&id=bruksama_UTH_OOSD) |
| 048 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:203` | 5min | A form label must be associated with a control. | [AZ6byqgBlOSKnspRmX1Q](https://sonarcloud.io/project/issues?open=AZ6byqgBlOSKnspRmX1Q&id=bruksama_UTH_OOSD) |
| 049 | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:215` | 5min | A form label must be associated with a control. | [AZ6byqgBlOSKnspRmX1R](https://sonarcloud.io/project/issues?open=AZ6byqgBlOSKnspRmX1R&id=bruksama_UTH_OOSD) |
| 050 | MAJOR | CODE_SMELL | `typescript:S7746` | `frontend/src/services/api.ts:62` | 5min | Prefer `throw error` over `return Promise.reject(error)`. | [AZ6byqiAlOSKnspRmX2F](https://sonarcloud.io/project/issues?open=AZ6byqiAlOSKnspRmX2F&id=bruksama_UTH_OOSD) |
| 051 | MAJOR | CODE_SMELL | `typescript:S2933` | `frontend/src/services/mockAuth.ts:19` | 2min | Member 'state' is never reassigned; mark it as `readonly`. | [AZ6byqjWlOSKnspRmX2G](https://sonarcloud.io/project/issues?open=AZ6byqjWlOSKnspRmX2G&id=bruksama_UTH_OOSD) |
| 052 | MAJOR | CODE_SMELL | `typescript:S7760` | `frontend/src/utils/helpers.ts:151` | 5min | Prefer default parameters over reassignment. | [AZ6byqkSlOSKnspRmX2J](https://sonarcloud.io/project/issues?open=AZ6byqkSlOSKnspRmX2J&id=bruksama_UTH_OOSD) |
| 053 | MINOR | BUG | `typescript:S1082` | `frontend/src/components/Layout.tsx:103` | 5min | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | [AZ6byqkwlOSKnspRmX2c](https://sonarcloud.io/project/issues?open=AZ6byqkwlOSKnspRmX2c&id=bruksama_UTH_OOSD) |
| 054 | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/admin/Courses.tsx:431` | 5min | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | [AZ6byqh5lOSKnspRmX2C](https://sonarcloud.io/project/issues?open=AZ6byqh5lOSKnspRmX2C&id=bruksama_UTH_OOSD) |
| 055 | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/auth/ForgotPassword.tsx:81` | 5min | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | [AZ6byqgTlOSKnspRmX1m](https://sonarcloud.io/project/issues?open=AZ6byqgTlOSKnspRmX1m&id=bruksama_UTH_OOSD) |
| 056 | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/auth/Register.tsx:124` | 5min | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | [AZ6byqhZlOSKnspRmX1p](https://sonarcloud.io/project/issues?open=AZ6byqhZlOSKnspRmX1p&id=bruksama_UTH_OOSD) |
| 057 | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/student/MyGrades.tsx:448` | 5min | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | [AZ6byqgMlOSKnspRmX1b](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1b&id=bruksama_UTH_OOSD) |
| 058 | MINOR | CODE_SMELL | `typescript:S6582` | `frontend/src/components/charts/ChartComponents.tsx:64` | 5min | Prefer using an optional chain expression instead, as it's more concise and easier to read. | [AZ6byqkilOSKnspRmX2X](https://sonarcloud.io/project/issues?open=AZ6byqkilOSKnspRmX2X&id=bruksama_UTH_OOSD) |
| 059 | MINOR | CODE_SMELL | `typescript:S7758` | `frontend/src/components/CourseProposalModal.tsx:42` | 5min | Prefer `String#codePointAt()` over `String#charCodeAt()`. | [AZ6byqkalOSKnspRmX2O](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2O&id=bruksama_UTH_OOSD) |
| 060 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/components/CourseProposalModal.tsx:113` | 2min | Prefer `Number.parseInt` over `parseInt`. | [AZ6byqkalOSKnspRmX2Q](https://sonarcloud.io/project/issues?open=AZ6byqkalOSKnspRmX2Q&id=bruksama_UTH_OOSD) |
| 061 | MINOR | CODE_SMELL | `typescript:S6759` | `frontend/src/components/ProtectedRoute.tsx:10` | 5min | Mark the props of the component as read-only. | [AZ6byqk-lOSKnspRmX2m](https://sonarcloud.io/project/issues?open=AZ6byqk-lOSKnspRmX2m&id=bruksama_UTH_OOSD) |
| 062 | MINOR | CODE_SMELL | `typescript:S1128` | `frontend/src/contexts/AuthContext.tsx:10` | 1min | Remove this unused import of 'getFirebaseErrorMessage'. | [AZ6byqlGlOSKnspRmX2n](https://sonarcloud.io/project/issues?open=AZ6byqlGlOSKnspRmX2n&id=bruksama_UTH_OOSD) |
| 063 | MINOR | CODE_SMELL | `typescript:S7754` | `frontend/src/pages/admin/Courses.tsx:113` | 5min | Prefer `.some(…)` over `.find(…)`. | [AZ8ERWc0Resu2fFb_6RN](https://sonarcloud.io/project/issues?open=AZ8ERWc0Resu2fFb_6RN&id=bruksama_UTH_OOSD) |
| 064 | MINOR | CODE_SMELL | `typescript:S7754` | `frontend/src/pages/admin/Dashboard.tsx:300` | 5min | Prefer `.some(…)` over non-zero length check from `.filter(…)`. | [AZ6byqhhlOSKnspRmX1x](https://sonarcloud.io/project/issues?open=AZ6byqhhlOSKnspRmX1x&id=bruksama_UTH_OOSD) |
| 065 | MINOR | CODE_SMELL | `typescript:S6749` | `frontend/src/pages/admin/Students.tsx:386` | 5min | Passing a fragment to an HTML element is useless. | [AZ6byqhwlOSKnspRmX19](https://sonarcloud.io/project/issues?open=AZ6byqhwlOSKnspRmX19&id=bruksama_UTH_OOSD) |
| 066 | MINOR | CODE_SMELL | `typescript:S6353` | `frontend/src/pages/auth/Register.tsx:20` | 5min | Use concise character class syntax '\d' instead of '[0-9]'. | [AZ6byqhZlOSKnspRmX1n](https://sonarcloud.io/project/issues?open=AZ6byqhZlOSKnspRmX1n&id=bruksama_UTH_OOSD) |
| 067 | MINOR | CODE_SMELL | `typescript:S7776` | `frontend/src/pages/student/MyGrades.tsx:99` | 5min | `enrolledCourseCodes` should be a `Set`, and use `enrolledCourseCodes.has()` to check existence or non-existence. | [AZ6byqgMlOSKnspRmX1S](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1S&id=bruksama_UTH_OOSD) |
| 068 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:209` | 2min | Prefer `Number.parseFloat` over `parseFloat`. | [AZ6byqgMlOSKnspRmX1U](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1U&id=bruksama_UTH_OOSD) |
| 069 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:363` | 2min | Prefer `Number.parseFloat` over `parseFloat`. | [AZ6byqgMlOSKnspRmX1X](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1X&id=bruksama_UTH_OOSD) |
| 070 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:364` | 2min | Prefer `Number.isNaN` over `isNaN`. | [AZ6byqgMlOSKnspRmX1Y](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1Y&id=bruksama_UTH_OOSD) |
| 071 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:877` | 2min | Prefer `Number.parseFloat` over `parseFloat`. | [AZ6byqgMlOSKnspRmX1j](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1j&id=bruksama_UTH_OOSD) |
| 072 | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:878` | 2min | Prefer `Number.isNaN` over `isNaN`. | [AZ6byqgMlOSKnspRmX1k](https://sonarcloud.io/project/issues?open=AZ6byqgMlOSKnspRmX1k&id=bruksama_UTH_OOSD) |

## Security Hotspots

| Probability | Status | Rule | Location | Finding | Sonar |
|---|---|---|---|---|---|
| MEDIUM | TO_REVIEW | `typescript:S2245` | `frontend/src/components/StudentModal.tsx:20` | Make sure that using this pseudorandom number generator is safe here. | [AZ6byqk4lOSKnspRmX2d](https://sonarcloud.io/security_hotspots?id=bruksama_UTH_OOSD&hotspots=AZ6byqk4lOSKnspRmX2d) |

## Notes

- This inventory excludes resolved/closed historical issues because they do not need fixing.
- Sonar severity and remediation estimates are scanner guidance, not a substitute for product-impact review.
- Issue links require SonarCloud access if project visibility changes.

## Unresolved Questions

- Should `frontend/playwright-report/**` be excluded from future SonarCloud scans as generated output?
- Is the pseudorandom value in `frontend/src/components/StudentModal.tsx:20` only a UI identifier, or does it protect a security-sensitive boundary?
