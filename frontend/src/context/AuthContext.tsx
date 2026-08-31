import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  provider?: string;
  lastLogin?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('greenintel_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state by fetching user profile using saved token
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const token = localStorage.getItem('greenintel_token');
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        if (!isMounted) return;
        const userData = response.data;

        // Generate an initials avatar if none exists
        const initials = encodeURIComponent(
          userData.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        );
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

        const sessionUser: User = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: userData.created_at || userData.createdAt,
          avatarUrl: userData.profile_picture || userData.picture || userData.avatarUrl || fallbackAvatar,
          provider: userData.provider || userData.auth_provider || 'local',
          lastLogin: userData.last_login || userData.lastLogin,
          googleId: userData.google_id || userData.googleId
        };

        setUser(sessionUser);
        localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Backend auth validation failed, clearing token...", err);
          localStorage.removeItem('greenintel_token');
          localStorage.removeItem('greenintel_user');
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearError = () => setError(null);

  const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
    if (err && typeof err === 'object') {
      const errObj = err as { response?: { data?: { detail?: string } }; message?: string; code?: string };
      if (errObj.response?.data?.detail) return errObj.response.data.detail;
      if (errObj.code === 'ERR_NETWORK' || (errObj.message && errObj.message.includes('Network Error'))) {
        return 'Unable to connect to the authentication server. Please make sure the GreenIntel AI backend is running.';
      }
      if (errObj.message && !errObj.message.includes('Network Error')) return errObj.message;
    }
    return defaultMsg;
  };


  // Login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      // Save token & user
      localStorage.setItem('greenintel_token', access_token);

      const initials = encodeURIComponent(
        userData.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      );
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

      const sessionUser: User = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at || userData.createdAt,
        avatarUrl: userData.profile_picture || userData.picture || userData.avatarUrl || fallbackAvatar,
        provider: userData.provider || userData.auth_provider || 'local',
        lastLogin: userData.last_login || userData.lastLogin,
        googleId: userData.google_id || userData.googleId
      };

      setUser(sessionUser);
      localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'Invalid email or password.');
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  // Signup
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/signup', {
        name,
        email,
        password,
        confirm_password: password
      });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('greenintel_token', access_token);

      const initials = encodeURIComponent(
        userData.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      );
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

      const sessionUser: User = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at || userData.createdAt,
        avatarUrl: userData.profile_picture || userData.picture || userData.avatarUrl || fallbackAvatar,
        provider: userData.provider || userData.auth_provider || 'local',
        lastLogin: userData.last_login || userData.lastLogin,
        googleId: userData.google_id || userData.googleId
      };

      setUser(sessionUser);
      localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'An error occurred during signup.');
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth verification
  const loginWithGoogle = async (credential: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/google', { token: credential });
      const { access_token, user: userData } = response.data;

      // Save token
      localStorage.setItem('greenintel_token', access_token);

      const initials = encodeURIComponent(
        userData.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      );
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

      const sessionUser: User = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at || userData.createdAt || new Date().toISOString(),
        avatarUrl: userData.profile_picture || userData.picture || userData.avatarUrl || fallbackAvatar,
        provider: userData.provider || userData.auth_provider || 'google',
        lastLogin: userData.last_login || userData.lastLogin,
        googleId: userData.google_id || userData.googleId
      };

      setUser(sessionUser);
      localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
    } catch (err: unknown) {
      const errMsg = extractErrorMessage(err, 'Google authentication could not be completed. Please try again.');
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg, { cause: err });
    }
 finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('greenintel_token');
    localStorage.removeItem('greenintel_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
