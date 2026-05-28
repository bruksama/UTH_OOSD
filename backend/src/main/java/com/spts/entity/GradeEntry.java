package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * GradeEntry entity - Individual grade record with Composite Pattern support.
 * 
 * Supports hierarchical grade structure through self-referencing parent_id:
 * - Root entries have parent_id = null
 * - Child entries reference their parent (e.g., Lab -> Quiz1, Quiz2)
 * 
 * All raw data is normalized to 10-point scale.
 * 
 * OCL Constraints:
 * - score >= 0 AND score <= 10 (normalized to 10-point scale)
 * - weight >= 0 AND weight <= 1
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "grade_entries")
public class GradeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the enrollment (student + course offering)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    @NotNull(message = "Enrollment is required")
    private Enrollment enrollment;

    /**
     * Self-reference for Composite Pattern
     * NULL for root grade entries, points to parent for child entries
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private GradeEntry parent;

    /**
     * Child grade entries (for Composite Pattern)
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GradeEntry> children = new ArrayList<>();

    /**
     * Name of the grade component (e.g., Midterm, Lab, Quiz1)
     */
    @Column(name = "name", nullable = false, length = 100)
    @NotBlank(message = "Grade entry name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    /**
     * Weight for this grade component (0.0 to 1.0)
     * OCL: weight >= 0 AND weight <= 1
     */
    @Column(name = "weight", nullable = false)
    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.0", message = "Weight cannot be less than 0")
    @DecimalMax(value = "1.0", message = "Weight cannot exceed 1")
    private Double weight;

    /**
     * Score value on 10-point scale
     * OCL: score >= 0 AND score <= 10
     */
    @Column(name = "score")
    @DecimalMin(value = "0.0", message = "Score cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Score cannot exceed 10")
    private Double score;

    /**
     * Type of grade entry: COMPONENT or FINAL
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    @NotNull(message = "Entry type is required")
    private GradeEntryType entryType = GradeEntryType.COMPONENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = true, columnDefinition = "varchar(255) default 'APPROVED'")
    private ApprovalStatus status = ApprovalStatus.APPROVED;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Constructors
    public GradeEntry() {
        this.recordedAt = LocalDateTime.now();
    }

    public GradeEntry(Enrollment enrollment, String name, Double weight) {
        this.enrollment = enrollment;
        this.name = name;
        this.weight = weight;
        this.entryType = GradeEntryType.COMPONENT;
        this.recordedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Enrollment getEnrollment() {
        return enrollment;
    }

    public void setEnrollment(Enrollment enrollment) {
        this.enrollment = enrollment;
    }

    public GradeEntry getParent() {
        return parent;
    }

    public void setParent(GradeEntry parent) {
        this.parent = parent;
    }

    public List<GradeEntry> getChildren() {
        return children;
    }

    public void setChildren(List<GradeEntry> children) {
        this.children = children;
    }

    /**
     * Add a child grade entry (Composite Pattern)
     */
    public void addChild(GradeEntry child) {
        children.add(child);
        child.setParent(this);
        child.setEnrollment(this.enrollment);
    }

    /**
     * Remove a child grade entry
     */
    public void removeChild(GradeEntry child) {
        children.remove(child);
        child.setParent(null);
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
        if (weight != null && (weight < 0.0 || weight > 1.0)) {
            throw new IllegalArgumentException("Weight must be between 0 and 1");
        }
        this.weight = weight;
    }

    public Double getScore() {
        return score;
    }

    /**
     * Set score with OCL constraint enforcement
     */
    public void setScore(Double score) {
        if (score != null && (score < 0.0 || score > 10.0)) {
            throw new IllegalArgumentException("Score must be between 0 and 10");
        }
        this.score = score;
    }

    public GradeEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(GradeEntryType entryType) {
        this.entryType = entryType;
    }

    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(ApprovalStatus status) {
        this.status = status;
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

    /**
     * Check if this is a leaf node (no children)
     */
    public boolean isLeaf() {
        return children == null || children.isEmpty();
    }

    /**
     * Check if this is a root node (no parent)
     */
    public boolean isRoot() {
        return parent == null;
    }

    /**
     * Calculate weighted score for this entry
     * For composite entries, recursively calculates from children
     */
    public Double calculateWeightedScore() {
        if (isLeaf()) {
            // Leaf node: return direct weighted score
            return score != null ? score * weight : null;
        } else {
            // Composite node: calculate from children
            double totalWeightedScore = 0.0;
            double totalWeight = 0.0;
            
            for (GradeEntry child : children) {
                Double childScore = child.calculateWeightedScore();
                if (childScore != null) {
                    totalWeightedScore += childScore;
                    totalWeight += child.getWeight();
                }
            }
            
            if (totalWeight > 0) {
                // Normalize and apply this entry's weight
                return (totalWeightedScore / totalWeight) * weight;
            }
            return null;
        }
    }

    /**
     * Get the calculated score (for composite, calculated from children)
     */
    public Double getCalculatedScore() {
        if (isLeaf()) {
            return score;
        } else {
            double totalWeightedScore = 0.0;
            double totalWeight = 0.0;
            
            for (GradeEntry child : children) {
                Double childScore = child.getCalculatedScore();
                if (childScore != null) {
                    totalWeightedScore += childScore * child.getWeight();
                    totalWeight += child.getWeight();
                }
            }
            
            return totalWeight > 0 ? totalWeightedScore / totalWeight : null;
        }
    }
}
