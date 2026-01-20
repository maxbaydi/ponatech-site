import {
  IsOptional,
  IsString,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

const MAX_MEDIA_BATCH_SIZE = 200;

export interface MediaFileResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UploadFromUrlDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class UpdateMediaFileDto {
  @IsOptional()
  @IsString()
  alt?: string;
}

export class MediaFilesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export interface PaginatedMediaFilesResponse {
  data: MediaFileResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MediaIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @ArrayMaxSize(MAX_MEDIA_BATCH_SIZE)
  @IsUUID('4', { each: true })
  ids!: string[];
}

export interface BatchOperationResult {
  count: number;
  missingIds?: string[];
  failedIds?: string[];
}

export interface MediaDownloadUrlsResponse {
  files: Array<{ id: string; url: string; filename: string }>;
  missingIds?: string[];
}
