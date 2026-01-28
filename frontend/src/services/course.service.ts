import api from './api';
import { CourseDTO, CourseOfferingDTO } from '../types';

export const courseService = {
  getAll: () => api.get<CourseDTO[]>('/courses'),
  getById: (id: number) => api.get<CourseDTO>(`/courses/${id}`),
  create: (data: CourseDTO) => api.post<CourseDTO>('/courses', data),
  update: (id: number, data: CourseDTO) => api.put<CourseDTO>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
  getOfferings: (id: number) => api.get<CourseOfferingDTO[]>(`/courses/${id}/offerings`),
  approve: (id: number) => api.post<CourseDTO>(`/courses/${id}/approve`),
  reject: (id: number) => api.post<CourseDTO>(`/courses/${id}/reject`),
};
