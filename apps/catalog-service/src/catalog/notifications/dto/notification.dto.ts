import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Количество на странице', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: 'Только непрочитанные' })
  @IsOptional()
  @Type(() => Boolean)
  unreadOnly?: boolean;
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: string;
  requestNumber?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface PaginatedNotificationsResponse {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
}

export class MarkNotificationReadDto {
  @ApiProperty({ description: 'ID уведомления' })
  @IsUUID()
  id!: string;
}
