import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  country?: string;

}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  productsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
