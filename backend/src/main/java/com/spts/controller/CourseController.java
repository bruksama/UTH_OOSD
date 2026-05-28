package com.spts.controller;

import com.spts.dto.CourseDTO;
import com.spts.dto.CourseOfferingDTO;
import com.spts.entity.GradingType;
import com.spts.service.CourseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Course management.
 * Provides endpoints for CRUD operations and course queries.
 * 
 * Course represents the Abstraction in Abstraction-Occurrence Pattern.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/courses")
@Tag(name = "Courses", description = "Course management APIs")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all courses", description = "Retrieves a list of all courses in the system")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of courses")
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID", description = "Retrieves a course by its database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Course found"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDTO> getCourseById(
            @Parameter(description = "Course database ID") @PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get course by course code", description = "Retrieves a course by its course code (e.g., CS101)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Course found"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDTO> getByCourseCode(
            @Parameter(description = "Course code (e.g., CS101)") @PathVariable String code) {
        return ResponseEntity.ok(courseService.getCourseByCourseCode(code));
    }

    @PostMapping
    @Operation(summary = "Create new course", description = "Creates a new course record")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Course created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "Course code already exists")
    })
    public ResponseEntity<CourseDTO> createCourse(
            @Valid @RequestBody CourseDTO dto) {
        return new ResponseEntity<>(courseService.createCourse(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course", description = "Updates an existing course record")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Course updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Course not found"),
        @ApiResponse(responseCode = "409", description = "Course code already exists")
    })
    public ResponseEntity<CourseDTO> updateCourse(
            @Parameter(description = "Course database ID") @PathVariable Long id,
            @Valid @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(courseService.updateCourse(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete course", description = "Deletes a course record (fails if course has offerings)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Course deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Course has existing offerings"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<Void> deleteCourse(
            @Parameter(description = "Course database ID") @PathVariable Long id,
            @RequestParam(required = false) String email,
            @RequestParam(required = false, defaultValue = "student") String role) {
        courseService.deleteCourseWithAuth(id, email, role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve course proposal", description = "Approves a student-submitted course proposal")
    public ResponseEntity<CourseDTO> approveCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.approveCourse(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject course proposal", description = "Rejects a student-submitted course proposal")
    public ResponseEntity<CourseDTO> rejectCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.rejectCourse(id));
    }

    // ==================== Related Data ====================

    @GetMapping("/{id}/offerings")
    @Operation(summary = "Get course offerings", description = "Retrieves all offerings for a course (Abstraction-Occurrence pattern)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<List<CourseOfferingDTO>> getCourseOfferings(
            @Parameter(description = "Course database ID") @PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseOfferings(id));
    }

    // ==================== Queries ====================

    @GetMapping("/search")
    @Operation(summary = "Search courses by name", description = "Searches courses by name (case-insensitive partial match)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved matching courses")
    public ResponseEntity<List<CourseDTO>> searchByName(
            @Parameter(description = "Name to search for") @RequestParam String name) {
        return ResponseEntity.ok(courseService.searchByName(name));
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Get courses by department", description = "Retrieves all courses in a department")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved courses")
    public ResponseEntity<List<CourseDTO>> getCoursesByDepartment(
            @Parameter(description = "Department name") @PathVariable String department) {
        return ResponseEntity.ok(courseService.getCoursesByDepartment(department));
    }

    @GetMapping("/grading-type/{gradingType}")
    @Operation(summary = "Get courses by grading type", description = "Retrieves courses using a specific grading type")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved courses")
    public ResponseEntity<List<CourseDTO>> getCoursesByGradingType(
            @Parameter(description = "Grading type (SCALE_10, SCALE_4, PASS_FAIL)") @PathVariable GradingType gradingType) {
        return ResponseEntity.ok(courseService.getCoursesByGradingType(gradingType));
    }

    @GetMapping("/credits")
    @Operation(summary = "Get courses by credit range", description = "Retrieves courses within a credit range")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved courses")
    public ResponseEntity<List<CourseDTO>> getCoursesByCreditRange(
            @Parameter(description = "Minimum credits") @RequestParam Integer minCredits,
            @Parameter(description = "Maximum credits") @RequestParam Integer maxCredits) {
        return ResponseEntity.ok(courseService.getCoursesByCreditRange(minCredits, maxCredits));
    }

    @GetMapping("/departments")
    @Operation(summary = "Get all departments", description = "Retrieves a list of all distinct department names")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        return ResponseEntity.ok(courseService.getAllDepartments());
    }
}
