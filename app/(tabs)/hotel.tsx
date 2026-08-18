// app/(tabs)/hotel.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useHotels } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '@/i18n';
import { useFavoritesStore } from '@/store/favoritesStore';
import { SideMenu } from '@/components/layout/SideMenu';

const CITIES = [
  'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Sharm El-Sheikh',
  'Hurghada', 'Marsa Alam', 'Siwa', 'Fayoum', 'Dahab',
];

export default function HotelsScreen() {
  const { t } = useTranslation();
  const { colors, isDark, isRTL } = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { favoriteHotels, toggleHotelFavorite } = useFavoritesStore();
  const [activeMapHotel, setActiveMapHotel] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const params = useLocalSearchParams<{ city?: string; aiQuery?: string }>();
  
  const { data: hotelsResponse, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useHotels({
    city: params.city || selectedCity || undefined,
    search: params.aiQuery || searchQuery || undefined,
    limit: 10,
  });

  const hotels = hotelsResponse?.pages.flatMap(p => p.data) || [];

  useEffect(() => {
    if (params.aiQuery) {
      setSearchQuery(params.aiQuery);
    }
  }, [params.aiQuery]);

  useEffect(() => {
    if (hotels.length > 0 && !activeMapHotel) {
      setActiveMapHotel(hotels[0]);
    }
  }, [hotels]);

  const toggleFavorite = (hotel: any) => {
    toggleHotelFavorite(hotel);
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSearchQuery('');
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      {/* Top Header (adjusted to sit below notch/camera cutout) */}
      <View 
        className="flex-row justify-between items-center px-4 border-b"
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant + '33',
        }}
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => setIsMenuOpen(true)} 
            className="p-2 active:scale-95 transition-transform"
          >
            <Ionicons name="menu-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Image 
              source={require('@/assets/logo-2.png')} 
              style={{ width: 28, height: 28 }} 
              resizeMode="contain" 
            />
            <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">Rahal</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 active:scale-95 transition-transform">
          <Ionicons name="notifications-outline" size={24} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <FlatList
        className="flex-1"
        data={viewMode === 'grid' ? hotels : []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          <View className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
            {/* Search & View Toggle Section */}
            <View className="flex-col gap-4 mb-6">
              {/* Search Bar */}
              <View 
                className="relative flex-row items-center border rounded-xl px-4 py-3"
                style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '66' }}
              >
                <Ionicons name="search-outline" size={20} color={colors.onSurfaceVariant} className="mr-3" />
                <TextInput
                  className="flex-1 text-body-md font-body text-on-surface"
                  style={{ color: colors.onSurface }}
                  placeholder={t('hotelListing.searchPlaceholder') || "Search by name, city, landmark"}
                  placeholderTextColor={colors.onSurfaceVariant + '80'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <Ionicons name="close-circle" size={18} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>

              {/* View Toggle */}
              <View 
                className="flex-row p-1 rounded-xl self-start"
                style={{ backgroundColor: colors.surfaceContainerHigh }}
              >
                <TouchableOpacity
                  onPress={() => setViewMode('grid')}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? colors.surface : 'transparent',
                    shadowColor: isDark ? '#000000' : 'rgba(80, 69, 54, 0.15)',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: viewMode === 'grid' ? 0.2 : 0,
                    shadowRadius: 1.41,
                    elevation: viewMode === 'grid' ? 1 : 0
                  }}
                >
                  <Ionicons name="grid" size={16} color={viewMode === 'grid' ? colors.pharaohGold : colors.onSurfaceVariant} />
                  <Text 
                    className="text-label-md font-medium"
                    style={{ color: viewMode === 'grid' ? colors.pharaohGold : colors.onSurfaceVariant }}
                  >
                    Grid view
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setViewMode('map')}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: viewMode === 'map' ? colors.surface : 'transparent',
                    shadowColor: isDark ? '#000000' : 'rgba(80, 69, 54, 0.15)',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: viewMode === 'map' ? 0.2 : 0,
                    shadowRadius: 1.41,
                    elevation: viewMode === 'map' ? 1 : 0
                  }}
                >
                  <Ionicons name="map" size={16} color={viewMode === 'map' ? colors.pharaohGold : colors.onSurfaceVariant} />
                  <Text 
                    className="text-label-md font-medium"
                    style={{ color: viewMode === 'map' ? colors.pharaohGold : colors.onSurfaceVariant }}
                  >
                    Map view
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* AI Powered search navigation card */}
            <TouchableOpacity
              onPress={() => router.push('/hotel/ai-search-results')}
              className="mb-6 bg-gradient-to-r from-pharaoh-gold/15 to-primary-container/5 border border-pharaoh-gold/30 rounded-2xl p-4 flex-row items-center justify-between active:scale-[0.99] transition-transform"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-xl bg-pharaoh-gold/10 items-center justify-center">
                  <Ionicons name="sparkles" size={20} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-on-surface font-headline text-label-md font-bold">AI-Powered Hotel Search</Text>
                  <Text className="text-on-surface-variant text-xs font-body mt-0.5">Let Rahal find your perfect heritage stay using AI</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#C8922A" className="ml-2" />
            </TouchableOpacity>

            {/* Quick Filters */}
            <View className="mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <TouchableOpacity
                  onPress={() => router.push('/hotel/ai-search-results')}
                  className="flex-row items-center gap-2 bg-pharaoh-gold/10 border border-pharaoh-gold/20 px-4 py-2.5 rounded-full"
                >
                  <Ionicons name="sparkles" size={14} color="#C8922A" />
                  <Text className="text-label-sm font-semibold text-pharaoh-gold">{t('hotelListing.aiSearchNav') || "AI Search"}</Text>
                </TouchableOpacity>

                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => setSelectedCity(selectedCity === city ? '' : city)}
                    className="px-4 py-2.5 rounded-full border"
                    style={{
                      backgroundColor: selectedCity === city ? colors.pharaohGold : colors.surfaceContainerLow,
                      borderColor: selectedCity === city ? colors.pharaohGold : colors.outlineVariant + '66',
                    }}
                  >
                    <Text 
                      className="text-label-sm font-semibold"
                      style={{ color: selectedCity === city ? '#FFFFFF' : colors.onSurfaceVariant }}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Loading Indicator */}
            {isLoading && (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#C8922A" />
              </View>
            )}

            {/* Map View (Interactive mockup) */}
            {viewMode === 'map' && !isLoading && (
              <View 
                className="relative w-full h-[550px] rounded-2xl overflow-hidden border shadow-md"
                style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant + '66' }}
              >
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHyxd6Gp3NO-uZIvXh9JipnOne4gnRSEkIUWUDrRLyBt3zBA1nTM-u7FFRZcVQU-_vXdJg2Krq25WgU62hu-ps93tVanbS0rvPkHOq7DujXEeQSbF0WP64i7ehRGtzmWWPo_sMlqghk0sSdaVKoH4QPovxI-UZ-HviQJj8QqsZi5iQg__7FVQ0EpzVEqTNBTUOewbksOwcQOgW-G6v-PAe7qDBmerCxfUZjwexQiK768nbBa37dABYlvWJtDD7pC-McX6O2vqrcRg' }}
                  className="w-full h-full opacity-60"
                  resizeMode="cover"
                />
                
                {/* Absolute Interactive Map Pins */}
                {hotels.slice(0, 3).map((hotel, index) => {
                  const pins = [
                    { top: '35%' as const, left: '42%' as const },
                    { top: '55%' as const, left: '60%' as const },
                    { top: '45%' as const, left: '25%' as const },
                  ];
                  const pin = pins[index] || { top: '50%' as const, left: '50%' as const };
                  const isActive = activeMapHotel?._id === hotel._id;

                  return (
                    <TouchableOpacity
                      key={hotel._id}
                      onPress={() => setActiveMapHotel(hotel)}
                      style={{ top: pin.top, left: pin.left }}
                      className="absolute -translate-x-4 -translate-y-8 items-center"
                    >
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center shadow-lg border"
                        style={{
                          backgroundColor: isActive ? colors.pharaohGold : colors.surface,
                          borderColor: isActive ? colors.pharaohGold : colors.outlineVariant + '99'
                        }}
                      >
                        <Ionicons name="business" size={16} color={isActive ? 'white' : '#C8922A'} />
                      </View>
                      <View 
                        className="w-2 h-2 rounded-full mt-1"
                        style={{ backgroundColor: isActive ? colors.pharaohGold : colors.outlineVariant }}
                      />
                    </TouchableOpacity>
                  );
                })}

                {/* Overlay Info Card (Top Left) */}
                {activeMapHotel && (
                  <View 
                    className="absolute top-6 left-6 p-4 backdrop-blur-md rounded-xl shadow-lg border max-w-[280px]"
                    style={{
                      backgroundColor: isDark ? 'rgba(28, 26, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: colors.outlineVariant + '66'
                    }}
                  >
                    <Text className="font-headline text-label-md text-pharaoh-gold mb-1">Explore {selectedCity || 'Egypt'}</Text>
                    <Text className="text-label-sm mb-3" style={{ color: colors.outline }}>{hotels.length} luxury stays found.</Text>
                    
                    <TouchableOpacity
                      onPress={() => router.push(`/hotel/${activeMapHotel.slug}`)}
                      className="flex-row items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: colors.surfaceContainerLow }}
                    >
                      <View className="w-12 h-12 rounded-lg bg-pharaoh-gold/10 items-center justify-center">
                        <Ionicons name="business" size={24} color="#C8922A" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-sm" style={{ color: colors.onSurface }} numberOfLines={1}>{activeMapHotel.name.en}</Text>
                        <Text className="text-xs text-pharaoh-gold font-semibold mt-0.5">{formatCurrency(activeMapHotel.averagePricePerNight, activeMapHotel.currency)}/night</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        }
        renderItem={({ item: hotel }) => {
          const isFav = favoriteHotels.some(h => h._id === hotel._id);
          const mockRating = (4.5 + (hotel.stars * 0.08)).toFixed(1);
          const hotelName = (hotel.name && typeof hotel.name === 'object')
            ? (hotel.name[i18n.language === 'ar' ? 'ar' : 'en'] || hotel.name.en || '')
            : (hotel.name || '');

          return (
            <View className="px-4 md:px-10 max-w-[1600px] mx-auto w-full py-2">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/hotel/${hotel.slug || hotel._id}`)}
                className="rounded-xl overflow-hidden shadow-resting border active:scale-[0.99]"
                style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
              >
                {/* Cover Image and Badge overlays */}
                <View className="relative h-60 w-full bg-surface-container">
                  {hotel.coverImage ? (
                    <Image
                      source={{ uri: hotel.coverImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center" style={{ backgroundColor: colors.surfaceContainerLow }}>
                      <Ionicons name="business" size={48} color={colors.outlineVariant} />
                    </View>
                  )}
                  
                  {/* Top-Left Rahal Choice Badge */}
                  {hotel.stars === 5 && (
                    <View className="absolute top-3 left-3 bg-pharaoh-gold/90 backdrop-blur-md px-3 py-1 rounded-full flex-row items-center gap-1 shadow-md">
                      <Ionicons name="sparkles" size={12} color="white" />
                      <Text className="text-white text-label-sm uppercase tracking-wider font-bold">
                        {t('hotelListing.rahalChoice', 'Rahal Choice')}
                      </Text>
                    </View>
                  )}

                  {/* Top-Right Favorite Button */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(hotel);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md items-center justify-center active:scale-110 shadow-sm"
                  >
                    <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#BA1A1A" : colors.onSurfaceVariant} />
                  </TouchableOpacity>

                  {/* Bottom-Left Price Tier Badge */}
                  <View className="absolute bottom-3 left-3 bg-obsidian/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                    <Text className="text-white font-label-sm text-[12px] font-bold">
                      <Text className="text-pharaoh-gold">{formatCurrency(hotel.averagePricePerNight, hotel.currency)}</Text>
                      <Text className="text-white/80 font-normal"> / {t('hotelListing.perNight', 'night')}</Text>
                    </Text>
                  </View>

                  {/* Bottom-Right Rating Badge */}
                  <View className="absolute bottom-3 right-3 bg-obsidian/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#C8922A" />
                    <Text className="text-white font-label-sm text-[12px]">
                      {mockRating} ({hotel.stars}★)
                    </Text>
                  </View>
                </View>

                {/* Card Content Details */}
                <CardContent className="p-5">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-headline-md-mobile font-headline font-semibold mb-1 text-left" style={{ color: colors.onSurface }}>
                        {hotelName}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={14} color={colors.onSurfaceVariant} />
                        <Text className="text-body-md font-body text-left" style={{ color: colors.outline }}>
                          {hotel.city}, Egypt
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View 
                    className="flex-row justify-between items-center mt-4 border-t pt-3"
                    style={{ borderTopColor: colors.outlineVariant + '25' }}
                  >
                    <Text className="text-papyrus-green font-label-md font-semibold">
                      {hotel.rooms?.length ? `${hotel.rooms.length} ${t('hotelDetail.roomTypes', 'Room Types Available')}` : t('hotelListing.luxuryLandmark', 'Luxury Heritage Stay')}
                    </Text>
                    <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={18} color="#C8922A" />
                  </View>
                </CardContent>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-20 px-6">
              <Ionicons name="search-outline" size={64} color={colors.onSurfaceVariant} />
              <Text className="font-headline text-headline-md-mobile mt-4 mb-2" style={{ color: colors.onSurface }}>No Hotels Found</Text>
              <Text className="text-center font-body mb-6" style={{ color: colors.onSurfaceVariant }}>
                {t('hotelListing.noExactMatchesDesc') || "We couldn't find any hotels matching your current filters."}
              </Text>
              <TouchableOpacity onPress={clearFilters} className="bg-pharaoh-gold px-6 py-2.5 rounded-full">
                <Text className="text-white font-label-md">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
            {isFetchingNextPage && (
              <ActivityIndicator size="small" color="#C8922A" style={{ paddingVertical: 20 }} />
            )}
            {/* Heritage Divider */}
            <View className="flex-row items-center gap-4 py-16">
              <View className="h-[1px] flex-1 bg-pharaoh-gold/20" />
              <View className="flex-row items-center gap-2">
                <Ionicons name="star-outline" size={14} color="#C8922A" />
                <Ionicons name="sparkles" size={20} color="#C8922A" />
                <Ionicons name="star-outline" size={14} color="#C8922A" />
              </View>
              <View className="h-[1px] flex-1 bg-pharaoh-gold/20" />
            </View>
          </View>
        }
      />

      {/* Dropdown Menu Modal */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Floating AI Action Button */}
      <View className="absolute bottom-6 right-6 z-50">
        <TouchableOpacity
          onPress={() => router.push('/hotel/ai-search-results')}
          className="flex-row items-center gap-3 px-6 py-4 bg-pharaoh-gold rounded-full shadow-[0_8px_30px_rgba(200,146,42,0.4)] active:scale-105 transition-all duration-300"
          style={{ elevation: 6 }}
        >
          <Ionicons name="sparkles" size={18} color="white" />
          <Text className="text-white text-label-md font-semibold uppercase tracking-widest">Book with AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}