package com.spts.dto;

import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Alert entity.
 * 
 * @author SPTS Team
 */
public class AlertDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private AlertLevel level;
    private AlertType type;
    private String message;
    private LocalDate createdDate;
    private LocalDateTime createdAt;
    private Boolean isRead;
    private LocalDateTime readAt;
    private Boolean isResolved;
    private LocalDateTime resolvedAt;
    private String resolvedBy;

    // Constructors
    public AlertDTO() {
    }

    public AlertDTO(Long studentId, AlertLevel level, AlertType type, String message) {
        this.studentId = studentId;
        this.level = level;
        this.type = type;
        this.message = message;
        this.createdDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
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

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
}
