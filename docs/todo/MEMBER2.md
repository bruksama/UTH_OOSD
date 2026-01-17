# MEMBER2 - Logic Engineer

## ROLE
Logic Engineer - Strategy Pattern, Composite Pattern, Unit Tests for calculation algorithms

## CURRENT STATE

### Strategy Pattern
- [x] IGradingStrategy interface EXISTS but INCOMPLETE
  - Has: calculate(List scores, List weights), getStrategyName(), getMaxGrade(), getPassingGrade()
  - MISSING: calculateGpa(Double), calculateLetterGrade(Double), isPassing(Double)
- [x] Scale10Strategy EXISTS - weighted average calculation works
- [x] Scale4Strategy EXISTS - weighted average calculation works
- [x] PassFailStrategy EXISTS - pass/fail logic works
- [x] GradingStrategyFactory EXISTS - returns correct strategy by name
- [x] CourseOffering.gradingScale field ADDED
- [x] CourseOfferingDTO.gradingScale field ADDED
- [x] CourseOfferingService handles gradingScale DONE
- [ ] EnrollmentService integration BROKEN - calls methods that dont exist on interface

### Composite Pattern
- [x] GradeEntry entity has parent/children self-reference
- [x] GradeEntry.getCalculatedScore() recursive calculation works
- [x] GradeEntry.calculateWeightedScore() works
- [x] GradeEntryService.calculateFinalGrade() aggregates from root entries
- [x] GradeEntryService.getHierarchicalGrades() returns nested structure
- [x] GradeEntryService.validateWeights() checks sum equals 1.0

### Unit Tests
- [ ] NOT STARTED - No test files exist for patterns

---

## TASK 1: Fix Strategy Pattern Interface
Priority: CRITICAL - EnrollmentService wont compile without this

### 1.1 Update IGradingStrategy.java

Location: backend/src/main/java/com/spts/patterns/strategy/IGradingStrategy.java

ADD these methods to the interface:

```java
/**
 * Calculate GPA value from a raw score.
 * 
 * @param score Raw score (typically 0-10 scale)
 * @return GPA value according to this strategy scale
 */
double calculateGpa(Double score);

/**
 * Calculate letter grade from a raw score.
 * 
 * @param score Raw score (typically 0-10 scale)
 * @return Letter grade (A, B+, B, C+, C, D, F, or P/F)
 */
String calculateLetterGrade(Double score);

/**
 * Check if a score is passing according to this strategy.
 * 
 * @param score Raw score to check
 * @return true if score meets or exceeds passing threshold
 */
boolean isPassing(Double score);
```

### 1.2 Update Scale10Strategy.java

Location: backend/src/main/java/com/spts/patterns/strategy/Scale10Strategy.java

ADD these method implementations:

```java
@Override
public double calculateGpa(Double score) {
    if (score == null) return 0.0;
    // Vietnamese 10-point to 4-point GPA conversion
    if (score >= 9.0) return 4.0;
    if (score >= 8.5) return 3.7;
    if (score >= 8.0) return 3.5;
    if (score >= 7.0) return 3.0;
    if (score >= 6.5) return 2.5;
    if (score >= 5.5) return 2.0;
    if (score >= 5.0) return 1.5;
    if (score >= 4.0) return 1.0;
    return 0.0;
}

@Override
public String calculateLetterGrade(Double score) {
    if (score == null) return "F";
    if (score >= 9.0) return "A";
    if (score >= 8.5) return "A-";
    if (score >= 8.0) return "B+";
    if (score >= 7.0) return "B";
    if (score >= 6.5) return "C+";
    if (score >= 5.5) return "C";
    if (score >= 5.0) return "D+";
    if (score >= 4.0) return "D";
    return "F";
}

@Override
public boolean isPassing(Double score) {
    return score != null && score >= PASSING_GRADE;
}
```

### 1.3 Update Scale4Strategy.java

Location: backend/src/main/java/com/spts/patterns/strategy/Scale4Strategy.java

ADD these method implementations:

```java
@Override
public double calculateGpa(Double score) {
    if (score == null) return 0.0;
    // Already on 4-point scale, just validate and return
    return Math.min(Math.max(score, 0.0), 4.0);
}

@Override
public String calculateLetterGrade(Double score) {
    if (score == null) return "F";
    if (score >= 4.0) return "A";
    if (score >= 3.7) return "A-";
    if (score >= 3.3) return "B+";
    if (score >= 3.0) return "B";
    if (score >= 2.7) return "C+";
    if (score >= 2.0) return "C";
    if (score >= 1.0) return "D";
    return "F";
}

@Override
public boolean isPassing(Double score) {
    return score != null && score >= PASSING_GRADE;
}
```

### 1.4 Update PassFailStrategy.java

Location: backend/src/main/java/com/spts/patterns/strategy/PassFailStrategy.java

ADD these method implementations:

```java
@Override
public double calculateGpa(Double score) {
    // Pass/Fail typically doesnt affect GPA, return 0 or passing grade
    return isPassing(score) ? PASSING_GRADE : 0.0;
}

@Override
public String calculateLetterGrade(Double score) {
    return isPassing(score) ? "P" : "F";
}

@Override
public boolean isPassing(Double score) {
    return score != null && score >= PASSING_GRADE;
}
```

### Verification for Task 1
```bash
cd backend && mvn compile -q
```
Must compile without errors.

---

## TASK 2: Verify Composite Pattern Works
Priority: HIGH

The Composite Pattern is already implemented in GradeEntry and GradeEntryService. Verify it works correctly.

### 2.1 Manual Verification Steps

1. Read GradeEntry.java and verify:
   - parent field with @ManyToOne to self
   - children field with @OneToMany mappedBy parent
   - getCalculatedScore() method calculates recursively
   - calculateWeightedScore() method works

2. Read GradeEntryService.java and verify:
   - calculateFinalGrade(enrollmentId) aggregates root entries
   - getHierarchicalGrades(enrollmentId) returns nested DTOs
   - addChildGradeEntry() creates child under parent
   - validateWeights() checks weights sum to 1.0

### 2.2 Composite Pattern Test Scenario

Create this test data mentally or via API:

```
Enrollment for Student A in Course X
  |
  +-- Midterm (weight: 0.3, score: 8.0)
  |
  +-- Final (weight: 0.4, score: 7.5)
  |
  +-- Lab (weight: 0.3, score: null) [COMPOSITE]
       |
       +-- Quiz1 (weight: 0.4, score: 9.0)
       +-- Quiz2 (weight: 0.3, score: 8.5)
       +-- Assignment (weight: 0.3, score: 8.0)

Expected Lab calculated score: 9.0*0.4 + 8.5*0.3 + 8.0*0.3 = 3.6 + 2.55 + 2.4 = 8.55
Expected Final grade: 8.0*0.3 + 7.5*0.4 + 8.55*0.3 = 2.4 + 3.0 + 2.565 = 7.965
```

---

## TASK 3: Unit Tests for Strategy Pattern
Priority: HIGH - Required by project charter

### 3.1 Create GradingStrategyFactoryTest.java

Location: backend/src/test/java/com/spts/patterns/strategy/GradingStrategyFactoryTest.java

```java
package com.spts.patterns.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

class GradingStrategyFactoryTest {

    private GradingStrategyFactory factory;

    @BeforeEach
    void setUp() {
        factory = new GradingStrategyFactory();
    }

    @Test
    @DisplayName("Should return Scale10Strategy for SCALE_10")
    void testGetScale10Strategy() {
        IGradingStrategy strategy = factory.getStrategy("SCALE_10");
        assertNotNull(strategy);
        assertTrue(strategy instanceof Scale10Strategy);
        assertEquals(10.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should return Scale4Strategy for SCALE_4")
    void testGetScale4Strategy() {
        IGradingStrategy strategy = factory.getStrategy("SCALE_4");
        assertNotNull(strategy);
        assertTrue(strategy instanceof Scale4Strategy);
        assertEquals(4.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should return PassFailStrategy for PASS_FAIL")
    void testGetPassFailStrategy() {
        IGradingStrategy strategy = factory.getStrategy("PASS_FAIL");
        assertNotNull(strategy);
        assertTrue(strategy instanceof PassFailStrategy);
    }

    @Test
    @DisplayName("Should be case insensitive")
    void testCaseInsensitive() {
        assertNotNull(factory.getStrategy("scale_10"));
        assertNotNull(factory.getStrategy("Scale_10"));
        assertNotNull(factory.getStrategy("SCALE_10"));
    }

    @Test
    @DisplayName("Should throw exception for null input")
    void testNullInput() {
        assertThrows(IllegalArgumentException.class, () -> factory.getStrategy(null));
    }

    @Test
    @DisplayName("Should throw exception for empty input")
    void testEmptyInput() {
        assertThrows(IllegalArgumentException.class, () -> factory.getStrategy(""));
        assertThrows(IllegalArgumentException.class, () -> factory.getStrategy("   "));
    }

    @Test
    @DisplayName("Should throw exception for unknown scale")
    void testUnknownScale() {
        assertThrows(IllegalArgumentException.class, () -> factory.getStrategy("SCALE_100"));
    }
}
```

### 3.2 Create Scale10StrategyTest.java

Location: backend/src/test/java/com/spts/patterns/strategy/Scale10StrategyTest.java

```java
package com.spts.patterns.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class Scale10StrategyTest {

    private Scale10Strategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new Scale10Strategy();
    }

    @Test
    @DisplayName("Should return correct strategy metadata")
    void testMetadata() {
        assertEquals(10.0, strategy.getMaxGrade());
        assertEquals(4.0, strategy.getPassingGrade());
        assertEquals("Scale 10 (Vietnamese Standard)", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should calculate weighted average correctly")
    void testCalculateWeightedAverage() {
        List<Double> scores = Arrays.asList(8.0, 7.0, 9.0);
        List<Double> weights = Arrays.asList(0.3, 0.4, 0.3);
        // Expected: 8*0.3 + 7*0.4 + 9*0.3 = 2.4 + 2.8 + 2.7 = 7.9
        assertEquals(7.9, strategy.calculate(scores, weights), 0.01);
    }

    @ParameterizedTest
    @CsvSource({
        "10.0, 4.0, A",
        "9.0, 4.0, A",
        "8.5, 3.7, A-",
        "8.0, 3.5, B+",
        "7.0, 3.0, B",
        "6.5, 2.5, C+",
        "5.5, 2.0, C",
        "5.0, 1.5, D+",
        "4.0, 1.0, D",
        "3.9, 0.0, F",
        "0.0, 0.0, F"
    })
    @DisplayName("Should calculate GPA and letter grade correctly")
    void testGpaAndLetterGrade(double score, double expectedGpa, String expectedLetter) {
        assertEquals(expectedGpa, strategy.calculateGpa(score), 0.01);
        assertEquals(expectedLetter, strategy.calculateLetterGrade(score));
    }

    @Test
    @DisplayName("Should determine passing correctly")
    void testIsPassing() {
        assertTrue(strategy.isPassing(4.0));
        assertTrue(strategy.isPassing(10.0));
        assertFalse(strategy.isPassing(3.9));
        assertFalse(strategy.isPassing(0.0));
        assertFalse(strategy.isPassing(null));
    }

    @Test
    @DisplayName("Should throw exception for mismatched list sizes")
    void testMismatchedSizes() {
        List<Double> scores = Arrays.asList(8.0, 7.0);
        List<Double> weights = Arrays.asList(0.5, 0.3, 0.2);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception when weights dont sum to 1")
    void testInvalidWeightSum() {
        List<Double> scores = Arrays.asList(8.0, 7.0);
        List<Double> weights = Arrays.asList(0.3, 0.3); // Sum = 0.6
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception for out of range scores")
    void testOutOfRangeScores() {
        List<Double> scores = Arrays.asList(8.0, 11.0); // 11 is out of range
        List<Double> weights = Arrays.asList(0.5, 0.5);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }
}
```

### 3.3 Create Scale4StrategyTest.java

Location: backend/src/test/java/com/spts/patterns/strategy/Scale4StrategyTest.java

Similar structure to Scale10StrategyTest but with 4-point scale values.

### 3.4 Create PassFailStrategyTest.java

Location: backend/src/test/java/com/spts/patterns/strategy/PassFailStrategyTest.java

Test pass/fail specific logic.

### Verification for Task 3
```bash
cd backend && mvn test -Dtest=*StrategyTest
```
All tests must pass.

---

## TASK 4: Unit Tests for Composite Pattern
Priority: MEDIUM

### 4.1 Create GradeEntryCompositeTest.java

Location: backend/src/test/java/com/spts/entity/GradeEntryCompositeTest.java

Test the Composite Pattern methods in GradeEntry entity:
- isLeaf() returns true when no children
- isRoot() returns true when no parent
- getCalculatedScore() for leaf returns direct score
- getCalculatedScore() for composite calculates from children
- calculateWeightedScore() applies weight correctly
- addChild() properly sets parent reference

### 4.2 Create GradeEntryServiceTest.java

Location: backend/src/test/java/com/spts/service/GradeEntryServiceTest.java

Test service methods with mocked repositories:
- calculateFinalGrade() aggregates correctly
- validateWeights() returns true when sum is 1.0
- validateWeights() returns false when sum is not 1.0
- getHierarchicalGrades() returns nested structure

---

## EXECUTION ORDER

```
1. Read IGradingStrategy.java - understand current interface
2. Add new methods to IGradingStrategy.java
3. Implement methods in Scale10Strategy.java
4. Implement methods in Scale4Strategy.java
5. Implement methods in PassFailStrategy.java
6. Compile: mvn compile -q
7. Create test directory if needed
8. Create GradingStrategyFactoryTest.java
9. Create Scale10StrategyTest.java
10. Run tests: mvn test -Dtest=*StrategyTest
11. Fix any failures
12. Create remaining test files
```

---

## SUCCESS CRITERIA

- [ ] IGradingStrategy has calculateGpa, calculateLetterGrade, isPassing methods
- [ ] All 3 strategy implementations have these methods
- [ ] Backend compiles without errors
- [ ] GradingStrategyFactoryTest passes (7+ tests)
- [ ] Scale10StrategyTest passes (8+ tests)
- [ ] Scale4StrategyTest passes
- [ ] PassFailStrategyTest passes
- [ ] EnrollmentService.completeEnrollmentWithStrategy() works

---

## FILES TO CREATE

```
backend/src/test/java/com/spts/patterns/strategy/
  GradingStrategyFactoryTest.java
  Scale10StrategyTest.java
  Scale4StrategyTest.java
  PassFailStrategyTest.java

backend/src/test/java/com/spts/entity/
  GradeEntryCompositeTest.java

backend/src/test/java/com/spts/service/
  GradeEntryServiceTest.java
```

## FILES TO MODIFY

```
backend/src/main/java/com/spts/patterns/strategy/
  IGradingStrategy.java - add 3 new methods
  Scale10Strategy.java - implement 3 new methods
  Scale4Strategy.java - implement 3 new methods
  PassFailStrategy.java - implement 3 new methods
```

---

## DO NOT

- Change the calculate(List, List) method signature
- Remove existing methods from interface
- Modify entity classes (GradeEntry is already correct)
- Modify service classes (GradeEntryService is already correct)
- Add database access to strategy classes

## DEPENDENCIES

- Requires: Entity layer complete (done)
- Blocks: EnrollmentService strategy integration (currently broken)
- Provides to: MEMBER3 can call strategies for grade calculation

---
Last Updated: 2026-01-17
