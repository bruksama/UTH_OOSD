package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Transcript entity - Central academic record for a student.
 * 
 * Contains all grade entries and calculated academic metrics.
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "transcripts")
public class Transcript {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", unique = true, nullable = false)
    @NotNull(message = "Student reference is required")
    private Student student;

    /**
     * Cumulative GPA on 4-point scale
     * OCL Constraint: cumulativeGpa >= 0.0 and cumulativeGpa <= 4.0
     */
    @Column(name = "cumulative_gpa")
    @DecimalMin(value = "0.0", message = "Cumulative GPA cannot be less than 0.0")
    @DecimalMax(value = "4.0", message = "Cumulative GPA cannot exceed 4.0")
    private Double cumulativeGpa;

    @Column(name = "total_credits_earned")
    @Min(value = 0, message = "Total credits earned cannot be negative")
    private Integer totalCreditsEarned = 0;

    @Column(name = "total_credits_attempted")
    @Min(value = 0, message = "Total credits attempted cannot be negative")
    private Integer totalCreditsAttempted = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "transcript", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GradeEntry> gradeEntries = new ArrayList<>();

    // Constructors
    public Transcript() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Transcript(Student student) {
        this.student = student;
        this.lastUpdated = LocalDateTime.now();
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

    public Double getCumulativeGpa() {
        return cumulativeGpa;
    }

    public void setCumulativeGpa(Double cumulativeGpa) {
        // Enforce OCL constraint
        if (cumulativeGpa != null && (cumulativeGpa < 0.0 || cumulativeGpa > 4.0)) {
            throw new IllegalArgumentException("Cumulative GPA must be between 0.0 and 4.0");
        }
        this.cumulativeGpa = cumulativeGpa;
    }

    public Integer getTotalCreditsEarned() {
        return totalCreditsEarned;
    }

    public void setTotalCreditsEarned(Integer totalCreditsEarned) {
        this.totalCreditsEarned = totalCreditsEarned;
    }

    public Integer getTotalCreditsAttempted() {
        return totalCreditsAttempted;
    }

    public void setTotalCreditsAttempted(Integer totalCreditsAttempted) {
        this.totalCreditsAttempted = totalCreditsAttempted;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public List<GradeEntry> getGradeEntries() {
        return gradeEntries;
    }

    public void setGradeEntries(List<GradeEntry> gradeEntries) {
        this.gradeEntries = gradeEntries;
    }

    public void addGradeEntry(GradeEntry gradeEntry) {
        gradeEntries.add(gradeEntry);
        gradeEntry.setTranscript(this);
        this.lastUpdated = LocalDateTime.now();
    }

    /**
     * Calculate credit completion rate
     * @return Percentage of credits earned vs attempted
     */
    public double getCreditCompletionRate() {
        if (totalCreditsAttempted == null || totalCreditsAttempted == 0) {
            return 0.0;
        }
        return (double) totalCreditsEarned / totalCreditsAttempted * 100;
    }
}
