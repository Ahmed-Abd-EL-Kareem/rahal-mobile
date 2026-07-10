// app/hotel/ai-search-results.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, SparkleBadge, Button, Input, SearchBar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAIHotelSearch } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';

const CITIES = [
  'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Sharm El-Sheikh',
  'Hurghada', 'Marsa Alam', 'Siwa', 'Fayoum', 'Dahab',
];

const AMENITIES = [
  'Free WiFi', 'Pool', 'Spa', 'Gym', 'Beach Access',
  'Restaurant', 'Bar', 'Room Service', 'Parking', 'Airport Shuttle',
];

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function AIHotelSearchResultsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const { colors, isDark } = useTheme();
  const { searchHotels: aiSearch, isLoading } = useAIHotelSearch();
  const [query, setQuery] = useState(params.query || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (params.query) {
      setQuery(params.query);
      handleSearch(params.query);
    }
  }, [params.query]);

  const handleSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const response = await aiSearch({ query: searchQuery, context: { guests, rooms } });
      // Parse the AI response to extract hotel data
      // For now, use mock data
      const mockResults = [
        { id: '1', name: { en: 'Four Seasons Cairo', ar: 'فور سيزونز القاهرة' }, city: 'Cairo', stars: 5, averagePricePerNight: 15000, currency: 'EGP', coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', rating: 4.9, reviews: 1240, amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym'], aiMatch: 95, aiPerfectMatch: true },
        { id: '2', name: { en: 'Old Cataract Hotel', ar: 'فندق أولد كتاركت' }, city: 'Aswan', stars: 5, averagePricePerNight: 25000, currency: 'EGP', coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', rating: 4.8, reviews: 890, amenities: ['Free WiFi', 'Pool', 'Spa', 'Nile View'], aiMatch: 98, aiPerfectMatch: true },
        { id: '3', name: { en: 'Ritz-Carlton Cairo', ar: 'ريتز كارلتون القاهرة' }, city: 'Cairo', stars: 5, averagePricePerNight: 18000, currency: 'EGP', coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', rating: 4.9, reviews: 1100, amenities: ['Free WiFi', 'Pool', 'Spa', 'Pyramid View'], aiMatch: 92, aiPerfectMatch: false },
      ];
      setResults(mockResults);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedStars(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
  };

  const hasActiveFilters = selectedCity || selectedStars || minPrice || maxPrice || selectedAmenities.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search & AI Chat */}
        <View className="px-4 py-4">
          <SearchBar
            placeholder={t('aiHotelSearch.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            className="mb-4"
          />

          <View className="mt-4 flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai')}
              className="flex-1 bg-primary/5 border border-primary/30 rounded-xl p-4 flex-row items-center gap-3"
            >
              <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                <Ionicons name="sparkles" size={24} color="#C8922A" />
              </View>
              <View>
                <Text className="text-label-md font-medium text-primary">{t('aiHotelSearch.aiPowered')}</Text>
                <Text className="text-label-sm text-primary/80 mt-1">{t('aiHotelSearch.backToHotels')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#C8922A" />
            </TouchableOpacity>
          </View>

          {/* Quick Filters */}
          <View className="mt-4 gap-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-full ${showFilters ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant'}`}
              >
                <Text className="text-label-md">{t('hotelListing.aiSearchNav')}</Text>
              </TouchableOpacity>
              {CITIES.slice(0, 5).map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => setSelectedCity(selectedCity === city ? '' : city)}
                  className={`px-4 py-2 rounded-full border ${selectedCity === city ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container border-outline-variant text-on-surface'}`}
                >
                  <Text className="text-label-md">{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Active Filters */}
          {hasActiveFilters && (
            <View className="mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-label-md text-on-surface-variant">{t('hotelListing.activeFilters')}</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text className="text-label-md text-primary">{t('hotelListing.clearAll')}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {selectedCity && (
                  <Badge variant="blue" className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={14} />
                    <Text>{selectedCity}</Text>
                    <TouchableOpacity onPress={() => setSelectedCity('')} className="ml-1">
                      <Ionicons name="close" size={14} />
                    </TouchableOpacity>
                  </Badge>
                )}
                {selectedStars && (
                  <Badge variant="gold" className="flex-row items-center gap-1">
                    {[...Array(selectedStars)].map((_, i) => <Ionicons key={i} name="star" size={14} />)}
                    <TouchableOpacity onPress={() => setSelectedStars(null)} className="ml-1">
                      <Ionicons name="close" size={14} />
                    </TouchableOpacity>
                  </Badge>
                )}
                {minPrice && (
                  <Badge variant="green" className="flex-row items-center gap-1">
                    <Ionicons name="cash-outline" size={14} />
                    <Text>{minPrice}+</Text>
                    <TouchableOpacity onPress={() => setMinPrice('')} className="ml-1">
                      <Ionicons name="close" size={14} />
                    </TouchableOpacity>
                  </Badge>
                )}
                {maxPrice && (
                  <Badge variant="green" className="flex-row items-center gap-1">
                    <Ionicons name="cash-outline" size={14} />
                    <Text>{maxPrice} max</Text>
                    <TouchableOpacity onPress={() => setMaxPrice('')} className="ml-1">
                      <Ionicons name="close" size={14} />
                    </TouchableOpacity>
                  </Badge>
                )}
                {selectedAmenities.map((amenity, i) => (
                  <Badge key={i} variant="blue" className="flex-row items-center gap-1">
                    <Text>{amenity}</Text>
                    <TouchableOpacity onPress={() => setSelectedAmenities(prev => prev.filter(a => a !== amenity))} className="ml-1">
                      <Ionicons name="close" size={14} />
                    </TouchableOpacity>
                  </Badge>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* AI Chat Response */}
        {results.length > 0 && !isSearching && (
          <View className="px-4 mb-4">
            <Card className="bg-primary/5 border border-primary/20" style={{ borderRadius: 16 }}>
              <CardContent>
                <View className="flex-row items-start gap-3">
                  <View className="p-2 rounded-xl bg-primary/10">
                    <Ionicons name="sparkles" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-md font-medium text-primary mb-1">{t('aiHotelSearch.aiResponse')}</Text>
                    <Text className="text-body-md text-on-surface-variant mb-3">
                      {t('aiHotelSearch.matchedHotels', { count: results.length })}
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => {}} className="bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
                        <Text className="text-label-sm">{t('aiHotelSearch.copyResponse')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleSearch(query)} className="bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant">
                        <Text className="text-label-sm">{t('aiHotelSearch.newSearch')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Results */}
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline-md-mobile font-headline text-on-surface">{t('hotelListing.resultsTitle')}</Text>
            {results.length > 0 && (
              <Text className="text-label-md text-on-surface-variant">
                {t('hotelListing.showingResults', { count: results.length })}
              </Text>
            )}
          </View>

          {isLoading || isSearching ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#C8922A" />
              <Text className="text-on-surface-variant mt-4">{t('common.loading')}</Text>
            </View>
          ) : results.length === 0 ? (
            <View className="items-center py-20">
              <Ionicons name="compass-outline" size={64} color="#827564" />
              <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">
                {t('hotelListing.noExactMatches')}
              </Text>
              <Text className="text-on-surface-variant text-center px-8">
                {t('hotelListing.noExactMatchesDesc')}
              </Text>
              <Button variant="outline" className="mt-4 w-auto" onPress={() => setQuery('')}>
                {t('hotelListing.tryNewSearch')}
              </Button>
            </View>
          ) : (
            <View className="gap-4">
              {results.map((hotel) => (
                <TouchableOpacity key={hotel.id} className="w-full" onPress={() => router.push(`/hotel/${hotel.id}`)}>
                  <Card className="p-0 overflow-hidden">
                    <View className="relative h-48">
                      <Image
                        source={{ uri: hotel.coverImage }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
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
                          <Text className="text-headline-md-mobile font-headline text-on-surface" numberOfLines={1}>
                            {hotel.name.en}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-2">
                            <Ionicons name="location-outline" size={14} color="#827564" />
                            <Text className="text-body-md text-on-surface-variant">{hotel.city}</Text>
                          </View>
                        </View>
                        <View className="text-right">
                          <Text className="text-body-lg font-bold text-primary">{formatCurrency(hotel.averagePricePerNight, hotel.currency)}</Text>
                          <Text className="text-label-sm text-on-surface-variant">/ night</Text>
                        </View>
                      </View>
                      <Text className="text-body-md text-on-surface-variant line-clamp-2 mb-3">
                        {hotel.description?.en || 'Luxury hotel with exceptional service and stunning views.'}
                      </Text>
                      <View className="flex-row items-center justify-between mt-3">
                        <View className="flex-row items-center gap-2">
                          <Badge variant={hotel.aiPerfectMatch ? 'sparkle' : 'gold'} className="gap-1">
                            <Ionicons name={hotel.aiPerfectMatch ? 'sparkles' : 'checkmark-circle'} size={14} />
                            <Text>{hotel.aiPerfectMatch ? t('aiHotelSearch.aiPerfectMatch') : t('aiHotelSearch.aiExactMatch')}</Text>
                          </Badge>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Button variant="outline" size="sm" className="ml-2">
                            {t('hotelListing.viewDetails')}
                          </Button>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Load More */}
          <View className="px-4 py-4">
            <Button variant="outline" fullWidth>
              {t('hotelListing.loadMore')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}