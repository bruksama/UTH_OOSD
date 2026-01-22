# Observer Pattern - Integration Smoke Test Plan

## Purpose
This document outlines manual/automated smoke tests to verify the Observer Pattern integration is working correctly.

## Test Environment
- Backend running on `localhost:8080`
- PostgreSQL database active
- All services initialized

---

## Test Cases

### TC-001: Grade Entry Triggers Observer Notification
**Objective:** Verify that creating a grade entry triggers the observer chain.

**Steps:**
1. Create a student via API: `POST /api/students`
2. Create a course offering via API
3. Enroll student in course: `POST /api/enrollments`
4. Create a grade entry: `POST /api/grade-entries`
5. Check logs for observer notifications

**Expected Results:**
- Log shows: "Notifying observers about grade change for student: {studentId}"
- Log shows: "Recalculating GPA for student: {studentId}"
- Log shows: "GPA recalculation completed for student: {studentId}"
- If GPA < 2.0: Log shows: "Checking risk status for student: {studentId}"

**Verification Command:**
```bash
# Watch backend logs for observer activity
tail -f backend/logs/application.log | grep -E "(Notifying|Recalculating|risk status)"
```

---

### TC-002: Low GPA Triggers Alert Creation
**Objective:** Verify that low GPA automatically creates an alert.

**Steps:**
1. Create a student
2. Enroll in course
3. Complete enrollment with low score (< 5.0 to get GPA < 2.0)
4. Query alerts for the student

**Expected Results:**
- Alert created with type `LOW_GPA` or `PROBATION`
- Alert level matches GPA threshold:
  - GPA < 1.5 → CRITICAL (PROBATION)
  - 1.5 <= GPA < 2.0 → WARNING (LOW_GPA)

**API Verification:**
```bash
curl http://localhost:8080/api/alerts?studentId={id}
```

---

### TC-003: Student Status Transition
**Objective:** Verify StudentStateManager correctly updates student status based on GPA.

**Steps:**
1. Create student (initial status: NORMAL)
2. Complete enrollment with score 4.0 (GPA ~1.0)
3. Verify student status changed to PROBATION

**Expected Results:**
- Student API returns `status: "PROBATION"`
- Log shows: "Student {id} transitioning from NORMAL to PROBATION"

**API Verification:**
```bash
curl http://localhost:8080/api/students/{id}
# Check status field
```

---

### TC-004: Observer Priority Order
**Objective:** Verify observers execute in correct priority order.

**Steps:**
1. Trigger a grade change
2. Observe logs

**Expected Results:**
- GpaRecalculatorObserver (priority 0) runs first
- RiskDetectorObserver (priority 10) runs second
- Logs appear in correct order

---

### TC-005: Enrollment Completion Triggers Observer
**Objective:** Verify completing an enrollment triggers observers.

**Steps:**
1. Create student and enroll in course
2. Complete enrollment via: `PUT /api/enrollments/{id}/complete`
3. Check logs and student GPA

**Expected Results:**
- Observer notification logged
- Student GPA updated
- If low GPA, alert created

---

## Quick Smoke Test Script

```bash
#!/bin/bash
# Quick smoke test for Observer Pattern

BASE_URL="http://localhost:8080/api"

# 1. Create student
STUDENT_RESP=$(curl -s -X POST "$BASE_URL/students" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"TEST001","firstName":"Test","lastName":"Student","email":"test@example.com"}')
STUDENT_ID=$(echo $STUDENT_RESP | jq -r '.id')
echo "Created student: $STUDENT_ID"

# 2. Get existing course offering (assuming ID 1 exists)
OFFERING_ID=1

# 3. Create enrollment
ENROLL_RESP=$(curl -s -X POST "$BASE_URL/enrollments" \
  -H "Content-Type: application/json" \
  -d "{\"studentId\":$STUDENT_ID,\"courseOfferingId\":$OFFERING_ID}")
ENROLL_ID=$(echo $ENROLL_RESP | jq -r '.id')
echo "Created enrollment: $ENROLL_ID"

# 4. Complete with low score
curl -s -X PUT "$BASE_URL/enrollments/$ENROLL_ID/complete?score=4.0"
echo "Completed enrollment with low score"

# 5. Check student status
echo "Checking student status:"
curl -s "$BASE_URL/students/$STUDENT_ID" | jq '.status, .gpa'

# 6. Check alerts
echo "Checking alerts:"
curl -s "$BASE_URL/alerts?studentId=$STUDENT_ID" | jq '.[].type'

echo "Smoke test complete!"
```

---

## Automated Test Execution

Run unit tests:
```bash
cd backend
mvn test -Dtest=StudentStateManagerTest
```

Run all tests:
```bash
cd backend
mvn test
```

---

*Created: 2026-01-22*
*Author: Member 3 (Behavioral Engineer)*
