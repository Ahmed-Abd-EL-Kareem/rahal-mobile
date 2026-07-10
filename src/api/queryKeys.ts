// src/api/queryKeys.ts
export const queryKeys = {
  // Auth
  user: () => ['user'] as const,
  subscription: () => ['subscription'] as const,
  
  // Destinations
  destinations: (params?: Record<string, unknown>) => ['destinations', params] as const,
  destination: (slug: string) => ['destination', slug] as const,
  nearbyDestinations: (lng: number, lat: number, maxKm?: number) => ['destinations', 'nearby', { lng, lat, maxKm }] as const,
  trendingDestinations: () => ['destinations', 'trending'] as const,
  
  // Hotels
  hotels: (params?: Record<string, unknown>) => ['hotels', params] as const,
  hotel: (slug: string) => ['hotel', slug] as const,
  hotelMeta: () => ['hotels', 'meta'] as const,
  nearbyHotels: (lng: number, lat: number, maxKm?: number) => ['hotels', 'nearby', { lng, lat, maxKm }] as const,
  
  // Trips
  trips: (params?: Record<string, unknown>) => ['trips', params] as const,
  trip: (id: string) => ['trip', id] as const,
  
  // Bookings
  bookings: (params?: Record<string, unknown>) => ['bookings', params] as const,
  booking: (id: string) => ['booking', id] as const,
  paymentStatus: (bookingId: string) => ['payment', 'status', bookingId] as const,
  
  // AI
  aiChat: (sessionId: string) => ['ai', 'chat', sessionId] as const,
  aiHotelSearch: (query: string) => ['ai', 'hotels', 'search', query] as const,
  aiHotelRecommendations: (tripId?: string) => ['ai', 'hotels', 'recommendations', tripId] as const,
  aiBookingConversation: (sessionId: string) => ['ai', 'booking', sessionId] as const,
  
  // Subscriptions
  plans: () => ['plans'] as const,
  
  // Favorites
  favorites: () => ['favorites'] as const,
} as const;