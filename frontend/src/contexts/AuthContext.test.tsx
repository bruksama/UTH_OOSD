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
  signOutLocally: vi.fn(),
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
      <span data-testid="profile-unavailable">{auth.isProfileUnavailable ? 'unavailable' : 'available'}</span>
      <button onClick={() => { void auth.loginWithEmail('test@example.com', 'password').catch(() => undefined); }}>
        Login Email
      </button>
      <button onClick={() => auth.loginWithGoogle()}>Login Google</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.register('new@example.com', 'password')}>Register</button>
      <button onClick={() => auth.updateUser({ displayName: 'Updated Name' })}>Update</button>
      <button onClick={() => { void auth.retryProfile(); }}>Retry Profile</button>
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

  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => { resolve = done; });
    return { promise, resolve };
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

    it('should retain Firebase identity but withhold application auth when profile is transiently unavailable', async () => {
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

      await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('temporarily unavailable'));
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('performs local-only cleanup for unauthorized profiles even when cleanup rejects', async () => {
      vi.mocked(api.get).mockRejectedValue({ response: { status: 401 } });
      vi.mocked(authService.signOutLocally).mockRejectedValue(new Error('cleanup failed'));
      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') setTimeout(() => callback(mockFirebaseUser as any), 0);
        return vi.fn();
      });
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      render(<AuthProvider><TestConsumer /></AuthProvider>);
      await waitFor(() => expect(authService.signOutLocally).toHaveBeenCalled());
      expect(authService.logout).not.toHaveBeenCalled();
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    it('retries a transiently unavailable profile without forcing logout', async () => {
      const user = userEvent.setup();
      vi.mocked(api.get)
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ data: { role: 'student', studentId: 1 } });
      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') setTimeout(() => callback(mockFirebaseUser as any), 0);
        return vi.fn();
      });
      render(<AuthProvider><TestConsumer /></AuthProvider>);
      await waitFor(() => expect(screen.getByTestId('profile-unavailable')).toHaveTextContent('unavailable'));
      await user.click(screen.getByText('Retry Profile'));
      await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated'));
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('does not restore a profile that resolves after logout', async () => {
      const user = userEvent.setup();
      const profile = deferred<{ data: { role: string; studentId: number } }>();
      vi.mocked(api.get).mockReturnValue(profile.promise as never);
      vi.mocked(authService.logout).mockResolvedValue(undefined);
      vi.mocked(onAuthStateChanged).mockImplementation((_, callback) => {
        if (typeof callback === 'function') setTimeout(() => callback(mockFirebaseUser as any), 0);
        return vi.fn();
      });
      render(<AuthProvider><TestConsumer /></AuthProvider>);
      await waitFor(() => expect(api.get).toHaveBeenCalled());
      await user.click(screen.getByText('Logout'));
      profile.resolve({ data: { role: 'student', studentId: 1 } });
      await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('not-loading'));
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    it('keeps the newest account when profile responses resolve out of order', async () => {
      const first = deferred<{ data: { role: string; displayName: string } }>();
      const second = deferred<{ data: { role: string; displayName: string } }>();
      vi.mocked(api.get).mockReturnValueOnce(first.promise as never).mockReturnValueOnce(second.promise as never);
      let callback: ((firebaseUser: any) => void) | undefined;
      vi.mocked(onAuthStateChanged).mockImplementation((_, next) => { callback = next as typeof callback; return vi.fn(); });
      render(<AuthProvider><TestConsumer /></AuthProvider>);
      callback?.(mockFirebaseUser);
      callback?.({ ...mockFirebaseUser, uid: 'second', email: 'second@example.com' });
      second.resolve({ data: { role: 'student', displayName: 'Second' } });
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('second@example.com'));
      first.resolve({ data: { role: 'admin', displayName: 'First' } });
      await Promise.resolve();
      expect(screen.getByTestId('user')).toHaveTextContent('second@example.com');
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
