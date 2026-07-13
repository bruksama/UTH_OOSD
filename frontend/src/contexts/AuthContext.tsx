import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  loginWithEmail as firebaseLoginWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  register as firebaseRegister,
  logout as firebaseLogout,
  signOutLocally,
} from '../services/auth.service';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import api from '../services/api';
import { AuthState, AuthUser, UserRole } from '../types';

interface AuthContextType extends AuthState {
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  retryProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const code = 'code' in error ? String(error.code) : '';
    if (code) return getFirebaseErrorMessage(code);
    if ('message' in error && typeof error.message === 'string') return error.message;
  }
  return fallback;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileUnavailable, setProfileUnavailable] = useState(false);
  const firebaseUserRef = useRef<User | null>(null);
  const requestGeneration = useRef(0);
  const mounted = useRef(true);

  const invalidateProfileRequests = useCallback(() => {
    requestGeneration.current += 1;
  }, []);

  const loadUserProfile = useCallback(async (firebaseUser: User): Promise<AuthUser | null> => {
    const generation = ++requestGeneration.current;
    firebaseUserRef.current = firebaseUser;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!mounted.current || generation !== requestGeneration.current) return null;

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: response.data.displayName || firebaseUser.displayName,
        role: response.data.role as UserRole,
        studentId: response.data.studentId,
      };
      setUser(authUser);
      setProfileUnavailable(false);
      setError(null);
      return authUser;
    } catch (profileError) {
      if (!mounted.current || generation !== requestGeneration.current) return null;
      setUser(null);
      const status = getErrorStatus(profileError);
      if (status === 401 || status === 403) {
        firebaseUserRef.current = null;
        setProfileUnavailable(false);
        setError('Your application profile is no longer authorized. Please sign in again.');
        try { await signOutLocally(); }
        catch (cleanupError) { console.warn('Local Firebase cleanup failed:', cleanupError); }
      } else {
        setProfileUnavailable(true);
        setError('Your profile is temporarily unavailable. Please retry.');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!auth) {
      const savedMockUser = localStorage.getItem('spts_mock_user');
      if (savedMockUser) {
        try { setUser(JSON.parse(savedMockUser) as AuthUser); }
        catch { localStorage.removeItem('spts_mock_user'); }
      }
      setIsLoading(false);
      return () => { mounted.current = false; invalidateProfileRequests(); };
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      invalidateProfileRequests();
      firebaseUserRef.current = firebaseUser;
      setIsLoading(true);
      setError(null);
      setProfileUnavailable(false);
      if (firebaseUser) await loadUserProfile(firebaseUser);
      else setUser(null);
      if (mounted.current) setIsLoading(false);
    });

    return () => {
      mounted.current = false;
      invalidateProfileRequests();
      unsubscribe();
    };
  }, [invalidateProfileRequests, loadUserProfile]);

  const completeLogin = useCallback(async (firebaseUser: User, email: string) => {
    setIsLoading(true);
    setError(null);
    const authUser = await loadUserProfile(firebaseUser);
    if (!auth && authUser) {
      localStorage.setItem('spts_mock_user', JSON.stringify(authUser));
      localStorage.setItem('spts_mock_token', authUser.email || email);
    }
    setIsLoading(false);
  }, [loadUserProfile]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try { await completeLogin(await firebaseLoginWithEmail(email, password), email); }
    catch (loginError) {
      const message = getErrorMessage(loginError, 'Login failed. Please try again.');
      setError(message); setIsLoading(false); throw new Error(message);
    }
  }, [completeLogin]);

  const loginWithGoogle = useCallback(async () => {
    try { await completeLogin(await firebaseLoginWithGoogle(), 'mock-google-user@example.com'); }
    catch (loginError) {
      const message = getErrorMessage(loginError, 'Google login not available. Please use email/password login.');
      setError(message); setIsLoading(false); throw new Error(message);
    }
  }, [completeLogin]);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true); setError(null);
    try {
      const registeredUser = await firebaseRegister(email, password);
      await completeLogin(auth ? registeredUser : await firebaseLoginWithEmail(email, password), email);
    } catch (registerError) {
      const message = getErrorMessage(registerError, 'Registration failed. Please try again.');
      setError(message); setIsLoading(false); throw new Error(message);
    }
  }, [completeLogin]);

  const logout = useCallback(async () => {
    invalidateProfileRequests();
    setIsLoading(true); setError(null); setProfileUnavailable(false);
    try {
      await firebaseLogout();
      firebaseUserRef.current = null;
      setUser(null);
      localStorage.removeItem('spts_mock_user');
      localStorage.removeItem('spts_mock_token');
    } catch (logoutError) {
      const message = getErrorMessage(logoutError, 'Logout failed. Please try again.');
      setError(message); throw new Error(message);
    } finally { setIsLoading(false); }
  }, [invalidateProfileRequests]);

  const retryProfile = useCallback(async () => {
    if (!firebaseUserRef.current) return;
    setIsLoading(true);
    try { await loadUserProfile(firebaseUserRef.current); }
    finally { if (mounted.current) setIsLoading(false); }
  }, [loadUserProfile]);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser((current) => current ? { ...current, ...data } : current);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user, isAuthenticated: Boolean(user), isLoading, error, isProfileUnavailable,
    loginWithEmail, loginWithGoogle, register, logout, updateUser, retryProfile,
  }), [user, isLoading, error, isProfileUnavailable, loginWithEmail, loginWithGoogle, register, logout, updateUser, retryProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
