// src/api/hooks/useSubscriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../queryKeys';
import { Plan, Subscription } from '@/types/api';

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans(),
    queryFn: () => api.get('subscriptions/plans').json<{ status: 'success'; length: number; data: Plan[] }>(),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription(),
    queryFn: () => api.get('subscriptions/my').json<{ status: 'success'; data: Subscription }>(),
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planName: string) => 
      api.post('subscriptions/pay/upgrade', { json: { planName } }).json<{ status: 'success'; data: { url: string; sessionId: string }; message: string }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => 
      api.patch('subscriptions/cancel').json<{ status: 'success'; data: Subscription; message: string }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function usePaymentStatus(subscriptionId: string) {
  return useQuery({
    queryKey: ['subscription', 'payment', 'status', subscriptionId],
    queryFn: () => api.get(`subscriptions/pay/status/${subscriptionId}`).json<{ status: 'success'; data: any }>(),
    enabled: !!subscriptionId,
  });
}