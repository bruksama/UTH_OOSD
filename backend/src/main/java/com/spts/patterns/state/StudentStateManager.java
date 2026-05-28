package com.spts.patterns.state;

import com.spts.entity.Student;
import com.spts.entity.StudentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

/**
 * Manager class for Student State Pattern.
 * 
 * Centralizes state transition logic and provides:
 * - Mapping between StudentStatus enum and StudentState objects
 * - GPA-based status determination
 * - State transition handling
 * 
 * Reference: OOSD Chapter 6 - State Pattern
 * 
 * @author SPTS Team - Member 3 (Behavioral Engineer)
 */
@Component
public class StudentStateManager {

    private static final Logger logger = LoggerFactory.getLogger(StudentStateManager.class);
    
    // GPA Thresholds
    private static final double NORMAL_THRESHOLD = 2.0;
    private static final double AT_RISK_THRESHOLD = 1.5;
    
    // State instances mapped to status
    private final Map<StudentStatus, StudentState> states;
    
    public StudentStateManager(NormalState normalState,
                               AtRiskState atRiskState,
                               ProbationState probationState,
                               GraduatedState graduatedState) {
        this.states = new EnumMap<>(StudentStatus.class);
        this.states.put(StudentStatus.NORMAL, normalState);
        this.states.put(StudentStatus.AT_RISK, atRiskState);
        this.states.put(StudentStatus.PROBATION, probationState);
        this.states.put(StudentStatus.GRADUATED, graduatedState);
        
        logger.info("StudentStateManager initialized with {} states", states.size());
    }
    
    /**
     * Get the StudentState object for a given status.
     * 
     * @param status StudentStatus enum value
     * @return Corresponding StudentState object
     */
    public StudentState getStateForStatus(StudentStatus status) {
        return states.get(status);
    }
    
    /**
     * Determine the appropriate StudentStatus based on GPA.
     * 
     * @param gpa Current GPA value
     * @return Appropriate StudentStatus
     */
    public StudentStatus determineStatusFromGpa(Double gpa) {
        if (gpa == null) {
            return StudentStatus.NORMAL; // Default for new students
        }
        
        if (gpa >= NORMAL_THRESHOLD) {
            return StudentStatus.NORMAL;
        } else if (gpa >= AT_RISK_THRESHOLD) {
            return StudentStatus.AT_RISK;
        } else {
            return StudentStatus.PROBATION;
        }
    }
    
    /**
     * Handle state transition for a student based on new GPA.
     * 
     * @param student The student to update
     * @param newGpa  The new GPA value
     * @return The new StudentStatus after transition
     */
    public StudentStatus handleStateTransition(Student student, Double newGpa) {
        StudentStatus currentStatus = student.getStatus();
        StudentStatus newStatus = determineStatusFromGpa(newGpa);
        
        if (currentStatus != newStatus) {
            logger.info("Student {} transitioning from {} to {} (GPA: {})",
                    student.getStudentId(), currentStatus, newStatus, newGpa);
        }
        
        return newStatus;
    }
    
    /**
     * Check if a student can register for courses based on their status.
     * 
     * @param status StudentStatus to check
     * @return true if registration is allowed
     */
    public boolean canRegisterCourses(StudentStatus status) {
        StudentState state = getStateForStatus(status);
        return state != null && state.canRegisterCourses();
    }
    
    /**
     * Get the maximum credit hours allowed for a status.
     * 
     * @param status StudentStatus to check
     * @return Maximum credit hours, or 0 if status not found
     */
    public int getMaxCreditHours(StudentStatus status) {
        StudentState state = getStateForStatus(status);
        return state != null ? state.getMaxCreditHours() : 0;
    }
    
    /**
     * Check if counseling is required for a status.
     * 
     * @param status StudentStatus to check
     * @return true if counseling is required
     */
    public boolean requiresCounseling(StudentStatus status) {
        StudentState state = getStateForStatus(status);
        return state != null && state.requiresCounseling();
    }
}
