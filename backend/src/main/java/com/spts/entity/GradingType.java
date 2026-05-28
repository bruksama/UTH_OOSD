package com.spts.entity;

/**
 * Enumeration of grading types for courses.
 * Determines which IGradingStrategy implementation to use.
 * 
 * @author SPTS Team
 */
public enum GradingType {
    
    /**
     * Vietnamese 10-point grading scale
     * Uses Scale10Strategy
     */
    SCALE_10("10-Point Scale", "Vietnamese standard grading (0-10)"),
    
    /**
     * US 4-point GPA scale
     * Uses Scale4Strategy
     */
    SCALE_4("4-Point Scale", "US GPA standard (0-4)"),
    
    /**
     * Pass/Fail binary grading
     * Uses PassFailStrategy
     */
    PASS_FAIL("Pass/Fail", "Binary pass/fail grading");

    private final String displayName;
    private final String description;

    GradingType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
