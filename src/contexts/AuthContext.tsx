import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '../lib/stores/authStore';
import { User } from '../types';
import { supabase } from '../lib/supabase/config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Проверяем сессию Supabase при загрузке и синхронизируем с authStore
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsCheckingSession(true);
        
        // Проверяем сессию в Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Если сессии нет в Supabase, но есть в persist storage - очищаем
          if (authStore.isAuthenticated) {
            console.log('⚠️ Сессия Supabase не найдена, но есть в хранилище - очищаем');
            authStore.logout();
          }
        } else {
          // Если сессия есть в Supabase, проверяем что пользователь загружен
          if (session.user && !authStore.user) {
            // Пытаемся загрузить пользователя из БД
            try {
              const { supabaseUserService } = await import('../lib/supabase/services/UserService');
              const userData = await supabaseUserService.getUser(session.user.id);
              if (userData) {
                authStore.updateUser(userData);
                // Обновляем состояние авторизации
                const store = useAuthStore.getState();
                useAuthStore.setState({
                  ...store,
                  user: userData,
                  isAuthenticated: true,
                  accessToken: session.access_token,
                  refreshToken: session.refresh_token,
                });
              }
            } catch (err) {
              console.error('Failed to load user data:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // При ошибке - очищаем авторизацию
        if (authStore.isAuthenticated) {
          authStore.logout();
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []); // Только при первой загрузке

  const login = async (email: string, password: string) => {
    return authStore.login({ email, password });
  };

  const contextValue: AuthContextType = {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    loading: authStore.isLoading || isCheckingSession,
    error: authStore.error,
    login,
    logout: authStore.logout,
    updateUser: authStore.updateUser,
    clearError: authStore.clearError,
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
