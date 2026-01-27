'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { NotificationsFilters } from '@/lib/api/types';

const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (filters?: NotificationsFilters) => [...NOTIFICATION_KEYS.lists(), filters] as const,
  stats: () => [...NOTIFICATION_KEYS.all, 'stats'] as const,
};

export function useNotifications(filters?: NotificationsFilters) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(filters),
    queryFn: () => apiClient.getNotifications(filters),
    refetchInterval: 30000,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.stats(),
    queryFn: () => apiClient.getNotificationStats(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.stats() });
    },
  });
}

export { NOTIFICATION_KEYS };
