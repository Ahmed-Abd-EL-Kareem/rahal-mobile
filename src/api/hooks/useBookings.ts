// src/api/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Booking } from '@/types/api';

export interface BookingsResponse {
  status: 'success';
  length: number;
  data: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export function useBookings(params?: { page?: number; limit?: number; status?: string }) {
  return useInfiniteQuery<BookingsResponse>({
    queryKey: queryKeys.bookings(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', String(pageParam));
      searchParams.append('limit', String(params?.limit || 10));
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'limit') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`bookings?${searchParams.toString()}`).json<BookingsResponse>();
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const currentPage = typeof lastPageParam === 'number' ? lastPageParam : (lastPage.page ?? lastPage.pagination?.page ?? 1);
      const totalPages = lastPage.totalPages ?? lastPage.pagination?.totalPages;
      if (totalPages !== undefined && totalPages !== null) {
        return currentPage < totalPages ? currentPage + 1 : undefined;
      }
      const total = lastPage.total ?? lastPage.pagination?.total;
      if (total !== undefined && total !== null) {
        const fetchedCount = allPages.reduce((sum, p) => sum + (p.data?.length ?? 0), 0);
        return fetchedCount < total ? currentPage + 1 : undefined;
      }
      const itemsCount = lastPage.data?.length ?? 0;
      return itemsCount >= 10 ? currentPage + 1 : undefined;
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

export interface CreateBookingRoomInput {
  room?: string;
  quantity?: number;
  guests?: { adults: number; children?: number };
  roomType?: string;
  pricePerNight?: number;
}

export interface CreateBookingInput {
  hotel: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  rooms?: number | CreateBookingRoomInput[];
  room?: string;
  trip?: string;
  specialRequests?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) => 
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
      api.post('payments/pay/checkout', { json: { bookingId, currency } }).json<{ status: 'success'; data: { url: string; sessionId: string; amount: number; currency: string; bookingId: string }; message: string }>(),
  });
}

export function useBookingPaymentStatus(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.paymentStatus(bookingId),
    queryFn: () => api.get(`payments/pay/status/${bookingId}`).json<{ status: 'success'; data: any }>(),
    enabled: !!bookingId,
    refetchInterval: 3000,
    retry: 10,
  });
}