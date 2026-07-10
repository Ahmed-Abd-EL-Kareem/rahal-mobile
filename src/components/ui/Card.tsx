import { View, Text, ViewStyle, Pressable, PressableProps } from 'react-native';
import { forwardRef } from 'react';

interface CardProps extends PressableProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'papyrus';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-surface shadow-resting',
  elevated: 'bg-surface shadow-hover',
  outlined: 'bg-surface border border-outline-variant',
  papyrus: 'bg-surface border-2 border-pharaoh-gold/30 relative',
};

const paddings = {
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
        ${variants[variant]} ${paddings[padding]}
        ${className}
      `}
      style={style}
      {...props}
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
  <Text className={`text-headline-md-mobile font-headline text-on-surface ${className}`}>{children}</Text>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Text className={`text-body-md text-on-surface-variant mt-1 ${className}`}>{children}</Text>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={className}>{children}</View>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <View className={`mt-4 flex-row items-center justify-end gap-3 ${className}`}>{children}</View>
);