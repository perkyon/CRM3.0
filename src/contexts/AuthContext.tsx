import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../lib/stores/authStore';
import { LoginRequest, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  // Auto-refresh token on app start
  useEffect(() => {
    if (isAuthenticated) {
      // Check if token is expired and refresh if needed
      const token = localStorage.getItem('auth_token');
      if (token) {
        // In a real app, you would decode the JWT and check expiration
        // For now, we'll just ensure the token exists
        console.log('User is authenticated, token exists');
      }
    }
  }, [isAuthenticated]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
