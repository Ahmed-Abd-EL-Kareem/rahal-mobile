// src/hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { colors } from '@/constants/colors';
import { useUIStore } from '@/store/uiStore';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { isRTL } = useUIStore();
  
  const colorScheme = isRTL ? 'dark' : (systemColorScheme || 'light');
  const themeColors = colors[colorScheme];

  return {
    colors: themeColors,
    isDark: colorScheme === 'dark',
    isRTL,
    colorScheme,
  };
}