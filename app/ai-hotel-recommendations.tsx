// app/ai-hotel-recommendations.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, CardContent } from '@/components/ui';
import { useAIHotelRecommendations } from '@/api/hooks/useAI';
import { useTrip } from '@/api/hooks/useTrips';
import { formatCurrency } from '@/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function AIHotelRecommendationsScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ tripId?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();
  const { favoriteHotels, toggleHotelFavorite } = useFavoritesStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tripId = params.tripId;
  const lang = i18n?.language || 'en';

  const { data: tripResponse, isLoading: isTripLoading } = useTrip(tripId || '');
  const { data: recommendationsResponse, isLoading: isRecsLoading, error: recsError } = useAIHotelRecommendations(tripId, 4);

  const trip = tripResponse?.data;
  const recommendations = recommendationsResponse?.data?.hotels || [];
  const isLoading = isTripLoading || isRecsLoading;

  const getLocalizedValue = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val['en'] || val['ar'] || Object.values(val)[0] || '';
    }
    return String(val);
  };

  const toggleFavorite = (hotel: any) => {
    toggleHotelFavorite(hotel);
  };

  const tripTitle = trip ? getLocalizedValue(trip.title) : '';
  const tripDest = trip ? getLocalizedValue(trip.destination) : '';

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      {/* Top Header */}
      <View 
        className="flex-row justify-between items-center px-4 border-b z-50"
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant + '33',
        }}
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
            <Ionicons name="arrow-back" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">Rahal</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => setIsMenuOpen(true)} className="p-1 active:scale-95">
            <Ionicons name="menu-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
          
          {/* Trip Context Banner */}
          {trip && (
            <View 
              className="p-5 rounded-2xl border mb-6 flex-col gap-1 shadow-sm"
              style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={16} color="#C8922A" />
                <Text className="text-pharaoh-gold font-bold text-xs uppercase tracking-widest">
                  AI Hotel Recommendations
                </Text>
              </View>
              <Text className="font-headline text-xl font-bold mt-1" style={{ color: colors.onSurface }}>
                {tripTitle}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <Ionicons name="location-outline" size={14} color={colors.onSurfaceVariant} />
                <Text className="text-body-md font-medium" style={{ color: colors.onSurfaceVariant }}>
                  {tripDest} • {trip.duration} Days
                </Text>
              </View>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View className="py-20 justify-center items-center flex-col gap-4">
              <ActivityIndicator size="large" color="#C8922A" />
              <Text className="font-medium text-body-md text-center" style={{ color: colors.onSurfaceVariant }}>
                Analyzing trip details and generating matching accommodations...
              </Text>
            </View>
          )}

          {/* Error State */}
          {!isLoading && (recsError || !tripId) && (
            <View className="items-center justify-center py-16 px-6 text-center">
              <View className="w-16 h-16 mb-4 bg-tertiary-container rounded-full items-center justify-center">
                <Ionicons name="alert-circle-outline" size={32} color="#8F1301" />
              </View>
              <Text className="font-headline text-xl mb-2" style={{ color: colors.onSurface }}>
                Failed to load recommendations
              </Text>
              <Text className="font-body text-body-md mb-6" style={{ color: colors.onSurfaceVariant }}>
                We ran into an issue while retrieving custom hotel suggestions for this journey. Please try again.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="border border-pharaoh-gold px-6 py-2.5 rounded-full"
              >
                <Text className="text-pharaoh-gold font-semibold">Go Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recommendations Grid */}
          {!isLoading && !recsError && tripId && (
            <View className="flex-col gap-6">
              {recommendations.map((hotel) => {
                const isFav = favoriteHotels.some(h => h._id === hotel._id);
                const mockRating = (4.5 + (hotel.stars * 0.08)).toFixed(1);
                
                return (
                  <Card 
                    key={hotel._id} 
                    className="p-0 overflow-hidden border rounded-xl shadow-resting" 
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View className="relative h-72">
                      <Image source={{ uri: hotel.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }} className="w-full h-full" resizeMode="cover" />
                      {hotel.stars === 5 && (
                        <View className="absolute top-4 left-4 bg-pharaoh-gold px-3 py-1 rounded-full flex-row items-center gap-1 shadow-md">
                          <Ionicons name="sparkles" size={12} color="white" />
                          <Text className="text-white text-label-sm font-semibold uppercase tracking-wider">Rahal Choice</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => toggleFavorite(hotel)}
                        className="absolute top-4 right-4 p-2 rounded-full shadow-sm"
                        style={{ backgroundColor: isDark ? 'rgba(28, 26, 20, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
                      >
                        <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#BA1A1A" : colors.onSurfaceVariant} />
                      </TouchableOpacity>
                      <View className="absolute bottom-4 left-4 flex-row items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
                        <Ionicons name="star" size={14} color="#C8922A" />
                        <Text className="text-white font-bold text-label-sm">{mockRating}</Text>
                      </View>
                    </View>
                    <CardContent className="p-6">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                          <Text className="text-label-sm uppercase tracking-widest mb-1" style={{ color: colors.outline }}>
                            {getLocalizedValue(hotel.city)}, Egypt
                          </Text>
                          <Text className="font-headline text-headline-md-mobile leading-tight" style={{ color: colors.onSurface }}>
                            {getLocalizedValue(hotel.name)}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="font-headline text-headline-md-mobile text-pharaoh-gold" style={{ color: colors.pharaohGold }}>
                            {formatCurrency(hotel.averagePricePerNight, hotel.currency)}
                          </Text>
                          <Text className="text-xs" style={{ color: colors.outline }}>per night</Text>
                        </View>
                      </View>
                      
                      <Text className="font-body text-body-md mt-2 mb-4" style={{ color: colors.onSurfaceVariant }} numberOfLines={3}>
                        {getLocalizedValue(hotel.description) || "Enjoy a premium stay featuring classic design accents, direct city access, and world-class service."}
                      </Text>

                      {/* Amenities Chips */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <View className="flex-row flex-wrap gap-1.5 mb-6">
                          {hotel.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                            <Badge key={idx} className="bg-surface-container-high dark:bg-surface-variant px-2.5 py-1 rounded-md">
                              <Text className="text-[11px] font-medium" style={{ color: colors.onSurfaceVariant }}>
                                {amenity}
                              </Text>
                            </Badge>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <Badge className="bg-surface-container-high dark:bg-surface-variant px-2 py-1 rounded-md">
                              <Text className="text-[11px] font-medium" style={{ color: colors.onSurfaceVariant }}>
                                +{hotel.amenities.length - 4}
                              </Text>
                            </Badge>
                          )}
                        </View>
                      )}

                      <View className="flex-row gap-3">
                        <TouchableOpacity
                          onPress={() => router.push(`/hotel/${hotel.slug}`)}
                          className="flex-1 bg-pharaoh-gold py-3.5 rounded-full items-center active:scale-95"
                        >
                          <Text className="text-white font-label-md font-bold uppercase tracking-wider">Book Stay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(hotel)}
                          className="w-12 h-12 items-center justify-center border rounded-full active:scale-95"
                          style={{ borderColor: colors.outlineVariant + '66' }}
                        >
                          <Ionicons name={isFav ? "bookmark" : "bookmark-outline"} size={20} color="#C8922A" />
                        </TouchableOpacity>
                      </View>
                    </CardContent>
                  </Card>
                );
              })}

              {/* No results state */}
              {recommendations.length === 0 && (
                <View className="items-center justify-center py-16 px-6">
                  <Ionicons name="search-outline" size={48} color={colors.onSurfaceVariant} />
                  <Text className="font-headline text-headline-md-mobile mt-4 mb-2" style={{ color: colors.onSurface }}>
                    No Recommended Hotels
                  </Text>
                  <Text className="text-center font-body mb-6" style={{ color: colors.onSurfaceVariant }}>
                    We couldn't generate any hotel recommendations for this specific trip itinerary.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Heritage Divider */}
          {recommendations.length > 0 && (
            <View className="flex-row items-center gap-4 py-16">
              <View className="h-[1px] flex-1 bg-pharaoh-gold/20" />
              <View className="flex-row items-center gap-2">
                <Ionicons name="star-outline" size={14} color="#C8922A" />
                <Ionicons name="sparkles" size={20} color="#C8922A" />
                <Ionicons name="star-outline" size={14} color="#C8922A" />
              </View>
              <View className="h-[1px] flex-1 bg-pharaoh-gold/20" />
            </View>
          )}

        </View>
      </ScrollView>

      {/* Dropdown Menu Modal */}
      {isMenuOpen && (
        <View className="absolute inset-0 z-[100] flex-row">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <View 
            className="w-[75%] max-w-[300px] h-full shadow-2xl p-6 justify-between border-r"
            style={{ 
              backgroundColor: colors.surface, 
              borderColor: colors.outlineVariant + '33' 
            }}
          >
            <View>
              <View className="flex-row justify-between items-center mb-8 mt-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-10 h-10 rounded-full border flex items-center justify-center p-0.5" style={{ borderColor: '#C8922A' }}>
                    <Ionicons name="compass" size={20} color="#C8922A" />
                  </View>
                  <Text className="font-headline text-body-lg text-pharaoh-gold mt-0.5">Rahal</Text>
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View className="gap-1">
                {[
                  { label: t('common.nav.home', 'Home'), icon: 'home-outline', route: '/(tabs)' },
                  { label: t('common.nav.destinations', 'Explore'), icon: 'compass-outline', route: '/(tabs)/explore' },
                  { label: t('common.nav.hotels', 'Hotels'), icon: 'business-outline', route: '/(tabs)/hotel' },
                  { label: t('common.nav.planner', 'AI Planner'), icon: 'sparkles-outline', route: '/(tabs)/ai' },
                  { label: t('common.nav.trips', 'My Trips'), icon: 'map-outline', route: '/(tabs)/trips' },
                  { label: t('common.nav.profile', 'Profile'), icon: 'person-outline', route: '/(tabs)/profile' },
                ].map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setIsMenuOpen(false);
                      router.push(item.route as any);
                    }}
                    className="flex-row items-center gap-4 py-3.5 px-4 rounded-xl"
                    activeOpacity={0.7}
                  >
                    <Ionicons name={item.icon as any} size={20} color="#C8922A" />
                    <Text className="font-semibold text-label-md" style={{ color: colors.onSurface }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-6 pt-6 border-t" style={{ borderTopColor: colors.outlineVariant + '33' }}>
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-label-md" style={{ color: colors.onSurfaceVariant }}>{t('common.language', 'Language')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newLang = i18n.language === 'en' ? 'ar' : 'en';
                    i18n.changeLanguage(newLang);
                  }}
                  className="bg-pharaoh-gold/10 px-3 py-1 rounded-lg border border-pharaoh-gold/20"
                >
                  <Text className="text-pharaoh-gold font-bold text-label-sm">{i18n.language === 'en' ? 'العربية' : 'English'}</Text>
                </TouchableOpacity>
              </View>

              {/* Login / Logout Button */}
              {isAuthenticated ? (
                <TouchableOpacity
                  onPress={async () => {
                    setIsMenuOpen(false);
                    logout();
                    router.replace('/(onboarding)');
                  }}
                  className="w-full h-12 border border-tertiary rounded-full flex-row items-center justify-center gap-2"
                  style={{ borderColor: '#8F1301' }}
                >
                  <Ionicons name="log-out-outline" size={18} color="#8F1301" />
                  <Text className="text-tertiary text-label-md font-bold uppercase tracking-wider">
                    {t('common.nav.logout', 'Log Out')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setIsMenuOpen(false);
                    router.push('/(auth)/login');
                  }}
                  className="w-full h-12 bg-primary rounded-full flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text className="text-white text-label-md font-bold uppercase tracking-wider">
                    {t('common.nav.login', 'Log In')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
