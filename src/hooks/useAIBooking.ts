// src/hooks/useAIBooking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import { useAISessionStore, BookingSession } from '@/store/aiSessionStore';
import { useUIStore } from '@/store/uiStore';
import { useRouter } from 'expo-router';

export function useAIBooking() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showToast } = useUIStore();
  const { bookingSession, resetBookingFlow } = useAISessionStore();

  const startBookingFlow = useMutation({
    mutationFn: async (context?: any) => {
      const response = await api.post('ai/bookings/conversation', {
        json: { message: 'Start booking flow', sessionId: null, context },
      }).json<{ status: 'success'; data: BookingSession }>();
      return response.data;
    },
    onSuccess: (data) => {
      // The store will be updated by the hook
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to start booking flow' });
    },
  });

  const sendBookingMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('ai/bookings/conversation', {
        json: { message, sessionId: bookingSession?.sessionId },
      }).json<{ status: 'success'; data: BookingSession }>();
      return response.data;
    },
    onSuccess: (data) => {
      if (data.isComplete && data.bookingId) {
        showToast({ type: 'success', message: 'Booking completed!' });
        router.push(`/booking/${data.bookingId}`);
      }
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to process booking message' });
    },
  });

  return {
    startBookingFlow: startBookingFlow.mutateAsync,
    sendBookingMessage: sendBookingMessage.mutateAsync,
    isLoading: startBookingFlow.isPending || sendBookingMessage.isPending,
    session: bookingSession,
    step: bookingSession?.step,
    isComplete: bookingSession?.isComplete,
  };
}

export function useAIHotelSearch() {
  const { showToast } = useUIStore();

  const searchHotels = useMutation({
    mutationFn: async (params: { query: string; context?: any }) => {
      return api.post('ai/hotels/search', { json: params }).json<{
        status: 'success';
        data: { reply: string; tokensUsed: number };
      }>();
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'AI hotel search failed' });
    },
  });

  return { searchHotels: searchHotels.mutateAsync, isLoading: searchHotels.isPending };
}

export function useAIHotelRecommendations(tripId?: string) {
  const { showToast } = useUIStore();

  const getRecommendations = useMutation({
    mutationFn: async (params?: { tripId?: string; context?: any }) => {
      const searchParams = new URLSearchParams();
      if (params?.tripId) searchParams.append('tripId', params.tripId);
      if (params?.context) searchParams.append('context', JSON.stringify(params.context));
      return api.get(`ai/hotels/recommendations?${searchParams.toString()}`).json<{
        status: 'success';
        data: { reply: string; tokensUsed: number };
      }>();
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Failed to get recommendations' });
    },
  });

  return { getRecommendations: getRecommendations.mutateAsync, isLoading: getRecommendations.isPending };
}

export function useAIChatMutation() {
  const { showToast } = useUIStore();

  const sendMessage = useMutation({
    mutationFn: async (messages: any[]) => {
      return api.post('ai/chat', { json: { messages } }).json<{
        status: 'success';
        data: { reply: string; tokensUsed: number };
      }>();
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Chat failed' });
    },
  });

  return { sendMessage: sendMessage.mutateAsync, isLoading: sendMessage.isPending };
}

export function useTripGeneration() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const router = useRouter();

  const generateTrip = useMutation({
    mutationFn: async (params: { destination: string; duration: number; budget?: string; travelers?: number; interests?: string[]; language?: string; imageUrl?: string }) => {
      return api.post('trips/generate', { json: params }).json<{
        status: 'success';
        data: { trip: any; tokensUsed: number };
      }>();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      router.push(`/trip/${data.data.trip._id}`);
    },
    onError: (error: any) => {
      showToast({ type: 'error', message: error.response?.data?.message || 'Trip generation failed' });
    },
  });

  return { generateTrip: generateTrip.mutateAsync, isLoading: generateTrip.isPending };
}