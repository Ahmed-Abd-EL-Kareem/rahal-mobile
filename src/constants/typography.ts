// src/constants/typography.ts
export const typography = {
  fonts: {
    // English
    headline: 'PlayfairDisplay_700Bold',
    'headline-medium': 'PlayfairDisplay_600SemiBold',
    body: 'Inter_400Regular',
    'body-medium': 'Inter_500Medium',
    label: 'Inter_500Medium',
    'label-bold': 'Inter_600SemiBold',
    // Arabic
    'headline-ar': 'NotoNaskhArabic_700Bold',
    'body-ar': 'Cairo_400Regular',
    'label-ar': 'Cairo_600SemiBold',
  },
  sizes: {
    'display-lg': 48,
    'display-lg-mobile': 36,
    'headline-md': 32,
    'headline-md-mobile': 24,
    'body-lg': 18,
    'body-md': 16,
    'label-md': 14,
    'label-sm': 12,
  },
  lineHeights: {
    'display-lg': 56,
    'display-lg-mobile': 44,
    'headline-md': 40,
    'headline-md-mobile': 32,
    'body-lg': 28,
    'body-md': 24,
    'label-md': 20,
    'label-sm': 16,
  },
  letterSpacing: {
    display: '-0.02em',
    label: '0.05em',
  },
  // Semantic typography styles for easy usage
  styles: {
    // Display styles
    displayLarge: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 48,
      lineHeight: 56,
      letterSpacing: -0.96,
    },
    displayLargeMobile: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: -0.72,
    },
    // Headline styles
    headlineMedium: {
      fontFamily: 'PlayfairDisplay_600SemiBold',
      fontSize: 32,
      lineHeight: 40,
    },
    headlineMediumMobile: {
      fontFamily: 'PlayfairDisplay_600SemiBold',
      fontSize: 24,
      lineHeight: 32,
    },
    // Body styles
    bodyLarge: {
      fontFamily: 'Inter_400Regular',
      fontSize: 18,
      lineHeight: 28,
    },
    bodyMedium: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    // Label styles
    labelMedium: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.7,
    },
    labelSmall: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.6,
    },
    // Arabic variants
    displayLargeAR: {
      fontFamily: 'NotoNaskhArabic_700Bold',
      fontSize: 48,
      lineHeight: 56,
    },
    headlineMediumAR: {
      fontFamily: 'NotoNaskhArabic_700Bold',
      fontSize: 32,
      lineHeight: 40,
    },
    bodyLargeAR: {
      fontFamily: 'Cairo_400Regular',
      fontSize: 18,
      lineHeight: 28,
    },
    bodyMediumAR: {
      fontFamily: 'Cairo_400Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    labelMediumAR: {
      fontFamily: 'Cairo_600SemiBold',
      fontSize: 14,
      lineHeight: 20,
    },
    labelSmallAR: {
      fontFamily: 'Cairo_600SemiBold',
      fontSize: 12,
      lineHeight: 16,
    },
  },
};