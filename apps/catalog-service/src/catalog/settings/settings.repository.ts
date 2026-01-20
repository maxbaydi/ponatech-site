import { Injectable } from '@nestjs/common';
import type { SiteSetting } from '@prisma/client';
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

  async updateDisplayCurrency(displayCurrency: string): Promise<SiteSetting> {
    return this.prisma.siteSetting.upsert({
      where: { key: DEFAULT_SITE_SETTINGS_KEY },
      update: { displayCurrency },
      create: { key: DEFAULT_SITE_SETTINGS_KEY, displayCurrency },
    });
  }
}
