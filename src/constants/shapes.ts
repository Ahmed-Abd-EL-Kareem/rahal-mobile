// src/constants/shapes.ts
export const shapes = {
  // Border radius tokens - Stitch Design System (ROUND_EIGHT base = 8px)
  radius: {
    none: 0,
    sm: 4,        // ROUND_FOUR
    DEFAULT: 8,   // ROUND_EIGHT - base unit
    md: 8,        // ROUND_EIGHT
    lg: 12,       // ROUND_TWELVE
    xl: 16,       // Standard cards
    '2xl': 24,    // Hero sections, modals
    '3xl': 32,    // Large containers
    full: 9999,   // Pills, avatars, buttons
  },
  // Component-specific radius
  components: {
    button: 'full',        // Full pill for primary CTAs
    input: 12,             // ROUND_TWELVE for inputs
    card: 16,              // Standard cards
    'card-image': 16,      // Image containers in cards
    badge: 'full',         // Badges and chips
    modal: 24,             // Modals and bottom sheets
    tooltip: 8,            // Tooltips
    avatar: 'full',        // Circular avatars
    aiBubble: {            // Asymmetric AI chat bubbles
      tl: 32,
      tr: 32,
      bl: 32,
      br: 8,
    },
    aiBubbleUser: {        // User message bubbles
      tl: 32,
      tr: 32,
      bl: 8,
      br: 32,
    },
  },
};