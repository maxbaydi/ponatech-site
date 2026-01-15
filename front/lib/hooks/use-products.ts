'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  BatchOperationResult,
  CreateProductRequest,
  DeletedProductFilters,
  ExportProductsCsvRequest,
  ImportProductsCsvRequest,
  PaginatedResponse,
  Product,
  ProductFilters,
  UpdateProductRequest,
  UpdateProductsBrandBatchRequest,
  UpdateProductsCategoryBatchRequest,
  UpdateProductsStatusBatchRequest,
} from '@/lib/api/types';

export function useProducts(filters?: ProductFilters) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => apiClient.getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => apiClient.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useImportProductsCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { file: File; opts?: ImportProductsCsvRequest }) =>
      apiClient.importProductsCsv(payload.file, payload.opts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useExportProductsCsv() {
  return useMutation({
    mutationFn: (data: ExportProductsCsvRequest) => apiClient.exportProductsCsv(data),
  });
}

export function useDeleteProductsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => apiClient.deleteProductsBatch(ids),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductsStatusBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductsStatusBatchRequest) => apiClient.updateProductsStatusBatch(data),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductsBrandBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductsBrandBatchRequest) => apiClient.updateProductsBrandBatch(data),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductsCategoryBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductsCategoryBatchRequest) => apiClient.updateProductsCategoryBatch(data),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeletedProducts(filters?: DeletedProductFilters) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', 'deleted', filters],
    queryFn: () => apiClient.getDeletedProducts(filters),
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRestoreProductsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => apiClient.restoreProductsBatch(ids),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function usePermanentDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.permanentDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function usePermanentDeleteProductsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => apiClient.permanentDeleteProductsBatch(ids),
    onSuccess: (_: BatchOperationResult) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
