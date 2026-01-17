# MEMBER1 - Foundation Architect

## ROLE
Foundation Architect - REST API Layer, Exception Handling, Data Initialization

## CURRENT STATE
- [x] Entity layer COMPLETE (6 entities + enums)
- [x] Repository layer COMPLETE (6 repositories)
- [x] DTO layer COMPLETE (6 DTOs)
- [x] Service layer COMPLETE (6 services)
- [x] Strategy Pattern integrated (gradingScale field added)
- [x] Exception handling COMPLETE (5 classes)
- [ ] Controller layer NOT STARTED
- [ ] DataInitializer NOT STARTED

---

## TASK 1: Exception Handling Infrastructure
Priority: CRITICAL - Must complete before controllers

### Files to Create

#### 1.1 exception/ResourceNotFoundException.java
Location: backend/src/main/java/com/spts/exception/

```java
package com.spts.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    // Getters
    public String getResourceName() { return resourceName; }
    public String getFieldName() { return fieldName; }
    public Object getFieldValue() { return fieldValue; }
}
```

#### 1.2 exception/DuplicateResourceException.java
Location: backend/src/main/java/com/spts/exception/

```java
package com.spts.exception;

public class DuplicateResourceException extends RuntimeException {
    
    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    // Getters
    public String getResourceName() { return resourceName; }
    public String getFieldName() { return fieldName; }
    public Object getFieldValue() { return fieldValue; }
}
```

#### 1.3 exception/BusinessRuleException.java
Location: backend/src/main/java/com/spts/exception/

```java
package com.spts.exception;

public class BusinessRuleException extends RuntimeException {
    
    public BusinessRuleException(String message) {
        super(message);
    }
}
```

#### 1.4 exception/ErrorResponse.java
Location: backend/src/main/java/com/spts/exception/

```java
package com.spts.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;

    public ErrorResponse(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Getters and setters for all fields
    // ... (standard getters/setters)
}
```

#### 1.5 exception/GlobalExceptionHandler.java
Location: backend/src/main/java/com/spts/exception/

```java
package com.spts.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(
            BusinessRuleException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> 
            errors.put(err.getField(), err.getDefaultMessage())
        );
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "Invalid input data",
            request.getDescription(false).replace("uri=", "")
        );
        error.setValidationErrors(errors);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### Verification
```bash
cd backend && mvn compile -q
```

---

## TASK 2: Controller Layer
Priority: HIGH - After exception handling

### Controller Pattern
All controllers follow this structure:
- @RestController annotation
- @RequestMapping for base path
- Constructor injection for service
- @Valid on request bodies
- @Operation annotations for Swagger

### 2.1 controller/StudentController.java

```java
package com.spts.controller;

import com.spts.dto.StudentDTO;
import com.spts.dto.EnrollmentDTO;
import com.spts.entity.StudentStatus;
import com.spts.service.StudentService;
import com.spts.service.EnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student management APIs")
public class StudentController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;

    public StudentController(StudentService studentService, EnrollmentService enrollmentService) {
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    @Operation(summary = "Get all students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/code/{studentCode}")
    @Operation(summary = "Get student by student code")
    public ResponseEntity<StudentDTO> getByStudentCode(@PathVariable String studentCode) {
        return ResponseEntity.ok(studentService.getStudentByStudentId(studentCode));
    }

    @PostMapping
    @Operation(summary = "Create new student")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO dto) {
        return new ResponseEntity<>(studentService.createStudent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update student")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/enrollments")
    @Operation(summary = "Get student enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getStudentEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(id));
    }

    @GetMapping("/at-risk")
    @Operation(summary = "Get at-risk students")
    public ResponseEntity<List<StudentDTO>> getAtRiskStudents() {
        return ResponseEntity.ok(studentService.getAtRiskStudents());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get students by status")
    public ResponseEntity<List<StudentDTO>> getByStatus(@PathVariable StudentStatus status) {
        return ResponseEntity.ok(studentService.getStudentsByStatus(status));
    }
}
```

### 2.2 controller/CourseController.java
Endpoints:
- GET /api/courses - getAllCourses()
- GET /api/courses/{id} - getCourseById(Long id)
- GET /api/courses/code/{code} - getByCourseCode(String code)
- POST /api/courses - createCourse(@Valid CourseDTO)
- PUT /api/courses/{id} - updateCourse(Long id, @Valid CourseDTO)
- DELETE /api/courses/{id} - deleteCourse(Long id)

### 2.3 controller/CourseOfferingController.java
Endpoints:
- GET /api/offerings - getAllOfferings()
- GET /api/offerings/{id} - getOfferingById(Long id)
- POST /api/offerings - createOffering(@Valid CourseOfferingDTO)
- PUT /api/offerings/{id} - updateOffering(Long id, @Valid CourseOfferingDTO)
- DELETE /api/offerings/{id} - deleteOffering(Long id)
- GET /api/offerings/{id}/enrollments - getOfferingEnrollments(Long id)

### 2.4 controller/EnrollmentController.java
Endpoints:
- GET /api/enrollments - getAllEnrollments()
- GET /api/enrollments/{id} - getEnrollmentById(Long id)
- POST /api/enrollments - createEnrollment(@Valid EnrollmentDTO)
- DELETE /api/enrollments/{id} - deleteEnrollment(Long id)
- POST /api/enrollments/{id}/complete - completeEnrollment(Long id, @RequestParam Double score)
- POST /api/enrollments/{id}/withdraw - withdrawEnrollment(Long id)
- GET /api/enrollments/student/{studentId} - getByStudent(Long studentId)

### 2.5 controller/GradeEntryController.java
Endpoints:
- GET /api/grade-entries - getAllGradeEntries()
- GET /api/grade-entries/{id} - getGradeEntryById(Long id)
- POST /api/grade-entries - createGradeEntry(@Valid GradeEntryDTO)
- PUT /api/grade-entries/{id} - updateGradeEntry(Long id, @Valid GradeEntryDTO)
- DELETE /api/grade-entries/{id} - deleteGradeEntry(Long id)
- GET /api/grade-entries/enrollment/{enrollmentId} - getByEnrollment(Long enrollmentId)
- GET /api/grade-entries/enrollment/{enrollmentId}/hierarchy - getHierarchy(Long enrollmentId)

### 2.6 controller/AlertController.java
Endpoints:
- GET /api/alerts - getAllAlerts()
- GET /api/alerts/{id} - getAlertById(Long id)
- GET /api/alerts/unread - getUnreadAlerts()
- GET /api/alerts/student/{studentId} - getByStudent(Long studentId)
- PUT /api/alerts/{id}/read - markAsRead(Long id)
- PUT /api/alerts/{id}/resolve - resolveAlert(Long id, @RequestParam String resolvedBy)

### Verification
```bash
cd backend && mvn compile -q
cd backend && mvn spring-boot:run
# Check http://localhost:8080/swagger-ui.html
```

---

## TASK 3: DataInitializer
Priority: MEDIUM - After controllers work

### 3.1 config/DataInitializer.java
Location: backend/src/main/java/com/spts/config/

```java
package com.spts.config;

import com.spts.entity.*;
import com.spts.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final CourseOfferingRepository offeringRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GradeEntryRepository gradeEntryRepository;
    private final AlertRepository alertRepository;

    // Constructor injection for all repositories

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            return; // Already seeded
        }

        // Create students
        Student s1 = createStudent("STU001", "Nguyen", "Van A", 3.5, StudentStatus.NORMAL);
        Student s2 = createStudent("STU002", "Tran", "Thi B", 2.8, StudentStatus.NORMAL);
        Student s3 = createStudent("STU003", "Le", "Van C", 1.8, StudentStatus.AT_RISK);
        Student s4 = createStudent("STU004", "Pham", "Thi D", 1.3, StudentStatus.PROBATION);
        Student s5 = createStudent("STU005", "Hoang", "Van E", 3.9, StudentStatus.NORMAL);

        // Create courses
        Course c1 = createCourse("CS101", "Introduction to Programming", 3);
        Course c2 = createCourse("CS201", "Data Structures", 4);
        Course c3 = createCourse("CS301", "Software Engineering", 3);
        Course c4 = createCourse("MATH101", "Calculus I", 4);

        // Create offerings
        CourseOffering o1 = createOffering(c1, Semester.FALL, 2025, "Dr. Nguyen");
        CourseOffering o2 = createOffering(c2, Semester.FALL, 2025, "Dr. Tran");
        CourseOffering o3 = createOffering(c3, Semester.FALL, 2025, "Dr. Le");

        // Create enrollments with grades
        // ... create enrollments linking students to offerings

        // Create sample alerts
        createAlert(s3, AlertLevel.WARNING, AlertType.LOW_GPA, "GPA below 2.0");
        createAlert(s4, AlertLevel.CRITICAL, AlertType.PROBATION, "GPA below 1.5");
    }

    // Helper methods for creating each entity type
}
```

### Verification
```bash
cd backend && mvn spring-boot:run -Dspring.profiles.active=dev
curl http://localhost:8080/api/students
# Should return seeded student data
```

---

## EXECUTION ORDER
```
1. Create exception/ package
2. Create all 5 exception files
3. Compile and verify: mvn compile -q
4. Create StudentController.java
5. Compile and test
6. Create remaining 5 controllers
7. Compile and verify Swagger UI
8. Create DataInitializer.java
9. Run with dev profile
```

---

## SUCCESS CRITERIA
- [x] All 5 exception classes created
- [x] GlobalExceptionHandler created
- [ ] All 6 controllers created
- [ ] Backend compiles: mvn compile -q
- [ ] Application starts: mvn spring-boot:run
- [ ] Swagger UI shows all endpoints
- [ ] DataInitializer seeds data in dev profile

---

## DEPENDENCIES
- Requires: Service layer (DONE)
- Blocks: MEMBER4 frontend API integration

## DO NOT
- Modify existing entity/service/repository files
- Add new dependencies without approval
- Skip @Valid annotation on request bodies
- Return entities directly (always use DTOs)

---
Last Updated: 2026-01-17
