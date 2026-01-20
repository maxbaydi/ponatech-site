'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaFilesFilters, UpdateMediaFileRequest, UploadFromUrlRequest } from '@/lib/api/types';

export function useMediaFiles(filters?: MediaFilesFilters) {
  return useQuery({
    queryKey: ['media', filters],
    queryFn: () => apiClient.getMediaFiles(filters),
  });
}

export function useMediaFile(id: string) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => apiClient.getMediaFile(id),
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, alt }: { file: File; alt?: string }) => apiClient.uploadMedia(file, alt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useUploadMediaFromUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadFromUrlRequest) => apiClient.uploadMediaFromUrl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useUpdateMediaFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaFileRequest }) =>
      apiClient.updateMediaFile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media', id] });
    },
  });
}

export function useDeleteMediaFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMediaFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useDeleteMediaFilesBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => apiClient.deleteMediaFilesBatch(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useGetMediaDownloadUrls() {
  return useMutation({
    mutationFn: (ids: string[]) => apiClient.getMediaDownloadUrls(ids),
  });
}

export function useDownloadMediaFilesBatch() {
  return useMutation({
    mutationFn: (ids: string[]) => apiClient.downloadMediaFilesBatch(ids),
  });
}
