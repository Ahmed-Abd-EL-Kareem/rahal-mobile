// src/hooks/useGoogleAuth.ts
import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { api, setAuthToken } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { showToast } = useUIStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (!idToken) return;

      setIsAuthenticating(true);
      api.post('auth/google/mobile', { json: { idToken } })
        .json<{ token: string; data: { user: any }; message?: string }>()
        .then(async (res) => {
          await setAuthToken(res.token);
          useAuthStore.getState().setUser(res.data.user);
          useAuthStore.setState({ token: res.token, isAuthenticated: true, isLoading: false });
          await useAuthStore.getState().fetchSubscription();
          showToast({ type: 'success', message: res.message || 'Google sign-in successful' });
          router.replace('/(tabs)');
        })
        .catch((err: any) => {
          const msg = err.response?.data?.message || err.message || 'Google Sign-In failed';
          showToast({ type: 'error', message: msg });
        })
        .finally(() => {
          setIsAuthenticating(false);
        });
    } else if (response?.type === 'error') {
      showToast({ type: 'error', message: response.error?.message || 'Google Sign-In was cancelled or failed' });
    }
  }, [response]);

  const handlePromptAsync = async () => {
    try {
      if (!request) {
        showToast({ type: 'error', message: 'Google Auth is initializing. Please try again.' });
        return;
      }
      await promptAsync();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Failed to launch Google Sign-In' });
    }
  };

  return {
    promptAsync: handlePromptAsync,
    request,
    isAuthenticating,
  };
}
