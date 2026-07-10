// jest.setup.ts
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children, ...props }: any) => children,
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'success' })),
  closeBrowserAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 30.0444, longitude: 31.2357 } })),
  watchPositionAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: true,
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

jest.mock('react-native-maplibre-gl', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
}));

jest.mock('@stripe/stripe-react-native', () => ({
  initStripe: jest.fn(),
  useStripe: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
  PaymentSheet: () => null,
}));

jest.mock('posthog-react-native', () => ({
  PostHogProvider: ({ children }: any) => children,
  usePostHog: () => ({
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  }),
}));

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component: any) => Component,
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('act(...)') || args[0]?.includes?.('Warning:')) return;
  originalWarn.apply(console, args);
};