import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state by fetching user profile using saved token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('greenintel_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        const userData = response.data;
        
        // Generate an initials avatar if none exists
        const initials = encodeURIComponent(userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: userData.created_at,
          avatarUrl: avatarUrl
        });
      } catch (err: any) {
        console.warn("Backend auth validation failed, clearing token...", err);
        localStorage.removeItem('greenintel_token');
        localStorage.removeItem('greenintel_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clearError = () => setError(null);

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      // Save token & user
      localStorage.setItem('greenintel_token', access_token);
      
      const initials = encodeURIComponent(userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
      const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

      const sessionUser: User = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at,
        avatarUrl
      };

      setUser(sessionUser);
      localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Invalid email or password.';
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg);
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

      const initials = encodeURIComponent(userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase());
      const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=F97316&color=fff&size=128&bold=true`;

      const sessionUser: User = {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at,
        avatarUrl
      };

      setUser(sessionUser);
      localStorage.setItem('greenintel_user', JSON.stringify(sessionUser));
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'An error occurred during signup.';
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth is disabled as it requires mock session fallback
  const loginWithGoogle = async (): Promise<void> => {
    const errMsg = "Google Sign In is currently disabled. Please sign in with your email.";
    setError(errMsg);
    throw new Error(errMsg);
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn("Backend logout endpoint failed or unreachable.", err);
    } finally {
      setUser(null);
      localStorage.removeItem('greenintel_token');
      localStorage.removeItem('greenintel_user');
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
