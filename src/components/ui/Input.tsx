// src/components/ui/Input.tsx
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { forwardRef } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', style, ...props }, ref) => {
    const hasError = !!error;
    return (
      <>
        {label && (
          <Text className="text-label-md text-on-surface mb-1.5 block">
            {label}
          </Text>
        )}
        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {leftIcon}
            </View>
          )}
          <TextInput
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-surface-container
              text-on-surface placeholder-text-on-surface-variant
              border border-outline-variant
              focus:border-nile-blue focus:ring-2 focus:ring-primary/20
              ${hasError ? 'border-error focus:border-error focus:ring-error/20' : ''}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            style={style}
            {...props}
          />
          {rightIcon && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {rightIcon}
            </View>
          )}
        </View>
        {hasError && (
          <Text className="text-label-sm text-error mt-1.5" role="alert">
            {error}
          </Text>
        )}
        {helperText && !hasError && (
          <Text className="text-label-sm text-on-surface-variant mt-1.5">
            {helperText}
          </Text>
        )}
      </>
    );
  }
);

Input.displayName = 'Input';