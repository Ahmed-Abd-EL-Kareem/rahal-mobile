// src/hooks/useGoogleAuth.ts
import { useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api, setAuthToken } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (!WEB_CLIENT_ID) {
  console.warn('[useGoogleAuth] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID environment variable.');
}
if (!ANDROID_CLIENT_ID) {
  console.warn('[useGoogleAuth] Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID environment variable.');
}
if (!IOS_CLIENT_ID) {
  console.warn('[useGoogleAuth] Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID environment variable.');
}

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure Google Sign-In on module load if client ID is available and not in Expo Go
if (!isExpoGo && WEB_CLIENT_ID) {
  try {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  } catch (err) {
    console.error('[useGoogleAuth] Failed to configure GoogleSignin:', err);
  }
}

export function useGoogleAuth() {
  const { showToast } = useUIStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!isExpoGo && WEB_CLIENT_ID) {
      try {
        GoogleSignin.configure({
          webClientId: WEB_CLIENT_ID,
          iosClientId: IOS_CLIENT_ID,
          scopes: ['profile', 'email'],
        });
      } catch (err) {
        console.error('[useGoogleAuth] Failed to configure GoogleSignin in useEffect:', err);
      }
    }
  }, []);

  const handlePromptAsync = async () => {
    if (isExpoGo) {
      showToast({
        type: 'error',
        message: 'Google Sign-In requires a development build — it is not supported in Expo Go.',
      });
      return;
    }

    if (!WEB_CLIENT_ID) {
      showToast({
        type: 'error',
        message: 'Google Web Client ID is missing. Please check your environment variables.',
      });
      return;
    }

    try {
      setIsAuthenticating(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      
      const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      const res = await api.post('auth/google/mobile', { json: { idToken } })
        .json<{ token: string; data: { user: any }; message?: string }>();

      await setAuthToken(res.token);
      useAuthStore.getState().setUser(res.data.user);
      useAuthStore.setState({ token: res.token, isAuthenticated: true, isLoading: false });
      await useAuthStore.getState().fetchSubscription();
      showToast({ type: 'success', message: res.message || 'Google sign-in successful' });
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in flow - no toast needed
      } else if (err.code === statusCodes.IN_PROGRESS) {
        // Operation already in progress
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast({
          type: 'error',
          message: 'Google Play Services is not available or outdated on this device.',
        });
      } else {
        const msg = err.response?.data?.message || err.message || 'Google Sign-In failed';
        showToast({ type: 'error', message: msg });
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    promptAsync: handlePromptAsync,
    request: true,
    isAuthenticating,
  };
}
