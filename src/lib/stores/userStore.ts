import { create } from 'zustand';
import { User } from '../../types';
import { supabaseUserService } from '../supabase/services/UserService';

interface UserState {
  // State
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchUsersByRole: (role: string) => Promise<User[]>;
  fetchCurrentUser: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  // Actions
  fetchUsers: async () => {
    const state = get();
    const now = Date.now();
    
    // Кэширование: не загружаем повторно в течение 60 секунд
    if (state.lastFetchTime && (now - state.lastFetchTime) < 60000 && state.users.length > 0) {
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const users = await supabaseUserService.getUsers();
      
      set({
        users,
        isLoading: false,
        lastFetchTime: now,
      });
      
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки пользователей',
      });
    }
  },

  fetchUsersByRole: async (role: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const users = await supabaseUserService.getUsersByRole(role);
      
      set({ isLoading: false });
      return users;
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки пользователей',
      });
      return [];
    }
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Проверяем авторизованного пользователя из AuthStore
      const savedUser = localStorage.getItem('crm_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          set({ currentUser: user, isLoading: false });
          return;
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
      
      // Если нет сохраненного пользователя, пробуем загрузить из Supabase
      const currentUser = await supabaseUserService.getCurrentUser();
      
      set({
        currentUser,
        isLoading: false,
      });
      
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Ошибка загрузки текущего пользователя',
      });
    }
  },

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
