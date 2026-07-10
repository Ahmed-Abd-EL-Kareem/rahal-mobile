// src/types/navigation.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(tabs)': undefined;
  'hotel/[id]': { id: string };
  'destination/[slug]': { slug: string };
  'booking/[id]': { id: string };
  'booking/flow': undefined;
  'trip/[id]': { id: string };
  'trip/generate': undefined;
  'subscription/plans': undefined;
  'favorites': undefined;
  'settings/account': undefined;
  'settings/profile': undefined;
  'settings/language': undefined;
  'settings/notifications': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
  'verify-otp': { email: string };
  'reset-password': { email: string };
};

export type OnboardingStackParamList = {
  index: undefined;
};

export type TabsParamList = {
  index: undefined;        // Home
  explore: undefined;      // Explore Destinations
  ai: undefined;           // AI Concierge Chat
  trips: undefined;        // My Trips & Bookings
  profile: undefined;      // Profile & Settings
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, Screen>;

export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, Screen>;

export type TabsScreenProps<Screen extends keyof TabsParamList> = 
  BottomTabScreenProps<TabsParamList, Screen>;