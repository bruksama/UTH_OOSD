package com.spts.patterns.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GradingStrategyFactory.
 * Tests that the factory returns correct strategy implementations.
 * 
 * @author Member2 - Logic Engineer
 */
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
        assertInstanceOf(Scale10Strategy.class, strategy);
        assertEquals(10.0, strategy.getMaxGrade());
        assertEquals("Scale 10 (Vietnamese Standard)", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should return Scale4Strategy for SCALE_4")
    void testGetScale4Strategy() {
        IGradingStrategy strategy = factory.getStrategy("SCALE_4");

        assertNotNull(strategy);
        assertInstanceOf(Scale4Strategy.class, strategy);
        assertEquals(4.0, strategy.getMaxGrade());
        assertEquals("Scale 4 (US GPA Standard)", strategy.getStrategyName());
    }

    @Test
    @DisplayName("Should return PassFailStrategy for PASS_FAIL")
    void testGetPassFailStrategy() {
        IGradingStrategy strategy = factory.getStrategy("PASS_FAIL");

        assertNotNull(strategy);
        assertInstanceOf(PassFailStrategy.class, strategy);
        assertEquals(1.0, strategy.getMaxGrade());
        assertEquals("Pass/Fail", strategy.getStrategyName());
    }

    // ==================== Case Insensitivity Tests ====================

    @Test
    @DisplayName("Should be case insensitive - lowercase")
    void testCaseInsensitive_lowercase() {
        IGradingStrategy strategy = factory.getStrategy("scale_10");

        assertNotNull(strategy);
        assertInstanceOf(Scale10Strategy.class, strategy);
    }

    @Test
    @DisplayName("Should be case insensitive - mixed case")
    void testCaseInsensitive_mixedCase() {
        IGradingStrategy strategy = factory.getStrategy("Scale_4");

        assertNotNull(strategy);
        assertInstanceOf(Scale4Strategy.class, strategy);
    }

    @Test
    @DisplayName("Should be case insensitive - all variations")
    void testCaseInsensitive_allVariations() {
        // Test all three strategies with different cases
        assertInstanceOf(Scale10Strategy.class, factory.getStrategy("SCALE_10"));
        assertInstanceOf(Scale10Strategy.class, factory.getStrategy("scale_10"));
        assertInstanceOf(Scale10Strategy.class, factory.getStrategy("Scale_10"));

        assertInstanceOf(Scale4Strategy.class, factory.getStrategy("SCALE_4"));
        assertInstanceOf(Scale4Strategy.class, factory.getStrategy("scale_4"));

        assertInstanceOf(PassFailStrategy.class, factory.getStrategy("PASS_FAIL"));
        assertInstanceOf(PassFailStrategy.class, factory.getStrategy("pass_fail"));
        assertInstanceOf(PassFailStrategy.class, factory.getStrategy("Pass_Fail"));
    }

    // ==================== Invalid Input Tests ====================

    @Test
    @DisplayName("Should throw exception for null input")
    void testNullInput_throwsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> factory.getStrategy(null)
        );

        assertTrue(exception.getMessage().contains("null or empty"));
    }

    @Test
    @DisplayName("Should throw exception for empty string")
    void testEmptyInput_throwsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> factory.getStrategy("")
        );

        assertTrue(exception.getMessage().contains("null or empty"));
    }

    @Test
    @DisplayName("Should throw exception for blank string (whitespace only)")
    void testBlankInput_throwsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> factory.getStrategy("   ")
        );

        assertTrue(exception.getMessage().contains("null or empty"));
    }

    @Test
    @DisplayName("Should throw exception for unknown grading scale")
    void testUnknownScale_throwsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> factory.getStrategy("SCALE_100")
        );

        assertTrue(exception.getMessage().contains("Unknown grading scale"));
        assertTrue(exception.getMessage().contains("SCALE_100"));
    }
}
