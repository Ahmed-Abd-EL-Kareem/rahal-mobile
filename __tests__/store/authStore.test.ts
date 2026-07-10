import React from 'react';
import { act } from '@testing-library/react-native';
import { useAuthStore } from '@/store/authStore';
import { useMMKVStore } from '@/store/mmkvStore';
import { api } from '@/api/client';

jest.mock('@/store/mmkvStore');
jest.mock('@/api/client');

const mockApi = api as jest.Mocked<typeof api>;
const mockMMKV = useMMKVStore as jest.Mocked<typeof useMMKVStore>;

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      subscription: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  const mockSetState = useAuthStore.setState;
  const mockGetState = useAuthStore.getState;

  describe('login', () => {
    it('sets authenticated state on successful login', async () => {
      mockApi.post.mockResolvedValue({
        token: 'test-token',
        data: { user: { _id: '1', name: 'Test User', email: 'test@test.com' } },
      });
      mockMMKV.getState().setString.mockResolvedValue(undefined);

      await act(async () => {
        await useAuthStore.getState().login('test@test.com', 'password');
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('test-token');
      expect(state.user).toEqual({ _id: '1', name: 'Test User', email: 'test@test.com' });
      expect(mockMMKV.getState().setString).toHaveBeenCalledWith('auth_token', 'test-token');
    });

    it('throws error on failed login', async () => {
      mockApi.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        act(async () => {
          await useAuthStore.getState().login('test@test.com', 'wrong');
        })
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('signup', () => {
    it('sets authenticated state on successful signup', async () => {
      mockApi.post.mockResolvedValue({
        token: 'new-token',
        data: { user: { _id: '2', name: 'New User', email: 'new@test.com' } },
      });
      mockMMKV.getState().setString.mockResolvedValue(undefined);

      await act(async () => {
        await useAuthStore.getState().signup('New User', 'new@test.com', 'password');
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('new-token');
    });
  });

  describe('logout', () => {
    it('clears all auth state', async () => {
      useAuthStore.setState({
        user: { _id: '1', name: 'Test' },
        token: 'token',
        subscription: { planName: 'pro' },
        isAuthenticated: true,
      });
      mockMMKV.getState().delete.mockResolvedValue(undefined);

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.subscription).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('sets authenticated when token is valid', async () => {
      mockMMKV.getState().getString.mockReturnValue('valid-token');
      mockApi.get.mockResolvedValue({ data: { user: { _id: '1', name: 'Test' } } });

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual({ _id: '1', name: 'Test' });
    });

    it('clears auth when token is invalid', async () => {
      mockMMKV.getState().getString.mockReturnValue('invalid-token');
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
    });

    it('sets not authenticated when no token', async () => {
      mockMMKV.getState().getString.mockReturnValue(null);

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('updates user profile', async () => {
      useAuthStore.setState({
        user: { _id: '1', name: 'Old Name', email: 'test@test.com' },
        isAuthenticated: true,
      });
      mockApi.patch.mockResolvedValue({ data: { user: { _id: '1', name: 'New Name', email: 'test@test.com' } } });

      await act(async () => {
        await useAuthStore.getState().updateProfile({ name: 'New Name' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('New Name');
    });
  });

  describe('fetchSubscription', () => {
    it('fetches and sets subscription', async () => {
      mockApi.get.mockResolvedValue({ data: { planName: 'pro', status: 'active' } });

      await act(async () => {
        await useAuthStore.getState().fetchSubscription();
      });

      const state = useAuthStore.getState();
      expect(state.subscription).toEqual({ planName: 'pro', status: 'active' });
    });
  });
});