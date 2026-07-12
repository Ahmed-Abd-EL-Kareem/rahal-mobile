// app/destination/[slug].tsx
import React, { useState, useRef, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDestination } from '@/api/hooks/useDestinations';
import { useNearbyHotels } from '@/api/hooks/useHotels';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '@/store/favoritesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_ICONS: Record<string, string> = {
  historical: 'library-outline',
  beach: 'water-outline',
  adventure: 'flash-outline',
  cultural: 'musical-notes-outline',
  religious: 'book-outline',
  nature: 'leaf-outline',
  landmark: 'location-outline',
};

// Giza Pyramids Custom Bento Highlights Images
const GIZA_HIGHLIGHTS = [
  {
    title: { en: 'The Great Sphinx', ar: 'أبو الهول' },
    desc: { en: "The mythical guardian with the head of a king and a lion's body.", ar: 'الحارس الأسطوري ذو رأس الملك وجسد الأسد.' },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdBK9WZmFZHFLipbty4Hhlsn9AQ8Iib5ASGS7qGZxB_lhKfUM6I-sis7pgApHKRwgEW6e2ZmhHd32Bd82SxyojJ_Bt-EXKOC5r8HSzR_2g-PQa35_hwzBBOPTrA0OcMagGSuvYcWmaeM-NqdWkHVsmQwHebswtYAxZ_PZ8sa9dB0zF44V4wKq9tnfESI03F5r4bzM--T2YY1tN9Eop72txI6MFED9SHXk5_bthxMqUBaGcV7arHes-GTbDP-ib8Wwin-6r-rV7ryQ',
    large: true
  },
  {
    title: { en: "Khufu's Interior", ar: 'داخل هرم خوفو' },
    desc: { en: 'Ascend inside the Great Pyramid grand gallery.', ar: 'الصعود داخل الممر العظيم للهرم الأكبر.' },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBg093JmljnhTXpAE33WIvrqdeFzSJHzJ5F7fjFQbKFkkEyFk3aG7T0XWjXVe7hGplTtzHT2KadDrGEOuf7DD24UFQDHcO2T0mYm75XloA4hC6MAx-7jfK_TF00ibhuUSfk2EIPpLTMOTH4WH4fja_Oa1z4h29oJ5uHT5C4GTyNbd0IuQ0hRd7KTefDU1LyRGFMhsP99D-2Axk74ZQIdJZ_khKK7fL7jDLiidxlEHQW_4Ka4xq3edE1LzyO79ztcviTsH6biS2qKg',
    large: false
  },
  {
    title: { en: 'Panoramic Viewpoint', ar: 'المطل البانورامي' },
    desc: { en: 'Witness all three major pyramids lined up.', ar: 'شاهد الأهرامات الثلاثة الكبرى مصطفة معاً.' },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB40UiTYVS7yTUqjBC1jhsey52FHRMajx0_FM_pADoIRQg-mpxxBFMoJJttmFdA0mj2YJ979mxPI-JshxvAaR1ynx6ayta-rMjHE11vdFKuDHOAb4mdiWanEIf9TwhkHm7jEYtmLj-qN7p8S4FkDuexCVDHXXYdlnf3MUttsP_QJTvRbtvWNixkMmtSbhVHYMwmEir6yp1WRUZDkROSzR9lQ8V2rGyO0JpFaVek6EhPwy3GBJ1sy9x5R4xR1_pGuPRKd-zAnONC3BA',
    large: false
  },
  {
    title: { en: 'Sound & Light Show', ar: 'عرض الصوت والضوء' },
    desc: { en: 'Nightly dramatic historical narration.', ar: 'سرد تاريخي درامي ليلي.' },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlUPmylyiIAYM2D4pw9_OqtKshGrsJFlu9yHCDKqUS3eVy3Z7G8KWM2MJaj_PvgnU5pDw_5nPTHNr-oczIK-Y6Y6oYH327PABw4q9htjBcgT3hdoT65ehsitx6eyv1u632AaJRa49KiJC7e2ufsr2xjkzIxZrKMRwYwUjIswFVySQoY-QBp1Omxe0tpBhRX9pL_E43vW25r-dUJVo4Vrw2t5DEn5Vy1V2sG4_3qoCYI01cGyToxKLC73ILbFhvU7h3ymaVve_sHzQ',
    large: true
  }
];

// Luxury stays fallback matching Stitch design
const FALLBACK_HOTELS = [
  {
    name: 'Marriott Mena House',
    desc: 'Historic luxury at the foot of the pyramids.',
    stars: 5.0,
    price: 450,
    currency: 'USD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX7FJ1L5QxYHyPNAIIzfH7qskN01A-ECY2lvC4JseRT0NufXQDi_KZ53nW00UhGhhRwdl5jCBkh_XcIg3_naX8EZLBkFl47NnQ7kKw0-3JGA37Lwc_CLLnTw4nzDMN0Pez1xhnaMalluvw142N7kPhkYPZp5MZ_A8Ux2t1EqlwUbFNkl0CK2NQGk0_VEXqgRw4WBQ4_KRT6DBZoJWvBnwkFK_p8KOQRw7SFSECz8kqSKk6g4eRvrk-wCZktUnadVUNXM6Gqdvgsi4'
  },
  {
    name: 'Steigenberger Pyramids',
    desc: 'Modern comfort with panoramic plateau views.',
    stars: 4.5,
    price: 320,
    currency: 'USD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDbhLFMKEJ8lFlagrDAWHtx4zqA1XzYc3vNJsoRDqIW07EKKbCrUfb1fVr2GhxvRxD1aMia30v-342BtFyFjUljbwymZyCcvFcPStlzBorsAcdkWB_s5ruxevdj724LMl-rZXH-ytapWDfRAuSbxygB2gihXEJmwl_fdh0iryxKuqUQGY-LMWU0xV2RB48U02cMXU3V8XuyAwUkFsFgjZOeBkXd2x0ai3OPgPH-sLTB40aiTtCcyJUSphkwM5GJbDD7xWoilSV5a4'
  }
];

const MONTHS_ORDER = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'];

export default function DestinationDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ slug: string }>();
  const locale = (i18n.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  const insets = useSafeAreaInsets();

  const { data: destination, isLoading, error } = useDestination(params.slug);

  const scrollRef = useRef<ScrollView>(null);
  const contentParentY = useRef(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'best-time' | 'hotels'>('overview');
  
  // Section Layout positions for scrolling
  const sectionPositions = useRef<Record<string, number>>({});

  const d = destination?.data;

  const { favoriteDestinations, toggleDestinationFavorite } = useFavoritesStore();
  const isFavorite = d ? favoriteDestinations.some(item => item._id === d._id) : false;

  // Fetch nearby hotels dynamically if destination location is loaded
  const lng = d?.location?.coordinates[0] || 0;
  const lat = d?.location?.coordinates[1] || 0;
  const { data: nearbyHotelsData } = useNearbyHotels(lng, lat, 15, 3);

  const nearbyHotels = useMemo(() => {
    if (nearbyHotelsData?.data && nearbyHotelsData.data.length > 0) {
      return nearbyHotelsData.data.map(h => ({
        name: h.name[locale] || h.name['en'],
        desc: h.description?.[locale] || h.description?.['en'] || 'Premium sanctuary near this wonder.',
        stars: h.stars || 4.5,
        price: h.averagePricePerNight,
        currency: h.currency || 'USD',
        image: h.coverImage
      }));
    }
    return FALLBACK_HOTELS;
  }, [nearbyHotelsData, d, locale]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ paddingTop: insets.top }}>
        <Ionicons name="hourglass-outline" size={48} color="#C8922A" className="animate-spin" />
        <Text className="text-on-surface-variant font-label-md mt-4">Consulting the Stars...</Text>
      </View>
    );
  }

  if (error || !d) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Ionicons name="alert-circle-outline" size={64} color="#817565" />
        <Text className="text-2xl font-headline text-on-surface mt-4 mb-2">{t('destinationDetail.destinationNotFound')}</Text>
        <Text className="text-body-md text-on-surface-variant text-center mb-6">{t('destinationDetail.destinationNotFoundDesc')}</Text>
        <Button variant="outline" onPress={() => router.push('/(tabs)/explore')}>
          {t('destinationDetail.returnToDestinations')}
        </Button>
      </View>
    );
  }

  const name = d.name[locale] || d.name['en'];
  const description = d.description[locale] || d.description['en'];
  const eraText = d.slug.includes('giza') ? '2580 – 2560 BC' : d.slug.includes('luxor') ? '1400 BC' : 'Ancient Heritage';

  const scrollToSection = (sectionId: string) => {
    const yPos = sectionPositions.current[sectionId];
    if (yPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yPos + contentParentY.current - 60, animated: true });
      setActiveTab(sectionId as any);
    }
  };

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    // Highlight correct tab based on current scroll position
    const parentY = contentParentY.current;
    const overviewY = (sectionPositions.current['overview'] || 0) + parentY;
    const attractionsY = (sectionPositions.current['attractions'] || 500) + parentY;
    const bestTimeY = (sectionPositions.current['best-time'] || 1000) + parentY;
    const hotelsY = (sectionPositions.current['hotels'] || 1400) + parentY;

    if (yOffset >= hotelsY - 100) {
      setActiveTab('hotels');
    } else if (yOffset >= bestTimeY - 100) {
      setActiveTab('best-time');
    } else if (yOffset >= attractionsY - 100) {
      setActiveTab('attractions');
    } else {
      setActiveTab('overview');
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Section */}
        <View className="relative h-[480px] w-full overflow-hidden">
          <Image
            source={{ uri: d.coverImage }}
            className="w-full h-full object-cover"
          />
          {/* Hero Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-background" />

          {/* Overlays Buttons */}
          <View 
            className="absolute left-4 right-4 flex-row justify-between items-center z-10"
            style={{ top: insets.top > 0 ? insets.top + 8 : 16 }}
          >
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/explore')}
              className="w-11 h-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 active:scale-95"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => d && toggleDestinationFavorite(d)}
              className="w-11 h-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 active:scale-95"
            >
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#BA1A1A" : "white"} />
            </TouchableOpacity>
          </View>

          {/* Title and Category info inside Hero bottom */}
          <View className="absolute bottom-8 left-6 right-6">
            <Text className="font-label-md text-pharaoh-gold uppercase tracking-widest mb-1.5 text-left">
              {d.region ? t(`destinationsListing.${d.region}`) : 'EGYPT'}
            </Text>
            <Text className="font-headline text-3xl font-bold leading-snug text-left" style={{ color: colors.onSurface }}>
              {name}
            </Text>
          </View>
        </View>

        {/* Sticky Sub-Nav */}
        <View 
          className="border-b py-3 px-6 flex-row gap-6 justify-start items-center"
          style={{ backgroundColor: colors.surface + 'E6', borderBottomColor: colors.outlineVariant + '33' }}
        >
          <TouchableOpacity onPress={() => scrollToSection('overview')}>
            <Text 
              className="font-label-md font-semibold pb-1"
              style={{
                color: activeTab === 'overview' ? colors.pharaohGold : colors.onSurfaceVariant,
                borderBottomColor: activeTab === 'overview' ? colors.pharaohGold : 'transparent',
                borderBottomWidth: activeTab === 'overview' ? 2 : 0
              }}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('attractions')}>
            <Text 
              className="font-label-md font-semibold pb-1"
              style={{
                color: activeTab === 'attractions' ? colors.pharaohGold : colors.onSurfaceVariant,
                borderBottomColor: activeTab === 'attractions' ? colors.pharaohGold : 'transparent',
                borderBottomWidth: activeTab === 'attractions' ? 2 : 0
              }}
            >
              Attractions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('best-time')}>
            <Text 
              className="font-label-md font-semibold pb-1"
              style={{
                color: activeTab === 'best-time' ? colors.pharaohGold : colors.onSurfaceVariant,
                borderBottomColor: activeTab === 'best-time' ? colors.pharaohGold : 'transparent',
                borderBottomWidth: activeTab === 'best-time' ? 2 : 0
              }}
            >
              Best Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToSection('hotels')}>
            <Text 
              className="font-label-md font-semibold pb-1"
              style={{
                color: activeTab === 'hotels' ? colors.pharaohGold : colors.onSurfaceVariant,
                borderBottomColor: activeTab === 'hotels' ? colors.pharaohGold : 'transparent',
                borderBottomWidth: activeTab === 'hotels' ? 2 : 0
              }}
            >
              Hotels
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content sections */}
        <View 
          onLayout={(event) => {
            contentParentY.current = event.nativeEvent.layout.y;
          }}
          className="p-6 flex-col gap-12"
        >
          
          {/* Overview Section */}
          <View 
            onLayout={(event) => {
              sectionPositions.current['overview'] = event.nativeEvent.layout.y;
            }}
            className="flex-col gap-6"
          >
            <Text className="font-headline text-2xl font-bold text-left" style={{ color: colors.onSurface }}>
              The Last Standing Ancient Wonder
            </Text>
            <Text className="font-body text-body-lg leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
              {description}
            </Text>

            {/* Overview Pills */}
            <View className="flex-row flex-wrap gap-2.5 pt-2">
              <View 
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border"
                style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant + '4D' }}
              >
                <Ionicons name="time-outline" size={14} color="#C8922A" />
                <Text className="font-label-md text-[13px]" style={{ color: colors.onSurfaceVariant }}>{eraText}</Text>
              </View>
              <View 
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border"
                style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant + '4D' }}
              >
                <Ionicons name="location-outline" size={14} color="#C8922A" />
                <Text className="font-label-md text-[13px]" style={{ color: colors.onSurfaceVariant }}>{d.city}</Text>
              </View>
              <View 
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full border"
                style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant + '4D' }}
              >
                <Ionicons name="ribbon-outline" size={14} color="#C8922A" />
                <Text className="font-label-md text-[13px]" style={{ color: colors.onSurfaceVariant }}>UNESCO Heritage</Text>
              </View>
            </View>

            {/* AI Insight Callout */}
            <View 
              className="relative p-6 rounded-2xl border mt-4 overflow-hidden"
              style={{ backgroundColor: isDark ? colors.surfaceContainerLow : 'rgba(27,75,110,0.06)', borderColor: isDark ? colors.outlineVariant + '40' : 'rgba(27,75,110,0.2)' }}
            >
              <View className="absolute top-4 right-4 opacity-10">
                <Ionicons name="sparkles" size={36} color={colors.primary} />
              </View>
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: colors.secondary }}>
                  <Ionicons name="sparkles" size={16} color="white" />
                </View>
                <Text className="font-label-md font-bold tracking-wider" style={{ color: colors.secondary }}>
                  RAHAL AI INSIGHT
                </Text>
              </View>
              <Text className="font-headline text-lg font-bold mb-2 text-left" style={{ color: colors.secondary }}>
                Plan for Sunset, Not Noon
              </Text>
              <Text className="font-body text-body-md leading-snug text-left" style={{ color: colors.onSurfaceVariant }}>
                Based on current crowd patterns and lighting conditions, we recommend visiting the Plateau around 3:30 PM. The "Golden Hour" illuminates the limestone blocks perfectly for photography, and the thermal temperature drops significantly.
              </Text>
            </View>
          </View>

          {/* Papyrus Divider */}
          <View className="flex-row items-center gap-4 py-2">
            <View className="h-[1px] flex-1 bg-outline-variant/40" />
            <View className="border border-pharaoh-gold p-1.5 rounded-sm relative">
              <View className="border border-pharaoh-gold/50 p-1">
                <Ionicons name="compass-outline" size={16} color="#C8922A" />
              </View>
            </View>
            <View className="h-[1px] flex-1 bg-outline-variant/40" />
          </View>

          {/* Attractions Section */}
          <View 
            onLayout={(event) => {
              sectionPositions.current['attractions'] = event.nativeEvent.layout.y;
            }}
            className="flex-col gap-6"
          >
            <View>
              <Text className="font-headline text-2xl font-bold text-left" style={{ color: colors.onSurface }}>
                Plateau Highlights
              </Text>
              <Text className="font-body-md text-left" style={{ color: colors.onSurfaceVariant }}>
                Must-see landmarks within the complex.
              </Text>
            </View>

            {/* Highlights Grid Layout (Bento Style) */}
            <View className="flex-col gap-4">
              {d.slug.includes('giza') ? (
                // Custom Giza Bento highlight cards
                GIZA_HIGHLIGHTS.map((item, i) => (
                  <View 
                    key={i} 
                    className="rounded-2xl overflow-hidden border shadow-resting"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33', marginVertical: 8 }}
                  >
                    <View className={`relative ${item.large ? 'h-64' : 'h-48'}`}>
                      <Image source={{ uri: item.image }} className="w-full h-full object-cover" />
                      <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent justify-end p-5">
                        <Text className="font-headline text-xl text-white font-semibold mb-1 text-left">
                          {item.title[locale] || item.title['en']}
                        </Text>
                        <Text className="font-body text-body-md text-white/80 leading-snug text-left" numberOfLines={2}>
                          {item.desc[locale] || item.desc['en']}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                // Dynamic listing for other destinations
                d.attractions.map((attraction, i) => {
                  const attName = attraction.name[locale] || attraction.name['en'];
                  return (
                    <View 
                      key={i} 
                      className="rounded-2xl p-5 border shadow-resting flex-row justify-between items-center"
                      style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33', marginVertical: 8 }}
                    >
                      <View className="flex-1 flex-col gap-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-headline text-lg font-semibold text-left" style={{ color: colors.onSurface }}>{attName}</Text>
                          <Badge variant="blue" size="sm">{t(`destinationsListing.${attraction.type}`)}</Badge>
                        </View>
                        <Text className="text-body-md text-left" style={{ color: colors.onSurfaceVariant }}>
                          Entry fee: {attraction.entryFee > 0 ? `${attraction.entryFee} EGP` : 'Free'}
                        </Text>
                      </View>
                      <TouchableOpacity className="p-2 rounded-full bg-pharaoh-gold/10">
                        <Ionicons name="chevron-forward" size={16} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Best Time Section */}
          <View 
            onLayout={(event) => {
              sectionPositions.current['best-time'] = event.nativeEvent.layout.y;
            }}
            className="flex-col gap-6"
          >
            <Text className="font-headline text-2xl font-bold text-left" style={{ color: colors.onSurface }}>
              When to Visit
            </Text>
            <View 
              className="p-6 rounded-2xl border flex-col gap-5"
              style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
            >
              <View className="flex-col gap-2">
                <Text className="font-label-md text-pharaoh-gold font-bold uppercase tracking-widest text-left">
                  Weather & Peak
                </Text>
                <Text className="font-body-md leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
                  Winter offers the most pleasant temperatures, while summer provides smaller crowds for a more personal experience.
                </Text>
              </View>

              {/* Months Grid mapping */}
              <View className="flex-row flex-wrap gap-2 pt-2">
                {MONTHS_ORDER.map((m) => {
                  const isPeak = d.bestMonths.includes(m.toLowerCase()) || ['OCT', 'NOV', 'DEC', 'JAN', 'FEB'].includes(m);
                  const isMild = ['MAR', 'APR'].includes(m);

                  let bgStyle = { backgroundColor: colors.surfaceContainerHighest, opacity: 0.4 };
                  let textColor = colors.onSurfaceVariant;
                  let badgeText = 'Hot';

                  if (isPeak) {
                    bgStyle = { backgroundColor: colors.pharaohGold, opacity: 1 };
                    textColor = '#FFFFFF';
                    badgeText = 'Peak';
                  } else if (isMild) {
                    bgStyle = { backgroundColor: colors.surfaceContainerHighest, opacity: 1 };
                    textColor = colors.onSurfaceVariant;
                    badgeText = 'Mild';
                  }

                  return (
                    <View 
                      key={m} 
                      className="px-4 py-2.5 rounded-xl flex-col items-center justify-center" 
                      style={[{ width: (SCREEN_WIDTH - 84) / 4 }, bgStyle]}
                    >
                      <Text className="font-label-md font-bold text-center" style={{ color: textColor }}>{m}</Text>
                      <Text className="text-[9px] font-semibold uppercase text-center mt-0.5 opacity-85" style={{ color: textColor }}>{badgeText}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Hotels Section */}
          <View 
            onLayout={(event) => {
              sectionPositions.current['hotels'] = event.nativeEvent.layout.y;
            }}
            className="flex-col gap-6"
          >
            <Text className="font-headline text-2xl font-bold text-left" style={{ color: colors.onSurface }}>
              Stay with a View
            </Text>

            <View className="flex-col gap-4">
              {nearbyHotels.map((hotel, i) => (
                <TouchableOpacity 
                  key={i} 
                  className="flex-row gap-4 p-4 rounded-xl border shadow-resting items-center"
                  style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33', marginVertical: 8 }}
                >
                  <View className="w-24 h-24 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: colors.surfaceContainer }}>
                    <Image source={{ uri: hotel.image }} className="w-full h-full object-cover" />
                  </View>
                  <View className="flex-1 space-y-2 py-0.5">
                    <View>
                      <Text className="font-headline text-base font-bold text-left" style={{ color: colors.onSurface }} numberOfLines={1}>
                        {hotel.name}
                      </Text>
                      <Text className="font-body-md text-sm text-left leading-tight mt-0.5" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
                        {hotel.desc}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => {
                          const fillStar = starIndex < Math.floor(hotel.stars);
                          return (
                            <Ionicons
                              key={starIndex}
                              name={fillStar ? 'star' : 'star-outline'}
                              size={12}
                              color="#C8922A"
                            />
                          );
                        })}
                        <Text className="text-xs ml-1 font-semibold" style={{ color: colors.onSurfaceVariant }}>{hotel.stars.toFixed(1)}</Text>
                      </View>
                      <Text className="text-pharaoh-gold text-label-md font-bold">
                        ${hotel.price}/night
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky CTA */}
      <View 
        className="absolute bottom-0 left-0 w-full z-50 border-t px-4 pt-4 shadow-raised flex-row items-center justify-between gap-4"
        style={{ backgroundColor: colors.surface + 'F2', borderTopColor: colors.outlineVariant + '33', paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }}
      >
        <View className="hidden sm:block">
          <Text className="font-label-sm" style={{ color: colors.onSurfaceVariant }}>Entrance Fee from</Text>
          <Text className="font-headline text-lg font-bold" style={{ color: colors.onSurface }}>
            $25.00 <Text className="font-body text-xs font-normal" style={{ color: colors.onSurfaceVariant }}>/ person</Text>
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/trip/generate')}
          className="flex-1 flex-row h-14 rounded-full bg-pharaoh-gold items-center justify-center gap-2.5 shadow-lg shadow-pharaoh-gold/25 active:scale-95"
        >
          <Ionicons name="compass-outline" size={18} color="white" />
          <Text className="text-white font-label-md font-bold">
            Plan a Trip Here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}