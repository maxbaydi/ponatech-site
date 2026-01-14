export const CATALOG_PROTO_PACKAGE = 'catalog';
export const CATALOG_INTERNAL_SERVICE = 'CatalogInternalService';

export interface GetProductByIdRequest {
  id: string;
}

export interface GetBrandByIdRequest {
  id: string;
}

export interface ProductResponse {
  id: string;
  title: string;
  slug: string;
  sku: string;
  brandId: string;
  categoryId: string;
  status: string;
}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
}
