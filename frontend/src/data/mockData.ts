/**
 * Mock data for frontend development
 * Matches Backend DTO structures
 *
 * @author SPTS Team
 */

import {
  StudentDTO,
  CourseDTO,
  AlertDTO,
  StudentStatus,
  GradingType,
  AlertLevel,
  AlertType,
  DashboardStats,
  GpaTrendData,
} from '../types';

/* ===================== STUDENTS ===================== */

export const mockStudents: StudentDTO[] = [
  {
    studentId: 'STU001',
    firstName: 'Nguyen',
    lastName: 'Van A',
    email: 'nguyenvana@student.edu',
    dateOfBirth: '2000-05-15',
    enrollmentDate: '2022-09-01',
    gpa: 3.45,
    totalCredits: 90,
    status: StudentStatus.NORMAL,
  },
  {
    studentId: 'STU002',
    firstName: 'Tran',
    lastName: 'Thi B',
    email: 'tranthib@student.edu',
    dateOfBirth: '2001-03-22',
    enrollmentDate: '2022-09-01',
    gpa: 1.85,
    totalCredits: 75,
    status: StudentStatus.AT_RISK,
  },
  {
    studentId: 'STU003',
    firstName: 'Le',
    lastName: 'Van C',
    email: 'levanc@student.edu',
    dateOfBirth: '2000-11-08',
    enrollmentDate: '2021-09-01',
    gpa: 1.35,
    totalCredits: 60,
    status: StudentStatus.PROBATION,
  },
  {
    studentId: 'STU004',
    firstName: 'Pham',
    lastName: 'Thi D',
    email: 'phamthid@student.edu',
    dateOfBirth: '1999-07-12',
    enrollmentDate: '2020-09-01',
    gpa: 3.78,
    totalCredits: 120,
    status: StudentStatus.GRADUATED,
  },
  {
    studentId: 'STU005',
    firstName: 'Hoang',
    lastName: 'Van E',
    email: 'hoangvane@student.edu',
    dateOfBirth: '2001-01-30',
    enrollmentDate: '2023-09-01',
    gpa: 2.95,
    totalCredits: 45,
    status: StudentStatus.NORMAL,
  },
];

/* ===================== COURSES ===================== */

export const mockCourses: CourseDTO[] = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    description: 'Fundamental concepts of computer science and programming',
    credits: 3,
    department: 'Computer Science',
    gradingType: GradingType.SCALE_10,
  },
  {
    courseCode: 'CS201',
    courseName: 'Data Structures and Algorithms',
    description: 'Advanced data structures and algorithm analysis',
    credits: 4,
    department: 'Computer Science',
    gradingType: GradingType.SCALE_10,
  },
  {
    courseCode: 'SE301',
    courseName: 'Software Engineering',
    description: 'Software development methodologies and practices',
    credits: 3,
    department: 'Software Engineering',
    gradingType: GradingType.SCALE_10,
  },
  {
    courseCode: 'DB201',
    courseName: 'Database Systems',
    description: 'Relational database design and SQL',
    credits: 3,
    department: 'Computer Science',
    gradingType: GradingType.SCALE_10,
  },
  {
    courseCode: 'INT100',
    courseName: 'Internship',
    description: 'Industry internship program',
    credits: 2,
    department: 'General',
    gradingType: GradingType.PASS_FAIL,
  },
];

/* ===================== ALERTS ===================== */

export const mockAlerts: AlertDTO[] = [
  {
    id: 1,
    studentId: 2, // ✅ number
    studentName: 'Tran Thi B',
    level: AlertLevel.HIGH,
    type: AlertType.LOW_GPA,
    message: 'ýP A has fallen below 2.0 threshold. Academic counseling recommended.',
    createdAt: '2025-01-10T09:30:00', // ✅ string
    isRead: false,
    isResolved: false,
  },
  {
    id: 2,
    studentId: 3, // ✅ number
    studentName: 'Le Van C',
    level: AlertLevel.CRITICAL,
    type: AlertType.PROBATION,
    message: 'Student has been placed on academic probation. GPA is below 1.5.',
    createdAt: '2025-01-08T14:15:00', // ✅ string
    isRead: true,
    isResolved: false,
  },
  {
    id: 3,
    studentId: 5, // ✅ number
    studentName: 'Hoang Van E',
    level: AlertLevel.INFO,
    type: AlertType.IMPROVEMENT,
    message: 'GPA has improved from 2.5 to 2.95. Good progress!',
    createdAt: '2025-01-05T11:00:00', // ✅ string
    isRead: true,
    isResolved: true,
    resolvedBy: 'admin',
    resolvedAt: '2025-01-06T10:00:00', // ✅ string
  },
  {
    id: 4,
    studentId: 2, // ✅ number
    studentName: 'Tran Thi B',
    level: AlertLevel.WARNING,
    type: AlertType.GPA_DROP,
    message: 'GPA dropped by 0.5 points in the last semester.',
    createdAt: '2025-01-03T16:45:00', // ✅ string
    isRead: false,
    isResolved: false,
  },
];

/* ===================== DASHBOARD ===================== */

export const mockDashboardStats: DashboardStats = {
  totalStudents: 5,
  atRiskCount: 1,
  probationCount: 1,
  averageGpa: 2.68,
  activeAlerts: 3,
};

export const mockGpaTrend: GpaTrendData[] = [
  { semester: 'Sem 1 23', gpa: 2.8 },
  { semester: 'Sem 2 24', gpa: 2.9 },
  { semester: 'Sem 1 24', gpa: 3.1 },
  { semester: 'Sem 2 25', gpa: 2.95 },
  { semester: 'Sem 1 25', gpa: 3.2 },
  { semester: 'Sem 2 26', gpa: 3.45 },
];

/* ===================== HELPERS ===================== */

export const getStudentFullName = (student: StudentDTO): string =>
    `${student.firstName} ${student.lastName}`;

export const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case StudentStatus.NORMAL:
      return 'badge-normal';
    case StudentStatus.AT_RISK:
      return 'badge-at-risk';
    case StudentStatus.PROBATION:
      return 'badge-probation';
    case StudentStatus.GRADUATED:
      return 'badge-graduated';
    default:
      return '';
  }
};

export const getAlertLevelColor = (level: AlertLevel): string => {
  switch (level) {
    case AlertLevel.INFO:
      return 'alert-info';
    case AlertLevel.WARNING:
      return 'alert-warning';
    case AlertLevel.HIGH:
      return 'alert-high';
    case AlertLevel.CRITICAL:
      return 'alert-critical';
    default:
      return '';
  }
};
export const mockStudentCourses = [
  {
    id: 'CS101',
    name: 'Introduction to Programming',
    credits: 3,
    score: 8.5,
  },
  {
    id: 'CS102',
    name: 'Data Structures',
    credits: 4,
    score: 7.2,
  },
  {
    id: 'MA101',
    name: 'Calculus',
    credits: 3,
    score: 6.0,
  },
  {
    id: 'EN101',
    name: 'English',
    credits: 2,
    score: 5.0,
  },
];
