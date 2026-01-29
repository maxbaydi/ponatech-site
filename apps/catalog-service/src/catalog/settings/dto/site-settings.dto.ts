import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export const DISPLAY_CURRENCIES = ['RUB', 'CNY'] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsIn(DISPLAY_CURRENCIES)
  displayCurrency?: DisplayCurrency;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))
  @IsString()
  telegramBotToken?: string | null;
}

export interface SiteSettingsResponse {
  displayCurrency: DisplayCurrency;
  telegramBotTokenSet: boolean;
  updatedAt: Date;
}
