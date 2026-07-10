// src/api/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Booking } from '@/types/api';

interface BookingsResponse {
  status: 'success';
  length: number;
  data: Booking[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export function useBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery<BookingsResponse>({
    queryKey: queryKeys.bookings(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`bookings?${searchParams.toString()}`).json<BookingsResponse>();
    },
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => api.get(`bookings/${id}`).json<{ status: 'success'; data: Booking }>(),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { hotel: string; checkIn: string; checkOut: string; guests: number; rooms: number; trip?: string; specialRequests?: string }) => 
      api.post('bookings', { json: data }).json<{ status: 'success'; data: Booking; message: string }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      api.patch(`bookings/${id}/cancel`).json<{ status: 'success'; data: Booking; message: string }>(),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
  });
}

export function useBookingPayment(bookingId: string) {
  return useMutation({
    mutationFn: (currency?: string) => 
      api.post('payments/booking/pay/checkout', { json: { bookingId, currency } }).json<{ status: 'success'; data: { url: string; sessionId: string; amount: number; currency: string; bookingId: string }; message: string }>(),
  });
}

export function usePaymentStatus(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.paymentStatus(bookingId),
    queryFn: () => api.get(`payments/booking/status/${bookingId}`).json<{ status: 'success'; data: any }>(),
    enabled: !!bookingId,
    refetchInterval: 3000,
    retry: 10,
  });
}

export function useAIBookingConversation() {
  return useMutation({
    mutationFn: ({ message, sessionId, context }: { message: string; sessionId?: string; context?: any }) => 
      api.post('ai/bookings/conversation', { json: { message, sessionId, context } }).json<{ status: 'success'; data: { sessionId: string; step: string; aiResponse: string; isComplete: boolean; bookingId: string | null; tokensUsed: number }; message: string }>(),
  });
}