import Cookies from 'js-cookie';
import type {
  AuthResponse,
  AuthUser,
  Brand,
  Category,
  CreateBrandRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  LoginRequest,
  Product,
  ProductFilters,
  RegisterRequest,
  UpdateBrandRequest,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateUserRoleRequest,
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
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/me');
  }

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
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
}

const safeParseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
};

export const apiClient = new ApiClient({ catalogBaseUrl: CATALOG_API_URL, authBaseUrl: AUTH_API_URL });
