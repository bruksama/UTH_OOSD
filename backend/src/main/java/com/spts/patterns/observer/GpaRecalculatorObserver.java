package com.spts.patterns.observer;

import com.spts.entity.GradeEntry;
import com.spts.entity.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Observer implementation for recalculating GPA when grades change.
 * 
 * This observer has the highest priority (0) to ensure GPA is updated
 * before other observers (like RiskDetector) process the changes.
 * 
 * @author SPTS Team
 */
@Component
public class GpaRecalculatorObserver implements IGradeObserver {

    private static final Logger logger = LoggerFactory.getLogger(GpaRecalculatorObserver.class);
    private static final String OBSERVER_NAME = "GPA Recalculator";

    @Override
    public void onGradeUpdated(Student student, GradeEntry gradeEntry) {
        logger.info("Recalculating GPA for student: {} after grade update", student.getStudentId());
        
        // GPA recalculation logic will be implemented in service layer
        // This observer triggers the recalculation process
        
        logger.debug("Grade entry updated: courseOffering={}, value={}", 
                gradeEntry.getCourseOffering() != null ? 
                        gradeEntry.getCourseOffering().getId() : "N/A",
                gradeEntry.getValue());
    }

    @Override
    public int getPriority() {
        // Highest priority - GPA must be recalculated first
        return 0;
    }

    @Override
    public String getObserverName() {
        return OBSERVER_NAME;
    }
}
