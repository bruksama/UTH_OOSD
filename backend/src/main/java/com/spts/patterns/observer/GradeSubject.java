package com.spts.patterns.observer;

import com.spts.entity.Enrollment;
import com.spts.entity.GradeEntry;
import com.spts.entity.Student;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Subject class in Observer Pattern for grade notifications.
 * 
 * Manages a list of observers and notifies them when grades change.
 * Observers are sorted by priority before notification.
 * 
 * @author SPTS Team
 */
@Component
public class GradeSubject {

    private final List<IGradeObserver> observers = new ArrayList<>();

    /**
     * Register an observer to receive grade update notifications.
     *
     * @param observer The observer to register
     */
    public void attach(IGradeObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
            // Sort by priority after adding
            observers.sort(Comparator.comparingInt(IGradeObserver::getPriority));
        }
    }

    /**
     * Unregister an observer from receiving notifications.
     *
     * @param observer The observer to unregister
     */
    public void detach(IGradeObserver observer) {
        observers.remove(observer);
    }

    /**
     * Notify all registered observers about a grade update.
     * Observers are notified in priority order.
     *
     * @param student    The student whose grade was updated
     * @param enrollment The enrollment containing the grade
     * @param gradeEntry The grade entry that was added/modified
     */
    public void notifyObservers(Student student, Enrollment enrollment, GradeEntry gradeEntry) {
        for (IGradeObserver observer : observers) {
            observer.onGradeUpdated(student, enrollment, gradeEntry);
        }
    }

    /**
     * Get the count of registered observers.
     *
     * @return Number of observers
     */
    public int getObserverCount() {
        return observers.size();
    }
}
