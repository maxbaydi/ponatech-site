export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';

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
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: string;
  currency: string;
  status: ProductStatus;
  stock: number;
  attributes: Record<string, unknown>;
  specs?: Record<string, unknown> | null;
  brandId: string;
  categoryId: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
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
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'title_desc' | 'created_desc' | 'created_asc';
}

export interface CreateProductRequest {
  title: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  currency?: string;
  status?: ProductStatus;
  stock?: number;
  attributes: Record<string, unknown>;
  specs?: Record<string, unknown>;
  brandId: string;
  categoryId: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

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
  productName: string;
  quantity: number;
  description?: string;
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

export interface UpdateUserRoleRequest {
  role: UserRole;
}
