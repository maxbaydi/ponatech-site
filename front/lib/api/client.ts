import Cookies from 'js-cookie';
import type {
  AuthResponse,
  AuthUser,
  AddCartItemRequest,
  BatchOperationResult,
  Brand,
  CartResponse,
  CartRecommendationsParams,
  CartRecommendationsResponse,
  Category,
  CreateBrandRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  DeletedProductFilters,
  ExportProductsCsvRequest,
  ImportProductsCsvRequest,
  ImportProductsCsvResult,
  LoginRequest,
  MediaFile,
  MediaFilesFilters,
  PaginatedResponse,
  Product,
  ProductFilters,
  UpdateProductsBrandBatchRequest,
  UpdateProductsCategoryBatchRequest,
  UpdateProductsStatusBatchRequest,
  RequestFormData,
  RegisterRequest,
  SupplyRequestResponse,
  UpdateBrandRequest,
  UpdateCategoryRequest,
  UpdateMediaFileRequest,
  UpdateProfileRequest,
  UpdateProductRequest,
  UpdateCartItemRequest,
  UpdateUserRoleRequest,
  UploadFromUrlRequest,
  User,
  UsersFilters,
  UsersResponse,
} from './types';
import { ApiError, toApiError } from './errors';

const ENV_KEYS = {
  api: 'NEXT_PUBLIC_API_URL',
  catalog: 'NEXT_PUBLIC_CATALOG_API_URL',
  auth: 'NEXT_PUBLIC_AUTH_API_URL',
} as const;

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_CATALOG_API_URL = process.env.NEXT_PUBLIC_CATALOG_API_URL;
const NEXT_PUBLIC_AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;

const getRequiredEnv = (value: string | undefined, key: keyof typeof ENV_KEYS): string => {
  if (!value) {
    throw new Error(`Missing ${ENV_KEYS[key]}`);
  }
  return value;
};

const DEFAULT_CATALOG_API_URL = NEXT_PUBLIC_CATALOG_API_URL || NEXT_PUBLIC_API_URL;
const DEFAULT_AUTH_API_URL = NEXT_PUBLIC_AUTH_API_URL;

const CATALOG_API_URL = getRequiredEnv(DEFAULT_CATALOG_API_URL, 'catalog');
const AUTH_API_URL = getRequiredEnv(DEFAULT_AUTH_API_URL, 'auth');

const ACCESS_TOKEN_KEY = 'pona_access_token';
const REFRESH_TOKEN_KEY = 'pona_refresh_token';

class ApiClient {
  private catalogBaseUrl: string;
  private authBaseUrl: string;

  constructor(opts: { catalogBaseUrl: string; authBaseUrl: string }) {
    this.catalogBaseUrl = opts.catalogBaseUrl;
    this.authBaseUrl = opts.authBaseUrl;
  }

  private getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 });
  }

  clearTokens(): void {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = endpoint.startsWith('/auth/') ? this.authBaseUrl : this.catalogBaseUrl;
    const url = `${baseUrl}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error: unknown) {
      throw new ApiError({
        status: 0,
        endpoint,
        message: 'Сервис недоступен. Проверьте, что бэкенд запущен и адрес API указан верно.',
        payload: error,
      });
    }

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, options);
      }
      this.clearTokens();
      throw toApiError({ status: 401, endpoint, payload: await safeParseResponseBody(response) });
    }

    if (!response.ok) {
      const payload = await safeParseResponseBody(response);
      throw toApiError({ status: response.status, endpoint, payload });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await safeParseResponseBody(response);
    return payload as T;
  }

  private async requestForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const baseUrl = endpoint.startsWith('/auth/') ? this.authBaseUrl : this.catalogBaseUrl;
    const url = `${baseUrl}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: HeadersInit = {};

    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (error: unknown) {
      throw new ApiError({
        status: 0,
        endpoint,
        message: 'Сервис недоступен. Проверьте, что бэкенд запущен и адрес API указан верно.',
        payload: error,
      });
    }

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.requestForm<T>(endpoint, formData);
      }
      this.clearTokens();
      throw toApiError({ status: 401, endpoint, payload: await safeParseResponseBody(response) });
    }

    if (!response.ok) {
      const payload = await safeParseResponseBody(response);
      throw toApiError({ status: response.status, endpoint, payload });
    }

    const payload = await safeParseResponseBody(response);
    return payload as T;
  }

  private async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
    const baseUrl = endpoint.startsWith('/auth/') ? this.authBaseUrl : this.catalogBaseUrl;
    const url = `${baseUrl}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error: unknown) {
      throw new ApiError({
        status: 0,
        endpoint,
        message: 'Сервис недоступен. Проверьте, что бэкенд запущен и адрес API указан верно.',
        payload: error,
      });
    }

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.requestBlob(endpoint, options);
      }
      this.clearTokens();
      throw toApiError({ status: 401, endpoint, payload: await safeParseResponseBody(response) });
    }

    if (!response.ok) {
      const payload = await safeParseResponseBody(response);
      throw toApiError({ status: response.status, endpoint, payload });
    }

    return response.blob();
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.authBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = (await safeParseResponseBody(response)) as { accessToken: string; refreshToken: string } | undefined;
      if (!data?.accessToken || !data?.refreshToken) return false;
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (!refreshToken) return;

      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/me');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.request<Product>(`/products/slug/${slug}`);
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  async deleteProductsBatch(ids: string[]): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/batch/delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async updateProductsStatusBatch(data: UpdateProductsStatusBatchRequest): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/batch/status', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateProductsBrandBatch(data: UpdateProductsBrandBatchRequest): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/batch/brand', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateProductsCategoryBatch(data: UpdateProductsCategoryBatchRequest): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/batch/category', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async importProductsCsv(file: File, opts?: ImportProductsCsvRequest): Promise<ImportProductsCsvResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (opts?.status) formData.append('status', opts.status);
    if (opts?.updateBySku !== undefined) formData.append('updateBySku', String(opts.updateBySku));
    return this.requestForm<ImportProductsCsvResult>('/products/import-csv', formData);
  }

  async exportProductsCsv(data: ExportProductsCsvRequest): Promise<Blob> {
    return this.requestBlob('/products/export-csv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDeletedProducts(filters?: DeletedProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request<PaginatedResponse<Product>>(`/products/trash/list${query ? `?${query}` : ''}`);
  }

  async restoreProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/trash/${id}/restore`, { method: 'POST' });
  }

  async restoreProductsBatch(ids: string[]): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/trash/batch/restore', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async permanentDeleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/trash/${id}/permanent`, { method: 'DELETE' });
  }

  async permanentDeleteProductsBatch(ids: string[]): Promise<BatchOperationResult> {
    return this.request<BatchOperationResult>('/products/trash/batch/permanent-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getBrands(): Promise<Brand[]> {
    return this.request<Brand[]>('/brands');
  }

  async getBrand(id: string): Promise<Brand> {
    return this.request<Brand>(`/brands/${id}`);
  }

  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    return this.request<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrand(id: string, data: UpdateBrandRequest): Promise<Brand> {
    return this.request<Brand>(`/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string): Promise<void> {
    return this.request<void>(`/brands/${id}`, { method: 'DELETE' });
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  async createSupplyRequest(data: RequestFormData): Promise<SupplyRequestResponse> {
    return this.request<SupplyRequestResponse>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCart(): Promise<CartResponse> {
    return this.request<CartResponse>('/cart');
  }

  async getCartRecommendations(params?: CartRecommendationsParams): Promise<CartRecommendationsResponse> {
    const query = new URLSearchParams();
    if (params?.limit) {
      query.set('limit', String(params.limit));
    }
    const queryString = query.toString();
    return this.request<CartRecommendationsResponse>(`/cart/recommendations${queryString ? `?${queryString}` : ''}`);
  }

  async addCartItem(data: AddCartItemRequest): Promise<CartResponse> {
    return this.request<CartResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(productId: string, data: UpdateCartItemRequest): Promise<CartResponse> {
    return this.request<CartResponse>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeCartItem(productId: string): Promise<CartResponse> {
    return this.request<CartResponse>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<CartResponse> {
    return this.request<CartResponse>('/cart', {
      method: 'DELETE',
    });
  }

  async getUsers(filters?: UsersFilters): Promise<UsersResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return this.request<UsersResponse>(`/auth/admin/users${query ? `?${query}` : ''}`);
  }

  async updateUserRole(userId: string, data: UpdateUserRoleRequest): Promise<User> {
    return this.request<User>(`/auth/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateUser(userId: string): Promise<User> {
    return this.request<User>(`/auth/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async logoutUserAll(userId: string): Promise<void> {
    return this.request<void>(`/auth/admin/users/${userId}/logout-all`, {
      method: 'POST',
    });
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async getMediaFiles(filters?: MediaFilesFilters): Promise<PaginatedResponse<MediaFile>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const query = params.toString();
    return this.request<PaginatedResponse<MediaFile>>(`/media${query ? `?${query}` : ''}`);
  }

  async getMediaFile(id: string): Promise<MediaFile> {
    return this.request<MediaFile>(`/media/${id}`);
  }

  async uploadMedia(file: File, alt?: string): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    return this.requestForm<MediaFile>('/media/upload', formData);
  }

  async uploadMediaFromUrl(data: UploadFromUrlRequest): Promise<MediaFile> {
    return this.request<MediaFile>('/media/upload-from-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMediaFile(id: string, data: UpdateMediaFileRequest): Promise<MediaFile> {
    return this.request<MediaFile>(`/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMediaFile(id: string): Promise<void> {
    return this.request<void>(`/media/${id}`, { method: 'DELETE' });
  }
}

const safeParseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
};

export const apiClient = new ApiClient({ catalogBaseUrl: CATALOG_API_URL, authBaseUrl: AUTH_API_URL });
