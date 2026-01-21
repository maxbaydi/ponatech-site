import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
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
