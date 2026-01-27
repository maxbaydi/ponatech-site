import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import {
  PASSWORD_MIN_LENGTH,
  PROFILE_COMPANY_MIN_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_PHONE_MIN_LENGTH,
} from '../auth.constants';
import { Role } from '../role.enum';
import { emptyToNull } from './transform.utils';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_NAME_MIN_LENGTH)
  name?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_PHONE_MIN_LENGTH)
  phone?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_COMPANY_MIN_LENGTH)
  company?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_NAME_MIN_LENGTH)
  name?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_PHONE_MIN_LENGTH)
  phone?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(PROFILE_COMPANY_MIN_LENGTH)
  company?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;
}

export class GetUsersQueryDto {
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
}

const MAX_STATS_DAYS = 365;

export class GetUsersStatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_STATS_DAYS)
  days?: number;
}

export interface UsersStatsResponse {
  newUsers: number;
  periodDays: number;
}
