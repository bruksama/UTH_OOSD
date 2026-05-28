package com.spts.entity;

/**
 * Enumeration of academic semesters.
 * 
 * @author SPTS Team
 */
public enum Semester {
    
    SPRING("Spring", 1),
    SUMMER("Summer", 2),
    FALL("Fall", 3),
    WINTER("Winter", 4);

    private final String displayName;
    private final int order;

    Semester(String displayName, int order) {
        this.displayName = displayName;
        this.order = order;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getOrder() {
        return order;
    }
}
