// src/api/hooks/useTrips.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Trip, TripFilters } from '@/types/api';

export function useTrips(params?: TripFilters) {
  return useQuery({
    queryKey: queryKeys.trips(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`trips?${searchParams.toString()}`).json<{ status: 'success'; length: number; data: Trip[]; pagination: any }>();
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