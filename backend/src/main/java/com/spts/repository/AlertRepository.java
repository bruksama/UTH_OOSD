package com.spts.repository;

import com.spts.entity.Alert;
import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Alert entity.
 * 
 * @author SPTS Team
 */
@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    /**
     * Find alerts by student ID
     */
    List<Alert> findByStudentId(Long studentId);

    /**
     * Find alerts by level
     */
    List<Alert> findByLevel(AlertLevel level);

    /**
     * Find alerts by type
     */
    List<Alert> findByType(AlertType type);

    /**
     * Find unread alerts
     */
    List<Alert> findByIsReadFalse();

    /**
     * Find unresolved alerts
     */
    List<Alert> findByIsResolvedFalse();

    /**
     * Find unread alerts for a student
     */
    List<Alert> findByStudentIdAndIsReadFalse(Long studentId);

    /**
     * Find alerts created after a specific datetime
     */
    List<Alert> findByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Find critical and high priority unresolved alerts
     */
    @Query("SELECT a FROM Alert a WHERE a.isResolved = false " +
           "AND (a.level = 'CRITICAL' OR a.level = 'HIGH') ORDER BY a.createdAt DESC")
    List<Alert> findUrgentAlerts();

    /**
     * Count unread alerts for a student
     */
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.student.id = :studentId AND a.isRead = false")
    Long countUnreadAlerts(@Param("studentId") Long studentId);
}
