// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Dimensions, StatusBar, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useDestinations } from '@/api/hooks/useDestinations';
import { useHotels } from '@/api/hooks/useHotels';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_DESTINATIONS = [
  {
    _id: 'aswan',
    name: { en: 'Aswan', ar: 'أسوان' },
    city: 'Aswan',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANr1ANULo_EwAz_MMCJkf3rMOajiOg2AeVAf9dTqXsYg0f26YJdj55tfWQ2kgdZl3K6aBnc5D0TQa-gQcpQz80jhdYKOqF1Rowa8s2K0zyQmrwQKMvQjZnuM0ndBIJ4--gcNDSH8uysZCjCbKZD9qEbKk5ztuy2gjNlXTzG7clPZSYAgvYJROFH8nWuCt2ohbo6o7Nqcp-RpOSk3_PyWlgmDNIoq0_IZiTLWU1HT2Grg6v_qJ7TXETKNB-k9gn9qwqfEO6GkS2PGI',
    slug: 'aswan',
  },
  {
    _id: 'luxor',
    name: { en: 'Luxor', ar: 'الأقصر' },
    city: 'Luxor',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALOlWtHsdN-Fp4Gg8lECqlPJ5aGlE1Xln-czs8_4NPJsosSKa0wIVx7Ux738huv12OjKZMq9arK1e6M9jgTvCsmZ-uJO3Bxay_bkA-wTRFvG-eSDNOD0PDvXY2I5FJ1L5VoWmU64Xfz5wxnkeRp_kqtCMmDBu2IShsvNzYh6E6NXQO1P1NSRF1TuGiuxkz7DSamPtycOoxKKHLO3KMZQXZfmcFkSwBzstXTSPRgcUV9WvtH6GcENyczVXRXZCbRWom9Et20tj3874',
    slug: 'luxor',
  },
  {
    _id: 'cairo',
    name: { en: 'Cairo', ar: 'القاهرة' },
    city: 'Cairo',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb1fQ6rmejgurol5zntOzMjyuPm5Ds3iIWFWdDna4BKZ7Of23wam3q6MbcMMylCvQ-ms8vLCr80akuFA3_CyOzBG5EXqbnv3R6RYtuvUjS4WPNeQ_3Cp8UoMxBHWYQcE5_Ip1FwZK12TN6zr68XnTC8krkJAq8tt1N2CHIofov-ifM1SG8_7dYJa7lrFufrIaYefduDdzt0QDs0FWxCgrPnP-NsZ9o6Z9CLyVXPDcHEVt2QJ7PcCBsb36jVgI-S9ac8xHZ7cb27Zw',
    slug: 'cairo',
  },
];

const MOCK_HOTELS = [
  {
    _id: '1',
    name: { en: 'Marriott Mena House', ar: 'ماريوت مينا هاوس' },
    city: 'Giza, Cairo',
    stars: 5.0,
    averagePricePerNight: 450,
    currency: 'USD',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvnq4LZkauJAcisv5B_6YKZoAgRdnXaLzQVqCPHKIxOPWMNy8tWVTIZIRvvw-uWvTg_mpmMssTkWOpG-ibNuQBhqUDwtETHm2v2jsSI5ByElpRE1aBq7qR7umGHE8yVfLX_VWs9x7OQ_7szIkfSWe3Pmr7azrTH-rvRTSP7nrz4LrGck0Tt_e13MTUDLjRpO-SbPNIGCZ2zu5hsokSTT6el4MDEd2gjzv8tGR-tLRVU4L65LjJ31OPZNV1qlifwE970X0fsTU5TSc',
    slug: 'marriott-mena-house',
  },
  {
    _id: '2',
    name: { en: 'Sofitel Old Cataract', ar: 'سوفيتيل أولد كتاركت' },
    city: 'Aswan',
    stars: 4.9,
    averagePricePerNight: 520,
    currency: 'USD',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtA6_ohJ_9Ay4Uv8uB9XqUW_LD96JqGGoNW2RlGi4LEXdONdYSaGqvSIErp0IB0mq_QL2jQ1jBauH9MusKukG_duIxcGkEyHlvkQgH_a903RjyEDPRuC2JI5edo5CVuRHJAtwk2sg5_meBO7RklnEUk1NIeSMR9OeDzyWs2t_vFRuJAmKBY05vqxNKc_1pnqDXH8T-TWL1HXnbaoCS-vPFRUyuMZuK-tpnHtzALVcWWJMTJQN-0gQPgyXWE3Pedipd2X_mklWczcg',
    slug: 'sofitel-old-cataract',
  },
  {
    _id: '3',
    name: { en: 'Four Seasons Resort', ar: 'منتجع فور سيزونز' },
    city: 'Sharm El Sheikh',
    stars: 5.0,
    averagePricePerNight: 680,
    currency: 'USD',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9t3T2FsoH71aXgSYw-ThQG3POJwf0xOubac8f2NmpzilPeNOjQM1VHl-sdjE33OOYvJrz-lUhKwhuyikRyLlj1VHz5d23IvFpIx1lR4VDBao_TuRAyaSrjJx2iNJwEad4XeChJYa3PQgnyGZs9omZ8xaLjgFPIayPIhOgGwLVgGHak4bHfFqXAC5jcsXSid9kq-746rFzYsqhpJxzLyVIaC1lwHlsA016Mf_BMXBYGCC9COxcZlpGkXhaABVZXfiuX7FzpS3f5JU',
    slug: 'four-seasons-resort',
  },
];

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();
  
  const { favoriteDestinations, toggleDestinationFavorite } = useFavoritesStore();
  const [appBarScrolled, setAppBarScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Backend API connection
  const { data: apiDestinationsResponse, isLoading: isLoadingDestinations } = useDestinations({ limit: 3 });
  const { data: apiHotelsResponse, isLoading: isLoadingHotels } = useHotels({ limit: 3 });

  const apiDestinations = apiDestinationsResponse?.pages.flatMap(p => p.data);
  const apiHotels = apiHotelsResponse?.pages.flatMap(p => p.data);

  // Use API data if available, fallback to beautiful mocks matching Stitch design
  const destinations = apiDestinations && apiDestinations.length > 0
    ? apiDestinations 
    : MOCK_DESTINATIONS;

  const hotels = apiHotels && apiHotels.length > 0 
    ? apiHotels 
    : MOCK_HOTELS;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset > 80) {
      if (!appBarScrolled) setAppBarScrolled(true);
    } else {
      if (appBarScrolled) setAppBarScrolled(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* TopAppBar Shell */}
      <View
        style={{ 
          paddingTop: (StatusBar.currentHeight || 40) + 4,
          backgroundColor: appBarScrolled 
            ? (isDark ? 'rgba(28, 26, 20, 0.95)' : 'rgba(252, 249, 244, 0.95)') 
            : 'transparent',
          borderBottomWidth: appBarScrolled ? 1 : 0,
          borderBottomColor: 'rgba(212, 196, 176, 0.3)'
        }}
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-6 pb-4 shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity activeOpacity={0.7} onPress={() => setIsMenuOpen(true)}>
            <Ionicons name="menu" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text className="font-headline text-display-lg-mobile text-pharaoh-gold tracking-tight mt-0.5">
            Rahal
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        className="flex-1"
      >
        {/* Tall Hero Section */}
        <View style={{ height: 600 }} className="w-full relative justify-end pb-20">
          <View className="absolute inset-0">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqymhyFoK0Xq6aTvYwXlYXvm5enfvqC2LLygoF4HqJcC6UO4Gt1qdoSUQPLL-6TZciSmvnAM0ifIEiK_M9LdqVnbzZvkTg5YRlAhAXerD6YyGo6oGszZKeQhfLThYjZTTvj12XMyTAvmbYCX9jqfTWU49xo4FiKCQryEFWpGV7vlXmYhwhjlYRNXqPeVAwJBPvLxA7SWXRTkgTvibwMHcqBJRjEOvw738CoV8SgXdaQGqXBL0UlLEQCKS0dN6PJCVWamkI1Vp7kBA',
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Soft gradient bottom overlay simulation */}
            <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20, 16, 8, 0.35)' }} />
            <View className="absolute bottom-0 left-0 right-0 h-[40%]" style={{ backgroundColor: 'rgba(20, 16, 8, 0.25)' }} />
          </View>

          {/* Hero Content */}
          <View className="items-center px-6 text-center z-10">
            <Text className="font-headline text-display-lg text-white text-center leading-tight mb-6 max-w-sm">
              {t('home.hero.title', 'Discover Egypt, Intelligently')}
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/ai')}
              activeOpacity={0.85}
              className="bg-pharaoh-gold px-8 py-3.5 rounded-full flex-row items-center gap-2.5 shadow-lg shadow-pharaoh-gold/20"
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text className="text-white text-label-md font-bold uppercase tracking-wider">
                {t('home.hero.ctaPrimary', 'Start AI Journey')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stat Chips Row */}
        <View className="px-6 -mt-10 z-30">
          <View className="flex-row flex-wrap justify-center gap-3">
            {/* Stat 1 */}
            <View className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant/20 rounded-xl flex-row items-center gap-3 px-5 py-3 shadow-sm">
              <Ionicons name="location-outline" size={18} color="#C8922A" />
              <Text className="text-label-md text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                {t('home.hero.statDestinations', '500+ Destinations')}
              </Text>
            </View>
            {/* Stat 2 */}
            <View className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant/20 rounded-xl flex-row items-center gap-3 px-5 py-3 shadow-sm">
              <Ionicons name="business-outline" size={18} color="#C8922A" />
              <Text className="text-label-md text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                {t('home.hero.statHotels', '1200+ Hotels')}
              </Text>
            </View>
            {/* Stat 3 */}
            <View className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant/20 rounded-xl flex-row items-center gap-3 px-5 py-3 shadow-sm">
              <MaterialIcons name="psychology" size={18} color="#C8922A" />
              <Text className="text-label-md text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                {t('home.hero.statEngine', 'AI-Powered')}
              </Text>
            </View>
          </View>
        </View>

        {/* Popular Destinations */}
        <View className="mt-12 px-6">
          <View className="flex-row justify-between items-end mb-6">
            <View className="flex-1 mr-3">
              <Text className="text-label-sm text-pharaoh-gold uppercase tracking-widest font-bold mb-1">
                {t('home.destinations.subtitle', "Editor's Choice")}
              </Text>
              <Text className="font-headline text-headline-md text-on-surface dark:text-dark-on-surface" numberOfLines={1}>
                {t('home.destinations.title', 'Popular Destinations')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} className="flex-row items-center gap-1 shrink-0 pb-0.5">
              <Text className="text-label-md text-pharaoh-gold font-bold">
                {t('home.destinations.cta', 'View All')}
              </Text>
              <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={14} color="#C8922A" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 -mx-6 px-6 pb-2">
            {destinations.map((dest: any) => (
              <TouchableOpacity
                key={dest._id}
                onPress={() => router.push(`/destination/${dest.slug}` as any)}
                activeOpacity={0.9}
                className="w-72 mr-4"
              >
                <View className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                  <Image
                    source={{ uri: dest.coverImage || dest.images?.[0] }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {/* Favorite Button */}
                  <TouchableOpacity
                    onPress={() => toggleDestinationFavorite(dest)}
                    activeOpacity={0.7}
                    className="absolute top-4 right-4 backdrop-blur-md p-2 rounded-full"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  >
                    <Ionicons 
                      name={favoriteDestinations.some(d => d._id === dest._id) ? "heart" : "heart-outline"} 
                      size={18} 
                      color={favoriteDestinations.some(d => d._id === dest._id) ? "#BA1A1A" : "#FFFFFF"} 
                    />
                  </TouchableOpacity>

                  {/* Gradient bottom text */}
                  <View className="absolute bottom-0 left-0 right-0 p-5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}>
                    <Text className="text-white font-headline text-headline-md-mobile">
                      {isRTL ? dest.name.ar : dest.name.en}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Feature Grid */}
        <View className="mt-12 bg-surface-container-low dark:bg-dark-surface-container-low px-6 py-10">
          <View className="items-center mb-8">
            <Text className="font-headline text-headline-md text-on-surface dark:text-dark-on-surface text-center mb-2">
              {t('home.features.title', 'Heritage Meets Intelligence')}
            </Text>
            <Text className="text-body-md text-on-surface-variant dark:text-dark-on-surface-variant text-center max-w-sm">
              {t('home.features.subtitle', 'Leverage our custom AI to curate an Egyptian experience tailored to your historical interests and luxury preferences.')}
            </Text>
          </View>

          <View className="gap-4">
            {/* Row 1 */}
            <View className="flex-row gap-4">
              {/* Feature 1 */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ai')}
                activeOpacity={0.8}
                className="flex-1 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/40 dark:border-dark-outline-variant/20 rounded-2xl p-5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-pharaoh-gold/10 p-2.5 rounded-lg">
                    <Ionicons name="calendar-outline" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-row items-center gap-1 bg-pharaoh-gold/10 px-2 py-0.5 rounded-full">
                    <Ionicons name="sparkles" size={10} color="#C8922A" />
                    <Text className="text-[10px] text-pharaoh-gold font-bold uppercase tracking-wider">Insight</Text>
                  </View>
                </View>
                <Text className="font-headline text-body-lg text-on-surface dark:text-dark-on-surface mb-1">
                  {t('home.features.f1Title', 'AI Trip Planner')}
                </Text>
                <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed mb-4">
                  {t('home.features.f1Desc', 'Personalized multi-city itineraries generated based on your pace and historical curiosity.')}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-auto">
                  <Text className="text-label-sm text-pharaoh-gold font-bold">Explore Plan</Text>
                  <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={12} color="#C8922A" />
                </View>
              </TouchableOpacity>

              {/* Feature 2 */}
              <TouchableOpacity
                onPress={() => router.push('/hotel')}
                activeOpacity={0.8}
                className="flex-1 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/40 dark:border-dark-outline-variant/20 rounded-2xl p-5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-pharaoh-gold/10 p-2.5 rounded-lg">
                    <Ionicons name="search-outline" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-row items-center gap-1 bg-pharaoh-gold/10 px-2 py-0.5 rounded-full">
                    <Ionicons name="sparkles" size={10} color="#C8922A" />
                    <Text className="text-[10px] text-pharaoh-gold font-bold uppercase tracking-wider">Insight</Text>
                  </View>
                </View>
                <Text className="font-headline text-body-lg text-on-surface dark:text-dark-on-surface mb-1">
                  {t('home.features.f2Title', 'Smart Hotel Search')}
                </Text>
                <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed mb-4">
                  {t('home.features.f2Desc', 'Find luxury stays near historic sites with AI-vetted views of the Nile or Pyramids.')}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-auto">
                  <Text className="text-label-sm text-pharaoh-gold font-bold">Start Search</Text>
                  <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={12} color="#C8922A" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-4">
              {/* Feature 3 */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ai')}
                activeOpacity={0.8}
                className="flex-1 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/40 dark:border-dark-outline-variant/20 rounded-2xl p-5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-pharaoh-gold/10 p-2.5 rounded-lg">
                    <Ionicons name="document-text-outline" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-row items-center gap-1 bg-pharaoh-gold/10 px-2 py-0.5 rounded-full">
                    <Ionicons name="sparkles" size={10} color="#C8922A" />
                    <Text className="text-[10px] text-pharaoh-gold font-bold uppercase tracking-wider">Insight</Text>
                  </View>
                </View>
                <Text className="font-headline text-body-lg text-on-surface dark:text-dark-on-surface mb-1">
                  {t('home.features.f3Title', 'Contextual Guide')}
                </Text>
                <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed mb-4">
                  {t('home.features.f3Desc', 'Point your camera at any monument to receive instant historical narrations in your language.')}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-auto">
                  <Text className="text-label-sm text-pharaoh-gold font-bold">Launch Guide</Text>
                  <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={12} color="#C8922A" />
                </View>
              </TouchableOpacity>

              {/* Feature 4 */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/ai')}
                activeOpacity={0.8}
                className="flex-1 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/40 dark:border-dark-outline-variant/20 rounded-2xl p-5 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="bg-pharaoh-gold/10 p-2.5 rounded-lg">
                    <Ionicons name="restaurant-outline" size={20} color="#C8922A" />
                  </View>
                  <View className="flex-row items-center gap-1 bg-pharaoh-gold/10 px-2 py-0.5 rounded-full">
                    <Ionicons name="sparkles" size={10} color="#C8922A" />
                    <Text className="text-[10px] text-pharaoh-gold font-bold uppercase tracking-wider">Insight</Text>
                  </View>
                </View>
                <Text className="font-headline text-body-lg text-on-surface dark:text-dark-on-surface mb-1">
                  {t('home.features.f4Title', 'Gastronomy AI')}
                </Text>
                <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed mb-4">
                  {t('home.features.f4Desc', 'Discover the finest Egyptian culinary spots from hidden street gems to fine dining.')}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-auto">
                  <Text className="text-label-sm text-pharaoh-gold font-bold">Find Dining</Text>
                  <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={12} color="#C8922A" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Curated Hotels */}
        <View className="mt-12 px-6">
          <View className="flex-row justify-between items-end mb-6">
            <View className="flex-1 mr-3">
              <Text className="text-label-sm text-pharaoh-gold uppercase tracking-widest font-bold mb-1">
                {t('home.hotels.subtitle', 'Exquisite Stays')}
              </Text>
              <Text className="font-headline text-headline-md text-on-surface dark:text-dark-on-surface" numberOfLines={1}>
                {t('home.hotels.title', 'Curated Hotels')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/hotel')} className="flex-row items-center gap-1 shrink-0 pb-0.5">
              <Text className="text-label-md text-pharaoh-gold font-bold">
                {t('common.seeAll', 'View Stays')}
              </Text>
              <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={14} color="#C8922A" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-6 -mx-6 px-6 pb-4">
            {hotels.map((hotel: any) => (
              <View
                key={hotel._id}
                style={{ width: 320 }}
                className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/30 dark:border-dark-outline-variant/20 rounded-2xl overflow-hidden shadow-sm mr-4"
              >
                {/* Hotel Image & Badge */}
                <View className="relative h-48 w-full bg-surface-container-low dark:bg-dark-surface-container-low">
                  <Image
                    source={{ uri: hotel.coverImage || hotel.images?.[0] }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute top-4 left-4 bg-pharaoh-gold px-3 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
                    <Ionicons name="star" size={10} color="#FFFFFF" />
                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                      {t('home.hotels.topPick', 'Rahal Choice')}
                    </Text>
                  </View>
                </View>

                {/* Hotel Info */}
                <View className="p-5">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-headline text-body-lg text-on-surface dark:text-dark-on-surface max-w-[200px]" numberOfLines={1}>
                      {isRTL ? hotel.name.ar : hotel.name.en}
                    </Text>
                    <View className="flex-row items-center gap-1 text-pharaoh-gold">
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Text className="text-label-md text-pharaoh-gold font-bold">
                        {hotel.stars.toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1 mb-4">
                    <Ionicons name="location-outline" size={14} color="#817565" />
                    <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                      {hotel.city}
                    </Text>
                  </View>

                  {/* Book Row */}
                  <View className="flex-row justify-between items-center pt-4 border-t border-outline-variant/40 dark:border-dark-outline-variant/20">
                    <Text className="text-label-sm text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                      <Text className="text-pharaoh-gold text-headline-md-mobile font-bold">
                        ${hotel.averagePricePerNight}
                      </Text>{' '}
                      / night
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push(`/hotel/${hotel.slug}` as any)}
                      activeOpacity={0.8}
                      className="bg-primary px-5 py-2.5 rounded-full"
                    >
                      <Text className="text-white text-label-sm font-bold uppercase tracking-wider">
                        {t('home.hotels.book', 'Book')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating AI Concierge FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/ai')}
        activeOpacity={0.85}
        className="absolute bottom-6 right-6 z-[60] bg-pharaoh-gold p-4 rounded-full shadow-2xl flex-row items-center gap-2"
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        <Text className="text-white text-label-md font-bold uppercase tracking-wide px-1">
          AI Concierge
        </Text>
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      {isMenuOpen && (
        <View className="absolute inset-0 z-[100] flex-row">
          {/* Backdrop */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsMenuOpen(false)}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          />
          
          {/* Menu Drawer Content */}
          <View 
            className="w-[75%] max-w-[300px] h-full shadow-2xl p-6 justify-between border-r"
            style={{ 
              backgroundColor: isDark ? '#1C1A14' : '#FFFFFF',
              borderColor: isDark ? 'rgba(80, 69, 54, 0.2)' : 'rgba(212, 196, 176, 0.3)'
            }}
          >
            <View>
              {/* Drawer Header */}
              <View className="flex-row justify-between items-center mb-8 mt-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-10 h-10 rounded-full border flex items-center justify-center p-0.5" style={{ borderColor: '#C8922A' }}>
                    <Ionicons name="compass" size={20} color="#C8922A" />
                  </View>
                  <Text className="font-headline text-body-lg text-pharaoh-gold mt-0.5">
                    Rahal
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <Ionicons name="close" size={24} color="#817565" />
                </TouchableOpacity>
              </View>

              {/* Navigation Items */}
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
                    <Text className="text-label-md font-medium" style={{ color: colors.onSurface }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bottom Section: Language & Logout */}
            <View className="gap-6 pt-6 border-t" style={{ borderTopColor: colors.outlineVariant + '33' }}>
              {/* Language Switcher */}
              <View className="flex-row justify-between items-center">
                <Text className="text-label-md font-medium" style={{ color: colors.onSurfaceVariant }}>
                  {t('common.language', 'Language')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const newLang = i18n.language === 'en' ? 'ar' : 'en';
                    i18n.changeLanguage(newLang);
                  }}
                  className="bg-pharaoh-gold/10 px-3.5 py-1.5 rounded-full border"
                  style={{ borderColor: 'rgba(200, 146, 42, 0.2)' }}
                >
                  <Text className="text-label-sm text-pharaoh-gold font-bold">
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </Text>
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