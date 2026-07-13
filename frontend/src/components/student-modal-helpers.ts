import { StudentDTO, StudentStatus } from '../types';

export type StudentModalMode = 'create' | 'edit';
export type StudentFormErrors = Record<string, string>;

export const generateStudentId = (now = new Date(), random = Math.random): string => {
  const value = Math.floor(10000 + random() * 90000);
  return `STU-${now.getFullYear()}-${value}`;
};

export const createInitialStudentForm = (
  mode: StudentModalMode,
  student?: StudentDTO | null,
): Partial<StudentDTO> => mode === 'edit' && student
  ? { ...student }
  : { studentId: generateStudentId(), status: StudentStatus.NORMAL };

export const isValidEmail = (email: string): boolean => {
  if (email.length > 254 || /\s/.test(email)) return false;
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) return false;
  const domain = email.slice(at + 1);
  return domain.length >= 3 && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
};

export const getStudentFormErrors = (form: Partial<StudentDTO>): StudentFormErrors => {
  const errors: StudentFormErrors = {};
  if (!form.firstName?.trim()) errors.firstName = 'First name is required';
  if (!form.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!form.studentId?.trim()) errors.studentId = 'Student ID is required';
  if (!form.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email)) errors.email = 'Invalid email format';
  if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
  return errors;
};

export const getStatusStyle = (status?: StudentStatus): string => {
  switch (status) {
    case StudentStatus.NORMAL: return 'bg-green-100 text-green-700';
    case StudentStatus.AT_RISK: return 'bg-yellow-100 text-yellow-700';
    case StudentStatus.PROBATION: return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

export const getSubmitLabel = (mode: StudentModalMode, isLoading: boolean): string => {
  if (isLoading) return 'Processing...';
  return mode === 'create' ? 'Create Student' : 'Save Changes';
};
