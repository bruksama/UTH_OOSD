import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  loginWithEmail as firebaseLoginWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  register as firebaseRegister,
  logout as firebaseLogout,
} from '../services/auth.service';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import api from '../services/api';
import { UserRole, AuthUser, AuthState } from '../types';

interface AuthContextType extends AuthState {
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from backend to get role
  const fetchUserProfile = async (firebaseUser: User): Promise<AuthUser> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: response.data.role as UserRole,
        studentId: response.data.studentId,
      };
    } catch {
      // Default to student role if backend call fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'student',
      };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setError(null);

      if (firebaseUser) {
        const authUser = await fetchUserProfile(firebaseUser);
        setUser(authUser);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await firebaseLoginWithEmail(email, password);
      const authUser = await fetchUserProfile(firebaseUser);
      setUser(authUser);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await firebaseLoginWithGoogle();
      const authUser = await fetchUserProfile(firebaseUser);
      setUser(authUser);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseRegister(email, password);
      // Don't set user here - they need to verify email first
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseLogout();
      setUser(null);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    loginWithEmail,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
