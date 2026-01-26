import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, PaginatedResponse, ProductResponse, UpdateProductDto } from './dto/product.dto';
import { appendProductAndFilters, applyProductSearchFilter } from './product-search.utils';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const RESERVED_FILTER_KEYS = new Set([
  'brandId',
  'brandSlug',
  'categoryId',
  'status',
  'search',
  'minPrice',
  'maxPrice',
  'page',
  'limit',
  'sort',
]);

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filters?: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const brandIds = this.normalizeFilterList(filters?.brandId);
    const brandSlug =
      brandIds.length > 0 ? undefined : this.normalizeFilterValue(filters?.brandSlug);
    const categoryIds = this.normalizeFilterList(filters?.categoryId);
    const status = this.normalizeFilterValue(filters?.status);
    const search = this.normalizeFilterValue(filters?.search);
    const minPrice = this.parseNumberFilter(filters?.minPrice);
    const maxPrice = this.parseNumberFilter(filters?.maxPrice);
    const page = this.parseIntFilter(filters?.page, DEFAULT_PAGE);
    const limit = this.parseIntFilter(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const sort = this.normalizeFilterValue(filters?.sort);
    const attributeFilters = this.buildAttributeFilters(filters);

    if (brandIds.length === 1) {
      where.brandId = brandIds[0];
    } else if (brandIds.length > 1) {
      where.brandId = { in: brandIds };
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (categoryIds.length === 1) {
      where.categoryId = categoryIds[0];
    } else if (categoryIds.length > 1) {
      where.categoryId = { in: categoryIds };
    }

    if (status && Object.values(ProductStatus).includes(status as ProductStatus)) {
      where.status = status as ProductStatus;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    appendProductAndFilters(where, attributeFilters);
    applyProductSearchFilter(where, search);

    const orderBy = this.buildOrderBy(sort);
    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<ProductResponse | null> {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductResponse | null> {
    return this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    return this.prisma.product.create({
      data: this.toCreateInput(dto),
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    return this.prisma.product.update({
      where: { id },
      data: this.toUpdateInput(dto),
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async removeMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.product.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatusMany(ids: string[], status: ProductStatus): Promise<{ count: number }> {
    return this.prisma.product.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status },
    });
  }

  async updateBrandMany(ids: string[], brandId: string): Promise<{ count: number }> {
    return this.prisma.product.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { brandId },
    });
  }

  async updateCategoryMany(ids: string[], categoryId: string | null): Promise<{ count: number }> {
    return this.prisma.product.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { categoryId },
    });
  }

  async findAllDeleted(
    filters?: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const where: Prisma.ProductWhereInput = { deletedAt: { not: null } };
    const brandIds = this.normalizeFilterList(filters?.brandId);
    const search = this.normalizeFilterValue(filters?.search);
    const page = this.parseIntFilter(filters?.page, DEFAULT_PAGE);
    const limit = this.parseIntFilter(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const sort = this.normalizeFilterValue(filters?.sort);

    if (brandIds.length === 1) {
      where.brandId = brandIds[0];
    } else if (brandIds.length > 1) {
      where.brandId = { in: brandIds };
    }

    applyProductSearchFilter(where, search);

    const orderBy = this.buildOrderBy(sort);
    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async restoreOne(id: string): Promise<ProductResponse> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async restoreMany(ids: string[]): Promise<{ count: number }> {
    return this.prisma.product.updateMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
  }

  async hardDeleteOne(id: string): Promise<void> {
    const cleanup = this.buildHardDeleteCleanup(id, id);
    await this.prisma.$transaction([
      cleanup.cartItems,
      cleanup.images,
      this.prisma.product.delete({ where: { id } }),
    ]);
  }

  async hardDeleteMany(ids: string[]): Promise<{ count: number }> {
    const cleanup = this.buildHardDeleteCleanup({ in: ids }, { in: ids });
    const [, result] = await this.prisma.$transaction([
      cleanup.cartItems,
      cleanup.images,
      this.prisma.product.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } }),
    ]);
    return result;
  }

  private toCreateInput(dto: CreateProductDto): Prisma.ProductUncheckedCreateInput {
    return {
      title: dto.title,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      characteristics: dto.characteristics,
      price: dto.price,
      currency: dto.currency ?? 'RUB',
      status: dto.status ?? ProductStatus.DRAFT,
      stock: dto.stock ?? null,
      attributes: dto.attributes as Prisma.InputJsonValue,
      specs: dto.specs as Prisma.InputJsonValue | undefined,
      brandId: dto.brandId,
      categoryId: dto.categoryId ?? null,
    };
  }

  private toUpdateInput(dto: UpdateProductDto): Prisma.ProductUncheckedUpdateInput {
    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.characteristics !== undefined) data.characteristics = dto.characteristics;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.attributes !== undefined) data.attributes = dto.attributes as Prisma.InputJsonValue;
    if (dto.specs !== undefined) data.specs = dto.specs as Prisma.InputJsonValue;
    if (dto.brandId !== undefined) data.brandId = dto.brandId;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId || null;

    return data;
  }

  private buildHardDeleteCleanup(
    cartItemProductId: Prisma.CartItemWhereInput['productId'],
    productImageProductId: Prisma.ProductImageWhereInput['productId'],
  ): {
    cartItems: Prisma.PrismaPromise<Prisma.BatchPayload>;
    images: Prisma.PrismaPromise<Prisma.BatchPayload>;
  } {
    return {
      cartItems: this.prisma.cartItem.deleteMany({ where: { productId: cartItemProductId } }),
      images: this.prisma.productImage.deleteMany({ where: { productId: productImageProductId } }),
    };
  }

  private buildAttributeFilters(
    filters?: Record<string, string | string[] | undefined>,
  ): Prisma.ProductWhereInput[] {
    if (!filters) {
      return [];
    }

    return Object.entries(filters)
      .filter(([key, value]) => !RESERVED_FILTER_KEYS.has(key) && value !== undefined && value !== '')
      .map(([key, value]) => ({
        attributes: {
          path: [key],
          equals: Array.isArray(value) ? value[0] : value,
        },
      }));
  }

  private normalizeFilterValue(value?: string | string[]): string | undefined {
    if (!value) {
      return undefined;
    }

    const raw = Array.isArray(value) ? value[0] : value;
    const trimmed = raw?.trim();
    return trimmed ? trimmed : undefined;
  }

  private normalizeFilterList(value?: string | string[]): string[] {
    if (!value) {
      return [];
    }

    const rawValues = Array.isArray(value) ? value : [value];
    const parts = rawValues.flatMap((entry) => entry.split(','));
    const normalized = parts.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
    return Array.from(new Set(normalized));
  }

  private parseNumberFilter(value?: string | string[]): number | undefined {
    const normalized = this.normalizeFilterValue(value);
    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseIntFilter(
    value: string | string[] | undefined,
    fallback: number,
    max?: number,
  ): number {
    const normalized = this.normalizeFilterValue(value);
    const parsed = normalized ? Number.parseInt(normalized, 10) : NaN;

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    if (max !== undefined) {
      return Math.min(parsed, max);
    }

    return parsed;
  }

  private buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'title_asc':
        return { title: 'asc' };
      case 'title_desc':
        return { title: 'desc' };
      case 'created_asc':
        return { createdAt: 'asc' };
      case 'created_desc':
      default:
        return { createdAt: 'desc' };
    }
  }
}
