import { IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export const PRODUCT_CSV_COLUMNS = [
  'id',
  'name',
  'article',
  'price',
  'img',
  'description',
  'characteristics',
  'brand',
  'category',
] as const;

export type ProductCsvColumn = (typeof PRODUCT_CSV_COLUMNS)[number];

export class ExportProductsCsvDto {
  @IsOptional()
  @IsArray()
  @IsIn(PRODUCT_CSV_COLUMNS, { each: true })
  columns?: ProductCsvColumn[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ids?: string[];

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ImportProductsCsvDto {
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: ProductStatus;

  @IsOptional()
  @IsIn(['true', 'false'])
  updateBySku?: 'true' | 'false';
}

export interface ImportProductsCsvResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

