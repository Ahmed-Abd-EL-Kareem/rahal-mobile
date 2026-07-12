// src/api/hooks/useAI.ts
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { ChatMessage } from '@/store/aiSessionStore';

export function useAIChat() {
  return useMutation({
    mutationFn: (messages: ChatMessage[]) => 
      api.post('ai/chat', { json: { messages } }).json<{ status: 'success'; data: { reply: string; tokensUsed: number }; message: string }>(),
  });
}

export function useTripGeneration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { destination: string; duration: number; budget?: string; travelers?: number; interests?: string[]; language?: string; imageUrl?: string }) => 
      api.post('trips/generate', { json: params }).json<{ status: 'success'; data: { trip: any }; message: string; tokensUsed: number }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useAIHotelSearch() {
  return useMutation({
    mutationFn: (params: { query: string; context?: { tripId?: string; checkIn?: string; checkOut?: string; guests?: number; rooms?: number; limit?: number } }) => 
      api.post('ai/hotels/search', { json: params }).json<{ status: 'success'; data: { reply: string; tokensUsed: number }; message: string }>(),
  });
}

export function useAIHotelRecommendations(tripId?: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.aiHotelRecommendations(tripId),
    queryFn: () => {
      let url = 'ai/hotels/recommendations';
      const params: string[] = [];
      if (tripId) params.push(`tripId=${tripId}`);
      if (limit) params.push(`limit=${limit}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      return api.get(url).json<{ status: 'success'; message: string; data: { hotels: any[]; tokensUsed: number } }>();
    },
    enabled: !!tripId,
  });
}

export function useAIBookingConversation() {
  return useMutation({
    mutationFn: ({ message, sessionId, context }: { message: string; sessionId?: string; context?: any }) => 
      api.post('ai/bookings/conversation', { json: { message, sessionId, context } }).json<{ status: 'success'; data: { sessionId: string; step: string; aiResponse: string; isComplete: boolean; bookingId: string | null; tokensUsed: number }; message: string }>(),
  });
}

export function useAIUsageStats() {
  return useQuery({
    queryKey: ['ai', 'stats'],
    queryFn: () => api.get('ai/stats').json<{ status: 'success'; data: { aiRequests: number; aiRequestsGrowth: number }; message: string }>(),
  });
}