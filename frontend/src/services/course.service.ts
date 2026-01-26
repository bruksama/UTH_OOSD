import { CourseDTO } from "../types";
import { fetchCourses } from "./course.api";

/**
 * Course Service Layer
 * Wraps API calls with error handling and business logic
 */

/**
 * Get all courses from the backend
 */
export const getCourses = async (): Promise<CourseDTO[]> => {
    try {
        return await fetchCourses();
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
    }
};

/**
 * Search courses by name or code
 */
export const searchCourses = async (query: string): Promise<CourseDTO[]> => {
    try {
        const courses = await fetchCourses();
        const lowerQuery = query.toLowerCase();
        return courses.filter(
            (c) =>
                c.courseName.toLowerCase().includes(lowerQuery) ||
                c.courseCode.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error(`Error searching courses with query "${query}":`, error);
        throw error;
    }
};

/**
 * Get courses by department
 */
export const getCoursesByDepartment = async (department: string): Promise<CourseDTO[]> => {
    try {
        const courses = await fetchCourses();
        return courses.filter((c) => c.department === department);
    } catch (error) {
        console.error(`Error fetching courses for department ${department}:`, error);
        throw error;
    }
};
