// src/hooks/useBookingPayment.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function useBookingPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const stripe = useStripe();

  const payBookingWithStripe = useMutation({
    mutationFn: async (params: { bookingId: string; currency?: string }) => {
      const currency = (params.currency || 'USD').toLowerCase();

      // 1. Request in-app PaymentIntent & Ephemeral Key from backend
      const res = await api.post('payments/booking/pay/intent', {
        json: {
          bookingId: params.bookingId,
          currency,
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

      const { data } = res;

      if (!data?.paymentIntentClientSecret) {
        throw new Error('Payment initialization failed: Missing client secret.');
      }

      if (!stripe?.initPaymentSheet) {
        throw new Error('Stripe PaymentSheet is not available. Please ensure you are running a development build (npx expo run:android).');
      }

      // 2. Initialize native In-App PaymentSheet
      const { error: initError } = await stripe.initPaymentSheet({
        merchantDisplayName: 'Rahal Travel',
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        paymentIntentClientSecret: data.paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
        style: 'automatic',
        returnURL: 'rahal://booking/payment-return',
        defaultBillingDetails: {
          name: useAuthStore.getState().user?.name || '',
          email: useAuthStore.getState().user?.email || '',
        },
      });

      if (initError) {
        throw new Error(initError.message || 'Failed to initialize payment sheet');
      }

      // 3. Present native in-app PaymentSheet bottom sheet
      const { error: presentError } = await stripe.presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { canceled: true, bookingId: data.bookingId };
        }
        throw new Error(presentError.message || 'Payment failed');
      }

      return { success: true, bookingId: data.bookingId };
    },
    onSuccess: (result) => {
      if (result?.success) {
        showToast({ type: 'success', message: 'Payment completed successfully!' });
        queryClient.invalidateQueries({ queryKey: ['booking', result.bookingId] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Payment failed';
      showToast({ type: 'error', message: msg });
    },
  });

  return {
    payBookingWithStripe: payBookingWithStripe.mutateAsync,
    isPending: payBookingWithStripe.isPending,
  };
}

export function useSubscriptionUpgrade() {
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const stripe = useStripe();

  const upgradeWithStripe = useMutation({
    mutationFn: async (planName: string) => {
      // 1. Request in-app Subscription PaymentIntent & Ephemeral Key from backend
      const res = await api.post('subscriptions/pay/intent', {
        json: { planName },
      }).json<{
        status: 'success';
        data: {
          paymentIntentClientSecret: string;
          ephemeralKeySecret: string;
          customerId: string;
          amount: number;
          currency: string;
          subscriptionId: string;
          planName: string;
        };
      }>();

      const { data } = res;

      if (!data?.paymentIntentClientSecret) {
        throw new Error('Subscription payment initialization failed: Missing client secret.');
      }

      if (!stripe?.initPaymentSheet) {
        throw new Error('Stripe PaymentSheet is not available. Please ensure you are running a development build (npx expo run:android).');
      }

      // 2. Initialize native In-App PaymentSheet
      const { error: initError } = await stripe.initPaymentSheet({
        merchantDisplayName: 'Rahal Travel',
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKeySecret,
        paymentIntentClientSecret: data.paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
        style: 'automatic',
        returnURL: 'rahal://subscription/return',
        defaultBillingDetails: {
          name: useAuthStore.getState().user?.name || '',
          email: useAuthStore.getState().user?.email || '',
        },
      });

      if (initError) {
        throw new Error(initError.message || 'Failed to initialize payment sheet');
      }

      // 3. Present native in-app PaymentSheet bottom sheet
      const { error: presentError } = await stripe.presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { canceled: true };
        }
        throw new Error(presentError.message || 'Payment failed');
      }

      return { success: true, planName: data.planName };
    },
    onSuccess: async (result) => {
      if (result?.success) {
        showToast({ type: 'success', message: 'Subscription upgraded successfully!' });
        await useAuthStore.getState().fetchSubscription();
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Subscription upgrade failed';
      showToast({ type: 'error', message: msg });
    },
  });

  return {
    upgrade: upgradeWithStripe.mutateAsync,
    isPending: upgradeWithStripe.isPending,
  };
}

export function useBookingPaymentStatus(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.paymentStatus(bookingId),
    queryFn: () => api.get(`payments/pay/status/${bookingId}`).json<{
      status: 'success';
      data: {
        bookingId: string;
        paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
        amountPaid: number;
        currency: string;
        paidAt: string | null;
        failureReason: string | null;
        bookingStatus: string;
      };
    }>(),
    enabled: !!bookingId,
    refetchInterval: 3000,
    retry: 10,
  });
}