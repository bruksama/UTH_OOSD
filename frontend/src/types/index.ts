/**
 * TypeScript type definitions for SPTS
 * Matches Backend DTOs for consistency
 *
 * @author SPTS Team
 */

// =====================
// ENUMS (Backend-aligned)
// =====================

export enum StudentStatus {
  NORMAL = "NORMAL",
  AT_RISK = "AT_RISK",
  PROBATION = "PROBATION",
  GRADUATED = "GRADUATED",
}

export enum GradingType {
  SCALE_10 = "SCALE_10",
  SCALE_4 = "SCALE_4",
  PASS_FAIL = "PASS_FAIL",
}

export enum Semester {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
}

export enum GradeEntryType {
  COMPONENT = "COMPONENT",
  FINAL = "FINAL",
}

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum AlertType {
  LOW_GPA = "LOW_GPA",
  GPA_DROP = "GPA_DROP",
  STATUS_CHANGE = "STATUS_CHANGE",
  PROBATION = "PROBATION",
  IMPROVEMENT = "IMPROVEMENT",
}

export enum EnrollmentStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  WITHDRAWN = "WITHDRAWN",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// =====================
// DTOs (Backend-aligned)
// =====================

export interface StudentDTO {
  id?: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  enrollmentDate?: string;
  gpa?: number;
  totalCredits?: number;
  status: StudentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDTO {
  id?: number;
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  department?: string;
  gradingType: GradingType;
  status?: ApprovalStatus;
  creatorEmail?: string;
}

export interface CourseOfferingDTO {
  id?: number;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  credits?: number;
  semester: Semester;
  academicYear: number;
  instructor?: string;
  maxEnrollment?: number;
  currentEnrollment?: number;
  gradingScale?: GradingType;
}

export interface EnrollmentDTO {
  id?: number;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  courseOfferingId: number;
  courseCode?: string;
  courseName?: string;
  credits?: number;
  semester?: Semester;
  academicYear?: number;
  finalScore?: number;
  letterGrade?: string;
  gpaValue?: number;
  status: EnrollmentStatus;
  enrolledAt?: string;
  completedAt?: string;
  gradeEntries?: GradeEntryDTO[];
}

export interface GradeEntryDTO {
  id?: number;
  enrollmentId: number;
  parentId?: number;
  children?: GradeEntryDTO[];
  name: string;
  weight: number;
  score?: number;
  calculatedScore?: number;
  entryType: GradeEntryType;
  recordedBy?: string;
  recordedAt?: string;
  notes?: string;
  courseCode?: string;
  courseName?: string;
  studentName?: string;
}

export interface AlertDTO {
  id?: number;
  studentId: number;
  studentName?: string;
  level: AlertLevel;
  type: AlertType;
  message: string;
  isRead: boolean;
  readAt?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// =====================
// Dashboard / Analytics
// =====================

export interface DashboardStats {
  totalStudents: number;
  atRiskCount: number;
  probationCount: number;
  averageGpa: number;
  activeAlerts: number;
  pendingCourses?: number;
}

export interface GpaTrendData {
  semester: string;
  gpa: number;
}

export interface CreditProgressData {
  category: string;
  earned: number;
  remaining: number;
}

// =====================
// Academic Summary
// =====================

export interface StudentAcademicSummary {
  studentId: number;
  studentName: string;
  cumulativeGpa?: number;
  totalCreditsEarned: number;
  totalCreditsAttempted: number;
  creditCompletionRate: number;
  enrollments: EnrollmentDTO[];
}

// =====================
// AUTH TYPES (Firebase)
// =====================

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  studentId?: number;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}
