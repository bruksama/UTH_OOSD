package com.spts.service;

import com.spts.dto.AlertDTO;
import com.spts.entity.*;
import com.spts.repository.AlertRepository;
import com.spts.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Alert entity.
 * Provides CRUD operations and alert management functionality.
 * 
 * Integrates with Observer Pattern:
 * - Alerts are created by RiskDetectorObserver when student performance issues are detected
 * - Provides methods to mark alerts as read/resolved
 * 
 * Alert triggers (handled by Observer pattern - Member 3):
 * - LOW_GPA: GPA falls below threshold (2.0 or 1.5)
 * - GPA_DROP: Significant GPA decrease detected
 * - STATUS_CHANGE: Academic status changes
 * - PROBATION: Student placed on probation
 * - IMPROVEMENT: Performance improved from at-risk/probation
 * 
 * Reference: OOSD Chapter 8 - Observer Pattern
 * 
 * @author SPTS Team
 */
@Service
@Transactional
public class AlertService {

    private final AlertRepository alertRepository;
    private final StudentRepository studentRepository;

    public AlertService(AlertRepository alertRepository, StudentRepository studentRepository) {
        this.alertRepository = alertRepository;
        this.studentRepository = studentRepository;
    }

    // ==================== CRUD Operations ====================

    /**
     * Get all alerts
     * 
     * @return List of all alerts as DTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alert by ID
     * 
     * @param id Alert database ID
     * @return AlertDTO
     * @throws RuntimeException if alert not found
     */
    @Transactional(readOnly = true)
    public AlertDTO getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));
        return convertToDTO(alert);
    }

    /**
     * Create a new alert
     * 
     * @param dto AlertDTO with alert data
     * @return Created AlertDTO with generated ID
     * @throws RuntimeException if student not found
     */
    public AlertDTO createAlert(AlertDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + dto.getStudentId()));

        Alert alert = new Alert();
        alert.setStudent(student);
        alert.setLevel(dto.getLevel());
        alert.setType(dto.getType());
        alert.setMessage(dto.getMessage());
        // createdAt is set automatically in constructor

        Alert savedAlert = alertRepository.save(alert);
        return convertToDTO(savedAlert);
    }

    /**
     * Create alert directly from entity data (used by Observer pattern)
     * 
     * @param student   Student entity
     * @param level     AlertLevel enum value
     * @param type      AlertType enum value
     * @param message   Alert message
     * @return Created AlertDTO
     */
    public AlertDTO createAlert(Student student, AlertLevel level, AlertType type, String message) {
        Alert alert = new Alert(student, level, type, message);
        Alert savedAlert = alertRepository.save(alert);
        return convertToDTO(savedAlert);
    }

    /**
     * Update an existing alert
     * 
     * @param id  Alert database ID
     * @param dto AlertDTO with updated data
     * @return Updated AlertDTO
     * @throws RuntimeException if alert not found
     */
    public AlertDTO updateAlert(Long id, AlertDTO dto) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));

        // Update fields
        alert.setLevel(dto.getLevel());
        alert.setType(dto.getType());
        alert.setMessage(dto.getMessage());

        Alert savedAlert = alertRepository.save(alert);
        return convertToDTO(savedAlert);
    }

    /**
     * Delete an alert
     * 
     * @param id Alert database ID
     * @throws RuntimeException if alert not found
     */
    public void deleteAlert(Long id) {
        if (!alertRepository.existsById(id)) {
            throw new RuntimeException("Alert not found with id: " + id);
        }
        alertRepository.deleteById(id);
    }

    // ==================== Mark as Read/Resolved ====================

    /**
     * Mark alert as read
     * 
     * @param id Alert database ID
     * @return Updated AlertDTO
     * @throws RuntimeException if alert not found
     */
    public AlertDTO markAsRead(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));

        alert.markAsRead();
        Alert savedAlert = alertRepository.save(alert);
        return convertToDTO(savedAlert);
    }

    /**
     * Mark multiple alerts as read
     * 
     * @param ids List of Alert database IDs
     * @return Number of alerts marked as read
     */
    public int markMultipleAsRead(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            try {
                markAsRead(id);
                count++;
            } catch (RuntimeException e) {
                // Skip if not found
            }
        }
        return count;
    }

    /**
     * Mark all alerts for a student as read
     * 
     * @param studentId Student database ID
     * @return Number of alerts marked as read
     */
    public int markAllAsReadForStudent(Long studentId) {
        List<Alert> alerts = alertRepository.findByStudentIdAndIsReadFalse(studentId);
        for (Alert alert : alerts) {
            alert.markAsRead();
        }
        alertRepository.saveAll(alerts);
        return alerts.size();
    }

    /**
     * Mark alert as resolved
     * 
     * @param id         Alert database ID
     * @param resolvedBy Username of resolver
     * @return Updated AlertDTO
     * @throws RuntimeException if alert not found
     */
    public AlertDTO markAsResolved(Long id, String resolvedBy) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));

        alert.markAsResolved(resolvedBy);
        Alert savedAlert = alertRepository.save(alert);
        return convertToDTO(savedAlert);
    }

    /**
     * Mark multiple alerts as resolved
     * 
     * @param ids        List of Alert database IDs
     * @param resolvedBy Username of resolver
     * @return Number of alerts marked as resolved
     */
    public int markMultipleAsResolved(List<Long> ids, String resolvedBy) {
        int count = 0;
        for (Long id : ids) {
            try {
                markAsResolved(id, resolvedBy);
                count++;
            } catch (RuntimeException e) {
                // Skip if not found
            }
        }
        return count;
    }

    // ==================== Search and Filter ====================

    /**
     * Get alerts for a student
     * 
     * @param studentId Student database ID
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsByStudent(Long studentId) {
        return alertRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts by level
     * 
     * @param level AlertLevel enum value
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsByLevel(AlertLevel level) {
        return alertRepository.findByLevel(level).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts by type
     * 
     * @param type AlertType enum value
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsByType(AlertType type) {
        return alertRepository.findByType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all unread alerts
     * 
     * @return List of unread AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getUnreadAlerts() {
        return alertRepository.findByIsReadFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread alerts for a student
     * 
     * @param studentId Student database ID
     * @return List of unread AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getUnreadAlertsForStudent(Long studentId) {
        return alertRepository.findByStudentIdAndIsReadFalse(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all unresolved alerts
     * 
     * @return List of unresolved AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getUnresolvedAlerts() {
        return alertRepository.findByIsResolvedFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get urgent alerts (CRITICAL and HIGH level, unresolved)
     * 
     * @return List of urgent AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getUrgentAlerts() {
        return alertRepository.findUrgentAlerts().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts created after a specific datetime
     * 
     * @param dateTime Start datetime
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsAfterDateTime(LocalDateTime dateTime) {
        return alertRepository.findByCreatedAtAfter(dateTime).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alerts created after a specific date (convenience method)
     * Converts LocalDate to start of day LocalDateTime
     * 
     * @param date Start date
     * @return List of AlertDTOs
     */
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlertsAfterDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        return alertRepository.findByCreatedAtAfter(startOfDay).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Count unread alerts for a student
     * 
     * @param studentId Student database ID
     * @return Number of unread alerts
     */
    @Transactional(readOnly = true)
    public Long countUnreadAlerts(Long studentId) {
        return alertRepository.countUnreadAlerts(studentId);
    }

    /**
     * Check if student has any unread alerts
     * 
     * @param studentId Student database ID
     * @return true if student has unread alerts
     */
    @Transactional(readOnly = true)
    public boolean hasUnreadAlerts(Long studentId) {
        return alertRepository.countUnreadAlerts(studentId) > 0;
    }

    /**
     * Get alert summary for a student
     * 
     * @param studentId Student database ID
     * @return AlertSummary with counts by level
     */
    @Transactional(readOnly = true)
    public AlertSummary getAlertSummary(Long studentId) {
        List<Alert> alerts = alertRepository.findByStudentId(studentId);
        
        AlertSummary summary = new AlertSummary();
        summary.setTotalAlerts(alerts.size());
        summary.setUnreadCount((int) alerts.stream().filter(a -> !a.getIsRead()).count());
        summary.setUnresolvedCount((int) alerts.stream().filter(a -> !a.getIsResolved()).count());
        summary.setCriticalCount((int) alerts.stream().filter(a -> a.getLevel() == AlertLevel.CRITICAL).count());
        summary.setHighCount((int) alerts.stream().filter(a -> a.getLevel() == AlertLevel.HIGH).count());
        summary.setWarningCount((int) alerts.stream().filter(a -> a.getLevel() == AlertLevel.WARNING).count());
        summary.setInfoCount((int) alerts.stream().filter(a -> a.getLevel() == AlertLevel.INFO).count());
        
        return summary;
    }

    // ==================== DTO Conversion Helpers ====================

    /**
     * Convert Alert entity to AlertDTO
     */
    private AlertDTO convertToDTO(Alert alert) {
        AlertDTO dto = new AlertDTO();
        dto.setId(alert.getId());
        dto.setStudentId(alert.getStudent().getId());
        dto.setStudentName(alert.getStudent().getFullName());
        dto.setLevel(alert.getLevel());
        dto.setType(alert.getType());
        dto.setMessage(alert.getMessage());
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setCreatedDate(alert.getCreatedAt() != null ? alert.getCreatedAt().toLocalDate() : null);
        dto.setIsRead(alert.getIsRead());
        dto.setReadAt(alert.getReadAt());
        dto.setIsResolved(alert.getIsResolved());
        dto.setResolvedAt(alert.getResolvedAt());
        dto.setResolvedBy(alert.getResolvedBy());
        return dto;
    }

    // ==================== Inner Classes ====================

    /**
     * Summary class for alert statistics
     */
    public static class AlertSummary {
        private int totalAlerts;
        private int unreadCount;
        private int unresolvedCount;
        private int criticalCount;
        private int highCount;
        private int warningCount;
        private int infoCount;

        // Getters and Setters
        public int getTotalAlerts() { return totalAlerts; }
        public void setTotalAlerts(int totalAlerts) { this.totalAlerts = totalAlerts; }
        
        public int getUnreadCount() { return unreadCount; }
        public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
        
        public int getUnresolvedCount() { return unresolvedCount; }
        public void setUnresolvedCount(int unresolvedCount) { this.unresolvedCount = unresolvedCount; }
        
        public int getCriticalCount() { return criticalCount; }
        public void setCriticalCount(int criticalCount) { this.criticalCount = criticalCount; }
        
        public int getHighCount() { return highCount; }
        public void setHighCount(int highCount) { this.highCount = highCount; }
        
        public int getWarningCount() { return warningCount; }
        public void setWarningCount(int warningCount) { this.warningCount = warningCount; }
        
        public int getInfoCount() { return infoCount; }
        public void setInfoCount(int infoCount) { this.infoCount = infoCount; }
    }
}
