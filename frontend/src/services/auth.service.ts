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

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async (): Promise<User> => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  return userCredential.user;
};

/**
 * Register a new user with email and password
 */
export const register = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

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
  await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Get the current user's ID token for API authentication
 */
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};
