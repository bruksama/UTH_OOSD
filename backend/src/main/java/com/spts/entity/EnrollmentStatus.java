package com.spts.entity;

/**
 * Enumeration of enrollment status values.
 * 
 * @author SPTS Team
 */
public enum EnrollmentStatus {
    
    /**
     * Currently enrolled and in progress
     */
    IN_PROGRESS("In Progress", "Student is currently taking this course"),
    
    /**
     * Successfully completed the course
     */
    COMPLETED("Completed", "Student has completed this course"),
    
    /**
     * Withdrawn from the course
     */
    WITHDRAWN("Withdrawn", "Student has withdrawn from this course");

    private final String displayName;
    private final String description;

    EnrollmentStatus(String displayName, String description) {
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
