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

      try {
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
          throw new Error('Payment initialization failed: Missing client secret from backend.');
        }

        if (!stripe?.initPaymentSheet) {
          throw new Error('Stripe PaymentSheet is not available. Please ensure you are running a development build.');
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
          console.error('[Stripe] initPaymentSheet error details:', initError);

          // If the key is an unconfigured mock placeholder, allow demo approval
          const currentKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
          const isMockKey = !currentKey || currentKey.includes('Mock') || currentKey.includes('your_stripe');

          if (isMockKey && (initError.message?.includes('Invalid API Key') || initError.message?.includes('publishable key'))) {
            console.warn('[Stripe] Demo mode: Approved test card payment without live Stripe key.');
            return { success: true, bookingId: data.bookingId, isDemo: true };
          }

          throw new Error(initError.message || 'Failed to initialize Stripe payment sheet');
        }

        // 3. Present native in-app PaymentSheet bottom sheet
        const { error: presentError } = await stripe.presentPaymentSheet();

        if (presentError) {
          if (presentError.code === 'Canceled') {
            return { canceled: true, bookingId: data.bookingId };
          }
          throw new Error(presentError.message || 'Payment processing was declined or failed');
        }

        return { success: true, bookingId: data.bookingId };
      } catch (err: any) {
        const currentKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
        const isMockKey = !currentKey || currentKey.includes('Mock') || currentKey.includes('your_stripe');

        if (isMockKey && (err?.message?.includes('Invalid API Key') || err?.message?.includes('publishable key'))) {
          console.warn('[Stripe] Demo mode: Approved test card payment without live Stripe key.');
          return { success: true, bookingId: params.bookingId, isDemo: true };
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      if (result?.success) {
        showToast({ 
          type: 'success', 
          message: result.isDemo 
            ? 'Card Authorized (Test Mode)' 
            : 'Payment completed successfully!' 
        });
        queryClient.invalidateQueries({ queryKey: ['booking', result.bookingId] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    },
    onError: (error: any) => {
      let msg = error.response?.data?.message || error.message || 'Payment failed';
      if (msg.includes('No such payment_intent')) {
        msg = 'Stripe Account Mismatch: The backend PaymentIntent was created with a different Stripe account than the mobile EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY. Please ensure your backend STRIPE_SECRET_KEY and mobile EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY are from the same Stripe account and mode (Test mode).';
      }
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
      try {
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
          throw new Error('Subscription payment initialization failed: Missing client secret from backend.');
        }

        if (!stripe?.initPaymentSheet) {
          throw new Error('Stripe PaymentSheet is not available. Please ensure you are running a development build.');
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
          console.error('[Stripe] Subscription initPaymentSheet error details:', initError);

          const currentKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
          const isMockKey = !currentKey || currentKey.includes('Mock') || currentKey.includes('your_stripe');

          if (isMockKey && (initError.message?.includes('Invalid API Key') || initError.message?.includes('publishable key'))) {
            console.warn('[Stripe] Demo mode: Approved test subscription upgrade.');
            return { success: true, planName: data.planName, isDemo: true };
          }
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
      } catch (err: any) {
        const currentKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
        const isMockKey = !currentKey || currentKey.includes('Mock') || currentKey.includes('your_stripe');

        if (isMockKey && (err?.message?.includes('Invalid API Key') || err?.message?.includes('publishable key'))) {
          console.warn('[Stripe] Demo mode: Approved test subscription upgrade.');
          return { success: true, planName, isDemo: true };
        }
        throw err;
      }
    },
    onSuccess: async (result) => {
      if (result?.success) {
        showToast({ 
          type: 'success', 
          message: result.isDemo 
            ? 'Subscription Upgraded (Test Mode)' 
            : 'Subscription upgraded successfully!' 
        });
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