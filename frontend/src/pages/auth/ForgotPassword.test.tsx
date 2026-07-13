import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ForgotPassword from './ForgotPassword';

describe('ForgotPassword accessibility', () => {
    it('navigates back to login through a keyboard-accessible link', async () => {
        render(<MemoryRouter initialEntries={['/forgot-password']}><Routes><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/login" element={<div>Login destination</div>} /></Routes></MemoryRouter>);
        const link = screen.getByRole('link', { name: 'Back to login' });
        link.focus();
        await userEvent.keyboard('{Enter}');
        expect(screen.getByText('Login destination')).toBeInTheDocument();
    });
});
