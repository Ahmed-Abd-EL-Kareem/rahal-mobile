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
  const totalAmount = b.totalPrice || (roomPrice * roomCount * totalNights * 1.04);

  // Status flags
  const isCanceled = b.status === 'canceled';
  const isConfirmed = b.status === 'confirmed';

  // Hotel name localization
  const getHotelName = (): string => {
    if (!hotel?.name) return 'Heritage Sanctuary';
    if (typeof hotel.name === 'string') return hotel.name;
    if (typeof hotel.name === 'object') {
      return (hotel.name as any)[i18n.language === 'ar' ? 'ar' : 'en'] || (hotel.name as any).en || 'Heritage Sanctuary';
    }
    return 'Heritage Sanctuary';
  };
  const hotelName: string = getHotelName();

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
        className="flex-row justify-between items-center px-4 border-b z-50 shadow-sm"
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant + '26',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2 active:scale-95">
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#C8922A" />
        </TouchableOpacity>
        <Text className="font-headline text-xl text-pharaoh-gold font-bold">
          {t('bookings.detail.title', 'Booking Details')}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} className="p-2 active:scale-95">
          <Ionicons name="sparkles" size={22} color="#C8922A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="p-4 md:p-8 max-w-[800px] mx-auto w-full gap-5">
          
          {/* Reservation Header Card */}
          <View 
            className="border rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
          >
            <View className="flex-row justify-between items-start mb-4 pb-3 border-b border-outline-variant/15">
              <View>
                <Text className="text-[11px] text-pharaoh-gold font-bold uppercase tracking-wider text-left">
                  {t('bookings.detail.reservationId', 'Reservation ID')}: #{b._id?.substring(0, 8).toUpperCase() || 'RH-99281'}
                </Text>
                <Text className="font-headline text-xl mt-1 text-left" style={{ color: colors.onSurface }}>
                  {isCanceled ? t('bookings.status.canceled', 'Canceled') : isConfirmed ? t('bookings.status.confirmed', 'Confirmed & Reserved') : t('bookings.status.pending', 'Pending Confirmation')}
                </Text>
              </View>
              <View 
                className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                style={{ backgroundColor: isCanceled ? '#BA1A1A18' : isConfirmed ? '#2D7A4F18' : '#C8922A18' }}
              >
                <Ionicons 
                  name={isCanceled ? "close-circle" : isConfirmed ? "checkmark-circle" : "time"} 
                  size={13} 
                  color={isCanceled ? '#BA1A1A' : isConfirmed ? '#2D7A4F' : '#C8922A'} 
                />
                <Text 
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: isCanceled ? '#BA1A1A' : isConfirmed ? '#2D7A4F' : '#C8922A' }}
                >
                  {b.status || 'pending'}
                </Text>
              </View>
            </View>

            {/* Visual Timeline */}
            <View className="flex-row justify-between items-center px-3 py-1">
              <View className="items-center">
                <View className="w-8 h-8 rounded-full bg-pharaoh-gold items-center justify-center shadow">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
                <Text className="text-[11px] font-bold text-pharaoh-gold mt-1.5">
                  {t('bookings.statusPage.journey.booked', 'Booked')}
                </Text>
              </View>

              <View className="flex-1 h-[2px] mx-2" style={{ backgroundColor: isConfirmed ? colors.pharaohGold : colors.outlineVariant + '4D' }} />

              <View className="items-center">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center shadow"
                  style={{ backgroundColor: isConfirmed ? colors.pharaohGold : colors.surfaceContainerHighest }}
                >
                  <Ionicons name="star" size={14} color={isConfirmed ? 'white' : '#817565'} />
                </View>
                <Text className="text-[11px] font-bold mt-1.5" style={{ color: isConfirmed ? colors.pharaohGold : colors.outline }}>
                  {t('bookings.statusPage.journey.confirmed', 'Confirmed')}
                </Text>
              </View>

              <View className="flex-1 h-[2px] mx-2" style={{ backgroundColor: colors.outlineVariant + '4D' }} />

              <View className="items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center shadow" style={{ backgroundColor: colors.surfaceContainerHighest }}>
                  <Ionicons name="key-outline" size={14} color="#817565" />
                </View>
                <Text className="text-[11px] font-bold mt-1.5" style={{ color: colors.outline }}>
                  {t('hotelDetail.checkIn', 'Check-in')}
                </Text>
              </View>
            </View>
          </View>

          {/* Hotel Summary Card */}
          <Card 
            className="p-0 overflow-hidden border rounded-2xl shadow-sm"
            style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
          >
            <Image
              source={{ uri: hotel?.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbY96CQH0M1fWTY4mM2s9n1JgShaa8Z-wlfUZnFGiDhxhHzmbRyRCw2aY_fMzJRtN0-YKJQxBEOm6YHQWFTGgEpHUCXmV1nm1Dj9yWbOpzEv0sB-rSAgrZbj8rHHprn0xnU3G6WX1jgjoH7P6edji2tZbZ71MRbd7d_gx2CP4yj4f4cHL_SFSKsTafKG242HZKbMJgV_IPIbTmBSXlMCka6vdbDg_WmptmK6xDpoKf3BGThjO9LwTm0SJtRm_C5yFfVQDiY22GDx4' }}
              className="w-full h-44"
              resizeMode="cover"
            />
            <CardContent className="p-5">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                  <Text className="font-headline text-lg text-left" style={{ color: colors.onSurface }}>
                    {hotelName}
                  </Text>
                  <Text className="text-xs text-outline text-left mt-0.5">
                    {hotel?.city || 'Egypt'}, Egypt
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-xl items-center" style={{ backgroundColor: colors.surfaceContainerHigh }}>
                  <Text className="text-[10px] uppercase font-bold" style={{ color: colors.outline }}>
                    {t('bookings.nights', 'Nights')}
                  </Text>
                  <Text className="font-headline text-base font-bold mt-0.5" style={{ color: colors.onSurface }}>
                    {totalNights}
                  </Text>
                </View>
              </View>

              {/* Check-in / Check-out Dates */}
              <View className="flex-row gap-4 pt-3 border-t" style={{ borderTopColor: colors.outlineVariant + '22' }}>
                <View className="flex-row items-center gap-2 flex-1">
                  <Ionicons name="calendar-outline" size={16} color="#C8922A" />
                  <View>
                    <Text className="text-[10px] font-bold uppercase text-left" style={{ color: colors.outline }}>
                      {t('hotelDetail.checkIn', 'Check-in')}
                    </Text>
                    <Text className="text-xs font-bold text-left mt-0.5" style={{ color: colors.onSurface }}>
                      {formatDate(b.checkIn)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2 flex-1">
                  <Ionicons name="log-out-outline" size={16} color="#C8922A" />
                  <View>
                    <Text className="text-[10px] font-bold uppercase text-left" style={{ color: colors.outline }}>
                      {t('hotelDetail.checkOut', 'Check-out')}
                    </Text>
                    <Text className="text-xs font-bold text-left mt-0.5" style={{ color: colors.onSurface }}>
                      {formatDate(b.checkOut)}
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Booked Rooms Breakdown */}
          {roomsList.length > 0 && (
            <View 
              className="border rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
            >
              <View className="flex-row items-center gap-2 border-b pb-3 mb-3" style={{ borderBottomColor: colors.outlineVariant + '20' }}>
                <Ionicons name="bed-outline" size={18} color="#C8922A" />
                <Text className="font-headline text-base text-pharaoh-gold font-bold">
                  {t('hotelDetail.roomTypes', 'Booked Sanctuaries')}
                </Text>
              </View>
              {roomsList.map((roomItem: any, rIdx: number) => (
                <View key={rIdx} className="flex-row justify-between items-center py-2 border-b border-outline-variant/10">
                  <View>
                    <Text className="font-bold text-sm text-left" style={{ color: colors.onSurface }}>
                      {roomItem.roomType || 'Deluxe Sanctuary Room'} × {roomItem.quantity || 1}
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

          {/* Price Summary Card */}
          <View 
            className="border rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }}
          >
            <View className="flex-row items-center gap-2 border-b pb-3 mb-3" style={{ borderBottomColor: colors.outlineVariant + '22' }}>
              <Ionicons name="receipt-outline" size={18} color="#C8922A" />
              <Text className="font-headline text-base text-pharaoh-gold font-bold">
                {t('bookings.detail.paymentSummary', 'Payment Summary')}
              </Text>
            </View>
            
            <View className="flex-col gap-2.5">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>
                  {roomCount} {t('hotelDetail.rooms', 'Room(s)')} × {totalNights} {t('bookings.nights', 'night(s)')}
                </Text>
                <Text className="text-xs font-bold" style={{ color: colors.onSurface }}>
                  {formatCurrency(totalAmount, b.currency || hotel?.currency)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-xs" style={{ color: colors.onSurfaceVariant }}>
                  {t('bookings.paymentStatusLabel', 'Payment Method')}
                </Text>
                <Text className="text-xs font-bold text-pharaoh-gold">
                  {b.specialRequests?.includes('Stripe') ? t('bookings.paidStripe', 'Stripe Online') : t('bookings.cashOnArrival', 'Cash on Arrival')}
                </Text>
              </View>
              
              <View className="h-[1px] border-t border-dashed my-1.5" style={{ borderTopColor: colors.outlineVariant + '4D' }} />
              
              <View className="flex-row justify-between items-center pt-1">
                <Text className="font-headline text-xs uppercase tracking-widest" style={{ color: colors.outline }}>
                  {t('hotelDetail.total', 'Total Amount')}
                </Text>
                <Text className="font-headline text-xl text-pharaoh-gold font-bold">
                  {formatCurrency(totalAmount, b.currency || hotel?.currency)}
                </Text>
              </View>
            </View>

            {/* Cancel Booking Action */}
            {!isCanceled && (
              <View className="mt-5 pt-4 border-t" style={{ borderTopColor: colors.outlineVariant + '22' }}>
                <TouchableOpacity
                  onPress={handleCancelBooking}
                  disabled={isCancelling}
                  className="w-full border border-danger/60 py-3.5 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#BA1A1A" />
                  ) : (
                    <>
                      <Ionicons name="close-circle-outline" size={17} color="#BA1A1A" />
                      <Text className="text-danger font-bold text-xs">
                        {t('bookings.cancelBooking', 'Cancel Reservation')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* AI Concierge Tip Card */}
          <View 
            className="border rounded-2xl p-4 flex-row items-start gap-3"
            style={{ backgroundColor: colors.pharaohGold + '14', borderColor: colors.pharaohGold + '38' }}
          >
            <Ionicons name="sparkles" size={18} color="#C8922A" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-pharaoh-gold font-bold text-xs uppercase tracking-wider text-left mb-1">
                {t('bookings.detail.rahalInsightTitle', 'AI Concierge Tip')}
              </Text>
              <Text className="text-xs font-body italic leading-relaxed text-left" style={{ color: colors.onSurfaceVariant }}>
                {aiTip}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}