package com.spts.dto;

import com.spts.entity.GradeEntryType;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for GradeEntry entity.
 * 
 * @author SPTS Team
 */
public class GradeEntryDTO {

    private Long id;

    @NotNull(message = "Transcript ID is required")
    private Long transcriptId;

    @NotNull(message = "Course offering ID is required")
    private Long courseOfferingId;
    
    private String courseCode;
    private String courseName;

    @NotNull(message = "Grade value is required")
    @DecimalMin(value = "0.0", message = "Grade value cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Grade value cannot exceed 10")
    private Double value;

    @DecimalMin(value = "0.0", message = "Weight cannot be less than 0")
    @DecimalMax(value = "1.0", message = "Weight cannot exceed 1")
    private Double weight;

    private GradeEntryType entryType;
    private String componentName;
    private LocalDateTime recordedAt;
    private String recordedBy;
    private String notes;

    // Constructors
    public GradeEntryDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTranscriptId() {
        return transcriptId;
    }

    public void setTranscriptId(Long transcriptId) {
        this.transcriptId = transcriptId;
    }

    public Long getCourseOfferingId() {
        return courseOfferingId;
    }

    public void setCourseOfferingId(Long courseOfferingId) {
        this.courseOfferingId = courseOfferingId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public GradeEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(GradeEntryType entryType) {
        this.entryType = entryType;
    }

    public String getComponentName() {
        return componentName;
    }

    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getWeightedValue() {
        if (value == null || weight == null) return null;
        return value * weight;
    }
}
