// src/api/hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Trip, TripFilters } from '@/types/api';

export interface TripsResponse {
  status: 'success';
  length: number;
  data: Trip[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export function useTrips(params?: TripFilters) {
  return useInfiniteQuery<TripsResponse>({
    queryKey: queryKeys.trips(params),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
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
      return api.get(`trips?${searchParams.toString()}`).json<TripsResponse>();
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page ?? lastPage.pagination?.page ?? 1;
      const totalPages = lastPage.totalPages ?? lastPage.pagination?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: queryKeys.trip(id),
    queryFn: () => api.get(`trips/${id}`).json<{ status: 'success'; data: Trip }>(),
    enabled: !!id,
  });
}

export function useGenerateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { destination: string; duration: number; budget?: string; travelers?: number; interests?: string[]; language?: string; imageUrl?: string }) => 
      api.post('trips/generate', { json: params }).json<{ status: 'success'; data: { trip: Trip }; message: string; tokensUsed: number }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trip: Partial<Trip>) => 
      api.post('trips', { json: trip }).json<{ status: 'success'; data: { trip: Trip }; message: string }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Trip> & { id: string }) => 
      api.patch(`trips/${id}`, { json: data }).json<{ status: 'success'; data: Trip; message: string }>(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      api.delete(`trips/${id}`).json<{ status: 'success'; message: string }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}