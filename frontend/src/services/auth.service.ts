import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from './api';
import { mockAuthService } from './mockAuth';

// Helper: Check if Firebase is available
const isFirebaseAvailable = (): boolean => {
  return auth !== null && auth !== undefined;
};

// Helper: Convert mock user to Firebase-like User object
const convertMockUserToFirebaseUser = (mockUser: any): User => {
  return {
    uid: mockUser.uid,
    email: mockUser.email,
    displayName: mockUser.displayName,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    photoURL: null,
    phoneNumber: null,
    emailVerified: true,
    tenantId: null,
    refreshToken: 'mock-refresh-token',
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
      token: 'mock-id-token',
      expirationTime: new Date().toISOString(),
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      signInProvider: 'custom',
      signInSecondFactor: null,
      claims: {},
    }),
    delete: async () => {},
    reload: async () => {},
    toJSON: () => ({}),
  } as any as User;
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseAvailable()) {
    console.log('Using mock authentication for login');
    const mockUser = await mockAuthService.login(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.warn('Firebase login failed, using mock auth:', error);
    const mockUser = await mockAuthService.login(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async (): Promise<User> => {
  if (!isFirebaseAvailable()) {
    console.log('Google auth not available, using mock authentication');
    throw new Error('Google Sign-in is not available in development mode without Firebase credentials');
  }

  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    console.warn('Google login failed:', error);
    throw error;
  }
};

/**
 * Register a new user with email and password
 */
export const register = async (email: string, password: string): Promise<User> => {
  if (!isFirebaseAvailable()) {
    console.log('Using mock authentication for registration');
    const mockUser = await mockAuthService.register(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Send email verification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }

    return userCredential.user;
  } catch (error) {
    console.warn('Firebase registration failed, using mock auth:', error);
    const mockUser = await mockAuthService.register(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  if (!isFirebaseAvailable()) {
    await mockAuthService.logout();
    return;
  }

  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('Backend logout failed:', error);
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Firebase logout failed:', error);
    await mockAuthService.logout();
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (!isFirebaseAvailable()) {
    console.log('Password reset not available in mock auth mode');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.warn('Password reset failed:', error);
  }
};

/**
 * Get the current user's ID token for API authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  if (!isFirebaseAvailable()) {
    return 'mock-id-token';
  }

  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};
