// app/booking/[id].tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Button } from '@/components/ui';
import { useBooking, useCancelBooking } from '@/api/hooks/useBookings';
import { formatCurrency } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

export default function BookingDetailScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark, isRTL } = useTheme();

  // Load reservation details from backend
  const { data: bookingResponse, isLoading, error, refetch } = useBooking(params.id);
  const cancelBooking = useCancelBooking();

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async () => {
    Alert.alert(
      t('bookings.cancelConfirmTitle', 'Cancel Reservation'),
      t('bookings.cancelConfirmDesc', 'Are you sure you want to cancel this heritage booking? This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Keep Reservation'), style: 'cancel' },
        {
          text: t('bookings.cancelBooking', 'Cancel Reservation'),
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelBooking.mutateAsync(params.id);
              Alert.alert(t('common.success', 'Success'), t('bookings.cancelSuccess', 'Your reservation was canceled successfully.'));
              refetch();
            } catch (err: any) {
              Alert.alert(t('common.error', 'Error'), err.response?.data?.message || 'Failed to cancel reservation');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#C8922A" />
      </View>
    );
  }

  if (error || !bookingResponse || !bookingResponse.data) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6" style={{ backgroundColor: colors.background }}>
        <Ionicons name="alert-circle-outline" size={64} color="#8F1301" />
        <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">
          {t('bookings.errorStateTitle', 'Booking Not Found')}
        </Text>
        <Text className="text-on-surface-variant text-center mb-6">
          {t('bookings.errorStateDesc', 'Unable to retrieve reservation details.')}
        </Text>
        <Button variant="outline" onPress={() => router.push('/(tabs)/hotel')}>
          {t('common.returnToHotels', 'Return to Hotels')}
        </Button>
      </View>
    );
  }

  const b = bookingResponse.data;
  const hotel = b.hotel as any;

  const totalNights = b.checkIn && b.checkOut
    ? Math.max(1, Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Safe room counting and details extraction
  const roomsList = Array.isArray(b.rooms) ? b.rooms : [];
  const roomCount = roomsList.length > 0 
    ? roomsList.reduce((sum: number, r: any) => sum + (r.quantity || 1), 0)
    : (typeof b.rooms === 'number' ? b.rooms : 1);

  const roomPrice = hotel?.averagePricePerNight || 320;
  const subtotal = roomPrice * roomCount * totalNights;
  const aiCuratorFee = 45;
  const conservationTax = 12.50;
  const totalAmount = b.totalPrice || (subtotal + aiCuratorFee + conservationTax);

  // Status flags
  const isCanceled = b.status === 'canceled';
  const isConfirmed = b.status === 'confirmed';

  // Hotel name localization
  const hotelName = (hotel?.name && typeof hotel.name === 'object')
    ? (hotel.name[i18n.language === 'ar' ? 'ar' : 'en'] || hotel.name.en || '')
    : (hotel?.name || 'Heritage Sanctuary');

  // AI Concierge Tip based on city
  const aiTip = hotel?.city === 'Luxor' 
    ? t('bookings.aiTipLuxor', '"Your room faces the tranquil West Bank. I recommend sunset tea on the balcony at 5:30 PM for the best light."')
    : hotel?.city === 'Aswan'
    ? t('bookings.aiTipAswan', '"Your room faces the Elephantine Island. I recommend sunset tea on the terrace at 5:15 PM for the best light."')
    : t('bookings.aiTipDefault', '"Enjoy your stay! I recommend checking out the local heritage markets in the evening for a magical experience."');

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
          {t('bookings.detail.reservationId', 'Booking Detail')}
        </Text>
        <TouchableOpacity className="p-2 active:scale-95">
          <Ionicons name="sparkles" size={24} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-4 md:p-10 max-w-[1200px] mx-auto w-full">
          
          {/* Reservation Hero Card */}
          <View 
            className="border rounded-xl p-6 shadow-sm mb-6"
            style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
          >
            <View className="flex-col md:flex-row justify-between items-start mb-6 gap-4 border-b border-outline-variant/10 pb-4">
              <View>
                <Text className="text-xs text-pharaoh-gold font-bold uppercase tracking-wider">
                  Reservation ID: #{b._id?.substring(0, 8).toUpperCase() || 'RH-99281'}
                </Text>
                <Text className="font-headline text-headline-md mt-1 text-left" style={{ color: colors.onSurface }}>
                  {isCanceled ? t('bookings.status.canceled', 'Canceled') : isConfirmed ? t('bookings.status.confirmed', 'Confirmed & Waiting') : t('bookings.status.pending', 'Pending Reservation')}
                </Text>
              </View>
              <View className="bg-papyrus-green/10 px-4 py-2 rounded-full flex-row items-center gap-1.5 self-start">
                <Ionicons name="checkmark-circle" size={14} color="#2D7A4F" />
                <Text className="text-papyrus-green text-xs font-bold font-label">
                  {t('bookings.verifiedByAi', 'Verified by AI Concierge')}
                </Text>
              </View>
            </View>

            {/* Horizontal Timeline */}
            <View className="relative flex-row justify-between items-center px-4 py-2">
              <View className="absolute top-[28px] left-8 right-8 h-[2px] bg-outline-variant/30" />
              <View 
                className="absolute top-[28px] left-8 h-[2px] bg-pharaoh-gold" 
                style={{ width: isConfirmed ? '50%' : isCanceled ? '0%' : '20%' }} 
              />

              {/* Booked Step */}
              <View className="items-center z-10 px-2" style={{ backgroundColor: colors.surface }}>
                <View className="w-10 h-10 rounded-full bg-pharaoh-gold items-center justify-center shadow">
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
                <Text className="text-xs font-bold text-pharaoh-gold mt-2">
                  {t('bookings.stepBooked', 'Booked')}
                </Text>
                <Text className="text-[10px] mt-0.5" style={{ color: colors.outline }}>
                  {t('bookings.status.completed', 'Completed')}
                </Text>
              </View>

              {/* Confirmed Step */}
              <View className="items-center z-10 px-2" style={{ backgroundColor: colors.surface }}>
                <View className="w-10 h-10 rounded-full items-center justify-center shadow" style={{ backgroundColor: isConfirmed ? colors.pharaohGold : colors.surfaceContainerHighest }}>
                  <Ionicons name="star" size={18} color={isConfirmed ? 'white' : '#817565'} />
                </View>
                <Text className="text-xs font-bold mt-2" style={{ color: isConfirmed ? colors.pharaohGold : colors.outline }}>
                  {t('bookings.status.confirmed', 'Confirmed')}
                </Text>
                <Text className="text-[10px] mt-0.5" style={{ color: colors.outline }}>
                  {isConfirmed ? t('bookings.active', 'Active') : t('bookings.status.pending', 'Pending')}
                </Text>
              </View>

              {/* Check-in Step */}
              <View className="items-center z-10 px-2" style={{ backgroundColor: colors.surface }}>
                <View className="w-10 h-10 rounded-full items-center justify-center shadow" style={{ backgroundColor: colors.surfaceContainerHighest }}>
                  <Ionicons name="time-outline" size={18} color="#817565" />
                </View>
                <Text className="text-xs font-bold mt-2" style={{ color: colors.outline }}>
                  {t('hotelDetail.checkIn', 'Check-in')}
                </Text>
                <Text className="text-[10px] mt-0.5" style={{ color: colors.outline }}>
                  {formatDate(b.checkIn)}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content Layout */}
          <View className="flex-col gap-6">
            
            {/* Hotel Summary Details */}
            <Card 
              className="p-0 overflow-hidden border rounded-xl shadow-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <Image
                source={{ uri: hotel?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbY96CQH0M1fWTY4mM2s9n1JgShaa8Z-wlfUZnFGiDhxhHzmbRyRCw2aY_fMzJRtN0-YKJQxBEOm6YHQWFTGgEpHUCXmV1nm1Dj9yWbOpzEv0sB-rSAgrZbj8rHHprn0xnU3G6WX1jgjoH7P6edji2tZbZ71MRbd7d_gx2CP4yj4f4cHL_SFSKsTafKG242HZKbMJgV_IPIbTmBSXlMCka6vdbDg_WmptmK6xDpoKf3BGThjO9LwTm0SJtRm_C5yFfVQDiY22GDx4' }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <CardContent className="p-6">
                <View className="flex-row justify-between items-start gap-4 mb-4">
                  <View className="flex-1">
                    <Text className="font-headline text-headline-md text-left" style={{ color: colors.onSurface }}>
                      {hotelName}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Ionicons name="star" size={14} color="#C8922A" />
                      <Text className="text-xs font-label ml-2" style={{ color: colors.outline }}>
                        {hotel?.stars || 5}.0 ({t('hotelListing.luxuryLandmark', 'Heritage Class')})
                      </Text>
                    </View>
                  </View>
                  <View className="px-4 py-2.5 rounded-lg items-center min-w-[70px]" style={{ backgroundColor: colors.surfaceContainerHigh }}>
                    <Text className="text-[10px] uppercase font-label" style={{ color: colors.outline }}>
                      {t('bookings.nights', 'Nights')}
                    </Text>
                    <Text className="font-headline text-headline-md-mobile mt-0.5" style={{ color: colors.onSurface }}>
                      {totalNights}
                    </Text>
                  </View>
                </View>

                {/* Check In / Out info row */}
                <View className="flex-row gap-6 pt-4 border-t" style={{ borderTopColor: colors.outlineVariant + '33' }}>
                  <View className="flex-row items-start gap-2 flex-1">
                    <Ionicons name="calendar-outline" size={18} color="#C8922A" className="mt-0.5" />
                    <View>
                      <Text className="text-xs font-label uppercase text-left" style={{ color: colors.outline }}>
                        {t('hotelDetail.checkIn', 'Check-in')}
                      </Text>
                      <Text className="text-sm font-bold mt-0.5 text-left" style={{ color: colors.onSurface }}>
                        {formatDate(b.checkIn)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start gap-2 flex-1">
                    <Ionicons name="log-out-outline" size={18} color="#C8922A" className="mt-0.5" />
                    <View>
                      <Text className="text-xs font-label uppercase text-left" style={{ color: colors.outline }}>
                        {t('hotelDetail.checkOut', 'Check-out')}
                      </Text>
                      <Text className="text-sm font-bold mt-0.5 text-left" style={{ color: colors.onSurface }}>
                        {formatDate(b.checkOut)}
                      </Text>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Booked Rooms Breakdown Section */}
            {roomsList.length > 0 && (
              <View 
                className="border rounded-xl p-5 shadow-sm"
                style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
              >
                <View className="flex-row items-center gap-2 border-b pb-3 mb-3" style={{ borderBottomColor: colors.outlineVariant + '20' }}>
                  <Ionicons name="bed-outline" size={18} color="#C8922A" />
                  <Text className="font-headline text-headline-md-mobile text-pharaoh-gold">
                    {t('hotelDetail.roomTypes', 'Booked Sanctuaries')}
                  </Text>
                </View>
                {roomsList.map((roomItem: any, rIdx: number) => (
                  <View key={rIdx} className="flex-row justify-between items-center py-2">
                    <View>
                      <Text className="font-bold text-sm text-left" style={{ color: colors.onSurface }}>
                        {roomItem.roomType || 'Deluxe Room'} × {roomItem.quantity || 1}
                      </Text>
                      <Text className="text-xs text-outline text-left mt-0.5">
                        {roomItem.guests?.adults || 2} {t('hotelDetail.guests', 'Guests')}
                      </Text>
                    </View>
                    <Text className="font-bold text-sm text-pharaoh-gold">
                      {formatCurrency(roomItem.pricePerNight || roomPrice, b.currency || hotel?.currency)} / {t('hotelListing.perNight', 'night')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Price Calculations */}
            <View 
              className="border relative p-1 rounded-2xl shadow-resting"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <View className="border border-pharaoh-gold/25 p-5 rounded-xl" style={{ backgroundColor: colors.background }}>
                <View className="flex-row items-center gap-2 border-b pb-3 mb-4" style={{ borderBottomColor: colors.outlineVariant + '33' }}>
                  <Ionicons name="receipt-outline" size={18} color="#C8922A" />
                  <Text className="font-headline text-headline-md-mobile text-pharaoh-gold">
                    {t('bookings.detail.paymentSummary', 'Price Summary')}
                  </Text>
                </View>
                
                <View className="flex-col gap-3.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>
                      {roomCount} {t('hotelDetail.rooms', 'Room(s)')} × {totalNights} {t('bookings.nights', 'night(s)')}
                    </Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>
                      {formatCurrency(subtotal, b.currency || hotel?.currency)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>
                      {t('hotelDetail.serviceFee', 'AI Curator Fee')}
                    </Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>
                      {formatCurrency(aiCuratorFee, b.currency || hotel?.currency)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-body-md font-body" style={{ color: colors.onSurfaceVariant }}>
                      {t('hotelDetail.taxesAndFees', 'Heritage Conservation Tax')}
                    </Text>
                    <Text className="text-body-md font-semibold" style={{ color: colors.onSurface }}>
                      {formatCurrency(conservationTax, b.currency || hotel?.currency)}
                    </Text>
                  </View>
                  
                  <View className="h-[1px] border-t border-dashed my-2 pt-2" style={{ borderTopColor: colors.outlineVariant + '66' }} />
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="font-headline text-label-md uppercase tracking-widest" style={{ color: colors.outline }}>
                      {t('hotelDetail.total', 'Total Amount')}
                    </Text>
                    <Text className="font-headline text-2xl text-pharaoh-gold font-bold">
                      {formatCurrency(totalAmount, b.currency || hotel?.currency)}
                    </Text>
                  </View>
                </View>

                {/* Cancel Booking Action */}
                {!isCanceled && (
                  <View className="mt-8 gap-3">
                    <TouchableOpacity
                      onPress={handleCancelBooking}
                      disabled={isCancelling}
                      className="w-full border border-danger py-3.5 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color="#BA1A1A" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={18} color="#BA1A1A" />
                          <Text className="text-danger font-bold text-label-md">
                            {t('bookings.cancelBooking', 'Cancel Reservation')}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* AI Concierge prompt recommendation */}
            <View 
              className="border rounded-xl p-5 relative overflow-hidden mb-6"
              style={{ backgroundColor: colors.pharaohGold + '14', borderColor: colors.pharaohGold + '4D' }}
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="sparkles" size={16} color="#C8922A" />
                <Text className="text-pharaoh-gold font-bold text-label-sm uppercase tracking-wider">
                  {t('bookings.detail.rahalInsightTitle', 'AI Concierge Tips')}
                </Text>
              </View>
              <Text className="font-body text-body-md italic leading-relaxed mb-4 text-left" style={{ color: colors.onSurfaceVariant }}>
                {aiTip}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/ai')}
                className="flex-row items-center gap-1 active:opacity-85"
              >
                <Text className="text-pharaoh-gold font-bold text-label-sm">
                  {t('bookings.askAiAbout', `Ask Concierge about ${hotel?.city || 'Egypt'}`)}
                </Text>
                <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={14} color="#C8922A" />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}