// src/hooks/useBookingPayment.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export function useBookingPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  const createCheckout = useMutation({
    mutationFn: async (params: { bookingId: string; currency: string }) => {
      return api.post('payments/pay/checkout', { json: params }).json<{
        status: 'success';
        data: { url: string; sessionId: string; amount: number; currency: string; bookingId: string };
      }>();
    },
    onSuccess: async (data) => {
      // Open Stripe Checkout in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.data.url,
        'rahal://booking/payment-return'
      );

      if (result.type === 'success') {
        // Payment completed or cancelled - poll for status
        showToast({ type: 'success', message: 'Payment completed!' });
        // Invalidate queries to refresh booking status
        queryClient.invalidateQueries({ queryKey: ['booking', data.data.bookingId] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        router.push(`/booking/${data.data.bookingId}`);
      }
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to create payment session' });
    },
  });

  return { createCheckout: createCheckout.mutateAsync, isPending: createCheckout.isPending };
}

export function useSubscriptionUpgrade() {
  const { showToast } = useUIStore();
  const router = useRouter();

  const upgrade = useMutation({
    mutationFn: (planName: string) =>
      api.post('subscriptions/pay/upgrade', { json: { planName } }).json<{
        status: 'success';
        data: { url: string; sessionId: string };
      }>(),
    onSuccess: async (data) => {
      const result = await WebBrowser.openAuthSessionAsync(
        data.data.url,
        'rahal://subscription/return'
      );
      if (result.type === 'success') {
        showToast({ type: 'success', message: 'Subscription upgraded!' });
        router.replace('/settings/profile');
      }
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to upgrade subscription' });
    },
  });

  return { upgrade: upgrade.mutateAsync, isPending: upgrade.isPending };
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