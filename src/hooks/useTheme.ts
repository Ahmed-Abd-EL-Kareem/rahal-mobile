// src/hooks/useTheme.ts
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
import { useUIStore } from '@/store/uiStore';

export function useTheme() {
  const { colorScheme: nativeWindScheme } = useColorScheme();
  const { isRTL } = useUIStore();
  
  const colorScheme: 'light' | 'dark' = nativeWindScheme === 'dark' ? 'dark' : 'light';
  const themeColors = colors[colorScheme];

  return {
    colors: themeColors,
    isDark: colorScheme === 'dark',
    isRTL,
    colorScheme,
  };
}