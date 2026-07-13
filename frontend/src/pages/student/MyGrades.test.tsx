import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MyGrades from './MyGrades';

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: { studentId: 1, email: 'student@example.com', role: 'student' } }) }));
vi.mock('../../services', () => ({
    enrollmentService: { getByStudent: vi.fn().mockResolvedValue({ data: [] }), create: vi.fn(), withdraw: vi.fn() },
    courseOfferingService: { getAll: vi.fn().mockResolvedValue({ data: [] }) },
    gradeEntryService: { getHierarchy: vi.fn().mockResolvedValue({ data: [] }), create: vi.fn(), addChild: vi.fn(), delete: vi.fn(), updateScore: vi.fn() },
}));

describe('MyGrades accessibility', () => {
    it('toggles the GPA card by keyboard and exposes enrollment labels', async () => {
        render(<MyGrades />);
        const toggle = await screen.findByRole('button', { name: 'Toggle cumulative grade scale' });
        expect(toggle).toHaveTextContent('/ 4.0');
        toggle.focus();
        await userEvent.keyboard(' ');
        expect(toggle).toHaveTextContent('/ 10');
        await userEvent.click(screen.getByRole('button', { name: 'Add Enrollment' }));
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
        expect(screen.getByLabelText('Select Offering')).toHaveValue('');
        await waitFor(() => expect(screen.getByRole('button', { name: 'Enroll Now' })).toBeDisabled());
    });
});
