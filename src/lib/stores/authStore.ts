import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, LoginResponse } from '../../types';
import { apiService } from '../api/client';

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
    (set, get) => ({
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
          
          // Тестовый логин для Сыроежкина (Админ)
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

      logout: () => {
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
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await apiService.post<{ accessToken: string }>('/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          
          set({
            accessToken,
            isLoading: false,
            error: null,
          });
          
          localStorage.setItem('auth_token', accessToken);
          
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
