// src/api/hooks/useHotels.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Hotel, HotelFilters, HotelMeta } from '@/types/api';

export function useHotels(params?: HotelFilters) {
  return useQuery({
    queryKey: queryKeys.hotels(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      return api.get(`hotels?${searchParams.toString()}`).json<{ status: 'success'; length: number; data: Hotel[]; pagination: any }>();
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