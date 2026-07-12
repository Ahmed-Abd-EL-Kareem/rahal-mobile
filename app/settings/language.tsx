// app/settings/language.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, Button, Badge } from '@/components/ui';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const currentLang = t('common.locale') || 'en';

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    // This would typically use i18n.changeLanguage(lang)
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* Header */}
          <View className="mb-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Ionicons name="chevron-back" size={28} color={colors.onSurface} />
            </TouchableOpacity>
            <Text className="text-display-lg-mobile font-headline text-on-surface">
              {t('account.preferredLanguage')}
            </Text>
            <Text className="text-body-md text-on-surface-variant mt-1">
              {t('account.regionalSettings')}
            </Text>
          </View>

          {/* Current Language */}
          <Card className="mb-6">
            <CardContent>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                    <Text style={{ fontSize: 28 }}>{LANGUAGES.find(l => l.code === currentLang)?.flag}</Text>
                  </View>
                  <View>
                    <Text className="text-body-lg font-medium text-on-surface">
                      {LANGUAGES.find(l => l.code === currentLang)?.nativeName}
                    </Text>
                    <Text className="text-label-sm text-on-surface-variant">
                      {LANGUAGES.find(l => l.code === currentLang)?.name}
                    </Text>
                  </View>
                </View>
                <Badge variant="gold">{t('common.current')}</Badge>
              </View>
            </CardContent>
          </Card>

          {/* Language Options */}
          <View className="gap-3">
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code as 'en' | 'ar')}
                className="p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-colors"
                style={{
                  backgroundColor: lang.code === currentLang ? colors.primary + '14' : colors.surface,
                  borderColor: lang.code === currentLang ? colors.primary : colors.outlineVariant + '33',
                }}
              >
                <View className="w-12 h-12 rounded-xl flex-items-center justify-center" style={{ backgroundColor: lang.code === currentLang ? '#C8922A33' : (isDark ? '#2D2A26' : '#F0EDE9') }}>
                  <Text style={{ fontSize: 28 }}>{lang.flag}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-body-lg font-medium text-on-surface">{lang.nativeName}</Text>
                  <Text className="text-label-sm text-on-surface-variant">{lang.name}</Text>
                </View>
                {lang.code === currentLang && (
                  <Ionicons name="checkmark-circle" size={28} color="#C8922A" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* RTL Info */}
          <View className="mt-8 p-4 rounded-2xl bg-primary/10 border border-primary/30">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-xl bg-primary/20 flex-items-center justify-center mt-1">
                <Ionicons name="information-circle-outline" size={24} color="#C8922A" />
              </View>
              <View className="flex-1">
                <Text className="text-label-md font-medium text-primary mb-1">RTL Support</Text>
                <Text className="text-body-md text-on-surface-variant">
                  Arabic is a right-to-left (RTL) language. When selected, the entire app layout will mirror to provide the best reading experience.
                </Text>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}