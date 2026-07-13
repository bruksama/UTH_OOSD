import { describe, expect, it } from 'vitest';
import { StudentStatus } from '../types';
import {
  createInitialStudentForm, generateStudentId, getStatusStyle, getStudentFormErrors, isValidEmail,
} from './student-modal-helpers';

describe('student modal helpers', () => {
  it('creates deterministic student identifiers with the public ID format', () => {
    expect(generateStudentId(new Date('2026-01-01'), () => 0)).toBe('STU-2026-10000');
  });

  it('initializes create and edit forms without mutating the student', () => {
    expect(createInitialStudentForm('create').status).toBe(StudentStatus.NORMAL);
    const student = { studentId: 'S1', firstName: 'A', lastName: 'B', email: 'a@b.co', status: StudentStatus.NORMAL };
    expect(createInitialStudentForm('edit', student)).toEqual(student);
    expect(createInitialStudentForm('edit', student)).not.toBe(student);
  });

  it('validates required fields and email format', () => {
    expect(getStudentFormErrors({})).toEqual({
      firstName: 'First name is required', lastName: 'Last name is required', studentId: 'Student ID is required',
      email: 'Email is required', dateOfBirth: 'Date of birth is required',
    });
    expect(isValidEmail('student@example.com')).toBe(true);
    expect(isValidEmail(`${'a'.repeat(300)}@example.com`)).toBe(false);
  });

  it('maps status styling without nested conditionals', () => {
    expect(getStatusStyle(StudentStatus.PROBATION)).toContain('red');
    expect(getStatusStyle(StudentStatus.GRADUATED)).toContain('blue');
  });
});
