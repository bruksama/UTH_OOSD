package com.spts.dto;

import java.util.List;

/**
 * DTOs for advanced statistics in Admin Dashboard
 * 
 * @author SPTS Team
 */
public class StatisticsDTO {

    /**
     * Course enrollment statistics
     */
    public static class CourseEnrollmentStats {
        private String courseCode;
        private String courseName;
        private String department;
        private Integer credits;
        private Long totalEnrollments;
        private Long completedEnrollments;
        private Double averageScore;

        public CourseEnrollmentStats() {}

        public CourseEnrollmentStats(String courseCode, String courseName, String department, 
                                      Integer credits, Long totalEnrollments) {
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.department = department;
            this.credits = credits;
            this.totalEnrollments = totalEnrollments;
        }

        // Getters and Setters
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public Integer getCredits() { return credits; }
        public void setCredits(Integer credits) { this.credits = credits; }
        public Long getTotalEnrollments() { return totalEnrollments; }
        public void setTotalEnrollments(Long totalEnrollments) { this.totalEnrollments = totalEnrollments; }
        public Long getCompletedEnrollments() { return completedEnrollments; }
        public void setCompletedEnrollments(Long completedEnrollments) { this.completedEnrollments = completedEnrollments; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    }

    /**
     * Department statistics
     */
    public static class DepartmentStats {
        private String department;
        private Long totalCourses;
        private Long totalEnrollments;
        private Long totalStudents;
        private Double averageGpa;

        public DepartmentStats() {}

        public DepartmentStats(String department, Long totalCourses, Long totalEnrollments) {
            this.department = department;
            this.totalCourses = totalCourses;
            this.totalEnrollments = totalEnrollments;
        }

        // Getters and Setters
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public Long getTotalCourses() { return totalCourses; }
        public void setTotalCourses(Long totalCourses) { this.totalCourses = totalCourses; }
        public Long getTotalEnrollments() { return totalEnrollments; }
        public void setTotalEnrollments(Long totalEnrollments) { this.totalEnrollments = totalEnrollments; }
        public Long getTotalStudents() { return totalStudents; }
        public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }
        public Double getAverageGpa() { return averageGpa; }
        public void setAverageGpa(Double averageGpa) { this.averageGpa = averageGpa; }
    }

    /**
     * Enrollment trend by semester/year
     */
    public static class EnrollmentTrend {
        private String semester;
        private Integer academicYear;
        private String period; // e.g., "Fall 2024"
        private Long enrollmentCount;
        private Long completedCount;
        private Double averageScore;

        public EnrollmentTrend() {}

        public EnrollmentTrend(String semester, Integer academicYear, Long enrollmentCount) {
            this.semester = semester;
            this.academicYear = academicYear;
            this.period = semester + " " + academicYear;
            this.enrollmentCount = enrollmentCount;
        }

        // Getters and Setters
        public String getSemester() { return semester; }
        public void setSemester(String semester) { this.semester = semester; }
        public Integer getAcademicYear() { return academicYear; }
        public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public Long getEnrollmentCount() { return enrollmentCount; }
        public void setEnrollmentCount(Long enrollmentCount) { this.enrollmentCount = enrollmentCount; }
        public Long getCompletedCount() { return completedCount; }
        public void setCompletedCount(Long completedCount) { this.completedCount = completedCount; }
        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    }

    /**
     * Credit distribution statistics
     */
    public static class CreditDistribution {
        private Integer credits;
        private Long courseCount;
        private Long enrollmentCount;

        public CreditDistribution() {}

        public CreditDistribution(Integer credits, Long courseCount, Long enrollmentCount) {
            this.credits = credits;
            this.courseCount = courseCount;
            this.enrollmentCount = enrollmentCount;
        }

        // Getters and Setters
        public Integer getCredits() { return credits; }
        public void setCredits(Integer credits) { this.credits = credits; }
        public Long getCourseCount() { return courseCount; }
        public void setCourseCount(Long courseCount) { this.courseCount = courseCount; }
        public Long getEnrollmentCount() { return enrollmentCount; }
        public void setEnrollmentCount(Long enrollmentCount) { this.enrollmentCount = enrollmentCount; }
    }

    /**
     * Complete dashboard statistics response
     */
    public static class AdminDashboardStats {
        private List<CourseEnrollmentStats> topCourses;
        private List<DepartmentStats> departmentStats;
        private List<EnrollmentTrend> enrollmentTrends;
        private List<CreditDistribution> creditDistribution;
        
        // Summary stats
        private Long totalEnrollments;
        private Long activeEnrollments;
        private Long completedEnrollments;
        private Double overallAverageGpa;

        public AdminDashboardStats() {}

        // Getters and Setters
        public List<CourseEnrollmentStats> getTopCourses() { return topCourses; }
        public void setTopCourses(List<CourseEnrollmentStats> topCourses) { this.topCourses = topCourses; }
        public List<DepartmentStats> getDepartmentStats() { return departmentStats; }
        public void setDepartmentStats(List<DepartmentStats> departmentStats) { this.departmentStats = departmentStats; }
        public List<EnrollmentTrend> getEnrollmentTrends() { return enrollmentTrends; }
        public void setEnrollmentTrends(List<EnrollmentTrend> enrollmentTrends) { this.enrollmentTrends = enrollmentTrends; }
        public List<CreditDistribution> getCreditDistribution() { return creditDistribution; }
        public void setCreditDistribution(List<CreditDistribution> creditDistribution) { this.creditDistribution = creditDistribution; }
        public Long getTotalEnrollments() { return totalEnrollments; }
        public void setTotalEnrollments(Long totalEnrollments) { this.totalEnrollments = totalEnrollments; }
        public Long getActiveEnrollments() { return activeEnrollments; }
        public void setActiveEnrollments(Long activeEnrollments) { this.activeEnrollments = activeEnrollments; }
        public Long getCompletedEnrollments() { return completedEnrollments; }
        public void setCompletedEnrollments(Long completedEnrollments) { this.completedEnrollments = completedEnrollments; }
        public Double getOverallAverageGpa() { return overallAverageGpa; }
        public void setOverallAverageGpa(Double overallAverageGpa) { this.overallAverageGpa = overallAverageGpa; }
    }
}
