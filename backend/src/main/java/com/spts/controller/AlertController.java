package com.spts.controller;

import com.spts.dto.AlertDTO;
import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import com.spts.service.AlertService;

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
 * REST controller for Alert management.
 * Provides endpoints for CRUD operations and alert queries.
 * 
 * Alerts are created by the Observer pattern when student performance issues are detected.
 * 
 * @author SPTS Team
 */
@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Alert management APIs (Observer Pattern)")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    // ==================== CRUD Operations ====================

    @GetMapping
    @Operation(summary = "Get all alerts", description = "Retrieves a list of all alerts")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of alerts")
    public ResponseEntity<List<AlertDTO>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert by ID", description = "Retrieves an alert by its database ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Alert found"),
        @ApiResponse(responseCode = "404", description = "Alert not found")
    })
    public ResponseEntity<AlertDTO> getAlertById(
            @Parameter(description = "Alert database ID") @PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PostMapping
    @Operation(summary = "Create new alert", description = "Creates a new alert for a student")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Alert created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<AlertDTO> createAlert(
            @Valid @RequestBody AlertDTO dto) {
        return new ResponseEntity<>(alertService.createAlert(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update alert", description = "Updates an existing alert")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Alert updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Alert not found")
    })
    public ResponseEntity<AlertDTO> updateAlert(
            @Parameter(description = "Alert database ID") @PathVariable Long id,
            @Valid @RequestBody AlertDTO dto) {
        return ResponseEntity.ok(alertService.updateAlert(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete alert", description = "Deletes an alert record")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Alert deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Alert not found")
    })
    public ResponseEntity<Void> deleteAlert(
            @Parameter(description = "Alert database ID") @PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Mark as Read/Resolved ====================

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark alert as read", description = "Marks an alert as read")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Alert marked as read"),
        @ApiResponse(responseCode = "404", description = "Alert not found")
    })
    public ResponseEntity<AlertDTO> markAsRead(
            @Parameter(description = "Alert database ID") @PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Mark alert as resolved", description = "Marks an alert as resolved")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Alert marked as resolved"),
        @ApiResponse(responseCode = "404", description = "Alert not found")
    })
    public ResponseEntity<AlertDTO> resolveAlert(
            @Parameter(description = "Alert database ID") @PathVariable Long id,
            @Parameter(description = "Username of resolver") @RequestParam String resolvedBy) {
        return ResponseEntity.ok(alertService.markAsResolved(id, resolvedBy));
    }

    @PutMapping("/batch/read")
    @Operation(summary = "Mark multiple alerts as read", description = "Marks multiple alerts as read in batch")
    @ApiResponse(responseCode = "200", description = "Number of alerts marked as read")
    public ResponseEntity<Integer> markMultipleAsRead(
            @Parameter(description = "List of alert IDs") @RequestBody List<Long> ids) {
        return ResponseEntity.ok(alertService.markMultipleAsRead(ids));
    }

    @PutMapping("/batch/resolve")
    @Operation(summary = "Mark multiple alerts as resolved", description = "Marks multiple alerts as resolved in batch")
    @ApiResponse(responseCode = "200", description = "Number of alerts marked as resolved")
    public ResponseEntity<Integer> markMultipleAsResolved(
            @Parameter(description = "List of alert IDs") @RequestBody List<Long> ids,
            @Parameter(description = "Username of resolver") @RequestParam String resolvedBy) {
        return ResponseEntity.ok(alertService.markMultipleAsResolved(ids, resolvedBy));
    }

    @PutMapping("/student/{studentId}/read-all")
    @Operation(summary = "Mark all alerts as read for student", description = "Marks all unread alerts for a student as read")
    @ApiResponse(responseCode = "200", description = "Number of alerts marked as read")
    public ResponseEntity<Integer> markAllAsReadForStudent(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(alertService.markAllAsReadForStudent(studentId));
    }

    // ==================== Queries ====================

    @GetMapping("/unread")
    @Operation(summary = "Get unread alerts", description = "Retrieves all unread alerts")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved unread alerts")
    public ResponseEntity<List<AlertDTO>> getUnreadAlerts() {
        return ResponseEntity.ok(alertService.getUnreadAlerts());
    }

    @GetMapping("/unresolved")
    @Operation(summary = "Get unresolved alerts", description = "Retrieves all unresolved alerts")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved unresolved alerts")
    public ResponseEntity<List<AlertDTO>> getUnresolvedAlerts() {
        return ResponseEntity.ok(alertService.getUnresolvedAlerts());
    }

    @GetMapping("/urgent")
    @Operation(summary = "Get urgent alerts", description = "Retrieves CRITICAL and HIGH level unresolved alerts")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved urgent alerts")
    public ResponseEntity<List<AlertDTO>> getUrgentAlerts() {
        return ResponseEntity.ok(alertService.getUrgentAlerts());
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get alerts by student", description = "Retrieves all alerts for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved alerts")
    public ResponseEntity<List<AlertDTO>> getByStudent(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(alertService.getAlertsByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/unread")
    @Operation(summary = "Get unread alerts for student", description = "Retrieves unread alerts for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved unread alerts")
    public ResponseEntity<List<AlertDTO>> getUnreadAlertsForStudent(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(alertService.getUnreadAlertsForStudent(studentId));
    }

    @GetMapping("/level/{level}")
    @Operation(summary = "Get alerts by level", description = "Retrieves alerts of a specific severity level")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved alerts")
    public ResponseEntity<List<AlertDTO>> getByLevel(
            @Parameter(description = "Alert level (INFO, WARNING, HIGH, CRITICAL)") @PathVariable AlertLevel level) {
        return ResponseEntity.ok(alertService.getAlertsByLevel(level));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get alerts by type", description = "Retrieves alerts of a specific type")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved alerts")
    public ResponseEntity<List<AlertDTO>> getByType(
            @Parameter(description = "Alert type (LOW_GPA, GPA_DROP, STATUS_CHANGE, etc.)") @PathVariable AlertType type) {
        return ResponseEntity.ok(alertService.getAlertsByType(type));
    }

    @GetMapping("/student/{studentId}/count")
    @Operation(summary = "Count unread alerts", description = "Counts unread alerts for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved count")
    public ResponseEntity<Long> countUnreadAlerts(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(alertService.countUnreadAlerts(studentId));
    }

    @GetMapping("/student/{studentId}/summary")
    @Operation(summary = "Get alert summary", description = "Gets alert statistics for a student")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved summary")
    public ResponseEntity<AlertService.AlertSummary> getAlertSummary(
            @Parameter(description = "Student database ID") @PathVariable Long studentId) {
        return ResponseEntity.ok(alertService.getAlertSummary(studentId));
    }
}
