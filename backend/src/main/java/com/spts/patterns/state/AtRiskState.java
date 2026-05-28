package com.spts.patterns.state;

import com.spts.entity.Student;
import org.springframework.stereotype.Component;

/**
 * At-risk academic standing state.
 * 
 * Criteria: 1.5 <= GPA < 2.0
 * - Limited course registration (15 credits max)
 * - Academic counseling recommended
 * - Warning alerts generated
 * 
 * @author SPTS Team
 */
@Component
public class AtRiskState extends StudentState {

    private static final String STATE_NAME = "AT_RISK";
    private static final int MAX_CREDITS = 15;
    private static final double NORMAL_THRESHOLD = 2.0;
    private static final double PROBATION_THRESHOLD = 1.5;

    @Override
    public String getStateName() {
        return STATE_NAME;
    }

    @Override
    public boolean canRegisterCourses() {
        return true;
    }

    @Override
    public boolean requiresCounseling() {
        return true;
    }

    @Override
    public int getMaxCreditHours() {
        return MAX_CREDITS;
    }

    @Override
    public StudentState handleGpaChange(Student student, double newGpa) {
        if (newGpa >= NORMAL_THRESHOLD) {
            // Improvement: transition to Normal state
            return new NormalState();
        } else if (newGpa < PROBATION_THRESHOLD) {
            // Decline: transition to Probation state
            return new ProbationState();
        }
        // Remain in AtRisk state
        return this;
    }

    @Override
    public String getRequiredActions() {
        return "Schedule meeting with academic advisor. Consider reducing course load. " +
               "Utilize tutoring services.";
    }
}
