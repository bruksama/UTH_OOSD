package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Alert entity - Auto-generated notifications based on performance criteria.
 * 
 * Created by Observer Pattern when:
 * - GPA falls below threshold (2.0 or 1.5)
 * - Significant GPA drop detected
 * - Academic status changes
 * 
 * OCL Constraints:
 * - createdAt <= CURRENT_TIMESTAMP
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @NotNull(message = "Student reference is required")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    @NotNull(message = "Alert level is required")
    private AlertLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @NotNull(message = "Alert type is required")
    private AlertType type;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Alert message is required")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    /**
     * OCL Constraint: createdAt <= CURRENT_TIMESTAMP
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Alert() {
        this.createdAt = LocalDateTime.now();
    }

    public Alert(Student student, AlertLevel level, AlertType type, String message) {
        this.student = student;
        this.level = level;
        this.type = type;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public AlertLevel getLevel() {
        return level;
    }

    public void setLevel(AlertLevel level) {
        this.level = level;
    }

    public AlertType getType() {
        return type;
    }

    public void setType(AlertType type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        // Enforce OCL constraint
        if (createdAt != null && createdAt.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Created time cannot be in the future");
        }
        this.createdAt = createdAt;
    }

    /**
     * Mark alert as read
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * Mark alert as resolved
     * @param resolvedBy Username of resolver
     */
    public void markAsResolved(String resolvedBy) {
        this.isResolved = true;
        this.resolvedAt = LocalDateTime.now();
        this.resolvedBy = resolvedBy;
    }
}
