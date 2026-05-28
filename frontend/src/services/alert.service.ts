import api from './api';
import { AlertDTO } from '../types';

export const alertService = {
  getAll: () => api.get<AlertDTO[]>('/alerts'),
  getUnread: () => api.get<AlertDTO[]>('/alerts/unread'),
  getByStudent: (studentId: number) => api.get<AlertDTO[]>(`/alerts/student/${studentId}`),
  markAsRead: (id: number) => api.put<AlertDTO>(`/alerts/${id}/read`),
  resolve: (id: number, resolvedBy: string) => 
    api.put<AlertDTO>(`/alerts/${id}/resolve`, null, { params: { resolvedBy } }),
};
