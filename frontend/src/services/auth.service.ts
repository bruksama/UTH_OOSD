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
const getFirebaseAuth = () => auth;

// Helper: Convert mock user to Firebase-like User object
interface MockUserLike {
  uid: string;
  email: string;
  displayName: string;
}

const convertMockUserToFirebaseUser = (mockUser: MockUserLike): User => {
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
  } as unknown as User;
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    console.log('Using mock authentication for login');
    const mockUser = await mockAuthService.login(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }

  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return userCredential.user;
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async (): Promise<User> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    console.log('Google auth not available, using mock authentication');
    throw new Error('Google Sign-in is not available in development mode without Firebase credentials');
  }

  if (!googleProvider) throw new Error('Google Sign-in provider is not configured');
  const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
  return userCredential.user;
};

/**
 * Register a new user with email and password
 */
export const register = async (email: string, password: string): Promise<User> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    console.log('Using mock authentication for registration');
    const mockUser = await mockAuthService.register(email, password);
    return convertMockUserToFirebaseUser(mockUser);
  }

  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    // Send email verification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }

  return userCredential.user;
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    await mockAuthService.logout();
    return;
  }

  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.warn('Backend logout failed:', error);
  }

  await signOut(firebaseAuth);
};

export const signOutLocally = async (): Promise<void> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    await mockAuthService.logout();
    return;
  }
  await signOut(firebaseAuth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    console.log('Password reset not available in mock auth mode');
    return;
  }

  try {
    await sendPasswordResetEmail(firebaseAuth, email);
  } catch (error) {
    console.warn('Password reset failed:', error);
  }
};

/**
 * Get the current user's ID token for API authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    return 'mock-id-token';
  }

  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};
