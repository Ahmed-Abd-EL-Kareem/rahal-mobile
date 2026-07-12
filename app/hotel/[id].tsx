import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useHotel, useHotelMeta } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils';
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

const FALLBACK_HOTEL = {
  _id: 'fallback-gilded-oasis',
  name: { en: 'The Gilded Oasis', ar: 'الواحة المذهبة' },
  city: 'Luxor',
  stars: 5,
  currency: 'USD',
  averagePricePerNight: 320,
  coverImage: MOCK_GALLERY[0],
  images: MOCK_GALLERY,
  description: {
    en: "Nestled on the tranquil banks of the Nile, The Gilded Oasis is more than a hotel; it is a portal to the past. Built upon the site of a forgotten nobleman’s estate, the architecture utilizes reclaimed limestone and hand-forged bronze. Every stay supports the local restoration projects.",
    ar: "يقع فندق الواحة المذهبة على ضفاف النيل الهادئة، وهو أكثر من مجرد فندق؛ إنه بوابة إلى الماضي. بني على موقع عزبة رجل نبيل منسي، وتستخدم العمارة الحجر الجيري المستصلح والبرونز المشغول يدوياً."
  },
  rooms: [
    { type: 'Nile Vista Suite', capacity: 2, pricePerNight: 320 },
    { type: 'Temple Deluxe Twin', capacity: 3, pricePerNight: 210 }
  ]
};

export default function HotelDetailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const { data: hotel, isLoading, error } = useHotel(params.id);
  const { data: meta } = useHotelMeta();

  const h = (hotel && hotel.data) ? hotel.data : FALLBACK_HOTEL;

  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  useEffect(() => {
    if (h && h.rooms && h.rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(h.rooms[0]);
    }
  }, [h]);

  const [checkIn, setCheckIn] = useState('2026-07-15');
  const [checkOut, setCheckOut] = useState('2026-07-18');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const { favoriteHotels, toggleHotelFavorite } = useFavoritesStore();
  const isFavorite = favoriteHotels.some(item => item._id === h._id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const carouselRef = useRef<ScrollView>(null);

  const handleBook = () => {
    if (!selectedRoom) {
      Alert.alert('Missing Info', 'Please select a sanctuary/room before booking');
      return;
    }
    router.push({
      pathname: '/booking/flow',
      params: {
        hotelId: h._id,
        roomType: selectedRoom.type,
        pricePerNight: selectedRoom.pricePerNight,
        checkIn,
        checkOut,
        guests,
        rooms,
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

  const currency = h.currency || 'EGP';
  const gallery = h.images && h.images.length > 0 ? h.images : MOCK_GALLERY;

  return (
    <View className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      
      {/* Top Header (offset below camera and notification area) */}
      <View 
        className="flex-row justify-between items-center px-4 border-b z-50"
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant + '33',
        }}
      >
        <TouchableOpacity onPress={() => router.push('/(tabs)/hotel')} className="p-2 active:scale-90">
          <Ionicons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">Rahal</Text>
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
          <TouchableOpacity
            onPress={() => toggleHotelFavorite(h as any)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full items-center justify-center shadow-lg active:scale-95"
            style={{ backgroundColor: colors.surface + 'E6' }}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#BA1A1A" : "#C8922A"} />
          </TouchableOpacity>
        </View>

        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
          
          {/* Basic Info */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-display-lg-mobile font-headline mb-2" style={{ color: colors.onSurface }}>{h.name.en}</Text>
              <View className="flex-row items-center gap-2 flex-wrap">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={16} color="#C8922A" />
                  <Text className="font-semibold text-label-md" style={{ color: colors.onSurface }}>
                    {(4.5 + (h.stars * 0.08)).toFixed(1)} (1,240 Reviews)
                  </Text>
                </View>
                <Text className="font-medium" style={{ color: colors.onSurfaceVariant }}>•</Text>
                <Text className="font-body text-body-md" style={{ color: colors.onSurfaceVariant }}>{h.city}, Egypt</Text>
              </View>
            </View>
            <Badge variant="gold" className="px-3 py-1 rounded-full border border-pharaoh-gold/20">
              <Text className="text-pharaoh-gold text-label-sm font-semibold tracking-wider uppercase">PREMIUM</Text>
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
              <Text className="text-pharaoh-gold text-label-sm font-bold uppercase tracking-widest">AI Insight & Fit</Text>
            </View>
            <Text className="font-body text-body-md leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
              Based on your interest in <Text className="text-pharaoh-gold font-bold">Archaeological Heritage</Text> and <Text className="text-pharaoh-gold font-bold">Wellness</Text>, this hotel is a 98% match. Guests love the private sunrise boat tours and the world-class Nile-view spa facilities.
            </Text>
          </View>

          {/* About Section */}
          <View className="mb-8">
            <Text className="font-headline text-headline-md-mobile mb-3" style={{ color: colors.onSurface }}>About the Heritage</Text>
            <Text className="font-body text-body-md leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
              {h.description?.[t('common.locale') === 'ar' ? 'ar' : 'en'] || 
               "Nestled on the tranquil banks of the Nile, this property is more than a hotel; it is a portal to the past. Built upon the site of a forgotten nobleman’s estate, the architecture utilizes reclaimed limestone and hand-forged bronze. Every stay supports the local restoration projects."}
            </Text>
          </View>

          {/* Amenities Grid */}
          <View className="mb-8">
            <View className="flex-row flex-wrap gap-3">
              {[
                { name: 'Infinity Pool', icon: 'water-outline' },
                { name: 'Holistic Spa', icon: 'leaf-outline' },
                { name: 'Artisan Dining', icon: 'restaurant-outline' },
                { name: 'Nile Access', icon: 'boat-outline' }
              ].map((amenity, idx) => (
                <View
                  key={idx}
                  className="flex-1 min-w-[130px] border p-4 rounded-xl items-start gap-2"
                  style={{ backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '33' }}
                >
                  <Ionicons name={amenity.icon as any} size={24} color="#C8922A" />
                  <Text className="font-semibold text-label-sm mt-1" style={{ color: colors.onSurface }}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sanctuary Selection */}
          <View className="mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="font-headline text-headline-md-mobile" style={{ color: colors.onSurface }}>Select Sanctuary</Text>
              <TouchableOpacity>
                <Text className="text-pharaoh-gold font-semibold text-label-md">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-col gap-4">
              {h.rooms?.map((room, idx) => {
                const isSelected = selectedRoom?.type === room.type;
                const roomImage = MOCK_ROOM_IMAGES[idx % MOCK_ROOM_IMAGES.length];
                
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedRoom(room)}
                    className="flex-row p-4 border rounded-xl overflow-hidden"
                    style={{ backgroundColor: isSelected ? colors.primary + '14' : colors.surface, borderColor: isSelected ? colors.primary : colors.outlineVariant + '48' }}
                  >
                    <Image
                      source={{ uri: roomImage }}
                      className="w-24 h-24 rounded-lg"
                      style={{ backgroundColor: colors.surfaceContainerLow }}
                      resizeMode="cover"
                    />
                    <View className="flex-1 pl-4 justify-between">
                      <View>
                        <Text className="font-headline text-headline-md-mobile mb-1" style={{ color: colors.primary }}>{room.type}</Text>
                        <View className="flex-row items-center gap-3 text-sm mt-1">
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="person-outline" size={14} color={colors.onSurfaceVariant} />
                            <Text className="text-xs font-label" style={{ color: colors.outline }}>{room.capacity} Guests</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="bed-outline" size={14} color={colors.onSurfaceVariant} />
                            <Text className="text-xs font-label" style={{ color: colors.outline }}>King Bed</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between items-end mt-2">
                        <Text className="text-xs line-through" style={{ color: colors.outline }}>{formatCurrency(room.pricePerNight * 1.3, currency)}</Text>
                        <View className="items-end">
                          <Text className="font-semibold text-label-md" style={{ color: colors.primary }}>
                            {formatCurrency(room.pricePerNight, currency)}
                            <Text className="text-xs font-normal" style={{ color: colors.onSurfaceVariant }}>/night</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Map Section */}
          <View className="mb-8">
            <Text className="font-headline text-headline-md-mobile mb-4" style={{ color: colors.onSurface }}>Location & Access</Text>
            <View 
              className="relative w-full h-[220px] rounded-2xl overflow-hidden border shadow-sm"
              style={{ borderColor: colors.outlineVariant + '4D' }}
            >
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhVsBNvkOs_F0nFFxJJPjQTo67WpHmXihSjZPYCNHtX61MMr3PyXGawpBkwzK82FvZE6SrhGR50CZ8VXJI9aTikA-SJ8R317RQLLhrUDvci5pqnqUGhUqLN1K_42zB-i7Uac-_XhBf_sP9Tp74JEdm9MyBCVqphjvmi5a7brbeRquJg3AeAh0oMRo0f1E3RAAyWIz_votP8B2pArx2alFFWKY0XH4p7z1GJ1NU9xaeNbiG61XmrXVmy3vDATrRzyrWC4vfAlN__GM' }}
                className="w-full h-full opacity-90"
                resizeMode="cover"
              />
              <View 
                className="absolute bottom-4 left-4 right-4 flex-row justify-between items-center px-3 py-2.5 rounded-xl border shadow-sm"
                style={{ backgroundColor: colors.surface + 'E6', borderColor: colors.outlineVariant + '33' }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location" size={18} color="#C8922A" />
                  <Text className="font-semibold text-on-surface text-label-sm" style={{ color: colors.onSurface }}>{h.city || 'West Bank'}, Luxor</Text>
                </View>
                <TouchableOpacity className="bg-pharaoh-gold w-10 h-10 rounded-full items-center justify-center shadow-md active:scale-90">
                  <Ionicons name="navigate" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Price Calculation details card */}
          {selectedRoom && (
            <Card 
              className="mb-8 border rounded-xl p-5 shadow-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <CardContent className="p-0">
                <Text className="font-headline text-headline-md-mobile mb-4" style={{ color: colors.onSurface }}>Invoice Detail</Text>
                
                <View className="flex-col gap-3">
                  <View className="flex-row justify-between">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>{selectedRoom.type} × 3 nights</Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>{formatCurrency(selectedRoom.pricePerNight * rooms * 3, currency)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>Rahal Service Fee</Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>{formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 0.12, currency)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>Taxes & Tourist Surcharges</Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>{formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 0.14, currency)}</Text>
                  </View>
                  <View className="h-[1px] my-2" style={{ backgroundColor: colors.outlineVariant + '33' }} />
                  <View className="flex-row justify-between items-center">
                    <Text className="font-headline text-headline-md-mobile" style={{ color: colors.onSurface }}>Total Payment</Text>
                    <Text className="font-headline text-headline-md-mobile text-pharaoh-gold" style={{ color: colors.pharaohGold }}>
                      {formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 1.26, currency)}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 h-20 border-t px-4 flex-row justify-between items-center shadow-lg z-50"
        style={{ backgroundColor: colors.surface, borderTopColor: colors.outlineVariant + '33' }}
      >
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="font-headline text-headline-md text-pharaoh-gold" style={{ color: colors.pharaohGold }}>
              {selectedRoom ? formatCurrency(selectedRoom.pricePerNight, currency) : formatCurrency(h.averagePricePerNight, currency)}
            </Text>
            <Text className="text-xs font-body" style={{ color: colors.onSurfaceVariant }}>/night</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-xs underline font-body" style={{ color: colors.secondary }}>View price details</Text>
          </TouchableOpacity>
        </View>

        <Button
          onPress={handleBook}
          disabled={isBooking || !selectedRoom}
          className="bg-pharaoh-gold px-8 py-3 rounded-full flex-row items-center gap-2 active:scale-95 shadow-md"
          style={{ elevation: 4 }}
        >
          {isBooking ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text className="text-white text-label-md font-bold uppercase tracking-wider">Book Now</Text>
              <Ionicons name="calendar-outline" size={16} color="white" />
            </>
          )}
        </Button>
      </View>
    </View>
  );
}