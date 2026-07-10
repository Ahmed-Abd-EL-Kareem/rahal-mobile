// app/booking/[id].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useBooking, useCancelBooking, useBookingPayment } from '@/api/hooks/useBookings';
import { usePaymentStatus } from '@/api/hooks/useBookings';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils';

export default function BookingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useUIStore();

  const { data: booking, isLoading, error, refetch } = useBooking(params.id);
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { createCheckout, isPending: isCreatingCheckout } = useBookingPayment();
  const { data: paymentStatus, isLoading: isLoadingStatus } = usePaymentStatus(params.id);

  const [isPaying, setIsPaying] = useState(false);

  const handleCancelBooking = async () => {
    Alert.alert(
      t('bookings.detail.cancelConfirmTitle'),
      t('bookings.detail.cancelConfirmText'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('bookings.detail.cancelBooking'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(params.id);
              showToast({ type: 'success', message: t('bookings.detail.cancelSuccess') });
              refetch();
            } catch (error: any) {
              showToast({ type: 'error', message: error.response?.data?.message || 'Failed to cancel booking' });
            }
          },
        },
      ]
    );
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to complete your booking payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    setIsPaying(true);
    try {
      await createCheckout({
        bookingId: params.id,
        currency: booking?.currency?.toLowerCase() || 'egp',
      });
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to create payment session' });
    } finally {
      setIsPaying(false);
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

  if (error || !booking) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={64} color="#8F1301" />
          <Text className="text-headline-md font-headline text-on-surface mt-4 mb-2">Booking Not Found</Text>
          <Text className="text-body-md text-on-surface-variant text-center mb-6">
            The requested booking details could not be retrieved.
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            {t('bookings.detail.back')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const b = booking;
  const hotel = b.hotel;
  const totalNights = b.checkIn && b.checkOut
    ? Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  const payment = paymentStatus?.data;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative h-[300px]">
          <Image
            source={{ uri: hotel?.coverImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View className="absolute inset-0" style={{ backgroundColor: 'rgba(20, 16, 15, 0.5)' }} />

          {/* Status Badges */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <Badge variant={b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'blue' : b.status === 'canceled' ? 'red' : 'default'}>
              {t(`bookings.status.${b.status}`)}
            </Badge>
            <Badge variant={payment?.paymentStatus === 'succeeded' ? 'green' : payment?.paymentStatus === 'pending' ? 'blue' : 'red'}>
              {t(`bookings.paymentStatus.${payment?.paymentStatus || 'pending'}`)}
            </Badge>
          </View>

          {/* Bottom Info */}
          <View className="absolute bottom-4 left-4 right-4">
            <View className="flex-row items-center gap-2 mb-2 text-white/80">
              <MaterialIcons name="location-on" size={16} />
              <Text>{hotel?.city}</Text>
            </View>
            <Text className="text-display-lg-mobile font-headline text-white mb-1">{hotel?.name?.en}</Text>
            <View className="flex-row items-center gap-4 mt-2">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80">{formatDate(b.checkIn)} - {formatDate(b.checkOut)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="people" size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80">{b.guests} guests</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4 pb-20">
          {/* AI Insight */}
          <View className="mb-4 p-4 bg-primary/5 border border-primary/30 rounded-2xl flex-row items-start gap-3">
            <View className="p-2 rounded-xl bg-primary/10">
              <Ionicons name="sparkles" size={20} color="#C8922A" />
            </View>
            <View className="flex-1">
              <Text className="text-label-md font-medium text-primary mb-1">{t('bookings.detail.rahalInsightTitle')}</Text>
              <Text className="text-body-md text-on-surface-variant">
                {t('bookings.detail.rahalInsightDesc')}
              </Text>
            </View>
          </View>

          {/* Reservation Details */}
          <Card className="mb-4">
            <CardContent>
              <Text className="text-headline-md font-headline text-on-surface mb-4">{t('bookings.detail.datesTitle')}</Text>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar-outline" size={20} color="#366286" />
                  <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.checkIn')}</Text>
                </View>
                <Text className="text-body-md font-medium text-on-surface">
                  {formatDate(b.checkIn)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar-outline" size={20} color="#366286" />
                  <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.checkOut')}</Text>
                </View>
                <Text className="text-body-md font-medium text-on-surface">
                  {formatDate(b.checkOut)}
                </Text>
              </View>
              <View className="border-t border-outline-variant my-3" />
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bed-outline" size={20} color="#366286" />
                  <Text className="text-body-md text-on-surface-variant">{totalNights} {t('common.nights')}</Text>
                </View>
                <Text className="text-body-md text-on-surface-variant">
                  {b.checkInTime} - {b.checkOutTime}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card className="mb-4">
            <CardContent>
              <Text className="text-headline-md font-headline text-on-surface mb-4">{t('bookings.detail.detailsTitle')}</Text>
              <View className="space-y-3">
                <View className="flex-row items-center gap-3">
                  <Ionicons name="people-outline" size={20} color="#366286" />
                  <View>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.guestsCount', { guests: b.guests })}</Text>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.guestsDetail', { adults: b.guests, children: 0 })}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="bed-outline" size={20} color="#366286" />
                  <View>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.roomType')}</Text>
                    <Text className="text-body-md text-on-surface-variant">{hotel?.name?.en}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="restaurant-outline" size={20} color="#366286" />
                  <View>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.breakfastTitle')}</Text>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.breakfastDetail')}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="wifi-outline" size={20} color="#366286" />
                  <View>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.wifiTitle')}</Text>
                    <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.wifiDetail')}</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {b.specialRequests && (
            <Card className="mb-4">
              <CardContent>
                <Text className="text-headline-md font-headline text-on-surface mb-3">{t('bookings.detail.specialRequests')}</Text>
                <Text className="text-body-md text-on-surface-variant">{b.specialRequests}</Text>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card variant="outlined" className="mb-4">
            <CardContent>
              <Text className="text-headline-md font-headline text-on-surface mb-4">{t('bookings.detail.paymentSummary')}</Text>
              <View className="space-y-2 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-body-md text-on-surface-variant">{totalNights} {t('bookings.nightsPrice', { price: formatCurrency(hotel?.averagePricePerNight || 0, hotel?.currency) })}</Text>
                  <Text className="text-body-md font-medium text-on-surface">{formatCurrency(hotel?.averagePricePerNight * totalNights || 0, hotel?.currency)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.serviceCharge')}</Text>
                  <Text className="text-body-md font-medium text-on-surface">{formatCurrency(hotel?.averagePricePerNight * totalNights * 0.12 || 0, hotel?.currency)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-body-md text-on-surface-variant">{t('bookings.detail.vat')}</Text>
                  <Text className="text-body-md font-medium text-on-surface">{formatCurrency(hotel?.averagePricePerNight * totalNights * 0.14 || 0, hotel?.currency)}</Text>
                </View>
              </View>
              <View className="border-t border-outline-variant pt-4 flex-row justify-between">
                <Text className="text-headline-md font-headline text-on-surface">{t('bookings.detail.totalPaid')}</Text>
                <Text className="text-headline-md font-headline text-primary">{formatCurrency(payment?.amountPaid || hotel?.averagePricePerNight * totalNights * 1.26 || 0, hotel?.currency)}</Text>
              </View>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="mb-4" variant={payment?.paymentStatus === 'succeeded' ? 'default' : payment?.paymentStatus === 'pending' ? 'outlined' : 'default'}>
            <CardContent>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className={`w-10 h-10 rounded-lg flex-items-center justify-center ${
                    payment?.paymentStatus === 'succeeded' ? 'bg-green/10' : payment?.paymentStatus === 'pending' ? 'bg-primary/10' : 'bg-error/10'
                  }`}>
                    {payment?.paymentStatus === 'succeeded' ? (
                      <MaterialIcons name="check-circle" size={24} color="#2D7D32" />
                    ) : payment?.paymentStatus === 'pending' ? (
                      <Ionicons name="time-outline" size={24} color="#C8922A" />
                    ) : (
                      <Ionicons name="close-circle-outline" size={24} color="#BA1A1A" />
                    )}
                  </View>
                  <View>
                    <Text className="text-body-md font-medium text-on-surface">{t('bookings.detail.paid')}</Text>
                    <Text className="text-label-sm" style={{ color: payment?.paymentStatus === 'succeeded' ? '#2D7D32' : payment?.paymentStatus === 'pending' ? '#C8922A' : '#BA1A1A' }}>
                      {payment?.paymentStatus === 'succeeded' ? t('bookings.paymentStatus.paid') : payment?.paymentStatus === 'pending' ? t('bookings.paymentStatus.pending') : t('bookings.paymentStatus.failed')}
                    </Text>
                  </View>
                </View>
                {payment?.paidAt && (
                  <Text className="text-body-md text-on-surface-variant">
                    {t('bookings.detail.paidOn', { date: formatDate(payment.paidAt) })}
                  </Text>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Actions */}
          <View className="space-y-3">
            {payment?.paymentStatus !== 'succeeded' && (
              <Button
                onPress={handlePayment}
                disabled={isPaying || isCreatingCheckout}
                fullWidth
                size="lg"
                className="mb-3"
              >
                {isPaying || isCreatingCheckout ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="large" style={{ marginRight: 8 }} />
                    <Text>{t('bookings.paying')}</Text>
                  </>
                ) : (
                  <Text>{t('bookings.payNow')}</Text>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onPress={() => router.push(`/booking/${params.id}/pdf`)}
              fullWidth
            >
              <Ionicons name="document-text-outline" size={20} style={{ marginRight: 8 }} />
              <Text>{t('bookings.detail.viewInvoice')}</Text>
            </Button>

            <Button
              variant="ghost"
              onPress={handleCancelBooking}
              disabled={isCancelling || b.status === 'canceled' || b.status === 'completed'}
              fullWidth
              className="mt-2"
            >
              <Ionicons name="trash-outline" size={20} style={{ marginRight: 8 }} />
              <Text>{t('bookings.detail.cancelBooking')}</Text>
            </Button>

            <Button
              variant="ghost"
              onPress={() => { /* Share */ }}
              fullWidth
              className="mt-2"
            >
              <Ionicons name="share-outline" size={20} style={{ marginRight: 8 }} />
              <Text>{t('bookings.detail.share')}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}