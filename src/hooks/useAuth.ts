// src/hooks/useAuth.ts
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, signup, logout, checkAuth } = useAuthStore();
  const { showToast } = useUIStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showToast({ type: 'success', message: 'Welcome back!' });
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      showToast({ type: 'error', message });
      throw error;
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await signup(name, email, password);
      showToast({ type: 'success', message: 'Account created successfully!' });
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      showToast({ type: 'error', message });
      throw error;
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    checkAuth,
  };
}