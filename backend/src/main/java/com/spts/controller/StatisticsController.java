package com.spts.controller;

import com.spts.dto.StatisticsDTO.*;
import com.spts.service.StatisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for statistics endpoints.
 * Provides advanced analytics data for Admin Dashboard.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsController.class);

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Get complete admin dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        logger.info("GET /api/statistics/dashboard - Getting complete dashboard stats");
        AdminDashboardStats stats = statisticsService.getAdminDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top enrolled courses
     * 
     * @param limit Number of courses to return (default: 10)
     */
    @GetMapping("/top-courses")
    public ResponseEntity<List<CourseEnrollmentStats>> getTopCourses(
            @RequestParam(defaultValue = "10") int limit) {
        logger.info("GET /api/statistics/top-courses - Getting top {} courses", limit);
        List<CourseEnrollmentStats> stats = statisticsService.getTopEnrolledCourses(limit);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get department statistics
     */
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentStats>> getDepartmentStats() {
        logger.info("GET /api/statistics/departments - Getting department statistics");
        List<DepartmentStats> stats = statisticsService.getDepartmentStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get enrollment trends by semester/year
     */
    @GetMapping("/enrollment-trends")
    public ResponseEntity<List<EnrollmentTrend>> getEnrollmentTrends() {
        logger.info("GET /api/statistics/enrollment-trends - Getting enrollment trends");
        List<EnrollmentTrend> trends = statisticsService.getEnrollmentTrends();
        return ResponseEntity.ok(trends);
    }

    /**
     * Get credit distribution
     */
    @GetMapping("/credit-distribution")
    public ResponseEntity<List<CreditDistribution>> getCreditDistribution() {
        logger.info("GET /api/statistics/credit-distribution - Getting credit distribution");
        List<CreditDistribution> distribution = statisticsService.getCreditDistribution();
        return ResponseEntity.ok(distribution);
    }
}
