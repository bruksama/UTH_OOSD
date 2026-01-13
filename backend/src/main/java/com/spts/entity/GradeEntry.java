package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * GradeEntry entity - Individual grade record.
 * 
 * Can represent either a component score or a final grade.
 * All raw data is normalized to 10-point scale.
 * 
 * OCL Constraints:
 * - value >= 0 and value <= 10 (normalized to 10-point scale)
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "grade_entries")
public class GradeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transcript_id", nullable = false)
    @NotNull(message = "Transcript reference is required")
    private Transcript transcript;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_offering_id", nullable = false)
    @NotNull(message = "Course offering reference is required")
    private CourseOffering courseOffering;

    /**
     * OCL Constraint: value >= 0 and value <= 10
     * All raw scores are normalized to 10-point scale
     */
    @Column(name = "value", nullable = false)
    @NotNull(message = "Grade value is required")
    @DecimalMin(value = "0.0", message = "Grade value cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Grade value cannot exceed 10")
    private Double value;

    /**
     * Weight for component grades (0.0 to 1.0)
     * Final grades have weight = 1.0
     */
    @Column(name = "weight")
    @DecimalMin(value = "0.0", message = "Weight cannot be less than 0")
    @DecimalMax(value = "1.0", message = "Weight cannot exceed 1")
    private Double weight = 1.0;

    /**
     * Type of grade entry
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private GradeEntryType entryType = GradeEntryType.FINAL;

    @Column(name = "component_name", length = 100)
    @Size(max = 100, message = "Component name must not exceed 100 characters")
    private String componentName;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public GradeEntry() {
        this.recordedAt = LocalDateTime.now();
    }

    public GradeEntry(Transcript transcript, CourseOffering courseOffering, Double value) {
        this.transcript = transcript;
        this.courseOffering = courseOffering;
        setValue(value); // Use setter to enforce OCL constraint
        this.recordedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transcript getTranscript() {
        return transcript;
    }

    public void setTranscript(Transcript transcript) {
        this.transcript = transcript;
    }

    public CourseOffering getCourseOffering() {
        return courseOffering;
    }

    public void setCourseOffering(CourseOffering courseOffering) {
        this.courseOffering = courseOffering;
    }

    public Double getValue() {
        return value;
    }

    /**
     * Set grade value with OCL constraint enforcement.
     * @param value Grade value (must be between 0 and 10)
     * @throws IllegalArgumentException if value violates OCL constraint
     */
    public void setValue(Double value) {
        // Enforce OCL constraint: value >= 0 and value <= 10
        if (value != null && (value < 0.0 || value > 10.0)) {
            throw new IllegalArgumentException("Grade value must be between 0 and 10");
        }
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

    /**
     * Calculate the weighted value of this grade entry
     * @return value * weight
     */
    public double getWeightedValue() {
        return value * weight;
    }
}
