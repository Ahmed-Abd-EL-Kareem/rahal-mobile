// src/constants/shadows.ts
export const shadows = {
  // Elevation shadows - Stitch Design System
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    // Level 1: Resting cards, default elevation
    resting: {
      shadowColor: 'rgba(80, 69, 54, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 3,
    },
    // Level 2: Hover/focus state, interactive elements
    hover: {
      shadowColor: 'rgba(126, 87, 0, 0.15)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 6,
    },
    // Level 3: Modals, bottom sheets, dropdowns
    raised: {
      shadowColor: 'rgba(20, 16, 8, 0.25)',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 1,
      shadowRadius: 48,
      elevation: 12,
    },
    // Level 4: Toasts, tooltips, popovers
    overlay: {
      shadowColor: 'rgba(20, 16, 8, 0.3)',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 1,
      shadowRadius: 64,
      elevation: 16,
    },
  },
  // Glow effects for AI/premium features
  glow: {
    gold: {
      shadowColor: '#F8BC51',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    goldSubtle: {
      shadowColor: '#C8922A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    nileBlue: {
      shadowColor: '#366286',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  // Inner shadows for pressed states
  inner: {
    pressed: {
      shadowColor: 'rgba(20, 16, 8, 0.1)',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
  },
  // Platform-specific shadow styles for React Native
  ios: {
    resting: {
      shadowColor: '#504536',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    hover: {
      shadowColor: '#7E5700',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 30,
    },
    raised: {
      shadowColor: '#141008',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 48,
    },
  },
  android: {
    resting: { elevation: 3 },
    hover: { elevation: 6 },
    raised: { elevation: 12 },
    overlay: { elevation: 16 },
  },
};

// Helper to get platform-specific shadow
export const getShadow = (level: keyof typeof shadows.elevation, platform: 'ios' | 'android' = 'ios') => {
  const validLevels = ['resting', 'hover', 'raised', 'overlay'] as const;
  const safeLevel = validLevels.includes(level as any) ? level : 'resting';
  
  if (platform === 'android') {
    return shadows.android[safeLevel as keyof typeof shadows.android] || shadows.android.resting;
  }
  return shadows.ios[safeLevel as keyof typeof shadows.ios] || shadows.ios.resting;
};