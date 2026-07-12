// index.ts
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

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
