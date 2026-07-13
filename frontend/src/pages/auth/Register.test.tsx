import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Register from './Register';

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ register: vi.fn() }) }));

describe('Register accessibility', () => {
    it('navigates back to login through a link', async () => {
        render(<MemoryRouter initialEntries={['/register']}><Routes><Route path="/register" element={<Register />} /><Route path="/login" element={<div>Login destination</div>} /></Routes></MemoryRouter>);
        await userEvent.click(screen.getByRole('link', { name: 'Back to login' }));
        expect(screen.getByText('Login destination')).toBeInTheDocument();
    });
});
