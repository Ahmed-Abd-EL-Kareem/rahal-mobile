// app/destination/[slug].tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useDestination, useNearbyDestinations } from '@/api/hooks/useDestinations';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';

interface DestinationDetail {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  city: string;
  region: string;
  category: string;
  description: { en: string; ar: string };
  attractions: Array<{ name: { en: string; ar: string }; type: string; entryFee: number }>;
  bestMonths: string[];
  averageBudgetPerDay: number;
  currency: string;
  location: { type: 'Point'; coordinates: [number, number] };
  images: string[];
  coverImage: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  historical: 'library-outline',
  beach: 'water-outline',
  adventure: 'flash-outline',
  cultural: 'musical-notes-outline',
  religious: 'book-outline',
  nature: 'leaf-outline',
  landmark: 'location-outline',
};

export default function DestinationDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const { data: destination, isLoading, error } = useDestination(params.slug);
  const [stickyVisible, setStickyVisible] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <MaterialIcons name="hourglass-empty" size={48} color="#C8922A" />
      </SafeAreaView>
    );
  }

  if (error || !destination) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#827564" />
        <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">{t('destinationDetail.destinationNotFound')}</Text>
        <Text className="text-body-md text-on-surface-variant text-center mb-6">{t('destinationDetail.destinationNotFoundDesc')}</Text>
        <Button variant="outline" onPress={() => router.back()}>
          {t('destinationDetail.returnToDestinations')}
        </Button>
      </SafeAreaView>
    );
  }

  const d = destination as DestinationDetail;
  const locale = t('common.locale') || 'en';
  const name = d.name[locale === 'ar' ? 'ar' : 'en'];
  const description = d.description[locale === 'ar' ? 'ar' : 'en'];

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    setStickyVisible(offset > 200);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <View className="relative h-[400px]">
          <Image
            source={{ uri: d.coverImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20,16,15,0.6)' }} />
          
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/20 flex-items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Category & Location */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <Badge variant="gold">
              <Ionicons name={CATEGORY_ICONS[d.category] || 'location-outline'} size={14} style={{ marginRight: 4 }} />
              {t(`destinationsListing.${d.category}`)}
            </Badge>
          </View>

          {/* Bottom Info */}
          <View className="absolute bottom-4 left-4 right-4">
            <View className="flex-row items-center gap-2 mb-2 text-white/80">
              <Ionicons name="location-outline" size={16} />
              <Text>{d.city}, {t(`destinationsListing.${d.region}`)}</Text>
            </View>
            <Text className="text-headline-md font-headline text-white">{name}</Text>
            <View className="flex-row items-center gap-4 mt-2 text-white/80">
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} />
                <Text>{t('destinationDetail.bestTimeDesc')}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="cash-outline" size={16} />
                <Text>{t('destinationDetail.budgetDesc')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sticky Header */}
        <View
          className={`absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-4 py-3 transition-opacity duration-200 ${
            stickyVisible ? 'opacity-100 bg-background/95 backdrop-blur-sm shadow-resting' : 'opacity-0 pointer-events-none'
          }`}
        >
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View className="flex-1" />
          <TouchableOpacity className="p-2">
            <Ionicons name="share-outline" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-20">
          {/* Overview */}
          <View className="mb-8">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('destinationDetail.overview')}</Text>
            <Text className="text-body-md text-on-surface-variant leading-relaxed">{description}</Text>
          </View>

          {/* AI Insight */}
          <Card variant="outlined" className="mb-6 border-primary/30">
            <CardContent>
              <View className="flex-row items-start gap-3">
                <View className="p-2 rounded-xl bg-primary/10">
                  <Ionicons name="sparkles" size={20} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-label-md font-medium text-primary mb-1">{t('destinationDetail.aiInsight')}</Text>
                  <Text className="text-body-md text-on-surface-variant">{t('destinationDetail.aiInsightDesc')}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Attractions */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-headline-md font-headline text-on-surface">{t('destinationDetail.mustSeeAttractions')}</Text>
              <Text className="text-label-md text-primary">{t('destinationDetail.attractionsSubtitle')}</Text>
            </View>
            <View className="gap-3">
              {d.attractions.map((attraction, i) => (
                <Card key={i} className="p-4" style={{ borderRadius: 16 }}>
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-headline-md-mobile font-headline text-on-surface">{attraction.name[locale === 'ar' ? 'ar' : 'en']}</Text>
                        <Badge variant="blue">{t(`destinationsListing.${attraction.type}`)}</Badge>
                      </View>
                      <Text className="text-body-md text-on-surface-variant">
                        {t('destinationDetail.freeEntry')}
                      </Text>
                    </View>
                    <TouchableOpacity className="p-2 rounded-lg bg-primary/10">
                      <Ionicons name="chevron-forward" size={20} color="#C8922A" />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Premium Stays */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-headline-md font-headline text-on-surface">{t('destinationDetail.premiumStays')}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text className="text-label-md text-primary">{t('destinationDetail.viewDetails')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
              {[
                { name: 'Luxury Hotel', price: 450, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
                { name: 'Boutique Resort', price: 320, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
                { name: 'Heritage Palace', price: 580, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
              ].map((hotel, i) => (
                <TouchableOpacity key={i} className="w-64 flex-shrink-0" onPress={() => router.push('/hotel/1')}>
                  <Card className="p-0 overflow-hidden">
                    <View className="relative h-40">
                      <Image source={{ uri: hotel.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                    <CardContent>
                      <Text className="text-headline-md-mobile font-headline text-on-surface">{hotel.name}</Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-body-lg font-bold text-primary">{formatCurrency(hotel.price, 'USD')}</Text>
                        <Text className="text-label-sm text-on-surface-variant">{t('destinationDetail.perNight')}</Text>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Plan Trip CTA */}
          <View className="mb-8">
            <Card className="p-6 bg-primary" style={{ borderRadius: 24 }}>
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-primary-container/30 flex-items-center justify-center">
                  <Ionicons name="sparkles" size={28} color="#F8BC51" />
                </View>
                <View className="flex-1">
                  <Text className="text-headline-md font-headline text-on-primary">{t('destinationDetail.planTripTitle', { name })}</Text>
                  <Text className="text-body-md text-on-primary/80 mt-2">{t('destinationDetail.planTripSubtitle')}</Text>
                  <Button variant="secondary" size="sm" className="mt-4 w-auto" onPress={() => router.push('/trip/generate')}>
                    {t('destinationDetail.planTripBtn')}
                  </Button>
                </View>
              </View>
            </Card>
          </View>

          {/* Sticky Plan Trip Button */}
          <TouchableOpacity
            className={`fixed bottom-4 left-4 right-4 z-30 transition-opacity duration-200 ${stickyVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onPress={() => router.push('/trip/generate')}
          >
            <Button variant="ai" size="lg" fullWidth>
              <Ionicons name="sparkles" size={20} />
              <Text>{t('destinationDetail.stickyPlanTrip')}</Text>
            </Button>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}