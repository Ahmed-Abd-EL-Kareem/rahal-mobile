// app/trip/generate.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button, Input, SearchBar } from '@/components/ui';
import { useGenerateTrip } from '@/api/hooks/useTrips';
import { useTheme } from '@/hooks/useTheme';

const INTERESTS = [
  { key: 'history', label: 'Historical Sites', icon: 'library-outline' },
  { key: 'beach', label: 'Beaches', icon: 'water-outline' },
  { key: 'adventure', label: 'Adventure', icon: 'flash-outline' },
  { key: 'cultural', label: 'Culture', icon: 'musical-notes-outline' },
  { key: 'food', label: 'Food & Dining', icon: 'restaurant-outline' },
  { key: 'nature', label: 'Nature', icon: 'leaf-outline' },
  { key: 'shopping', label: 'Shopping', icon: 'bag-outline' },
  { key: 'wellness', label: 'Wellness', icon: 'spa-outline' },
];

const BUDGET_OPTIONS = [
  { key: 'budget', label: 'Budget', desc: 'Affordable options', icon: 'cash-outline' },
  { key: 'mid-range', label: 'Mid-Range', desc: 'Comfort & value', icon: 'diamond-outline' },
  { key: 'luxury', label: 'Luxury', desc: 'Premium experience', icon: 'crown-outline' },
];

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14];

export default function TripGenerateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { mutateAsync: generateTrip, isPending } = useGenerateTrip();

  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [budget, setBudget] = useState('mid-range');
  const [travelers, setTravelers] = useState(2);
  const [interests, setInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }
    if (interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateTrip({
        destination: destination.trim(),
        duration,
        budget,
        travelers,
        interests,
        language: 'en',
      });
      router.push(`/trip/${response.data.trip._id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate trip';
      Alert.alert('Error', message);
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-20">
          {/* Header */}
          <View className="mb-8">
            <View className="w-14 h-14 rounded-2xl bg-primary/10 flex-items-center justify-center mb-4">
              <MaterialIcons name="auto-awesome" size={36} color="#C8922A" />
            </View>
            <Text className="text-display-lg-mobile font-headline text-on-surface mb-2">
              {t('home.hero.title')}
            </Text>
            <Text className="text-body-lg text-on-surface-variant">
              {t('trip.generate.subtitle')}
            </Text>
          </View>

          {/* Destination */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.generate.destination')}</Text>
            <SearchBar
              placeholder={t('trip.generate.destinationPlaceholder')}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          {/* Duration */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.generate.duration')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
              {DURATION_OPTIONS.map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setDuration(days)}
                  className={`px-5 py-2.5 rounded-full border-2 font-medium transition-colors ${
                    duration === days
                      ? 'bg-primary border-primary text-on-primary'
                      : 'bg-surface border-outline-variant text-on-surface'
                  }`}
                >
                  <Text>{days} {t('trip.generate.days')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Budget */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.generate.budget')}</Text>
            <View className="gap-3">
              {BUDGET_OPTIONS.map((b) => (
                <TouchableOpacity
                  key={b.key}
                  onPress={() => setBudget(b.key)}
                  className={`p-4 rounded-2xl border-2 transition-colors flex-row items-center gap-3 ${
                    budget === b.key
                      ? 'bg-primary/5 border-primary'
                      : 'bg-surface-container border-outline-variant'
                  }`}
                >
                  <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                    <Ionicons name={b.icon} size={24} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-headline-md-mobile font-headline text-on-surface">{b.label}</Text>
                    <Text className="text-label-sm text-on-surface-variant">{b.desc}</Text>
                  </View>
                  {budget === b.key && (
                    <Ionicons name="checkmark-circle" size={24} color="#C8922A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Travelers */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.generate.travelers')}</Text>
            <View className="flex-row items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
              <View>
                <Text className="text-label-md text-on-surface-variant">{t('trip.generate.travelers')}</Text>
                <Text className="text-headline-md font-headline text-on-surface">{travelers} {t('trip.generate.people')}</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setTravelers(Math.max(1, travelers - 1))}
                  className="w-10 h-10 rounded-full bg-primary/10 flex-items-center justify-center"
                >
                  <Ionicons name="remove" size={24} color="#C8922A" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTravelers(Math.min(10, travelers + 1))}
                  className="w-10 h-10 rounded-full bg-primary/10 flex-items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="#C8922A" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Interests */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('trip.generate.interests')}</Text>
            <View className="gap-2">
              {[INTERESTS.slice(0, 4), INTERESTS.slice(4)].map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-2">
                  {row.map((interest) => (
                    <TouchableOpacity
                      key={interest.key}
                      onPress={() => toggleInterest(interest.key)}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 flex-row items-center gap-2 transition-colors ${
                        interests.includes(interest.key)
                          ? 'bg-primary/5 border-primary'
                          : 'bg-surface-container border-outline-variant'
                      }`}
                    >
                      <Ionicons 
                        name={interest.icon} 
                        size={20} 
                        color={interests.includes(interest.key) ? '#C8922A' : '#827564'} 
                      />
                      <Text className="text-label-md flex-1" style={{ color: interests.includes(interest.key) ? '#C8922A' : '#1C1C19' }}>
                        {t(`destinationsListing.${interest.key}`)}
                      </Text>
                      {interests.includes(interest.key) && (
                        <Ionicons name="checkmark-circle" size={20} color="#C8922A" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Generate Button */}
          <Button
            onPress={handleGenerate}
            disabled={isGenerating || isPending}
            fullWidth
            size="lg"
            className="mt-4"
            variant="primary"
          >
            {isGenerating || isPending ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="large" style={{ marginRight: 8 }} />
                <Text>{t('trip.generate.generating')}</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={24} style={{ marginRight: 8 }} />
                <Text>{t('trip.generate.generateBtn')}</Text>
              </>
            )}
          </Button>

          <Text className="text-label-sm text-on-surface-variant text-center mt-4">
            {t('trip.generate.disclaimer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}