import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StudentProfile from './StudentProfile';

const authValue = vi.hoisted(() => ({ user: { studentId: 1 }, updateUser: vi.fn() }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => authValue }));
vi.mock('../../services', () => ({
    studentService: { getById: vi.fn().mockResolvedValue({ data: { id: 1, studentId: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', dateOfBirth: '2000-01-01' } }), update: vi.fn() },
    enrollmentService: { getByStudent: vi.fn().mockResolvedValue({ data: [] }) },
}));

describe('StudentProfile accessibility', () => {
    it('associates profile labels and preserves disabled/edit states', async () => {
        render(<StudentProfile />);
        const firstName = await screen.findByLabelText('First Name');
        expect(firstName).toBeDisabled();
        expect(screen.getByLabelText('Last Name')).toBeDisabled();
        expect(screen.getByLabelText('Email Address')).toBeDisabled();
        expect(screen.getByLabelText('Date of Birth')).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Edit Profile' }));
        expect(firstName).toBeEnabled();
    });
});
