import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';

// Import the service functions
import {
  loginWithEmail,
  loginWithGoogle,
  register,
  logout,
  resetPassword,
} from '../services/auth.service';

// Mock the firebase config
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  googleProvider: {},
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWithEmail', () => {
    it('should call signInWithEmailAndPassword with correct credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as never);

      const result = await loginWithEmail('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid credentials', async () => {
      const error = new Error('auth/wrong-password');
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(error);

      await expect(loginWithEmail('test@example.com', 'wrongpass')).rejects.toThrow(
        'auth/wrong-password'
      );
    });

    it('should throw error for non-existent user', async () => {
      const error = new Error('auth/user-not-found');
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(error);

      await expect(loginWithEmail('nonexistent@example.com', 'password')).rejects.toThrow(
        'auth/user-not-found'
      );
    });
  });

  describe('loginWithGoogle', () => {
    it('should call signInWithPopup and return user', async () => {
      const mockUser = {
        uid: 'google-uid',
        email: 'google@gmail.com',
        displayName: 'Google User',
      };

      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser,
      } as never);

      const result = await loginWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when popup is closed', async () => {
      const error = new Error('auth/popup-closed-by-user');
      vi.mocked(signInWithPopup).mockRejectedValue(error);

      await expect(loginWithGoogle()).rejects.toThrow('auth/popup-closed-by-user');
    });
  });

  describe('register', () => {
    it('should create user and send email verification', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'newuser@example.com',
        displayName: null,
      };

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as never);
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined);

      const result = await register('newuser@example.com', 'securePass123!');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error for weak password', async () => {
      const error = new Error('auth/weak-password');
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(error);

      await expect(register('test@example.com', '123')).rejects.toThrow('auth/weak-password');
    });

    it('should throw error for existing email', async () => {
      const error = new Error('auth/email-already-in-use');
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(error);

      await expect(register('existing@example.com', 'password123')).rejects.toThrow(
        'auth/email-already-in-use'
      );
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined);

      await logout();

      expect(signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      await resetPassword('test@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw error for non-existent email', async () => {
      const error = new Error('auth/user-not-found');
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(error);

      await expect(resetPassword('nonexistent@example.com')).rejects.toThrow(
        'auth/user-not-found'
      );
    });
  });
});
