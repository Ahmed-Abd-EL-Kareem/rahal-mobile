// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/api/client';
import { useMMKVStore } from './mmkvStore';
import { User, Subscription } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  setUser: (user: User) => void;
  setSubscription: (subscription: Subscription) => void;
}

const mmkvStorage = {
  getItem: (name: string) => {
    const value = useMMKVStore.getState().getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    useMMKVStore.getState().setString(name, value);
  },
  removeItem: (name: string) => {
    useMMKVStore.getState().delete(name);
  },
};

const setAuthToken = async (token: string) => {
  useMMKVStore.getState().setString('auth_token', token);
};

const getAuthToken = async () => {
  return useMMKVStore.getState().getString('auth_token') || null;
};

const clearAuthToken = async () => {
  useMMKVStore.getState().delete('auth_token');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      subscription: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('auth/login', {
            json: { email, password },
          }).json<{ token: string; data: { user: User } }>();
          
          const { token, data } = response;
          await setAuthToken(token);
          
          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          await get().fetchSubscription();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('auth/signup', {
            json: { name, email, password },
          }).json<{ token: string; data: { user: User } }>();
          
          const { token, data } = response;
          await setAuthToken(token);
          
          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          await get().fetchSubscription();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await clearAuthToken();
        set({
          user: null,
          token: null,
          subscription: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        const token = await getAuthToken();
        if (!token) return;
        
        try {
          const response = await api.get('users/me').json<{ data: { user: User } }>();
          set({ user: response.data.user });
          await get().fetchSubscription();
        } catch {
          get().logout();
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');
        
        set({ isLoading: true });
        try {
          const response = await api.patch(`users/${user._id}`, {
            json: data,
          }).json<{ data: { user: User } }>();
          
          set({ user: response.data.user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await api.patch('users/change-password', {
            json: { currentPassword, newPassword },
          }).json<void>();
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const token = await getAuthToken();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true, token });
        try {
          const response = await api.get('users/me').json<{ data: { user: User } }>();
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          await get().fetchSubscription();
        } catch {
          await clearAuthToken();
          set({
            user: null,
            token: null,
            subscription: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      fetchSubscription: async () => {
        try {
          const response = await api.get('subscriptions/my').json<{ data: Subscription }>();
          set({ subscription: response.data });
        } catch {
          set({ subscription: null });
        }
      },

      setUser: (user: User) => set({ user }),
      setSubscription: (subscription: Subscription) => set({ subscription }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        subscription: state.subscription,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);