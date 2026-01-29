import { Injectable } from '@nestjs/common';
import type { Prisma, SiteSetting } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_SITE_SETTINGS_KEY = 'default';
const DEFAULT_DISPLAY_CURRENCY = 'RUB';

@Injectable()
export class SiteSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<SiteSetting> {
    const existing = await this.prisma.siteSetting.findUnique({
      where: { key: DEFAULT_SITE_SETTINGS_KEY },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.siteSetting.create({
      data: {
        key: DEFAULT_SITE_SETTINGS_KEY,
        displayCurrency: DEFAULT_DISPLAY_CURRENCY,
      },
    });
  }

  async updateSettings(data: {
    displayCurrency?: string;
    telegramBotToken?: string | null;
  }): Promise<SiteSetting> {
    const updateData: Prisma.SiteSettingUpdateInput = {};

    if (data.displayCurrency !== undefined) {
      updateData.displayCurrency = data.displayCurrency;
    }

    if (data.telegramBotToken !== undefined) {
      updateData.telegramBotToken = data.telegramBotToken;
    }

    if (Object.keys(updateData).length === 0) {
      return this.getSettings();
    }

    return this.prisma.siteSetting.upsert({
      where: { key: DEFAULT_SITE_SETTINGS_KEY },
      update: updateData,
      create: {
        key: DEFAULT_SITE_SETTINGS_KEY,
        displayCurrency: data.displayCurrency ?? DEFAULT_DISPLAY_CURRENCY,
        telegramBotToken: data.telegramBotToken ?? null,
      },
    });
  }
}
