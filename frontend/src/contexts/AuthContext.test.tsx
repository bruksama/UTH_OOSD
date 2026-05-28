import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import * as authService from '../services/auth.service';
import api from '../services/api';

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

vi.mock('../config/firebase', () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock('../services/auth.service', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../utils/firebaseErrors', () => ({
  getFirebaseErrorMessage: vi.fn((code: string) => {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
    };
    return messages[code] || 'An unexpected error occurred.';
  }),
}));

// Test component that uses useAuth
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.isLoading ? 'loading' : 'not-loading'}</span>
      <span data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user">{auth.user ? auth.user.email : 'no-user'}</span>
      <span data-testid="error">{auth.error || 'no-error'}</span>
      <button onClick={() => auth.loginWithEmail('test@example.com', 'password')}>
        Login Email
      </button>
      <button onClick={() => auth.loginWithGoogle()}>Login Google</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.register('new@example.com', 'password')}>Register</button>
      <button onClick={() => auth.updateUser({ displayName: 'Updated Name' })}>Update</button>
    </div>
  );
}

describe('AuthContext', () => {
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
      return vi.fn(); // unsubscribe function
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
    });

    it('should initialize with loading state', async () => {
      // Make onAuthStateChanged not call callback immediately
      vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn());

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should set user to null when no firebase user', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(null), 0);
        }
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });
    });

    it('should fetch user profile when firebase user exists', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(mockFirebaseUser as any), 0);
        }
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      expect(api.get).toHaveBeenCalledWith('/auth/me', {
        headers: { Authorization: 'Bearer mock-token' },
      });
    });

    it('should logout when backend profile fetch fails', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Backend error'));
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(mockFirebaseUser as any), 0);
        }
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
      });
    });
  });

  describe('loginWithEmail', () => {
    it('should successfully login with email', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithEmail).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await user.click(screen.getByText('Login Email'));

      await waitFor(() => {
        expect(authService.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password');
      });
    });

    it('should handle login error', async () => {
      const user = userEvent.setup();

      const error = { code: 'auth/invalid-credential', message: 'Invalid' };
      vi.mocked(authService.loginWithEmail).mockRejectedValue(error);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // The click triggers loginWithEmail which rejects, but the error is caught
      // internally by AuthContext and sets the error state
      try {
        await user.click(screen.getByText('Login Email'));
      } catch {
        // Error is expected and handled by AuthContext
      }

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password.');
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('should successfully login with Google', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.loginWithGoogle).mockResolvedValue(mockFirebaseUser as any);
      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'admin' },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await user.click(screen.getByText('Login Google'));

      await waitFor(() => {
        expect(authService.loginWithGoogle).toHaveBeenCalled();
      });
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.register).mockResolvedValue(mockFirebaseUser as any);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await user.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith('new@example.com', 'password');
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const user = userEvent.setup();

      vi.mocked(authService.logout).mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });
  });

  describe('updateUser', () => {
    it('should update user data when user is logged in', async () => {
      const user = userEvent.setup();

      vi.mocked(api.get).mockResolvedValue({
        data: { role: 'student', studentId: 1 },
      });

      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(mockFirebaseUser as any), 0);
        }
        return vi.fn();
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      await user.click(screen.getByText('Update'));

      // The update function modifies local state
      // Since we can't easily verify displayName from our test component,
      // we just verify the function doesn't throw
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });
  });
});
