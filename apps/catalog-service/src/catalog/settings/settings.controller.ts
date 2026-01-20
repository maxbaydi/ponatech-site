import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { SiteSettingsResponse } from './dto/site-settings.dto';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';
import { SiteSettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async getSettings(): Promise<SiteSettingsResponse> {
    return this.siteSettingsService.getSettings();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async updateSettings(@Body() dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    return this.siteSettingsService.updateSettings(dto);
  }
}
