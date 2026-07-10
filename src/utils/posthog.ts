// src/utils/posthog.ts
import posthog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    captureApplicationLifecycleEvents: true,
    flushAt: 10,
    flushInterval: 30000,
    // Disable autocapture for React Native (can cause issues)
    autocapture: false,
  });
}

export default posthog;