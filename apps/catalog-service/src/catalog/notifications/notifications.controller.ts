import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationsService } from './notifications.service';
import {
  GetNotificationsQueryDto,
  NotificationStatsResponse,
  PaginatedNotificationsResponse,
} from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getNotifications(
    @Req() req: RequestWithUser,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    return this.notificationsService.getNotifications(req.user, query);
  }

  @Post('read/:id')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async markAsRead(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.markAsRead(id, req.user);
    return { success: true };
  }

  @Post('read-all')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async markAllAsRead(@Req() req: RequestWithUser): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(req.user);
    return { success: true };
  }

  @Get('stats')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getStats(@Req() req: RequestWithUser): Promise<NotificationStatsResponse> {
    return this.notificationsService.getStats(req.user);
  }
}
