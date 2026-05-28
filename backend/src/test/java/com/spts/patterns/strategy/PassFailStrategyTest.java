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
 * Unit tests for PassFailStrategy (binary pass/fail grading).
 * Tests pass/fail logic with threshold of 5.0.
 * 
 * @author Member2 - Logic Engineer
 */
class PassFailStrategyTest {

    private PassFailStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new PassFailStrategy();
    }

    // ==================== Metadata Tests ====================

    @Test
    @DisplayName("Should return correct strategy name")
    void testGetStrategyName() {
        assertEquals("Pass/Fail", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should return max grade of 1.0")
    void testGetMaxGrade() {
        assertEquals(1.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should return passing grade of 1.0")
    void testGetPassingGrade() {
        assertEquals(1.0, strategy.getPassingGrade());
    }

    // ==================== Calculate Tests (Returns 1.0 or 0.0)
    // ====================

    @Test
    @DisplayName("Should return 1.0 (Pass) for score >= 5.0")
    void testCalculatePass() {
        List<Double> scores = Arrays.asList(5.0);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(1.0, strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should return 0.0 (Fail) for score < 5.0")
    void testCalculateFail() {
        List<Double> scores = Arrays.asList(4.9);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(0.0, strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should calculate weighted average then determine pass/fail")
    void testCalculateWeightedThenPassFail() {
        // 6*0.5 + 4*0.5 = 5.0 -> Pass
        List<Double> scores = Arrays.asList(6.0, 4.0);
        List<Double> weights = Arrays.asList(0.5, 0.5);
        assertEquals(1.0, strategy.calculate(scores, weights));

        // 4*0.5 + 4*0.5 = 4.0 -> Fail
        List<Double> scores2 = Arrays.asList(4.0, 4.0);
        assertEquals(0.0, strategy.calculate(scores2, weights));
    }

    @Test
    @DisplayName("Should pass on perfect score")
    void testPerfectScore() {
        List<Double> scores = Arrays.asList(10.0);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(1.0, strategy.calculate(scores, weights));
    }

    @Test
    @DisplayName("Should fail on zero score")
    void testZeroScore() {
        List<Double> scores = Arrays.asList(0.0);
        List<Double> weights = Arrays.asList(1.0);
        assertEquals(0.0, strategy.calculate(scores, weights));
    }

    // ==================== GPA Tests ====================

    @ParameterizedTest
    @CsvSource({
            "10.0, 1.0",
            "7.5, 1.0",
            "5.0, 1.0",
            "4.9, 0.0",
            "0.0, 0.0"
    })
    @DisplayName("Should return 1.0 GPA for pass, 0.0 for fail")
    void testCalculateGpa(double score, double expectedGpa) {
        assertEquals(expectedGpa, strategy.calculateGpa(score));
    }

    @Test
    @DisplayName("Should return 0.0 GPA for null score")
    void testCalculateGpaNull() {
        assertEquals(0.0, strategy.calculateGpa(null));
    }

    // ==================== Letter Grade Tests ====================

    @Test
    @DisplayName("Should return P for passing scores")
    void testLetterGradePass() {
        assertEquals("P", strategy.calculateLetterGrade(5.0));
        assertEquals("P", strategy.calculateLetterGrade(10.0));
        assertEquals("P", strategy.calculateLetterGrade(7.5));
    }

    @Test
    @DisplayName("Should return F for failing scores")
    void testLetterGradeFail() {
        assertEquals("F", strategy.calculateLetterGrade(4.9));
        assertEquals("F", strategy.calculateLetterGrade(0.0));
        assertEquals("F", strategy.calculateLetterGrade(null));
    }

    // ==================== isPassing Tests ====================

    @Test
    @DisplayName("Should return true for scores >= 5.0")
    void testIsPassingTrue() {
        assertTrue(strategy.isPassing(5.0));
        assertTrue(strategy.isPassing(5.1));
        assertTrue(strategy.isPassing(10.0));
    }

    @Test
    @DisplayName("Should return false for scores < 5.0")
    void testIsPassingFalse() {
        assertFalse(strategy.isPassing(4.9));
        assertFalse(strategy.isPassing(0.0));
        assertFalse(strategy.isPassing(null));
    }

    // ==================== Validation Tests ====================

    @Test
    @DisplayName("Should throw exception for invalid inputs")
    void testValidation() {
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(null, Arrays.asList(1.0)));
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(Arrays.asList(5.0), null));
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(Arrays.asList(), Arrays.asList()));
    }

    @Test
    @DisplayName("Should throw exception when weights don't sum to 1")
    void testInvalidWeightSum() {
        List<Double> scores = Arrays.asList(8.0, 7.0);
        List<Double> weights = Arrays.asList(0.3, 0.3);
        assertThrows(IllegalArgumentException.class, () -> strategy.calculate(scores, weights));
    }
}
