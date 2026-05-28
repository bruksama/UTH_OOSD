package com.spts.entity;

/**
 * Enumeration of alert severity levels.
 * 
 * @author SPTS Team
 */
public enum AlertLevel {
    
    /**
     * Informational alert - no action required
     */
    INFO("Information", "Informational notification"),
    
    /**
     * Warning alert - attention recommended
     */
    WARNING("Warning", "Attention recommended"),
    
    /**
     * High priority alert - action required
     */
    HIGH("High Priority", "Immediate action required"),
    
    /**
     * Critical alert - urgent action required
     */
    CRITICAL("Critical", "Urgent action required");

    private final String displayName;
    private final String description;

    AlertLevel(String displayName, String description) {
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
