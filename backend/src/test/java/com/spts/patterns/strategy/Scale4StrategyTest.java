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
 * Unit tests for Scale4Strategy (US 4-point GPA scale).
 * Tests conversion from 10-point to 4-point scale.
 * 
 * @author Member2 - Logic Engineer
 */
class Scale4StrategyTest {

    private Scale4Strategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new Scale4Strategy();
    }

    // ==================== Metadata Tests ====================

    @Test
    @DisplayName("Should return correct strategy name")
    void testGetStrategyName() {
        assertEquals("Scale 4 (US GPA Standard)", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should return correct max grade (4.0)")
    void testGetMaxGrade() {
        assertEquals(4.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should return correct passing grade (1.0)")
    void testGetPassingGrade() {
        assertEquals(1.0, strategy.getPassingGrade());
    }

    // ==================== Calculation Tests (Converts to 4-point)
    // ====================

    @Test
    @DisplayName("Should convert weighted average to 4-point scale")
    void testCalculateConvertsTo4Point() {
        // Score 8.5 on 10-point should convert to 3.7 on 4-point
        List<Double> scores = Arrays.asList(8.5);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(3.7, strategy.calculate(scores, weights), 0.01);
    }

    @Test
    @DisplayName("Should calculate then convert weighted average")
    void testCalculateWeightedThenConvert() {
        // 9.0*0.5 + 8.0*0.5 = 8.5 -> converts to 3.7
        List<Double> scores = Arrays.asList(9.0, 8.0);
        List<Double> weights = Arrays.asList(0.5, 0.5);
        assertEquals(3.7, strategy.calculate(scores, weights), 0.01);
    }

    @Test
    @DisplayName("Should return 4.0 for perfect scores")
    void testPerfectScore() {
        List<Double> scores = Arrays.asList(10.0);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(4.0, strategy.calculate(scores, weights), 0.01);
    }

    // ==================== GPA Calculation Tests ====================

    @ParameterizedTest
    @CsvSource({
            "10.0, 4.0",
            "9.0, 4.0",
            "8.5, 3.7",
            "8.0, 3.5",
            "7.0, 3.0",
            "6.5, 2.5",
            "5.5, 2.0",
            "5.0, 1.5",
            "4.0, 1.0",
            "3.9, 0.0"
    })
    @DisplayName("Should calculate GPA from 10-point score")
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
            "9.0, A",
            "8.5, A-",
            "8.0, B+",
            "7.0, B",
            "6.5, C+",
            "5.5, C",
            "5.0, D+",
            "4.0, D",
            "3.9, F"
    })
    @DisplayName("Should calculate letter grade from 10-point score")
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
    @DisplayName("Should return true for passing scores (>= 4.0 on 10-point)")
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
        List<Double> weights = Arrays.asList(0.5);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception when weights don't sum to 1")
    void testInvalidWeightSum() {
        List<Double> scores = Arrays.asList(8.0, 7.0);
        List<Double> weights = Arrays.asList(0.3, 0.3);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should throw exception for out of range scores")
    void testOutOfRangeScores() {
        List<Double> scores = Arrays.asList(11.0);
        List<Double> weights = Arrays.asList(1.0);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }
}
