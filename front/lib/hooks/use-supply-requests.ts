'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SupplyRequestsFilters, UpdateSupplyRequestStatusRequest } from '@/lib/api/types';

const SUPPLY_REQUESTS_QUERY_KEY = 'supplyRequests';
const SUPPLY_REQUESTS_STATS_QUERY_KEY = 'supplyRequestsStats';
const MY_SUPPLY_REQUESTS_QUERY_KEY = 'mySupplyRequests';

export function useSupplyRequests(filters?: SupplyRequestsFilters) {
  return useQuery({
    queryKey: [SUPPLY_REQUESTS_QUERY_KEY, filters],
    queryFn: () => apiClient.getSupplyRequests(filters),
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
