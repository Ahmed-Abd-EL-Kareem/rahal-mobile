// app/(tabs)/trips.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useTrips } from '@/api/hooks/useTrips';
import { useBookings, useCancelBooking } from '@/api/hooks/useBookings';
import { useTheme } from '@/hooks/useTheme';

export default function TripsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showToast } = useUIStore();
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'trips' | 'bookings'>('trips');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Backend queries
  const { data: tripsResponse, isLoading: tripsLoading } = useTrips();
  const { data: bookingsResponse, isLoading: bookingsLoading } = useBookings();
  const { mutateAsync: cancelBooking } = useCancelBooking();

  const isTripsTab = activeTab === 'trips';
  const isBookingsTab = activeTab === 'bookings';

  const trips = tripsResponse?.data || [];
  const bookings = bookingsResponse?.data || [];

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel this hotel booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              showToast({ type: 'success', message: 'Booking canceled successfully' });
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getLocalizedValue = (val: any): string => {
    const lang = i18n?.language || 'en';
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val['en'] || val['ar'] || Object.values(val)[0] || '';
    }
    return String(val);
  };

  if (!user) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background dark:bg-obsidian justify-center items-center p-6">
        <Image source={require('../../assets/logo-2.png')} style={{ width: 80, height: 80, marginBottom: 16 }} resizeMode="contain" />
        <Text className="text-3xl font-headline text-pharaoh-gold mb-2">Rahal</Text>
        <Text className="text-body-md text-on-surface-variant dark:text-outline text-center mb-8 px-6">
          Log in or sign up to view your custom AI itineraries, saved heritage journeys, and active bookings.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="w-full h-12 bg-pharaoh-gold rounded-full justify-center items-center shadow-md active:scale-95"
        >
          <Text className="text-white font-semibold uppercase tracking-wider text-label-md">
            Log In / Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLoading = isTripsTab ? tripsLoading : bookingsLoading;
  const hasItems = isTripsTab ? trips.length > 0 : bookings.length > 0;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.background }} className="flex-1 bg-background dark:bg-obsidian">
      {/* Top App Bar */}
      <View 
        className="h-16 flex-row justify-between items-center px-4 border-b bg-surface dark:bg-obsidian"
        style={{ borderBottomColor: colors.outlineVariant + '33', backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => setIsMenuOpen(true)} className="p-2 active:scale-95">
            <Ionicons name="menu-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text className="text-headline-md-mobile font-headline text-pharaoh-gold">Rahal</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} className="p-2 active:scale-95">
          <Ionicons name="sparkles-outline" size={22} color="#C8922A" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View className="px-4 mt-6 mb-4">
        <View className="bg-surface-container-low dark:bg-sand-dark p-1 rounded-full flex-row w-full border border-outline-variant/40">
          <TouchableOpacity
            onPress={() => setActiveTab('trips')}
            className="flex-1 py-2 rounded-full justify-center items-center"
            style={isTripsTab ? { backgroundColor: '#C8922A' } : null}
          >
            <Text 
              className="font-semibold text-label-md"
              style={{ color: isTripsTab ? '#FFFFFF' : (isDark ? '#9C8F7C' : '#4F4537') }}
            >
              My Trips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('bookings')}
            className="flex-1 py-2 rounded-full justify-center items-center"
            style={isBookingsTab ? { backgroundColor: '#C8922A' } : null}
          >
            <Text 
              className="font-semibold text-label-md"
              style={{ color: isBookingsTab ? '#FFFFFF' : (isDark ? '#9C8F7C' : '#4F4537') }}
            >
              My Bookings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C8922A" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 mt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Section Header */}
          {hasItems && isTripsTab && (
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-headline text-2xl text-on-surface dark:text-surface-bright">
                Upcoming Adventures
              </Text>
              <View className="bg-primary-fixed/20 px-3 py-1 rounded-full">
                <Text className="font-semibold text-[10px] text-pharaoh-gold uppercase tracking-widest">
                  {trips.length} Active
                </Text>
              </View>
            </View>
          )}

          {hasItems && isBookingsTab && (
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-headline text-2xl text-on-surface dark:text-surface-bright">
                Sanctuary Confirmations
              </Text>
              <View className="bg-primary-fixed/20 px-3 py-1 rounded-full">
                <Text className="font-semibold text-[10px] text-pharaoh-gold uppercase tracking-widest">
                  {bookings.length} Booked
                </Text>
              </View>
            </View>
          )}

          {/* Empty States */}
          {!hasItems ? (
            isTripsTab ? (
              /* Empty Trips State */
              <View className="bg-surface-container-low dark:bg-sand-dark border border-outline-variant/40 rounded-2xl py-12 px-6 items-center justify-center">
                <View className="w-16 h-16 rounded-full bg-pharaoh-gold/10 items-center justify-center mb-4">
                  <Ionicons name="map-outline" size={32} color="#C8922A" />
                </View>
                <Text className="font-headline text-xl text-on-surface dark:text-surface-bright mb-2 text-center">
                  No journeys planned yet
                </Text>
                <Text className="text-on-surface-variant dark:text-outline text-body-md text-center max-w-xs mb-6">
                  Curate custom AI itineraries, save historic routes, and experience Egypt's wonders.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/trip/generate')}
                  className="border border-pharaoh-gold px-6 py-2.5 rounded-full"
                >
                  <Text className="text-pharaoh-gold font-semibold text-label-md">Start Generating</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Empty Bookings State */
              <View className="bg-surface-container-low dark:bg-sand-dark border border-outline-variant/40 rounded-2xl py-12 px-6 items-center justify-center">
                <View className="w-16 h-16 rounded-full bg-pharaoh-gold/10 items-center justify-center mb-4">
                  <Ionicons name="ticket-outline" size={32} color="#C8922A" />
                </View>
                <Text className="font-headline text-xl text-on-surface dark:text-surface-bright mb-2 text-center">
                  No active bookings
                </Text>
                <Text className="text-on-surface-variant dark:text-outline text-body-md text-center max-w-xs mb-6">
                  Your flight and hotel confirmations will appear here once you finalize your trip itinerary.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/hotel')}
                  className="border border-pharaoh-gold px-6 py-2.5 rounded-full"
                >
                  <Text className="text-pharaoh-gold font-semibold text-label-md">Explore Hotels</Text>
                </TouchableOpacity>
              </View>
            )
          ) : isTripsTab ? (
            /* Trips Cards List */
            <View>
              {trips.map((trip) => {
                const titleStr = getLocalizedValue(trip.title);
                const destName = getLocalizedValue(trip.destination);
                const summaryStr = getLocalizedValue(trip.summary);
                
                // Fallback mockup images
                let fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuARIe1Irc1egWhAeo1yMgGjj-zcZlZY745Eaj0vGvh1gwmv_hl3ZGTe58oZmBXUoSmkrCNzMm_jbI28xFaMgm5PfHCyYBL_9jqQ8cv4RnQDjdsnvDNIaSNbCtEsMWhmrvL-KKerHo3HRawL1z8BpWuKl4Pq6a4HRdqtU20dgzXx-vAOpaMD3roxEgg4eYQ_8YMJB0WsPalfKPE3RaT-0DLqLjzB4EvWe2CgguG_8WVJNQifP6licVMdroz-lLRnI8mgzh0PSUiTYsA'; // Pyramid
                if (destName.toLowerCase().includes('siwa')) {
                  fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBncmVuplN334-gp3EBt17V4xEtMhYoJS0LxysOq1kKxE1afmkeELPgI98PU-OrF-ry5iUVd0wa_dvIZAhXbE28ci6JopPLsDJIM0U5bQRWizgSfUIX5zFp6BOLgug_jtBABJeXnuWaxUd6m0K0uHcuRwEUn4PNYz25S5LBWyDpx8L84F0wrUehE8ACi6LkjwPCZ37qso9x_V-JkajH0Xr5EXrbKwMho6GmGH23WQgLxS_0XMKEikkK6kQD-QqZhpBEAgJn5AAVpnQ'; // Oasis
                } else if (destName.toLowerCase().includes('sea') || destName.toLowerCase().includes('sharm')) {
                  fallbackImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBeofShuJOt2BztQ8jKf07wgVmy4q_ve7QSNwi_ug3ZEgeJf5ck1BEZHQ6Cfac83SqL2h8Y4ugi80FHeqX5p93na0GboTV-Wbfn--GS74thpcLdRYm0Lbf0_1mA6f0OQpD7RaI9PDNkDt1vp9Vt21NLlOQqg9MdJXALauNKKmpzSMhICCkjwOc6rIHtlzbFMVwGLuH0t04e_ehq1ZlfyIZzisgFdnz7x--GXEbc6jGy1g3ClkTcerm-gLpt_o3wqnmdLV7dXr8ORU'; // Reef
                }
                const imageUri = trip.imageUrl || fallbackImage;

                return (
                  <View
                    key={trip._id}
                    className="bg-surface-container-lowest dark:bg-sand-dark rounded-xl overflow-hidden shadow-sm border border-outline-variant/40 mb-6"
                  >
                    <View className="relative h-56 w-full">
                      <Image source={{ uri: imageUri }} className="w-full h-full object-cover" />
                      
                      {/* Top Badges */}
                      <View className="absolute top-4 left-4 bg-pharaoh-gold/90 backdrop-blur-md px-3 py-1 rounded-full flex-row items-center gap-1 shadow-lg">
                        <Ionicons name="sparkles" size={12} color="white" />
                        <Text className="text-white font-bold text-[9px] uppercase tracking-wider">
                          {trip.isAIGenerated ? 'AI OPTIMIZED' : 'HERITAGE'}
                        </Text>
                      </View>

                      {/* Estimated Price Badge */}
                      <View className="absolute bottom-4 right-4 bg-white/90 dark:bg-obsidian/95 backdrop-blur-md px-3 py-1 rounded-lg border border-pharaoh-gold/20 shadow-sm">
                        <Text className="text-primary dark:text-primary-fixed font-bold text-label-sm">
                          ${trip.estimatedTotalCost || '2,450'}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="p-5">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="font-headline text-headline-md-mobile text-on-surface dark:text-dark-on-surface flex-1 pr-2">
                          {titleStr}
                        </Text>
                        <TouchableOpacity className="p-1">
                          <Ionicons name="ellipsis-vertical" size={18} color="#817565" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text className="text-on-surface-variant dark:text-outline text-body-md mb-4 flex-row items-center gap-1">
                        <Ionicons name="location-outline" size={14} color="#817565" />
                        <Text className="ml-1 text-on-surface-variant dark:text-dark-on-surface-variant">{destName}</Text>
                      </Text>

                      <Text className="text-on-surface-variant dark:text-outline text-body-md mb-4 leading-relaxed" numberOfLines={2}>
                        {summaryStr || `Explore the beautiful heritage, luxury stays, and memorable local tours in ${destName}.`}
                      </Text>

                      <View className="flex-row items-center gap-4 border-t border-outline-variant/20 pt-4">
                        <View className="flex-row items-center gap-1 text-on-surface-variant dark:text-outline">
                          <Ionicons name="calendar-outline" size={14} color="#817565" />
                          <Text className="font-semibold text-label-sm ml-1 text-on-surface-variant dark:text-dark-on-surface-variant">{trip.duration} Days</Text>
                        </View>
                        <View className="flex-row items-center gap-1 text-on-surface-variant dark:text-outline">
                          <Ionicons name="people-outline" size={14} color="#817565" />
                          <Text className="font-semibold text-label-sm ml-1 text-on-surface-variant dark:text-dark-on-surface-variant">{trip.travelers} Travelers</Text>
                        </View>

                        <View className="flex-1 flex-row justify-end items-center gap-3">
                          <TouchableOpacity
                            onPress={() => router.push({
                              pathname: '/ai-hotel-recommendations',
                              params: { tripId: trip._id }
                            })}
                            className="flex-row items-center gap-1 bg-pharaoh-gold/10 dark:bg-pharaoh-gold/20 px-3 py-1.5 rounded-full active:scale-95"
                          >
                            <Ionicons name="sparkles" size={12} color="#C8922A" />
                            <Text className="text-pharaoh-gold font-bold text-[11px] uppercase tracking-wider">AI Hotels</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => router.push(`/trip/${trip._id}`)}
                            className="flex-row items-center gap-0.5 active:scale-95"
                          >
                            <Text className="text-pharaoh-gold font-bold text-label-sm">Details</Text>
                            <Ionicons name="chevron-forward" size={14} color="#C8922A" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            /* Bookings Cards List */
            <View className="gap-4">
              {bookings.map((booking) => {
                const hotelName = booking.hotel?.name ? getLocalizedValue(booking.hotel.name) : 'Luxury Nile Sanctuary';
                const statusColorMap = {
                  confirmed: { text: 'text-success', bg: 'bg-success/15' },
                  pending: { text: 'text-pharaoh-gold', bg: 'bg-pharaoh-gold/15' },
                  canceled: { text: 'text-error', bg: 'bg-error/15' },
                  completed: { text: 'text-on-surface-variant', bg: 'bg-surface-variant/20' },
                };
                const statusTheme = statusColorMap[booking.status] || statusColorMap.pending;

                return (
                  <View
                    key={booking._id}
                    className="bg-surface-container-lowest dark:bg-sand-dark rounded-xl overflow-hidden border border-outline-variant/40 p-5 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 pr-2">
                        <Text className="text-lg font-headline text-primary dark:text-primary-fixed mb-1" numberOfLines={1}>
                          {hotelName}
                        </Text>
                        <Text className="text-xs text-on-surface-variant dark:text-outline">
                          {booking.hotel?.city || 'Cairo, Egypt'}
                        </Text>
                      </View>
                      <View className={`px-2.5 py-1 rounded-full ${statusTheme.bg}`}>
                        <Text className={`font-bold text-[9px] uppercase tracking-wider ${statusTheme.text}`}>
                          {booking.status}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-y-2 mb-4 border-t border-b border-outline-variant/10 py-3">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-on-surface-variant dark:text-outline">Check In</Text>
                        <Text className="text-xs font-semibold text-on-surface dark:text-dark-on-surface">{formatDate(booking.checkIn)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-on-surface-variant dark:text-outline">Check Out</Text>
                        <Text className="text-xs font-semibold text-on-surface dark:text-dark-on-surface">{formatDate(booking.checkOut)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-on-surface-variant dark:text-outline">Rooms & Guests</Text>
                        <Text className="text-xs font-semibold text-on-surface dark:text-dark-on-surface">
                          {booking.rooms} Room(s) • {booking.guests} Guest(s)
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-[10px] text-on-surface-variant dark:text-outline uppercase tracking-wider">Total Price</Text>
                        <Text className="text-lg font-bold text-primary dark:text-primary-fixed mt-0.5">
                          ${booking.totalPrice} {booking.currency}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center gap-3">
                        {booking.status !== 'canceled' && booking.status !== 'completed' && (
                          <TouchableOpacity
                            onPress={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 border border-error/45 rounded-full active:scale-95"
                          >
                            <Text className="text-error font-semibold text-xs">Cancel</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => router.push(`/booking/${booking._id}`)}
                          className="px-5 py-2 bg-nile-blue rounded-full active:scale-95"
                        >
                          <Text className="text-white font-semibold text-xs">Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Action Button - Generate New Trip */}
      {isTripsTab && (
        <TouchableOpacity
          onPress={() => router.push('/trip/generate')}
          style={{ bottom: 84 }}
          className="absolute right-6 bg-pharaoh-gold flex-row items-center gap-2 px-5 py-3 rounded-full shadow-lg shadow-pharaoh-gold/30 active:scale-90 z-40"
        >
          <Ionicons name="sparkles" size={16} color="white" />
          <Text className="text-white font-bold text-label-md">Generate New Trip</Text>
        </TouchableOpacity>
      )}

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