export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';
export type DisplayCurrency = 'RUB' | 'CNY';
export type SupplyRequestStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SiteSettings {
  displayCurrency: DisplayCurrency;
  updatedAt?: string;
}

export interface UpdateSiteSettingsRequest {
  displayCurrency: DisplayCurrency;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isMain: boolean;
  mediaFileId?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  characteristics?: string | null;
  price: string;
  currency: string;
  status: ProductStatus;
  stock?: number | null;
  attributes: Record<string, unknown>;
  specs?: Record<string, unknown> | null;
  brandId: string;
  categoryId?: string | null;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
}

export interface User extends AuthUser {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  brandId?: string;
  brandSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'title_desc' | 'created_desc' | 'created_asc';
}

export interface DeletedProductFilters {
  brandId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'title_desc' | 'created_desc' | 'created_asc';
}

export interface CreateProductRequest {
  title: string;
  slug: string;
  sku: string;
  description?: string;
  characteristics?: string;
  price: number;
  currency?: string;
  status?: ProductStatus;
  stock?: number | null;
  attributes: Record<string, unknown>;
  specs?: Record<string, unknown>;
  brandId: string;
  categoryId?: string;
  mainImageId?: string | null;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface BatchOperationResult {
  count: number;
  missingIds?: string[];
  failedIds?: string[];
}

export interface ProductIdsRequest {
  ids: string[];
}

export interface UpdateProductsStatusBatchRequest extends ProductIdsRequest {
  status: ProductStatus;
}

export interface UpdateProductsBrandBatchRequest extends ProductIdsRequest {
  brandId: string;
}

export interface UpdateProductsCategoryBatchRequest extends ProductIdsRequest {
  categoryId: string | null;
}

export type ProductCsvColumn =
  | 'id'
  | 'name'
  | 'article'
  | 'price'
  | 'img'
  | 'description'
  | 'characteristics'
  | 'brand'
  | 'category';

export interface ImportProductsCsvResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export interface ExportProductsCsvRequest {
  columns?: ProductCsvColumn[];
  ids?: string[];
  brandId?: string;
  search?: string;
}

export interface ImportProductsCsvRequest {
  status?: ProductStatus;
  updateBySku?: boolean;
}

export interface CreateBrandRequest {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  isFeatured?: boolean;
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export interface RequestFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  description: string;
}

export interface SupplyRequestResponse {
  id: string;
  createdAt: string;
}

export interface SupplyRequestAttachment {
  id: string;
  requestId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface SupplyRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  description: string;
  status: SupplyRequestStatus;
  requestNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyRequestsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupplyRequestStatus;
}

export interface UpdateSupplyRequestStatusRequest {
  status: SupplyRequestStatus;
}

export interface SupplyRequestsStats {
  newRequests: number;
  periodDays: number;
}

export interface CartItem {
  id: string;
  slug: string;
  sku: string;
  title: string;
  price: string;
  currency: string;
  quantity: number;
  brandName?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

export interface CartResponse {
  items: CartItem[];
}

export interface CartRecommendationsResponse {
  items: Product[];
}

export interface CartRecommendationsParams {
  limit?: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UsersStats {
  newUsers: number;
  periodDays: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFilesFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UploadFromUrlRequest {
  url: string;
  alt?: string;
}

export interface UpdateMediaFileRequest {
  alt?: string;
}

export interface MediaIdsRequest {
  ids: string[];
}

export interface MediaDownloadUrlsResponse {
  files: Array<{ id: string; url: string; filename: string }>;
  missingIds?: string[];
}
