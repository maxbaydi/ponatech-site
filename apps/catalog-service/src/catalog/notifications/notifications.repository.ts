import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  GetNotificationsQueryDto,
  NotificationResponse,
  NotificationStatsResponse,
  PaginatedNotificationsResponse,
} from './dto/notification.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type CreateNotificationInput = {
  userId?: string;
  email?: string;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: string;
};

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput): Promise<NotificationResponse> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        email: input.email,
        type: input.type,
        title: input.title,
        message: input.message,
        requestId: input.requestId,
      },
      include: {
        request: {
          select: { requestNumber: true },
        },
      },
    });

    return this.mapToResponse(notification);
  }

  async createForManagers(
    type: NotificationType,
    title: string,
    message: string,
    requestId?: string,
  ): Promise<void> {
    const managers = await this.prisma.user.findMany({
      where: {
        role: { in: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (managers.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: managers.map((manager) => ({
        userId: manager.id,
        type,
        title,
        message,
        requestId,
      })),
    });
  }

  async getByUserId(
    userId: string,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const whereClause = {
      userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        include: {
          request: {
            select: { requestNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications.map((n) => this.mapToResponse(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async getByEmail(
    email: string,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const whereClause = {
      email: { equals: email, mode: 'insensitive' as const },
      userId: null,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        include: {
          request: {
            select: { requestNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: whereClause }),
      this.prisma.notification.count({
        where: { email: { equals: email, mode: 'insensitive' }, userId: null, isRead: false },
      }),
    ]);

    return {
      data: notifications.map((n) => this.mapToResponse(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getStats(userId: string): Promise<NotificationStatsResponse> {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { total, unread };
  }

  async getUnreadCountByEmail(email: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        email: { equals: email, mode: 'insensitive' },
        userId: null,
        isRead: false,
      },
    });
  }

  private mapToResponse(
    notification: {
      id: string;
      type: NotificationType;
      title: string;
      message: string;
      requestId: string | null;
      isRead: boolean;
      createdAt: Date;
      request?: { requestNumber: string | null } | null;
    },
  ): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      requestId: notification.requestId ?? undefined,
      requestNumber: notification.request?.requestNumber ?? undefined,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
