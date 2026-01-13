package com.spts.patterns.observer;

import com.spts.entity.GradeEntry;
import com.spts.entity.Student;

/**
 * Observer Pattern Interface for grade change notifications.
 * 
 * Implementations are notified when grades are updated, allowing:
 * - GPA recalculation
 * - Risk detection and alert generation
 * - Status transition triggers
 * 
 * Reference: OOSD Chapter 6 - Observer Pattern
 * 
 * @author SPTS Team
 */
public interface IGradeObserver {

    /**
     * Called when a new grade entry is added or an existing one is updated.
     *
     * @param student    The student whose grade was updated
     * @param gradeEntry The grade entry that was added/modified
     */
    void onGradeUpdated(Student student, GradeEntry gradeEntry);

    /**
     * Get the priority of this observer (lower = higher priority).
     * Observers with higher priority are notified first.
     *
     * @return Priority value (0 = highest priority)
     */
    default int getPriority() {
        return 100;
    }

    /**
     * Get the name of this observer for logging purposes.
     *
     * @return Observer name
     */
    String getObserverName();
}
