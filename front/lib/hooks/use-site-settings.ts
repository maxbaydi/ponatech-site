'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { UpdateSiteSettingsRequest } from '@/lib/api/types';
import { DEFAULT_DISPLAY_CURRENCY } from '@/lib/currency';

const SITE_SETTINGS_QUERY_KEY = ['site-settings'] as const;

export function useSiteSettings() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: () => apiClient.getSiteSettings(),
  });
}

export function useDisplayCurrency() {
  const { data } = useSiteSettings();
  return data?.displayCurrency ?? DEFAULT_DISPLAY_CURRENCY;
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSiteSettingsRequest) => apiClient.updateSiteSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, data);
    },
  });
}
