// app/index.tsx
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)');
      }
    }
  }, [isLoading, isAuthenticated]);

  return null;
}