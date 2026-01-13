package com.spts.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Transcript entity.
 * 
 * @author SPTS Team
 */
public class TranscriptDTO {

    private Long id;
    private Long studentId;
    private String studentName;
    private Double cumulativeGpa;
    private Integer totalCreditsEarned;
    private Integer totalCreditsAttempted;
    private Double creditCompletionRate;
    private LocalDateTime lastUpdated;
    private List<GradeEntryDTO> gradeEntries;

    // Constructors
    public TranscriptDTO() {
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

    public Double getCumulativeGpa() {
        return cumulativeGpa;
    }

    public void setCumulativeGpa(Double cumulativeGpa) {
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

    public Double getCreditCompletionRate() {
        return creditCompletionRate;
    }

    public void setCreditCompletionRate(Double creditCompletionRate) {
        this.creditCompletionRate = creditCompletionRate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public List<GradeEntryDTO> getGradeEntries() {
        return gradeEntries;
    }

    public void setGradeEntries(List<GradeEntryDTO> gradeEntries) {
        this.gradeEntries = gradeEntries;
    }
}
