import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BrandsService } from '../brands/brands.service';
import { ProductsService } from '../products/products.service';
import { CATALOG_INTERNAL_SERVICE } from './catalog.grpc';
import type { BrandResponse, GetBrandByIdRequest, GetProductByIdRequest, ProductResponse } from './catalog.grpc';

@Controller()
export class CatalogGrpcController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly brandsService: BrandsService,
  ) {}

  @GrpcMethod(CATALOG_INTERNAL_SERVICE, 'GetProductById')
  async getProductById(request: GetProductByIdRequest): Promise<ProductResponse> {
    const product = await this.productsService.findOne(request.id);

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      brandId: product.brandId,
      categoryId: product.categoryId ?? '',
      status: product.status,
    };
  }

  @GrpcMethod(CATALOG_INTERNAL_SERVICE, 'GetBrandById')
  async getBrandById(request: GetBrandByIdRequest): Promise<BrandResponse> {
    const brand = await this.brandsService.findOne(request.id);

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    };
  }
}
