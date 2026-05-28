import api from './api';
import { GradeEntryDTO } from '../types';

export const gradeEntryService = {
    getHierarchy: (enrollmentId: number) =>
        api.get<GradeEntryDTO[]>(`/grade-entries/enrollment/${enrollmentId}/hierarchy`),

    create: (data: GradeEntryDTO) =>
        api.post<GradeEntryDTO>('/grade-entries', data),

    addChild: (parentId: number, data: GradeEntryDTO) =>
        api.post<GradeEntryDTO>(`/grade-entries/${parentId}/children`, data),

    update: (id: number, data: GradeEntryDTO) =>
        api.put<GradeEntryDTO>(`/grade-entries/${id}`, data),

    delete: (id: number) =>
        api.delete(`/grade-entries/${id}`),

    updateScore: (id: number, score: number) =>
        api.patch<GradeEntryDTO>(`/grade-entries/${id}/score`, null, { params: { score } })
};
