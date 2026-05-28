package com.spts.controller;

import com.spts.dto.EnrollmentDTO;
import com.spts.entity.EnrollmentStatus;
import com.spts.service.EnrollmentService;

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
 * REST controller for Enrollment management.
 * Provides endpoints for CRUD operations, grade submission, and enrollment queries.
 * 
 * Enrollment links Student to CourseOffering and stores final grades.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/enrollments")
@Tag(name = "Enrollments", description = "Enrollment management APIs")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all enrollments", description = "Retrieves a list of all enrollments")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get enrollment by ID", description = "Retrieves an enrollment by its database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Enrollment found"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> getEnrollmentById(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentById(id));
    }

    @PostMapping
    @Operation(summary = "Create new enrollment", description = "Enrolls a student in a course offering")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Enrollment created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data or no available seats"),
        @ApiResponse(responseCode = "404", description = "Student or course offering not found"),
        @ApiResponse(responseCode = "409", description = "Student is already enrolled in this offering")
    })
    public ResponseEntity<EnrollmentDTO> createEnrollment(
            @Valid @RequestBody EnrollmentDTO dto) {
        return new ResponseEntity<>(enrollmentService.createEnrollment(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update enrollment", description = "Updates an existing enrollment (status and grades)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Enrollment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> updateEnrollment(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id,
            @Valid @RequestBody EnrollmentDTO dto) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete enrollment", description = "Deletes an enrollment record")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Enrollment deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<Void> deleteEnrollment(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Grade Operations ====================

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete enrollment with grade", description = "Completes an enrollment with final score, auto-calculates letter grade and GPA")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Enrollment completed successfully"),
        @ApiResponse(responseCode = "400", description = "Enrollment already completed or withdrawn"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> completeEnrollment(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id,
            @Parameter(description = "Final score (0-10 scale)") @RequestParam Double score) {
        return ResponseEntity.ok(enrollmentService.completeEnrollment(id, score));
    }

    @PostMapping("/{id}/complete-with-strategy")
    @Operation(summary = "Complete enrollment using grading strategy", description = "Completes an enrollment using the course's configured grading strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Enrollment completed successfully"),
        @ApiResponse(responseCode = "400", description = "Enrollment already completed or withdrawn"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> completeEnrollmentWithStrategy(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id,
            @Parameter(description = "Final score (0-10 scale)") @RequestParam Double score) {
        return ResponseEntity.ok(enrollmentService.completeEnrollmentWithStrategy(id, score));
    }

    @PostMapping("/{id}/grade")
    @Operation(summary = "Submit grade", description = "Submits or updates a grade without changing enrollment status")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Grade submitted successfully"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> submitGrade(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id,
            @Parameter(description = "Score (0-10 scale)") @RequestParam Double score) {
        return ResponseEntity.ok(enrollmentService.submitGrade(id, score));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw from enrollment", description = "Withdraws a student from an enrollment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Withdrawn successfully"),
        @ApiResponse(responseCode = "400", description = "Enrollment already completed or withdrawn"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<EnrollmentDTO> withdrawEnrollment(
            @Parameter(description = "Enrollment database ID") @PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.withdrawEnrollment(id));
    }

    // ==================== Queries ====================

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get enrollments by student", description = "Retrieves all enrollments for a student")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<List<EnrollmentDTO>> getByStudent(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/offering/{offeringId}")
    @Operation(summary = "Get enrollments by offering", description = "Retrieves all enrollments for a course offering")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments"),
        @ApiResponse(responseCode = "404", description = "Course offering not found")
    })
    public ResponseEntity<List<EnrollmentDTO>> getByOffering(
            @Parameter(description = "Course offering database ID") @PathVariable Long offeringId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByOffering(offeringId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get enrollments by status", description = "Retrieves enrollments with a specific status")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getByStatus(
            @Parameter(description = "Enrollment status (IN_PROGRESS, COMPLETED, WITHDRAWN)") @PathVariable EnrollmentStatus status) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStatus(status));
    }

    @GetMapping("/student/{studentId}/in-progress")
    @Operation(summary = "Get in-progress enrollments", description = "Retrieves in-progress enrollments for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getInProgressEnrollments(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getInProgressEnrollments(studentId));
    }

    @GetMapping("/student/{studentId}/completed")
    @Operation(summary = "Get completed enrollments", description = "Retrieves completed enrollments for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getCompletedEnrollments(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getCompletedEnrollments(studentId));
    }

    @GetMapping("/check")
    @Operation(summary = "Check if student is enrolled", description = "Checks if a student is enrolled in a specific course offering")
    @ApiResponse(responseCode = "200", description = "Check completed")
    public ResponseEntity<Boolean> isStudentEnrolled(
            @Parameter(description = "Student database ID") @RequestParam Long studentId,
            @Parameter(description = "Course offering database ID") @RequestParam Long offeringId) {
        return ResponseEntity.ok(enrollmentService.isStudentEnrolled(studentId, offeringId));
    }
}
