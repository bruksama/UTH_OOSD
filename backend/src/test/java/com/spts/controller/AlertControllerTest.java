package com.spts.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spts.dto.AlertDTO;
import com.spts.entity.AlertLevel;
import com.spts.entity.AlertType;
import com.spts.exception.GlobalExceptionHandler;
import com.spts.security.FirebaseTokenFilter;
import com.spts.service.AlertService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlertController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlertService alertService;

    @MockBean
    private FirebaseTokenFilter firebaseTokenFilter;

    @Test
    void getAllAlertsReturnsAlertList() throws Exception {
        when(alertService.getAllAlerts()).thenReturn(List.of(alert(1L)));

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].level").value("WARNING"));
    }

    @Test
    void getAlertByIdReturnsAlert() throws Exception {
        when(alertService.getAlertById(1L)).thenReturn(alert(1L));

        mockMvc.perform(get("/api/alerts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("LOW_GPA"));
    }

    @Test
    void createAlertReturnsCreatedAlert() throws Exception {
        AlertDTO request = alert(null);
        when(alertService.createAlert(any(AlertDTO.class))).thenReturn(alert(1L));

        mockMvc.perform(post("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.studentId").value(53));
    }

    @Test
    void updateAlertReturnsUpdatedAlert() throws Exception {
        AlertDTO updated = alert(1L);
        updated.setMessage("Updated warning");
        when(alertService.updateAlert(eq(1L), any(AlertDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/alerts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Updated warning"));
    }

    @Test
    void deleteAlertReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/alerts/1"))
                .andExpect(status().isNoContent());

        verify(alertService).deleteAlert(1L);
    }

    @Test
    void stateChangeEndpointsReturnUpdatedCountsAndAlerts() throws Exception {
        AlertDTO readAlert = alert(1L);
        readAlert.setIsRead(true);
        AlertDTO resolvedAlert = alert(2L);
        resolvedAlert.setIsResolved(true);
        resolvedAlert.setResolvedBy("ADMIN");

        when(alertService.markAsRead(1L)).thenReturn(readAlert);
        when(alertService.markAsResolved(2L, "ADMIN")).thenReturn(resolvedAlert);
        when(alertService.markMultipleAsRead(List.of(1L, 2L))).thenReturn(2);
        when(alertService.markMultipleAsResolved(List.of(1L, 2L), "ADMIN")).thenReturn(2);
        when(alertService.markAllAsReadForStudent(53L)).thenReturn(3);

        mockMvc.perform(put("/api/alerts/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        mockMvc.perform(put("/api/alerts/2/resolve").param("resolvedBy", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isResolved").value(true))
                .andExpect(jsonPath("$.resolvedBy").value("ADMIN"));

        mockMvc.perform(put("/api/alerts/batch/read")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[1,2]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(2));

        mockMvc.perform(put("/api/alerts/batch/resolve")
                        .param("resolvedBy", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[1,2]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(2));

        mockMvc.perform(put("/api/alerts/student/53/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3));
    }

    @Test
    void queryEndpointsReturnExpectedResponses() throws Exception {
        AlertService.AlertSummary summary = new AlertService.AlertSummary();
        summary.setTotalAlerts(4);
        summary.setUnreadCount(1);
        summary.setCriticalCount(1);

        when(alertService.getUnreadAlerts()).thenReturn(List.of(alert(1L)));
        when(alertService.getUnresolvedAlerts()).thenReturn(List.of(alert(2L)));
        when(alertService.getUrgentAlerts()).thenReturn(List.of(alert(3L)));
        when(alertService.getAlertsByStudent(53L)).thenReturn(List.of(alert(4L)));
        when(alertService.getUnreadAlertsForStudent(53L)).thenReturn(List.of(alert(5L)));
        when(alertService.getAlertsByLevel(AlertLevel.WARNING)).thenReturn(List.of(alert(6L)));
        when(alertService.getAlertsByType(AlertType.LOW_GPA)).thenReturn(List.of(alert(7L)));
        when(alertService.countUnreadAlerts(53L)).thenReturn(1L);
        when(alertService.getAlertSummary(53L)).thenReturn(summary);

        mockMvc.perform(get("/api/alerts/unread"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
        mockMvc.perform(get("/api/alerts/unresolved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2));
        mockMvc.perform(get("/api/alerts/urgent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(3));
        mockMvc.perform(get("/api/alerts/student/53"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(4));
        mockMvc.perform(get("/api/alerts/student/53/unread"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5));
        mockMvc.perform(get("/api/alerts/level/WARNING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(6));
        mockMvc.perform(get("/api/alerts/type/LOW_GPA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(7));
        mockMvc.perform(get("/api/alerts/student/53/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1));
        mockMvc.perform(get("/api/alerts/student/53/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAlerts").value(4))
                .andExpect(jsonPath("$.unreadCount").value(1))
                .andExpect(jsonPath("$.criticalCount").value(1));
    }

    private AlertDTO alert(Long id) {
        AlertDTO alert = new AlertDTO(53L, AlertLevel.WARNING, AlertType.LOW_GPA, "GPA below threshold");
        alert.setId(id);
        alert.setStudentName("Nguyen Van A");
        alert.setIsRead(false);
        alert.setIsResolved(false);
        return alert;
    }
}
