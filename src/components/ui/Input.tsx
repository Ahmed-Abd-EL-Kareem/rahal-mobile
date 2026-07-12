// src/components/ui/Input.tsx
import { TextInput, View, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { forwardRef, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRTL } from '@/hooks/useRTL';
import { useTheme } from '@/hooks/useTheme';

export interface InputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad' | 'number-pad';
  textContentType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCompleteType?: string;
  maxLength?: number;
  rightIcon?: string;
  onRightIconPress?: () => void;
  leftIcon?: string;
  className?: string;
  containerClassName?: string;
  testID?: string;
  style?: any; // Allow passing style to TextInput
}

export const Input = forwardRef<TextInput, InputProps>(
  ({
    label,
    value = '',
    onChangeText,
    onBlur,
    onFocus,
    placeholder,
    error,
    helperText,
    disabled = false,
    required = false,
    secureTextEntry = false,
    keyboardType = 'default',
    textContentType,
    autoCapitalize = 'none',
    autoCompleteType,
    maxLength,
    rightIcon,
    onRightIconPress,
    leftIcon,
    className = '',
    containerClassName = '',
    testID,
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const isRTL = useRTL();
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isError = !!error;
    const borderColor = isError
      ? colors.tertiary
      : focused
      ? colors['nile-blue']
      : colors['outline-variant'];
    const borderWidth = focused || isError ? 2 : 1;
    const bgColor = disabled ? colors['surface-container-high'] : colors['surface-container-low'];

    const handleFocus = () => {
      setFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setFocused(false);
      onBlur?.();
    };

    const handleRightIconPress = () => {
      if (rightIcon === 'eye-outline' || rightIcon === 'eye-off-outline') {
        setShowPassword(!showPassword);
      }
      onRightIconPress?.();
    };

    const renderLeftIcon = () => {
      if (!leftIcon) return null;
      return (
        <View className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
          <Ionicons name={leftIcon as any} size={24} color={focused ? colors['nile-blue'] : colors['on-surface-variant']} />
        </View>
      );
    };

    const renderRightIcon = () => {
      if (!rightIcon) return null;
      const iconName = (rightIcon === 'eye-outline' || rightIcon === 'eye-off-outline') && secureTextEntry
        ? showPassword
          ? 'eye-off-outline'
          : 'eye-outline'
        : rightIcon;
      return (
        <TouchableOpacity
          onPress={handleRightIconPress}
          className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} z-10 p-2`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={iconName as any} size={24} color={colors['on-surface-variant']} />
        </TouchableOpacity>
      );
    };

    const leftPadding = leftIcon ? 44 : 16;
    const rightPadding = rightIcon ? 44 : 16;

    return (
      <View className={`w-full ${containerClassName}`} testID={testID ? `${testID}-container` : undefined}>
        {label && (
          <View className={`flex-row items-center gap-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text
              className={`text-label-md ${isError ? 'text-tertiary dark:text-dark-tertiary' : 'text-on-surface dark:text-dark-on-surface'}`}
            >
              {label}
              {required && <Text className="text-tertiary dark:text-dark-tertiary">*</Text>}
            </Text>
          </View>
        )}
        <View
          className="relative"
          style={{
            backgroundColor: bgColor,
            borderWidth,
            borderColor,
            borderRadius: 12,
            transitionDuration: 200,
          }}
        >
          {renderLeftIcon()}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors['on-surface-variant']}
            // @ts-ignore - disabled is supported in RN 0.86 but types may be outdated
            disabled={disabled}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            autoCompleteType={autoCompleteType}
            maxLength={maxLength}
            className={`w-full px-4 py-3.5 text-body-md text-on-surface dark:text-dark-on-surface placeholder-text-on-surface-variant ${isRTL ? 'text-end pr-12 pl-4' : 'pl-12 pr-4'} ${className}`}
            style={[
              { paddingLeft: leftIcon ? 44 : 16, paddingRight: rightIcon ? 44 : 16 },
            ]}
            {...props}
          />
          {renderRightIcon()}
          {focused && !isError && (
            <View
              className="absolute inset-0"
              style={{
                borderWidth: 2,
                borderColor: colors['primary'] + '33', // 20% opacity
                borderRadius: 12,
                pointerEvents: 'none',
              }}
            />
          )}
        </View>
        {(error || helperText) && (
          <Text
            className={`text-label-sm mt-2 ${isRTL ? 'text-end' : 'text-start'} ${isError ? 'text-tertiary dark:text-dark-tertiary' : 'text-on-surface-variant dark:text-dark-on-surface-variant'}`}
            testID={testID ? `${testID}-message` : undefined}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';