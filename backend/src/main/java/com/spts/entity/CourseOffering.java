package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

/**
 * CourseOffering entity - Occurrence in Abstraction-Occurrence Pattern.
 * 
 * Represents a specific offering of a course in a particular semester.
 * Example: "Introduction to Software Engineering - Fall 2024"
 * 
 * Reference: OOSD Chapter 6 - Abstraction-Occurrence Pattern
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "course_offerings", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "semester", "academic_year"}))
public class CourseOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the abstract Course definition
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @NotNull(message = "Course reference is required")
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester", nullable = false)
    @NotNull(message = "Semester is required")
    private Semester semester;

    @Column(name = "academic_year", nullable = false)
    @NotNull(message = "Academic year is required")
    @Min(value = 2000, message = "Academic year must be 2000 or later")
    @Max(value = 2100, message = "Academic year must be before 2100")
    private Integer academicYear;

    @Column(name = "instructor", length = 100)
    @Size(max = 100, message = "Instructor name must not exceed 100 characters")
    private String instructor;

    @Column(name = "max_enrollment")
    @Min(value = 1, message = "Max enrollment must be at least 1")
    private Integer maxEnrollment;

    @Column(name = "current_enrollment")
    @Min(value = 0, message = "Current enrollment cannot be negative")
    private Integer currentEnrollment = 0;

    /**
     * Grading scale for this course offering.
     * Supports Strategy Pattern for dynamic grading.
     * Values: SCALE_10 (default), SCALE_4, PASS_FAIL
     */
    @Column(name = "grading_scale", length = 20)
    private String gradingScale = "SCALE_10";

    /**
     * Enrollments in this course offering
     */
    @OneToMany(mappedBy = "courseOffering", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Enrollment> enrollments = new ArrayList<>();

    // Constructors
    public CourseOffering() {
    }

    public CourseOffering(Course course, Semester semester, Integer academicYear) {
        this.course = course;
        this.semester = semester;
        this.academicYear = academicYear;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Semester getSemester() {
        return semester;
    }

    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public Integer getMaxEnrollment() {
        return maxEnrollment;
    }

    public void setMaxEnrollment(Integer maxEnrollment) {
        this.maxEnrollment = maxEnrollment;
    }

    public Integer getCurrentEnrollment() {
        return currentEnrollment;
    }

    public void setCurrentEnrollment(Integer currentEnrollment) {
        this.currentEnrollment = currentEnrollment;
    }

    public List<Enrollment> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<Enrollment> enrollments) {
        this.enrollments = enrollments;
    }

    public String getGradingScale() {
        return gradingScale;
    }

    public void setGradingScale(String gradingScale) {
        this.gradingScale = gradingScale != null ? gradingScale : "SCALE_10";
    }

    public void addEnrollment(Enrollment enrollment) {
        enrollments.add(enrollment);
        enrollment.setCourseOffering(this);
        this.currentEnrollment = enrollments.size();
    }

    /**
     * Get the display name combining course info and semester/year
     */
    public String getDisplayName() {
        return course.getCourseName() + " - " + semester.getDisplayName() + " " + academicYear;
    }

    /**
     * Check if there are available seats
     */
    public boolean hasAvailableSeats() {
        return maxEnrollment == null || currentEnrollment < maxEnrollment;
    }

    /**
     * Get available seats count
     */
    public Integer getAvailableSeats() {
        return maxEnrollment != null ? maxEnrollment - currentEnrollment : null;
    }
}