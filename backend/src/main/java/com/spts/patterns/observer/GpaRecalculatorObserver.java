package com.spts.patterns.observer;

import com.spts.entity.Enrollment;
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
    public void onGradeUpdated(Student student, Enrollment enrollment, GradeEntry gradeEntry) {
        logger.info("Recalculating GPA for student: {} after grade update in enrollment: {}", 
                student.getStudentId(), enrollment.getId());
        
        // Log grade entry details
        logger.debug("Grade entry updated: name={}, score={}, weight={}", 
                gradeEntry.getName(),
                gradeEntry.getScore(),
                gradeEntry.getWeight());

        // Log course information
        if (enrollment.getCourseOffering() != null && enrollment.getCourseOffering().getCourse() != null) {
            logger.debug("Course: {} ({})", 
                    enrollment.getCourseOffering().getCourse().getCourseName(),
                    enrollment.getCourseOffering().getCourse().getCourseCode());
        }
        
        // GPA recalculation logic will be implemented in service layer
        // This observer triggers the recalculation process
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
