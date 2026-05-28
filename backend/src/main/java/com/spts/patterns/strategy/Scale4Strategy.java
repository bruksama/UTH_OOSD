package com.spts.patterns.strategy;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Strategy implementation for US 4-point GPA scale.
 * 
 * Converts 10-point scale scores to 4-point GPA:
 * - 9.0 - 10.0: 4.0 (A)
 * - 8.5 - 8.9: 3.7 (A-)
 * - 8.0 - 8.4: 3.5 (B+)
 * - 7.0 - 7.9: 3.0 (B)
 * - 6.5 - 6.9: 2.5 (C+)
 * - 5.5 - 6.4: 2.0 (C)
 * - 5.0 - 5.4: 1.5 (D+)
 * - 4.0 - 4.9: 1.0 (D)
 * - Below 4.0: 0.0 (F)
 * 
 * @author SPTS Team
 */
@Component
public class Scale4Strategy implements IGradingStrategy {

    private static final String STRATEGY_NAME = "Scale 4 (US GPA Standard)";
    private static final double MAX_GRADE = 4.0;
    private static final double PASSING_GRADE = 1.0;

    @Override
    public double calculate(List<Double> scores, List<Double> weights) {
        validateInput(scores, weights);

        // First calculate weighted average on 10-point scale
        double weightedSum = 0.0;
        for (int i = 0; i < scores.size(); i++) {
            weightedSum += scores.get(i) * weights.get(i);
        }

        // Convert to 4-point scale
        return convertToScale4(weightedSum);
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
     * Convert a 10-point scale score to 4-point GPA.
     *
     * @param score10 Score on 10-point scale
     * @return Equivalent GPA on 4-point scale
     */
    private double convertToScale4(double score10) {
        if (score10 >= 9.0) return 4.0;
        if (score10 >= 8.5) return 3.7;
        if (score10 >= 8.0) return 3.5;
        if (score10 >= 7.0) return 3.0;
        if (score10 >= 6.5) return 2.5;
        if (score10 >= 5.5) return 2.0;
        if (score10 >= 5.0) return 1.5;
        if (score10 >= 4.0) return 1.0;
        return 0.0;
    }

    @Override
    public double calculateGpa(Double score) {
        if (score == null) return 0.0;
        // Input is on 10-point scale, convert to 4-point GPA
        return convertToScale4(score);
    }

    @Override
    public String calculateLetterGrade(Double score) {
        if (score == null) return "F";
        // Input is on 10-point scale
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
        // On 10-point scale, passing is >= 4.0
        return score != null && score >= 4.0;
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
