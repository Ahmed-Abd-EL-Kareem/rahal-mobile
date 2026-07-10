// src/components/ui/Button.tsx
import React, { forwardRef } from 'react';
import { Pressable, Text, PressableProps, View } from 'react-native';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'border-2 border-nile-blue bg-transparent',
  ghost: 'bg-transparent',
  ai: 'bg-primary flex-row items-center gap-2',
};

const textColors = {
  primary: 'text-on-primary',
  secondary: 'text-on-secondary',
  outline: 'text-nile-blue',
  ghost: 'text-on-surface',
  ai: 'text-on-primary',
};

const sizes = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
};

const textSizes = {
  sm: 'text-label-sm',
  md: 'text-label-md',
  lg: 'text-label-md',
};

export const Button = forwardRef<View, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, disabled, loading, className = '', style, children, ...props }, ref) => {
    const isButtonDisabled = disabled || loading;

    const content = typeof children === 'string' ? (
      <Text className={`${textColors[variant]} ${textSizes[size]} font-medium`}>
        {children}
      </Text>
    ) : (
      children
    );

    return (
      <Pressable
        ref={ref}
        disabled={isButtonDisabled}
        className={`
          flex-row items-center justify-center rounded-full
          ${buttonVariants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}
          ${isButtonDisabled ? 'opacity-50' : 'active:opacity-75'}
          ${className}
        `}
        style={style}
        {...props}
      >
        {content}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';