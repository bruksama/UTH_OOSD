import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Courses from './Courses';

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'admin', email: 'admin@example.com' } }) }));
vi.mock('../../services', () => ({
    courseService: {
        getAll: vi.fn().mockResolvedValue({ data: [{ id: 1, courseCode: 'CS101', courseName: 'Programming', credits: 3, department: 'CS', status: 'APPROVED' }] }),
        getOfferings: vi.fn().mockResolvedValue({ data: [] }), approve: vi.fn(), reject: vi.fn(), delete: vi.fn(), create: vi.fn(),
    },
    enrollmentService: { getByOffering: vi.fn() },
}));

describe('Courses enrollment dialog accessibility', () => {
    it('closes from the named native backdrop button', async () => {
        render(<Courses />);
        await userEvent.click(await screen.findByRole('button', { name: 'View Enrolled Students' }));
        const backdrop = screen.getAllByRole('button', { name: 'Close enrolled students dialog' })[0];
        backdrop.focus();
        await userEvent.keyboard('{Enter}');
        expect(screen.queryByRole('heading', { name: 'Enrolled Students' })).not.toBeInTheDocument();
    });
});
