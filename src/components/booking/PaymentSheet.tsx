// src/components/booking/PaymentSheet.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

interface PaymentSheetProps {
  amount: number; // in smallest currency unit (e.g., piasters for EGP)
  currency: string;
  bookingId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export const PaymentSheet = ({ amount, currency, bookingId, onSuccess, onError, onCancel }: PaymentSheetProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const stripe = useStripe();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // In a real app, you'd fetch the payment intent client secret from your backend
        // For now, we'll simulate this
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payments/pay/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId, currency: currency.toLowerCase() }),
        });

        const data = await response.json();
        if (data.data?.paymentIntentClientSecret) {
          const { error } = await initPaymentSheet({
            merchantDisplayName: 'Rahal Travel',
            paymentIntentClientSecret: data.data.paymentIntentClientSecret,
            customerId: data.data.customerId,
            customerEphemeralKeySecret: data.data.ephemeralKeySecret,
            style: 'automatic', // or 'automatic' for dark mode
            returnURL: 'rahal://booking/payment-return',
          });

          if (!error) {
            setIsReady(true);
          } else {
            console.error('PaymentSheet init error:', error);
            onError(new Error('Failed to initialize payment'));
          }
        }
      } catch (error) {
        console.error('Payment init error:', error);
        onError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [bookingId, currency]);

  const handlePayment = async () => {
    if (!isReady) return;

    setIsLoading(true);
    const { error } = await presentPaymentSheet();

    if (error) {
      console.error('Payment error:', error);
      onError(new Error(error.message));
    } else {
      onSuccess();
    }
    setIsLoading(false);
  };

  if (isLoading && !isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C8922A" />
        <Text style={styles.loadingText}>{t('booking.flow.paymentProcessing')}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('booking.flow.paymentUnavailable')}</Text>
        <Button variant="outline" onPress={onCancel} className="mt-4 w-auto">
          Cancel
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text>Amount</Text>
          <Text style={styles.amountText}>{(amount / 100).toFixed(2)} {currency.toUpperCase()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Booking ID</Text>
          <Text style={{ fontFamily: 'monospace' }}>{bookingId.slice(0, 8)}...</Text>
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
            <ActivityIndicator color="#FFFFFF" size="large" style={{ marginRight: 8 }} />
            <Text>{t('booking.flow.paymentProcessing')}</Text>
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
        {t('common.cancel')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#F0EDE9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C19',
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
    color: '#C8922A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#504536',
    textAlign: 'center',
  },
});