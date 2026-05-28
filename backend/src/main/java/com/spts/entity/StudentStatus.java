package com.spts.entity;

/**
 * Enumeration of student academic status values.
 * Used with State Pattern for student lifecycle management.
 * 
 * @author SPTS Team
 */
public enum StudentStatus {
    
    /**
     * Good academic standing - GPA >= 2.0
     */
    NORMAL("Normal", "Good academic standing"),
    
    /**
     * At risk of academic probation - 1.5 <= GPA < 2.0
     */
    AT_RISK("At Risk", "Academic warning issued"),
    
    /**
     * Academic probation - GPA < 1.5
     */
    PROBATION("Probation", "Academic probation status"),
    
    /**
     * Graduated - Completed all requirements
     */
    GRADUATED("Graduated", "Completed degree requirements");

    private final String displayName;
    private final String description;

    StudentStatus(String displayName, String description) {
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
