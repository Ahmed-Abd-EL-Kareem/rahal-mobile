// index.ts
import { AppRegistry } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Register Stripe headless JS task to prevent 'No task registered for key StripeKeepJsAwakeTask' warnings on Android
AppRegistry.registerHeadlessTask('StripeKeepJsAwakeTask', () => async () => {});

// Disable Reanimated strict mode warnings
try {
  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
  });
} catch (e) {
  console.warn('Failed to configure ReanimatedLogger:', e);
}

import 'expo-router/entry';
