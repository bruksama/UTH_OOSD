import { AlertDTO } from "../types";
import {
    fetchAlerts,
    fetchUnresolvedAlerts,
    fetchUnreadAlerts,
    fetchUrgentAlerts,
    fetchAlertsByStudent,
    markAlertAsRead,
    resolveAlert,
} from "./alert.api";

/**
 * Alert Service Layer
 * Wraps API calls with error handling and business logic
 */

/**
 * Get all alerts from the backend
 */
export const getAlerts = async (): Promise<AlertDTO[]> => {
    try {
        return await fetchAlerts();
    } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
    }
};

/**
 * Get unresolved alerts
 */
export const getUnresolvedAlerts = async (): Promise<AlertDTO[]> => {
    try {
        return await fetchUnresolvedAlerts();
    } catch (error) {
        console.error("Error fetching unresolved alerts:", error);
        throw error;
    }
};

/**
 * Get unread alerts
 */
export const getUnreadAlerts = async (): Promise<AlertDTO[]> => {
    try {
        return await fetchUnreadAlerts();
    } catch (error) {
        console.error("Error fetching unread alerts:", error);
        throw error;
    }
};

/**
 * Get urgent alerts (CRITICAL and HIGH level)
 */
export const getUrgentAlerts = async (): Promise<AlertDTO[]> => {
    try {
        return await fetchUrgentAlerts();
    } catch (error) {
        console.error("Error fetching urgent alerts:", error);
        throw error;
    }
};

/**
 * Get alerts for a specific student
 */
export const getAlertsByStudent = async (studentId: number): Promise<AlertDTO[]> => {
    try {
        return await fetchAlertsByStudent(studentId);
    } catch (error) {
        console.error(`Error fetching alerts for student ${studentId}:`, error);
        throw error;
    }
};

/**
 * Mark an alert as read
 */
export const markAsRead = async (id: number): Promise<AlertDTO> => {
    try {
        return await markAlertAsRead(id);
    } catch (error) {
        console.error(`Error marking alert ${id} as read:`, error);
        throw error;
    }
};

/**
 * Resolve an alert
 */
export const resolve = async (id: number, resolvedBy: string): Promise<AlertDTO> => {
    try {
        return await resolveAlert(id, resolvedBy);
    } catch (error) {
        console.error(`Error resolving alert ${id}:`, error);
        throw error;
    }
};
