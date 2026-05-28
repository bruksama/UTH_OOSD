package com.spts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Course entity - Abstraction in Abstraction-Occurrence Pattern.
 * 
 * Represents the general course definition (e.g., "Introduction to Software Engineering").
 * Specific offerings are represented by CourseOffering entity.
 * 
 * Reference: OOSD Chapter 6 - Abstraction-Occurrence Pattern
 * 
 * @author SPTS Team
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", unique = true, nullable = false, length = 20)
    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code must not exceed 20 characters")
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 200)
    @NotBlank(message = "Course name is required")
    @Size(max = 200, message = "Course name must not exceed 200 characters")
    private String courseName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "credits", nullable = false)
    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 12, message = "Credits cannot exceed 12")
    private Integer credits;

    @Column(name = "department", length = 100)
    @Size(max = 100, message = "Department name must not exceed 100 characters")
    private String department;

    /**
     * Grading type determines which strategy to use
     * Values: SCALE_10, SCALE_4, PASS_FAIL
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "grading_type", nullable = false)
    private GradingType gradingType = GradingType.SCALE_10;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = true, columnDefinition = "varchar(255) default 'APPROVED'")
    private ApprovalStatus status = ApprovalStatus.APPROVED;

    @Column(name = "creator_email")
    private String creatorEmail;

    /**
     * One-to-Many relationship with CourseOffering (Occurrence)
     * A Course can have multiple offerings across different semesters
     */
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseOffering> offerings = new ArrayList<>();

    // Constructors
    public Course() {
    }

    public Course(String courseCode, String courseName, Integer credits) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.credits = credits;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public GradingType getGradingType() {
        return gradingType;
    }

    public void setGradingType(GradingType gradingType) {
        this.gradingType = gradingType;
    }

    public List<CourseOffering> getOfferings() {
        return offerings;
    }

    public void setOfferings(List<CourseOffering> offerings) {
        this.offerings = offerings;
    }

    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(ApprovalStatus status) {
        this.status = status;
    }

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public void setCreatorEmail(String creatorEmail) {
        this.creatorEmail = creatorEmail;
    }

    public void addOffering(CourseOffering offering) {
        offerings.add(offering);
        offering.setCourse(this);
    }
}
