// app/booking/flow.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Button } from '@/components/ui';
import { useCreateBooking } from '@/api/hooks/useBookings';
import { useBookingPayment } from '@/hooks/useBookingPayment';
import { useHotel } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

export default function BookingFlowScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{
    hotelId?: string;
    roomType?: string;
    pricePerNight?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    rooms?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark, isRTL } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);

  // Default dates: tomorrow and 3 days later
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getThreeDaysLaterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(params.checkIn || getTomorrowStr());
  const [checkOut, setCheckOut] = useState(params.checkOut || getThreeDaysLaterStr());
  const [rooms, setRooms] = useState(params.rooms ? parseInt(params.rooms) : 1);
  const [guests, setGuests] = useState(params.guests ? parseInt(params.guests) : 2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'stripe'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');

  // Fetch hotel details from backend
  const { data: hotelResponse, isLoading, error } = useHotel(params.hotelId || '');
  const hotel = hotelResponse?.data;
  const createBooking = useCreateBooking();
  const { createCheckout, isPending: isStripePending } = useBookingPayment();

  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  useEffect(() => {
    if (hotel?.rooms && hotel.rooms.length > 0) {
      const room = hotel.rooms.find((r: any) => r.type === params.roomType || r.name === params.roomType) || hotel.rooms[0];
      setSelectedRoom(room);
    } else if (params.roomType || params.pricePerNight) {
      setSelectedRoom({
        type: params.roomType || 'Sanctuary Deluxe Room',
        pricePerNight: params.pricePerNight ? parseFloat(params.pricePerNight) : 320,
        capacity: params.guests ? parseInt(params.guests) : 2
      });
    } else if (!isLoading) {
      setSelectedRoom({
        type: 'Sanctuary Suite',
        pricePerNight: 320,
        capacity: 2
      });
    }
  }, [hotel, params.roomType, params.pricePerNight, isLoading]);

  // Capacity validation
  const roomCapacity = selectedRoom?.capacity || 2;
  const maxAllowedGuests = roomCapacity * rooms;

  // Auto-clamp guests if rooms decreased
  useEffect(() => {
    if (guests > maxAllowedGuests) {
      setGuests(maxAllowedGuests);
    }
  }, [rooms, maxAllowedGuests]);

  const handleAddGuest = () => {
    if (guests >= maxAllowedGuests) {
      Alert.alert(
        t('bookings.capacityLimitTitle', 'Capacity Limit Reached'),
        t('bookings.capacityLimitDesc', `This room type accommodates up to ${roomCapacity} guests per room (${maxAllowedGuests} guests for ${rooms} room(s)). Please add another room to accommodate more guests.`)
      );
      return;
    }
    setGuests(prev => prev + 1);
  };

  const handleRemoveGuest = () => {
    setGuests(prev => Math.max(1, prev - 1));
  };

  const handleAddRoom = () => {
    setRooms(prev => prev + 1);
  };

  const handleRemoveRoom = () => {
    setRooms(prev => Math.max(1, prev - 1));
  };

  // Date validation
  const validateDates = (): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      Alert.alert(t('common.error', 'Invalid Date'), t('bookings.invalidDateFormat', 'Please enter dates in YYYY-MM-DD format.'));
      return false;
    }

    if (checkInDate < today) {
      Alert.alert(t('common.error', 'Invalid Check-in Date'), t('bookings.checkInPastError', 'Check-in date cannot be in the past.'));
      return false;
    }

    if (checkOutDate <= checkInDate) {
      Alert.alert(t('common.error', 'Invalid Check-out Date'), t('bookings.checkOutBeforeCheckIn', 'Check-out date must be after check-in date.'));
      return false;
    }

    return true;
  };

  const totalNights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) || 1;
  const roomPrice = selectedRoom?.pricePerNight || (hotel?.averagePricePerNight || 320);
  const subtotal = roomPrice * rooms * totalNights;
  const aiDiscount = subtotal * 0.10;
  const taxesAndFees = subtotal * 0.14;
  const totalAmount = subtotal - aiDiscount + taxesAndFees;

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateDates()) return;
      if (guests > maxAllowedGuests) {
        Alert.alert(t('common.error', 'Too Many Guests'), t('bookings.capacityLimitDesc', `Max ${maxAllowedGuests} guests for ${rooms} room(s).`));
        return;
      }
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleBooking = async () => {
    if (!isAgreed) {
      Alert.alert(t('bookings.agreementRequired', 'Agreement Required'), t('bookings.termsNotice', 'Please agree to the Heritage Terms of Service to complete your booking.'));
      return;
    }

    setIsProcessing(true);
    try {
      const response = await createBooking.mutateAsync({
        hotel: hotel?._id || params.hotelId || '',
        checkIn,
        checkOut,
        guests,
        rooms,
        specialRequests: specialRequests + (paymentMethod === 'cash' ? ' [Payment: Cash on Arrival]' : ' [Payment: Stripe Online]'),
      });

      if (response && response.data) {
        const bookingId = response.data._id;
        setCreatedBookingId(bookingId);

        if (paymentMethod === 'stripe') {
          // Open Stripe Checkout
          try {
            await createCheckout({
              bookingId,
              currency: hotel?.currency || 'USD',
            });
          } catch (stripeErr) {
            console.log('Stripe checkout completed or dismissed:', stripeErr);
          }
        }

        setShowSuccessOverlay(true);
      } else {
        throw new Error('No reservation details returned from backend.');
      }
    } catch (error: any) {
      Alert.alert(t('bookings.bookingFailed', 'Booking Failed'), error.response?.data?.message || 'Failed to complete your reservation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !hotel && !selectedRoom) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#C8922A" />
        <Text className="text-sm font-medium mt-4" style={{ color: colors.onSurfaceVariant }}>
          {t('common.loading', 'Loading Sanctuary Details...')}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-2 rounded-full border border-pharaoh-gold">
          <Text className="text-pharaoh-gold text-xs font-bold">{t('common.cancel', 'Cancel')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getHotelName = (): string => {
    if (!hotel?.name) return 'Heritage Sanctuary';
    if (typeof hotel.name === 'string') return hotel.name;
    if (typeof hotel.name === 'object') {
      return (hotel.name as any)[i18n.language === 'ar' ? 'ar' : 'en'] || (hotel.name as any).en || 'Heritage Sanctuary';
    }
    return 'Heritage Sanctuary';
  };
  const hotelName: string = getHotelName();

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
        <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#C8922A" />
        </TouchableOpacity>
        <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">
          {t('hotelDetail.bookNow', 'Secure Booking')}
        </Text>
        <View className="w-10 h-10 rounded-full bg-pharaoh-gold/10 items-center justify-center">
          <Ionicons name="sparkles" size={16} color="#C8922A" />
        </View>
      </View>

      {/* Progress Steps bar */}
      <View className="border-b py-4 px-6" style={{ backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant + '1A' }}>
        <View className="flex-row justify-between items-center max-w-sm mx-auto w-full">
          {/* Step 1: Stay */}
          <View className="items-center gap-1">
            <View 
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: currentStep >= 0 ? colors.pharaohGold : colors.surfaceContainerHighest }}
            >
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <Text 
              className="text-label-sm font-semibold"
              style={{ color: currentStep >= 0 ? colors.pharaohGold : colors.onSurfaceVariant + '99' }}
            >
              {t('hotelDetail.checkIn', 'Dates')}
            </Text>
          </View>

          <View 
            className="flex-1 h-[2px] mx-2"
            style={{ backgroundColor: currentStep >= 1 ? colors.pharaohGold : colors.outlineVariant + '4D' }}
          />

          {/* Step 2: Details */}
          <View className="items-center gap-1">
            <View 
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: currentStep >= 1 ? colors.pharaohGold : colors.surfaceContainerHighest }}
            >
              <Text className="text-xs font-bold" style={{ color: currentStep >= 1 ? '#FFFFFF' : colors.onSurfaceVariant + '99' }}>2</Text>
            </View>
            <Text 
              className="text-label-sm font-semibold"
              style={{ color: currentStep >= 1 ? colors.pharaohGold : colors.onSurfaceVariant + '99' }}
            >
              {t('bookings.detail.detailsTitle', 'Details')}
            </Text>
          </View>

          <View 
            className="flex-1 h-[2px] mx-2"
            style={{ backgroundColor: currentStep >= 2 ? colors.pharaohGold : colors.outlineVariant + '4D' }}
          />

          {/* Step 3: Payment */}
          <View className="items-center gap-1">
            <View 
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: currentStep >= 2 ? colors.pharaohGold : colors.surfaceContainerHighest }}
            >
              <Text className="text-xs font-bold" style={{ color: currentStep >= 2 ? '#FFFFFF' : colors.onSurfaceVariant + '99' }}>3</Text>
            </View>
            <Text 
              className="text-label-sm font-semibold"
              style={{ color: currentStep >= 2 ? colors.pharaohGold : colors.onSurfaceVariant + '99' }}
            >
              {t('bookings.detail.paymentSummary', 'Payment')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View className="p-4 md:p-10 max-w-[900px] mx-auto w-full">
            
            {/* STEP 1: Dates & Steppers */}
            {currentStep === 0 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="calendar-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md text-left" style={{ color: colors.onSurface }}>
                    {t('hotelListing.datesLabel', 'Choose your dates & party')}
                  </Text>
                </View>

                {/* Date Inputs */}
                <View className="flex-row gap-4">
                  {/* Check In */}
                  <View 
                    className="flex-1 border rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="text-label-sm uppercase tracking-widest mb-1 text-left" style={{ color: colors.outline }}>
                      {t('hotelDetail.checkIn', 'Check-in')}
                    </Text>
                    <TextInput
                      value={checkIn}
                      onChangeText={setCheckIn}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.outline}
                      className="text-headline-md-mobile font-headline p-0 text-left"
                      style={{ color: colors.onSurface }}
                    />
                  </View>
                  
                  {/* Check Out */}
                  <View 
                    className="flex-1 border rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="text-label-sm uppercase tracking-widest mb-1 text-left" style={{ color: colors.outline }}>
                      {t('hotelDetail.checkOut', 'Check-out')}
                    </Text>
                    <TextInput
                      value={checkOut}
                      onChangeText={setCheckOut}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.outline}
                      className="text-headline-md-mobile font-headline p-0 text-left"
                      style={{ color: colors.onSurface }}
                    />
                  </View>
                </View>

                {/* Steppers for Rooms & Guests */}
                <View className="gap-4 mt-2">
                  {/* Rooms Stepper */}
                  <View 
                    className="flex-row justify-between items-center p-5 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View>
                      <Text className="font-headline text-label-md font-bold text-left" style={{ color: colors.onSurface }}>
                        {t('hotelDetail.rooms', 'Rooms')}
                      </Text>
                      <Text className="text-label-sm mt-0.5 text-left" style={{ color: colors.outline }}>
                        {selectedRoom?.type || selectedRoom?.name || 'Sanctuary Suite'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity 
                        onPress={handleRemoveRoom} 
                        disabled={rooms <= 1}
                        className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95"
                        style={{ opacity: rooms <= 1 ? 0.4 : 1 }}
                      >
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <Text className="font-headline text-headline-md-mobile w-8 text-center" style={{ color: colors.onSurface }}>{rooms}</Text>
                      <TouchableOpacity 
                        onPress={handleAddRoom} 
                        className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95"
                      >
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Guests Stepper */}
                  <View 
                    className="flex-row justify-between items-center p-5 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View>
                      <Text className="font-headline text-label-md font-bold text-left" style={{ color: colors.onSurface }}>
                        {t('hotelDetail.guests', 'Guests')}
                      </Text>
                      <Text className="text-label-sm mt-0.5 text-left" style={{ color: colors.outline }}>
                        {t('hotelDetail.maxCapacity', `Max ${maxAllowedGuests} for ${rooms} room(s)`)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity 
                        onPress={handleRemoveGuest} 
                        disabled={guests <= 1}
                        className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95"
                        style={{ opacity: guests <= 1 ? 0.4 : 1 }}
                      >
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <Text className="font-headline text-headline-md-mobile w-8 text-center" style={{ color: colors.onSurface }}>{guests}</Text>
                      <TouchableOpacity 
                        onPress={handleAddGuest} 
                        className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95"
                      >
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Capacity Info Banner */}
                <View 
                  className="p-3.5 rounded-xl border flex-row items-center gap-2.5"
                  style={{ backgroundColor: colors.pharaohGold + '10', borderColor: colors.pharaohGold + '30' }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#C8922A" />
                  <Text className="text-xs flex-1 text-left leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
                    {t('hotelDetail.capacityNote', `Each ${selectedRoom?.type || 'room'} accommodates up to ${roomCapacity} guests. Total capacity for your party: ${maxAllowedGuests} guests.`)}
                  </Text>
                </View>

                {/* Continue Button */}
                <View className="mt-6 items-end">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-pharaoh-gold px-8 py-4 rounded-full flex-row items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-bold text-label-md">
                      {t('common.continue', 'Continue to Details')}
                    </Text>
                    <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 2: Special Requests & Fare Summary */}
            {currentStep === 1 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="create-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md text-left" style={{ color: colors.onSurface }}>
                    {t('hotelDetail.personalizeStay', 'Personalize your stay')}
                  </Text>
                </View>

                <View className="flex-col gap-6">
                  {/* Requests Box */}
                  <View 
                    className="p-5 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="font-headline text-label-md mb-3 text-left" style={{ color: colors.onSurface }}>
                      {t('hotelDetail.specialRequests', 'Special Requests (Optional)')}
                    </Text>
                    <TextInput
                      value={specialRequests}
                      onChangeText={setSpecialRequests}
                      placeholder={t('hotelDetail.specialRequestsPlaceholder', 'E.g. High floor, dietary requirements, airport pickup...')}
                      placeholderTextColor={colors.onSurfaceVariant + '80'}
                      multiline
                      numberOfLines={4}
                      className="p-4 rounded-lg font-body text-body-md text-left"
                      textAlignVertical="top"
                      style={{ minHeight: 80, backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }}
                    />
                  </View>

                  {/* AI Concierge applied card */}
                  <View 
                    className="p-5 border rounded-xl flex-row items-start gap-4"
                    style={{ backgroundColor: colors.pharaohGold + '14', borderColor: colors.pharaohGold + '4D' }}
                  >
                    <Ionicons name="sparkles" size={20} color="#C8922A" className="mt-1" />
                    <View className="flex-1">
                      <Text className="font-bold text-pharaoh-gold text-label-sm uppercase tracking-wider text-left">
                        {t('hotelDetail.aiInsight', 'AI Concierge Applied')}
                      </Text>
                      <Text className="text-xs font-body mt-1 leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
                        {t('hotelDetail.aiInsightApplied', "Based on your preferences, we've suggested a Nile-view room with early check-in and complimentary high tea.")}
                      </Text>
                    </View>
                  </View>

                  {/* Fare Summary Card */}
                  <View 
                    className="border relative p-1 rounded-2xl shadow-resting mt-2"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View className="border border-pharaoh-gold/25 p-5 rounded-xl" style={{ backgroundColor: colors.background }}>
                      <View className="flex-row items-center gap-2 border-b pb-3 mb-4" style={{ borderBottomColor: colors.outlineVariant + '33' }}>
                        <Ionicons name="receipt-outline" size={18} color="#C8922A" />
                        <Text className="font-headline text-headline-md-mobile text-pharaoh-gold">
                          {t('bookings.detail.paymentSummary', 'Fare Summary')}
                        </Text>
                      </View>
                      
                      <View className="flex-col gap-3.5">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>
                            {rooms} {t('hotelDetail.rooms', 'room(s)')} × {totalNights} {t('bookings.nights', 'night(s)')}
                          </Text>
                          <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>
                            {formatCurrency(subtotal, hotel?.currency)}
                          </Text>
                        </View>
                        
                        <View 
                          className="flex-row justify-between items-center border px-3 py-2 rounded-lg"
                          style={{ backgroundColor: colors.success + '1A', borderColor: colors.success + '33' }}
                        >
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons name="sparkles" size={14} color="#2D7A4F" />
                            <Text className="text-body-sm font-semibold" style={{ color: colors.success }}>
                              {t('hotelDetail.aiDiscount', 'AI Heritage Discount (10%)')}
                            </Text>
                          </View>
                          <Text className="text-body-md font-bold" style={{ color: colors.success }}>
                            -{formatCurrency(aiDiscount, hotel?.currency)}
                          </Text>
                        </View>
                        
                        <View className="flex-row justify-between items-center">
                          <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>
                            {t('hotelDetail.taxesAndFees', 'Taxes & Fees (14%)')}
                          </Text>
                          <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>
                            {formatCurrency(taxesAndFees, hotel?.currency)}
                          </Text>
                        </View>
                        
                        <View className="h-[1px] border-t border-dashed my-2 pt-2" style={{ borderTopColor: colors.outlineVariant + '66' }} />
                        
                        <View className="flex-row justify-between items-center">
                          <Text className="font-headline text-label-md uppercase tracking-widest" style={{ color: colors.outline }}>
                            {t('hotelDetail.total', 'Total Amount')}
                          </Text>
                          <Text className="font-headline text-2xl text-pharaoh-gold font-bold">
                            {formatCurrency(totalAmount, hotel?.currency)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Back and Proceed Buttons */}
                <View className="flex-row justify-between mt-8 border-t pt-4" style={{ borderTopColor: colors.outlineVariant + '33' }}>
                  <TouchableOpacity
                    onPress={handlePrevious}
                    className="px-6 py-4 flex-row items-center gap-2 active:scale-95"
                  >
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={16} color={colors.outline} />
                    <Text className="font-bold text-label-md" style={{ color: colors.outline }}>
                      {t('common.back', 'Back')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-pharaoh-gold px-8 py-4 rounded-full flex-row items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-bold text-label-md">
                      {t('bookings.proceedToPayment', 'Proceed to Payment')}
                    </Text>
                    <Ionicons name="lock-closed" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: Confirm Payment (Stripe vs Cash on Delivery) */}
            {currentStep === 2 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="card-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md text-left" style={{ color: colors.onSurface }}>
                    {t('bookings.selectPaymentMethod', 'Select Payment Method')}
                  </Text>
                </View>

                <View className="flex-col gap-4">
                  {/* Option 1: Cash on Arrival */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setPaymentMethod('cash')}
                    className="p-5 rounded-xl border flex-row items-center justify-between active:scale-[0.99]"
                    style={{
                      backgroundColor: paymentMethod === 'cash' ? (isDark ? '#2C2314' : '#FDF9F0') : colors.surface,
                      borderColor: paymentMethod === 'cash' ? '#C8922A' : colors.outlineVariant + '48',
                      borderWidth: paymentMethod === 'cash' ? 2 : 1
                    }}
                  >
                    <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                      <View className="w-11 h-11 rounded-full bg-pharaoh-gold/15 items-center justify-center">
                        <Ionicons name="cash-outline" size={22} color="#C8922A" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-body-md text-left" style={{ color: colors.onSurface }}>
                          {t('bookings.cashOnArrival', 'Cash on Arrival (Pay at Hotel)')}
                        </Text>
                        <Text className="text-xs text-outline text-left mt-0.5">
                          {t('bookings.cashOnArrivalDesc', 'No advance payment required. Pay upon check-in.')}
                        </Text>
                      </View>
                    </View>
                    <View 
                      className="w-6 h-6 rounded-full border-2 items-center justify-center"
                      style={{ borderColor: paymentMethod === 'cash' ? '#C8922A' : colors.outline }}
                    >
                      {paymentMethod === 'cash' && <View className="w-3 h-3 rounded-full bg-pharaoh-gold" />}
                    </View>
                  </TouchableOpacity>

                  {/* Option 2: Stripe Online Card Payment */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setPaymentMethod('stripe')}
                    className="p-5 rounded-xl border flex-row items-center justify-between active:scale-[0.99]"
                    style={{
                      backgroundColor: paymentMethod === 'stripe' ? (isDark ? '#2C2314' : '#FDF9F0') : colors.surface,
                      borderColor: paymentMethod === 'stripe' ? '#C8922A' : colors.outlineVariant + '48',
                      borderWidth: paymentMethod === 'stripe' ? 2 : 1
                    }}
                  >
                    <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                      <View className="w-11 h-11 rounded-full bg-pharaoh-gold/15 items-center justify-center">
                        <Ionicons name="card-outline" size={22} color="#C8922A" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-body-md text-left" style={{ color: colors.onSurface }}>
                          {t('bookings.stripeCardPayment', 'Credit / Debit Card (Stripe)')}
                        </Text>
                        <Text className="text-xs text-outline text-left mt-0.5">
                          {t('bookings.stripeCardDesc', 'Instant secure payment via Stripe Checkout.')}
                        </Text>
                      </View>
                    </View>
                    <View 
                      className="w-6 h-6 rounded-full border-2 items-center justify-center"
                      style={{ borderColor: paymentMethod === 'stripe' ? '#C8922A' : colors.outline }}
                    >
                      {paymentMethod === 'stripe' && <View className="w-3 h-3 rounded-full bg-pharaoh-gold" />}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Terms Agreement Checkbox */}
                <View 
                  className="p-5 rounded-xl border shadow-sm mt-2"
                  style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                >
                  <TouchableOpacity 
                    onPress={() => setIsAgreed(!isAgreed)}
                    className="flex-row items-center gap-3 active:opacity-80"
                  >
                    <View 
                      className="w-5 h-5 rounded border items-center justify-center"
                      style={{ backgroundColor: isAgreed ? colors.pharaohGold : 'transparent', borderColor: isAgreed ? colors.pharaohGold : colors.outline }}
                    >
                      {isAgreed && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-body-md flex-1 leading-tight text-left" style={{ color: colors.onSurfaceVariant }}>
                      {t('bookings.termsNotice', 'I agree to the Heritage Terms of Service and Cancellation Policy.')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Complete Booking CTA */}
                <View className="mt-6 flex-col items-center gap-4">
                  <TouchableOpacity
                    onPress={handleBooking}
                    disabled={isProcessing || isStripePending}
                    className="w-full bg-pharaoh-gold py-4.5 rounded-full flex-row items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    {isProcessing || isStripePending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-headline-md-mobile">
                          {paymentMethod === 'stripe' 
                            ? t('bookings.payWithStripe', 'Pay & Confirm Reservation') 
                            : t('bookings.completeBooking', 'Complete Booking')}
                        </Text>
                        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <View className="flex-row items-center gap-1.5 justify-center">
                    <Ionicons name="shield-checkmark" size={14} color={colors.outline} />
                    <Text className="text-xs font-label" style={{ color: colors.outline }}>
                      {t('bookings.encryptedTransaction', 'Bank-grade encrypted 256-bit SSL transaction')}
                    </Text>
                  </View>
                </View>

                {/* Back button */}
                <TouchableOpacity
                  onPress={handlePrevious}
                  className="px-6 py-4 flex-row items-center gap-2 self-start active:scale-95"
                >
                  <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={16} color={colors.outline} />
                  <Text className="font-bold text-label-md" style={{ color: colors.outline }}>
                    {t('common.back', 'Back')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Success Screen Overlay */}
      {showSuccessOverlay && (
        <View className="absolute inset-0 z-[100] flex items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
          <View className="max-w-md w-full items-center text-center">
            
            {/* Animated Ring */}
            <View className="relative w-28 h-28 items-center justify-center mb-6">
              <View className="absolute inset-0 bg-pharaoh-gold/20 rounded-full scale-125" />
              <View className="w-20 h-20 bg-pharaoh-gold rounded-full flex items-center justify-center shadow-lg">
                <Ionicons name="checkmark" size={40} color="white" />
              </View>
            </View>

            <View className="items-center gap-2 mb-6">
              <Text className="font-headline text-display-lg text-center" style={{ color: colors.onSurface }}>
                {t('bookings.experienceConfirmed', 'Booking Created Successfully! 🎉')}
              </Text>
              <Text className="font-body text-body-md text-center leading-relaxed px-4" style={{ color: colors.onSurfaceVariant }}>
                {t('bookings.experienceConfirmedSubtitle', 'Your sanctuary reservation is confirmed. We look forward to welcoming you.')}
              </Text>
            </View>

            {/* Booking Details Card */}
            <View 
              className="border p-5 rounded-2xl w-full shadow-sm mb-6"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <View className="flex-row justify-between items-center pb-3 border-b mb-3" style={{ borderBottomColor: colors.outlineVariant + '20' }}>
                <Text className="text-xs uppercase font-bold" style={{ color: colors.outline }}>
                  {t('bookings.detail.reservationId', 'Reservation ID')}
                </Text>
                <Text className="font-headline text-sm text-pharaoh-gold font-bold uppercase">
                  #{createdBookingId.substring(0, 8).toUpperCase() || 'RHL-7729'}
                </Text>
              </View>

              <View className="flex-col gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>{t('common.nav.hotels', 'Hotel')}:</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.onSurface }}>{hotelName}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>{t('hotelDetail.datesLabel', 'Dates')}:</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.onSurface }}>{checkIn} → {checkOut}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>{t('bookings.guests', 'Guests')}:</Text>
                  <Text className="text-xs font-bold" style={{ color: colors.onSurface }}>{guests} {t('hotelDetail.guests', 'Guests')} ({rooms} {t('hotelDetail.rooms', 'Room(s)')})</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>{t('bookings.paymentStatusLabel', 'Payment')}:</Text>
                  <Text className="text-xs font-bold text-pharaoh-gold">
                    {paymentMethod === 'stripe' ? t('bookings.paidStripe', 'Stripe Online') : t('bookings.cashOnArrival', 'Cash on Arrival')}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center pt-2 border-t mt-1" style={{ borderTopColor: colors.outlineVariant + '20' }}>
                  <Text className="text-sm font-bold" style={{ color: colors.onSurface }}>{t('hotelDetail.total', 'Total')}:</Text>
                  <Text className="text-base font-bold text-pharaoh-gold">{formatCurrency(totalAmount, hotel?.currency)}</Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={() => router.push(`/booking/${createdBookingId}`)}
                className="w-full bg-pharaoh-gold py-4 rounded-full items-center shadow-md active:scale-95"
              >
                <Text className="text-white font-bold text-label-md">
                  {t('bookings.viewReservation', 'View Booking Details')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)/trips')}
                className="w-full border py-3.5 rounded-full items-center active:scale-95"
                style={{ borderColor: colors.outlineVariant }}
              >
                <Text className="font-semibold text-label-md" style={{ color: colors.onSurface }}>
                  {t('bookings.goToTrips', 'Go to My Trips')}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      )}

    </View>
  );
}