package com.spts.entity;

/**
 * Enumeration of grade entry types.
 * Used to distinguish between component scores and final grades.
 * 
 * @author SPTS Team
 */
public enum GradeEntryType {
    
    /**
     * Component score (e.g., midterm, assignment)
     */
    COMPONENT("Component", "Individual assessment component"),
    
    /**
     * Final calculated grade for the course
     */
    FINAL("Final", "Final course grade");

    private final String displayName;
    private final String description;

    GradeEntryType(String displayName, String description) {
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
