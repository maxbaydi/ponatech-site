import { Transform, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { SupplyRequestStatus } from '@prisma/client';

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
  @MinLength(10)
  description!: string;
}

export interface RequestResponse {
  id: string;
  createdAt: Date;
}

export class GetRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SupplyRequestStatus)
  status?: SupplyRequestStatus;
}

export interface SupplyRequestResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  description: string;
  status: SupplyRequestStatus;
  requestNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyRequestAttachmentResponse {
  id: string;
  requestId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface SupplyRequestStatsResponse {
  newRequests: number;
  periodDays: number;
}

export class UpdateRequestStatusDto {
  @IsEnum(SupplyRequestStatus)
  status!: SupplyRequestStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
