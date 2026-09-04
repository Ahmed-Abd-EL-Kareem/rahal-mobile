// src/hooks/useGoogleAuth.ts
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { api, setAuthToken, extractApiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { router } from 'expo-router';

// Safely obtain native GoogleSignin module if available in binary (e.g. dev build or standalone)
let GoogleSignin: any = null;
let statusCodes: any = {};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const googleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleModule?.GoogleSignin || null;
  statusCodes = googleModule?.statusCodes || {};
} catch (e) {
  // Native module is not present in Expo Go
  GoogleSignin = null;
  statusCodes = {};
}

const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '11613087660-pp7ojl5ra83k8pt3v2b4cuqil72dkuv7.apps.googleusercontent.com';
const ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  '11613087660-pp7ojl5ra83k8pt3v2b4cuqil72dkuv7.apps.googleusercontent.com';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const configureGoogleSignin = () => {
  if (!isExpoGo && GoogleSignin && WEB_CLIENT_ID) {
    try {
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
    } catch (err) {
      console.error('[useGoogleAuth] Failed to configure GoogleSignin:', err);
    }
  }
};

// Configure immediately on module load
configureGoogleSignin();

export function useGoogleAuth() {
  const { showToast } = useUIStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    configureGoogleSignin();
  }, []);

  const handlePromptAsync = async () => {
    if (isExpoGo || !GoogleSignin) {
      const msg =
        'Google Sign-In requires a development build or preview APK — it is not supported in Expo Go.';
      Alert.alert('Google Sign-In', msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    if (!WEB_CLIENT_ID) {
      const msg = 'Google Web Client ID is missing. Please check your configuration.';
      Alert.alert('Google Sign-In', msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    try {
      setIsAuthenticating(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      console.log('[useGoogleAuth] signInResult:', JSON.stringify(signInResult));

      if (signInResult.type === 'cancelled') {
        return;
      }

      let idToken = signInResult.data?.idToken || (signInResult as any).idToken;

      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens?.idToken;
          console.log('[useGoogleAuth] getTokens retrieved idToken:', !!idToken);
        } catch (tokErr) {
          console.warn('[useGoogleAuth] getTokens error:', tokErr);
        }
      }

      if (!idToken) {
        throw new Error(
          'No ID token received from Google Sign-In. Please check your Google Play Services account.'
        );
      }

      const res = await api
        .post('auth/google/mobile', { json: { idToken } })
        .json<{ token: string; data: { user: any }; message?: string }>();

      if (!res.token || !res.data?.user) {
        throw new Error('Invalid response received from authentication server.');
      }

      await setAuthToken(res.token);
      useAuthStore.getState().setUser(res.data.user);
      useAuthStore.setState({ token: res.token, isAuthenticated: true, isLoading: false });

      try {
        await useAuthStore.getState().fetchSubscription();
      } catch (subErr) {
        console.warn('[useGoogleAuth] fetchSubscription note:', subErr);
      }

      showToast({ type: 'success', message: res.message || 'Google sign-in successful' });
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('[useGoogleAuth] Sign-in error:', err);
      if (
        err.code === statusCodes.SIGN_IN_CANCELLED ||
        err.code === 'SIGN_IN_CANCELLED' ||
        err.message?.includes('cancelled')
      ) {
        // User cancelled
        return;
      } else if (err.code === statusCodes.IN_PROGRESS || err.code === 'IN_PROGRESS') {
        return;
      } else if (
        err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE ||
        err.code === 'PLAY_SERVICES_NOT_AVAILABLE'
      ) {
        const msg = 'Google Play Services is not available or outdated on this device.';
        Alert.alert('Google Sign-In', msg);
        showToast({ type: 'error', message: msg });
      } else {
        const msg = await extractApiErrorMessage(
          err,
          err.message || 'Google Sign-In failed. Please try again.'
        );
        Alert.alert('Google Sign-In', msg);
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
