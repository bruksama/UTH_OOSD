import { StudentDTO, StudentStatus, AlertLevel } from '../types';

/**
 * Utility functions for SPTS Frontend
 * These helper functions provide consistent styling and formatting
 * 
 * @author SPTS Team
 */

/**
 * Get CSS classes for student status badge
 */
export const getStatusColor = (status: StudentStatus): string => {
    switch (status) {
        case StudentStatus.NORMAL:
            return 'badge bg-green-100 text-green-700';
        case StudentStatus.AT_RISK:
            return 'badge bg-yellow-100 text-yellow-700';
        case StudentStatus.PROBATION:
            return 'badge bg-red-100 text-red-700';
        case StudentStatus.GRADUATED:
            return 'badge bg-blue-100 text-blue-700';
        default:
            return 'badge bg-slate-100 text-slate-700';
    }
};

/**
 * Get CSS classes for alert level badge
 */
export const getAlertLevelColor = (level: AlertLevel): string => {
    switch (level) {
        case AlertLevel.CRITICAL:
            return 'badge bg-red-100 text-red-700';
        case AlertLevel.HIGH:
            return 'badge bg-orange-100 text-orange-700';
        case AlertLevel.WARNING:
            return 'badge bg-yellow-100 text-yellow-700';
        case AlertLevel.INFO:
            return 'badge bg-blue-100 text-blue-700';
        default:
            return 'badge bg-slate-100 text-slate-700';
    }
};

/**
 * Get full name of a student
 */
export const getStudentFullName = (student: StudentDTO): string => {
    return `${student.firstName} ${student.lastName}`;
};
