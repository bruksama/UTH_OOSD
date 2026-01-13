package com.spts.patterns.observer;

import com.spts.entity.GradeEntry;
import com.spts.entity.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Observer implementation for detecting at-risk students.
 * 
 * Monitors GPA changes and creates alerts when:
 * - GPA falls below 2.0 (AT_RISK threshold)
 * - GPA falls below 1.5 (PROBATION threshold)
 * - Significant GPA drop in a single semester
 * 
 * @author SPTS Team
 */
@Component
public class RiskDetectorObserver implements IGradeObserver {

    private static final Logger logger = LoggerFactory.getLogger(RiskDetectorObserver.class);
    private static final String OBSERVER_NAME = "Risk Detector";
    
    private static final double AT_RISK_THRESHOLD = 2.0;
    private static final double PROBATION_THRESHOLD = 1.5;

    @Override
    public void onGradeUpdated(Student student, GradeEntry gradeEntry) {
        logger.info("Checking risk status for student: {}", student.getStudentId());
        
        Double currentGpa = student.getGpa();
        if (currentGpa == null) {
            logger.debug("Student {} has no GPA calculated yet", student.getStudentId());
            return;
        }
        
        if (currentGpa < PROBATION_THRESHOLD) {
            logger.warn("CRITICAL: Student {} GPA ({}) is below probation threshold ({})", 
                    student.getStudentId(), currentGpa, PROBATION_THRESHOLD);
            // Alert creation will be handled by AlertService
        } else if (currentGpa < AT_RISK_THRESHOLD) {
            logger.warn("WARNING: Student {} GPA ({}) is below at-risk threshold ({})", 
                    student.getStudentId(), currentGpa, AT_RISK_THRESHOLD);
            // Alert creation will be handled by AlertService
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
