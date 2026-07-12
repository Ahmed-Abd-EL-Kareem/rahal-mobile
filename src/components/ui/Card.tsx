// src/components/ui/Card.tsx
import { View, Text, ViewStyle, Pressable, PressableProps } from 'react-native';
import { forwardRef } from 'react';

interface CardProps extends PressableProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'papyrus';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  style?: any;
}

const variantStyles = {
  default: 'bg-surface-container-low dark:bg-dark-surface-container-low shadow-resting',
  elevated: 'bg-surface-container-low dark:bg-dark-surface-container-low shadow-hover',
  outlined: 'bg-surface-container-low dark:bg-dark-surface-container-low border border-outline-variant dark:border-dark-outline-variant',
  papyrus: 'bg-surface-container-low dark:bg-dark-surface-container-low border-2 border-pharaoh-gold/30 relative shadow-resting',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<View, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', style, ...props }, ref) => (
    <Pressable
      ref={ref}
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      style={style}
      {...props}
      android_ripple={{ color: '#7E570020', borderless: true }}
    >
      {children}
    </Pressable>
  )
);

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`mb-4 ${className}`}>{children}</View>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Text className={`text-headline-md-mobile font-headline text-on-surface dark:text-dark-on-surface ${className}`}>{children}</Text>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Text className={`text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1 ${className}`}>{children}</Text>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={className}>{children}</View>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`mt-4 flex-row items-center justify-end gap-3 ${className}`}>{children}</View>
);

// PapyrusCard - Special heritage-style card with double gold border
export const PapyrusCard = ({ children, className = '', style, ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="papyrus" className={className} style={style} {...props}>
    {children}
  </Card>
);

// ElevatedCard - For hover/tap elevation
export const ElevatedCard = ({ children, className = '', style, ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="elevated" className={className} style={style} {...props}>
    {children}
  </Card>
);

// OutlinedCard - For subtle borders
export const OutlinedCard = ({ children, className = '', style, ...props }: Omit<CardProps, 'variant'>) => (
  <Card variant="outlined" className={className} style={style} {...props}>
    {children}
  </Card>
);