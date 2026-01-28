import { Transform } from 'class-transformer';
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

export const IMPORT_MERGE_STRATEGIES = ['replace', 'update'] as const;
export type ImportProductsCsvStrategy = (typeof IMPORT_MERGE_STRATEGIES)[number];

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

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [trimmed];
        } catch {
          return [trimmed];
        }
      }
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [String(value)];
  })
  @IsArray()
  @IsIn(PRODUCT_CSV_COLUMNS, { each: true })
  columns?: ProductCsvColumn[];

  @IsOptional()
  @IsIn(IMPORT_MERGE_STRATEGIES)
  mergeStrategy?: ImportProductsCsvStrategy;
}

export interface ImportProductsCsvResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

