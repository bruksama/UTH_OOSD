# SPTS REST API Documentation

> Student Performance Tracking System - API Reference

**Base URL**: `http://localhost:8080/api`

**Swagger UI**: `http://localhost:8080/swagger-ui.html`

**OpenAPI JSON**: `http://localhost:8080/api-docs`

---

## Table of Contents

- [Students API](#students-api)
- [Courses API](#courses-api)
- [Course Offerings API](#course-offerings-api)
- [Enrollments API](#enrollments-api)
- [Grade Entries API](#grade-entries-api)
- [Alerts API](#alerts-api)
- [Error Responses](#error-responses)

---

## Students API

Base path: `/api/students`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/{id}` | Get student by ID |
| GET | `/api/students/code/{studentCode}` | Get student by student code |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |
| GET | `/api/students/{id}/enrollments` | Get student enrollments |
| GET | `/api/students/at-risk` | Get at-risk students |
| GET | `/api/students/search?name={name}` | Search students by name |
| GET | `/api/students/gpa-below?threshold={value}` | Get students with GPA below threshold |
| POST | `/api/students/{id}/graduate` | Graduate student |
| POST | `/api/students/{id}/recalculate-gpa` | Recalculate student GPA |

### Request/Response Examples

#### Create Student
```http
POST /api/students
Content-Type: application/json

{
  "studentId": "STU001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "dateOfBirth": "2000-01-15",
  "enrollmentDate": "2023-09-01"
}
```

#### Response
```json
{
  "id": 1,
  "studentId": "STU001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "dateOfBirth": "2000-01-15",
  "enrollmentDate": "2023-09-01",
  "gpa": null,
  "totalCredits": 0,
  "status": "NORMAL"
}
```

---

## Courses API

Base path: `/api/courses`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/{id}` | Get course by ID |
| GET | `/api/courses/code/{code}` | Get course by course code |
| POST | `/api/courses` | Create new course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |
| GET | `/api/courses/{id}/offerings` | Get course offerings |
| GET | `/api/courses/search?name={name}` | Search courses by name |
| GET | `/api/courses/department/{department}` | Get courses by department |
| GET | `/api/courses/grading-type/{gradingType}` | Get courses by grading type |
| GET | `/api/courses/credits?minCredits={min}&maxCredits={max}` | Get courses by credit range |
| GET | `/api/courses/departments` | Get all departments |

### Request/Response Examples

#### Create Course
```http
POST /api/courses
Content-Type: application/json

{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Fundamentals of programming using Java",
  "credits": 3,
  "department": "Computer Science",
  "gradingType": "SCALE_10"
}
```

---

## Course Offerings API

Base path: `/api/offerings`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offerings` | Get all offerings |
| GET | `/api/offerings/{id}` | Get offering by ID |
| POST | `/api/offerings` | Create new offering |
| PUT | `/api/offerings/{id}` | Update offering |
| DELETE | `/api/offerings/{id}` | Delete offering |
| GET | `/api/offerings/{id}/enrollments` | Get offering enrollments |
| GET | `/api/offerings/semester?semester={sem}&year={year}` | Get offerings by semester and year |
| GET | `/api/offerings/year/{year}` | Get offerings by year |
| GET | `/api/offerings/instructor/{instructor}` | Get offerings by instructor |
| GET | `/api/offerings/available` | Get offerings with available seats |
| GET | `/api/offerings/current?semester={sem}&year={year}` | Get current offerings |
| GET | `/api/offerings/instructors` | Get all instructors |
| GET | `/api/offerings/{id}/seats` | Get available seats |

### Request/Response Examples

#### Create Course Offering
```http
POST /api/offerings
Content-Type: application/json

{
  "courseId": 1,
  "semester": "FALL",
  "academicYear": 2025,
  "instructor": "Dr. Smith",
  "maxEnrollment": 30,
  "gradingScale": "SCALE_10"
}
```

### Enum Values

**Semester**: `FALL`, `SPRING`, `SUMMER`

---

## Enrollments API

Base path: `/api/enrollments`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrollments` | Get all enrollments |
| GET | `/api/enrollments/{id}` | Get enrollment by ID |
| POST | `/api/enrollments` | Create new enrollment |
| PUT | `/api/enrollments/{id}` | Update enrollment |
| DELETE | `/api/enrollments/{id}` | Delete enrollment |
| POST | `/api/enrollments/{id}/complete?score={score}` | Complete enrollment with grade |
| POST | `/api/enrollments/{id}/complete-with-strategy?score={score}` | Complete using grading strategy |
| POST | `/api/enrollments/{id}/grade?score={score}` | Submit grade |
| POST | `/api/enrollments/{id}/withdraw` | Withdraw from enrollment |
| GET | `/api/enrollments/student/{studentId}` | Get enrollments by student |
| GET | `/api/enrollments/offering/{offeringId}` | Get enrollments by offering |
| GET | `/api/enrollments/status/{status}` | Get enrollments by status |
| GET | `/api/enrollments/student/{studentId}/in-progress` | Get in-progress enrollments |
| GET | `/api/enrollments/student/{studentId}/completed` | Get completed enrollments |
| GET | `/api/enrollments/check?studentId={id}&offeringId={id}` | Check if enrolled |

### Request/Response Examples

#### Create Enrollment
```http
POST /api/enrollments
Content-Type: application/json

{
  "studentId": 1,
  "courseOfferingId": 1
}
```

#### Complete Enrollment
```http
POST /api/enrollments/1/complete?score=8.5
```

### Enum Values

**EnrollmentStatus**: `IN_PROGRESS`, `COMPLETED`, `WITHDRAWN`

---

## Grade Entries API

Base path: `/api/grade-entries`

Implements **Composite Pattern** for hierarchical grade structure.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grade-entries` | Get all grade entries |
| GET | `/api/grade-entries/{id}` | Get grade entry by ID |
| POST | `/api/grade-entries` | Create new grade entry |
| PUT | `/api/grade-entries/{id}` | Update grade entry |
| DELETE | `/api/grade-entries/{id}` | Delete grade entry (cascades) |
| POST | `/api/grade-entries/{parentId}/children` | Add child grade entry |
| GET | `/api/grade-entries/{parentId}/children` | Get children of entry |
| GET | `/api/grade-entries/enrollment/{enrollmentId}/hierarchy` | Get full grade hierarchy |
| GET | `/api/grade-entries/enrollment/{enrollmentId}/roots` | Get root entries |
| GET | `/api/grade-entries/{id}/calculated-score` | Get calculated composite score |
| GET | `/api/grade-entries/{id}/weighted-score` | Get weighted score |
| GET | `/api/grade-entries/enrollment/{enrollmentId}/final-grade` | Calculate final grade |
| GET | `/api/grade-entries/enrollment/{enrollmentId}/validate-weights` | Validate weights sum to 1.0 |
| GET | `/api/grade-entries/enrollment/{enrollmentId}` | Get entries by enrollment |
| GET | `/api/grade-entries/student/{studentId}` | Get entries by student |
| GET | `/api/grade-entries/type/{entryType}` | Get entries by type |
| GET | `/api/grade-entries/enrollment/{enrollmentId}/leaves` | Get leaf entries |
| PATCH | `/api/grade-entries/{id}/score?score={score}&recordedBy={user}` | Update score |

### Request/Response Examples

#### Create Grade Entry (Root)
```http
POST /api/grade-entries
Content-Type: application/json

{
  "enrollmentId": 1,
  "name": "Midterm Exam",
  "weight": 0.3,
  "score": 8.0,
  "entryType": "MIDTERM",
  "recordedBy": "instructor"
}
```

#### Add Child Entry (Composite Pattern)
```http
POST /api/grade-entries/1/children
Content-Type: application/json

{
  "name": "Quiz 1",
  "weight": 0.5,
  "score": 9.0,
  "entryType": "QUIZ",
  "recordedBy": "instructor"
}
```

### Enum Values

**GradeEntryType**: `MIDTERM`, `FINAL`, `QUIZ`, `ASSIGNMENT`, `LAB`, `PROJECT`, `PARTICIPATION`, `COMPONENT`

---

## Alerts API

Base path: `/api/alerts`

Integrates with **Observer Pattern** for automatic alert generation.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/alerts/{id}` | Get alert by ID |
| POST | `/api/alerts` | Create new alert |
| PUT | `/api/alerts/{id}` | Update alert |
| DELETE | `/api/alerts/{id}` | Delete alert |
| PUT | `/api/alerts/{id}/read` | Mark alert as read |
| PUT | `/api/alerts/{id}/resolve?resolvedBy={user}` | Resolve alert |
| PUT | `/api/alerts/batch/read` | Mark multiple as read |
| PUT | `/api/alerts/batch/resolve?resolvedBy={user}` | Resolve multiple |
| PUT | `/api/alerts/student/{studentId}/read-all` | Mark all as read for student |
| GET | `/api/alerts/unread` | Get unread alerts |
| GET | `/api/alerts/unresolved` | Get unresolved alerts |
| GET | `/api/alerts/urgent` | Get urgent alerts (CRITICAL/HIGH) |
| GET | `/api/alerts/student/{studentId}` | Get alerts by student |
| GET | `/api/alerts/student/{studentId}/unread` | Get unread alerts for student |
| GET | `/api/alerts/level/{level}` | Get alerts by level |
| GET | `/api/alerts/type/{type}` | Get alerts by type |
| GET | `/api/alerts/student/{studentId}/count` | Count unread alerts |
| GET | `/api/alerts/student/{studentId}/summary` | Get alert summary |

### Request/Response Examples

#### Create Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "studentId": 1,
  "level": "WARNING",
  "type": "LOW_GPA",
  "message": "GPA has fallen below 2.0"
}
```

#### Resolve Alert
```http
PUT /api/alerts/1/resolve?resolvedBy=advisor
```

### Enum Values

**AlertLevel**: `INFO`, `WARNING`, `HIGH`, `CRITICAL`

**AlertType**: `LOW_GPA`, `GPA_DROP`, `PROBATION`, `STATUS_CHANGE`, `IMPROVEMENT`

---

## Error Responses

All errors follow a standard format:

```json
{
  "timestamp": "2025-01-17T16:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found with id: 999",
  "path": "/api/students/999"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Deletion successful |
| 400 | Bad Request - Validation error or business rule violation |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error - Server error |

### Validation Error Response

```json
{
  "timestamp": "2025-01-17T16:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input data",
  "path": "/api/students",
  "validationErrors": {
    "email": "must be a valid email address",
    "firstName": "must not be blank"
  }
}
```

---

## Authentication

Currently no authentication required. Future versions will implement JWT-based authentication.

---

## Design Pattern Integration

### Strategy Pattern (Grading)
- Use `POST /api/enrollments/{id}/complete-with-strategy` to use course's configured grading scale
- Grading strategies: `SCALE_10` (Vietnamese), `SCALE_4` (US GPA), `PASS_FAIL`

### Observer Pattern (Alerts)
- Alerts are automatically created when:
  - Student GPA falls below threshold
  - Student status changes
  - Significant GPA drop detected

### Composite Pattern (Grade Entries)
- Grade entries can have parent-child relationships
- Use `/api/grade-entries/{parentId}/children` to create hierarchical grades
- Use `/api/grade-entries/enrollment/{id}/hierarchy` to get the full tree

### State Pattern (Student Status)
- Student status automatically transitions based on GPA:
  - `NORMAL`: GPA >= 2.0
  - `AT_RISK`: 1.5 <= GPA < 2.0
  - `PROBATION`: GPA < 1.5
  - `GRADUATED`: Manually set via `/api/students/{id}/graduate`

---

*Last Updated: 2026-01-17*
