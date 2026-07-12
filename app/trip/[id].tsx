// app/trip/[id].tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '@/api/hooks/useTrips';
import { formatCurrency } from '@/utils';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';

export default function TripDetailScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();
  const { data: tripResponse, isLoading, error } = useTrip(params.id);
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default to Day 1 expanded
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const lang = i18n?.language || 'en';

  const getLocalizedValue = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val['en'] || val['ar'] || Object.values(val)[0] || '';
    }
    return String(val);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#C8922A" />
      </SafeAreaView>
    );
  }

  if (error || !tripResponse || !tripResponse.data) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={64} color="#8F1301" />
        <Text className="text-xl font-headline text-on-surface dark:text-dark-on-surface mt-4 mb-2">Trip Not Found</Text>
        <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-center mb-6">
          We couldn't retrieve the details for this journey. It may have been deleted.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="border border-pharaoh-gold px-6 py-2.5 rounded-full"
        >
          <Text className="text-pharaoh-gold font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const trip = tripResponse.data;
  const destName = getLocalizedValue(trip.destination);
  const titleStr = getLocalizedValue(trip.title);
  const summaryStr = getLocalizedValue(trip.summary);

  const handleHotelRecommendation = () => {
    router.push({
      pathname: '/ai-hotel-recommendations',
      params: { tripId: trip._id }
    });
  };

  const getBudgetLabel = (b: string) => {
    switch (b) {
      case 'budget': return 'Budget';
      case 'mid-range': return 'Mid-Range Budget';
      case 'luxury': return 'Luxury Experience';
      default: return b;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View className="relative h-[380px] w-full overflow-hidden">
          <Image
            source={{ uri: trip.imageUrl || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Menu button */}
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          >
            <Ionicons name="menu-outline" size={24} color="white" />
          </TouchableOpacity>

          <View className="absolute bottom-6 left-4 right-4 flex-col gap-2">
            <View className="self-start bg-pharaoh-gold/20 border border-pharaoh-gold/30 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-pharaoh-gold uppercase tracking-wider">
                Historical Journey
              </Text>
            </View>
            <Text className="font-headline text-3xl text-white leading-tight">
              {titleStr}
            </Text>
            <View className="flex-row flex-wrap gap-4 mt-2">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={14} color="#C8922A" />
                <Text className="text-white/90 text-[13px] font-medium">{trip.duration} Days</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="card-outline" size={14} color="#C8922A" />
                <Text className="text-white/90 text-[13px] font-medium">{getBudgetLabel(trip.budget)}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="people-outline" size={14} color="#C8922A" />
                <Text className="text-white/90 text-[13px] font-medium">{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full gap-6">
          {/* Summary / Description */}
          <View className="mb-4">
            <Text className="font-headline text-2xl text-on-surface dark:text-dark-on-surface mb-2">About this journey</Text>
            <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-body-md leading-relaxed">{summaryStr}</Text>
          </View>

          {/* Pro Heritage Tips Card */}
          <View className="border-2 border-outline-variant/30 dark:border-outline-variant/20 rounded-2xl p-[3px] bg-surface-container-low dark:bg-sand-dark mb-2">
            <View className="border border-pharaoh-gold/40 dark:border-pharaoh-gold/20 rounded-xl p-5 bg-surface-container-low dark:bg-sand-dark flex-col gap-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="sparkles" size={18} color="#C8922A" />
                <Text className="text-pharaoh-gold font-bold uppercase tracking-wider text-xs">Pro Heritage Tips</Text>
              </View>
              <View className="flex-col gap-3">
                <View className="flex-row items-start gap-2.5">
                  <Ionicons name="book-outline" size={16} color="#C8922A" style={{ marginTop: 2 }} />
                  <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-body-md flex-1">
                    Purchase the 'Cairo Pass' for unlimited entry to major sites over 5 days; it pays for itself by Day 3.
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <Ionicons name="sunny-outline" size={16} color="#C8922A" style={{ marginTop: 2 }} />
                  <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-body-md flex-1">
                    Arrive at Giza plateau at 8:00 AM sharp to beat the tour bus crowds and heat.
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <Ionicons name="wallet-outline" size={16} color="#C8922A" style={{ marginTop: 2 }} />
                  <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-body-md flex-1">
                    Always carry small change (EGP) for tipping 'Baksheesh' and minor site services.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline / Itinerary Title */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-headline text-2xl text-on-surface dark:text-dark-on-surface">Your Itinerary</Text>
            <View className="h-[1px] flex-1 ml-4 bg-outline-variant/30" />
          </View>

          {/* Itinerary Timeline */}
          <View className="flex-col pl-4 border-l-2 border-pharaoh-gold/20">
            {trip.days?.map((day, index) => {
              const isExpanded = expandedDay === day.day;
              return (
                <View key={day.day} className="mb-6 relative">
                  {/* Timeline dot */}
                  <View 
                    style={{ left: -27 }}
                    className={`absolute top-1 w-4 h-4 rounded-full border border-background items-center justify-center ${
                      isExpanded ? 'bg-pharaoh-gold' : 'bg-outline-variant'
                    }`} 
                  />

                  {/* Day Header Trigger */}
                  <TouchableOpacity
                    onPress={() => setExpandedDay(isExpanded ? null : day.day)}
                    className="flex-row justify-between items-start"
                  >
                    <View className="flex-col flex-1 mr-2">
                      <Text className="text-pharaoh-gold text-[11px] font-bold uppercase tracking-wider">
                        Day {day.day}
                      </Text>
                      <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface mt-0.5">
                        {getLocalizedValue(day.title)}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={isDark ? '#9C8F7C' : '#817565'} 
                    />
                  </TouchableOpacity>

                  {/* Expanded Day content */}
                  {isExpanded && (
                    <View className="mt-4 flex-col gap-4">
                      {/* Activities */}
                      <View className="flex-col gap-2.5">
                        {day.activities?.map((activity, i) => (
                          <View key={i} className="bg-surface-container-low dark:bg-sand-dark p-4 rounded-xl border border-outline-variant/20 dark:border-outline-variant/10 flex-row gap-3">
                            <View className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center">
                              <Ionicons name={i === 0 ? 'compass-outline' : 'flag-outline'} size={20} color="#1B4B6E" />
                            </View>
                            <View className="flex-1 flex-col justify-center">
                              <Text className="text-on-surface dark:text-dark-on-surface text-body-md font-semibold">{getLocalizedValue(activity)}</Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Meals & Extra info */}
                      <View className="flex-row flex-wrap gap-2 items-center">
                        {day.meals?.map((meal, i) => (
                          <View key={i} className="bg-papyrus-green/10 px-3 py-1 rounded-full flex-row items-center gap-1.5 border border-papyrus-green/30">
                            <Ionicons name="restaurant-outline" size={12} color="#2D7A4F" />
                            <Text className="text-papyrus-green text-xs font-semibold uppercase">{getLocalizedValue(meal)}</Text>
                          </View>
                        ))}
                        <View className="bg-pharaoh-gold/10 px-3 py-1 rounded-full flex-row items-center gap-1.5 border border-pharaoh-gold/30 ml-auto">
                          <Text className="text-pharaoh-gold text-xs font-bold">
                            Cost: {formatCurrency(day.estimatedCost, trip.currency)}
                          </Text>
                        </View>
                      </View>

                      {/* Accommodations */}
                      {day.accommodation && (
                        <View className="flex-row items-center gap-2 mt-1 bg-surface-container/60 dark:bg-sand-dark/60 p-3 rounded-lg border border-outline-variant/20 dark:border-outline-variant/10">
                          <Ionicons name="bed-outline" size={16} color={isDark ? '#9C8F7C' : '#817565'} />
                          <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-[13px]">
                            Stay: <Text className="font-semibold text-on-surface dark:text-dark-on-surface">{getLocalizedValue(day.accommodation)}</Text>
                          </Text>
                        </View>
                      )}

                      {/* Day specific Pro Tips */}
                      {day.tips && (
                        <View className="bg-pharaoh-gold/5 dark:bg-pharaoh-gold/10 p-4 rounded-xl border border-pharaoh-gold/20 dark:border-pharaoh-gold/30 flex-row gap-2">
                          <Ionicons name="bulb-outline" size={18} color="#C8922A" style={{ marginTop: 2 }} />
                          <Text className="text-on-surface-variant dark:text-dark-on-surface-variant text-[13px] leading-relaxed flex-1">
                            {getLocalizedValue(day.tips)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Destination Mini Map Summary */}
          <View className="rounded-2xl overflow-hidden bg-surface-container-high dark:bg-sand-dark h-60 relative border border-outline-variant/40 mt-6 shadow-sm">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1570108356363-237584d7d9b2?w=800' }} 
              className="w-full h-full absolute inset-0"
              resizeMode="cover" 
            />
            <View className="absolute inset-0 bg-pharaoh-gold/10 mix-blend-multiply" />
            <View 
              className="absolute bottom-4 left-4 right-4 backdrop-blur-md p-4 rounded-xl flex-row items-center justify-between shadow-md"
              style={{ backgroundColor: colors.surface + 'E6' }}
            >
              <View className="flex-col">
                <Text className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant font-medium">Route Summary</Text>
                <Text className="font-headline text-lg text-on-surface dark:text-dark-on-surface font-bold mt-0.5">{destName} Loop</Text>
              </View>
              <View className="bg-pharaoh-gold w-10 h-10 rounded-full shadow-md items-center justify-center">
                <Ionicons name="map-outline" size={18} color="white" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Floating Action Area */}
      <View className="absolute bottom-0 left-0 w-full p-4 items-center bg-transparent pointer-events-none">
        <TouchableOpacity
          onPress={handleHotelRecommendation}
          className="pointer-events-auto bg-pharaoh-gold rounded-full px-8 py-4 flex-row items-center justify-center gap-2 shadow-2xl"
        >
          <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 2 }} />
          <Text className="text-white font-label-md font-bold uppercase tracking-wider text-[13px]">
            AI Hotel Recommendation
          </Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>

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
    </SafeAreaView>
  );
}