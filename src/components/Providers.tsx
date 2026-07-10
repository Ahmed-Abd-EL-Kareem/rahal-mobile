// src/components/Providers.tsx
import 'react-native-gesture-handler';
import { ReactNode, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { PostHogProvider } from 'posthog-react-native';
import { PostHogScreenTracker } from '@/hooks/usePostHog';
import i18n from '@/i18n';
import posthog from '@/utils/posthog';
import { queryClient } from '@/api/queryClient';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAISessionStore } from '@/store/aiSessionStore';
import { usePostHog } from 'posthog-react-native';

export function Providers({ children }: { children: ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const setLanguage = useUIStore((s) => s.setLanguage);
  
  useEffect(() => {
    checkAuth();
    // Set initial language from i18n
    setLanguage(i18n.language as 'en' | 'ar');
  }, [checkAuth, setLanguage]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <PostHogProvider client={posthog}>
          {children}
          <PostHogScreenTracker />
        </PostHogProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}