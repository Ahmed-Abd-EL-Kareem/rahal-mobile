// src/components/ui/SearchBar.tsx
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  className?: string;
  style?: any;
  autoFocus?: boolean;
  editable?: boolean;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      placeholder = 'Search...',
      onChangeText,
      value,
      onSubmit,
      onClear,
      leftIcon = 'search-outline',
      rightIcon,
      onRightIconPress,
      className = '',
      style,
      autoFocus = false,
      editable = true,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();
    const showClear = onClear && value && value.length > 0;

    return (
      <View style={style} className={`relative ${className}`}>
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Ionicons name={leftIcon as any} size={24} color={colors['on-surface-variant']} />
        </View>
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          editable={editable}
          placeholderTextColor={colors['on-surface-variant'] + '90'}
          className={`
            w-full pl-12 pr-12 py-3.5 rounded-xl
            bg-surface-container dark:bg-dark-surface-container
            text-on-surface dark:text-dark-on-surface
            border border-outline-variant dark:border-dark-outline-variant
            focus:border-nile-blue dark:focus:border-dark-secondary focus:ring-2 focus:ring-primary/20
            transition-colors duration-200
            ${!editable ? 'opacity-70' : ''}
          `}
          {...props}
        />
        {showClear && (
          <TouchableOpacity
            onPress={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={22} color="#827564" />
          </TouchableOpacity>
        )}
        {rightIcon && !showClear && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={rightIcon as any} size={24} color="#C8922A" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';