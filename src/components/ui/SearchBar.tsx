// src/components/ui/SearchBar.tsx
import { TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  onSubmit?: () => void;
  className?: string;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ placeholder = 'Search...', onChangeText, value, onSubmit, className = '', ...props }, ref) => {
    const { t } = useTranslation();
    
    return (
      <View className={`relative ${className}`}>
        <View className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <Ionicons name="search-outline" size={24} />
        </View>
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          className={`
            w-full pl-12 pr-4 py-3.5 rounded-xl
            bg-surface-container
            text-on-surface placeholder-text-on-surface-variant
            border border-outline-variant
            focus:border-nile-blue focus:ring-2 focus:ring-primary/20
            transition-colors
          `}
          {...props}
        />
      </View>
    );
  }
);

SearchBar.displayName = 'SearchBar';