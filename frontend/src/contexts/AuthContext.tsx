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
  const fetchUserProfile = async (firebaseUser: User): Promise<AuthUser | null> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: response.data.displayName || firebaseUser.displayName,
        role: response.data.role as UserRole,
        studentId: response.data.studentId,
      };
    } catch (error) {
      // In development with mock auth, create a basic user without backend profile
      console.warn('Could not fetch user profile from backend, using basic auth user:', error);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'demo@example.com',
        displayName: firebaseUser.displayName || 'Demo User',
        role: 'student' as UserRole,
        studentId: undefined,
      };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Check if Firebase is available
    if (!auth) {
      console.log('Firebase not configured - app running in development mode');
      setIsLoading(false);
      return;
    }

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
      const message = err?.message || 'Login failed. Please try again.';
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
      const message = err?.message || 'Google login not available. Please use email/password login.';
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
      // Auto-login after registration with mock auth
      const firebaseUser = await firebaseLoginWithEmail(email, password);
      const authUser = await fetchUserProfile(firebaseUser);
      setUser(authUser);
    } catch (err: any) {
      const message = err?.message || 'Registration failed. Please try again.';
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
      const message = err?.message || 'Logout failed. Please try again.';
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
