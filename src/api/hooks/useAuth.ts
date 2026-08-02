// src/api/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

export function useLogin() {
  const { login } = useAuthStore();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      api.post('auth/login', { json: credentials }).json<{ status: 'success'; token: string; data: { user: any }; message: string }>(),
    onSuccess: async (data, variables) => {
      await login(variables.email, variables.password);
      showToast({ type: 'success', message: data.message || 'Welcome back!' });
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Login failed' });
    },
  });
}

export function useSignup() {
  const { signup } = useAuthStore();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) => 
      api.post('auth/signup', { json: data }).json<{ status: 'success'; token: string; data: { user: any }; message: string }>(),
    onSuccess: async (data, variables) => {
      await signup(variables.name, variables.email, variables.password);
      showToast({ type: 'success', message: data.message });
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Signup failed' });
    },
  });
}

export function useForgotPassword() {
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: (email: string) => 
      api.post('auth/forgot-password', { json: { email } }).json<{ status: 'success'; message: string }>(),
    onSuccess: (data) => {
      showToast({ type: 'success', message: data.message });
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to send reset code' });
    },
  });
}

export function useVerifyOTP() {
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => 
      api.post('auth/verify-otp', { json: { email, otp } }).json<{ status: 'success'; message: string }>(),
    onSuccess: (data) => {
      showToast({ type: 'success', message: data.message });
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Invalid OTP' });
    },
  });
}

export function useResetPassword() {
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) => 
      api.post('auth/reset-password', { json: { email, newPassword } }).json<{ status: 'success'; message: string }>(),
    onSuccess: (data) => {
      showToast({ type: 'success', message: data.message });
      router.replace('/(auth)/login');
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to reset password' });
    },
  });
}

export function useChangePassword() {
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      api.patch('users/change-password', { json: { currentPassword, newPassword } }).json<{ status: 'success'; message: string }>(),
    onSuccess: (data) => {
      showToast({ type: 'success', message: data.message });
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to change password' });
    },
  });
}

export function useUpdateProfile() {
  const { updateProfile } = useAuthStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => 
      api.patch(`users/me`, { json: data }).json<{ status: 'success'; data: { user: any }; message: string }>(),
    onSuccess: async (data) => {
      await updateProfile(data.data.user);
      showToast({ type: 'success', message: data.message });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
    },
  });
}