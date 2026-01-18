import { mockStudents } from '../data/mockData';
import { StudentDTO } from '../types';

export const fetchStudents = async (): Promise<StudentDTO[]> => {
    // mock API delay
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockStudents), 300);
    });
};
