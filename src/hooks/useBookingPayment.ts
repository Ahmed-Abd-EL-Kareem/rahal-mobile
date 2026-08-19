// src/hooks/useBookingPayment.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

WebBrowser.maybeCompleteAuthSession();

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useBookingPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const stripe = useStripe();

  const payBookingWithStripe = useMutation({
    mutationFn: async (params: { bookingId: string; currency?: string }) => {
      const currency = (params.currency || 'USD').toLowerCase();

      // If running in Expo Go or if native Stripe is not initialized, use hosted Checkout session as seamless fallback
      if (isExpoGo || !stripe?.initPaymentSheet) {
        const checkoutRes = await api.post('payments/booking/pay/checkout', {
          json: {
            bookingId: params.bookingId,
            currency,
          },
        }).json<{
          status: 'success';
          data: {
            url: string;
            sessionId: string;
            amount: number;
            currency: string;
            bookingId: string;
          };
        }>();

        if (checkoutRes.data?.url) {
          const browserResult = await WebBrowser.openAuthSessionAsync(
            checkoutRes.data.url,
            'rahal://booking/payment-return'
          );

          if (browserResult.type === 'success') {
            return { success: true, bookingId: params.bookingId };
          }
          return { canceled: true, bookingId: params.bookingId };
        }
        throw new Error('Failed to obtain payment checkout URL');
      }

      // Native In-App PaymentSheet Flow (Development Build / Standalone Build)
      try {
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

        const { error: initError } = await stripe.initPaymentSheet({
          merchantDisplayName: 'Rahal Travel',
          customerId: data.customerId,
          customerEphemeralKeySecret: data.ephemeralKeySecret,
          paymentIntentClientSecret: data.paymentIntentClientSecret,
          style: 'automatic',
          returnURL: 'rahal://booking/payment-return',
        });

        if (initError) {
          throw new Error(initError.message || 'Failed to initialize payment sheet');
        }

        const { error: presentError } = await stripe.presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            return { canceled: true, bookingId: data.bookingId };
          }
          throw new Error(presentError.message || 'Payment presentation failed');
        }

        return { success: true, bookingId: data.bookingId };
      } catch (nativeErr: any) {
        console.warn('[useBookingPayment] Native PaymentSheet failed, falling back to WebBrowser:', nativeErr);

        // Fallback to hosted checkout if native PaymentSheet encounters an environment error
        const fallbackRes = await api.post('payments/booking/pay/checkout', {
          json: {
            bookingId: params.bookingId,
            currency,
          },
        }).json<{
          status: 'success';
          data: { url: string; sessionId: string; bookingId: string };
        }>();

        if (fallbackRes.data?.url) {
          const browserResult = await WebBrowser.openAuthSessionAsync(
            fallbackRes.data.url,
            'rahal://booking/payment-return'
          );

          if (browserResult.type === 'success') {
            return { success: true, bookingId: params.bookingId };
          }
          return { canceled: true, bookingId: params.bookingId };
        }

        throw nativeErr;
      }
    },
    onSuccess: (result) => {
      if (result.success) {
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
      // If running in Expo Go or if native Stripe is not initialized, use hosted Checkout session
      if (isExpoGo || !stripe?.initPaymentSheet) {
        const checkoutRes = await api.post('subscriptions/pay/upgrade', {
          json: { planName },
        }).json<{
          status: 'success';
          data: { url: string; sessionId: string };
        }>();

        if (checkoutRes.data?.url) {
          const browserResult = await WebBrowser.openAuthSessionAsync(
            checkoutRes.data.url,
            'rahal://subscription/return'
          );

          if (browserResult.type === 'success') {
            return { success: true, planName };
          }
          return { canceled: true };
        }
        throw new Error('Failed to obtain subscription checkout URL');
      }

      // Native In-App PaymentSheet Flow
      try {
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

        const { error: initError } = await stripe.initPaymentSheet({
          merchantDisplayName: 'Rahal Travel',
          customerId: data.customerId,
          customerEphemeralKeySecret: data.ephemeralKeySecret,
          paymentIntentClientSecret: data.paymentIntentClientSecret,
          style: 'automatic',
          returnURL: 'rahal://subscription/return',
        });

        if (initError) {
          throw new Error(initError.message || 'Failed to initialize payment sheet');
        }

        const { error: presentError } = await stripe.presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            return { canceled: true };
          }
          throw new Error(presentError.message || 'Payment presentation failed');
        }

        return { success: true, planName: data.planName };
      } catch (nativeErr: any) {
        console.warn('[useSubscriptionUpgrade] Native PaymentSheet failed, falling back to WebBrowser:', nativeErr);

        const fallbackRes = await api.post('subscriptions/pay/upgrade', {
          json: { planName },
        }).json<{
          status: 'success';
          data: { url: string; sessionId: string };
        }>();

        if (fallbackRes.data?.url) {
          const browserResult = await WebBrowser.openAuthSessionAsync(
            fallbackRes.data.url,
            'rahal://subscription/return'
          );

          if (browserResult.type === 'success') {
            return { success: true, planName };
          }
          return { canceled: true };
        }

        throw nativeErr;
      }
    },
    onSuccess: async (result) => {
      if (result.success) {
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