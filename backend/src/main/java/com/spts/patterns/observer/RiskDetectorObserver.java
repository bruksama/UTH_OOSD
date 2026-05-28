package com.spts.patterns.observer;

import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import com.spts.entity.Enrollment;
import com.spts.entity.GradeEntry;
import com.spts.entity.Student;
import com.spts.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Observer implementation for detecting at-risk students.
 * 
 * Monitors GPA changes and creates alerts when:
 * - GPA falls below 2.0 (AT_RISK threshold)
 * - GPA falls below 1.5 (PROBATION threshold)
 * 
 * @author SPTS Team - Member 3 (Behavioral Engineer)
 */
@Component
public class RiskDetectorObserver implements IGradeObserver {

    private static final Logger logger = LoggerFactory.getLogger(RiskDetectorObserver.class);
    private static final String OBSERVER_NAME = "Risk Detector";
    
    private static final double AT_RISK_THRESHOLD = 2.0;
    private static final double PROBATION_THRESHOLD = 1.5;
    
    private final AlertService alertService;
    
    public RiskDetectorObserver(AlertService alertService) {
        this.alertService = alertService;
    }

    @Override
    public void onGradeUpdated(Student student, Enrollment enrollment, GradeEntry gradeEntry) {
        logger.info("Checking risk status for student: {} after grade update", student.getStudentId());
        
        Double currentGpa = student.getGpa();
        Integer totalCredits = student.getTotalCredits();
        
        if (currentGpa == null || totalCredits == null || totalCredits == 0) {
            logger.debug("Student {} has no GPA or credits yet, skipping risk detection", student.getStudentId());
            return;
        }
        
        // Check enrollment grade
        Double enrollmentGpa = enrollment.getGpaValue();
        if (enrollmentGpa != null) {
            logger.debug("Enrollment GPA for {}: {}", 
                    enrollment.getCourseOffering().getDisplayName(), enrollmentGpa);
        }
        
        // Create alerts based on GPA thresholds
        // Create alerts based on GPA thresholds
        if (currentGpa < PROBATION_THRESHOLD) {
            createAlert(student, AlertLevel.CRITICAL, AlertType.PROBATION,
                String.format("Student GPA (%.2f) is below probation threshold (%.1f)", 
                    currentGpa, PROBATION_THRESHOLD));
        } else if (currentGpa < AT_RISK_THRESHOLD) {
            createAlert(student, AlertLevel.WARNING, AlertType.LOW_GPA,
                String.format("Student GPA (%.2f) is below at-risk threshold (%.1f)", 
                    currentGpa, AT_RISK_THRESHOLD));
        } else {
            // GPA is healthy (>= 2.0)
            // Resolve any existing risk alerts
            int resolvedProbation = alertService.resolveAlertsByType(student.getId(), AlertType.PROBATION, "System_AutoResolve");
            int resolvedRisk = alertService.resolveAlertsByType(student.getId(), AlertType.LOW_GPA, "System_AutoResolve");
            
            if (resolvedProbation > 0 || resolvedRisk > 0) {
                logger.info("Auto-resolved {} probation/risk alerts for student {} due to GPA improvement", 
                        resolvedProbation + resolvedRisk, student.getStudentId());
                        
                // Create improvement alert
                createAlert(student, AlertLevel.INFO, AlertType.IMPROVEMENT,
                    String.format("Great job! Your GPA (%.2f) has improved and is now in good standing.", currentGpa));
            }
        }
    }
    
    /**
     * Create alert only if no unresolved alert of same type exists.
     * Prevents duplicate alerts when grades update frequently.
     */
    private void createAlert(Student student, AlertLevel level, AlertType type, String message) {
        try {
            // De-duplication: Check if unresolved alert already exists
            if (alertService.hasUnresolvedAlert(student.getId(), type)) {
                logger.debug("Skipping alert creation - unresolved {} alert already exists for student {}", 
                        type, student.getStudentId());
                return;
            }
            
            alertService.createAlert(student, level, type, message);
            logger.info("Created {} alert for student {}: {}", level, student.getStudentId(), type);
        } catch (Exception e) {
            logger.error("Failed to create alert for student {}: {}", student.getStudentId(), e.getMessage());
        }
    }

    @Override
    public int getPriority() {
        // Second priority - runs after GPA recalculation
        return 10;
    }

    @Override
    public String getObserverName() {
        return OBSERVER_NAME;
    }
}

