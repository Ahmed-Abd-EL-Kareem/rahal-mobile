// app/hotel/index.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, SparkleBadge, Button, Input, SearchBar } from '@/components/ui';
import { useHotels, useNearbyHotels, useHotelMeta } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const CITIES = [
  'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Sharm El-Sheikh',
  'Hurghada', 'Marsa Alam', 'Siwa', 'Fayoum', 'Dahab',
];

const AMENITIES = [
  'Free WiFi', 'Pool', 'Spa', 'Gym', 'Beach Access',
  'Restaurant', 'Bar', 'Room Service', 'Parking', 'Airport Shuttle',
];

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function HotelsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const params = useLocalSearchParams<{ city?: string; aiQuery?: string }>();
  const { data: hotelsResponse, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useHotels({
    city: params.city,
    search: params.aiQuery || searchQuery,
    stars: selectedStars,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    limit: 20,
  });

  const { data: meta } = useHotelMeta();

  // Handle AI query from search
  useEffect(() => {
    if (params.aiQuery) {
      setSearchQuery(params.aiQuery);
    }
  }, [params.aiQuery]);

  const handleSearch = () => {
    // Trigger refetch with new search params
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedStars(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
  };

  const hasActiveFilters = selectedCity || selectedStars || minPrice || maxPrice || selectedAmenities.length > 0;

  const hotels = hotelsResponse?.data || [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="hourglass-empty" size={48} color="#C8922A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-display-lg-mobile font-headline text-on-surface">
                {t('hotelListing.sidebarTitle')}
              </Text>
              <Text className="text-body-md text-on-surface-variant mt-1">
                {t('hotelListing.sidebarSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl flex-row items-center gap-2 ${hasActiveFilters ? 'bg-primary/10 border border-primary/30' : 'bg-surface-container'}`}
            >
              <Ionicons name="filter-outline" size={24} color={hasActiveFilters ? '#C8922A' : '#827564'} />
              <Text className="text-label-md" style={{ color: hasActiveFilters ? '#C8922A' : '#504536' }}>
                {t('hotelListing.aiSearchNav')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar
            placeholder={t('hotelListing.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            className="mb-4"
          />

          {/* Quick Filters */}
          <View className="gap-3 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ai')}
                className="bg-primary/5 border border-primary/30 px-4 py-2 rounded-full flex-row items-center gap-2"
              >
                <Ionicons name="sparkles" size={20} color="#C8922A" />
                <Text className="text-label-md text-primary">{t('hotelListing.aiSearchNav')}</Text>
              </TouchableOpacity>
              {CITIES.slice(0, 5).map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedCity === city
                      ? 'bg-primary border-primary text-on-primary'
                      : 'bg-surface-container border-outline-variant text-on-surface'
                  }`}
                >
                  <Text className="text-label-md">{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Active Filters */}
          {hasActiveFilters && (
            <View className="mb-4">
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

          {/* View Toggle */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline-md font-headline text-on-surface">
              {t('hotelListing.resultsTitle')}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}
              >
                <Ionicons name="grid-outline" size={24} color={viewMode === 'grid' ? '#FFFFFF' : '#827564'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('map')}
                className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-primary text-on-primary' : 'bg-surface-container'}`}
              >
                <Ionicons name="map-outline" size={24} color={viewMode === 'map' ? '#FFFFFF' : '#827564'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Results */}
        <View className="px-4">
          {viewMode === 'grid' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pb-4">
              {hotels.map((hotel, i) => (
                <TouchableOpacity
                  key={hotel._id}
                  onPress={() => router.push(`/hotel/${hotel._id}`)}
                  className="w-80 flex-shrink-0"
                >
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
                        <Badge variant="green">{hotel.city}</Badge>
                      </View>
                    </View>
                    <CardContent>
                      <View className="flex-row items-start justify-between gap-2 mb-2">
                        <View className="flex-1">
                          <Text className="text-headline-md-mobile font-headline text-on-surface" numberOfLines={1}>
                            {hotel.name.en}
                          </Text>
                          <Text className="text-body-md text-on-surface-variant mt-1">{hotel.city}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="text-body-lg font-bold text-primary">
                          {formatCurrency(hotel.averagePricePerNight, hotel.currency)}
                        </Text>
                        <Text className="text-label-sm text-on-surface-variant">/ night</Text>
                      </View>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" onPress={() => router.push(`/hotel/${hotel._id}`)}>
                        {t('hotelListing.viewDetails')}
                      </Button>
                    </CardFooter>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="h-[400px] bg-surface-container rounded-2xl flex-items-center justify-center">
              <MaterialIcons name="map" size={64} color="#827564" />
              <Text className="text-body-md text-on-surface-variant mt-4 text-center px-8">
                Map view coming soon
              </Text>
            </View>
          )}

          {/* Load More */}
          {hasNextPage && (
            <TouchableOpacity
              onPress={() => {
                setIsLoadingMore(true);
                fetchNextPage().then(() => setIsLoadingMore(false));
              }}
              disabled={isFetchingNextPage || isLoadingMore}
              className="mt-8 mb-8"
            >
              <Button variant="outline" fullWidth>
                {isLoadingMore ? 'Loading...' : t('hotelListing.revealMore')}
              </Button>
            </TouchableOpacity>
          )}

          {hotels.length === 0 && !isLoading && (
            <View className="mt-20 items-center">
              <Ionicons name="search-outline" size={64} color="#827564" />
              <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">
                {t('hotelListing.noExactMatches')}
              </Text>
              <Text className="text-on-surface-variant text-center px-8">
                {t('hotelListing.noExactMatchesDesc')}
              </Text>
              <Button variant="outline" className="mt-4 w-auto" onPress={clearFilters}>
                {t('hotelListing.tryNewSearch')}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}