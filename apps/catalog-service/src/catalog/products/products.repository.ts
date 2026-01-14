import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, ProductResponse, UpdateProductDto } from './dto/product.dto';

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
  ): Promise<ProductResponse[]> {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const brandId = this.normalizeFilterValue(filters?.brandId);
    const brandSlug = this.normalizeFilterValue(filters?.brandSlug);
    const categoryId = this.normalizeFilterValue(filters?.categoryId);
    const status = this.normalizeFilterValue(filters?.status);
    const search = this.normalizeFilterValue(filters?.search);
    const minPrice = this.parseNumberFilter(filters?.minPrice);
    const maxPrice = this.parseNumberFilter(filters?.maxPrice);
    const page = this.parseIntFilter(filters?.page, DEFAULT_PAGE);
    const limit = this.parseIntFilter(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const sort = this.normalizeFilterValue(filters?.sort);
    const attributeFilters = this.buildAttributeFilters(filters);

    if (brandId) {
      where.brandId = brandId;
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status && Object.values(ProductStatus).includes(status as ProductStatus)) {
      where.status = status as ProductStatus;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    if (attributeFilters.length > 0) {
      where.AND = attributeFilters;
    }

    const orderBy = this.buildOrderBy(sort);
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
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
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    return this.prisma.product.update({
      where: { id },
      data: this.toUpdateInput(dto),
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toCreateInput(dto: CreateProductDto): Prisma.ProductUncheckedCreateInput {
    return {
      title: dto.title,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      price: dto.price,
      currency: dto.currency ?? 'RUB',
      status: dto.status ?? ProductStatus.DRAFT,
      stock: dto.stock ?? 0,
      attributes: dto.attributes as Prisma.InputJsonValue,
      specs: dto.specs as Prisma.InputJsonValue | undefined,
      brandId: dto.brandId,
      categoryId: dto.categoryId,
    };
  }

  private toUpdateInput(dto: UpdateProductDto): Prisma.ProductUncheckedUpdateInput {
    const data: Prisma.ProductUncheckedUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.attributes !== undefined) data.attributes = dto.attributes as Prisma.InputJsonValue;
    if (dto.specs !== undefined) data.specs = dto.specs as Prisma.InputJsonValue;
    if (dto.brandId !== undefined) data.brandId = dto.brandId;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    return data;
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
