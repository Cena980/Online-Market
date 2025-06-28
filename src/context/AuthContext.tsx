import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType {
  state: AuthState;
  signUp: (email: string, password: string, fullName: string, userType: 'customer' | 'business_owner') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      const { userId, error } = authAPI.verifyToken(storedToken);
      if (!error && userId) {
        authAPI.getCurrentUser()
          .then(({ user }) => {
            setState({ user, token: storedToken, loading: false });
          })
          .catch(() => {
            localStorage.removeItem('auth_token');
            setState(prev => ({ ...prev, loading: false }));
          });
        return;
      }
      // Invalid token, remove it
      localStorage.removeItem('auth_token');
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: 'customer' | 'business_owner') => {
    try {
      const { user, token } = await authAPI.register(email, password, fullName, userType);
      setState({ user, token, loading: false });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await authAPI.login(email, password);
      setState({ user, token, loading: false });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    }
  };

  const signOut = () => {
    authAPI.logout();
    setState({ user: null, token: null, loading: false });
  };

  const updateProfile = async (updates: Partial<User>) => {
    // This would need to be implemented in the API
    return { error: 'Profile update not implemented yet' };
  };

  return (
    <AuthContext.Provider value={{ state, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};