import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import * as authService from '../../services/auth.service';
import api from '../../services/api';

// Mock dependencies
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
    getAuth: vi.fn(() => ({})),
    GoogleAuthProvider: vi.fn(),
  };
});

vi.mock('../../config/firebase', () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock('../../services/auth.service', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../utils/firebaseErrors', () => ({
  getFirebaseErrorMessage: vi.fn((code: string) => {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    };
    return messages[code] || 'An unexpected error occurred.';
  }),
}));

// Helper to render Login with all required providers
function renderLogin(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/forgot-password" element={<div>Forgot Password</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  const mockFirebaseUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: vi.fn(() => Promise.resolve('mock-token')),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no user logged in
    vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      }
      return vi.fn();
    });
  });

  describe('Rendering', () => {
    it('should render login form', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByText('SPTS Login')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    });

    it('should render links to register and forgot password', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByText('Create an account')).toBeInTheDocument();
      });

      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('should have required attributes on inputs', async () => {
      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Email Login', () => {
    it('should call loginWithEmail on form submission', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(authService.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();

      // Make login take some time
      vi.mocked(authService.loginWithEmail).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockFirebaseUser as any), 100))
      );

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });

    it('should disable inputs during login', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockFirebaseUser as any), 100))
      );

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByPlaceholderText('Email')).toBeDisabled();
      expect(screen.getByPlaceholderText('Password')).toBeDisabled();
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();

      const error = { code: 'auth/invalid-credential', message: 'Invalid' };
      vi.mocked(authService.loginWithEmail).mockRejectedValue(error);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });
    });

    it('should clear error when trying again', async () => {
      const user = userEvent.setup();

      const error = { code: 'auth/invalid-credential', message: 'Invalid' };
      vi.mocked(authService.loginWithEmail).mockRejectedValueOnce(error);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      // First attempt fails
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
      });

      // Second attempt clears error
      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      await user.clear(screen.getByPlaceholderText('Password'));
      await user.type(screen.getByPlaceholderText('Password'), 'correctpassword');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Google Login', () => {
    it('should call loginWithGoogle on button click', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithGoogle).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Sign in with Google/i }));

      await waitFor(() => {
        expect(authService.loginWithGoogle).toHaveBeenCalled();
      });
    });

    it('should display error on Google login failure', async () => {
      const user = userEvent.setup();

      const error = { code: 'auth/popup-closed-by-user', message: 'Popup closed' };
      vi.mocked(authService.loginWithGoogle).mockRejectedValue(error);

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Sign in with Google/i }));

      await waitFor(() => {
        expect(screen.getByText('Sign-in popup was closed.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should redirect student to student dashboard after login', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'student@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect admin to admin dashboard after login', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'admin' },
      });

      renderLogin();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect to original destination if provided in state', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      // Render with location state indicating a redirect from
      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/student/grades' } } }]}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/student/grades" element={<div>Student Grades</div>} />
              <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Email'), 'student@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Student Grades')).toBeInTheDocument();
      });
    });

    it('should not render login form if user is already logged in', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          callback(mockFirebaseUser as any);
        }
        return vi.fn();
      });

      renderLogin();

      await waitFor(() => {
        expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByText('SPTS Login')).not.toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should navigate to register page when clicking create account link', async () => {
      const user = userEvent.setup();

      renderLogin();

      await waitFor(() => {
        expect(screen.getByText('Create an account')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create an account'));

      await waitFor(() => {
        expect(screen.getByText('Register Page')).toBeInTheDocument();
      });
    });

    it('should navigate to forgot password page when clicking forgot password link', async () => {
      const user = userEvent.setup();

      renderLogin();

      await waitFor(() => {
        expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Forgot password?'));

      await waitFor(() => {
        expect(screen.getByText('Forgot Password')).toBeInTheDocument();
      });
    });
  });
});
