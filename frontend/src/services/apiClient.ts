import api from './api';
import { StudentDTO } from '../types';

/**
 * Fetch all students from backend API
 * Endpoint: GET /api/students
 */
export const fetchStudents = async (): Promise<StudentDTO[]> => {
    const response = await api.get<StudentDTO[]>('/students');
    return response.data;
};

/**
 * Fetch a single student by ID
 * Endpoint: GET /api/students/{id}
 */
export const fetchStudentById = async (id: number): Promise<StudentDTO> => {
    const response = await api.get<StudentDTO>(`/students/${id}`);
    return response.data;
};

/**
 * Fetch a single student by student code (e.g., STU001)
 * Endpoint: GET /api/students/code/{studentCode}
 */
export const fetchStudentByCode = async (studentCode: string): Promise<StudentDTO> => {
    const response = await api.get<StudentDTO>(`/students/code/${studentCode}`);
    return response.data;
};

/**
 * Search students by name
 * Endpoint: GET /api/students/search?name={name}
 */
export const searchStudentsByName = async (name: string): Promise<StudentDTO[]> => {
    const response = await api.get<StudentDTO[]>('/students/search', { params: { name } });
    return response.data;
};

/**
 * Fetch at-risk students (AT_RISK or PROBATION status)
 * Endpoint: GET /api/students/at-risk
 */
export const fetchAtRiskStudents = async (): Promise<StudentDTO[]> => {
    const response = await api.get<StudentDTO[]>('/students/at-risk');
    return response.data;
};
