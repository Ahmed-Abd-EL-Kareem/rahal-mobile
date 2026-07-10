// src/hooks/usePostHog.ts
import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

export function PostHogScreenTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname && posthog) {
      // Track screen view
      posthog.capture('$screen_view', {
        $screen_name: pathname,
        $screen_class: pathname,
      });
    }
  }, [pathname, posthog]);

  return null;
}

export function useAnalytics() {
  const posthog = usePostHog();

  const track = (event: string, properties?: Record<string, any>) => {
    posthog?.capture(event, properties);
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    posthog?.identify(userId, traits);
  };

  const reset = () => {
    posthog?.reset();
  };

  return { track, identify, reset, posthog };
}