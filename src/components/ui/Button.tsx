// src/components/ui/Button.tsx
import React, { forwardRef } from 'react';
import { Pressable, Text, View, ActivityIndicator, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai' | 'tertiary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

import { ViewStyle } from 'react-native';

const variantStyles = {
  primary: 'bg-pharaoh-gold dark:bg-dark-primary',
  secondary: 'bg-nile-blue dark:bg-dark-secondary',
  outline: 'border-2 border-nile-blue dark:border-dark-secondary bg-transparent',
  ghost: 'bg-transparent',
  ai: 'bg-pharaoh-gold dark:bg-dark-primary flex-row items-center gap-2',
  tertiary: 'bg-tertiary-container dark:bg-dark-tertiary-container',
  success: 'bg-papyrus-green dark:bg-dark-success',
};

const variantTextColors = {
  primary: 'text-on-primary dark:text-dark-on-primary',
  secondary: 'text-on-secondary dark:text-dark-on-secondary',
  outline: 'text-nile-blue dark:text-dark-secondary',
  ghost: 'text-on-surface dark:text-dark-on-surface',
  ai: 'text-on-primary dark:text-dark-on-primary',
  tertiary: 'text-on-tertiary-container dark:text-dark-on-tertiary-container',
  success: 'text-on-success dark:text-dark-on-success',
};

const sizeStyles = {
  sm: 'px-4 py-2.5',
  md: 'px-6 py-3.5',
  lg: 'px-8 py-4.5',
};

const sizeTextStyles = {
  sm: 'text-label-sm',
  md: 'text-label-md',
  lg: 'text-label-md',
};

const sizeIconStyles = {
  sm: 18,
  md: 20,
  lg: 22,
};

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled,
      loading,
      className = '',
      style,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const isDisabled = disabled || loading;

    const renderContent = () => {
      if (loading) {
        return (
          <View className="flex-row items-center justify-center gap-2">
            <ActivityIndicator
              size="small"
              color={variant === 'outline' || variant === 'ghost' ? colors['nile-blue'] : colors['on-primary']}
            />
            <Text className={`${variantTextColors[variant]} ${sizeTextStyles[size]} font-medium`}>
              {typeof children === 'string' ? children : 'Loading...'}
            </Text>
          </View>
        );
      }

      const childElements: React.ReactNode[] = [];

      if (leftIcon) {
        childElements.push(
          <Ionicons key="left-icon" name={leftIcon as any} size={sizeIconStyles[size]} color={variant === 'outline' || variant === 'ghost' ? colors['nile-blue'] : colors['on-primary']} />
        );
      }

      if (typeof children === 'string') {
        childElements.push(
          <Text key="text" className={`${variantTextColors[variant]} ${sizeTextStyles[size]} font-medium`}>
            {children}
          </Text>
        );
      } else {
        childElements.push(children);
      }

      if (rightIcon) {
        childElements.push(
          <Ionicons key="right-icon" name={rightIcon as any} size={sizeIconStyles[size]} color={variant === 'outline' || variant === 'ghost' ? colors['nile-blue'] : colors['on-primary']} />
        );
      }

      return <View className="flex-row items-center justify-center gap-2">{childElements}</View>;
    };

    return (
      <Pressable
        ref={ref}
        disabled={isDisabled}
        className={`
          flex-row items-center justify-center rounded-full
          ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50' : 'active:opacity-75 transition-opacity'}
          ${className}
        `}
        style={[
          style,
          {
            shadowColor: variant === 'primary' || variant === 'ai' ? colors['pharaoh-gold'] : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'primary' || variant === 'ai' ? 0.3 : 0,
            shadowRadius: variant === 'primary' || variant === 'ai' ? 12 : 0,
            elevation: variant === 'primary' || variant === 'ai' ? 4 : 0,
          },
        ]}
        android_ripple={{ color: variant === 'outline' || variant === 'ghost' ? colors['nile-blue'] + '33' : colors['on-primary'] + '33' }}
        {...props}
      >
        {renderContent()}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

// Convenience components for common patterns
export const PrimaryButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props}>{children}</Button>
);

export const SecondaryButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props}>{children}</Button>
);

export const OutlineButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props}>{children}</Button>
);

export const GhostButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props}>{children}</Button>
);

export const AIButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ai" leftIcon="sparkles" {...props}>{children}</Button>
);

export const SuccessButton = ({ children, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button variant="success" {...props}>{children}</Button>
);