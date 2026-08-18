// app/hotel/[id].tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useHotel } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_GALLERY = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2wyoZW5TlbKXeslol3H5vjYDZpVSfY25ucMAEMSP9XQtWxLZKKPT9fMKQU5YPPnXNhSrxRt5j7hen1vEtFUVVjPeSS9-Up8w01G3tGS62lyR2jFic1EBQy2GbIAoIDtO8oKzwkczMoeAj5Sd64pXQ6JaaF3k0YigYJbFCbGrY8DJfTAQML6tj7RWHd2-WiyA9C7GUZzvvTmZNkxmqYfLtAYZQaKSkYBui9lYPpPJPAzdrfI7Xm82uCzeP8yZLS8_bkejtE_sJ15A',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGWW7q2KI0HeMvSrn8VVvjuXBp0HVXElKPtG90iQ9Z4TfdSaRZd59GpuhqXf_OOIPp59iJd-Am4yV0TgICwCYKg0e5qoGEtoCD5Cv9MBri6wG7nE10Wu3JIzdPOZ-ZqRf1Gv6VyarwdIIKIzJra-kKwlx_ldcT8OWxQb3vjseQdXatvf-ROJQgFP9Q3s7jmW1XZX6OZVe3J5CAl4ot9V8eGnsIKTzRy_OqU6ev4YeeFJVo4g9_O6tfIYUnPJmT924s-YQRKecwxhQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDfxMvhtRx57EOT6I7otwHv2sc4Z04jXBF2OLzdh-fYcTmDXMMQ1Id6Lm_3-gXSFFDc0R8NU8XaaT_nLkJxwiaKuW5yRwbQDczd9nA_nZMup-EwOYX78gEmPiBhAuHDkPjda55GNhlf-ZD2RlF4dkEv353xvwTFimgWAW3c1kc14jek7nal2MCpXYw_IPvoK6pXtbfaz6pTaPR__BG7wYkBuAgD9PUk88lXnMye_oiYrMKQvCiD5vGQmMwc0EUUcvZX_6Dj31ZXnd0',
];

const MOCK_ROOM_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDjrb4iZr-6qHrdhX-sdmEGZzVzpqs5Ybsl10E1DRLhsRJ803aDUx3tDvzD0TGFNbAKliBAadfh8uqfP07W-0GNAHqavoQjl7jMDxWcxBWM8Ox87AQJHMmiNzorKED43e2ot8fs9xkhf1PFwileJVz9zTPR8n_WDQN5oK4FY8FWuDGgvdCVTXhiwekbENgBFlSlrYRBd0UMS4XvK0cQA8X1eCRYUPMlCg1ET0kXkFk3kX2yI4J4PNweRWVt0X1V3wh-N-6uXacCV-g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIM8SwLyQLD3TRxX0metmn5DhxnVdXsjKoRBRAkrh1xt5-Ev4yQ7HFyAZObc1F65OKlbT0bBTkOx9xIG8RfTn2X2sCcbMaFCMfa5GGrz8gMJqbB14-QHzrAyR4kw6aUBb-m4zAMBG-gpVjhXVkjLfa3yjlsM1ob63NyPv-91rsfqalo6omeYWW-LEaRPigSj-mYXi36LYX0yn8yZ7uqJWG8F-neJ5GLFJ4QiLmzReZz890s8Xq4_EBiX0PoNE8oud632H2Jz6enPA',
];

const DEFAULT_ROOMS = [
  { type: 'Nile Vista Suite', capacity: 2, pricePerNight: 320, description: 'Panoramic river view with private balcony and marble bath' },
  { type: 'Temple Deluxe Twin', capacity: 3, pricePerNight: 210, description: 'Spacious royal twin beds with artisan Egyptian cotton' },
  { type: 'Royal Pharaoh Suite', capacity: 4, pricePerNight: 480, description: 'Ultra-luxury suite with dedicated butler and private sun deck' }
];

export default function HotelDetailScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark, isRTL } = useTheme();

  const { data: hotelResponse, isLoading, error } = useHotel(params.id || '');
  const hotel = hotelResponse?.data;

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef<ScrollView>(null);

  const { favoriteHotels, toggleHotelFavorite } = useFavoritesStore();
  const isFavorite = hotel ? favoriteHotels.some(item => item._id === hotel._id) : false;

  // Real or fallback rooms
  const roomsList = (hotel?.rooms && hotel.rooms.length > 0) ? hotel.rooms : DEFAULT_ROOMS;

  useEffect(() => {
    if (roomsList.length > 0 && !selectedRoom) {
      setSelectedRoom(roomsList[0]);
    }
  }, [roomsList]);

  const handleBook = () => {
    if (!selectedRoom) {
      Alert.alert(t('hotelDetail.selectRoom', 'Select Room'), t('hotelDetail.missingRoomAlert', 'Please select a sanctuary room before booking.'));
      return;
    }

    router.push({
      pathname: '/booking/flow',
      params: {
        hotelId: hotel?._id || params.id || '',
        roomType: selectedRoom.type || selectedRoom.name || 'Sanctuary Suite',
        pricePerNight: String(selectedRoom.pricePerNight || hotel?.averagePricePerNight || 320),
        checkIn: '2026-09-01',
        checkOut: '2026-09-04',
        guests: String(selectedRoom.capacity || 2),
        rooms: '1',
      }
    });
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setActiveImageIndex(index);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#C8922A" />
      </View>
    );
  }

  // Localized content
  const hotelName = (hotel?.name && typeof hotel.name === 'object')
    ? (hotel.name[i18n.language === 'ar' ? 'ar' : 'en'] || hotel.name.en || '')
    : (hotel?.name || 'Heritage Sanctuary Resort');

  const hotelDescription = (hotel?.description && typeof hotel.description === 'object')
    ? (hotel.description[i18n.language === 'ar' ? 'ar' : 'en'] || hotel.description.en || '')
    : (hotel?.description || (i18n.language === 'ar' 
        ? 'يقع هذا الملاذ الفاخر على ضفاف النيل الساحرة، موفراً تجربة ضيافة ملكية تمزج بين عراقة التاريخ المصري وأحدث وسائل الراحة العالمية.' 
        : 'Nestled on the tranquil banks of the Nile, this property is a portal to Egypt’s timeless legacy, combining historic architecture with modern world-class luxury.'));

  const currency = hotel?.currency || 'EGP';
  const gallery = (hotel?.images && hotel.images.length > 0) ? hotel.images : (hotel?.coverImage ? [hotel.coverImage, ...MOCK_GALLERY] : MOCK_GALLERY);
  const ratingScore = (4.6 + ((hotel?.stars || 5) * 0.08)).toFixed(1);

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
        <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-90">
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Image 
            source={require('@/assets/logo-2.png')} 
            style={{ width: 28, height: 28 }} 
            resizeMode="contain" 
          />
          <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">Rahal</Text>
        </View>
        <TouchableOpacity className="p-2 active:scale-90">
          <Ionicons name="share-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Carousel Section */}
        <View className="relative w-full h-[320px] bg-black">
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="w-full h-full"
          >
            {gallery.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: imgUrl }}
                style={{ width: SCREEN_WIDTH, height: 320 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-2">
            {gallery.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeImageIndex ? 'w-8 bg-pharaoh-gold' : 'w-2 bg-white/50'}`}
              />
            ))}
          </View>

          {/* Floating Favorite Button */}
          {hotel && (
            <TouchableOpacity
              onPress={() => toggleHotelFavorite(hotel)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full items-center justify-center shadow-lg active:scale-95"
              style={{ backgroundColor: isDark ? 'rgba(28, 26, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)' }}
            >
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#BA1A1A" : "#C8922A"} />
            </TouchableOpacity>
          )}
        </View>

        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
          
          {/* Basic Info */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-display-lg-mobile font-headline mb-2 text-left" style={{ color: colors.onSurface }}>
                {hotelName}
              </Text>
              <View className="flex-row items-center gap-2 flex-wrap">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={16} color="#C8922A" />
                  <Text className="font-semibold text-label-md" style={{ color: colors.onSurface }}>
                    {ratingScore} ({hotel?.stars || 5}★)
                  </Text>
                </View>
                <Text className="font-medium" style={{ color: colors.onSurfaceVariant }}>•</Text>
                <Text className="font-body text-body-md" style={{ color: colors.onSurfaceVariant }}>
                  {hotel?.city || 'Egypt'}, Egypt
                </Text>
              </View>
            </View>
            <Badge variant="gold" className="px-3 py-1 rounded-full border border-pharaoh-gold/20">
              <Text className="text-pharaoh-gold text-label-sm font-semibold tracking-wider uppercase">
                {t('hotelListing.rahalChoice', 'PREMIUM')}
              </Text>
            </Badge>
          </View>

          {/* AI Insight Card */}
          <View 
            className="mb-8 rounded-xl overflow-hidden border p-6 relative"
            style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.pharaohGold + '40' }}
          >
            <View className="absolute top-2 right-2 opacity-5">
              <Ionicons name="sparkles" size={100} color="#C8922A" />
            </View>
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="sparkles" size={18} color="#C8922A" />
              <Text className="text-pharaoh-gold text-label-sm font-bold uppercase tracking-widest">
                {t('hotelDetail.aiInsight', 'AI Insight & Match')}
              </Text>
            </View>
            <Text className="font-body text-body-md leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
              {t('hotelDetail.aiInsightDesc', 'Curated by Rahal AI based on verified guest reviews, exquisite Nile vistas, and authentic heritage hospitality.')}
            </Text>
          </View>

          {/* About Section */}
          <View className="mb-8">
            <Text className="font-headline text-headline-md-mobile mb-3 text-left" style={{ color: colors.onSurface }}>
              {t('hotelDetail.about', 'About the Sanctuary')}
            </Text>
            <Text className="font-body text-body-md leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
              {hotelDescription}
            </Text>
          </View>

          {/* Amenities Grid */}
          <View className="mb-8">
            <Text className="font-headline text-headline-md-mobile mb-4 text-left" style={{ color: colors.onSurface }}>
              {t('hotelDetail.amenities', 'Featured Amenities')}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {[
                { name: t('hotelDetail.amenityPool', 'Infinity Pool'), icon: 'water-outline' },
                { name: t('hotelDetail.amenitySpa', 'Holistic Spa'), icon: 'leaf-outline' },
                { name: t('hotelDetail.amenityDining', 'Artisan Dining'), icon: 'restaurant-outline' },
                { name: t('hotelDetail.amenityNile', 'Nile Access'), icon: 'boat-outline' }
              ].map((amenity, idx) => (
                <View
                  key={idx}
                  className="flex-1 min-w-[130px] border p-4 rounded-xl items-start gap-2"
                  style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
                >
                  <Ionicons name={amenity.icon as any} size={24} color="#C8922A" />
                  <Text className="font-semibold text-label-sm mt-1" style={{ color: colors.onSurface }}>
                    {amenity.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sanctuary / Room Selection */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="font-headline text-headline-md-mobile text-left" style={{ color: colors.onSurface }}>
                {t('hotelDetail.roomTypes', 'Select Sanctuary Room')}
              </Text>
              <Text className="text-pharaoh-gold font-semibold text-label-sm">
                {roomsList.length} {t('hotelDetail.available', 'Available')}
              </Text>
            </View>

            <View className="flex-col gap-4">
              {roomsList.map((room: any, idx: number) => {
                const roomName = room.type || room.name || `Sanctuary Room ${idx + 1}`;
                const isSelected = selectedRoom?.type === room.type || selectedRoom?.name === room.name;
                const roomImage = (room.images && room.images[0]) || MOCK_ROOM_IMAGES[idx % MOCK_ROOM_IMAGES.length];
                const price = room.pricePerNight || hotel?.averagePricePerNight || 320;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.85}
                    onPress={() => setSelectedRoom(room)}
                    className="flex-row p-4 border rounded-xl overflow-hidden active:scale-[0.99]"
                    style={{ 
                      backgroundColor: isSelected ? (isDark ? '#2C2314' : '#FDF9F0') : colors.surface, 
                      borderColor: isSelected ? colors.primary : colors.outlineVariant + '48' 
                    }}
                  >
                    <Image
                      source={{ uri: roomImage }}
                      className="w-24 h-24 rounded-lg"
                      style={{ backgroundColor: colors.surfaceContainerLow }}
                      resizeMode="cover"
                    />
                    <View className="flex-1 pl-4 justify-between">
                      <View>
                        <Text className="font-headline text-headline-md-mobile mb-1 text-left" style={{ color: isSelected ? colors.primary : colors.onSurface }}>
                          {roomName}
                        </Text>
                        <View className="flex-row items-center gap-3 text-sm mt-1">
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="person-outline" size={14} color={colors.onSurfaceVariant} />
                            <Text className="text-xs font-label" style={{ color: colors.outline }}>
                              {room.capacity || 2} {t('hotelDetail.guests', 'Guests')}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="bed-outline" size={14} color={colors.onSurfaceVariant} />
                            <Text className="text-xs font-label" style={{ color: colors.outline }}>King Bed</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between items-end mt-2">
                        <Text className="text-xs line-through" style={{ color: colors.outline }}>
                          {formatCurrency(price * 1.25, currency)}
                        </Text>
                        <View className="items-end">
                          <Text className="font-semibold text-label-md" style={{ color: colors.primary }}>
                            {formatCurrency(price, currency)}
                            <Text className="text-xs font-normal" style={{ color: colors.onSurfaceVariant }}> / {t('hotelListing.perNight', 'night')}</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location Map View */}
          <View className="mb-8">
            <Text className="font-headline text-headline-md-mobile mb-4 text-left" style={{ color: colors.onSurface }}>
              {t('hotelDetail.location', 'Location & Sanctuary Access')}
            </Text>
            <View 
              className="relative w-full h-[200px] rounded-2xl overflow-hidden border shadow-sm"
              style={{ borderColor: colors.outlineVariant + '4D' }}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhVsBNvkOs_F0nFFxJJPjQTo67WpHmXihSjZPYCNHtX61MMr3PyXGawpBkwzK82FvZE6SrhGR50CZ8VXJI9aTikA-SJ8R317RQLLhrUDvci5pqnqUGhUqLN1K_42zB-i7Uac-_XhBf_sP9Tp74JEdm9MyBCVqphjvmi5a7brbeRquJg3AeAh0oMRo0f1E3RAAyWIz_votP8B2pArx2alFFWKY0XH4p7z1GJ1NU9xaeNbiG61XmrXVmy3vDATrRzyrWC4vfAlN__GM' }}
                className="w-full h-full opacity-90"
                resizeMode="cover"
              />
              <View 
                className="absolute bottom-3 left-3 right-3 flex-row justify-between items-center px-3.5 py-2.5 rounded-xl border shadow-sm"
                style={{ backgroundColor: colors.surface + 'F2', borderColor: colors.outlineVariant + '33' }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location" size={18} color="#C8922A" />
                  <Text className="font-semibold text-label-sm" style={{ color: colors.onSurface }}>
                    {hotel?.city || 'Egypt'}, Egypt
                  </Text>
                </View>
                <View className="bg-pharaoh-gold px-3 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">
                    {t('hotelDetail.openMap', 'Nile View')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 h-20 border-t px-5 flex-row justify-between items-center shadow-2xl z-50"
        style={{ backgroundColor: colors.surface, borderTopColor: colors.outlineVariant + '33' }}
      >
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="font-headline text-headline-md text-pharaoh-gold" style={{ color: colors.pharaohGold }}>
              {selectedRoom 
                ? formatCurrency(selectedRoom.pricePerNight || hotel?.averagePricePerNight || 320, currency) 
                : formatCurrency(hotel?.averagePricePerNight || 320, currency)}
            </Text>
            <Text className="text-xs font-body" style={{ color: colors.onSurfaceVariant }}>/ {t('hotelListing.perNight', 'night')}</Text>
          </View>
          <Text className="text-xs font-body" style={{ color: colors.outline }}>
            {selectedRoom?.type || selectedRoom?.name || t('hotelDetail.roomTypes', 'Selected Sanctuary')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleBook}
          disabled={!selectedRoom}
          className="bg-pharaoh-gold px-8 py-3.5 rounded-full flex-row items-center gap-2 active:scale-95 shadow-lg"
          style={{ elevation: 4 }}
        >
          <Text className="text-white text-label-md font-bold uppercase tracking-wider">
            {t('hotelDetail.bookNow', 'Book Now')}
          </Text>
          <Ionicons name={isRTL ? "arrow-back" : "calendar-outline"} size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}