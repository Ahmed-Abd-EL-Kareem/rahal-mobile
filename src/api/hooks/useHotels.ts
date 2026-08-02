// src/api/hooks/useHotels.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Hotel, HotelFilters, HotelMeta } from '@/types/api';

export interface HotelsResponse {
  status: 'success';
  length: number;
  data: Hotel[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export function useHotels(params?: HotelFilters) {
  return useInfiniteQuery<HotelsResponse>({
    queryKey: queryKeys.hotels(params),
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
      return api.get(`hotels?${searchParams.toString()}`).json<HotelsResponse>();
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page ?? lastPage.pagination?.page ?? 1;
      const totalPages = lastPage.totalPages ?? lastPage.pagination?.totalPages ?? 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}

export function useHotel(slug: string) {
  return useQuery({
    queryKey: queryKeys.hotel(slug),
    queryFn: () => api.get(`hotels/slug/${slug}`).json<{ status: 'success'; data: Hotel }>(),
    enabled: !!slug,
  });
}

export function useHotelMeta() {
  return useQuery({
    queryKey: queryKeys.hotelMeta(),
    queryFn: () => api.get('hotels/meta').json<{ status: 'success'; data: HotelMeta }>(),
  });
}

export function useNearbyHotels(lng: number, lat: number, maxKm?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.nearbyHotels(lng, lat, maxKm),
    queryFn: () => {
      const params = new URLSearchParams({ lng: String(lng), lat: String(lat) });
      if (maxKm) params.append('maxKm', String(maxKm));
      if (limit) params.append('limit', String(limit));
      return api.get(`hotels/nearby?${params.toString()}`).json<{ status: 'success'; length: number; data: Hotel[] }>();
    },
    enabled: !!lng && !!lat,
  });
}