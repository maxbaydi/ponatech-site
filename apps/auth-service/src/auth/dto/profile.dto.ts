import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

const emptyToNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export class UpdateProfileDto {
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(2)
  name?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(10)
  phone?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MinLength(2)
  company?: string | null;
}
