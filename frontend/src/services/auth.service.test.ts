/// <reference types="vitest/globals" />

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import {
  loginWithEmail,
  loginWithGoogle,
  register,
  logout,
  resetPassword,
  getIdToken,
} from './auth.service';
import { mockAuthService } from './mockAuth';
import api from './api';

vi.mock('./api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

const fallbackMockUser = {
  uid: 'mock-test@example.com',
  email: 'test@example.com',
  displayName: 'test',
};

const resetMocks = () => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
};

test('loginWithEmail returns Firebase user when sign-in succeeds', async () => {
  resetMocks();

  const firebaseUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: firebaseUser } as any);

  const result = await loginWithEmail('test@example.com', 'password123');

  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
    expect.any(Object),
    'test@example.com',
    'password123'
  );
  expect(result).toEqual(firebaseUser);
});

test('loginWithEmail falls back to mock auth when Firebase sign-in fails', async () => {
  resetMocks();

  vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'));
  vi.spyOn(mockAuthService, 'login').mockResolvedValue(fallbackMockUser as any);

  const result = await loginWithEmail('test@example.com', 'wrong-password');

  expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrong-password');
  expect(result).toMatchObject({
    uid: fallbackMockUser.uid,
    email: fallbackMockUser.email,
    displayName: fallbackMockUser.displayName,
  });
});

test('loginWithGoogle returns Firebase user when popup sign-in succeeds', async () => {
  resetMocks();

  const firebaseUser = {
    uid: 'google-uid-123',
    email: 'google@example.com',
    displayName: 'Google User',
  };

  vi.mocked(signInWithPopup).mockResolvedValue({ user: firebaseUser } as any);

  const result = await loginWithGoogle();

  expect(signInWithPopup).toHaveBeenCalled();
  expect(result).toEqual(firebaseUser);
});

test('loginWithGoogle throws when popup sign-in fails', async () => {
  resetMocks();

  const error = new Error('Popup closed');
  vi.mocked(signInWithPopup).mockRejectedValue(error);

  await expect(loginWithGoogle()).rejects.toThrow('Popup closed');
});

test('register returns Firebase user when registration succeeds', async () => {
  resetMocks();

  const firebaseUser = {
    uid: 'new-uid-123',
    email: 'new@example.com',
    displayName: 'New User',
  };

  vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: firebaseUser } as any);
  vi.mocked(sendEmailVerification).mockResolvedValue(undefined);

  const result = await register('new@example.com', 'password123');

  expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
    expect.any(Object),
    'new@example.com',
    'password123'
  );
  expect(sendEmailVerification).toHaveBeenCalledWith(firebaseUser);
  expect(result).toEqual(firebaseUser);
});

test('register falls back to mock auth when Firebase registration fails', async () => {
  resetMocks();

  vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('Email already in use'));
  vi.spyOn(mockAuthService, 'register').mockResolvedValue(fallbackMockUser as any);

  const result = await register('existing@example.com', 'password123');

  expect(mockAuthService.register).toHaveBeenCalledWith('existing@example.com', 'password123');
  expect(result).toMatchObject({
    uid: fallbackMockUser.uid,
    email: fallbackMockUser.email,
    displayName: fallbackMockUser.displayName,
  });
});

test('logout signs out the current user', async () => {
  resetMocks();

  vi.mocked(signOut).mockResolvedValue(undefined);

  await logout();

  expect(api.post).toHaveBeenCalledWith('/auth/logout');
  expect(signOut).toHaveBeenCalledWith(expect.any(Object));
});

test('logout falls back to mock auth when Firebase sign-out fails', async () => {
  resetMocks();

  vi.mocked(signOut).mockRejectedValue(new Error('Network error'));
  vi.spyOn(mockAuthService, 'logout').mockResolvedValue(undefined);

  await expect(logout()).resolves.toBeUndefined();
  expect(api.post).toHaveBeenCalledWith('/auth/logout');
  expect(mockAuthService.logout).toHaveBeenCalled();
});

test('resetPassword sends a password reset email', async () => {
  resetMocks();

  vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

  await resetPassword('test@example.com');

  expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.any(Object), 'test@example.com');
});

test('resetPassword does not throw when Firebase reset fails', async () => {
  resetMocks();

  vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error('User not found'));

  await expect(resetPassword('nonexistent@example.com')).resolves.toBeUndefined();
});

test('getIdToken returns null when no user is logged in', async () => {
  resetMocks();

  await expect(getIdToken()).resolves.toBeNull();
});
