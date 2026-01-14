# MEMBER 1 - Foundation Architect Todolist

**Role:** Foundation Architect (Kien truc su chinh va Rang buoc)  
**Focus:** ERD Design, Entities, OCL Constraints, Base Repository & Controller

---

## Phase 1: Interface and DTO Definitions (Day 1-2)

### 1.1 Database Design
- [x] Design Entity-Relationship Diagram (ERD) for SPTS
  - [x] Define relationships between Student, Course, Enrollment, GradeEntry
  - [x] Define cardinality (1:1, 1:N, M:N) for all relationships
  - [x] Document primary keys and foreign keys
- [x] Create ERD document in `docs/agents/ERD.md`
- [ ] Create visual ERD diagram file in `docs/diagrams/ERD.png` or `.drawio`
- [ ] Review ERD with team members for feedback

### 1.2 Entity Review and Enhancement
- [x] Review and update entity classes in `backend/src/main/java/com/spts/entity/`
  - [x] `Student.java` - updated with createdAt, updatedAt, enrollments relationship
  - [x] `Course.java` - has gradingType for Strategy pattern
  - [x] `CourseOffering.java` - updated with enrollments relationship
  - [x] `Enrollment.java` - NEW: replaces Transcript approach
  - [x] `GradeEntry.java` - updated with parent_id for Composite pattern
  - [x] `Alert.java` - updated with isRead, isResolved, timestamps
- [x] Removed deprecated Transcript entity (replaced by Enrollment)
- [x] Ensure all JPA annotations are correct (@Entity, @Table, @Column, etc.)

### 1.3 OCL Constraints Verification
- [x] Verify OCL constraint implementation in entities:
  - [x] `GradeEntry.score >= 0 AND score <= 10`
  - [x] `GradeEntry.weight >= 0 AND weight <= 1`
  - [x] `Student.gpa >= 0.0 AND gpa <= 4.0`
  - [x] `Enrollment.finalScore >= 0 AND finalScore <= 10`
  - [x] `Enrollment.gpaValue >= 0.0 AND gpaValue <= 4.0`
  - [x] `Alert.createdAt <= CURRENT_TIMESTAMP`
- [x] Add Jakarta Validation annotations (@Min, @Max, @DecimalMin, @DecimalMax)
- [x] Implement custom validation in setter methods

---

## Phase 2: Implementation (Day 3-6)

### 2.1 Abstraction-Occurrence Pattern (Chapter 6)
- [x] Verify Course (Abstraction) and CourseOffering (Occurrence) relationship
- [x] Document pattern usage in code comments
- [ ] Create sequence diagram showing pattern interaction
- [ ] Write unit test to verify pattern behavior

### 2.2 Composite Pattern for Grade Entries
- [x] Implement parent_id self-reference in GradeEntry
- [x] Add children relationship for hierarchical grades
- [x] Implement calculateWeightedScore() for composite calculation
- [ ] Write unit test for composite grade calculation

### 2.3 Repository Layer
- [x] Review and update repositories in `backend/src/main/java/com/spts/repository/`
  - [x] `StudentRepository.java`
  - [x] `CourseRepository.java`
  - [x] `CourseOfferingRepository.java`
  - [x] `EnrollmentRepository.java` - NEW
  - [x] `GradeEntryRepository.java` - updated for Enrollment
  - [x] `AlertRepository.java`
- [x] Removed deprecated TranscriptRepository
- [ ] Implement pagination for list queries

### 2.4 Service Layer
- [ ] Create `StudentService.java`
  - [ ] CRUD operations
  - [ ] GPA calculation from enrollments
  - [ ] Status update logic (integrate with State pattern)
- [ ] Create `CourseService.java`
  - [ ] CRUD operations
  - [ ] Get offerings by course
- [ ] Create `CourseOfferingService.java`
  - [ ] CRUD operations
  - [ ] Enrollment management
- [ ] Create `EnrollmentService.java`
  - [ ] CRUD operations
  - [ ] Grade submission
  - [ ] GPA calculation per enrollment
- [ ] Create `GradeEntryService.java`
  - [ ] CRUD operations
  - [ ] Composite grade calculation
  - [ ] Integrate with Observer pattern (coordinate with Member 3)
- [ ] Create `AlertService.java`
  - [ ] CRUD operations
  - [ ] Mark as read/resolved

### 2.5 Controller Layer
- [ ] Create `StudentController.java`
  - [ ] GET /api/students - List all students
  - [ ] GET /api/students/{id} - Get student by ID
  - [ ] POST /api/students - Create new student
  - [ ] PUT /api/students/{id} - Update student
  - [ ] DELETE /api/students/{id} - Delete student
  - [ ] GET /api/students/{id}/enrollments - Get student enrollments
- [ ] Create `CourseController.java`
  - [ ] GET /api/courses - List all courses
  - [ ] GET /api/courses/{id} - Get course by ID
  - [ ] POST /api/courses - Create new course
  - [ ] PUT /api/courses/{id} - Update course
  - [ ] GET /api/courses/{id}/offerings - Get course offerings
- [ ] Create `CourseOfferingController.java`
  - [ ] CRUD endpoints for course offerings
  - [ ] GET /api/offerings/{id}/enrollments - Get enrolled students
- [ ] Create `EnrollmentController.java`
  - [ ] CRUD endpoints for enrollments
  - [ ] POST /api/enrollments/{id}/complete - Complete enrollment with grade
- [ ] Create `GradeEntryController.java`
  - [ ] CRUD endpoints for grade entries
  - [ ] POST /api/grade-entries/{id}/children - Add child grade entry
- [ ] Create `AlertController.java`
  - [ ] GET /api/alerts - List all alerts
  - [ ] PUT /api/alerts/{id}/read - Mark as read
  - [ ] PUT /api/alerts/{id}/resolve - Resolve alert

### 2.6 Exception Handling
- [ ] Create custom exceptions:
  - [ ] `ResourceNotFoundException.java`
  - [ ] `ValidationException.java`
  - [ ] `DuplicateResourceException.java`
- [ ] Create `GlobalExceptionHandler.java` with @ControllerAdvice
- [ ] Define standard error response format (ErrorResponse DTO)

### 2.7 Data Initialization
- [ ] Create `DataInitializer.java` (@Component with CommandLineRunner)
  - [ ] Seed sample students
  - [ ] Seed sample courses
  - [ ] Seed sample course offerings
  - [ ] Seed sample enrollments and grade entries
- [ ] Ensure data matches frontend mock data for consistency

---

## Phase 3: Integration and Testing (Day 7)

### 3.1 Unit Tests
- [ ] Write unit tests for entities (validation logic)
  - [ ] `StudentTest.java`
  - [ ] `EnrollmentTest.java`
  - [ ] `GradeEntryTest.java` (including Composite pattern)
  - [ ] `AlertTest.java`
- [ ] Write unit tests for repositories
  - [ ] Test custom query methods
- [ ] Write unit tests for services
  - [ ] Mock repository dependencies

### 3.2 Integration Tests
- [ ] Write integration tests for controllers
  - [ ] Test API endpoints with MockMvc
  - [ ] Test error handling
- [ ] Verify database constraints work correctly

### 3.3 Documentation
- [ ] Update Swagger/OpenAPI annotations on controllers
  - [ ] Add @Operation descriptions
  - [ ] Add @ApiResponse for each endpoint
  - [ ] Add @Parameter descriptions
- [ ] Create API documentation in `docs/API.md`
- [ ] Document database schema in `docs/DATABASE.md`

### 3.4 Code Review and Cleanup
- [ ] Review all entity classes for consistency
- [ ] Ensure all code comments are in English
- [ ] Run code formatter (follow Java conventions)
- [ ] Remove unused imports and dead code
- [ ] Verify all tests pass

---

## Coordination with Other Members

### With Member 2 (Logic Engineer - Strategy Pattern)
- [x] Ensure `GradingType` enum aligns with strategy implementations
- [ ] Verify grade calculation flow works with Enrollment entity

### With Member 3 (Behavioral Engineer - Observer/State Patterns)
- [x] Ensure `StudentStatus` enum aligns with State pattern
- [x] Updated Observer interfaces for Enrollment-based approach
- [ ] Provide hooks for Observer pattern in GradeEntryService
- [ ] Coordinate Alert entity with RiskDetectorObserver

### With Member 4 (UX Developer)
- [x] Updated frontend TypeScript types to match new DTOs
- [ ] Verify DTO structure matches TypeScript interfaces
- [ ] Coordinate mock data consistency

---

## Files Created/Modified Checklist

### Completed
- [x] `entity/Student.java` - updated
- [x] `entity/Course.java` - verified
- [x] `entity/CourseOffering.java` - updated
- [x] `entity/Enrollment.java` - NEW
- [x] `entity/EnrollmentStatus.java` - NEW
- [x] `entity/GradeEntry.java` - updated with Composite pattern
- [x] `entity/Alert.java` - updated
- [x] `entity/*` (Enums) - verified
- [x] `repository/EnrollmentRepository.java` - NEW
- [x] `repository/GradeEntryRepository.java` - updated
- [x] `dto/EnrollmentDTO.java` - NEW
- [x] `dto/GradeEntryDTO.java` - updated
- [x] `patterns/observer/*` - updated for Enrollment
- [x] `docs/agents/ERD.md` - completed
- [x] `frontend/src/types/index.ts` - updated

### Removed (Deprecated)
- [x] `entity/Transcript.java` - removed
- [x] `dto/TranscriptDTO.java` - removed
- [x] `repository/TranscriptRepository.java` - removed

### To Be Created
- [ ] `service/StudentService.java`
- [ ] `service/CourseService.java`
- [ ] `service/CourseOfferingService.java`
- [ ] `service/EnrollmentService.java`
- [ ] `service/GradeEntryService.java`
- [ ] `service/AlertService.java`
- [ ] `controller/StudentController.java`
- [ ] `controller/CourseController.java`
- [ ] `controller/CourseOfferingController.java`
- [ ] `controller/EnrollmentController.java`
- [ ] `controller/GradeEntryController.java`
- [ ] `controller/AlertController.java`
- [ ] `exception/ResourceNotFoundException.java`
- [ ] `exception/ValidationException.java`
- [ ] `exception/GlobalExceptionHandler.java`
- [ ] `config/DataInitializer.java`
- [ ] `docs/diagrams/ERD.drawio`
- [ ] `docs/API.md`
- [ ] `docs/DATABASE.md`

---

## Priority Order

1. **DONE** - ERD Design, Entity Updates, OCL Verification
2. **High Priority** - Service Layer Implementation
3. **Medium Priority** - Controller Layer Implementation
4. **Medium Priority** - Exception Handling
5. **Low Priority** - Unit Tests
6. **Low Priority** - Documentation

---

## Notes

- All code comments must be in **English**
- Follow naming conventions: PascalCase for classes, camelCase for methods/variables
- Commit format: `feat: description` or `fix: description`
- Coordinate with team before making changes to shared interfaces
- **IMPORTANT:** Transcript entity has been replaced by Enrollment entity

---

## Changes Log

### 2026-01-14
- Completed ERD design in `docs/agents/ERD.md`
- Migrated from Transcript to Enrollment approach
- Added Composite Pattern support in GradeEntry (parent_id, children)
- Updated all related entities, repositories, DTOs
- Updated Observer pattern interfaces for Enrollment
- Updated frontend TypeScript types

---

*Last Updated: 2026-01-14*
