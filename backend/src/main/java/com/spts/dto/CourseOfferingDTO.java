package com.spts.dto;

import com.spts.entity.Semester;
import jakarta.validation.constraints.*;

/**
 * Data Transfer Object for CourseOffering entity.
 * 
 * @author SPTS Team
 */
public class CourseOfferingDTO {

    private Long id;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String courseCode;
    private String courseName;
    private Integer credits;

    @NotNull(message = "Semester is required")
    private Semester semester;

    @NotNull(message = "Academic year is required")
    @Min(value = 2000, message = "Academic year must be 2000 or later")
    @Max(value = 2100, message = "Academic year must be before 2100")
    private Integer academicYear;

    private String instructor;
    private Integer maxEnrollment;
    private Integer currentEnrollment;

    // Constructors
    public CourseOfferingDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
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

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
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

    public String getDisplayName() {
        return courseName + " - " + semester.getDisplayName() + " " + academicYear;
    }
}
