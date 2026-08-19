// src/components/booking/PaymentSheet.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/api/client';

interface PaymentSheetProps {
  amount: number; // in smallest currency unit (e.g., cents/piasters)
  currency: string;
  bookingId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export const PaymentSheet = ({ amount, currency, bookingId, onSuccess, onError, onCancel }: PaymentSheetProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        const res = await api.post('payments/booking/pay/intent', {
          json: {
            bookingId,
            currency: currency.toLowerCase(),
          },
        }).json<{
          status: 'success';
          data: {
            paymentIntentClientSecret: string;
            ephemeralKeySecret: string;
            customerId: string;
            amount: number;
            currency: string;
            bookingId: string;
          };
        }>();

        if (!isMounted) return;

        if (res.data?.paymentIntentClientSecret) {
          const { error } = await initPaymentSheet({
            merchantDisplayName: 'Rahal Travel',
            paymentIntentClientSecret: res.data.paymentIntentClientSecret,
            customerId: res.data.customerId,
            customerEphemeralKeySecret: res.data.ephemeralKeySecret,
            style: isDark ? 'alwaysDark' : 'alwaysLight',
            returnURL: 'rahal://booking/payment-return',
          });

          if (!error && isMounted) {
            setIsReady(true);
          } else if (error) {
            console.error('[PaymentSheet] init error:', error);
            onError(new Error(error.message || 'Failed to initialize payment'));
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error('[PaymentSheet] intent error:', error);
        onError(error as Error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (bookingId) {
      init();
    }

    return () => {
      isMounted = false;
    };
  }, [bookingId, currency, isDark]);

  const handlePayment = async () => {
    if (!isReady) return;

    setIsLoading(true);
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === 'Canceled') {
        onCancel();
      } else {
        console.error('[PaymentSheet] present error:', error);
        onError(new Error(error.message));
      }
    } else {
      onSuccess();
    }
    setIsLoading(false);
  };

  if (isLoading && !isReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#C8922A" />
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
          {t('booking.flow.paymentProcessing', 'Preparing secure payment...')}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
          {t('booking.flow.paymentUnavailable', 'Payment setup unavailable')}
        </Text>
        <Button variant="outline" onPress={onCancel} className="mt-4 w-auto">
          {t('common.cancel', 'Cancel')}
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryCard, { backgroundColor: colors['surface-container-low'], borderColor: colors.outlineVariant + '33' }]}>
        <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.onSurfaceVariant }}>Amount</Text>
          <Text style={[styles.amountText, { color: colors.primary }]}>
            {(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.onSurfaceVariant }}>Booking Reference</Text>
          <Text style={{ color: colors.onSurface, fontFamily: 'monospace' }}>#{bookingId.slice(0, 8).toUpperCase()}</Text>
        </View>
      </View>

      <Button
        onPress={handlePayment}
        disabled={isLoading}
        fullWidth
        size="lg"
        className="mt-6"
      >
        {isLoading ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
            <Text>{t('booking.flow.paymentProcessing', 'Processing...')}</Text>
          </>
        ) : (
          <Text>{t('booking.flow.payNow', { amount: (amount / 100).toFixed(2), currency: currency.toUpperCase() })}</Text>
        )}
      </Button>

      <Button
        variant="outline"
        onPress={onCancel}
        disabled={isLoading}
        fullWidth
        className="mt-3"
      >
        {t('common.cancel', 'Cancel')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});