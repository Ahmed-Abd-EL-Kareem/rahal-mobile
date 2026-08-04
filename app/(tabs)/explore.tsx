// app/(tabs)/explore.tsx
import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge } from '@/components/ui/Badge';
import { useDestinations } from '@/api/hooks/useDestinations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { SideMenu } from '@/components/layout/SideMenu';

// Premium high-res mock data from the Stitch Design System
const MOCK_DESTINATIONS = [
  {
    _id: 'giza-plateau',
    slug: 'giza-plateau',
    name: { en: 'Giza Plateau', ar: 'هضبة الجيزة' },
    city: 'Greater Cairo',
    region: 'Lower Egypt',
    category: 'historical',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPuyYXDbr5R2vOfdkDgl-wDXtfZK9xqSK1ASWmMdIFJdO1_MGFup4l4adtjtulUHijIYAIwd1nBUMs0hOBWtZAIus5fNknxFXjctUvA-eBENUDA3F_2n8-Uqp5HwFpryt_ml7J3ib6tzBNXQz_0JHm1c8sFTrZEik30tp5pAkNheacrXSE-GtQ5mplI6BVGf6-ltw7P9Km4kvYnnf_eJ_TgP9Oc7AegFvBn3WWbudExAeJB8aUfLnPM85IvLrhYd7qU3cdPf-EPg',
    rating: 4.9,
    reviews: 12400,
    averageBudgetPerDay: 360,
    priceTier: '$$$',
    hours: 'Open • 8:00 AM'
  },
  {
    _id: 'karnak-temple',
    slug: 'karnak-temple',
    name: { en: 'Karnak Temple', ar: 'معبد الكرنك' },
    city: 'Luxor',
    region: 'Upper Egypt',
    category: 'historical',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSXxARC93PkNghfuJmstz-C_vLEpjaRdV7lzyDaHOq-wRjLTGhZzdEJQ56yGo19PkWTMUWgwhjpcdqBR6MqlcF-HL4Rg91NaD_wsJ25exVcohGd6KlXfGehpKMcXjXLLhgcqddG6SaLn20avDvDmgN2xyyLCZhR_ZBmuA9hwBcgEevduCWOVNpikU0cPlgp6AN_yBqPD4gzgK1WPUds9yx9JZa9r-fPTqAec6jqHW2enoH3NOW60ROYR70pTUIIGZiQOj5PWTB1Xo',
    rating: 4.8,
    reviews: 8900,
    averageBudgetPerDay: 280,
    priceTier: '$$',
    hours: 'Open • 6:00 AM'
  },
  {
    _id: 'siwa-oasis',
    slug: 'siwa-oasis',
    name: { en: 'Siwa Oasis', ar: 'واحة سيوة' },
    city: 'Western Desert',
    region: 'Western Desert',
    category: 'nature',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoG_e997vVTXBMgBJkg-QWi2WX68sU6py3UO81fXGKezB9e7WVNwsJtfH7TR_J1EYHTXX53cgsnVeXgjwgCGRNtLUvSxMy71SqzctSKTBrTIztAltkYBGSQAKRzI4notbl0ZeaBj1TM3FBPpjicZGAhuSMsb0d5zNDI41j5Jx5UsKYQ0SxsqMY6_CJNrvPXlA0whoK83LU1lYaTkLND_3nBW8jN75EyfkwQxjQILEM2hAWd5X19dEFC0mXCEiyXU-cFzWAtNCV8fM',
    rating: 4.9,
    reviews: 2100,
    averageBudgetPerDay: 290,
    priceTier: '$$$',
    hours: 'Open 24h'
  },
  {
    _id: 'philae-temple',
    slug: 'philae-temple',
    name: { en: 'Philae Temple', ar: 'معبد فيلة' },
    city: 'Aswan',
    region: 'Upper Egypt',
    category: 'historical',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhymBtzeKPEOrs6AAmI3XBtBc5fInfcTTr0-forav23c5Vg3FAMMrsMya1TP5LS4iJo-6i4_qTcXqZ5vPoEeVcFQzzH0MML51YyitmxgRgQ-t5spA9IxtPsJthC3qdoONLASRls8lIvTCZ2fHy-tUNnDTg3h957pHxtSOlQZPXvQkmAQCFyKjiY2Z-Zq6B2U33o6rwl-z7K6NIyWHY7BklieP8xeJuPsfjmUDL8-fATIXGhoRs0UhFlpxAol25skQbt5LA_a7CU9w',
    rating: 4.8,
    reviews: 4300,
    averageBudgetPerDay: 250,
    priceTier: '$$',
    hours: 'Open • 7:00 AM'
  }
];

export default function ExploreScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();

  const { favoriteDestinations, toggleDestinationFavorite } = useFavoritesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'near_me' | 'landmarks' | 'pyramids' | 'temples' | 'museums' | 'oases' | 'all'>('near_me');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch destinations from the API
  const { data: apiDestinationsResponse, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useDestinations({
    limit: 12,
  });

  const apiDestinations = useMemo(() => {
    return apiDestinationsResponse?.pages.flatMap(p => p.data) || [];
  }, [apiDestinationsResponse]);

  // Categories list translation keys and filters
  const categoryTabs = [
    { id: 'near_me', label: t('destinationsListing.nearMe') || 'Near Me', icon: 'near-me' },
    { id: 'landmarks', label: 'Landmarks' },
    { id: 'pyramids', label: 'Pyramids' },
    { id: 'temples', label: 'Temples' },
    { id: 'museums', label: 'Museums' },
    { id: 'oases', label: 'Oases' },
    { id: 'all', label: 'All' },
  ];

  // Resolve destinations to display: API data, or fallback to Stitch mocks
  const rawDestinations = useMemo(() => {
    if (apiDestinations && apiDestinations.length > 0) {
      return apiDestinations;
    }
    return MOCK_DESTINATIONS;
  }, [apiDestinations]);

  // Filter destinations based on search query and category tab selections
  const filteredDestinations = useMemo(() => {
    return rawDestinations.filter((dest) => {
      // 1. Search Query Filter
      const locale = i18n.language === 'ar' ? 'ar' : 'en';
      const nameText = dest.name[locale]?.toLowerCase() || '';
      const cityText = dest.city?.toLowerCase() || '';
      const regionText = dest.region?.toLowerCase() || '';
      
      const matchesSearch = 
        nameText.includes(searchQuery.toLowerCase()) ||
        cityText.includes(searchQuery.toLowerCase()) ||
        regionText.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Tab Filter mapping to category & name
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'near_me') return true; // Near Me displays all surrounding list in this layout
      
      if (selectedFilter === 'landmarks') {
        return dest.category === 'landmark' || dest.category === 'historical' || nameText.includes('landmark') || nameText.includes('plateau');
      }
      if (selectedFilter === 'pyramids') {
        return nameText.includes('pyramid') || nameText.includes('هرم') || dest.category === 'landmark';
      }
      if (selectedFilter === 'temples') {
        return nameText.includes('temple') || nameText.includes('معبد') || dest.category === 'historical';
      }
      if (selectedFilter === 'museums') {
        return nameText.includes('museum') || nameText.includes('متحف') || dest.category === 'cultural';
      }
      if (selectedFilter === 'oases') {
        return nameText.includes('oasis') || nameText.includes('واحة') || dest.category === 'nature';
      }

      return true;
    });
  }, [rawDestinations, searchQuery, selectedFilter, i18n.language]);

  const handleFavoritePress = (dest: any) => {
    toggleDestinationFavorite(dest);
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      {/* TopAppBar */}
      <View 
        className="flex-row justify-between items-center px-4 border-b"
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View className="flex-row items-center gap-4 flex-1 mr-2">
          <TouchableOpacity 
            onPress={() => setIsMenuOpen(true)}
            className="active:scale-95 p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={24} color="#C8922A" />
          </TouchableOpacity>
          <Text 
            className="font-headline text-2xl text-pharaoh-gold font-bold leading-tight flex-shrink-1" 
            numberOfLines={1}
          >
            Rahal
          </Text>
        </View>
        <TouchableOpacity className="active:scale-95 p-1" activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#C8922A" />
        </TouchableOpacity>
      </View>

      {/* Main Content Canvas */}
      <FlatList
        data={filteredDestinations}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          /* Search and Filter Section */
          <View className="p-4 flex-col gap-4">
            <View className="flex-row gap-3 items-center">
              <View 
                className="flex-1 flex-row items-center h-14 px-4 rounded-xl border"
                style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
              >
                <Ionicons name="search-outline" size={20} color="#817565" style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 h-full text-body-md text-left"
                  style={{ color: colors.onSurface }}
                  placeholder={t('destinationsListing.searchPlaceholder') || 'Search ancient wonders...'}
                  placeholderTextColor={isDark ? '#9C8F7C' : '#81756580'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                className="h-14 w-14 items-center justify-center rounded-xl border active:bg-surface-container"
                style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
              >
                <Ionicons name="options-outline" size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Category Tabs Scroll */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingBottom: 4 }}
              style={{ marginHorizontal: -4 }}
            >
              {categoryTabs.map((tab) => {
                const isActive = selectedFilter === tab.id;
                
                if (tab.id === 'near_me') {
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setSelectedFilter('near_me')}
                      activeOpacity={0.8}
                      className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full shadow-md shadow-pharaoh-gold/20 active:scale-95 ${
                        isActive ? 'bg-pharaoh-gold' : 'bg-surface-container border border-outline-variant/40'
                      }`}
                    >
                      <Ionicons name="navigate-outline" size={16} color={isActive ? '#FFFFFF' : '#C8922A'} />
                      <Text className={`text-label-md font-medium ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedFilter(tab.id as any)}
                    activeOpacity={0.8}
                    className={`px-5 py-2.5 rounded-full border active:scale-95 ${
                      isActive 
                        ? 'bg-pharaoh-gold border-pharaoh-gold' 
                        : 'bg-surface-container border-outline-variant/40'
                    }`}
                  >
                    <Text className={`text-label-md font-medium ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item: dest }) => {
          const locale = i18n.language === 'ar' ? 'ar' : 'en';
          const name = dest.name[locale] || dest.name['en'];
          const priceTier = (dest as any).priceTier || (dest.averageBudgetPerDay > 300 ? '$$$' : '$$');
          const rating = (dest as any).rating || 4.8;
          const reviews = (dest as any).reviews || 1200;
          const hours = (dest as any).hours || 'Open • 8:00 AM';

          return (
            <View className="px-4">
              <TouchableOpacity 
                key={dest._id} 
                activeOpacity={0.9}
                onPress={() => router.push(`/destination/${dest.slug || dest._id}`)}
                className="rounded-xl overflow-hidden shadow-resting border active:scale-[0.99]"
                style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33', marginVertical: 8 }}
              >
                {/* Image Container */}
                <View className="relative h-60 w-full bg-surface-container">
                  <Image 
                    source={{ uri: dest.coverImage }} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Top Overlays */}
                  <View className="absolute top-4 right-4 z-10">
                    <TouchableOpacity 
                      onPress={() => handleFavoritePress(dest)}
                      activeOpacity={0.7}
                      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md items-center justify-center active:scale-110"
                    >
                      <Ionicons 
                        name={favoriteDestinations.some(d => d._id === dest._id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color="#BA1A1A" 
                      />
                    </TouchableOpacity>
                  </View>
                  {/* Bottom Overlays */}
                  <View className="absolute bottom-3 left-3 bg-obsidian/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
                    <Text className="text-white font-label-sm text-[12px]">
                      {priceTier}
                    </Text>
                  </View>
                  {/* Rating Overlay */}
                  <View className="absolute bottom-3 right-3 bg-obsidian/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#C8922A" />
                    <Text className="text-white font-label-sm text-[12px]">
                      {rating} ({reviews})
                    </Text>
                  </View>
                </View>

                {/* Content Details */}
                <View className="p-5">
                  <Text className="font-headline text-xl text-on-surface dark:text-dark-on-surface font-semibold mb-1 text-left">
                    {name}
                  </Text>
                  <View className="flex-row items-center gap-1 mb-4">
                    <Ionicons name="location-outline" size={14} color="#817565" />
                    <Text className="text-outline dark:text-dark-outline text-label-md text-left">
                      {dest.city}, {dest.region}
                    </Text>
                  </View>

                  <View className="pt-4 border-t border-outline-variant/20 flex-row justify-between items-center">
                    <Text className="text-papyrus-green font-label-md font-semibold">
                      {hours}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#C8922A" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="py-12 items-center justify-center">
            <Ionicons name="search-outline" size={48} color="#9C8F7C" />
            <Text className="text-on-surface-variant text-body-md mt-4 text-center">
              {t('destinationsListing.noDestinations') || 'No destinations found matching your filters.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View>
            {isFetchingNextPage && (
              <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: 20 }} />
            )}
            {/* Ask Rahal AI Banner */}
            <View className="mx-4 mt-4 mb-8">
              <View 
                className="relative w-full rounded-2xl border p-6 flex-col gap-4"
                style={{ backgroundColor: isDark ? colors.surfaceContainerLow : 'rgba(200, 146, 42, 0.1)', borderColor: colors.primary + '4d' }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="sparkles" size={18} color="#C8922A" />
                  <Text className="font-label-md text-pharaoh-gold font-bold uppercase tracking-widest">
                    AI Concierge
                  </Text>
                </View>
                <View className="flex-col gap-1">
                  <Text className="font-headline text-[20px] text-on-surface dark:text-dark-on-surface font-bold text-left">
                    Curious about the Pharaohs?
                  </Text>
                  <Text className="text-on-surface-variant dark:text-dark-on-surface-variant font-body-md leading-snug text-left">
                    Get instant insights, hidden history, and personalized route planning for your next heritage adventure.
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/ai')}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-center gap-2.5 px-6 py-3.5 bg-pharaoh-gold rounded-full shadow-lg shadow-pharaoh-gold/20 active:scale-95"
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                  <Text className="text-white font-label-md font-bold">
                    Ask Rahal AI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      {/* Floating Action Button (FAB) for AI Concierge */}
      <View className="absolute bottom-6 right-6 z-50">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/ai')}
          activeOpacity={0.8}
          className="w-14 h-14 rounded-full bg-pharaoh-gold shadow-2xl items-center justify-center active:scale-90"
          style={{
            shadowColor: '#C8922A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Modal */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}