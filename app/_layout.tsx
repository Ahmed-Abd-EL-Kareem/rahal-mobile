// app/_layout.tsx
import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { PostHogProvider } from 'posthog-react-native';
import i18n from '@/i18n';
import { queryClient } from '@/api/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export default function RootLayout() {
  const { checkAuth } = useAuthStore();
  const { setLanguage } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
      // Sync language with i18n
      const lang = i18n.language;
      setLanguage(lang as 'en' | 'ar');
    }, 0);
    
    const handleLangChange = (lng: string) => {
      setLanguage(lng as 'en' | 'ar');
    };

    i18n.on('languageChanged', handleLangChange);
    
    return () => {
      clearTimeout(timer);
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  const postHogContent = (
    <Stack screenOptions={{ headerShown: false }} />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}