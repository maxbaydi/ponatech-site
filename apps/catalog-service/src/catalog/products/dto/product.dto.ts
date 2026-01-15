import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { Prisma, ProductStatus } from '@prisma/client';
import type { BrandResponse } from '../../brands/dto/brand.dto';
import type { CategoryResponse } from '../../categories/dto/category.dto';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  characteristics?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  stock?: number | null;

  @IsObject()
  attributes!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;

  @IsString()
  brandId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  mainImageId?: string | null;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  ids!: string[];
}

export class BatchUpdateProductStatusDto extends ProductIdsDto {
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}

export class BatchUpdateProductBrandDto extends ProductIdsDto {
  @IsUUID('4')
  brandId!: string;
}

export class BatchUpdateProductCategoryDto extends ProductIdsDto {
  @IsDefined()
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4')
  categoryId!: string | null;
}

export interface BatchOperationResult {
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductImageResponse {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isMain: boolean;
  mediaFileId?: string | null;
}

export interface ProductResponse {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  characteristics?: string | null;
  price: Prisma.Decimal;
  currency: string;
  status: ProductStatus;
  stock?: number | null;
  attributes: Prisma.JsonValue;
  specs?: Prisma.JsonValue | null;
  brandId: string;
  categoryId?: string | null;
  brand?: BrandResponse;
  category?: CategoryResponse | null;
  images?: ProductImageResponse[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
