---
report_type: sonarcloud-resolution-ledger
created_at: 2026-07-13T07:00:00+07:00
project_key: bruksama_UTH_OOSD
baseline_analysis: 2026-07-11T05:22:50Z
baseline_revision: 157ed1d0199d2959c36bfe9f085369528477417a
default_branch: main
analysis_method: automatic-analysis
---

# SonarCloud Resolution Ledger

## Baseline and analysis scope

- Baseline: 72 active issues and one security hotspot from the analysis at `2026-07-11T05:22:50Z`.
- Revision: `157ed1d0199d2959c36bfe9f085369528477417a` on `main`.
- Analysis ownership: SonarCloud Automatic Analysis is enabled (`sonar.autoscan.enabled=true`, `ciName=Autoscan`).
- Current exclusions before Phase 1: no project-level `sonar.exclusions` value.
- Authorized exclusion scope: Playwright reports/results, generated E2E screenshots, frontend coverage and compiled output, frontend `output`, backend compiled output, and JaCoCo reports.
- External setting status: applied and verified through the authenticated SonarCloud API by project administrator `Bruk` (`bruksama-NIZso@github`) at `2026-07-13T07:39:18+07:00`.
- Repository lifecycle: Playwright HTML reports, result metadata, traces, videos, failure screenshots, and generated E2E screenshots are untracked and ignored. `frontend/playwright.config.ts` remains unchanged so local reports stay producible.

## External setting audit

| Field | Before | After |
|---|---|---|
| Analysis method | Automatic Analysis enabled | Automatic Analysis enabled |
| `sonar.exclusions` | No project-level value | Eight project-level generated/compiled-output values |
| Actor | Not authenticated | `Bruk` (`bruksama-NIZso@github`) |
| Timestamp | Baseline observed 2026-07-13 | `2026-07-13T07:39:18+07:00` |

Persisted exclusion values:

- `frontend/playwright-report/**`
- `frontend/test-results/**`
- `frontend/e2e/screenshots/**`
- <code>frontend/cover&#97;ge/**</code>
- <code>frontend/di&#115;t/**</code>
- `frontend/output/**`
- <code>backend/tar&#103;et/**</code>
- `backend/jacoco-report/**`

## Issue ledger

| # | Issue key | Severity | Type | Rule | Location | Phase | Resolution status |
|---:|---|---|---|---|---|---:|---|
| 001 | `AZ6byqk4lOSKnspRmX2e` | CRITICAL | CODE_SMELL | `typescript:S3776` | `frontend/src/components/StudentModal.tsx:31` | 2 | closed-on-b2e7ae3 |
| 002 | `AZ6byqlTlOSKnspRmX2q` | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:29` | 2 | closed-on-b2e7ae3 |
| 003 | `AZ6byqlTlOSKnspRmX2r` | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:30` | 2 | closed-on-b2e7ae3 |
| 004 | `AZ6byqlTlOSKnspRmX2s` | CRITICAL | CODE_SMELL | `typescript:S6861` | `frontend/src/config/firebase.ts:31` | 2 | closed-on-b2e7ae3 |
| 005 | `AZ6byqlllOSKnspRmX2u` | MAJOR | BUG | `Web:S5254` | `frontend/playwright-report/index.html:4` | 1 | removed-from-final-analysis-b2e7ae3 |
| 006 | `AZ6byqlllOSKnspRmX2v` | MAJOR | BUG | `css:S4656` | `frontend/playwright-report/index.html:78` | 1 | removed-from-final-analysis-b2e7ae3 |
| 007 | `AZ6byqlllOSKnspRmX2w` | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1 | removed-from-final-analysis-b2e7ae3 |
| 008 | `AZ6byqlllOSKnspRmX2x` | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1 | removed-from-final-analysis-b2e7ae3 |
| 009 | `AZ6byqlllOSKnspRmX2y` | MAJOR | CODE_SMELL | `css:S4666` | `frontend/playwright-report/index.html:78` | 1 | removed-from-final-analysis-b2e7ae3 |
| 010 | `AZ6byqkilOSKnspRmX2Y` | MAJOR | CODE_SMELL | `typescript:S6479` | `frontend/src/components/charts/ChartComponents.tsx:69` | 4 | closed-on-b2e7ae3 |
| 011 | `AZ6byqkilOSKnspRmX2Z` | MAJOR | CODE_SMELL | `typescript:S6479` | `frontend/src/components/charts/ChartComponents.tsx:240` | 4 | closed-on-b2e7ae3 |
| 012 | `AZ6byqkalOSKnspRmX2R` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:146` | 3 | closed-on-b2e7ae3 |
| 013 | `AZ6byqkalOSKnspRmX2S` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:159` | 3 | closed-on-b2e7ae3 |
| 014 | `AZ6byqkalOSKnspRmX2U` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:200` | 3 | closed-on-b2e7ae3 |
| 015 | `AZ6byqkalOSKnspRmX2V` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:216` | 3 | closed-on-b2e7ae3 |
| 016 | `AZ6byqkalOSKnspRmX2W` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/CourseProposalModal.tsx:227` | 3 | closed-on-b2e7ae3 |
| 017 | `AZ6byqkwlOSKnspRmX2b` | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/components/Layout.tsx:103` | 3 | closed-on-b2e7ae3 |
| 018 | `AZ8ERWZzResu2fFb_6RM` | MAJOR | CODE_SMELL | `typescript:S8786` | `frontend/src/components/StudentModal.tsx:62` | 2 | closed-on-b2e7ae3 |
| 019 | `AZ6byqk4lOSKnspRmX2g` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/components/StudentModal.tsx:147` | 2 | closed-on-b2e7ae3 |
| 020 | `AZ6byqk4lOSKnspRmX2h` | MAJOR | CODE_SMELL | `typescript:S6772` | `frontend/src/components/StudentModal.tsx:187` | 2 | closed-on-b2e7ae3 |
| 021 | `AZ6byqk4lOSKnspRmX2i` | MAJOR | CODE_SMELL | `typescript:S6772` | `frontend/src/components/StudentModal.tsx:290` | 2 | closed-on-b2e7ae3 |
| 022 | `AZ6byqk4lOSKnspRmX2j` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:306` | 2 | closed-on-b2e7ae3 |
| 023 | `AZ6byqk4lOSKnspRmX2k` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:307` | 2 | closed-on-b2e7ae3 |
| 024 | `AZ6byqk4lOSKnspRmX2l` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/components/StudentModal.tsx:343` | 2 | closed-on-b2e7ae3 |
| 025 | `AZ6byqlGlOSKnspRmX2o` | MAJOR | CODE_SMELL | `typescript:S6481` | `frontend/src/contexts/AuthContext.tsx:223` | 2 | closed-on-b2e7ae3 |
| 026 | `AZ6byqholOSKnspRmX1y` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:144` | 4 | closed-on-b2e7ae3 |
| 027 | `AZ6byqholOSKnspRmX1z` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:144` | 4 | closed-on-b2e7ae3 |
| 028 | `AZ6byqholOSKnspRmX10` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:151` | 4 | closed-on-b2e7ae3 |
| 029 | `AZ6byqholOSKnspRmX11` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Alerts.tsx:152` | 4 | closed-on-b2e7ae3 |
| 030 | `AZ6byqh5lOSKnspRmX2A` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Courses.tsx:315` | 4 | closed-on-b2e7ae3 |
| 031 | `AZ6byqh5lOSKnspRmX2B` | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/pages/admin/Courses.tsx:431` | 3 | closed-on-b2e7ae3 |
| 032 | `AZ6byqh5lOSKnspRmX2D` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Courses.tsx:470` | 4 | closed-on-b2e7ae3 |
| 033 | `AZ6byqhhlOSKnspRmX1v` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Dashboard.tsx:259` | 4 | closed-on-b2e7ae3 |
| 034 | `AZ6byqhhlOSKnspRmX1w` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Dashboard.tsx:260` | 4 | closed-on-b2e7ae3 |
| 035 | `AZ6byqhwlOSKnspRmX14` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:259` | 4 | closed-on-b2e7ae3 |
| 036 | `AZ6byqhwlOSKnspRmX15` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:260` | 4 | closed-on-b2e7ae3 |
| 037 | `AZ6byqhwlOSKnspRmX17` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/admin/Students.tsx:326` | 4 | closed-on-b2e7ae3 |
| 038 | `AZ6byqgTlOSKnspRmX1l` | MAJOR | CODE_SMELL | `typescript:S6847` | `frontend/src/pages/auth/ForgotPassword.tsx:81` | 3 | closed-on-b2e7ae3 |
| 039 | `AZ6byqhZlOSKnspRmX1o` | MAJOR | CODE_SMELL | `typescript:S6847` | `frontend/src/pages/auth/Register.tsx:124` | 3 | closed-on-b2e7ae3 |
| 040 | `AZ6byqeQlOSKnspRmX1G` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyAlerts.tsx:69` | 4 | closed-on-b2e7ae3 |
| 041 | `AZ6byqeQlOSKnspRmX1H` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyAlerts.tsx:79` | 4 | closed-on-b2e7ae3 |
| 042 | `AZ6byqgMlOSKnspRmX1a` | MAJOR | CODE_SMELL | `typescript:S6848` | `frontend/src/pages/student/MyGrades.tsx:448` | 3 | closed-on-b2e7ae3 |
| 043 | `AZ6byqgMlOSKnspRmX1g` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/MyGrades.tsx:697` | 3 | closed-on-b2e7ae3 |
| 044 | `AZ6byqgMlOSKnspRmX1h` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/MyGrades.tsx:713` | 3 | closed-on-b2e7ae3 |
| 045 | `AZ6byqgMlOSKnspRmX1i` | MAJOR | CODE_SMELL | `typescript:S3358` | `frontend/src/pages/student/MyGrades.tsx:782` | 3 | closed-on-b2e7ae3 |
| 046 | `AZ6byqgBlOSKnspRmX1O` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:179` | 3 | closed-on-b2e7ae3 |
| 047 | `AZ6byqgBlOSKnspRmX1P` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:191` | 3 | closed-on-b2e7ae3 |
| 048 | `AZ6byqgBlOSKnspRmX1Q` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:203` | 3 | closed-on-b2e7ae3 |
| 049 | `AZ6byqgBlOSKnspRmX1R` | MAJOR | CODE_SMELL | `typescript:S6853` | `frontend/src/pages/student/StudentProfile.tsx:215` | 3 | closed-on-b2e7ae3 |
| 050 | `AZ6byqiAlOSKnspRmX2F` | MAJOR | CODE_SMELL | `typescript:S7746` | `frontend/src/services/api.ts:62` | 4 | closed-on-b2e7ae3 |
| 051 | `AZ6byqjWlOSKnspRmX2G` | MAJOR | CODE_SMELL | `typescript:S2933` | `frontend/src/services/mockAuth.ts:19` | 4 | closed-on-b2e7ae3 |
| 052 | `AZ6byqkSlOSKnspRmX2J` | MAJOR | CODE_SMELL | `typescript:S7760` | `frontend/src/utils/helpers.ts:151` | 4 | closed-on-b2e7ae3 |
| 053 | `AZ6byqkwlOSKnspRmX2c` | MINOR | BUG | `typescript:S1082` | `frontend/src/components/Layout.tsx:103` | 3 | closed-on-b2e7ae3 |
| 054 | `AZ6byqh5lOSKnspRmX2C` | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/admin/Courses.tsx:431` | 3 | closed-on-b2e7ae3 |
| 055 | `AZ6byqgTlOSKnspRmX1m` | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/auth/ForgotPassword.tsx:81` | 3 | closed-on-b2e7ae3 |
| 056 | `AZ6byqhZlOSKnspRmX1p` | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/auth/Register.tsx:124` | 3 | closed-on-b2e7ae3 |
| 057 | `AZ6byqgMlOSKnspRmX1b` | MINOR | BUG | `typescript:S1082` | `frontend/src/pages/student/MyGrades.tsx:448` | 3 | closed-on-b2e7ae3 |
| 058 | `AZ6byqkilOSKnspRmX2X` | MINOR | CODE_SMELL | `typescript:S6582` | `frontend/src/components/charts/ChartComponents.tsx:64` | 4 | closed-on-b2e7ae3 |
| 059 | `AZ6byqkalOSKnspRmX2O` | MINOR | CODE_SMELL | `typescript:S7758` | `frontend/src/components/CourseProposalModal.tsx:42` | 4 | closed-on-b2e7ae3 |
| 060 | `AZ6byqkalOSKnspRmX2Q` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/components/CourseProposalModal.tsx:113` | 4 | closed-on-b2e7ae3 |
| 061 | `AZ6byqk-lOSKnspRmX2m` | MINOR | CODE_SMELL | `typescript:S6759` | `frontend/src/components/ProtectedRoute.tsx:10` | 4 | closed-on-b2e7ae3 |
| 062 | `AZ6byqlGlOSKnspRmX2n` | MINOR | CODE_SMELL | `typescript:S1128` | `frontend/src/contexts/AuthContext.tsx:10` | 2 | closed-on-b2e7ae3 |
| 063 | `AZ8ERWc0Resu2fFb_6RN` | MINOR | CODE_SMELL | `typescript:S7754` | `frontend/src/pages/admin/Courses.tsx:113` | 4 | closed-on-b2e7ae3 |
| 064 | `AZ6byqhhlOSKnspRmX1x` | MINOR | CODE_SMELL | `typescript:S7754` | `frontend/src/pages/admin/Dashboard.tsx:300` | 4 | closed-on-b2e7ae3 |
| 065 | `AZ6byqhwlOSKnspRmX19` | MINOR | CODE_SMELL | `typescript:S6749` | `frontend/src/pages/admin/Students.tsx:386` | 4 | closed-on-b2e7ae3 |
| 066 | `AZ6byqhZlOSKnspRmX1n` | MINOR | CODE_SMELL | `typescript:S6353` | `frontend/src/pages/auth/Register.tsx:20` | 4 | closed-on-b2e7ae3 |
| 067 | `AZ6byqgMlOSKnspRmX1S` | MINOR | CODE_SMELL | `typescript:S7776` | `frontend/src/pages/student/MyGrades.tsx:99` | 3 | closed-on-b2e7ae3 |
| 068 | `AZ6byqgMlOSKnspRmX1U` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:209` | 3 | closed-on-b2e7ae3 |
| 069 | `AZ6byqgMlOSKnspRmX1X` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:363` | 3 | closed-on-b2e7ae3 |
| 070 | `AZ6byqgMlOSKnspRmX1Y` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:364` | 3 | closed-on-b2e7ae3 |
| 071 | `AZ6byqgMlOSKnspRmX1j` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:877` | 3 | closed-on-b2e7ae3 |
| 072 | `AZ6byqgMlOSKnspRmX1k` | MINOR | CODE_SMELL | `typescript:S7773` | `frontend/src/pages/student/MyGrades.tsx:878` | 3 | closed-on-b2e7ae3 |

## Security hotspot ledger

| Hotspot key | Probability | Rule | Location | Phase | Resolution status |
|---|---|---|---|---:|---|
| `AZ6byqk4lOSKnspRmX2d` | MEDIUM | `typescript:S2245` | `frontend/src/components/StudentModal.tsx:20` | 2 | reviewed-safe; public identifier threat model; no hotspot returned and security review rating A on final analysis |

## Coverage reconciliation

| Allocation | Count |
|---|---:|
| Phase 1 generated-artifact issues | 5 |
| Phase 2 source issues | 13 |
| Phase 3 source issues | 28 |
| Phase 4 source issues | 26 |
| Active issues total | 72 |
| Phase 2 security hotspots | 1 |
| Ledger rows total | 73 |

## Phase 5 local verification

- Timestamp: `2026-07-13 21:01:06 +07`.
- Focused and full Vitest: 17/17 files, 76/76 tests passed; zero unhandled errors.
- TypeScript and production bundle: passed.
- Credential-free Playwright: 3/3 selected scenarios passed.
- ESLint: known 64-file parser/configuration baseline remains; no lint success claimed.
- Codecept: environment-deferred because frontend/backend were stopped and runtime test credentials were absent; PostgreSQL was healthy.
- Fresh SonarCloud status: complete. Final analysis `2026-07-13T14:41:22Z` matches revision `b2e7ae35b6483f94f0b5a0dd33f73212847b30ea`.
- Key reconciliation: 72/72 baseline issue keys closed; zero new active issues.
- Final measures: 0 bugs, 0 vulnerabilities, 0 code smells, 0 security hotspots; reliability, security, and security-review ratings A; quality gate `OK`.
- Final evidence: [SonarCloud final verification report](./sonarcloud-final-verification-report.md).

## Unresolved Questions

None.
