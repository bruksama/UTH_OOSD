package com.spts.controller;

import com.spts.dto.CourseOfferingDTO;
import com.spts.dto.EnrollmentDTO;
import com.spts.entity.Semester;
import com.spts.service.CourseOfferingService;

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
 * REST controller for CourseOffering management.
 * Provides endpoints for CRUD operations and enrollment management.
 * 
 * CourseOffering represents the Occurrence in Abstraction-Occurrence Pattern.
 * Each CourseOffering is a specific instance of a Course in a particular semester.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/offerings")
@Tag(name = "Course Offerings", description = "Course offering management APIs")
public class CourseOfferingController {

    private final CourseOfferingService courseOfferingService;

    public CourseOfferingController(CourseOfferingService courseOfferingService) {
        this.courseOfferingService = courseOfferingService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all offerings", description = "Retrieves a list of course offerings (filtered by user if provided)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getAllOfferings(
            @RequestParam(required = false) String email,
            @RequestParam(required = false, defaultValue = "student") String role) {
        return ResponseEntity.ok(courseOfferingService.getAllOfferingsFiltered(email, role));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get offering by ID", description = "Retrieves a course offering by its database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Offering found"),
        @ApiResponse(responseCode = "404", description = "Offering not found")
    })
    public ResponseEntity<CourseOfferingDTO> getOfferingById(
            @Parameter(description = "Offering database ID") @PathVariable Long id) {
        return ResponseEntity.ok(courseOfferingService.getOfferingById(id));
    }

    @PostMapping
    @Operation(summary = "Create new offering", description = "Creates a new course offering")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Offering created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Course not found"),
        @ApiResponse(responseCode = "409", description = "Offering already exists for this course/semester/year")
    })
    public ResponseEntity<CourseOfferingDTO> createOffering(
            @Valid @RequestBody CourseOfferingDTO dto) {
        return new ResponseEntity<>(courseOfferingService.createOffering(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update offering", description = "Updates an existing course offering")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Offering updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Offering not found"),
        @ApiResponse(responseCode = "409", description = "Offering already exists for this course/semester/year")
    })
    public ResponseEntity<CourseOfferingDTO> updateOffering(
            @Parameter(description = "Offering database ID") @PathVariable Long id,
            @Valid @RequestBody CourseOfferingDTO dto) {
        return ResponseEntity.ok(courseOfferingService.updateOffering(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete offering", description = "Deletes a course offering (fails if offering has enrollments)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Offering deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Offering has existing enrollments"),
        @ApiResponse(responseCode = "404", description = "Offering not found")
    })
    public ResponseEntity<Void> deleteOffering(
            @Parameter(description = "Offering database ID") @PathVariable Long id) {
        courseOfferingService.deleteOffering(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Related Data ====================

    @GetMapping("/{id}/enrollments")
    @Operation(summary = "Get offering enrollments", description = "Retrieves all enrollments for a course offering")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments"),
        @ApiResponse(responseCode = "404", description = "Offering not found")
    })
    public ResponseEntity<List<EnrollmentDTO>> getOfferingEnrollments(
            @Parameter(description = "Offering database ID") @PathVariable Long id) {
        return ResponseEntity.ok(courseOfferingService.getOfferingEnrollments(id));
    }

    // ==================== Queries ====================

    @GetMapping("/semester")
    @Operation(summary = "Get offerings by semester and year", description = "Retrieves offerings for a specific semester and academic year")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getOfferingsBySemesterAndYear(
            @Parameter(description = "Semester (FALL, SPRING, SUMMER)") @RequestParam Semester semester,
            @Parameter(description = "Academic year") @RequestParam Integer year) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsBySemesterAndYear(semester, year));
    }

    @GetMapping("/year/{year}")
    @Operation(summary = "Get offerings by year", description = "Retrieves all offerings for an academic year")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getOfferingsByYear(
            @Parameter(description = "Academic year") @PathVariable Integer year) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsByYear(year));
    }

    @GetMapping("/instructor/{instructor}")
    @Operation(summary = "Get offerings by instructor", description = "Retrieves offerings taught by a specific instructor")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getOfferingsByInstructor(
            @Parameter(description = "Instructor name") @PathVariable String instructor) {
        return ResponseEntity.ok(courseOfferingService.getOfferingsByInstructor(instructor));
    }

    @GetMapping("/available")
    @Operation(summary = "Get offerings with available seats", description = "Retrieves offerings that have open seats for enrollment")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getOfferingsWithAvailableSeats() {
        return ResponseEntity.ok(courseOfferingService.getOfferingsWithAvailableSeats());
    }

    @GetMapping("/current")
    @Operation(summary = "Get current offerings", description = "Retrieves offerings for the current semester")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved offerings")
    public ResponseEntity<List<CourseOfferingDTO>> getCurrentOfferings(
            @Parameter(description = "Current semester") @RequestParam Semester semester,
            @Parameter(description = "Current year") @RequestParam Integer year) {
        return ResponseEntity.ok(courseOfferingService.getCurrentOfferings(semester, year));
    }

    @GetMapping("/instructors")
    @Operation(summary = "Get all instructors", description = "Retrieves a list of all distinct instructor names")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved instructors")
    public ResponseEntity<List<String>> getAllInstructors() {
        return ResponseEntity.ok(courseOfferingService.getAllInstructors());
    }

    @GetMapping("/{id}/seats")
    @Operation(summary = "Get available seats", description = "Gets the number of available seats in an offering")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved seat count"),
        @ApiResponse(responseCode = "404", description = "Offering not found")
    })
    public ResponseEntity<Integer> getAvailableSeats(
            @Parameter(description = "Offering database ID") @PathVariable Long id) {
        return ResponseEntity.ok(courseOfferingService.getAvailableSeats(id));
    }
}
