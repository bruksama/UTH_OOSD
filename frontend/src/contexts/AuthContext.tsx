import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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

  // Flag để ngăn onAuthStateChanged ghi đè user khi đang login/logout thủ công
  const isManualAuthInProgress = useRef(false);

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
      const isUserAdmin = (firebaseUser.email || '').toLowerCase().includes('admin');
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'demo@example.com',
        displayName: firebaseUser.displayName || 'Demo User',
        role: (isUserAdmin ? 'admin' : 'student') as UserRole,
        studentId: undefined,
      };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Check if Firebase is available
    if (!auth) {
      console.log('Firebase not configured - app running in development mode');
      // Restore mock user from localStorage if available
      const savedMockUser = localStorage.getItem('spts_mock_user');
      if (savedMockUser) {
        try {
          setUser(JSON.parse(savedMockUser));
        } catch (e) {
          console.error('Failed to parse saved mock user', e);
        }
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Bỏ qua nếu đang trong quá trình login/logout thủ công
      // để tránh race condition: login set user → onAuthStateChanged reset user về null
      if (isManualAuthInProgress.current) {
        return;
      }

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
    isManualAuthInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await firebaseLoginWithEmail(email, password);
      const authUser = await fetchUserProfile(firebaseUser);
      setUser(authUser);
      
      if (!auth) {
        // Save mock user and token
        localStorage.setItem('spts_mock_user', JSON.stringify(authUser));
        localStorage.setItem('spts_mock_token', authUser.email || email);
      }
    } catch (err: any) {
      const message = err?.message || 'Login failed. Please try again.';
      setError(message);
      isManualAuthInProgress.current = false;
      throw new Error(message);
    } finally {
      setIsLoading(false);
      // Giải phóng flag sau một khoảng trễ nhỏ để cho phép
      // onAuthStateChanged fire xong trước khi reset cờ
      setTimeout(() => {
        isManualAuthInProgress.current = false;
      }, 2000);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    isManualAuthInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const firebaseUser = await firebaseLoginWithGoogle();
      const authUser = await fetchUserProfile(firebaseUser);
      setUser(authUser);

      if (!auth) {
        localStorage.setItem('spts_mock_user', JSON.stringify(authUser));
        localStorage.setItem('spts_mock_token', authUser.email || 'mock-google-user@example.com');
      }
    } catch (err: any) {
      const message = err?.message || 'Google login not available. Please use email/password login.';
      setError(message);
      isManualAuthInProgress.current = false;
      throw new Error(message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isManualAuthInProgress.current = false;
      }, 2000);
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

      if (!auth) {
        localStorage.setItem('spts_mock_user', JSON.stringify(authUser));
        localStorage.setItem('spts_mock_token', authUser.email || email);
      }
    } catch (err: any) {
      const message = err?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    isManualAuthInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await firebaseLogout();
      setUser(null);
      
      // Clear mock session
      localStorage.removeItem('spts_mock_user');
      localStorage.removeItem('spts_mock_token');
    } catch (err: any) {
      const message = err?.message || 'Logout failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      isManualAuthInProgress.current = false;
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
