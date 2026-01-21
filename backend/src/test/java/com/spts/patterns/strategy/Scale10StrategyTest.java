package com.spts.patterns.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Scale10Strategy (Vietnamese 10-point scale).
 * Tests weighted average calculation, GPA conversion, and letter grades.
 * 
 * @author Member2 - Logic Engineer
 */
class Scale10StrategyTest {

    private Scale10Strategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new Scale10Strategy();
    }

    // ==================== Metadata Tests ====================

    @Test
    @DisplayName("Should return correct strategy name")
    void testGetStrategyName() {
        assertEquals("Scale 10 (Vietnamese Standard)", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should return correct max grade")
    void testGetMaxGrade() {
        assertEquals(10.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should return correct passing grade")
    void testGetPassingGrade() {
        assertEquals(4.0, strategy.getPassingGrade());
    }

    // ==================== Weighted Average Calculation Tests ====================

    @Test
    @DisplayName("Should calculate weighted average correctly")
    void testCalculateWeightedAverage() {
        List<Double> scores = Arrays.asList(8.0, 7.0, 9.0);
        List<Double> weights = Arrays.asList(0.3, 0.4, 0.3);
        // Expected: 8*0.3 + 7*0.4 + 9*0.3 = 2.4 + 2.8 + 2.7 = 7.9
        assertEquals(7.9, strategy.calculate(scores, weights), 0.01);
    }

    @Test
    @DisplayName("Should calculate simple average when equal weights")
    void testCalculateSimpleAverage() {
        List<Double> scores = Arrays.asList(8.0, 9.0);
        List<Double> weights = Arrays.asList(0.5, 0.5);
        // Expected: 8*0.5 + 9*0.5 = 8.5
        assertEquals(8.5, strategy.calculate(scores, weights), 0.01);
    }

    @Test
    @DisplayName("Should handle single score correctly")
    void testSingleScore() {
        List<Double> scores = Arrays.asList(7.5);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(7.5, strategy.calculate(scores, weights), 0.01);
    }

    // ==================== GPA Conversion Tests ====================

    @ParameterizedTest
    @CsvSource({
            "10.0, 4.0",
            "9.5, 4.0",
            "9.0, 4.0",
            "8.5, 3.7",
            "8.0, 3.5",
            "7.5, 3.0",
            "7.0, 3.0",
            "6.5, 2.5",
            "6.0, 2.0",
            "5.5, 2.0",
            "5.0, 1.5",
            "4.5, 1.0",
            "4.0, 1.0",
            "3.9, 0.0",
            "0.0, 0.0"
    })
    @DisplayName("Should convert score to GPA correctly")
    void testCalculateGpa(double score, double expectedGpa) {
        assertEquals(expectedGpa, strategy.calculateGpa(score), 0.01);
    }

    @Test
    @DisplayName("Should return 0.0 GPA for null score")
    void testCalculateGpaNull() {
        assertEquals(0.0, strategy.calculateGpa(null));
    }

    // ==================== Letter Grade Tests ====================

    @ParameterizedTest
    @CsvSource({
            "10.0, A",
            "9.0, A",
            "8.5, A-",
            "8.0, B+",
            "7.5, B",
            "7.0, B",
            "6.5, C+",
            "6.0, C",
            "5.5, C",
            "5.0, D+",
            "4.5, D",
            "4.0, D",
            "3.9, F",
            "0.0, F"
    })
    @DisplayName("Should convert score to letter grade correctly")
    void testCalculateLetterGrade(double score, String expectedGrade) {
        assertEquals(expectedGrade, strategy.calculateLetterGrade(score));
    }

    @Test
    @DisplayName("Should return F for null score")
    void testCalculateLetterGradeNull() {
        assertEquals("F", strategy.calculateLetterGrade(null));
    }

    // ==================== isPassing Tests ====================

    @Test
    @DisplayName("Should return true for passing scores")
    void testIsPassingTrue() {
        assertTrue(strategy.isPassing(4.0));
        assertTrue(strategy.isPassing(5.0));
        assertTrue(strategy.isPassing(10.0));
    }

    @Test
    @DisplayName("Should return false for failing scores")
    void testIsPassingFalse() {
        assertFalse(strategy.isPassing(3.9));
        assertFalse(strategy.isPassing(0.0));
        assertFalse(strategy.isPassing(null));
    }

    // ==================== Validation Tests ====================

    @Test
    @DisplayName("Should throw exception for mismatched list sizes")
    void testMismatchedSizes() {
        List<Double> scores = Arrays.asList(8.0, 7.0);
        List<Double> weights = Arrays.asList(0.5, 0.3, 0.2);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception when weights don't sum to 1")
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

    @Test
    @DisplayName("Should throw exception for negative scores")
    void testNegativeScores() {
        List<Double> scores = Arrays.asList(8.0, -1.0);
        List<Double> weights = Arrays.asList(0.5, 0.5);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception for null lists")
    void testNullLists() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(null, Arrays.asList(1.0)));
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(Arrays.asList(8.0), null));
    }

    @Test
    @DisplayName("Should throw exception for empty lists")
    void testEmptyLists() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(Arrays.asList(), Arrays.asList()));
    }
}
