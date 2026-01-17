package com.spts.patterns.strategy;

import java.util.List;

/**
 * Strategy Pattern Interface for grade calculation.
 * 
 * Defines the contract for different grading strategies:
 * - Scale10Strategy: Vietnamese 10-point scale
 * - Scale4Strategy: US 4-point GPA scale
 * - PassFailStrategy: Binary pass/fail grading
 * 
 * Reference: OOSD Chapter 6 - Strategy Pattern
 * 
 * @author SPTS Team
 */
public interface IGradingStrategy {

    /**
     * Calculate the final grade based on scores and their weights.
     *
     * @param scores  List of individual score values (normalized to 0-10 scale)
     * @param weights List of corresponding weights (must sum to 1.0)
     * @return Calculated grade according to the specific strategy
     * @throws IllegalArgumentException if scores and weights have different sizes
     *                                  or if weights don't sum to 1.0
     */
    double calculate(List<Double> scores, List<Double> weights);

    /**
     * Get the name of this grading strategy.
     *
     * @return Strategy name for display and logging purposes
     */
    String getStrategyName();

    /**
     * Get the maximum possible grade value for this strategy.
     *
     * @return Maximum grade value (e.g., 10.0 for Scale10, 4.0 for Scale4)
     */
    double getMaxGrade();

    /**
     * Get the minimum passing grade for this strategy.
     *
     * @return Minimum grade considered as "passing"
     */
    double getPassingGrade();

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
}
