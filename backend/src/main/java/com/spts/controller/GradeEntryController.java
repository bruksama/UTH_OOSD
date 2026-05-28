package com.spts.controller;

import com.spts.dto.GradeEntryDTO;
import com.spts.entity.GradeEntryType;
import com.spts.service.GradeEntryService;

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
 * REST controller for GradeEntry management.
 * Provides endpoints for CRUD operations and Composite Pattern operations.
 * 
 * GradeEntry implements Composite Pattern for hierarchical grade structure.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/grade-entries")
@Tag(name = "Grade Entries", description = "Grade entry management APIs (Composite Pattern)")
public class GradeEntryController {

    private final GradeEntryService gradeEntryService;

    public GradeEntryController(GradeEntryService gradeEntryService) {
        this.gradeEntryService = gradeEntryService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all grade entries", description = "Retrieves a list of all grade entries")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of grade entries")
    public ResponseEntity<List<GradeEntryDTO>> getAllGradeEntries() {
        return ResponseEntity.ok(gradeEntryService.getAllGradeEntries());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get grade entry by ID", description = "Retrieves a grade entry by its database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Grade entry found"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<GradeEntryDTO> getGradeEntryById(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id) {
        return ResponseEntity.ok(gradeEntryService.getGradeEntryById(id));
    }

    @PostMapping
    @Operation(summary = "Create new grade entry", description = "Creates a new grade entry for an enrollment")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Grade entry created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Enrollment or parent not found")
    })
    public ResponseEntity<GradeEntryDTO> createGradeEntry(
            @Valid @RequestBody GradeEntryDTO dto) {
        return new ResponseEntity<>(gradeEntryService.createGradeEntry(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update grade entry", description = "Updates an existing grade entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Grade entry updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<GradeEntryDTO> updateGradeEntry(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id,
            @Valid @RequestBody GradeEntryDTO dto) {
        return ResponseEntity.ok(gradeEntryService.updateGradeEntry(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete grade entry", description = "Deletes a grade entry (cascades to children)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Grade entry deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<Void> deleteGradeEntry(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id) {
        gradeEntryService.deleteGradeEntry(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Composite Pattern Operations ====================

    @PostMapping("/{parentId}/children")
    @Operation(summary = "Add child grade entry", description = "Adds a child grade entry to a parent (Composite Pattern)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Child grade entry created successfully"),
        @ApiResponse(responseCode = "404", description = "Parent grade entry not found")
    })
    public ResponseEntity<GradeEntryDTO> addChildGradeEntry(
            @Parameter(description = "Parent grade entry ID") @PathVariable Long parentId,
            @Valid @RequestBody GradeEntryDTO dto) {
        return new ResponseEntity<>(gradeEntryService.addChildGradeEntry(parentId, dto), HttpStatus.CREATED);
    }

    @GetMapping("/{parentId}/children")
    @Operation(summary = "Get children of grade entry", description = "Retrieves all children of a grade entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved children"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<List<GradeEntryDTO>> getChildren(
            @Parameter(description = "Parent grade entry ID") @PathVariable Long parentId) {
        return ResponseEntity.ok(gradeEntryService.getChildren(parentId));
    }

    @GetMapping("/enrollment/{enrollmentId}/hierarchy")
    @Operation(summary = "Get hierarchical grades", description = "Retrieves the full grade hierarchy for an enrollment (root entries with nested children)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved grade hierarchy"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<List<GradeEntryDTO>> getHierarchy(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.getHierarchicalGrades(enrollmentId));
    }

    @GetMapping("/enrollment/{enrollmentId}/roots")
    @Operation(summary = "Get root grade entries", description = "Retrieves root-level grade entries for an enrollment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved root entries"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<List<GradeEntryDTO>> getRootEntries(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.getRootEntriesByEnrollment(enrollmentId));
    }

    // ==================== Score Calculations ====================

    @GetMapping("/{id}/calculated-score")
    @Operation(summary = "Get calculated score", description = "Calculates composite score (recursively from children if composite)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully calculated score"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<Double> getCalculatedScore(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id) {
        return ResponseEntity.ok(gradeEntryService.calculateCompositeScore(id));
    }

    @GetMapping("/{id}/weighted-score")
    @Operation(summary = "Get weighted score", description = "Calculates weighted score (score * weight)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully calculated weighted score"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<Double> getWeightedScore(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id) {
        return ResponseEntity.ok(gradeEntryService.calculateWeightedScore(id));
    }

    @GetMapping("/enrollment/{enrollmentId}/final-grade")
    @Operation(summary = "Calculate final grade", description = "Calculates the final grade from all root components")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully calculated final grade"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<Double> calculateFinalGrade(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.calculateFinalGrade(enrollmentId));
    }

    @GetMapping("/enrollment/{enrollmentId}/validate-weights")
    @Operation(summary = "Validate weights", description = "Validates that root entry weights sum to 1.0")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Validation result"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<Boolean> validateWeights(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.validateWeights(enrollmentId));
    }

    // ==================== Queries ====================

    @GetMapping("/enrollment/{enrollmentId}")
    @Operation(summary = "Get entries by enrollment", description = "Retrieves all grade entries for an enrollment")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved entries"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<List<GradeEntryDTO>> getByEnrollment(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.getEntriesByEnrollment(enrollmentId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get entries by student", description = "Retrieves all grade entries for a student across all enrollments")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved entries")
    public ResponseEntity<List<GradeEntryDTO>> getByStudent(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(gradeEntryService.getEntriesByStudent(studentId));
    }

    @GetMapping("/type/{entryType}")
    @Operation(summary = "Get entries by type", description = "Retrieves grade entries of a specific type")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved entries")
    public ResponseEntity<List<GradeEntryDTO>> getByType(
            @Parameter(description = "Entry type (MIDTERM, FINAL, QUIZ, etc.)") @PathVariable GradeEntryType entryType) {
        return ResponseEntity.ok(gradeEntryService.getEntriesByType(entryType));
    }

    @GetMapping("/enrollment/{enrollmentId}/leaves")
    @Operation(summary = "Get leaf entries", description = "Retrieves leaf-level entries (entries without children)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved leaf entries"),
        @ApiResponse(responseCode = "404", description = "Enrollment not found")
    })
    public ResponseEntity<List<GradeEntryDTO>> getLeafEntries(
            @Parameter(description = "Enrollment database ID") @PathVariable Long enrollmentId) {
        return ResponseEntity.ok(gradeEntryService.getLeafEntries(enrollmentId));
    }

    @PatchMapping("/{id}/score")
    @Operation(summary = "Update score only", description = "Updates just the score of a grade entry")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Score updated successfully"),
        @ApiResponse(responseCode = "404", description = "Grade entry not found")
    })
    public ResponseEntity<GradeEntryDTO> updateScore(
            @Parameter(description = "Grade entry database ID") @PathVariable Long id,
            @Parameter(description = "New score (0-10 scale)") @RequestParam Double score,
            @Parameter(description = "Username of recorder") @RequestParam(required = false) String recordedBy) {
        return ResponseEntity.ok(gradeEntryService.updateScore(id, score, recordedBy));
    }
}
