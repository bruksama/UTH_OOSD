# MEMBER 2 – LOGIC ENGINEER TODOLIST (Kỹ Sư Logic)

**Role:** Logic Engineer (Kỹ Sư Logic)  
**Focus:** Strategy Pattern, Composite Pattern, Business Logic Integration  
**Scope:** Backend – Business Logic & Design Patterns  
**Timeline:** ~1 tuần  
**Priority:** 🔴 CRITICAL (Blocking other features)

---

## 📋 Tổng Quan Nhiệm Vụ

Là Kỹ Sư Logic, bạn chịu trách nhiệm:
1. ✅ **Xây dựng & Hoàn thiện Design Patterns** (Strategy, Composite)
2. ✅ **Tích hợp Logic Tính Điểm** vào Business Layer
3. ✅ **Đảm bảo Validation & Business Rules**
4. ✅ **Phối hợp với các Role khác** (DB Engineer, Observer Engineer)

---

## 🎯 PHASE 1: KIỂM TRA & CẬP NHẬT CẤU TRÚC (Ngày 1 - ~2 giờ)

### 1.1 Kiểm Tra Strategy Pattern Hiện Tại ✅ DONE
- [x] ✅ Review `IGradingStrategy` interface
  - [x] Verify method: `calculate(List<Double> scores, List<Double> weights)`
  - [x] Verify methods: `getStrategyName()`, `getMaxGrade()`, `getPassingGrade()`
- [x] ✅ Review existing implementations:
  - [x] `Scale10Strategy` - Thang 10 điểm (Việt Nam)
  - [x] `Scale4Strategy` - Thang 4 GPA (Mỹ)
  - [x] `PassFailStrategy` - Pass/Fail binary
- [x] ✅ Confirm NO database access in strategies ✓

**Status:** ✅ HOÀN THÀNH

---

### 1.2 Kiểm Tra Composite Pattern Hiện Tại ✅ DONE
- [x] ✅ Review `GradeEntry` entity structure:
  - [x] Confirm `parent_id` self-reference field
  - [x] Confirm `children` collection (OneToMany)
  - [x] Confirm leaf vs composite differentiation
- [x] ✅ Review `GradeEntryService`:
  - [x] Confirm `calculateAggregatedScore()` recursive method
  - [x] Confirm `getChildren()` method
  - [x] Confirm `convertToDTOWithChildren()` recursive conversion

**Status:** ✅ HOÀN THÀNH

---

### 1.3 Xác Định Các Thay Đổi Cần Thiết ⏳ IN PROGRESS
- [ ] 🔴 **CRITICAL:** Thêm `gradingScale` field vào `CourseOffering`
- [ ] 🔴 **CRITICAL:** Tạo `GradingStrategyFactory.java`
- [ ] 🔴 **CRITICAL:** Cập nhật `EnrollmentService` để sử dụng Factory

**Deadline:** Hôm nay  
**Commits:** 3 commits riêng biệt

---

## 🔴 PHASE 2: TRIỂN KHAI FACTORY PATTERN (Ngày 1-2 - ~30 phút)

### 2.1 Tạo GradingStrategyFactory Class
- [ ] **CRITICAL:** Tạo file `GradingStrategyFactory.java`
  - Vị trí: `backend/src/main/java/com/spts/patterns/strategy/`
  - [ ] Thêm `@Component` annotation (Spring Bean)
  - [ ] Implement `getStrategy(String gradingScale)` method
  - [ ] Switch statement với các case:
    - `SCALE_10` → `new Scale10Strategy()`
    - `SCALE_4` → `new Scale4Strategy()`
    - `PASS_FAIL` → `new PassFailStrategy()`
  - [ ] Default case → throw `IllegalArgumentException`
  - [ ] Add validation: `if (gradingScale == null || empty) → throw exception`

- [ ] Thêm JavaDoc comments:
  ```java
  /**
   * Factory for creating grading strategies.
   * Centralizes strategy selection logic.
   * 
   * Usage:
   *   IGradingStrategy strategy = factory.getStrategy("SCALE_10");
   */
  ```

**Acceptance Criteria:**
- ✅ Factory returns correct strategy instance
- ✅ Invalid input throws exception
- ✅ No hardcoded if-else logic outside factory
- ✅ Spring component annotation present

**Commit Message:**
```
feat(strategy): implement GradingStrategyFactory for dynamic strategy selection
```

---

### 2.2 Thêm gradingScale Field vào CourseOffering
- [ ] **CRITICAL:** Sửa `CourseOffering.java`
  - [ ] Thêm field:
    ```java
    @Column(name = "grading_scale", length = 50)
    @NotBlank(message = "Grading scale is required")
    private String gradingScale = "SCALE_10";  // Default
    ```
  - [ ] Thêm getter/setter
  - [ ] Add validation: `SCALE_10`, `SCALE_4`, `PASS_FAIL` only

- [ ] **CRITICAL:** Sửa `CourseOfferingDTO.java`
  - [ ] Thêm field: `private String gradingScale;`
  - [ ] Thêm getter/setter

- [ ] Update database migration (nếu có)
  - [ ] Add column: `grading_scale VARCHAR(50) DEFAULT 'SCALE_10'`

**Acceptance Criteria:**
- ✅ Field có default value "SCALE_10"
- ✅ Not nullable
- ✅ DTO có field tương ứng
- ✅ Validation constraints có sẵn

**Commit Message:**
```
feat(entity): add gradingScale field to CourseOffering entity
```

---

## 🟠 PHASE 3: TÍCH HỢP LOGIC VÀO SERVICE (Ngày 2-3 - ~1 giờ)

### 3.1 Cập Nhật EnrollmentService
- [ ] **CRITICAL:** Inject `GradingStrategyFactory`
  ```java
  @Autowired
  private GradingStrategyFactory strategyFactory;
  ```

- [ ] **CRITICAL:** Tạo/Cập nhật method `submitFinalGrade(Long enrollmentId)`
  - [ ] Validate enrollment exists
  - [ ] Get CourseOffering: `enrollment.getCourseOffering()`
  - [ ] Get grading scale: `offering.getGradingScale()`
  - [ ] Get strategy: `strategy = strategyFactory.getStrategy(gradingScale)`
  - [ ] Fetch leaf grade entries: `gradeEntryService.getLeafEntries(enrollmentId)`
  - [ ] Extract scores & weights từ GradeEntry list
  - [ ] Apply strategy: `finalScore = strategy.calculate(scores, weights)`
  - [ ] Store result:
    - `enrollment.setFinalScore(finalScore)`
    - `enrollment.setGpaValue(finalScore)` (hoặc adjust nếu strategy khác)
  - [ ] Save to database: `enrollmentRepository.save(enrollment)`
  - [ ] Trigger Observer Pattern (hook cho Member 3)

- [ ] **Thêm helper method:** `calculateLetterGrade(double score)`
  - [ ] Convert 10-point scale → letter grade (A, B+, B, C+, C, D+, D, F)
  - [ ] Store vào `enrollment.setLetterGrade(letterGrade)`

- [ ] Add error handling:
  - [ ] Try-catch InvalidArgumentException
  - [ ] Log errors with context
  - [ ] Provide meaningful exception messages

- [ ] Add JavaDoc với examples

**Acceptance Criteria:**
- ✅ Factory được sử dụng (không if-else)
- ✅ Score được aggregate từ GradeEntry tree
- ✅ Strategy được áp dụng correctly
- ✅ Result được lưu vào Enrollment
- ✅ Error handling có sẵn
- ✅ Observer hook được gọi

**Commit Message:**
```
refactor(service): integrate GradingStrategyFactory into EnrollmentService
```

---

### 3.2 Cập Nhật GradeEntryService (Hỗ Trợ Composite)
- [ ] Verify method `calculateAggregatedScore(GradeEntry entry)` đã đúng:
  - [ ] Leaf entries: return stored score
  - [ ] Composite entries: recursive calculation
  - [ ] All scores on 10-point scale
  - [ ] Round to 2 decimal places

- [ ] Verify method `getLeafEntriesForEnrollment(Long enrollmentId)`:
  - [ ] Returns only leaf entries (no children)
  - [ ] Ordered by name/weight
  - [ ] Not null check

- [ ] Verify method `getRootEntriesWithChildren(Long enrollmentId)`:
  - [ ] Returns root entries with nested children
  - [ ] DTOs have children populated
  - [ ] Recursive structure preserved

- [ ] Add validation method `validateCompositeStructure(GradeEntry entry)`:
  - [ ] For composite: sum of children weights ≤ 1.0
  - [ ] For leaf: score ∈ [0, 10]
  - [ ] Throw exception if invalid

**Status:** Should already be ✅ DONE

---

## 🟡 PHASE 4: VALIDATION & BUSINESS RULES (Ngày 3 - ~30 phút)

### 4.1 Kiểm Tra & Enforce Business Rules trong Entities
- [x] ✅ `GradeEntry.score` validation:
  - [x] `@DecimalMin(0.0)` ✓
  - [x] `@DecimalMax(10.0)` ✓

- [x] ✅ `GradeEntry.weight` validation:
  - [x] `@DecimalMin(0.0)` ✓
  - [x] `@DecimalMax(1.0)` ✓

- [x] ✅ `Enrollment.finalScore` validation:
  - [x] `@DecimalMin(0.0)` ✓
  - [x] `@DecimalMax(10.0)` ✓

- [x] ✅ `Enrollment.gpaValue` validation:
  - [x] `@DecimalMin(0.0)` ✓
  - [x] `@DecimalMax(4.0)` ✓

**Status:** ✅ HOÀN THÀNH

---

### 4.2 Thêm Custom Validation Annotations (Nếu Cần)
- [ ] Create `@ValidGradingScale` annotation (optional)

**Status:** Optional

---

## 🟢 PHASE 5: TESTING (Ngày 4-5 - ~1.5 giờ) 🟡 MEDIUM PRIORITY

### 5.1 Unit Tests cho Strategy Pattern
- [ ] Create `GradingStrategyFactoryTest.java`
  - [ ] Test strategy retrieval for each type
  - [ ] Test null/invalid input handling

- [ ] Create `Scale10StrategyTest.java`
  - [ ] Test weighted average calculation
  - [ ] Test boundary values (0.0, 10.0)

- [ ] Create `Scale4StrategyTest.java`
  - [ ] Test scale conversion accuracy

- [ ] Create `PassFailStrategyTest.java`
  - [ ] Test pass/fail logic

---

### 5.2 Unit Tests cho Composite Pattern
- [ ] Create `CompositeGradeCalculationTest.java`
  - [ ] Test nested structures
  - [ ] Test recursive aggregation

- [ ] Create `GradeEntryServiceTest.java`
  - [ ] Test score calculation methods

---

### 5.3 Integration Tests
- [ ] Create `GradingIntegrationTest.java`
  - [ ] End-to-end grading flow test

---

## 🔵 PHASE 6: DOCUMENTATION & COORDINATION (Ngày 5 - ~30 phút)

### 6.1 Update Javadoc & Comments
- [ ] Update all pattern documentation
- [ ] Add usage examples
- [ ] Explain design decisions

---

### 6.2 Team Coordination & Handoff
- [ ] **Sync with Member 1:** Entity & DB schema
- [ ] **Sync with Member 3:** Observer integration
- [ ] Create coordination document

---

## ✅ FINAL CHECKLIST (Before Merge)

### Code Quality
- [ ] ✅ No if-else grading logic outside Factory
- [ ] ✅ All strategy implementations are stateless
- [ ] ✅ Composite pattern correctly implemented
- [ ] ✅ No circular dependencies

### Design Patterns
- [ ] ✅ Strategy Pattern clearly visible & used
- [ ] ✅ Composite Pattern correctly implemented
- [ ] ✅ Factory Pattern properly applied
- [ ] ✅ SOLID principles respected

### Business Logic
- [ ] ✅ GPA calculation correct
- [ ] ✅ Grade aggregation recursive & correct
- [ ] ✅ Validation rules enforced
- [ ] ✅ Observer integration complete

### Repository & Commits
- [ ] ✅ All changes on `huutuan` branch
- [ ] ✅ Commit messages follow Conventional Commits
- [ ] ✅ Tests passing

---

## 📊 COMMIT PLAN

| # | Commit | Priority | Est. Time |
|---|--------|----------|-----------|
| 1 | `feat(strategy): implement GradingStrategyFactory` | 🔴 P0 | 20m |
| 2 | `feat(entity): add gradingScale field to CourseOffering` | 🔴 P0 | 15m |
| 3 | `refactor(service): integrate GradingStrategyFactory into EnrollmentService` | 🔴 P0 | 30m |
| 4 | `test(grading): add unit & integration tests` | 🟡 P1 | 90m |

---

## 📈 PROGRESS TRACKING

| # | Phase | Status | Time |
|---|-------|--------|------|
| 1 | Strategy Review | ✅ DONE | 30m |
| 2 | Composite Review | ✅ DONE | 30m |
| 3 | Identify Changes | ⏳ IN PROGRESS | 30m |
| 4 | Factory Implementation | ⏳ TODO | 20m |
| 5 | CourseOffering Update | ⏳ TODO | 15m |
| 6 | Service Integration | ⏳ TODO | 30m |
| 7 | Testing | 🟡 OPTIONAL | 90m |
| 8 | Documentation | 🟡 TODO | 30m |

---

## 🎯 SUCCESS CRITERIA

✅ **Must Complete:**
- [ ] GradingStrategyFactory created & working
- [ ] CourseOffering.gradingScale added
- [ ] EnrollmentService using Factory
- [ ] All existing tests passing
- [ ] No regression

🟡 **Should Complete (If Time):**
- [ ] Unit tests implemented
- [ ] Complete JavaDoc
- [ ] Team coordination done

---

## 📞 DEPENDENCIES

| Role | Person | Sync Point |
|------|--------|-----------|
| Database Engineer | Member 1 | Entity mappings, DB schema |
| Observer Engineer | Member 3 | Observer hook, alert flow |
| Project Manager | Manager | Progress updates |

---

## 🔗 RELATED DOCUMENTS

- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)
- [PROJECT_STRUCTURE_MEMBER2_CHECK.md](../PROJECT_STRUCTURE_MEMBER2_CHECK.md)
- [ERD.md](./agents/ERD.md)
- [TECH_STACK.md](./agents/TECH_STACK.md)

---

## 📝 DESIGN DECISIONS

### 1. Tại Sao Factory Pattern?
- Centralize strategy selection
- Easy to add new strategies
- Decouple service from implementation

### 2. Tại Sao Composite Pattern?
- Support nested hierarchies (Lab → Quiz1, Quiz2)
- Recursive calculation
- Real-world grading structures

### 3. Validation Strategy
- Entity level: @Constraints
- Service level: Business rules
- Factory level: Type validation

---

## ⚠️ POTENTIAL ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| Invalid gradingScale in DB | Validation in service + fallback to SCALE_10 |
| Changing strategy mid-semester | Document as not allowed + add check |
| Backward compatibility | Backfill old records with SCALE_10 |

---

## ✨ FUTURE IMPROVEMENTS

- [ ] Custom grading scale (UI-defined)
- [ ] Grade scale versioning
- [ ] Partial/Draft grade submission
- [ ] Grade appeal workflow
- [ ] Retroactive GPA recalculation

---

*Last Updated: 2026-01-15*  
*Version: 2.0*  
*Author: Logic Engineer (Member 2)*
