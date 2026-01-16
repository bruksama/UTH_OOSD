package com.spts.patterns.strategy;

import org.springframework.stereotype.Component;

/**
 * Factory pattern for dynamic grading strategy instantiation.
 * Centralized point for creating appropriate grading strategies based on grading scale.
 * 
 * This factory encapsulates the creation logic for different grading strategies,
 * promoting loose coupling and easier maintenance of strategy implementations.
 */
@Component
public class GradingStrategyFactory {

    /**
     * Creates and returns the appropriate grading strategy based on the specified grading scale.
     *
     * @param gradingScale the grading scale type (SCALE_10, SCALE_4, or PASS_FAIL)
     * @return IGradingStrategy implementation corresponding to the grading scale
     * @throws IllegalArgumentException if the grading scale is not recognized
     */
    public IGradingStrategy getStrategy(String gradingScale) {
        if (gradingScale == null || gradingScale.isBlank()) {
            throw new IllegalArgumentException("Grading scale cannot be null or empty");
        }

        return switch (gradingScale.toUpperCase()) {
            case "SCALE_10" -> new Scale10Strategy();
            case "SCALE_4" -> new Scale4Strategy();
            case "PASS_FAIL" -> new PassFailStrategy();
            default -> throw new IllegalArgumentException(
                "Unknown grading scale: " + gradingScale + 
                ". Supported scales: SCALE_10, SCALE_4, PASS_FAIL"
            );
        };
    }
}
