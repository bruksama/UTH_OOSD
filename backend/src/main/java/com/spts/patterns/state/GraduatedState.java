package com.spts.patterns.state;

import com.spts.entity.Student;
import org.springframework.stereotype.Component;

/**
 * Graduated state - terminal state.
 * 
 * Criteria: Completed all graduation requirements
 * - No course registration allowed
 * - No counseling required
 * - Academic record finalized
 * 
 * @author SPTS Team
 */
@Component
public class GraduatedState extends StudentState {

    private static final String STATE_NAME = "GRADUATED";
    private static final int MAX_CREDITS = 0;

    @Override
    public String getStateName() {
        return STATE_NAME;
    }

    @Override
    public boolean canRegisterCourses() {
        // Graduated students cannot register for courses
        return false;
    }

    @Override
    public boolean requiresCounseling() {
        return false;
    }

    @Override
    public int getMaxCreditHours() {
        return MAX_CREDITS;
    }

    @Override
    public StudentState handleGpaChange(Student student, double newGpa) {
        // Graduated is a terminal state - no transitions
        return this;
    }

    @Override
    public String getRequiredActions() {
        return "Congratulations! All academic requirements completed. " +
               "Proceed with graduation ceremony registration.";
    }
}
