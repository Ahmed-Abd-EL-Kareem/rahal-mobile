// app/ai-hotel-results.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, SparkleBadge, Button, SearchBar } from '@/components/ui';
import { useAIHotelSearch } from '@/api/hooks/useHotels';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/currency';

const AMENITIES = [
  'Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant',
  'Bar', 'Room Service', 'Airport Shuttle', 'Parking', 'Beach Access',
];

export default function AIHotelSearchResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ query?: string }>();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { mutateAsync: searchHotels, isPending: isSearching } = useAIHotelSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await searchHotels({ query: searchQuery });
      // Handle response - in real app, you'd parse the AI response and show structured results
      console.log('AI Response:', response.data.reply);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Search failed');
    }
  };

  const mockResults = [
    { id: 1, name: { en: 'Old Cataract Hotel', ar: 'فندق أولد كتاركت' }, city: 'Aswan', stars: 5, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', rating: 4.9, reviews: 1240, price: 450, currency: 'USD', topPick: true, aiMatch: 98, amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Nile View'] },
    { id: 2, name: { en: 'The Ritz-Carlton, Cairo', ar: 'ريتز كارلتون، القاهرة' }, city: 'Cairo', stars: 5, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', rating: 4.8, reviews: 890, price: 320, currency: 'USD', topPick: false, aiMatch: 95, amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Pyramid View'] },
    { id: 3, name: { en: 'Four Seasons Sharm El Sheikh', ar: 'فور سيزونز شرم الشيخ' }, city: 'Sharm El-Sheikh', stars: 5, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', rating: 4.9, reviews: 1520, price: 580, currency: 'USD', topPick: true, aiMatch: 99, amenities: ['Free WiFi', 'Beach Access', 'Spa', 'Diving Center', 'Kids Club'] },
    { id: 4, name: { en: 'Sofitel Legend Old Cataract', ar: 'فندق سوفيتيل ليجند أولد كتاركت' }, city: 'Aswan', stars: 5, image: 'https://images.unsplash.com/photo-1573212163686-513a473a6c4a?w=400', rating: 4.9, reviews: 560, price: 480, currency: 'USD', topPick: false, aiMatch: 92, amenities: ['Free WiFi', 'Pool', 'Spa', 'Historic', 'Nile View'] },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search & AI Chat */}
        <View className="px-4 py-4">
          <SearchBar
            placeholder={t('aiHotelSearch.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            className="mb-4"
          />

          {/* AI Chat CTA */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai')}
              className="flex-1 bg-primary/5 border border-primary/30 rounded-xl p-4 flex-row items-center gap-3"
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                <Ionicons name="sparkles" size={24} color="#C8922A" />
              </View>
              <View>
                <Text className="text-label-md font-medium text-primary">{t('hotelListing.aiSearchNav')}</Text>
                <Text className="text-label-sm text-primary/80 mt-1">{t('hotelListing.startAIChatBtn')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#C8922A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Filters */}
        <View className="px-4 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <TouchableOpacity
              onPress={() => { /* Filter by All */ }}
              className={`px-4 py-2 rounded-full ${!showFilters ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant'}`}
            >
              <Text className="text-label-md">{t('hotelListing.allRegions')}</Text>
            </TouchableOpacity>
            {['Historical', 'Beach', 'Adventure', 'Cultural', 'Religious', 'Nature', 'Landmark'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => { /* Filter by category */ }}
                className={`px-4 py-2 rounded-full border ${showFilters ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container border-outline-variant text-on-surface'}`}
              >
                <Text className="text-label-md">{t(`destinationsListing.${cat.toLowerCase()}`)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Filters */}
        {showFilters && (
          <View className="px-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-label-md text-on-surface-variant">{t('hotelListing.activeFilters')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text className="text-label-md text-primary">{t('hotelListing.clearAll')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <Badge variant="gold" className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={14} />
                <Text>{t('hotelListing.historical')}</Text>
                <TouchableOpacity onPress={() => {}} className="ml-1">
                  <Ionicons name="close" size={14} />
                </TouchableOpacity>
              </Badge>
            </ScrollView>
          </View>
        )}

        {/* View Toggle */}
        <View className="px-4 mb-4 flex-row items-center justify-between">
          <Text className="text-headline-md font-headline text-on-surface">{t('hotelListing.resultsTitle')}</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="p-2 rounded-lg bg-surface-container">
              <Ionicons name="grid-outline" size={24} color="#1C1C19" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-lg bg-surface-container">
              <Ionicons name="map-outline" size={24} color="#827564" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        <View className="px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
            {mockResults.map((hotel) => (
              <TouchableOpacity key={hotel.id} className="w-80 flex-shrink-0" onPress={() => router.push(`/hotel/${hotel.id}`)}>
                <Card className="p-0 overflow-hidden">
                  <View className="relative h-48">
                    <Image source={{ uri: hotel.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View className="absolute top-3 left-3">
                      <Badge variant="gold">{hotel.stars}★</Badge>
                    </View>
                    <View className="absolute top-3 right-3">
                      <Badge variant="green">{hotel.rating} ({hotel.reviews})</Badge>
                    </View>
                  </View>
                  <CardContent>
                    <View className="flex-row items-start justify-between gap-2 mb-2">
                      <View className="flex-1">
                        <Text className="text-headline-md-mobile font-headline text-on-surface" numberOfLines={1}>{hotel.name.en}</Text>
                        <View className="flex-row items-center gap-2 mt-2">
                          <Ionicons name="location-outline" size={14} color="#827564" />
                          <Text className="text-body-md text-on-surface-variant">{hotel.city}</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-body-md text-on-surface-variant line-clamp-2 mb-3">{hotel.name.en} - {t('destinationsListing.historical')}</Text>
                    <View className="flex-row items-center justify-between mt-3">
                      <View className="flex-row items-center gap-1">
                        <Text className="text-body-md font-bold text-primary">{hotel.price} {hotel.currency}</Text>
                        <Text className="text-label-sm text-on-surface-variant">/ night</Text>
                      </View>
                      <Button variant="outline" size="sm" className="ml-2" onPress={() => router.push(`/hotel/${hotel.id}`)}>
                        {t('hotelListing.viewDetails')}
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Load More */}
          <View className="px-4 py-4">
            <Button variant="outline" fullWidth>
              {t('hotelListing.revealMore')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}