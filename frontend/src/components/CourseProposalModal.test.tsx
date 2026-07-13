import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CourseProposalModal, { generateCourseCode } from './CourseProposalModal';

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'admin', email: 'admin@example.com' } }) }));

describe('CourseProposalModal accessibility', () => {
    it('associates visible labels and names the close control', () => {
        render(<CourseProposalModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} existingDepartments={['CS']} />);
        expect(screen.getByLabelText('Course Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Category / Department *')).toBeInTheDocument();
        expect(screen.getByLabelText('Credits *')).toBeInTheDocument();
        expect(screen.getByLabelText('Course ID (Auto-generated)')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close course proposal' })).toBeInTheDocument();
    });
});

describe('generateCourseCode', () => {
    const legacyCourseCode = (department: string, courseName: string) => {
        const prefix = department.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
        let hash = 0;
        for (let index = 0; index < courseName.length; index++) {
            hash = Math.trunc(((hash << 5) - hash) + courseName.charCodeAt(index));
        }
        return `${prefix}${Math.abs(hash) % 9000 + 1000}`;
    };

    it.each(['Algorithms', 'Điện toán', 'AI 🧠 Systems'])(
        'preserves the legacy UTF-16 hash for %s',
        (courseName) => expect(generateCourseCode('Computer Science', courseName)).toBe(legacyCourseCode('Computer Science', courseName)),
    );

    it('preserves the empty-department fallback and default course name', () => {
        expect(generateCourseCode('', 'Algorithms')).toBe('NEW-0000');
        expect(generateCourseCode('IT')).toBe(legacyCourseCode('IT', ''));
    });
});
