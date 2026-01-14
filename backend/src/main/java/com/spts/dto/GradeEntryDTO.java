package com.spts.dto;

import com.spts.entity.GradeEntryType;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for GradeEntry entity.
 * Supports hierarchical structure for Composite Pattern.
 * 
 * @author SPTS Team
 */
public class GradeEntryDTO {

    private Long id;

    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;

    /**
     * Parent grade entry ID for Composite Pattern
     * NULL for root entries
     */
    private Long parentId;

    /**
     * Child grade entries (for hierarchical display)
     */
    private List<GradeEntryDTO> children;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.0", message = "Weight cannot be less than 0")
    @DecimalMax(value = "1.0", message = "Weight cannot exceed 1")
    private Double weight;

    @DecimalMin(value = "0.0", message = "Score cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Score cannot exceed 10")
    private Double score;

    /**
     * Calculated score (for composite entries)
     */
    private Double calculatedScore;

    private GradeEntryType entryType;
    private String recordedBy;
    private LocalDateTime recordedAt;
    private String notes;

    // Additional display fields
    private String courseCode;
    private String courseName;
    private String studentName;

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

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<GradeEntryDTO> getChildren() {
        return children;
    }

    public void setChildren(List<GradeEntryDTO> children) {
        this.children = children;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Double getCalculatedScore() {
        return calculatedScore;
    }

    public void setCalculatedScore(Double calculatedScore) {
        this.calculatedScore = calculatedScore;
    }

    public GradeEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(GradeEntryType entryType) {
        this.entryType = entryType;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    /**
     * Calculate weighted value
     */
    public Double getWeightedValue() {
        Double effectiveScore = calculatedScore != null ? calculatedScore : score;
        if (effectiveScore == null || weight == null) return null;
        return effectiveScore * weight;
    }

    /**
     * Check if this is a leaf entry (no children)
     */
    public boolean isLeaf() {
        return children == null || children.isEmpty();
    }

    /**
     * Check if this is a root entry (no parent)
     */
    public boolean isRoot() {
        return parentId == null;
    }
}
