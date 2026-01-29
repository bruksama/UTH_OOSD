import api from './api';
import { EnrollmentDTO } from '../types';

export const enrollmentService = {
  getAll: () => api.get<EnrollmentDTO[]>('/enrollments'),
  getById: (id: number) => api.get<EnrollmentDTO>(`/enrollments/${id}`),
  create: (data: EnrollmentDTO) => api.post<EnrollmentDTO>('/enrollments', data),
  complete: (id: number, score: number) =>
    api.post<EnrollmentDTO>(`/enrollments/${id}/complete`, null, { params: { score } }),
  completeWithStrategy: (id: number, score: number) =>
    api.post<EnrollmentDTO>(`/enrollments/${id}/complete-with-strategy?score=${score}`),
  withdraw: (id: number) => api.post<EnrollmentDTO>(`/enrollments/${id}/withdraw`),
  getByOffering: (offeringId: number) => api.get<EnrollmentDTO[]>(`/enrollments/offering/${offeringId}`),
  getByStudent: (studentId: number) => api.get<EnrollmentDTO[]>(`/enrollments/student/${studentId}`),
};
