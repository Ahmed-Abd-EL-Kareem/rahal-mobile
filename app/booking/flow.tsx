// app/booking/flow.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button, Input } from '@/components/ui';
import { useHotel, useCreateBooking, useBookingPayment } from '@/api/hooks/useBookings';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency } from '@/utils/currency';

const BOOKING_STEPS = [
  { key: 'dates', title: 'Dates', icon: 'calendar-outline' },
  { key: 'room', title: 'Room', icon: 'bed-outline' },
  { key: 'guests', title: 'Guests', icon: 'people-outline' },
  { key: 'payment', title: 'Payment', icon: 'card-outline' },
];

export default function BookingFlowScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ hotelId?: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useUIStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: hotel, isLoading } = useHotel(params.hotelId || '');
  const createBooking = useCreateBooking();
  const { createCheckout } = useBookingPayment();

  const handleNext = () => {
    if (currentStep === 0) {
      if (!checkIn || !checkOut) {
        showToast({ type: 'error', message: 'Please select check-in and check-out dates' });
        return;
      }
    }
    if (currentStep === 1 && !selectedRoom) {
      showToast({ type: 'error', message: 'Please select a room type' });
      return;
    }
    if (currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to complete your booking',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut) {
      showToast({ type: 'error', message: 'Please complete all steps' });
      return;
    }

    setIsProcessing(true);
    try {
      const booking = await createBooking.mutateAsync({
        hotel: hotel?._id || '',
        checkIn,
        checkOut,
        guests,
        rooms,
        specialRequests,
      });
      
      // Create Stripe checkout session
      const checkout = await createCheckout({ 
        bookingId: booking.data._id, 
        currency: hotel?.currency?.toLowerCase() || 'egp' 
      });
      
      // In real app, open web browser for Stripe checkout
      // For now, show success
      showToast({ type: 'success', message: 'Booking created! Redirecting to payment...' });
      router.push(`/booking/${booking.data._id}`);
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Booking failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !hotel) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C8922A" />
        </View>
      </SafeAreaView>
    );
  }

  const h = hotel;
  const currency = h.currency || 'EGP';

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Progress Indicator */}
      <View className="px-4 py-4 border-b border-outline-variant">
        <View className="flex-row items-center justify-between">
          {BOOKING_STEPS.map((step, i) => (
            <View key={step.key} className="flex-1 items-center">
              <View className={`w-8 h-8 rounded-full flex-items-center justify-center ${
                i <= currentStep ? 'bg-primary' : 'bg-outline-variant'
              }`}>
                {i < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Ionicons name={step.icon} size={16} color={i === currentStep ? 'white' : '#827564'} />
                )}
              </View>
              <Text className={`text-label-sm mt-1 ${i <= currentStep ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                {t(`booking.steps.${step.key}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* Connecting Lines */}
        <View className="flex-row mt-2">
          {BOOKING_STEPS.slice(0, -1).map((_, i) => (
            <View key={i} className="flex-1 h-1" style={{ backgroundColor: i < currentStep ? '#C8922A' : '#D4C4B0' }} />
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={100}
        >
          <View className="px-4 py-4 pb-20">
            {/* Step 1: Dates */}
            {currentStep === 0 && (
              <View className="gap-4">
                <Text className="text-headline-md font-headline text-on-surface mb-2">{t('booking.flow.selectDates')}</Text>
                <Text className="text-body-md text-on-surface-variant">{t('booking.flow.selectDatesDesc')}</Text>
                
                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => { /* Date picker */ }}
                    className="flex-1 p-4 rounded-xl border-2 border-outline-variant bg-surface-container"
                  >
                    <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.checkIn')}</Text>
                    <Text className="text-body-lg font-headline text-on-surface">{checkIn || 'Select date'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { /* Date picker */ }}
                    className="flex-1 p-4 rounded-xl border-2 border-outline-variant bg-surface-container"
                  >
                    <Text className="text-label-sm text-on-surface-variant mb-1">{t('hotelDetail.checkOut')}</Text>
                    <Text className="text-body-lg font-headline text-on-surface">{checkOut || 'Select date'}</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="mt-4 p-4 rounded-xl bg-primary/10 flex-row items-center gap-3">
                  <Ionicons name="information-circle-outline" size={20} color="#C8922A" />
                  <Text className="text-body-md text-primary flex-1">
                    Check-in after 3:00 PM | Check-out before 12:00 PM
                  </Text>
                </View>
              </View>
            )}

            {/* Step 2: Room Selection */}
            {currentStep === 1 && (
              <View className="gap-4">
                <Text className="text-headline-md font-headline text-on-surface mb-2">{t('booking.flow.selectRoom')}</Text>
                <Text className="text-body-md text-on-surface-variant">{t('booking.flow.selectRoomDesc')}</Text>
                
                <View className="gap-3 mt-4">
                  {h.rooms.map((room: any, i: number) => (
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
                        <Text className="text-body-lg font-headline text-on-surface">{room.type}</Text>
                        <View className="flex-row items-center gap-4 mt-2">
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="people-outline" size={16} color="#827564" />
                            <Text className="text-label-md text-on-surface-variant">{t('hotelDetail.sleepsHeader')} {room.capacity}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="bed-outline" size={16} color="#827564" />
                            <Text className="text-label-md text-on-surface-variant">{room.features?.slice(0, 2).join(', ')}</Text>
                          </View>
                        </View>
                      </View>
                      <View className="text-right">
                        <Text className="text-body-lg font-headline text-primary">{formatCurrency(room.pricePerNight, h.currency)}</Text>
                        <Text className="text-label-sm text-on-surface-variant">/ night</Text>
                        {selectedRoom && (
                          <Badge variant="gold" className="mt-2 inline-block">{t('hotelDetail.aiBestPrice')}</Badge>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Step 3: Guests */}
            {currentStep === 2 && (
              <View className="gap-6">
                <Text className="text-headline-md font-headline text-on-surface mb-2">{t('booking.flow.guests')}</Text>
                <Text className="text-body-md text-on-surface-variant">{t('booking.flow.guestsDesc')}</Text>
                
                <View className="gap-4">
                  <View>
                    <Text className="text-label-md text-on-surface-variant mb-2">{t('hotelDetail.guests')}</Text>
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
                  <View className="mt-4">
                    <Text className="text-label-md text-on-surface-variant mb-2">{t('hotelDetail.rooms')}</Text>
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

                <View>
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
              </View>
            )}

            {/* Step 4: Payment */}
            {currentStep === 3 && (
              <View className="gap-6">
                <Text className="text-headline-md font-headline text-on-surface mb-2">{t('booking.flow.payment')}</Text>
                <Text className="text-body-md text-on-surface-variant">{t('booking.flow.paymentDesc')}</Text>

                {/* Price Summary */}
                <Card className="mb-4">
                  <CardContent>
                    <Text className="text-headline-md font-headline text-on-surface mb-4">{t('hotelDetail.priceNights', { price: formatCurrency(selectedRoom?.pricePerNight || 0, h.currency), nights: 3 })}</Text>
                    <View className="space-y-2 mb-4">
                      <View className="flex-row justify-between">
                        <Text className="text-body-md text-on-surface-variant">{selectedRoom?.type} × {rooms} rooms</Text>
                        <Text className="text-body-md font-medium text-on-surface">{formatCurrency((selectedRoom?.pricePerNight || 0) * rooms * 3, h.currency)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-body-md text-on-surface-variant">{t('hotelDetail.serviceFee')}</Text>
                        <Text className="text-body-md font-medium text-on-surface">{formatCurrency((selectedRoom?.pricePerNight || 0) * rooms * 3 * 0.12, h.currency)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-body-md text-on-surface-variant">{t('hotelDetail.taxesAndFees')}</Text>
                        <Text className="text-body-md font-medium text-on-surface">{formatCurrency((selectedRoom?.pricePerNight || 0) * rooms * 3 * 0.14, h.currency)}</Text>
                      </View>
                    </View>
                    <View className="border-t border-outline-variant pt-4 flex-row justify-between">
                      <Text className="text-headline-md font-headline text-on-surface">{t('hotelDetail.total')}</Text>
                      <Text className="text-headline-md font-headline text-primary">
                        {formatCurrency((selectedRoom?.pricePerNight || 0) * rooms * 3 * 1.26, h.currency)}
                      </Text>
                    </View>
                  </CardContent>
                </Card>

                {/* Payment Options */}
                <View className="gap-3">
                  <Text className="text-label-md text-on-surface-variant mb-2">{t('booking.flow.paymentMethod')}</Text>
                  <TouchableOpacity className="p-4 rounded-xl border-2 border-outline-variant bg-surface flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-xl bg-primary/10 flex-items-center justify-center">
                      <Ionicons name="card-outline" size={24} color="#C8922A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-md font-medium text-on-surface">Credit/Debit Card</Text>
                      <Text className="text-label-sm text-on-surface-variant">Visa, Mastercard, Amex</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#C8922A" />
                  </TouchableOpacity>
                  <TouchableOpacity className="p-4 rounded-xl border-2 border-outline-variant bg-surface flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-xl bg-secondary/10 flex-items-center justify-center">
                      <Ionicons name="logo-applepay" size={24} color="#366286" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-body-md font-medium text-on-surface">Apple Pay / Google Pay</Text>
                      <Text className="text-label-sm text-on-surface-variant">Fast & secure checkout</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <Text className="text-label-sm text-on-surface-variant text-center mt-4">
                  {t('hotelDetail.disclaimer')}
                </Text>
              </View>
            )}

            {/* Navigation Buttons */}
            <View className="flex-row gap-3 mt-8 pt-4 border-t border-outline-variant">
              {currentStep > 0 && (
                <Button variant="outline" onPress={handlePrevious} flex={1}>
                  <Ionicons name="chevron-back" size={18} style={{ marginRight: 8 }} />
                  <Text>{t('common.previous')}</Text>
                </Button>
              )}
              <Button
                onPress={currentStep < BOOKING_STEPS.length - 1 ? handleNext : handleBooking}
                disabled={isProcessing}
                fullWidth
                flex={currentStep > 0 ? 1 : 1}
                size="lg"
              >
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="large" />
                ) : currentStep < BOOKING_STEPS.length - 1 ? (
                  <Text>{t('common.next')}</Text>
                ) : (
                  <Text>{t('hotelDetail.bookNow')}</Text>
                )}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}