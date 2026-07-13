import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentModal from './StudentModal';

const fillRequiredFields = () => {
  fireEvent.change(document.querySelector('[name="firstName"]')!, { target: { value: 'Ada' } });
  fireEvent.change(document.querySelector('[name="lastName"]')!, { target: { value: 'Lovelace' } });
  fireEvent.change(document.querySelector('[name="email"]')!, { target: { value: 'ada@example.com' } });
  fireEvent.change(document.querySelector('[name="dateOfBirth"]')!, { target: { value: '2000-01-01' } });
};

describe('StudentModal', () => {
  it('keeps the form open and retains values when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('save failed'));
    const onClose = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<StudentModal isOpen mode="create" onSubmit={onSubmit} onClose={onClose} />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create Student' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('[name="firstName"]')).toHaveValue('Ada');
  });

  it('closes exactly once after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<StudentModal isOpen mode="create" onSubmit={onSubmit} onClose={onClose} />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Create Student' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
