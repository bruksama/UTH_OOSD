import api from './api';

// =====================
// Statistics DTOs
// =====================

export interface CourseEnrollmentStats {
    courseCode: string;
    courseName: string;
    department: string;
    credits: number;
    totalEnrollments: number;
    completedEnrollments: number;
    averageScore: number;
}

export interface DepartmentStats {
    department: string;
    totalCourses: number;
    totalEnrollments: number;
    totalStudents: number;
    averageGpa: number;
}

export interface EnrollmentTrend {
    semester: string;
    academicYear: number;
    period: string;
    enrollmentCount: number;
    completedCount: number;
    averageScore: number;
}

export interface CreditDistribution {
    credits: number;
    courseCount: number;
    enrollmentCount: number;
}

export interface AdminDashboardStats {
    topCourses: CourseEnrollmentStats[];
    departmentStats: DepartmentStats[];
    enrollmentTrends: EnrollmentTrend[];
    creditDistribution: CreditDistribution[];
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    overallAverageGpa: number;
}

// =====================
// Statistics Service
// =====================

export const statisticsService = {
    /**
     * Get complete admin dashboard statistics
     */
    getDashboardStats: () =>
        api.get<AdminDashboardStats>('/statistics/dashboard'),

    /**
     * Get top enrolled courses
     */
    getTopCourses: (limit: number = 10) =>
        api.get<CourseEnrollmentStats[]>('/statistics/top-courses', { params: { limit } }),

    /**
     * Get department statistics
     */
    getDepartmentStats: () =>
        api.get<DepartmentStats[]>('/statistics/departments'),

    /**
     * Get enrollment trends
     */
    getEnrollmentTrends: () =>
        api.get<EnrollmentTrend[]>('/statistics/enrollment-trends'),

    /**
     * Get credit distribution
     */
    getCreditDistribution: () =>
        api.get<CreditDistribution[]>('/statistics/credit-distribution'),
};
