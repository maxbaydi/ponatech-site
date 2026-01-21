'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

const REQUEST_ATTACHMENTS_QUERY_KEY = 'requestAttachments';

export function useSupplyRequestAttachments(requestId?: string) {
  return useQuery({
    queryKey: [REQUEST_ATTACHMENTS_QUERY_KEY, requestId],
    queryFn: () => apiClient.getSupplyRequestAttachments(requestId ?? ''),
    enabled: Boolean(requestId),
  });
}

export function useDownloadSupplyRequestAttachments() {
  return useMutation({
    mutationFn: (requestId: string) => apiClient.downloadSupplyRequestAttachments(requestId),
  });
}
