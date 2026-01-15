import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

const trimValue = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  return value.trim();
};

const trimOptionalValue = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CreateRequestDto {
  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  name!: string;

  @Transform(trimValue)
  @IsEmail()
  email!: string;

  @Transform(trimValue)
  @IsString()
  @MinLength(10)
  phone!: string;

  @Transform(trimOptionalValue)
  @IsOptional()
  @IsString()
  company?: string;

  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  productName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Transform(trimOptionalValue)
  @IsOptional()
  @IsString()
  description?: string;
}

export interface RequestResponse {
  id: string;
  createdAt: Date;
}
