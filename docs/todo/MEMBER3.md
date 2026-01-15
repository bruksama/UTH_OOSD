# MEMBER 3 - Behavioral Engineer Todolist

**Role:** Behavioral Engineer (Kỹ sư Hành vi)  
**Focus:** Observer Pattern, State Pattern, Alert System Integration

---

## Phase 1: Interface and DTO Definitions (Day 1-2)

### 1.1 Observer Pattern - Interface Review
- [x] Review `IGradeObserver.java` interface
  - [x] Method: `onGradeUpdated(Student, Enrollment, GradeEntry)`
  - [x] Priority mechanism implemented
  - [x] Observer name for logging
- [x] Review `GradeSubject.java` subject class
  - [x] Observer registration (attach/detach)
  - [x] Priority-based notification
  - [x] Observer count tracking

### 1.2 Observer Pattern - Observer Implementations
- [x] Review `GpaRecalculatorObserver.java`
  - [x] Priority = 0 (highest - runs first)
  - [x] Logging structure in place
  - [ ] **TODO:** Inject StudentService
  - [ ] **TODO:** Implement GPA recalculation logic
- [x] Review `RiskDetectorObserver.java`
  - [x] Priority = 10 (runs after GPA recalc)
  - [x] Thresholds defined (AT_RISK = 2.0, PROBATION = 1.5)
  - [ ] **TODO:** Inject AlertService
  - [ ] **TODO:** Implement alert creation logic

### 1.3 State Pattern - State Classes Review
- [x] Review `StudentState.java` abstract class
  - [x] Methods: getStateName, canRegisterCourses, requiresCounseling
  - [x] Methods: getMaxCreditHours, handleGpaChange, getRequiredActions
- [x] Review concrete state implementations
  - [x] `NormalState.java` - GPA >= 2.0, max 18 credits
  - [x] `AtRiskState.java` - 1.5 <= GPA < 2.0, max 15 credits
  - [x] `ProbationState.java` - GPA < 1.5, max 12 credits
  - [x] `GraduatedState.java` - Terminal state, no registration

---

## Phase 2: Implementation (Day 3-6)

### 2.1 Observer Pattern Integration
- [ ] Create `ObserverConfig.java` configuration class
  - [ ] Inject GradeSubject and all observers
  - [ ] Auto-register observers in @PostConstruct
  - [ ] Verify observer count and priority ordering
- [ ] Complete `GpaRecalculatorObserver.java` implementation
  - [ ] Add StudentService dependency injection
  - [ ] Implement `recalculateAndUpdateGpa()` call
  - [ ] Add try-catch error handling
  - [ ] Test: Grade update triggers GPA recalculation
- [ ] Complete `RiskDetectorObserver.java` implementation
  - [ ] Add AlertService dependency injection
  - [ ] Implement alert creation for AT_RISK (GPA < 2.0)
  - [ ] Implement alert creation for PROBATION (GPA < 1.5)
  - [ ] Add duplicate alert prevention logic
  - [ ] Test: Low GPA triggers alert creation
- [ ] Integrate Observer Pattern with `GradeEntryService.java`
  - [ ] Inject GradeSubject into service
  - [ ] Add `notifyGradeObservers()` helper method
  - [ ] Call observers in `createGradeEntry()` (line ~103)
  - [ ] Call observers in `updateGradeEntry()` (line ~135)
  - [ ] Call observers in `updateScore()` (line ~403)
  - [ ] Test: Grade changes trigger observer notifications

### 2.2 State Pattern Enhancement
- [ ] Create `StudentStateManager.java` helper class
  - [ ] Inject all state beans (Normal, AtRisk, Probation, Graduated)
  - [ ] Implement `getStateForStatus(StudentStatus)` method
  - [ ] Implement `determineStateFromGpa(Double)` method
  - [ ] Implement `canTransition(StudentState, StudentState)` validation
  - [ ] Add logging for state transitions
- [ ] Update `StudentService.java` to use StateManager
  - [ ] Inject StudentStateManager
  - [ ] Refactor `updateStudentStatus()` to use manager
  - [ ] Refactor `getStateForStatus()` to delegate to manager
  - [ ] Add state transition logging
  - [ ] Test: GPA changes trigger correct state transitions
- [ ] Create `StateTransitionObserver.java` (optional enhancement)
  - [ ] Implement IGradeObserver interface
  - [ ] Set priority = 20 (runs after risk detection)
  - [ ] Detect state transitions
  - [ ] Create alerts for state changes
  - [ ] Log transition history

### 2.3 DTO and Supporting Classes
- [ ] Create `StudentStateDTO.java`
  - [ ] Fields: stateName, canRegister, requiresCounseling
  - [ ] Fields: maxCredits, requiredActions
  - [ ] Getters and setters
  - [ ] Constructor for easy creation

---

## Phase 3: Integration and Testing (Day 7)

### 3.1 Unit Tests - Observer Pattern
- [ ] Write `GradeSubjectTest.java`
  - [ ] Test attach() adds observer
  - [ ] Test attach() prevents duplicates
  - [ ] Test detach() removes observer
  - [ ] Test notifyObservers() calls all observers
  - [ ] Test observer priority ordering
  - [ ] Test getObserverCount()
- [ ] Write `GpaRecalculatorObserverTest.java`
  - [ ] Mock StudentService
  - [ ] Test onGradeUpdated() calls recalculateAndUpdateGpa()
  - [ ] Test getPriority() returns 0
  - [ ] Test exception handling
- [ ] Write `RiskDetectorObserverTest.java`
  - [ ] Mock AlertService
  - [ ] Test GPA < 1.5 creates CRITICAL alert
  - [ ] Test 1.5 <= GPA < 2.0 creates WARNING alert
  - [ ] Test GPA >= 2.0 creates no alert
  - [ ] Test duplicate alert prevention
- [ ] Write `StateTransitionObserverTest.java` (if implemented)
  - [ ] Test state transition detection
  - [ ] Test alert creation on state change

### 3.2 Unit Tests - State Pattern
- [ ] Write `NormalStateTest.java`
  - [ ] Test getStateName() = "NORMAL"
  - [ ] Test canRegisterCourses() = true
  - [ ] Test requiresCounseling() = false
  - [ ] Test getMaxCreditHours() = 18
  - [ ] Test handleGpaChange() with GPA >= 2.0 stays NORMAL
  - [ ] Test handleGpaChange() with GPA < 2.0 transitions to AT_RISK
- [ ] Write `AtRiskStateTest.java`
  - [ ] Test all state properties
  - [ ] Test handleGpaChange() transitions (3 cases)
  - [ ] Test getMaxCreditHours() = 15
- [ ] Write `ProbationStateTest.java`
  - [ ] Test all state properties
  - [ ] Test handleGpaChange() transitions (3 cases)
  - [ ] Test getMaxCreditHours() = 12
- [ ] Write `GraduatedStateTest.java`
  - [ ] Test canRegisterCourses() = false
  - [ ] Test handleGpaChange() always returns same state (terminal)
- [ ] Write `StudentStateManagerTest.java`
  - [ ] Test determineStateFromGpa() logic
  - [ ] Test getStateForStatus() returns correct state
  - [ ] Test canTransition() validation

### 3.3 Integration Tests
- [ ] Write `ObserverPatternIntegrationTest.java`
  - [ ] Setup: Create student, enrollment, grade entry
  - [ ] Test: Add grade entry -> GPA recalculated
  - [ ] Test: Update grade -> GPA updated
  - [ ] Test: GPA drops below 2.0 -> Alert created
  - [ ] Verify full observer chain works end-to-end
- [ ] Write `StatePatternIntegrationTest.java`
  - [ ] Test student lifecycle: NORMAL -> AT_RISK -> PROBATION -> NORMAL
  - [ ] Verify state transitions based on GPA changes
  - [ ] Verify alerts created at each transition
  - [ ] Test edge cases (GPA = 2.0, 1.5, etc.)
- [ ] Write `EndToEndGradeFlowTest.java`
  - [ ] Simulate realistic scenario: student enrolls in 4 courses
  - [ ] Enter grades progressively
  - [ ] Verify GPA calculation after each grade
  - [ ] Verify state transitions tracked correctly
  - [ ] Verify alerts generated appropriately

### 3.4 Documentation
- [ ] Create `docs/patterns/OBSERVER_PATTERN.md`
  - [ ] Pattern overview and motivation
  - [ ] Class diagram (text-based or image)
  - [ ] Sequence diagram for grade update flow
  - [ ] Implementation details and code examples
  - [ ] How to add new observers
  - [ ] Testing guide
- [ ] Create `docs/patterns/STATE_PATTERN.md`
  - [ ] Pattern overview and motivation
  - [ ] State diagram showing transitions
  - [ ] State transition rules and thresholds
  - [ ] Implementation details and code examples
  - [ ] How to add new states
  - [ ] Testing guide
- [ ] Update main `README.md`
  - [ ] Add Observer Pattern section
  - [ ] Add State Pattern section
  - [ ] Link to detailed documentation
- [ ] Add comprehensive Javadoc comments
  - [ ] All observer classes
  - [ ] All state classes
  - [ ] Include @see references between related classes

### 3.5 Code Review and Cleanup
- [ ] Review all observer classes for consistency
- [ ] Review all state classes for consistency
- [ ] Ensure all code comments are in English
- [ ] Run code formatter (follow Java conventions)
- [ ] Remove unused imports and dead code
- [ ] Verify all tests pass
- [ ] Verify test coverage > 80%

---

## Coordination with Other Members

### With Member 1 (Foundation Architect)
- [x] Entity structure ready (Student, Enrollment, GradeEntry, Alert)
- [x] Service layer has hooks for Observer pattern
- [ ] Verify controller layer doesn't conflict with patterns
- [ ] Coordinate Alert entity usage with RiskDetectorObserver

### With Member 2 (Logic Engineer - Strategy Pattern)
- [ ] Ensure grading strategies compatible with Observer notifications
- [ ] Test integration between Strategy and Observer patterns
- [ ] Coordinate grade calculation flow

### With Member 4 (UX Developer)
- [ ] Verify frontend displays alerts correctly
- [ ] Verify frontend displays student states correctly
- [ ] Coordinate alert notification UI
- [ ] Test frontend-backend integration for state changes

---

## Files Created/Modified Checklist

### Completed (Pattern Structure)
- [x] `patterns/observer/IGradeObserver.java` - interface
- [x] `patterns/observer/GradeSubject.java` - subject
- [x] `patterns/observer/GpaRecalculatorObserver.java` - observer (needs completion)
- [x] `patterns/observer/RiskDetectorObserver.java` - observer (needs completion)
- [x] `patterns/state/StudentState.java` - abstract state
- [x] `patterns/state/NormalState.java` - concrete state
- [x] `patterns/state/AtRiskState.java` - concrete state
- [x] `patterns/state/ProbationState.java` - concrete state
- [x] `patterns/state/GraduatedState.java` - concrete state

### To Be Created
- [ ] `config/ObserverConfig.java`
- [ ] `patterns/state/StudentStateManager.java`
- [ ] `patterns/observer/StateTransitionObserver.java` (optional)
- [ ] `dto/StudentStateDTO.java`
- [ ] `test/.../observer/GradeSubjectTest.java`
- [ ] `test/.../observer/GpaRecalculatorObserverTest.java`
- [ ] `test/.../observer/RiskDetectorObserverTest.java`
- [ ] `test/.../observer/StateTransitionObserverTest.java`
- [ ] `test/.../state/NormalStateTest.java`
- [ ] `test/.../state/AtRiskStateTest.java`
- [ ] `test/.../state/ProbationStateTest.java`
- [ ] `test/.../state/GraduatedStateTest.java`
- [ ] `test/.../state/StudentStateManagerTest.java`
- [ ] `test/.../integration/ObserverPatternIntegrationTest.java`
- [ ] `test/.../integration/StatePatternIntegrationTest.java`
- [ ] `test/.../integration/EndToEndGradeFlowTest.java`
- [ ] `docs/patterns/OBSERVER_PATTERN.md`
- [ ] `docs/patterns/STATE_PATTERN.md`

### To Be Modified
- [ ] `service/GradeEntryService.java` - integrate Observer pattern
- [ ] `service/StudentService.java` - use StudentStateManager
- [ ] `README.md` - add pattern documentation

---

## Priority Order

1. **HIGH Priority** - Observer Pattern Integration (Day 1-2)
   - Complete observer implementations
   - Integrate with GradeEntryService
   - Manual testing to verify flow works
2. **HIGH Priority** - State Pattern Enhancement (Day 2-3)
   - Create StudentStateManager
   - Update StudentService
   - Test state transitions
3. **HIGH Priority** - Unit Tests (Day 3-5)
   - Observer pattern tests (4 files)
   - State pattern tests (5 files)
   - Coverage > 80%
4. **MEDIUM Priority** - Integration Tests (Day 5-6)
   - End-to-end flow testing
   - Bug fixes from testing
5. **MEDIUM Priority** - Documentation (Day 6-7)
   - Pattern documentation
   - Code examples
   - Javadoc improvements
6. **LOW Priority** - Optional Enhancements
   - StateTransitionObserver
   - Advanced state tracking
   - Performance optimizations

---

## Notes

- All code comments must be in **English**
- Follow naming conventions: PascalCase for classes, camelCase for methods/variables
- Commit format: `feat(observer): description` or `feat(state): description`
- Coordinate with team before making changes to shared interfaces
- **IMPORTANT:** Observer pattern must not impact performance - keep notifications lightweight
- **IMPORTANT:** State transitions must be logged for debugging and audit purposes

---

## Changes Log

### 2026-01-15
- Reviewed existing Observer Pattern implementation (4 files)
  - IGradeObserver interface complete
  - GradeSubject complete
  - GpaRecalculatorObserver structure ready (needs logic)
  - RiskDetectorObserver structure ready (needs logic)
- Reviewed existing State Pattern implementation (5 files)
  - StudentState abstract class complete
  - All 4 concrete states complete (Normal, AtRisk, Probation, Graduated)
  - State transition logic implemented
  - Integration with StudentService verified
- Identified integration points:
  - GradeEntryService has 3 TODO comments for observer integration
  - StudentService already uses State Pattern but can be improved with StateManager
- Created comprehensive todolist with 7-day plan
- Estimated 18 new files to create, 2 files to modify

---

*Last Updated: 2026-01-15*
