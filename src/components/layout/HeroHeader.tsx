// src/components/layout/HeroHeader.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeroHeaderProps {
  title: string;
  subtitle: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  stats?: Array<{ value: string; label: string }>;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

export const HeroHeader = ({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  stats,
  onPrimaryPress,
  onSecondaryPress,
}: HeroHeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="relative">
      {/* Background Image with Gradient */}
      <View className="absolute inset-0">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20, 16, 15, 0.6)' }} />
      </View>

      {/* Content */}
      <View className="relative px-4 pt-8 pb-6">
        <Text className="text-display-lg-mobile font-headline text-white mb-3">
          {title}
        </Text>
        <Text className="text-body-lg text-white/80 mb-6 max-w-[80%]">
          {subtitle}
        </Text>

        {ctaPrimary && (
          <TouchableOpacity
            onPress={onPrimaryPress || (() => router.push('/trip/generate'))}
            className="bg-primary px-8 py-4 rounded-full shadow-hover items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-on-primary font-medium text-body-md">
              {ctaPrimary}
            </Text>
          </TouchableOpacity>
        )}

        {ctaSecondary && (
          <TouchableOpacity
            onPress={onSecondaryPress}
            className="mt-3 border-2 border-white/30 px-8 py-3 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium text-body-md">
              {ctaSecondary}
            </Text>
          </TouchableOpacity>
        )}

        {stats && stats.length > 0 && (
          <View className="flex-row justify-around mt-10 pt-6 border-t border-white/20">
            {stats.map((stat, i) => (
              <View key={i} className="items-center">
                <Text className="text-headline-md font-headline text-white">{stat.value}</Text>
                <Text className="text-label-sm text-white/70 mt-1">{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};