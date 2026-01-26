import api from './api';
import { StudentDTO } from '../types';

/**
 * GET /api/students
 */
export const fetchStudents = async (): Promise<StudentDTO[]> => {
    const res = await api.get<StudentDTO[]>('/students');
    return res.data;
};

/**
 * GET /api/students/{id}
 */
export const fetchStudentById = async (id: number): Promise<StudentDTO> => {
    const res = await api.get<StudentDTO>(`/students/${id}`);
    return res.data;
};

/**
 * GET /api/students/code/{studentCode}
 */
export const fetchStudentByCode = async (
    studentCode: string
): Promise<StudentDTO> => {
    const res = await api.get<StudentDTO>(
        `/students/code/${studentCode}`
    );
    return res.data;
};

/**
 * GET /api/students/search?name=
 */
export const searchStudentsByName = async (
    name: string
): Promise<StudentDTO[]> => {
    const res = await api.get<StudentDTO[]>('/students/search', {
        params: { name },
    });
    return res.data;
};

/**
 * GET /api/students/at-risk
 */
export const fetchAtRiskStudents = async (): Promise<StudentDTO[]> => {
    const res = await api.get<StudentDTO[]>('/students/at-risk');
    return res.data;
};
