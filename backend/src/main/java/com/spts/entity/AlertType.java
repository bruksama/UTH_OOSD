package com.spts.entity;

/**
 * Enumeration of alert types based on trigger conditions.
 * 
 * @author SPTS Team
 */
public enum AlertType {
    
    /**
     * GPA dropped below threshold
     */
    LOW_GPA("Low GPA", "GPA has fallen below acceptable threshold"),
    
    /**
     * Significant GPA decrease in single semester
     */
    GPA_DROP("GPA Drop", "Significant decrease in GPA detected"),
    
    /**
     * Academic status changed
     */
    STATUS_CHANGE("Status Change", "Academic standing has changed"),
    
    /**
     * Student placed on probation
     */
    PROBATION("Probation", "Student has been placed on academic probation"),
    
    /**
     * Improved from at-risk or probation
     */
    IMPROVEMENT("Improvement", "Academic performance has improved");

    private final String displayName;
    private final String description;

    AlertType(String displayName, String description) {
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
