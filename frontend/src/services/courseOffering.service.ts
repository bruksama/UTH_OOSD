import api from './api';
import { CourseOfferingDTO, Semester } from '../types';

export const courseOfferingService = {
    getAll: () => api.get<CourseOfferingDTO[]>('/offerings'),

    getById: (id: number) => api.get<CourseOfferingDTO>(`/offerings/${id}`),

    getBySemester: (semester: Semester, year: number) =>
        api.get<CourseOfferingDTO[]>('/offerings/semester', { params: { semester, year } }),

    getAvailable: () => api.get<CourseOfferingDTO[]>('/offerings/available'),
};
