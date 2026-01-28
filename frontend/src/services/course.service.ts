import api from './api';
import { CourseDTO, CourseOfferingDTO } from '../types';

export const courseService = {
  getAll: () => api.get<CourseDTO[]>('/courses'),
  getById: (id: number) => api.get<CourseDTO>(`/courses/${id}`),
  create: (data: CourseDTO) => api.post<CourseDTO>('/courses', data),
  update: (id: number, data: CourseDTO) => api.put<CourseDTO>(`/courses/${id}`, data),
  delete: (id: number, email?: string, role?: string) =>
    api.delete(`/courses/${id}`, { params: { email, role } }),
  getOfferings: (id: number) => api.get<CourseOfferingDTO[]>(`/courses/${id}/offerings`),
  getOfferingsAll: (email?: string, role?: string) =>
    api.get<CourseOfferingDTO[]>('/offerings', { params: { email, role } }),
  approve: (id: number) => api.post<CourseDTO>(`/courses/${id}/approve`),
  reject: (id: number) => api.post<CourseDTO>(`/courses/${id}/reject`),
};
