package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Enrollment entity - Represents a student's enrollment in a specific course offering.
 * 
 * This is a junction table between Student and CourseOffering that also stores
 * the final grade and enrollment status.
 * 
 * OCL Constraints:
 * - finalScore >= 0 AND finalScore <= 10
 * - gpaValue >= 0.0 AND gpaValue <= 4.0
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"student_id", "course_offering_id"},
           name = "uk_enrollment_student_offering"
       ))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @NotNull(message = "Student is required")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_offering_id", nullable = false)
    @NotNull(message = "Course offering is required")
    private CourseOffering courseOffering;

    /**
     * Final score on 10-point scale
     * OCL: finalScore >= 0 AND finalScore <= 10
     */
    @Column(name = "final_score")
    @DecimalMin(value = "0.0", message = "Final score cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Final score cannot exceed 10")
    private Double finalScore;

    /**
     * Letter grade (A, B+, B, C+, C, D+, D, F)
     */
    @Column(name = "letter_grade", length = 2)
    private String letterGrade;

    /**
     * GPA value on 4-point scale
     * OCL: gpaValue >= 0.0 AND gpaValue <= 4.0
     */
    @Column(name = "gpa_value")
    @DecimalMin(value = "0.0", message = "GPA value cannot be less than 0")
    @DecimalMax(value = "4.0", message = "GPA value cannot exceed 4.0")
    private Double gpaValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.IN_PROGRESS;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * Grade entries for this enrollment (component scores and final grade)
     */
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GradeEntry> gradeEntries = new ArrayList<>();

    // Constructors
    public Enrollment() {
        this.enrolledAt = LocalDateTime.now();
    }

    public Enrollment(Student student, CourseOffering courseOffering) {
        this.student = student;
        this.courseOffering = courseOffering;
        this.status = EnrollmentStatus.IN_PROGRESS;
        this.enrolledAt = LocalDateTime.now();
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

    public CourseOffering getCourseOffering() {
        return courseOffering;
    }

    public void setCourseOffering(CourseOffering courseOffering) {
        this.courseOffering = courseOffering;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        Double normalizedScore = normalizeScore(finalScore);
        if (normalizedScore == null) {
            this.finalScore = null;
            this.letterGrade = null;
            this.gpaValue = null;
            return;
        }

        this.finalScore = normalizedScore;
        // Auto-calculate letter grade and GPA value
        this.letterGrade = calculateLetterGrade(normalizedScore);
        this.gpaValue = calculateGpaValue(normalizedScore);
    }

    public String getLetterGrade() {
        return letterGrade;
    }

    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }

    public Double getGpaValue() {
        return gpaValue;
    }

    public void setGpaValue(Double gpaValue) {
        if (gpaValue != null && (gpaValue < 0.0 || gpaValue > 4.0)) {
            throw new IllegalArgumentException("GPA value must be between 0 and 4");
        }
        this.gpaValue = gpaValue;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public List<GradeEntry> getGradeEntries() {
        return gradeEntries;
    }

    public void setGradeEntries(List<GradeEntry> gradeEntries) {
        this.gradeEntries = gradeEntries;
    }

    public void addGradeEntry(GradeEntry gradeEntry) {
        gradeEntries.add(gradeEntry);
        gradeEntry.setEnrollment(this);
    }

    /**
     * Mark enrollment as completed with final score
     */
    public void complete(Double finalScore) {
        setFinalScore(finalScore);
        this.status = EnrollmentStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * Mark enrollment as withdrawn
     */
    public void withdraw() {
        this.status = EnrollmentStatus.WITHDRAWN;
        this.completedAt = LocalDateTime.now();
    }

    private Double normalizeScore(Double score) {
        if (score == null || !Double.isFinite(score)) {
            return null;
        }
        return Math.max(0.0, Math.min(10.0, score));
    }

    /**
     * Calculate letter grade from score (10-point scale)
     */
    private String calculateLetterGrade(double score) {
        if (score >= 9.0) return "A";
        if (score >= 8.5) return "A-";
        if (score >= 8.0) return "B+";
        if (score >= 7.0) return "B";
        if (score >= 6.5) return "C+";
        if (score >= 5.5) return "C";
        if (score >= 5.0) return "D+";
        if (score >= 4.0) return "D";
        return "F";
    }

    /**
     * Calculate GPA value from score (10-point to 4-point conversion)
     */
    private double calculateGpaValue(double score) {
        if (score >= 9.0) return 4.0;
        if (score >= 8.5) return 3.7;
        if (score >= 8.0) return 3.5;
        if (score >= 7.0) return 3.0;
        if (score >= 6.5) return 2.5;
        if (score >= 5.5) return 2.0;
        if (score >= 5.0) return 1.5;
        if (score >= 4.0) return 1.0;
        return 0.0;
    }

    /**
     * Get course credits (delegated from course offering)
     */
    public Integer getCredits() {
        return courseOffering != null && courseOffering.getCourse() != null 
               ? courseOffering.getCourse().getCredits() 
               : 0;
    }
}
