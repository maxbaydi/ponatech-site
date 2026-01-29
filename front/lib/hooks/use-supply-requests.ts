'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SupplyRequestsFilters, UpdateSupplyRequestStatusRequest } from '@/lib/api/types';

const SUPPLY_REQUESTS_QUERY_KEY = 'supplyRequests';
const SUPPLY_REQUESTS_STATS_QUERY_KEY = 'supplyRequestsStats';
const MY_SUPPLY_REQUESTS_QUERY_KEY = 'mySupplyRequests';

export { SUPPLY_REQUESTS_QUERY_KEY, SUPPLY_REQUESTS_STATS_QUERY_KEY, MY_SUPPLY_REQUESTS_QUERY_KEY };

type SupplyRequestsQueryOptions = {
  enabled?: boolean;
};

export function useSupplyRequests(filters?: SupplyRequestsFilters, options?: SupplyRequestsQueryOptions) {
  return useQuery({
    queryKey: [SUPPLY_REQUESTS_QUERY_KEY, filters],
    queryFn: () => apiClient.getSupplyRequests(filters),
    ...options,
  });
}

export function useSupplyRequestByNumber(requestNumber?: string, options?: SupplyRequestsQueryOptions) {
  const isEnabled = options?.enabled ?? Boolean(requestNumber);

  return useQuery({
    queryKey: [SUPPLY_REQUESTS_QUERY_KEY, 'by-number', requestNumber],
    queryFn: () => {
      if (!requestNumber) {
        throw new Error('Request number is required');
      }
      return apiClient.getSupplyRequestByNumber(requestNumber);
    },
    enabled: isEnabled,
    ...options,
  });
}

export function useMySupplyRequests(filters?: SupplyRequestsFilters) {
  return useQuery({
    queryKey: [MY_SUPPLY_REQUESTS_QUERY_KEY, filters],
    queryFn: () => apiClient.getMySupplyRequests(filters),
  });
}

export function useSupplyRequestsStats() {
  return useQuery({
    queryKey: [SUPPLY_REQUESTS_STATS_QUERY_KEY],
    queryFn: () => apiClient.getSupplyRequestsStats(),
  });
}

export function useUpdateSupplyRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplyRequestStatusRequest }) =>
      apiClient.updateSupplyRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLY_REQUESTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLY_REQUESTS_STATS_QUERY_KEY] });
    },
  });
}
