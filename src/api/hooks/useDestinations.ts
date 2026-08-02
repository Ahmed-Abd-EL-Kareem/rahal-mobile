// src/api/hooks/useDestinations.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Destination, DestinationFilters } from '@/types/api';

export interface DestinationsResponse {
  status: 'success';
  length: number;
  data: Destination[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export function useDestinations(params?: DestinationFilters) {
  return useInfiniteQuery<DestinationsResponse>({
    queryKey: queryKeys.destinations(params),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', String(pageParam));
      searchParams.append('limit', String(params?.limit || 12));
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'limit') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`destinations?${searchParams.toString()}`).json<DestinationsResponse>();
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page ?? lastPage.pagination?.page ?? 1;
      const totalPages = lastPage.totalPages ?? lastPage.pagination?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
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