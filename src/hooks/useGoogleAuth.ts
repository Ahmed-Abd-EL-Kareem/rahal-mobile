// src/hooks/useGoogleAuth.ts
import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api, setAuthToken } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

// Direct redirect flow requires a Web OAuth Client ID
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  '11613087660-h9ghoeab8m0c74a2a9kutu7pcvrvj3sq.apps.googleusercontent.com';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useGoogleAuth() {
  const { showToast } = useUIStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'rahal',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
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
    if (isExpoGo) {
      showToast({
        type: 'error',
        message: 'Google Sign-In requires a development build — it is not supported in Expo Go.',
      });
      return;
    }

    try {
      if (promptAsync) {
        await promptAsync();
      } else {
        showToast({ type: 'error', message: 'Google Sign-In is not ready. Please try again.' });
      }
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
