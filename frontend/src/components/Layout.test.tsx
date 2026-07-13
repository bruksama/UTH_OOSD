import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Layout from './Layout';

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'student', email: 'student@example.com' }, logout: vi.fn() }) }));

describe('Layout accessibility', () => {
    it('opens and closes mobile navigation with named buttons', async () => {
        render(<MemoryRouter initialEntries={['/student/dashboard']}><Routes><Route element={<Layout />}><Route path="/student/dashboard" element={<div>Dashboard</div>} /></Route></Routes></MemoryRouter>);
        await userEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
        expect(screen.getAllByRole('button', { name: 'Close navigation menu' })).toHaveLength(2);
        await userEvent.click(screen.getAllByRole('button', { name: 'Close navigation menu' })[0]);
        expect(screen.queryAllByRole('button', { name: 'Close navigation menu' })).toHaveLength(1);
    });
});
