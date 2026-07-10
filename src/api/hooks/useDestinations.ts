// src/api/hooks/useDestinations.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Destination, DestinationFilters } from '@/types/api';

export function useDestinations(params?: DestinationFilters) {
  return useQuery({
    queryKey: queryKeys.destinations(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`destinations?${searchParams.toString()}`).json<{ status: 'success'; length: number; data: Destination[]; pagination: any }>();
    },
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: queryKeys.destination(slug),
    queryFn: () => api.get(`destinations/slug/${slug}`).json<{ status: 'success'; data: Destination }>(),
    enabled: !!slug,
  });
}

export function useNearbyDestinations(lng: number, lat: number, maxKm?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.nearbyDestinations(lng, lat, maxKm),
    queryFn: () => {
      const params = new URLSearchParams({ lng: String(lng), lat: String(lat) });
      if (maxKm) params.append('maxKm', String(maxKm));
      if (limit) params.append('limit', String(limit));
      return api.get(`destinations/nearby?${params.toString()}`).json<{ status: 'success'; length: number; data: Destination[] }>();
    },
    enabled: !!lng && !!lat,
  });
}

export function useTrendingDestinations(limit = 3) {
  return useQuery({
    queryKey: queryKeys.trendingDestinations(),
    queryFn: () => api.get(`destinations/trending?limit=${limit}`).json<{ status: 'success'; data: { destinations: any[] } }>(),
  });
}