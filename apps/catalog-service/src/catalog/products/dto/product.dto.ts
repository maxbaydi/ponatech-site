import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Prisma, ProductStatus } from '@prisma/client';

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
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsObject()
  attributes!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;

  @IsString()
  brandId!: string;

  @IsString()
  categoryId!: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export interface ProductResponse {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: Prisma.Decimal;
  currency: string;
  status: ProductStatus;
  stock: number;
  attributes: Prisma.JsonValue;
  specs?: Prisma.JsonValue | null;
  brandId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
