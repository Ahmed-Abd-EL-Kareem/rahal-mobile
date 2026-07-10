// app/hotel/[id].tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, CardFooter, Badge, SparkleBadge, Button, Input } from '@/components/ui';
import { useHotel, useHotelMeta } from '@/api/hooks/useHotels';
import { formatCurrency, formatDate } from '@/utils';
import { formatRelativeTime } from '@/utils/date';

export default function HotelDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ id: string }>();
  const { data: hotel, isLoading, error } = useHotel(params.id);
  const { data: meta } = useHotelMeta();
  const [selectedRoom, setSelectedRoom] = useState<typeof hotel?.rooms[0] | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleBook = async () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      Alert.alert('Missing Info', 'Please select dates and a room');
      return;
    }
    setIsBooking(true);
    try {
      const { useCreateBooking } = await import('@/api/hooks/useBookings');
      const createBooking = useCreateBooking();
      await createBooking.mutateAsync({
        hotel: hotel?._id || '',
        checkIn,
        checkOut,
        guests,
        rooms,
        specialRequests,
      });
      Alert.alert('Success', 'Booking created successfully!');
      router.push('/(tabs)/trips');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C8922A" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !hotel) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#8F1301" />
          <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">Hotel Not Found</Text>
          <Text className="text-on-surface-variant text-center">Unable to load hotel details</Text>
          <Button variant="outline" className="mt-4 w-auto" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const h = hotel;
  const currency = h.currency || 'EGP';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative h-[300px]">
          <Image
            source={{ uri: h.coverImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20, 16, 15, 0.4)' }} />
          <View className="absolute bottom-0 left-0 right-0 p-6" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                {h.stars > 0 && (
                  <View className="flex-row gap-1">
                    {[...Array(h.stars)].map((_, i) => (
                      <Ionicons key={i} name="star" size={16} color="#F8BC51" />
                    ))}
                  </View>
                )}
                {h.isActive && (
                  <Badge variant="green" className="ml-2">{t('hotelDetail.luxuryLandmark')}</Badge>
                )}
              </View>
              <Text className="text-display-lg-mobile font-headline text-white mb-1">{h.name.en}</Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="location-on" size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-body-md text-white/80">{h.city}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={() => router.push(`/favorites`)}>
                <Ionicons name="heart-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-full bg-white/20 ml-2">
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="px-4 pb-6">
          {/* AI Insight */}
          <Card variant="papyrus" className="mb-4">
            <CardContent>
              <View className="flex-row items-start gap-3">
                <View className="p-2 rounded-lg bg-primary/10">
                  <Ionicons name="sparkles" size={20} color="#C8922A" />
                </View>
                <View className="flex-1">
                  <Text className="text-label-md font-medium text-primary mb-1">{t('hotelDetail.aiInsight')}</Text>
                  <Text className="text-body-md text-on-surface-variant">{t('hotelDetail.aiInsightText')}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* About */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('hotelDetail.about')}</Text>
            <Text className="text-body-md text-on-surface-variant leading-relaxed">
              {h.description?.[t('common.locale') === 'ar' ? 'ar' : 'en'] || 'Luxury hotel with world-class amenities and exceptional service.'}
            </Text>
          </View>

          {/* Amenities */}
          <View className="mb-6">
            <Text className="text-headline-md font-headline text-on-surface mb-3">{t('hotelDetail.amenities')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
              {h.amenities?.map((amenity, i) => (
                <Badge key={i} variant="blue" className="whitespace-nowrap">
                  {amenity}
                </Badge>
              ))}
            </ScrollView>
          </View>

          {/* Room Types */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-headline-md font-headline text-on-surface">{t('hotelDetail.roomTypes')}</Text>
              {meta?.roomTypes && (
                <TouchableOpacity onPress={() => {/* Show all room types */}}>
                  <Text className="text-label-md text-primary">{t('common.seeAll')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="gap-3">
              {h.rooms?.map((room, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedRoom(room)}
                  className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${
                    selectedRoom === room
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant bg-surface'
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-body-lg font-medium text-on-surface">{room.type}</Text>
                    <View className="flex-row items-center gap-4 mt-2">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="people-outline" size={16} color="#827564" />
                        <Text className="text-label-md text-on-surface-variant">{t('hotelDetail.sleepsHeader')} {room.capacity}</Text>
                      </View>
                      {room.features && room.features.length > 0 && (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="star-outline" size={16} color="#827564" />
                          <Text className="text-label-md text-on-surface-variant">{room.features.slice(0, 2).join(', ')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="text-right">
                    <Text className="text-body-lg font-headline text-primary">{formatCurrency(room.pricePerNight, currency)}</Text>
                    <Text className="text-label-sm text-on-surface-variant">{t('hotelDetail.perNight')}</Text>
                    {selectedRoom === room && (
                      <Badge variant="gold" className="mt-2 inline-block">{t('hotelDetail.aiBestPrice')}</Badge>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Booking Form */}
          <Card className="mb-6">
            <CardContent className="pb-0">
              <Text className="text-headline-md font-headline text-on-surface mb-4">{t('hotelDetail.checkIn')} / {t('hotelDetail.checkOut')}</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {/* Date picker */}}
                  className="flex-1 p-4 rounded-xl border-2 border-outline-variant bg-surface-container"
                >
                  <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.checkIn')}</Text>
                  <Text className="text-body-lg font-headline text-on-surface">{checkIn || 'Select date'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {/* Date picker */}}
                  className="flex-1 p-4 rounded-xl border-2 border-outline-variant bg-surface-container"
                >
                  <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.checkOut')}</Text>
                  <Text className="text-body-lg font-headline text-on-surface">{checkOut || 'Select date'}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-3 mt-4">
                <View className="flex-1">
                  <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.guests')}</Text>
                  <View className="flex-row items-center justify-between p-4 rounded-xl border-2 border-outline-variant bg-surface-container">
                    <Text className="text-body-lg font-headline text-on-surface">{guests} {t('hotelDetail.guests')}</Text>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} className="p-2 rounded-full bg-primary/10">
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setGuests(guests + 1)} className="p-2 rounded-full bg-primary/10">
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.rooms')}</Text>
                  <View className="flex-row items-center justify-between p-4 rounded-xl border-2 border-outline-variant bg-surface-container">
                    <Text className="text-body-lg font-headline text-on-surface">{rooms} {t('hotelDetail.rooms')}</Text>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity onPress={() => setRooms(Math.max(1, rooms - 1))} className="p-2 rounded-full bg-primary/10">
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setRooms(rooms + 1)} className="p-2 rounded-full bg-primary/10">
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <View className="mb-6">
            <Text className="text-label-md text-on-surface-variant mb-2">{t('hotelDetail.specialRequests')}</Text>
            <TextInput
              value={specialRequests}
              onChangeText={setSpecialRequests}
              placeholder={t('hotelDetail.specialRequestsPlaceholder')}
              multiline
              numberOfLines={3}
              className="p-4 rounded-xl border-2 border-outline-variant bg-surface-container text-on-surface placeholder-text-on-surface-variant"
            />
          </View>

          {/* Price Summary */}
          {checkIn && checkOut && selectedRoom && (
            <Card variant="outlined" className="mb-6">
              <CardContent>
                <Text className="text-headline-md font-headline text-on-surface mb-4">{t('hotelDetail.priceNights', { price: formatCurrency(selectedRoom.pricePerNight, currency), nights: 3 })}</Text>
                <View className="space-y-2 mb-4">
                  <View className="flex-row justify-between">
                    <Text className="text-body-md text-on-surface-variant">{selectedRoom.type} × {rooms} {t('hotelDetail.rooms')}</Text>
                    <Text className="text-body-md font-medium text-on-surface">{formatCurrency(selectedRoom.pricePerNight * rooms * 3, currency)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-body-md text-on-surface-variant">{t('hotelDetail.serviceFee')}</Text>
                    <Text className="text-body-md font-medium text-on-surface">{formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 0.12, currency)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-body-md text-on-surface-variant">{t('hotelDetail.taxesAndFees')}</Text>
                    <Text className="text-body-md font-medium text-on-surface">{formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 0.14, currency)}</Text>
                  </View>
                </View>
                <View className="border-t border-outline-variant pt-4 flex-row justify-between">
                  <Text className="text-headline-md font-headline text-on-surface">{t('hotelDetail.total')}</Text>
                  <Text className="text-headline-md font-headline text-primary">
                    {formatCurrency(selectedRoom.pricePerNight * rooms * 3 * 1.26, currency)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Book Button */}
          <Button
            onPress={handleBook}
            disabled={isBooking || !selectedRoom || !checkIn || !checkOut}
            fullWidth
            size="lg"
            className="mb-4"
          >
            {isBooking ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text>{t('hotelDetail.bookNow')}</Text>
            )}
          </Button>

          <Text className="text-label-sm text-on-surface-variant text-center">{t('hotelDetail.disclaimer')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}