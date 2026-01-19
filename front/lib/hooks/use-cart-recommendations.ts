'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CartRecommendationsParams, CartRecommendationsResponse } from '@/lib/api/types';

export function useCartRecommendations(
  params?: CartRecommendationsParams,
  options?: Omit<UseQueryOptions<CartRecommendationsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CartRecommendationsResponse>({
    queryKey: ['cart', 'recommendations', params],
    queryFn: () => apiClient.getCartRecommendations(params),
    ...options,
  });
}
