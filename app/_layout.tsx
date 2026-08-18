// app/_layout.tsx
import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { PostHogProvider } from 'posthog-react-native';
import i18n from '@/i18n';
import { queryClient } from '@/api/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { setAuthStoreRef } from '@/api/client';
import { hydrationPromise } from '@/store/mmkvStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Prevent splash screen from auto-hiding before asset/auth loading is complete
SplashScreen.preventAutoHideAsync().catch(() => {});

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export default function RootLayout() {
  const { checkAuth } = useAuthStore();
  const { setLanguage } = useUIStore();

  useEffect(() => {
    // Wire up auth store ref for 401 response handling
    setAuthStoreRef(useAuthStore);

    const initApp = async () => {
      try {
        await hydrationPromise;
        await checkAuth();
        // Sync language with i18n
        const lang = i18n.language;
        setLanguage(lang as 'en' | 'ar');
      } catch (err) {
        console.error('App initialization error:', err);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    initApp();
    
    const handleLangChange = (lng: string) => {
      setLanguage(lng as 'en' | 'ar');
    };

    i18n.on('languageChanged', handleLangChange);
    
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  const postHogContent = (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }} 
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            {posthogKey ? (
              <PostHogProvider
                apiKey={posthogKey}
                options={{
                  host: posthogHost,
                  flushAt: 10,
                  flushInterval: 30000,
                }}
                autocapture={{
                  captureTouches: false,
                }}
              >
                {postHogContent}
              </PostHogProvider>
            ) : (
              postHogContent
            )}
          </I18nextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}