import { StudentDTO, StudentStatus, AlertLevel, EnrollmentDTO, EnrollmentStatus, ApprovalStatus } from '../types';

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

// ... existing code ...
/**
 * Get full name of a student
 */
export const getStudentFullName = (student: StudentDTO): string => {
    return `${student.firstName} ${student.lastName}`;
};

/**
 * Get Academic Classification based on GPA (Scale 4)
 * Returns 'New Student' for students without enrollment history
 */
export const getAcademicClassification = (gpa: number | undefined | null, credits: number | undefined | null): string => {
    // New student: no credits means no completed courses yet
    if (credits === undefined || credits === null || credits === 0) {
        return 'New Student';
    }
    // Has credits but no GPA (shouldn't happen, but handle gracefully)
    if (gpa === undefined || gpa === null) {
        return 'N/A';
    }
    // Academic classification based on GPA
    if (gpa >= 3.6) return 'Excellent';     // Xuất sắc
    if (gpa >= 3.2) return 'Very Good';     // Giỏi
    if (gpa >= 2.5) return 'Good';          // Khá
    if (gpa >= 2.0) return 'Average';       // Trung bình
    return 'Weak';                          // Yếu/Kém
};

/**
 * Get Color for Academic Classification
 */
export const getClassificationColor = (classification: string): string => {
    switch (classification) {
        case 'Excellent': return 'badge bg-purple-100 text-purple-700 border-purple-200';
        case 'Very Good': return 'badge bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Good': return 'badge bg-blue-100 text-blue-700 border-blue-200';
        case 'Average': return 'badge bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Weak': return 'badge bg-red-100 text-red-700 border-red-200';
        case 'New Student': return 'badge bg-indigo-100 text-indigo-700 border-indigo-200';
        default: return 'badge bg-slate-100 text-slate-500';
    }
};

/**
 * Get Display Status (Combines System Status and Academic Rank)
 */
export const getStatusDisplay = (student: StudentDTO): { label: string, color: string } => {
    // Priority 1: System Alerts
    if (student.status === StudentStatus.GRADUATED) {
        return { label: 'Graduated', color: 'badge bg-cyan-100 text-cyan-700 border-cyan-200' };
    }
    if (student.status === StudentStatus.PROBATION) {
        return { label: 'Probation', color: 'badge bg-red-100 text-red-700 border-red-200' };
    }
    if (student.status === StudentStatus.AT_RISK) {
        return { label: 'At Risk', color: 'badge bg-orange-100 text-orange-700 border-orange-200' };
    }

    // Priority 2: Academic Rank (for NORMAL status)
    const classification = getAcademicClassification(student.gpa, student.totalCredits);

    return {
        label: classification,
        color: getClassificationColor(classification)
    };
};

/**
 * Get Enrollment Status Display (Label and Color)
 * Handles logic for Completed (Score exists) vs In Progress vs Withdrawn
 */
export const getEnrollmentStatusDisplay = (enrollment: EnrollmentDTO): { label: string, color: string } => {
    if (typeof enrollment.finalScore === 'number') {
        return { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' };
    }
    if (enrollment.status === EnrollmentStatus.WITHDRAWN) {
        return { label: 'Withdrawn', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    // Default fallback for IN_PROGRESS
    return { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' };
};

/**
 * Get Approval Status Display (Label and Color)
 * Consistent styling for Courses and Enrollments pending approval
 */
export const getApprovalStatusDisplay = (status: ApprovalStatus | undefined): { label: string, color: string } => {
    switch (status) {
        case ApprovalStatus.APPROVED:
            return { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        case ApprovalStatus.REJECTED:
            return { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' };
        case ApprovalStatus.PENDING:
            return { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' };
        default:
            return { label: 'Draft', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    }
};

/**
 * Get Color Badge for Letter Grade
 * Based on 10-point scale thresholds
 */
export const getLetterGradeColor = (score: number | null | undefined): string => {
    const val = score || 0;
    if (val >= 8.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 8.0) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (val >= 7.0) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (val >= 6.5) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (val >= 5.5) return 'bg-violet-50 text-violet-700 border-violet-200';
    if (val >= 5.0) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (val >= 4.0) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
};
