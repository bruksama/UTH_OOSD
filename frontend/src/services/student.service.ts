import { StudentDTO } from "../types";
import {
    fetchStudents,
    fetchStudentById,
    fetchStudentByCode,
    searchStudentsByName,
    fetchAtRiskStudents,
} from "./student.api";

/**
 * Student Service Layer
 * Wraps API calls with error handling and business logic
 */

/**
 * Get all students from the backend
 */
export const getStudents = async (): Promise<StudentDTO[]> => {
    try {
        return await fetchStudents();
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

/**
 * Get a single student by database ID
 */
export const getStudentById = async (id: number): Promise<StudentDTO> => {
    try {
        return await fetchStudentById(id);
    } catch (error) {
        console.error(`Error fetching student with id ${id}:`, error);
        throw error;
    }
};

/**
 * Get a single student by student code (e.g., STU001)
 */
export const getStudentByCode = async (studentCode: string): Promise<StudentDTO> => {
    try {
        return await fetchStudentByCode(studentCode);
    } catch (error) {
        console.error(`Error fetching student with code ${studentCode}:`, error);
        throw error;
    }
};

/**
 * Search students by name
 */
export const searchStudents = async (name: string): Promise<StudentDTO[]> => {
    try {
        return await searchStudentsByName(name);
    } catch (error) {
        console.error(`Error searching students with name ${name}:`, error);
        throw error;
    }
};

/**
 * Get all at-risk students (AT_RISK or PROBATION status)
 */
export const getAtRiskStudents = async (): Promise<StudentDTO[]> => {
    try {
        return await fetchAtRiskStudents();
    } catch (error) {
        console.error("Error fetching at-risk students:", error);
        throw error;
    }
};
