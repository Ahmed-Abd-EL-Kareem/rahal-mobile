// src/components/ui/Badge.tsx
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type BadgeVariant = 'gold' | 'blue' | 'green' | 'red' | 'sparkle' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  icon?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  gold: {
    container: 'bg-pharaoh-gold/10 border border-pharaoh-gold/30',
    text: 'text-pharaoh-gold',
  },
  blue: {
    container: 'bg-nile-blue/10 border border-nile-blue/30',
    text: 'text-nile-blue',
  },
  green: {
    container: 'bg-papyrus-green/10 border border-papyrus-green/30',
    text: 'text-papyrus-green',
  },
  red: {
    container: 'bg-error/10 border border-error/30',
    text: 'text-error',
  },
  sparkle: {
    container: 'bg-pharaoh-gold/10 border border-pharaoh-gold/30 flex-row items-center gap-1',
    text: 'text-pharaoh-gold',
  },
  default: {
    container: 'bg-surface-container-high dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant',
    text: 'text-on-surface-variant dark:text-dark-on-surface-variant',
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: TextStyle; iconSize: number }> = {
  sm: {
    container: 'px-2.5 py-0.5 rounded-full',
    text: { fontSize: 10, lineHeight: 14, fontWeight: '600' as TextStyle['fontWeight'], letterSpacing: 0.5 },
    iconSize: 10,
  },
  md: {
    container: 'px-3 py-1 rounded-full',
    text: { fontSize: 12, lineHeight: 16, fontWeight: '600' as TextStyle['fontWeight'], letterSpacing: 0.6 },
    iconSize: 12,
  },
  lg: {
    container: 'px-4 py-1.5 rounded-full',
    text: { fontSize: 14, lineHeight: 20, fontWeight: '500' as TextStyle['fontWeight'], letterSpacing: 0.7 },
    iconSize: 14,
  },
};

export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style,
  icon,
}: BadgeProps) => {
  const { container: variantContainer, text: variantText } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText, iconSize } = sizeStyles[size];

  return (
    <View
      className={`flex-row items-center ${variantContainer} ${sizeContainer} ${className}`}
      style={style}
    >
      {(variant === 'sparkle' || icon) && (
        <Ionicons
          name={variant === 'sparkle' ? 'sparkles' : (icon as any)}
          size={iconSize}
          color={variant === 'sparkle' ? '#C8922A' : undefined}
        />
      )}
      <Text
        className={`${variantText}`}
        style={sizeText}
      >
        {children}
      </Text>
    </View>
  );
};

// SparkleBadge - Special AI/premium badge with gold sparkle icon
export const SparkleBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="sparkle" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// GoldBadge - Premium/featured badge
export const GoldBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="gold" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// BlueBadge - Info/secondary badge
export const BlueBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="blue" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// GreenBadge - Success/confirmed badge
export const GreenBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="green" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// RedBadge - Error/critical badge
export const RedBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="red" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// OutlineBadge - Border only badge
export const OutlineBadge = ({
  size = 'md',
  children,
  className = '',
  style,
}: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="default" size={size} className={className} style={style}>
    {children}
  </Badge>
);

// StatusBadge - Status indicator badge
export const StatusBadge = ({
  status,
  size = 'md',
  className = ''
}: { status: 'active' | 'pending' | 'completed' | 'cancelled' | 'upcoming'; size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const variantMap = {
    active: 'blue',
    pending: 'gold',
    completed: 'green',
    cancelled: 'red',
    upcoming: 'sparkle',
  };

  const labelMap = {
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    upcoming: 'Upcoming',
  };

  return <Badge variant={variantMap[status] as BadgeVariant} size={size} className={className}>{labelMap[status]}</Badge>;
};