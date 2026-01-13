package com.spts.patterns.state;

import com.spts.entity.Student;
import org.springframework.stereotype.Component;

/**
 * Academic probation state.
 * 
 * Criteria: GPA < 1.5
 * - Restricted course registration (12 credits max)
 * - Mandatory academic counseling
 * - Critical alerts generated
 * - Risk of academic dismissal
 * 
 * @author SPTS Team
 */
@Component
public class ProbationState extends StudentState {

    private static final String STATE_NAME = "PROBATION";
    private static final int MAX_CREDITS = 12;
    private static final double AT_RISK_THRESHOLD = 1.5;
    private static final double NORMAL_THRESHOLD = 2.0;

    @Override
    public String getStateName() {
        return STATE_NAME;
    }

    @Override
    public boolean canRegisterCourses() {
        // Can register but with restrictions
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
            // Significant improvement: transition to Normal state
            return new NormalState();
        } else if (newGpa >= AT_RISK_THRESHOLD) {
            // Improvement: transition to AtRisk state
            return new AtRiskState();
        }
        // Remain in Probation state
        return this;
    }

    @Override
    public String getRequiredActions() {
        return "MANDATORY: Meet with academic advisor immediately. " +
               "Complete academic success workshop. " +
               "Reduced course load required. " +
               "Progress monitored weekly.";
    }
}
