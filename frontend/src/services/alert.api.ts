import api from './api';
import { AlertDTO } from '../types';

/**
 * Fetch all alerts from backend API
 * Endpoint: GET /api/alerts
 */
export const fetchAlerts = async (): Promise<AlertDTO[]> => {
    const response = await api.get<AlertDTO[]>('/alerts');
    return response.data;
};

/**
 * Fetch unresolved alerts
 * Endpoint: GET /api/alerts/unresolved
 */
export const fetchUnresolvedAlerts = async (): Promise<AlertDTO[]> => {
    const response = await api.get<AlertDTO[]>('/alerts/unresolved');
    return response.data;
};

/**
 * Fetch unread alerts
 * Endpoint: GET /api/alerts/unread
 */
export const fetchUnreadAlerts = async (): Promise<AlertDTO[]> => {
    const response = await api.get<AlertDTO[]>('/alerts/unread');
    return response.data;
};

/**
 * Fetch urgent alerts (CRITICAL and HIGH level)
 * Endpoint: GET /api/alerts/urgent
 */
export const fetchUrgentAlerts = async (): Promise<AlertDTO[]> => {
    const response = await api.get<AlertDTO[]>('/alerts/urgent');
    return response.data;
};

/**
 * Fetch alerts for a specific student
 * Endpoint: GET /api/alerts/student/{studentId}
 */
export const fetchAlertsByStudent = async (studentId: number): Promise<AlertDTO[]> => {
    const response = await api.get<AlertDTO[]>(`/alerts/student/${studentId}`);
    return response.data;
};

/**
 * Mark alert as read
 * Endpoint: PUT /api/alerts/{id}/read
 */
export const markAlertAsRead = async (id: number): Promise<AlertDTO> => {
    const response = await api.put<AlertDTO>(`/alerts/${id}/read`);
    return response.data;
};

/**
 * Mark alert as resolved
 * Endpoint: PUT /api/alerts/{id}/resolve?resolvedBy={resolvedBy}
 */
export const resolveAlert = async (id: number, resolvedBy: string): Promise<AlertDTO> => {
    const response = await api.put<AlertDTO>(`/alerts/${id}/resolve`, null, {
        params: { resolvedBy }
    });
    return response.data;
};
