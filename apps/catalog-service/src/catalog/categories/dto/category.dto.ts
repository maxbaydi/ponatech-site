import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  productsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeResponse extends CategoryResponse {
  children: CategoryTreeResponse[];
}
