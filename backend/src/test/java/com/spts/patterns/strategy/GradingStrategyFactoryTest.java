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
        assertTrue(strategy instanceof Scale10Strategy);
        assertEquals(10.0, strategy.getMaxGrade());
        assertEquals(4.0, strategy.getPassingGrade());
    }

    @Test
    @DisplayName("Should return Scale4Strategy for SCALE_4")
    void testGetScale4Strategy() {
        IGradingStrategy strategy = factory.getStrategy("SCALE_4");
        assertNotNull(strategy);
        assertTrue(strategy instanceof Scale4Strategy);
        assertEquals(4.0, strategy.getMaxGrade());
        assertEquals(1.0, strategy.getPassingGrade());
    }

    @Test
    @DisplayName("Should return PassFailStrategy for PASS_FAIL")
    void testGetPassFailStrategy() {
        IGradingStrategy strategy = factory.getStrategy("PASS_FAIL");
        assertNotNull(strategy);
        assertTrue(strategy instanceof PassFailStrategy);
        assertEquals(1.0, strategy.getMaxGrade());
    }

    @Test
    @DisplayName("Should be case insensitive for strategy names")
    void testCaseInsensitive() {
        assertNotNull(factory.getStrategy("scale_10"));
        assertNotNull(factory.getStrategy("Scale_10"));
        assertNotNull(factory.getStrategy("SCALE_10"));
        assertNotNull(factory.getStrategy("scale_4"));
        assertNotNull(factory.getStrategy("pass_fail"));
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
        assertThrows(IllegalArgumentException.class, () -> factory.getStrategy("UNKNOWN"));
    }
}
