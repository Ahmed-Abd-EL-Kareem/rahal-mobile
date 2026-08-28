// app/trip/generate.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '@/components/ui';
import { useGenerateTrip } from '@/api/hooks/useTrips';
import { useTheme } from '@/hooks/useTheme';
import { extractApiErrorMessage } from '@/api/client';

const INTERESTS = [
  { key: 'history', label: 'Historical Sites', icon: 'library-outline' },
  { key: 'beach', label: 'Beaches', icon: 'water-outline' },
  { key: 'adventure', label: 'Adventure', icon: 'flash-outline' },
  { key: 'cultural', label: 'Culture', icon: 'musical-notes-outline' },
  { key: 'food', label: 'Food & Dining', icon: 'restaurant-outline' },
  { key: 'nature', label: 'Nature', icon: 'leaf-outline' },
  { key: 'shopping', label: 'Shopping', icon: 'bag-outline' },
  { key: 'wellness', label: 'Wellness', icon: 'fitness-outline' },
];

const BUDGET_OPTIONS = [
  { key: 'budget', labelKey: 'tripGenerate.budgetTiers.budget.label', descKey: 'tripGenerate.budgetTiers.budget.desc', icon: 'cash-outline' },
  { key: 'mid-range', labelKey: 'tripGenerate.budgetTiers.midRange.label', descKey: 'tripGenerate.budgetTiers.midRange.desc', icon: 'diamond-outline' },
  { key: 'luxury', labelKey: 'tripGenerate.budgetTiers.luxury.label', descKey: 'tripGenerate.budgetTiers.luxury.desc', icon: 'ribbon-outline' },
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14];

export default function TripGenerateScreen() {
  const { t, i18n } = useTranslation();
  const { mutateAsync: generateTrip, isPending } = useGenerateTrip();
  const { colors, isDark } = useTheme();

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [budget, setBudget] = useState('mid-range');
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!destination.trim()) {
      Alert.alert(t('tripGenerate.errors.errorTitle'), t('tripGenerate.errors.destination'));
      return;
    }
    if (interests.length === 0) {
      Alert.alert(t('tripGenerate.errors.errorTitle'), t('tripGenerate.errors.interests'));
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateTrip({
        destination: destination.trim(),
        duration,
        budget: budget as any,
        travelers,
        interests,
        language: i18n.language === 'ar' ? 'ar' : 'en',
      });
      router.push(`/trip/${response.data.trip._id}`);
    } catch (error: any) {
      const message = await extractApiErrorMessage(error, t('tripGenerate.errors.failed'));
      Alert.alert(t('tripGenerate.errors.errorTitle'), message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) 
      ? prev.filter(i => i !== interest) 
      : [...prev, interest]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      {/* Top Header */}
      <View 
        className="flex-row items-center px-4 h-16 border-b shadow-sm z-50"
        style={{ backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant + '33' }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#C8922A" />
        </TouchableOpacity>
        <Text className="font-headline text-2xl text-pharaoh-gold font-bold">{t('tripGenerate.title')}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full gap-6">
          
          {/* Hero Header Section */}
          <View className="mb-4 flex-col items-start gap-4">
            <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed/30 border border-pharaoh-gold/20">
              <Ionicons name="sparkles" size={14} color="#C8922A" />
              <Text className="font-label-sm text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                {t('tripGenerate.aiTravelArchitect')}
              </Text>
            </View>
            <View>
              <Text className="font-headline text-3xl text-pharaoh-gold mb-2 leading-tight">
                {t('tripGenerate.heroTitle')}
              </Text>
              <Text className="text-body-md text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                {t('tripGenerate.heroSubtitle')}
              </Text>
            </View>
          </View>

          {/* Current Focus Bento Card */}
          <View className="rounded-2xl overflow-hidden h-48 relative border-2 border-outline-variant/30 p-[2px] mb-2 shadow-sm">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiZdUPUIthd6E8o8YT_SYbn5Q_F1mGAoNVauzLIUTcGNItv3c5gui2awnS5ihvD4Q0VfBpY19tVvXJ1lVazpzaAMFWrqF93Qft5x_iwwcTdA6qz7g-NUmZULx7CFvimPdoyCGsJDmntOxL0JiYWEbxq6KHQv7jOnXjj1hnrbh6W61DGYQavO8-jGg-el04RVZwEBnXatwEXkUGj0gmSZrH9j3T56Zju0rPUw2duZaWbiRMGxZPyBKp3cH_Cbho6FRUobcCmamdgNg' }} 
              className="w-full h-full absolute inset-0 rounded-2xl"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/50" />
            <View className="absolute bottom-4 left-4 right-4 flex-col">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="location-outline" size={14} color="#C8922A" />
                <Text className="text-xs text-pharaoh-gold font-bold uppercase tracking-wide">{t('tripGenerate.currentFocus')}</Text>
              </View>
              <Text className="font-headline text-xl text-white font-bold">{t('tripGenerate.luxorEgypt')}</Text>
              <Text className="text-[11px] text-white/80 font-medium mt-0.5">{t('tripGenerate.luxorSubtitle')}</Text>
            </View>
          </View>

          {/* Destination Form Section */}
          <View className="flex-col">
            <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mb-2">{t('tripGenerate.whereToTravel')}</Text>
            <View 
              className="relative flex-row items-center border rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
            >
              <Ionicons name="compass-outline" size={20} color="#817565" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-body-md"
                style={{ color: colors.onSurface }}
                placeholder={t('tripGenerate.destinationPlaceholder')}
                placeholderTextColor={isDark ? '#9C8F7C' : '#81756580'}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          {/* Duration Section */}
          <View className="flex-col">
            <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mb-2">{t('tripGenerate.howManyDays')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {DURATION_OPTIONS.map((days) => {
                const isActive = duration === days;
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setDuration(days)}
                    className="px-5 py-2.5 rounded-full border"
                    style={{
                      backgroundColor: isActive ? colors.primary : colors.surfaceContainerLow,
                      borderColor: isActive ? colors.primary : colors.outlineVariant + '33',
                    }}
                  >
                    <Text className={`font-semibold text-xs ${isActive ? 'text-white' : 'text-on-surface-variant dark:text-dark-on-surface-variant'}`}>
                      {days} {days === 1 ? t('tripGenerate.day') : t('tripGenerate.days')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Budget Section */}
          <View className="flex-col">
            <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mb-2.5">{t('tripGenerate.chooseBudget')}</Text>
            <View className="flex-col gap-3">
              {BUDGET_OPTIONS.map((b) => {
                const isActive = budget === b.key;
                return (
                  <TouchableOpacity
                    key={b.key}
                    onPress={() => setBudget(b.key)}
                    className="p-4 rounded-xl border flex-row items-center gap-4"
                    style={isActive
                      ? { backgroundColor: colors.primary + '14', borderColor: colors.primary }
                      : { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }
                    }
                  >
                    <View className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(95,65,0,0.1)' }}>
                      <Ionicons name={b.icon as any} size={20} color="#C8922A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-on-surface dark:text-dark-on-surface font-semibold text-body-md">{t(b.labelKey)}</Text>
                      <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-xs mt-0.5">{t(b.descKey)}</Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={22} color="#C8922A" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Travelers Section */}
          <View className="flex-col">
            <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mb-2">{t('tripGenerate.howManyTravelers')}</Text>
            <View 
              className="flex-row items-center justify-between p-4 rounded-xl border"
              style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
            >
              <View>
                <Text className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant font-medium">{t('tripGenerate.travelers')}</Text>
                <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface font-bold mt-0.5">
                  {travelers} {travelers === 1 ? t('tripGenerate.person') : t('tripGenerate.people')}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:scale-95"
                >
                  <Ionicons name="remove" size={20} color="#C8922A" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTravelers(Math.min(10, travelers + 1))}
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:scale-95"
                >
                  <Ionicons name="add" size={20} color="#C8922A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Interests Grid Section */}
          <View className="flex-col">
            <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mb-2">{t('tripGenerate.selectInterests')}</Text>
            <View className="flex-col gap-2">
              {Array.from({ length: Math.ceil(INTERESTS.length / 2) }).map((_, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-2">
                    {INTERESTS.slice(rowIndex * 2, rowIndex * 2 + 2).map((interest) => {
                    const isSelected = interests.includes(interest.key);
                    const label = t(`tripGenerate.interests.${interest.key}`) || interest.label;
                    return (
                      <TouchableOpacity
                        key={interest.key}
                        onPress={() => toggleInterest(interest.key)}
                        className="flex-1 p-3.5 rounded-xl border flex-row items-center gap-2.5"
                        style={isSelected
                          ? { backgroundColor: colors.primary + '14', borderColor: colors.primary }
                          : { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }
                        }
                      >
                        <Ionicons 
                          name={interest.icon as any} 
                          size={18} 
                          color={isSelected ? '#C8922A' : colors.onSurfaceVariant} 
                        />
                        <Text 
                          className="text-xs font-semibold flex-1" 
                          style={{ color: isSelected ? '#C8922A' : colors.onSurface }}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color="#C8922A" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Action Generate Button */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating || isPending}
            className="w-full bg-pharaoh-gold rounded-full py-4 px-6 flex-row items-center justify-center gap-2 shadow-lg mt-4 active:scale-95"
          >
            {isGenerating || isPending ? (
              <>
                <ActivityIndicator color="white" size="small" style={{ marginRight: 6 }} />
                <Text className="text-white font-label-md font-bold uppercase tracking-wider text-[13px]">
                  {t('tripGenerate.generatingBtn')}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 2 }} />
                <Text className="text-white font-label-md font-bold uppercase tracking-wider text-[13px]">
                  {t('tripGenerate.generateBtn')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant text-center px-4 leading-relaxed opacity-70 mt-1">
            {t('tripGenerate.disclaimer')}
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}