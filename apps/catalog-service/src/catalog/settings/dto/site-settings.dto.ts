import { IsIn } from 'class-validator';

export const DISPLAY_CURRENCIES = ['RUB', 'CNY'] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export class UpdateSiteSettingsDto {
  @IsIn(DISPLAY_CURRENCIES)
  displayCurrency!: DisplayCurrency;
}

export interface SiteSettingsResponse {
  displayCurrency: DisplayCurrency;
  updatedAt: Date;
}
