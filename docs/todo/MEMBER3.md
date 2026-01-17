# MEMBER3 - Behavioral Engineer

## ROLE
Behavioral Engineer - Observer Pattern, State Pattern, Alert System

## CURRENT STATE
- [x] Observer Pattern STRUCTURE complete
  - [x] IGradeObserver interface
  - [x] GradeSubject class
  - [!] GpaRecalculatorObserver (structure only, needs completion)
  - [!] RiskDetectorObserver (structure only, needs completion)
- [x] State Pattern COMPLETE
  - [x] StudentState abstract class
  - [x] NormalState, AtRiskState, ProbationState, GraduatedState
- [ ] Observer Integration NOT DONE
- [ ] ObserverConfig NOT CREATED

---

## TASK 1: Complete Observer Implementations
**Priority: CRITICAL**

### 1.1 Complete GpaRecalculatorObserver.java
```
Location: backend/src/main/java/com/spts/patterns/observer/
Current: Has structure but logic is placeholder
```

CHANGES NEEDED:
```java
// Add service injection
private final StudentService studentService;

// Constructor injection
public GpaRecalculatorObserver(StudentService studentService) {
    this.studentService = studentService;
}

// In onGradeUpdated method:
@Override
public void onGradeUpdated(Student student, Enrollment enrollment, GradeEntry gradeEntry) {
    try {
        log.info("Recalculating GPA for student: {}", student.getStudentId());
        studentService.recalculateAndUpdateGpa(student.getId());
        log.info("GPA recalculation completed for student: {}", student.getStudentId());
    } catch (Exception e) {
        log.error("Error recalculating GPA for student {}: {}", student.getStudentId(), e.getMessage());
    }
}
```

### 1.2 Complete RiskDetectorObserver.java
```
Location: backend/src/main/java/com/spts/patterns/observer/
Current: Has structure but logic is placeholder
```

CHANGES NEEDED:
```java
// Add service injection
private final AlertService alertService;

// Constructor injection
public RiskDetectorObserver(AlertService alertService) {
    this.alertService = alertService;
}

// In onGradeUpdated method:
@Override
public void onGradeUpdated(Student student, Enrollment enrollment, GradeEntry gradeEntry) {
    Double gpa = student.getGpa();
    if (gpa == null) return;
    
    if (gpa < PROBATION_THRESHOLD) { // 1.5
        createAlertIfNotExists(student, AlertLevel.CRITICAL, AlertType.PROBATION,
            "Student GPA (" + gpa + ") is below probation threshold");
    } else if (gpa < AT_RISK_THRESHOLD) { // 2.0
        createAlertIfNotExists(student, AlertLevel.WARNING, AlertType.LOW_GPA,
            "Student GPA (" + gpa + ") is below acceptable level");
    }
}

private void createAlertIfNotExists(Student student, AlertLevel level, AlertType type, String message) {
    // Check for existing unresolved alert of same type
    // If not exists, create new alert via alertService
}
```

---

## TASK 2: Create ObserverConfig
**Priority: HIGH**

### 2.1 Create config/ObserverConfig.java
```
Location: backend/src/main/java/com/spts/config/
Purpose: Wire up observer pattern at startup
```

SPEC:
```java
@Configuration
public class ObserverConfig {
    
    private final GradeSubject gradeSubject;
    private final GpaRecalculatorObserver gpaRecalculatorObserver;
    private final RiskDetectorObserver riskDetectorObserver;
    
    // Constructor injection for all
    
    @PostConstruct
    public void registerObservers() {
        gradeSubject.attach(gpaRecalculatorObserver);  // Priority 0
        gradeSubject.attach(riskDetectorObserver);     // Priority 10
        log.info("Registered {} observers with GradeSubject", gradeSubject.getObserverCount());
    }
}
```

---

## TASK 3: Integrate Observer with Services
**Priority: HIGH**

### 3.1 Update GradeEntryService.java
```
Location: backend/src/main/java/com/spts/service/
Changes: Inject GradeSubject and call notifyObservers
```

FIND these TODO comments and implement:
1. In `createGradeEntry()` - after saving, call notifyObservers
2. In `updateGradeEntry()` - after saving, call notifyObservers  
3. In `updateScore()` - after saving, call notifyObservers

IMPLEMENTATION:
```java
// Add to class
private final GradeSubject gradeSubject;

// In constructor, add GradeSubject parameter

// Create helper method
private void notifyGradeObservers(GradeEntry gradeEntry) {
    Enrollment enrollment = gradeEntry.getEnrollment();
    Student student = enrollment.getStudent();
    gradeSubject.notifyObservers(student, enrollment, gradeEntry);
}

// Call after each save:
notifyGradeObservers(savedEntry);
```

### 3.2 Update EnrollmentService.java (Optional)
The `completeEnrollmentWithStrategy()` method already has a TODO comment for observer integration.
Add:
```java
// After grade calculation, notify observers
gradeSubject.notifyObservers(student, enrollment, null);
```

---

## TASK 4: State Pattern Enhancement (Optional)
**Priority: MEDIUM**

### 4.1 Create StudentStateManager.java (Optional)
```
Location: backend/src/main/java/com/spts/patterns/state/
Purpose: Centralize state transition logic
```

SPEC:
```java
@Component
public class StudentStateManager {
    
    private final Map<StudentStatus, StudentState> states;
    
    // Initialize map with all state beans
    
    public StudentState getStateForStatus(StudentStatus status) {
        return states.get(status);
    }
    
    public StudentStatus determineStatusFromGpa(Double gpa) {
        if (gpa >= 2.0) return StudentStatus.NORMAL;
        if (gpa >= 1.5) return StudentStatus.AT_RISK;
        return StudentStatus.PROBATION;
    }
}
```

---

## EXECUTION ORDER
```
1. Read current GpaRecalculatorObserver.java and RiskDetectorObserver.java
2. Update both observers with proper service injection and logic
3. Create ObserverConfig.java
4. Compile and verify: mvn compile -q
5. Update GradeEntryService.java to use GradeSubject
6. Compile and verify
7. Test manually: create grade entry, verify GPA recalculates and alerts created
8. (Optional) Create StudentStateManager.java
```

## VERIFICATION STEPS
```bash
# After each change
cd backend && mvn compile -q

# Integration test
cd backend && mvn spring-boot:run
# Then:
# 1. Create a student via API
# 2. Create enrollment
# 3. Create grade entry with low score
# 4. Verify alert was created
# 5. Verify student GPA was updated
```

---

## SUCCESS CRITERIA
- [ ] GpaRecalculatorObserver properly injects StudentService
- [ ] RiskDetectorObserver properly injects AlertService
- [ ] ObserverConfig registers observers at startup
- [ ] GradeEntryService notifies observers on grade changes
- [ ] Low GPA automatically creates alert
- [ ] Backend compiles without errors

---

## DEPENDENCIES
- Requires: Entity layer (DONE)
- Requires: Service layer (DONE)
- Requires: Alert entity and AlertService (DONE)
- Provides to: Frontend (alerts display)

## DO NOT
- Modify Observer interface signatures without team approval
- Add heavy processing in observers (keep lightweight)
- Create circular dependencies between observers

## KEY FILES TO READ FIRST
```
1. backend/src/main/java/com/spts/patterns/observer/IGradeObserver.java
2. backend/src/main/java/com/spts/patterns/observer/GradeSubject.java
3. backend/src/main/java/com/spts/patterns/observer/GpaRecalculatorObserver.java
4. backend/src/main/java/com/spts/patterns/observer/RiskDetectorObserver.java
5. backend/src/main/java/com/spts/service/GradeEntryService.java
6. backend/src/main/java/com/spts/service/AlertService.java
```

---
*Last Updated: 2026-01-17*
