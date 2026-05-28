package com.spts.dto;

import com.spts.entity.EnrollmentStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Enrollment entity.
 * 
 * @author SPTS Team
 */
public class EnrollmentDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String studentName;
    private String studentCode;

    @NotNull(message = "Course offering ID is required")
    private Long courseOfferingId;
    
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String semester;
    private Integer academicYear;

    @DecimalMin(value = "0.0", message = "Final score cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Final score cannot exceed 10")
    private Double finalScore;

    private String letterGrade;

    @DecimalMin(value = "0.0", message = "GPA value cannot be less than 0")
    @DecimalMax(value = "4.0", message = "GPA value cannot exceed 4.0")
    private Double gpaValue;

    private EnrollmentStatus status;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    private List<GradeEntryDTO> gradeEntries;

    // Constructors
    public EnrollmentDTO() {
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

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
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

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
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

    public List<GradeEntryDTO> getGradeEntries() {
        return gradeEntries;
    }

    public void setGradeEntries(List<GradeEntryDTO> gradeEntries) {
        this.gradeEntries = gradeEntries;
    }

    /**
     * Get display name combining course and semester info
     */
    public String getDisplayName() {
        return courseName + " - " + semester + " " + academicYear;
    }
}
