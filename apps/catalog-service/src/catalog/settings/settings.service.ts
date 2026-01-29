import { Injectable } from '@nestjs/common';
import type { SiteSetting } from '@prisma/client';
import { SiteSettingsRepository } from './settings.repository';
import type { SiteSettingsResponse, UpdateSiteSettingsDto } from './dto/site-settings.dto';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly siteSettingsRepository: SiteSettingsRepository) {}

  async getSettings(): Promise<SiteSettingsResponse> {
    const settings = await this.siteSettingsRepository.getSettings();
    return this.toResponse(settings);
  }

  async updateSettings(dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    const settings = await this.siteSettingsRepository.updateSettings({
      displayCurrency: dto.displayCurrency,
      telegramBotToken: dto.telegramBotToken,
    });
    return this.toResponse(settings);
  }

  private toResponse(settings: SiteSetting): SiteSettingsResponse {
    return {
      displayCurrency: settings.displayCurrency as SiteSettingsResponse['displayCurrency'],
      telegramBotTokenSet: !!settings.telegramBotToken,
      updatedAt: settings.updatedAt,
    };
  }
}
