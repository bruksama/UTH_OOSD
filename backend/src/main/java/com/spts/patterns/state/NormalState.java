package com.spts.patterns.state;

import com.spts.entity.Student;
import org.springframework.stereotype.Component;

/**
 * Normal academic standing state.
 * 
 * Criteria: GPA >= 2.0
 * - Full course registration privileges
 * - No mandatory counseling
 * - Standard credit hour limit (18 credits)
 * 
 * @author SPTS Team
 */
@Component
public class NormalState extends StudentState {

    private static final String STATE_NAME = "NORMAL";
    private static final int MAX_CREDITS = 18;
    private static final double AT_RISK_THRESHOLD = 2.0;

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
        return false;
    }

    @Override
    public int getMaxCreditHours() {
        return MAX_CREDITS;
    }

    @Override
    public StudentState handleGpaChange(Student student, double newGpa) {
        if (newGpa < AT_RISK_THRESHOLD) {
            // Transition to AtRisk state
            return new AtRiskState();
        }
        // Remain in Normal state
        return this;
    }

    @Override
    public String getRequiredActions() {
        return "No special actions required. Maintain good academic standing.";
    }
}
