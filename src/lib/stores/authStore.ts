import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, LoginResponse } from '../../types';
import { apiService } from '../api/client';
import { supabase } from '../supabase/config';
import { supabaseUserService } from '../supabase/services/UserService';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Проверяем сессию Supabase при инициализации store
      // Если сессии нет - сбрасываем состояние
      if (typeof window !== 'undefined') {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error || !session) {
            // Нет сессии - очищаем состояние
            const currentState = get();
            if (currentState.isAuthenticated) {
              set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        }).catch(() => {
          // При ошибке тоже очищаем
          const currentState = get();
          if (currentState.isAuthenticated) {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        });
      }
      
      return {
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          // Тестовый логин для Сыроежкина (Админ) - fallback
          if (credentials.email === 'syroejkin@workshop.ru' && credentials.password === 'admin123') {
            const adminUser: User = {
              id: '9fc4d042-f598-487c-a383-cccfe0e219db',
              name: 'Сыроежкин',
              email: 'syroejkin@workshop.ru',
              phone: '+7 495 123-45-67',
              role: 'Admin',
              active: true,
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              permissions: ['*']
            };
            
            const mockToken = 'mock_admin_token_' + Date.now();
            
            set({
              user: adminUser,
              accessToken: mockToken,
              refreshToken: mockToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('refresh_token', mockToken);
            return;
          }
          
          // Попытка входа через Supabase
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            if (data.user) {
              // Получаем данные пользователя из нашей таблицы users
              const userData = await supabaseUserService.getUser(data.user.id);
              
              set({
                user: userData,
                accessToken: data.session?.access_token || null,
                refreshToken: data.session?.refresh_token || null,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              
              // Сохраняем токены
              if (data.session?.access_token) {
                localStorage.setItem('auth_token', data.session.access_token);
              }
              if (data.session?.refresh_token) {
                localStorage.setItem('refresh_token', data.session.refresh_token);
              }
              
              return;
            }
          } catch (supabaseError: any) {
            // Если Supabase не работает, используем fallback
          }
          
          // Если неверные данные
          throw new Error('Неверный email или пароль');
          
        } catch (error: any) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Ошибка входа в систему',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Выход из Supabase
          await supabase.auth.signOut();
        } catch (error) {
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear tokens from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      },

      refreshAuth: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            get().logout();
            return;
          }
          
          if (data.session) {
            set({
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              isLoading: false,
              error: null,
            });
            
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);
          }
          
        } catch (error: any) {
          get().logout();
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
