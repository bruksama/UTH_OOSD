import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Students, { getStudentGpaColor } from './Students';
import { studentService } from '../../services';

vi.mock('../../services', () => ({ studentService: {
  getAll: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
} }));

describe('Students modal adapter', () => {
  it('does not report a failed create as success', async () => {
    vi.mocked(studentService.getAll).mockResolvedValue({ data: [] } as never);
    vi.mocked(studentService.create).mockRejectedValue(new Error('save failed'));
    vi.stubGlobal('alert', vi.fn());
    render(<Students />);
    await screen.findByText('Register New Student');
    fireEvent.click(screen.getByText('Register New Student'));
    fireEvent.change(document.querySelector('[name="firstName"]')!, { target: { value: 'Ada' } });
    fireEvent.change(document.querySelector('[name="lastName"]')!, { target: { value: 'Lovelace' } });
    fireEvent.change(document.querySelector('[name="email"]')!, { target: { value: 'ada@example.com' } });
    fireEvent.change(document.querySelector('[name="dateOfBirth"]')!, { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Student' }));
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Failed to save student record'));
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });
});

describe('getStudentGpaColor', () => {
  it.each([
    [3.5, false, 'text-emerald-600'], [3.5, true, 'text-emerald-500'],
    [2.5, false, 'text-indigo-600'], [2.0, false, 'text-amber-600'],
    [2.0, true, 'text-indigo-600'], [1.99, false, 'text-red-500'],
  ] as const)('maps %s compact=%s to %s', (gpa, compact, expected) => {
    expect(getStudentGpaColor(gpa, compact)).toBe(expected);
  });
});
