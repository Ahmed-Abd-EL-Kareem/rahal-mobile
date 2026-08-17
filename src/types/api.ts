// src/types/api.ts

// User
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  preferredLanguage: 'en' | 'ar';
  preferredCurrency: 'EGP' | 'USD';
  subscription: string;
  savedTrips: string[];
  createdAt: string;
  updatedAt: string;
}

// Destination
export interface Attraction {
  name: { en: string; ar: string };
  type: 'historical' | 'beach' | 'adventure' | 'cultural' | 'religious' | 'nature' | 'other' | 'landmark';
  entryFee: number;
}

export interface Destination {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  city: string;
  region: string;
  category: 'historical' | 'beach' | 'adventure' | 'cultural' | 'religious' | 'nature' | 'other' | 'landmark';
  description: { en: string; ar: string };
  attractions: Attraction[];
  bestMonths: string[];
  averageBudgetPerDay: number;
  currency: string;
  location: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  images: string[];
  coverImage: string;
  isActive: boolean;
}

export interface DestinationFilters {
  city?: string;
  category?: string;
  region?: string;
  month?: string;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
  isActive?: 'true' | 'false' | 'all';
  sort?: string;
  page?: number;
  limit?: number;
}

// Hotel
export interface Room {
  type: 'single' | 'double' | 'suite' | 'family';
  pricePerNight: number;
  capacity: number;
  features?: string[];
}

export interface Hotel {
  _id: string;
  name: { en: string; ar: string };
  slug: string;
  city: string;
  stars: number;
  amenities: string[];
  rooms: Room[];
  averagePricePerNight: number;
  currency: string;
  location: { type: 'Point'; coordinates: [number, number] };
  images: string[];
  coverImage: string;
  isActive: boolean;
  description?: { en: string; ar: string };
}

export interface HotelFilters {
  city?: string;
  stars?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface HotelMeta {
  cities: string[];
  regions: string[];
  amenities: string[];
  roomTypes: string[];
  currencies: string[];
}

// Trip
export interface TripDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
  tips?: string;
  estimatedCost: number;
}

export interface Trip {
  _id: string;
  user: string;
  title: string;
  destination: string;
  duration: number;
  budget: 'budget' | 'mid-range' | 'luxury';
  travelers: number;
  interests: string[];
  language: string;
  days: TripDay[];
  summary: string;
  estimatedTotalCost: number;
  currency: string;
  status: 'draft' | 'saved' | 'active' | 'completed';
  isAIGenerated: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripFilters {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Booking
export interface HotelSummary {
  _id: string;
  name: { en: string; ar: string };
  city: string;
  averagePricePerNight: number;
  stars: number;
  coverImage: string;
  currency: string;
}

export interface TripSummary {
  _id: string;
  title: string;
  destination: string;
}

export interface Booking {
  _id: string;
  user: string;
  hotel: HotelSummary;
  trip?: TripSummary;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription
export interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: { monthly: number; yearly: number };
  currency: string;
  limits: {
    tokensPerMonth: number;
    requestsPerDay: number;
    tripsPerMonth: number | null;
    maxFileUploads: number;
    maxFileSizeMB: number;
    allowedModels: string[];
  };
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface SubscriptionUsage {
  tokensUsedThisMonth: number;
  requestsToday: number;
  tripsThisMonth: number;
  lastRequestDate: string;
  lastResetDate: string;
}

export interface SubscriptionHistory {
  fromPlan: string | null;
  toPlan: string;
  changedAt: string;
  reason: string;
}

export interface Subscription {
  _id: string;
  user: string;
  planName: 'free' | 'pro' | 'enterprise';
  status: 'free' | 'active' | 'canceled' | 'past_due';
  startDate: string;
  endDate: string | null;
  plan: Plan;
  usage: SubscriptionUsage;
  history: SubscriptionHistory[];
}

// AI
export interface AIChatResponse {
  reply: string;
  tokensUsed?: number;
  sessionId?: string;
  title?: string;
  messages?: any[];
}

export interface AIHotelSearchResponse {
  reply: string;
  tokensUsed: number;
}

export interface AIBookingConversationResponse {
  sessionId: string;
  step: 'destination' | 'dates' | 'budget' | 'preferences' | 'hotel_selection' | 'guest_info' | 'payment' | 'complete';
  aiResponse: string;
  isComplete: boolean;
  bookingId: string | null;
  tokensUsed: number;
}

// Pagination
export interface PaginatedResponse<T> {
  status: 'success';
  length: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SuccessResponse<T> {
  status: 'success';
  message?: string;
  data: T;
}

export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  error?: any;
  stack?: string;
}