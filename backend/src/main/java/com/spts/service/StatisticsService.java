package com.spts.service;

import com.spts.dto.StatisticsDTO.*;
import com.spts.entity.*;
import com.spts.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating advanced statistics for Admin Dashboard.
 * Provides insights on course enrollments, department performance, and trends.
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only handles statistics aggregation
 * - Open/Closed: Uses existing services for data access
 * - Dependency Inversion: Depends on repository abstractions
 * 
 * @author SPTS Team
 */
@Service
@Transactional(readOnly = true)
public class StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public StatisticsService(EnrollmentRepository enrollmentRepository,
                              CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
    }

    // ==================== Core Data Access (DRY - Single Fetch) ====================

    /**
     * Internal cache holder for statistics calculation.
     * Avoids multiple database calls within a single request.
     */
    private static class StatisticsDataCache {
        final List<Enrollment> enrollments;
        final List<Course> courses;

        StatisticsDataCache(List<Enrollment> enrollments, List<Course> courses) {
            this.enrollments = enrollments;
            this.courses = courses;
        }
    }

    /**
     * Fetch all required data once for statistics calculations
     */
    private StatisticsDataCache fetchAllData() {
        return new StatisticsDataCache(
            enrollmentRepository.findAll(),
            courseRepository.findAll()
        );
    }

    // ==================== Statistics Calculations ====================

    /**
     * Get top enrolled courses
     * 
     * @param limit Number of courses to return
     * @return List of courses sorted by enrollment count
     */
    public List<CourseEnrollmentStats> getTopEnrolledCourses(int limit) {
        logger.debug("Getting top {} enrolled courses", limit);
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        return calculateTopCourses(enrollments, limit);
    }

    /**
     * Get statistics by department
     * 
     * @return List of department statistics
     */
    public List<DepartmentStats> getDepartmentStatistics() {
        logger.debug("Getting department statistics");
        StatisticsDataCache cache = fetchAllData();
        return calculateDepartmentStats(cache.enrollments, cache.courses);
    }

    /**
     * Get enrollment trends by semester/year
     * 
     * @return List of enrollment trends
     */
    public List<EnrollmentTrend> getEnrollmentTrends() {
        logger.debug("Getting enrollment trends");
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        return calculateEnrollmentTrends(enrollments);
    }

    /**
     * Get credit distribution statistics
     * 
     * @return List of credit distribution stats
     */
    public List<CreditDistribution> getCreditDistribution() {
        logger.debug("Getting credit distribution");
        StatisticsDataCache cache = fetchAllData();
        return calculateCreditDistribution(cache.enrollments, cache.courses);
    }

    /**
     * Get complete admin dashboard statistics.
     * Uses single data fetch to avoid multiple DB calls (DRY principle).
     * 
     * @return AdminDashboardStats with all statistics
     */
    public AdminDashboardStats getAdminDashboardStats() {
        logger.debug("Getting complete admin dashboard statistics");
        
        // Single data fetch for all calculations (DRY)
        StatisticsDataCache cache = fetchAllData();
        
        AdminDashboardStats stats = new AdminDashboardStats();
        
        // Calculate core stats using cached data
        stats.setTopCourses(calculateTopCourses(cache.enrollments, 10));
        stats.setDepartmentStats(calculateDepartmentStats(cache.enrollments, cache.courses));
        
        // NOTE: Enrollment Trends and Credit Distribution will be developed later
        // stats.setEnrollmentTrends(calculateEnrollmentTrends(cache.enrollments));
        // stats.setCreditDistribution(calculateCreditDistribution(cache.enrollments, cache.courses));
        
        // Calculate summary stats
        stats.setTotalEnrollments((long) cache.enrollments.size());
        stats.setActiveEnrollments(countByStatus(cache.enrollments, EnrollmentStatus.IN_PROGRESS));
        stats.setCompletedEnrollments(countByStatus(cache.enrollments, EnrollmentStatus.COMPLETED));
        stats.setOverallAverageGpa(calculateAverageGpa(cache.enrollments));
        
        return stats;
    }

    // ==================== Private Calculation Methods (Single Responsibility) ====================

    private List<CourseEnrollmentStats> calculateTopCourses(List<Enrollment> enrollments, int limit) {
        // Group by course
        Map<Long, List<Enrollment>> byCourse = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourseOffering().getCourse().getId()));
        
        return byCourse.entrySet().stream()
                .map(entry -> buildCourseStats(entry.getValue()))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(CourseEnrollmentStats::getTotalEnrollments).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private CourseEnrollmentStats buildCourseStats(List<Enrollment> courseEnrollments) {
        if (courseEnrollments.isEmpty()) return null;
        
        Course course = courseEnrollments.get(0).getCourseOffering().getCourse();
        CourseEnrollmentStats stat = new CourseEnrollmentStats();
        
        stat.setCourseCode(course.getCourseCode());
        stat.setCourseName(course.getCourseName());
        stat.setDepartment(course.getDepartment());
        stat.setCredits(course.getCredits());
        stat.setTotalEnrollments((long) courseEnrollments.size());
        stat.setCompletedEnrollments(countByStatus(courseEnrollments, EnrollmentStatus.COMPLETED));
        stat.setAverageScore(calculateAverageScore(courseEnrollments));
        
        return stat;
    }

    private List<DepartmentStats> calculateDepartmentStats(List<Enrollment> enrollments, List<Course> courses) {
        // Group courses by department
        Map<String, List<Course>> coursesByDept = courses.stream()
                .filter(c -> isValidDepartment(c.getDepartment()))
                .collect(Collectors.groupingBy(Course::getDepartment));
        
        // Group enrollments by department
        Map<String, List<Enrollment>> enrollmentsByDept = enrollments.stream()
                .filter(e -> isValidDepartment(e.getCourseOffering().getCourse().getDepartment()))
                .collect(Collectors.groupingBy(e -> e.getCourseOffering().getCourse().getDepartment()));
        
        // Combine all departments
        Set<String> allDepts = new HashSet<>();
        allDepts.addAll(coursesByDept.keySet());
        allDepts.addAll(enrollmentsByDept.keySet());
        
        return allDepts.stream()
                .map(dept -> buildDepartmentStats(dept, coursesByDept, enrollmentsByDept))
                .sorted(Comparator.comparing(DepartmentStats::getTotalEnrollments).reversed())
                .collect(Collectors.toList());
    }

    private DepartmentStats buildDepartmentStats(String dept,
                                                   Map<String, List<Course>> coursesByDept,
                                                   Map<String, List<Enrollment>> enrollmentsByDept) {
        List<Course> deptCourses = coursesByDept.getOrDefault(dept, Collections.emptyList());
        List<Enrollment> deptEnrollments = enrollmentsByDept.getOrDefault(dept, Collections.emptyList());
        
        DepartmentStats stat = new DepartmentStats();
        stat.setDepartment(dept);
        stat.setTotalCourses((long) deptCourses.size());
        stat.setTotalEnrollments((long) deptEnrollments.size());
        stat.setTotalStudents(countUniqueStudents(deptEnrollments));
        stat.setAverageGpa(calculateAverageGpa(deptEnrollments));
        
        return stat;
    }

    private List<EnrollmentTrend> calculateEnrollmentTrends(List<Enrollment> enrollments) {
        // Group by semester_year key
        Map<String, List<Enrollment>> grouped = enrollments.stream()
                .collect(Collectors.groupingBy(this::getSemesterYearKey));
        
        return grouped.entrySet().stream()
                .map(this::buildEnrollmentTrend)
                .sorted(Comparator.comparing(EnrollmentTrend::getAcademicYear)
                        .thenComparing(t -> getSemesterOrder(t.getSemester())))
                .collect(Collectors.toList());
    }

    private EnrollmentTrend buildEnrollmentTrend(Map.Entry<String, List<Enrollment>> entry) {
        String[] parts = entry.getKey().split("_");
        String semester = parts[0];
        Integer year = Integer.parseInt(parts[1]);
        List<Enrollment> periodEnrollments = entry.getValue();
        
        EnrollmentTrend trend = new EnrollmentTrend();
        trend.setSemester(semester);
        trend.setAcademicYear(year);
        trend.setPeriod(formatSemester(semester) + " " + year);
        trend.setEnrollmentCount((long) periodEnrollments.size());
        trend.setCompletedCount(countByStatus(periodEnrollments, EnrollmentStatus.COMPLETED));
        trend.setAverageScore(calculateAverageScore(periodEnrollments));
        
        return trend;
    }

    private List<CreditDistribution> calculateCreditDistribution(List<Enrollment> enrollments, List<Course> courses) {
        // Group courses by credits
        Map<Integer, Long> coursesByCredits = courses.stream()
                .collect(Collectors.groupingBy(Course::getCredits, Collectors.counting()));
        
        // Group enrollments by credits
        Map<Integer, Long> enrollmentsByCredits = enrollments.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCourseOffering().getCourse().getCredits(),
                        Collectors.counting()));
        
        // Combine all credit values
        Set<Integer> allCredits = new HashSet<>();
        allCredits.addAll(coursesByCredits.keySet());
        allCredits.addAll(enrollmentsByCredits.keySet());
        
        return allCredits.stream()
                .map(credit -> new CreditDistribution(
                        credit,
                        coursesByCredits.getOrDefault(credit, 0L),
                        enrollmentsByCredits.getOrDefault(credit, 0L)))
                .sorted(Comparator.comparing(CreditDistribution::getCredits))
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods (Reusable utilities) ====================

    private String getSemesterYearKey(Enrollment e) {
        CourseOffering offering = e.getCourseOffering();
        return offering.getSemester().name() + "_" + offering.getAcademicYear();
    }

    private boolean isValidDepartment(String dept) {
        return dept != null && !dept.isBlank();
    }

    private long countByStatus(List<Enrollment> enrollments, EnrollmentStatus status) {
        return enrollments.stream()
                .filter(e -> e.getStatus() == status)
                .count();
    }

    private long countUniqueStudents(List<Enrollment> enrollments) {
        return enrollments.stream()
                .map(e -> e.getStudent().getId())
                .distinct()
                .count();
    }

    private double calculateAverageGpa(List<Enrollment> enrollments) {
        return round(enrollments.stream()
                .filter(e -> e.getGpaValue() != null)
                .mapToDouble(Enrollment::getGpaValue)
                .average()
                .orElse(0.0));
    }

    private double calculateAverageScore(List<Enrollment> enrollments) {
        return round(enrollments.stream()
                .filter(e -> e.getFinalScore() != null)
                .mapToDouble(Enrollment::getFinalScore)
                .average()
                .orElse(0.0));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String formatSemester(String semester) {
        switch (semester) {
            case "SPRING": return "Spring";
            case "SUMMER": return "Summer";
            case "FALL": return "Fall";
            case "WINTER": return "Winter";
            default: return semester;
        }
    }

    private int getSemesterOrder(String semester) {
        switch (semester) {
            case "SPRING": return 1;
            case "SUMMER": return 2;
            case "FALL": return 3;
            case "WINTER": return 4;
            default: return 5;
        }
    }
}
