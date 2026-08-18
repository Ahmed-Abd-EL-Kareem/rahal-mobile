// app/booking/flow.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Button } from '@/components/ui';
import { useCreateBooking } from '@/api/hooks/useBookings';
import { useHotel } from '@/api/hooks/useHotels';
import { formatCurrency } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

export default function BookingFlowScreen() {
  const { t } = useTranslation();
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
  const { colors, isDark } = useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [checkIn, setCheckIn] = useState(params.checkIn || '2026-07-15');
  const [checkOut, setCheckOut] = useState(params.checkOut || '2026-07-18');
  const [guests, setGuests] = useState(params.guests ? parseInt(params.guests) : 2);
  const [rooms, setRooms] = useState(params.rooms ? parseInt(params.rooms) : 1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');

  // Fetch real hotel details from backend
  const { data: hotelResponse, isLoading, error } = useHotel(params.hotelId || '');
  const hotel = hotelResponse?.data;
  const createBooking = useCreateBooking();

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
      // Fallback default room if no params or hotel rooms
      setSelectedRoom({
        type: 'Sanctuary Suite',
        pricePerNight: 320,
        capacity: 2
      });
    }
  }, [hotel, params.roomType, params.pricePerNight, isLoading]);

  const totalNights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) || 3;
  const roomPrice = selectedRoom?.pricePerNight || (hotel?.averagePricePerNight || 320);
  const subtotal = roomPrice * rooms * totalNights;
  const aiDiscount = subtotal * 0.10;
  const taxesAndFees = subtotal * 0.14;
  const totalAmount = subtotal - aiDiscount + taxesAndFees;

  const handleNext = () => {
    if (currentStep === 0) {
      if (!checkIn || !checkOut) {
        Alert.alert(t('common.missingInfo', 'Missing Info'), t('hotelDetail.specifyDates', 'Please specify check-in and check-out dates.'));
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
        specialRequests,
      });
      if (response && response.data) {
        setCreatedBookingId(response.data._id);
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
          <Ionicons name="arrow-back" size={24} color="#C8922A" />
        </TouchableOpacity>
        <Text className="font-headline text-2xl text-pharaoh-gold font-bold mt-0.5">Secure Booking</Text>
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
              Stay
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
              Details
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
              Payment
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View className="p-4 md:p-10 max-w-[900px] mx-auto w-full">
            
            {/* STEP 1: Dates & Steppers */}
            {currentStep === 0 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="calendar-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md" style={{ color: colors.onSurface }}>Choose your dates</Text>
                </View>

                <View className="flex-row gap-4">
                  {/* Check In */}
                  <View 
                    className="flex-1 border rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="text-label-sm uppercase tracking-widest mb-1" style={{ color: colors.outline }}>Check-in</Text>
                    <TextInput
                      value={checkIn}
                      onChangeText={setCheckIn}
                      className="text-headline-md-mobile font-headline p-0"
                      style={{ color: colors.onSurface }}
                    />
                  </View>
                  
                  {/* Check Out */}
                  <View 
                    className="flex-1 border rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="text-label-sm uppercase tracking-widest mb-1" style={{ color: colors.outline }}>Check-out</Text>
                    <TextInput
                      value={checkOut}
                      onChangeText={setCheckOut}
                      className="text-headline-md-mobile font-headline p-0"
                      style={{ color: colors.onSurface }}
                    />
                  </View>
                </View>

                {/* Steppers */}
                <View className="gap-4 mt-4">
                  <View 
                    className="flex-row justify-between items-center p-6 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View>
                      <Text className="font-headline text-label-md font-bold" style={{ color: colors.onSurface }}>Guests</Text>
                      <Text className="text-label-sm mt-0.5" style={{ color: colors.outline }}>Adults & Children</Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95">
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <Text className="font-headline text-headline-md-mobile w-8 text-center" style={{ color: colors.onSurface }}>{guests}</Text>
                      <TouchableOpacity onPress={() => setGuests(guests + 1)} className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95">
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View 
                    className="flex-row justify-between items-center p-6 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <View>
                      <Text className="font-headline text-label-md font-bold" style={{ color: colors.onSurface }}>Rooms</Text>
                      <Text className="text-label-sm mt-0.5" style={{ color: colors.outline }}>Suites available</Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity onPress={() => setRooms(Math.max(1, rooms - 1))} className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95">
                        <Ionicons name="remove" size={20} color="#C8922A" />
                      </TouchableOpacity>
                      <Text className="font-headline text-headline-md-mobile w-8 text-center" style={{ color: colors.onSurface }}>{rooms}</Text>
                      <TouchableOpacity onPress={() => setRooms(rooms + 1)} className="w-10 h-10 rounded-full border border-pharaoh-gold items-center justify-center active:scale-95">
                        <Ionicons name="add" size={20} color="#C8922A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Continue Button */}
                <View className="mt-8 items-end">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-pharaoh-gold px-8 py-4 rounded-full flex-row items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-bold text-label-md">Continue to Details</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 2: Special Requests & Fare Summary */}
            {currentStep === 1 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="create-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md" style={{ color: colors.onSurface }}>Personalize your stay</Text>
                </View>

                <View className="flex-col gap-6">
                  {/* Requests Box */}
                  <View 
                    className="p-5 border rounded-xl shadow-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                  >
                    <Text className="font-headline text-label-md mb-3" style={{ color: colors.onSurface }}>Special Requests (Optional)</Text>
                    <TextInput
                      value={specialRequests}
                      onChangeText={setSpecialRequests}
                      placeholder="E.g. High floor, dietary requirements, airport pickup..."
                      placeholderTextColor={colors.onSurfaceVariant + '80'}
                      multiline
                      numberOfLines={4}
                      className="p-4 rounded-lg font-body text-body-md"
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
                      <Text className="font-bold text-pharaoh-gold text-label-sm uppercase tracking-wider">AI Concierge Applied</Text>
                      <Text className="text-xs font-body mt-1 leading-relaxed" style={{ color: colors.onSurfaceVariant }}>
                        Based on your history, we've suggested a Nile-view room and early check-in. A 10% heritage discount has been applied.
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
                        <Text className="font-headline text-headline-md-mobile text-pharaoh-gold">Fare Summary</Text>
                      </View>
                      
                      <View className="flex-col gap-3.5">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>{totalNights} nights × {formatCurrency(roomPrice, hotel?.currency)}</Text>
                          <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>{formatCurrency(subtotal, hotel?.currency)}</Text>
                        </View>
                        
                        <View 
                          className="flex-row justify-between items-center border px-3 py-2 rounded-lg"
                          style={{ backgroundColor: colors.success + '1A', borderColor: colors.success + '33' }}
                        >
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons name="sparkles" size={14} color="#2D7A4F" />
                            <Text className="text-body-sm font-semibold" style={{ color: colors.success }}>AI Heritage Discount (10%)</Text>
                          </View>
                          <Text className="text-body-md font-bold" style={{ color: colors.success }}>-{formatCurrency(aiDiscount, hotel?.currency)}</Text>
                        </View>
                        
                        <View className="flex-row justify-between items-center">
                          <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>Taxes & Fees</Text>
                          <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>{formatCurrency(taxesAndFees, hotel?.currency)}</Text>
                        </View>
                        
                        <View className="h-[1px] border-t border-dashed my-2 pt-2" style={{ borderTopColor: colors.outlineVariant + '66' }} />
                        
                        <View className="flex-row justify-between items-center">
                          <Text className="font-headline text-label-md uppercase tracking-widest" style={{ color: colors.outline }}>Total Amount</Text>
                          <Text className="font-headline text-2xl text-pharaoh-gold font-bold">{formatCurrency(totalAmount, hotel?.currency)}</Text>
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
                    <Ionicons name="arrow-back" size={16} color={colors.outline} />
                    <Text className="font-bold text-label-md" style={{ color: colors.outline }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-pharaoh-gold px-8 py-4 rounded-full flex-row items-center gap-2 shadow-lg active:scale-95"
                  >
                    <Text className="text-white font-bold text-label-md">Proceed to Payment</Text>
                    <Ionicons name="lock-closed" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3: Confirm Payment */}
            {currentStep === 2 && (
              <View className="gap-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="card-outline" size={24} color="#C8922A" />
                  <Text className="font-headline text-headline-md" style={{ color: colors.onSurface }}>Confirm Payment</Text>
                </View>

                 <View 
                   className="p-6 rounded-xl border shadow-sm space-y-6"
                   style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
                 >
                   {/* Mock Visa Card */}
                   <View 
                     className="flex-row items-center justify-between p-4 rounded-xl border"
                     style={{ backgroundColor: colors.surface, borderColor: colors.pharaohGold + '40' }}
                   >
                     <View className="flex-row items-center gap-4">
                       <View className="w-12 h-8 rounded flex items-center justify-center" style={{ backgroundColor: colors.onSurfaceVariant }}>
                         <Text className="text-white text-[10px] font-bold">VISA</Text>
                       </View>
                       <View>
                         <Text className="font-bold text-body-md" style={{ color: colors.onSurface }}>•••• 4412</Text>
                         <Text className="text-xs font-label mt-0.5" style={{ color: colors.outline }}>Expires 12/28</Text>
                       </View>
                     </View>
                     <TouchableOpacity>
                       <Text className="text-pharaoh-gold font-bold text-label-sm">Edit</Text>
                     </TouchableOpacity>
                   </View>

                   {/* Agree Checkbox */}
                   <TouchableOpacity 
                     onPress={() => setIsAgreed(!isAgreed)}
                     className="flex-row items-center gap-3 py-2 active:opacity-80"
                   >
                     <View 
                       className="w-5 h-5 rounded border items-center justify-center"
                       style={{ backgroundColor: isAgreed ? colors.pharaohGold : 'transparent', borderColor: isAgreed ? colors.pharaohGold : colors.outline }}
                     >
                       {isAgreed && <Ionicons name="checkmark" size={14} color="white" />}
                     </View>
                     <Text className="text-body-md flex-1 leading-tight" style={{ color: colors.onSurfaceVariant }}>
                       I agree to the <Text className="text-pharaoh-gold underline">Heritage Terms of Service</Text> and Cancellation Policy.
                     </Text>
                   </TouchableOpacity>
                 </View>

                {/* Complete Booking CTA */}
                <View className="mt-8 flex-col items-center gap-4">
                  <TouchableOpacity
                    onPress={handleBooking}
                    disabled={isProcessing}
                    className="w-full bg-pharaoh-gold py-5 rounded-full flex-row items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-headline-md-mobile">Complete Booking</Text>
                        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <View className="flex-row items-center gap-1.5 justify-center">
                    <Ionicons name="shield-checkmark" size={14} color={colors.outline} />
                    <Text className="text-xs font-label" style={{ color: colors.outline }}>Bank-grade encrypted transaction</Text>
                  </View>
                </View>

                {/* Back button */}
                <TouchableOpacity
                  onPress={handlePrevious}
                  className="px-6 py-4 flex-row items-center gap-2 self-start active:scale-95"
                >
                  <Ionicons name="arrow-back" size={16} color={colors.outline} />
                  <Text className="font-bold text-label-md" style={{ color: colors.outline }}>Back</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Success Screen Overlay */}
      {showSuccessOverlay && (
        <View className="absolute inset-0 z-[100] flex items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
          <View className="max-w-md w-full items-center text-center space-y-6">
            
            {/* Animated Ring */}
            <View className="relative w-32 h-32 items-center justify-center">
              <View className="absolute inset-0 bg-pharaoh-gold/20 rounded-full scale-125" />
              <View className="w-24 h-24 bg-pharaoh-gold rounded-full flex items-center justify-center shadow-lg">
                <Ionicons name="checkmark" size={48} color="white" />
              </View>
            </View>

            <View className="items-center gap-2 mt-4">
              <Text className="font-headline text-display-lg text-center" style={{ color: colors.onSurface }}>Experience Confirmed</Text>
              <Text className="font-body text-body-md text-center leading-relaxed mt-2" style={{ color: colors.onSurfaceVariant }}>
                Your journey to the heart of the Nile begins soon. A detailed itinerary has been sent to your email.
              </Text>
            </View>

            {/* Booking ID box */}
            <View 
              className="border p-4 rounded-xl items-center inline-block shadow-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <Text className="text-label-sm uppercase tracking-wider mb-1" style={{ color: colors.outline }}>Booking ID</Text>
              <Text className="font-headline text-headline-md-mobile text-pharaoh-gold uppercase">
                {createdBookingId.substring(0, 8).toUpperCase() || 'RHL-7729'}
              </Text>
            </View>

            {/* Return / Discover button */}
            <TouchableOpacity
              onPress={() => router.push(`/booking/${createdBookingId}`)}
              className="mt-8 border-2 border-pharaoh-gold px-10 py-4 rounded-full active:scale-95"
            >
              <Text className="text-pharaoh-gold font-bold text-label-md">View Reservation Details</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </View>
  );
}