import api from './api';
import { StudentDTO } from '../types';

export const studentService = {
  getAll: () => api.get<StudentDTO[]>('/students'),
  getById: (id: number) => api.get<StudentDTO>(`/students/${id}`),
  getByCode: (code: string) => api.get<StudentDTO>(`/students/code/${code}`),
  create: (data: StudentDTO) => api.post<StudentDTO>('/students', data),
  update: (id: number, data: StudentDTO) => api.put<StudentDTO>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  getEnrollments: (id: number) => api.get(`/students/${id}/enrollments`),
  getAtRisk: () => api.get<StudentDTO[]>('/students/at-risk'),
};
