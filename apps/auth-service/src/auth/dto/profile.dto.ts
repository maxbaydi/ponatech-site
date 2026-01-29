import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PROFILE_COMPANY_MIN_LENGTH, PROFILE_NAME_MIN_LENGTH, PROFILE_PHONE_MIN_LENGTH } from '../auth.constants';
import { emptyToNull } from './transform.utils';

export class UpdateProfileDto {
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
  @Transform(emptyToNull)
  @IsString()
  @Matches(/^-?\d+$/, { message: 'Telegram Chat ID must contain digits' })
  telegramChatId?: string | null;

  @IsOptional()
  @IsBoolean()
  telegramNotificationsEnabled?: boolean;
}
