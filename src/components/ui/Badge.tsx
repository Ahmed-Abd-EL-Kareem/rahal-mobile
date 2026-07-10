// src/components/ui/Badge.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';

export interface BadgeProps extends TextProps {
  variant?: 'default' | 'gold' | 'green' | 'blue' | 'red' | 'sparkle';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-outline-variant text-on-surface-variant',
  gold: 'bg-primary-container text-on-primary-container',
  green: 'bg-success-container text-on-success-container',
  blue: 'bg-secondary-container text-on-secondary-container',
  red: 'bg-error-container text-on-error-container',
  sparkle: 'bg-primary/10 text-primary border border-primary/30 flex-row items-center gap-1',
};

const sizes = {
  sm: 'px-2 py-0.5 text-label-sm',
  md: 'px-3 py-1 text-label-md',
  lg: 'px-4 py-1.5 text-label-md',
};

export const Badge = ({ variant = 'default', size = 'md', className = '', children, ...props }: BadgeProps) => {
  return (
    <Text
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </Text>
  );
};

Badge.displayName = 'Badge';

export const SparkleBadge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <Badge variant="sparkle" className={className}>
    <Text style={{ fontSize: 10 }}>✨</Text>
    {children}
  </Badge>
);