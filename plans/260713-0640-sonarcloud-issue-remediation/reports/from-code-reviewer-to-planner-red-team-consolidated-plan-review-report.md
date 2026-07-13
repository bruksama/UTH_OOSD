---
report_type: red-team-plan-review
date: 2026-07-13
plan: 260713-0640-sonarcloud-issue-remediation
---

# Red Team Review — SonarCloud Issue Remediation

## Summary

- Findings: 14
- Accepted: 12
- Rejected: 2
- Severity: 1 Critical, 9 High, 4 Medium

## Findings

| # | Finding | Severity | Disposition | Applied To |
|---:|---|---|---|---|
| 1 | Configured Firebase errors fall into mock authentication | Critical | Accept | Phase 2 |
| 2 | Profile-bootstrap failures can revoke valid tokens | High | Accept | Phase 2 |
| 3 | Stale profile request can restore user after logout | High | Accept | Phase 2 |
| 4 | Parent submit adapter closes modal after failed save | High | Accept | Phase 2 |
| 5 | Tracked Playwright state survives ignore rules | Medium | Accept | Phase 1 |
| 6 | Sonar retry loop can reuse stale verification | High | Accept | Phase 5 |
| 7 | Predictable ID alone makes the hotspot unsafe | High | Reject | PRNG is not the authorization boundary; separate API authorization audit recorded. |
| 8 | Token rotation/injection boundary undefined | Medium | Accept | Phases 1 and 5 |
| 9 | External Sonar mutations lack audit evidence | High | Accept | Phases 1 and 5 |
| 10 | Strict backend-profile contract is unauthorized scope | High | Reject | Active Codecept plan already records successful `/auth/me` as accepted contract. |
| 11 | Mandatory Playwright gate performs live registration | High | Accept | Phases 3 and 5 |
| 12 | Unicode hash change breaks persisted course-code contract | High | Accept | Phase 4 |
| 13 | Chart-key fallback targets a nonexistent shared type | Medium | Accept | Phase 4 |
| 14 | `MyGrades` changes span phases without a testable seam | Medium | Accept | Phase 3 |

## Key Evidence

- Mock fallback after configured Firebase rejection: `frontend/src/services/auth.service.ts:59`, `frontend/src/services/auth.service.ts:97`.
- Profile/logout race: `frontend/src/contexts/AuthContext.tsx:91`, `frontend/src/contexts/AuthContext.tsx:195`.
- Modal closes after parent swallows save failure: `frontend/src/pages/admin/Students.tsx:89`, `frontend/src/components/StudentModal.tsx:73`.
- Tracked generated result: `frontend/test-results/.last-run.json:1`.
- Live registration dependency: `frontend/e2e/registration.spec.ts:21`.
- Persisted course code contract: `frontend/src/components/CourseProposalModal.tsx:38`, `backend/src/main/java/com/spts/entity/Course.java:26`.

## Whole-Plan Consistency Sweep

- Files reread: `plan.md` and all five phase files.
- Decision deltas checked: auth error matrix, async profile invalidation, generated-file inventory, MyGrades ownership, legacy hash compatibility, external-analysis audit, full retry gates, credential-free browser checks.
- Reconciled stale references: 12.
- Unresolved contradictions: 0.

## Unresolved Questions

None.
