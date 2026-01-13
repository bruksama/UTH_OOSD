package com.spts.patterns.strategy;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Strategy implementation for Pass/Fail grading.
 * 
 * Simple binary grading:
 * - Score >= 5.0: Pass (returns 1.0)
 * - Score < 5.0: Fail (returns 0.0)
 * 
 * Used for courses that don't contribute to GPA calculation.
 * 
 * @author SPTS Team
 */
@Component
public class PassFailStrategy implements IGradingStrategy {

    private static final String STRATEGY_NAME = "Pass/Fail";
    private static final double MAX_GRADE = 1.0;
    private static final double PASSING_GRADE = 1.0;
    private static final double PASS_THRESHOLD = 5.0;

    @Override
    public double calculate(List<Double> scores, List<Double> weights) {
        validateInput(scores, weights);

        // Calculate weighted average
        double weightedSum = 0.0;
        for (int i = 0; i < scores.size(); i++) {
            weightedSum += scores.get(i) * weights.get(i);
        }

        // Return 1.0 for pass, 0.0 for fail
        return weightedSum >= PASS_THRESHOLD ? 1.0 : 0.0;
    }

    @Override
    public String getStrategyName() {
        return STRATEGY_NAME;
    }

    @Override
    public double getMaxGrade() {
        return MAX_GRADE;
    }

    @Override
    public double getPassingGrade() {
        return PASSING_GRADE;
    }

    /**
     * Validate input parameters for grade calculation.
     */
    private void validateInput(List<Double> scores, List<Double> weights) {
        if (scores == null || weights == null) {
            throw new IllegalArgumentException("Scores and weights cannot be null");
        }
        if (scores.size() != weights.size()) {
            throw new IllegalArgumentException("Scores and weights must have the same size");
        }
        if (scores.isEmpty()) {
            throw new IllegalArgumentException("Scores list cannot be empty");
        }

        double weightSum = weights.stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(weightSum - 1.0) > 0.001) {
            throw new IllegalArgumentException("Weights must sum to 1.0, but got: " + weightSum);
        }

        for (Double score : scores) {
            if (score < 0 || score > 10.0) {
                throw new IllegalArgumentException("Score must be between 0 and 10");
            }
        }
    }
}
