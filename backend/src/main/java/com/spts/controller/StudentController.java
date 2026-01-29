package com.spts.controller;

import com.spts.dto.StudentDTO;
import com.spts.dto.EnrollmentDTO;
import com.spts.entity.StudentStatus;
import com.spts.service.StudentService;
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
 * REST controller for Student management.
 * Provides endpoints for CRUD operations and student queries.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student management APIs")
public class StudentController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;

    public StudentController(StudentService studentService, EnrollmentService enrollmentService) {
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all students", description = "Retrieves a list of all students in the system")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID", description = "Retrieves a student by their database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student found"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<StudentDTO> getStudentById(
            @Parameter(description = "Student database ID") @PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/code/{studentCode}")
    @Operation(summary = "Get student by student code", description = "Retrieves a student by their student code (e.g., STU001)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student found"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<StudentDTO> getByStudentCode(
            @Parameter(description = "Student code (e.g., STU001)") @PathVariable String studentCode) {
        return ResponseEntity.ok(studentService.getStudentByStudentId(studentCode));
    }

    @PostMapping
    @Operation(summary = "Create new student", description = "Creates a new student record")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Student created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    public ResponseEntity<StudentDTO> createStudent(
            @Valid @RequestBody StudentDTO dto) {
        return new ResponseEntity<>(studentService.createStudent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update student", description = "Updates an existing student record")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Student not found"),
        @ApiResponse(responseCode = "409", description = "Student ID or email already exists")
    })
    public ResponseEntity<StudentDTO> updateStudent(
            @Parameter(description = "Student database ID") @PathVariable Long id,
            @Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student", description = "Deletes a student record")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Student deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<Void> deleteStudent(
            @Parameter(description = "Student database ID") @PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Related Data ====================

    @GetMapping("/{id}/enrollments")
    @Operation(summary = "Get student enrollments", description = "Retrieves all enrollments for a student")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved enrollments"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<List<EnrollmentDTO>> getStudentEnrollments(
            @Parameter(description = "Student database ID") @PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(id));
    }

    // ==================== Queries ====================

    @GetMapping("/at-risk")
    @Operation(summary = "Get at-risk students", description = "Retrieves students with AT_RISK or PROBATION status")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved at-risk students")
    public ResponseEntity<List<StudentDTO>> getAtRiskStudents() {
        return ResponseEntity.ok(studentService.getStudentsAtRisk());
    }

    @GetMapping("/search")
    @Operation(summary = "Search students by name", description = "Searches students by first or last name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved matching students")
    public ResponseEntity<List<StudentDTO>> searchByName(
            @Parameter(description = "Name to search for") @RequestParam String name) {
        return ResponseEntity.ok(studentService.searchByName(name));
    }

    @GetMapping("/gpa-below")
    @Operation(summary = "Get students with GPA below threshold", description = "Retrieves students with GPA below the specified value")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved students")
    public ResponseEntity<List<StudentDTO>> getStudentsWithGpaBelow(
            @Parameter(description = "GPA threshold") @RequestParam Double threshold) {
        return ResponseEntity.ok(studentService.getStudentsWithGpaBelow(threshold));
    }

    @PostMapping("/{id}/graduate")
    @Operation(summary = "Graduate student", description = "Marks a student as graduated if requirements are met")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student graduated successfully"),
        @ApiResponse(responseCode = "400", description = "Student does not meet graduation requirements"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<Void> graduateStudent(
            @Parameter(description = "Student database ID") @PathVariable Long id) {
        studentService.graduateStudent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/recalculate-gpa")
    @Operation(summary = "Recalculate student GPA", description = "Recalculates and updates the student's GPA from completed enrollments")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "GPA recalculated successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<Void> recalculateGpa(
            @Parameter(description = "Student database ID") @PathVariable Long id) {
        studentService.recalculateAndUpdateGpa(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recalculate-all-gpa")
    @Operation(summary = "Recalculate GPA for all students", description = "Recalculates and updates GPA for all students in the system")
    @ApiResponse(responseCode = "200", description = "All GPAs recalculated successfully")
    public ResponseEntity<String> recalculateAllGpa() {
        List<StudentDTO> allStudents = studentService.getAllStudents();
        int count = 0;
        for (StudentDTO student : allStudents) {
            if (student.getId() != null) {
                studentService.recalculateAndUpdateGpa(student.getId());
                count++;
            }
        }
        return ResponseEntity.ok("Recalculated GPA for " + count + " students");
    }
}
