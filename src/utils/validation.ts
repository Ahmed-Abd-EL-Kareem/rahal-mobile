// src/utils/validation.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50);
export const otpSchema = z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numbers only');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const generateTripSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  duration: z.number().min(1, 'Duration must be at least 1 day').max(30, 'Duration cannot exceed 30 days'),
  budget: z.enum(['budget', 'mid-range', 'luxury']).default('mid-range'),
  travelers: z.number().min(1).default(1),
  interests: z.array(z.string()).default([]),
  language: z.enum(['en', 'ar']).default('en'),
  imageUrl: z.string().url().optional(),
});

export const createBookingSchema = z.object({
  hotel: z.string().min(1, 'Hotel is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1).default(1),
  rooms: z.number().min(1).default(1),
  trip: z.string().optional(),
  specialRequests: z.string().optional(),
});