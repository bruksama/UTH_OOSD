package com.spts.patterns.strategy;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Strategy implementation for Vietnamese 10-point grading scale.
 * 
 * Grade interpretation:
 * - 9.0 - 10.0: Excellent (A)
 * - 8.0 - 8.9: Very Good (B+)
 * - 7.0 - 7.9: Good (B)
 * - 6.0 - 6.9: Above Average (C+)
 * - 5.0 - 5.9: Average (C)
 * - 4.0 - 4.9: Below Average (D)
 * - Below 4.0: Fail (F)
 * 
 * @author SPTS Team
 */
@Component
public class Scale10Strategy implements IGradingStrategy {

    private static final String STRATEGY_NAME = "Scale 10 (Vietnamese Standard)";
    private static final double MAX_GRADE = 10.0;
    private static final double PASSING_GRADE = 4.0;

    @Override
    public double calculate(List<Double> scores, List<Double> weights) {
        validateInput(scores, weights);

        double weightedSum = 0.0;
        for (int i = 0; i < scores.size(); i++) {
            weightedSum += scores.get(i) * weights.get(i);
        }

        // Round to 2 decimal places
        return Math.round(weightedSum * 100.0) / 100.0;
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
            if (score < 0 || score > MAX_GRADE) {
                throw new IllegalArgumentException("Score must be between 0 and " + MAX_GRADE);
            }
        }
    }
}
