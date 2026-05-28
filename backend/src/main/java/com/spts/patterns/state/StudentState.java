package com.spts.patterns.state;

import com.spts.entity.Student;

/**
 * State Pattern Abstract Class for student academic status.
 * 
 * Defines the contract for different student states:
 * - NormalState: GPA >= 2.0, good standing
 * - AtRiskState: 1.5 <= GPA < 2.0, warning issued
 * - ProbationState: GPA < 1.5, academic probation
 * - GraduatedState: Completed all requirements
 * 
 * Reference: OOSD Chapter 6 - State Pattern
 * 
 * @author SPTS Team
 */
public abstract class StudentState {

    /**
     * Get the name of this state.
     *
     * @return State name for display and persistence
     */
    public abstract String getStateName();

    /**
     * Check if student can register for new courses in this state.
     *
     * @return true if registration is allowed
     */
    public abstract boolean canRegisterCourses();

    /**
     * Check if student requires academic counseling in this state.
     *
     * @return true if counseling is required
     */
    public abstract boolean requiresCounseling();

    /**
     * Get the maximum credit hours allowed for this state.
     *
     * @return Maximum credit hours per semester
     */
    public abstract int getMaxCreditHours();

    /**
     * Handle GPA change and potentially transition to a new state.
     *
     * @param student The student context
     * @param newGpa  The updated GPA value
     * @return The new state after handling GPA change (may be same state)
     */
    public abstract StudentState handleGpaChange(Student student, double newGpa);

    /**
     * Get a description of actions required in this state.
     *
     * @return Description of required actions
     */
    public abstract String getRequiredActions();
}
