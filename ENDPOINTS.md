# SPTS - API Endpoints Documentation

**Base URL**: `http://localhost:8081/api`

---

## 📚 Table of Contents
- [Students](#students)
- [Courses](#courses)
- [Course Offerings](#course-offerings)
- [Enrollments](#enrollments)
- [Grade Entries](#grade-entries)
- [Alerts](#alerts)
- [Authentication](#authentication)
- [Statistics](#statistics)

---

## Students

### Get All Students
- **GET** `/api/students`
- Description: Retrieves a list of all students in the system
- Response: `200 OK` - List of StudentDTO

### Create New Student
- **POST** `/api/students`
- Description: Creates a new student record
- Response: `201 Created` - StudentDTO

### Get Student by ID
- **GET** `/api/students/{id}`
- Description: Retrieves a student by their database ID
- Parameters: `id` (path, required) - Student database ID
- Response: `200 OK` - StudentDTO

### Update Student
- **PUT** `/api/students/{id}`
- Description: Updates an existing student record
- Parameters: `id` (path, required) - Student database ID
- Response: `200 OK` - StudentDTO

### Delete Student
- **DELETE** `/api/students/{id}`
- Description: Deletes a student record
- Parameters: `id` (path, required) - Student database ID
- Response: `204 No Content`

### Get Student by Student Code
- **GET** `/api/students/code/{studentCode}`
- Description: Retrieves a student by their student code (e.g., STU001)
- Parameters: `studentCode` (path, required)
- Response: `200 OK` - StudentDTO

### Search Students by Name
- **GET** `/api/students/search`
- Description: Searches students by first or last name
- Parameters: `name` (query, required) - Name to search for
- Response: `200 OK` - List of StudentDTO

### Get At-Risk Students
- **GET** `/api/students/at-risk`
- Description: Retrieves students with AT_RISK or PROBATION status
- Response: `200 OK` - List of StudentDTO

### Get Students with GPA Below Threshold
- **GET** `/api/students/gpa-below`
- Description: Retrieves students with GPA below the specified value
- Parameters: `threshold` (query, required) - GPA threshold
- Response: `200 OK` - List of StudentDTO

### Get Student Enrollments
- **GET** `/api/students/{id}/enrollments`
- Description: Retrieves all enrollments for a student
- Parameters: `id` (path, required) - Student database ID
- Response: `200 OK` - List of EnrollmentDTO

### Recalculate Student GPA
- **POST** `/api/students/{id}/recalculate-gpa`
- Description: Recalculates and updates the student's GPA from completed enrollments
- Parameters: `id` (path, required) - Student database ID
- Response: `200 OK`

### Recalculate GPA for All Students
- **POST** `/api/students/recalculate-all-gpa`
- Description: Recalculates and updates GPA for all students in the system
- Response: `200 OK`

### Graduate Student
- **POST** `/api/students/{id}/graduate`
- Description: Marks a student as graduated if requirements are met
- Parameters: `id` (path, required) - Student database ID
- Response: `200 OK`

---

## Courses

### Get All Courses
- **GET** `/api/courses`
- Description: Retrieves a list of all courses in the system
- Response: `200 OK` - List of CourseDTO

### Create New Course
- **POST** `/api/courses`
- Description: Creates a new course record
- Response: `201 Created` - CourseDTO

### Get Course by ID
- **GET** `/api/courses/{id}`
- Description: Retrieves a course by its database ID
- Parameters: `id` (path, required) - Course database ID
- Response: `200 OK` - CourseDTO

### Update Course
- **PUT** `/api/courses/{id}`
- Description: Updates an existing course record
- Parameters: `id` (path, required) - Course database ID
- Response: `200 OK` - CourseDTO

### Delete Course
- **DELETE** `/api/courses/{id}`
- Description: Deletes a course record (fails if course has offerings)
- Parameters: `id` (path, required) - Course database ID
- Response: `204 No Content`

### Get Course by Course Code
- **GET** `/api/courses/code/{code}`
- Description: Retrieves a course by its course code (e.g., CS101)
- Parameters: `code` (path, required) - Course code
- Response: `200 OK` - CourseDTO

### Search Courses by Name
- **GET** `/api/courses/search`
- Description: Searches courses by name (case-insensitive partial match)
- Parameters: `name` (query, required) - Name to search for
- Response: `200 OK` - List of CourseDTO

### Get Courses by Grading Type
- **GET** `/api/courses/grading-type/{gradingType}`
- Description: Retrieves courses using a specific grading type
- Parameters: `gradingType` (path, required) - Enum: SCALE_10, SCALE_4, PASS_FAIL
- Response: `200 OK` - List of CourseDTO

### Get All Departments
- **GET** `/api/courses/departments`
- Description: Retrieves a list of all distinct department names
- Response: `200 OK` - List of department names

### Get Courses by Department
- **GET** `/api/courses/department/{department}`
- Description: Retrieves all courses in a department
- Parameters: `department` (path, required) - Department name
- Response: `200 OK` - List of CourseDTO

### Get Courses by Credit Range
- **GET** `/api/courses/credits`
- Description: Retrieves courses within a credit range
- Parameters: 
  - `minCredits` (query, required) - Minimum credits
  - `maxCredits` (query, required) - Maximum credits
- Response: `200 OK` - List of CourseDTO

### Get Course Offerings
- **GET** `/api/courses/{id}/offerings`
- Description: Retrieves all offerings for a course (Abstraction-Occurrence pattern)
- Parameters: `id` (path, required) - Course database ID
- Response: `200 OK` - List of CourseOfferingDTO

### Approve Course Proposal
- **POST** `/api/courses/{id}/approve`
- Description: Approves a student-submitted course proposal
- Parameters: `id` (path, required)
- Response: `200 OK` - CourseDTO

### Reject Course Proposal
- **POST** `/api/courses/{id}/reject`
- Description: Rejects a student-submitted course proposal
- Parameters: `id` (path, required)
- Response: `200 OK` - CourseDTO

---

## Course Offerings

### Get All Offerings
- **GET** `/api/offerings`
- Description: Retrieves a list of course offerings (filtered by user if provided)
- Parameters: 
  - `email` (query, optional)
  - `role` (query, optional) - Default: "student"
- Response: `200 OK` - List of CourseOfferingDTO

### Create New Offering
- **POST** `/api/offerings`
- Description: Creates a new course offering
- Response: `201 Created` - CourseOfferingDTO

### Get Offering by ID
- **GET** `/api/offerings/{id}`
- Description: Retrieves a course offering by its database ID
- Parameters: `id` (path, required) - Offering database ID
- Response: `200 OK` - CourseOfferingDTO

### Update Offering
- **PUT** `/api/offerings/{id}`
- Description: Updates an existing course offering
- Parameters: `id` (path, required) - Offering database ID
- Response: `200 OK` - CourseOfferingDTO

### Delete Offering
- **DELETE** `/api/offerings/{id}`
- Description: Deletes a course offering (fails if offering has enrollments)
- Parameters: `id` (path, required) - Offering database ID
- Response: `204 No Content`

### Get Available Seats
- **GET** `/api/offerings/{id}/seats`
- Description: Gets the number of available seats in an offering
- Parameters: `id` (path, required) - Offering database ID
- Response: `200 OK` - Integer

### Get Offering Enrollments
- **GET** `/api/offerings/{id}/enrollments`
- Description: Retrieves all enrollments for a course offering
- Parameters: `id` (path, required) - Offering database ID
- Response: `200 OK` - List of EnrollmentDTO

### Get Offerings by Year
- **GET** `/api/offerings/year/{year}`
- Description: Retrieves all offerings for an academic year
- Parameters: `year` (path, required) - Academic year
- Response: `200 OK` - List of CourseOfferingDTO

### Get Offerings by Semester and Year
- **GET** `/api/offerings/semester`
- Description: Retrieves offerings for a specific semester and academic year
- Parameters:
  - `semester` (query, required) - Enum: SPRING, SUMMER, FALL, WINTER
  - `year` (query, required) - Academic year
- Response: `200 OK` - List of CourseOfferingDTO

### Get All Instructors
- **GET** `/api/offerings/instructors`
- Description: Retrieves a list of all distinct instructor names
- Response: `200 OK` - List of instructor names

### Get Offerings by Instructor
- **GET** `/api/offerings/instructor/{instructor}`
- Description: Retrieves offerings taught by a specific instructor
- Parameters: `instructor` (path, required) - Instructor name
- Response: `200 OK` - List of CourseOfferingDTO

### Get Current Offerings
- **GET** `/api/offerings/current`
- Description: Retrieves offerings for the current semester
- Parameters:
  - `semester` (query, required) - Current semester
  - `year` (query, required) - Current year
- Response: `200 OK` - List of CourseOfferingDTO

### Get Offerings with Available Seats
- **GET** `/api/offerings/available`
- Description: Retrieves offerings that have open seats for enrollment
- Response: `200 OK` - List of CourseOfferingDTO

---

## Enrollments

### Get All Enrollments
- **GET** `/api/enrollments`
- Description: Retrieves a list of all enrollments
- Response: `200 OK` - List of EnrollmentDTO

### Create New Enrollment
- **POST** `/api/enrollments`
- Description: Enrolls a student in a course offering
- Response: `201 Created` - EnrollmentDTO

### Get Enrollment by ID
- **GET** `/api/enrollments/{id}`
- Description: Retrieves an enrollment by its database ID
- Parameters: `id` (path, required) - Enrollment database ID
- Response: `200 OK` - EnrollmentDTO

### Update Enrollment
- **PUT** `/api/enrollments/{id}`
- Description: Updates an existing enrollment (status and grades)
- Parameters: `id` (path, required) - Enrollment database ID
- Response: `200 OK` - EnrollmentDTO

### Delete Enrollment
- **DELETE** `/api/enrollments/{id}`
- Description: Deletes an enrollment record
- Parameters: `id` (path, required) - Enrollment database ID
- Response: `204 No Content`

### Get Enrollments by Student
- **GET** `/api/enrollments/student/{studentId}`
- Description: Retrieves all enrollments for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of EnrollmentDTO

### Get In-Progress Enrollments
- **GET** `/api/enrollments/student/{studentId}/in-progress`
- Description: Retrieves in-progress enrollments for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of EnrollmentDTO

### Get Completed Enrollments
- **GET** `/api/enrollments/student/{studentId}/completed`
- Description: Retrieves completed enrollments for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of EnrollmentDTO

### Get Enrollments by Status
- **GET** `/api/enrollments/status/{status}`
- Description: Retrieves enrollments with a specific status
- Parameters: `status` (path, required) - Enum: IN_PROGRESS, COMPLETED, WITHDRAWN
- Response: `200 OK` - List of EnrollmentDTO

### Get Enrollments by Offering
- **GET** `/api/enrollments/offering/{offeringId}`
- Description: Retrieves all enrollments for a course offering
- Parameters: `offeringId` (path, required) - Course offering database ID
- Response: `200 OK` - List of EnrollmentDTO

### Check if Student is Enrolled
- **GET** `/api/enrollments/check`
- Description: Checks if a student is enrolled in a specific course offering
- Parameters:
  - `studentId` (query, required) - Student database ID
  - `offeringId` (query, required) - Course offering database ID
- Response: `200 OK` - Boolean

### Withdraw from Enrollment
- **POST** `/api/enrollments/{id}/withdraw`
- Description: Withdraws a student from an enrollment
- Parameters: `id` (path, required) - Enrollment database ID
- Response: `200 OK` - EnrollmentDTO

### Submit Grade
- **POST** `/api/enrollments/{id}/grade`
- Description: Submits or updates a grade without changing enrollment status
- Parameters:
  - `id` (path, required) - Enrollment database ID
  - `score` (query, required) - Score (0-10 scale)
- Response: `200 OK` - EnrollmentDTO

### Complete Enrollment with Grade
- **POST** `/api/enrollments/{id}/complete`
- Description: Completes an enrollment with final score, auto-calculates letter grade and GPA
- Parameters:
  - `id` (path, required) - Enrollment database ID
  - `score` (query, required) - Final score (0-10 scale)
- Response: `200 OK` - EnrollmentDTO

### Complete Enrollment Using Grading Strategy
- **POST** `/api/enrollments/{id}/complete-with-strategy`
- Description: Completes an enrollment using the course's configured grading strategy
- Parameters:
  - `id` (path, required) - Enrollment database ID
  - `score` (query, required) - Final score (0-10 scale)
- Response: `200 OK` - EnrollmentDTO

---

## Grade Entries

### Get All Grade Entries
- **GET** `/api/grade-entries`
- Description: Retrieves a list of all grade entries
- Response: `200 OK` - List of GradeEntryDTO

### Create New Grade Entry
- **POST** `/api/grade-entries`
- Description: Creates a new grade entry for an enrollment
- Response: `201 Created` - GradeEntryDTO

### Get Grade Entry by ID
- **GET** `/api/grade-entries/{id}`
- Description: Retrieves a grade entry by its database ID
- Parameters: `id` (path, required) - Grade entry database ID
- Response: `200 OK` - GradeEntryDTO

### Update Grade Entry
- **PUT** `/api/grade-entries/{id}`
- Description: Updates an existing grade entry
- Parameters: `id` (path, required) - Grade entry database ID
- Response: `200 OK` - GradeEntryDTO

### Delete Grade Entry
- **DELETE** `/api/grade-entries/{id}`
- Description: Deletes a grade entry (cascades to children)
- Parameters: `id` (path, required) - Grade entry database ID
- Response: `204 No Content`

### Update Score Only
- **PATCH** `/api/grade-entries/{id}/score`
- Description: Updates just the score of a grade entry
- Parameters:
  - `id` (path, required) - Grade entry database ID
  - `score` (query, required) - New score (0-10 scale)
  - `recordedBy` (query, optional) - Username of recorder
- Response: `200 OK` - GradeEntryDTO

### Get Children of Grade Entry
- **GET** `/api/grade-entries/{parentId}/children`
- Description: Retrieves all children of a grade entry
- Parameters: `parentId` (path, required) - Parent grade entry ID
- Response: `200 OK` - List of GradeEntryDTO

### Add Child Grade Entry
- **POST** `/api/grade-entries/{parentId}/children`
- Description: Adds a child grade entry to a parent (Composite Pattern)
- Parameters: `parentId` (path, required) - Parent grade entry ID
- Response: `201 Created` - GradeEntryDTO

### Get Weighted Score
- **GET** `/api/grade-entries/{id}/weighted-score`
- Description: Calculates weighted score (score * weight)
- Parameters: `id` (path, required) - Grade entry database ID
- Response: `200 OK` - Double

### Get Calculated Score
- **GET** `/api/grade-entries/{id}/calculated-score`
- Description: Calculates composite score (recursively from children if composite)
- Parameters: `id` (path, required) - Grade entry database ID
- Response: `200 OK` - Double

### Get Entries by Type
- **GET** `/api/grade-entries/type/{entryType}`
- Description: Retrieves grade entries of a specific type
- Parameters: `entryType` (path, required) - Enum: COMPONENT, FINAL
- Response: `200 OK` - List of GradeEntryDTO

### Get Entries by Student
- **GET** `/api/grade-entries/student/{studentId}`
- Description: Retrieves all grade entries for a student across all enrollments
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of GradeEntryDTO

### Get Entries by Enrollment
- **GET** `/api/grade-entries/enrollment/{enrollmentId}`
- Description: Retrieves all grade entries for an enrollment
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - List of GradeEntryDTO

### Validate Weights
- **GET** `/api/grade-entries/enrollment/{enrollmentId}/validate-weights`
- Description: Validates that root entry weights sum to 1.0
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - Boolean

### Get Root Entries
- **GET** `/api/grade-entries/enrollment/{enrollmentId}/roots`
- Description: Retrieves root-level grade entries for an enrollment
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - List of GradeEntryDTO

### Get Leaf Entries
- **GET** `/api/grade-entries/enrollment/{enrollmentId}/leaves`
- Description: Retrieves leaf-level entries (entries without children)
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - List of GradeEntryDTO

### Get Grade Hierarchy
- **GET** `/api/grade-entries/enrollment/{enrollmentId}/hierarchy`
- Description: Retrieves the full grade hierarchy for an enrollment (root entries with nested children)
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - List of GradeEntryDTO

### Calculate Final Grade
- **GET** `/api/grade-entries/enrollment/{enrollmentId}/final-grade`
- Description: Calculates the final grade from all root components
- Parameters: `enrollmentId` (path, required) - Enrollment database ID
- Response: `200 OK` - Double

---

## Alerts

### Get All Alerts
- **GET** `/api/alerts`
- Description: Retrieves a list of all alerts
- Response: `200 OK` - List of AlertDTO

### Create New Alert
- **POST** `/api/alerts`
- Description: Creates a new alert for a student
- Response: `201 Created` - AlertDTO

### Get Alert by ID
- **GET** `/api/alerts/{id}`
- Description: Retrieves an alert by its database ID
- Parameters: `id` (path, required) - Alert database ID
- Response: `200 OK` - AlertDTO

### Update Alert
- **PUT** `/api/alerts/{id}`
- Description: Updates an existing alert
- Parameters: `id` (path, required) - Alert database ID
- Response: `200 OK` - AlertDTO

### Delete Alert
- **DELETE** `/api/alerts/{id}`
- Description: Deletes an alert record
- Parameters: `id` (path, required) - Alert database ID
- Response: `204 No Content`

### Get Urgent Alerts
- **GET** `/api/alerts/urgent`
- Description: Retrieves CRITICAL and HIGH level unresolved alerts
- Response: `200 OK` - List of AlertDTO

### Get Unresolved Alerts
- **GET** `/api/alerts/unresolved`
- Description: Retrieves all unresolved alerts
- Response: `200 OK` - List of AlertDTO

### Get Unread Alerts
- **GET** `/api/alerts/unread`
- Description: Retrieves all unread alerts
- Response: `200 OK` - List of AlertDTO

### Get Alerts by Type
- **GET** `/api/alerts/type/{type}`
- Description: Retrieves alerts of a specific type
- Parameters: `type` (path, required) - Enum: LOW_GPA, GPA_DROP, STATUS_CHANGE, PROBATION, IMPROVEMENT
- Response: `200 OK` - List of AlertDTO

### Get Alerts by Level
- **GET** `/api/alerts/level/{level}`
- Description: Retrieves alerts of a specific severity level
- Parameters: `level` (path, required) - Enum: INFO, WARNING, HIGH, CRITICAL
- Response: `200 OK` - List of AlertDTO

### Get Alerts by Student
- **GET** `/api/alerts/student/{studentId}`
- Description: Retrieves all alerts for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of AlertDTO

### Get Unread Alerts for Student
- **GET** `/api/alerts/student/{studentId}/unread`
- Description: Retrieves unread alerts for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - List of AlertDTO

### Get Alert Summary
- **GET** `/api/alerts/student/{studentId}/summary`
- Description: Gets alert statistics for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - AlertSummary

### Count Unread Alerts
- **GET** `/api/alerts/student/{studentId}/count`
- Description: Counts unread alerts for a student
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK` - Integer (int64)

### Mark Alert as Resolved
- **PUT** `/api/alerts/{id}/resolve`
- Description: Marks an alert as resolved
- Parameters:
  - `id` (path, required) - Alert database ID
  - `resolvedBy` (query, required) - Username of resolver
- Response: `200 OK` - AlertDTO

### Mark Alert as Read
- **PUT** `/api/alerts/{id}/read`
- Description: Marks an alert as read
- Parameters: `id` (path, required) - Alert database ID
- Response: `200 OK` - AlertDTO

### Mark All Alerts as Read for Student
- **PUT** `/api/alerts/student/{studentId}/read-all`
- Description: Marks all unread alerts for a student as read
- Parameters: `studentId` (path, required) - Student database ID
- Response: `200 OK`

### Mark Multiple Alerts as Resolved
- **PUT** `/api/alerts/batch/resolve`
- Description: Marks multiple alerts as resolved in batch
- Parameters: `resolvedBy` (query, required) - Username of resolver
- Response: `200 OK` - Integer (int32)

### Mark Multiple Alerts as Read
- **PUT** `/api/alerts/batch/read`
- Description: Marks multiple alerts as read in batch
- Response: `200 OK` - Integer (int32)

---

## Authentication

### Get Current User
- **GET** `/api/auth/me`
- Description: Returns the authenticated user's profile with role and studentId
- Security: Bearer Token required
- Response: `200 OK` - AuthUserDTO

### Logout Current User
- **POST** `/api/auth/logout`
- Description: Revokes the current token so subsequent requests with the same token return `401`
- Security: Bearer Token required
- Response: `204 No Content`

### Auth Service Health Check
- **GET** `/api/auth/health`
- Description: Auth service health check
- Response: `200 OK`

---

## Statistics

### Get Top Courses
- **GET** `/api/statistics/top-courses`
- Description: Get top courses by enrollment
- Parameters: `limit` (query, optional) - Default: 10
- Response: `200 OK` - List of CourseEnrollmentStats

### Get Enrollment Trends
- **GET** `/api/statistics/enrollment-trends`
- Description: Get enrollment trends over time
- Response: `200 OK` - List of EnrollmentTrend

### Get Department Statistics
- **GET** `/api/statistics/departments`
- Description: Get statistics by department
- Response: `200 OK` - List of DepartmentStats

### Get Dashboard Statistics
- **GET** `/api/statistics/dashboard`
- Description: Get overall admin dashboard statistics
- Response: `200 OK` - AdminDashboardStats

### Get Credit Distribution
- **GET** `/api/statistics/credit-distribution`
- Description: Get distribution of credits across courses
- Response: `200 OK` - List of CreditDistribution

---

## 📝 API Schema Information

### Request/Response Status Codes
- **200 OK** - Successful GET/PUT/PATCH
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate or conflicting data

### Content Type
- All endpoints use `application/json`

### Authentication
- Endpoints marked with security require Bearer Token in Authorization header
- Format: `Authorization: Bearer <token>`

---

**Updated**: May 26, 2026  
**API Version**: 1.0.0  
**Server**: Spring Boot 3.2.5
