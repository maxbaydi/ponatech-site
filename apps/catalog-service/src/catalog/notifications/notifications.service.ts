import { ForbiddenException, Injectable } from '@nestjs/common';
import { NotificationType, SupplyRequestStatus } from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { Role } from '../auth/role.enum';
import type { RequestWithUser } from '../auth/jwt-auth.guard';
import type {
  GetNotificationsQueryDto,
  NotificationStatsResponse,
  PaginatedNotificationsResponse,
} from './dto/notification.dto';

type RequestUser = RequestWithUser['user'];

const MANAGER_ROLES = [Role.Manager, Role.Admin, Role.SuperAdmin];

const STATUS_MESSAGES: Record<SupplyRequestStatus, { title: string; message: string }> = {
  [SupplyRequestStatus.NEW]: {
    title: 'Заявка создана',
    message: 'Ваша заявка успешно создана и ожидает рассмотрения.',
  },
  [SupplyRequestStatus.IN_PROGRESS]: {
    title: 'Заявка в работе',
    message: 'Ваша заявка принята в работу. Менеджер свяжется с вами в ближайшее время.',
  },
  [SupplyRequestStatus.COMPLETED]: {
    title: 'Заявка выполнена',
    message: 'Ваша заявка успешно выполнена. Спасибо за обращение!',
  },
  [SupplyRequestStatus.CANCELLED]: {
    title: 'Заявка отменена',
    message: 'Ваша заявка была отменена. При необходимости вы можете создать новую заявку.',
  },
};

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async getNotifications(
    user: RequestUser,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.notificationsRepository.getByUserId(user.userId, query);
  }

  async markAsRead(notificationId: string, user: RequestUser): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    await this.notificationsRepository.markAsRead(notificationId, user.userId);
  }

  async markAllAsRead(user: RequestUser): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    await this.notificationsRepository.markAllAsRead(user.userId);
  }

  async getStats(user: RequestUser): Promise<NotificationStatsResponse> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.notificationsRepository.getStats(user.userId);
  }

  async notifyStatusChange(
    requestId: string,
    requestNumber: string,
    customerEmail: string,
    newStatus: SupplyRequestStatus,
  ): Promise<void> {
    const statusInfo = STATUS_MESSAGES[newStatus];
    const title = `${statusInfo.title} (${requestNumber})`;

    await this.notificationsRepository.create({
      email: customerEmail,
      type: NotificationType.STATUS_CHANGE,
      title,
      message: statusInfo.message,
      requestId,
    });
  }

  async notifyNewMessage(
    requestId: string,
    requestNumber: string,
    recipientEmail: string,
    isForManager: boolean,
    senderName?: string,
  ): Promise<void> {
    const title = isForManager
      ? `Новое сообщение по заявке ${requestNumber}`
      : `Ответ по заявке ${requestNumber}`;

    const message = isForManager
      ? `Клиент ${senderName ?? recipientEmail} отправил сообщение по заявке.`
      : 'Менеджер ответил на ваше сообщение.';

    if (isForManager) {
      await this.notificationsRepository.createForManagers(
        NotificationType.NEW_MESSAGE,
        title,
        message,
        requestId,
      );
    } else {
      await this.notificationsRepository.create({
        email: recipientEmail,
        type: NotificationType.NEW_MESSAGE,
        title,
        message,
        requestId,
      });
    }
  }

  async notifyNewRequest(
    requestId: string,
    requestNumber: string,
    customerName: string,
    customerEmail: string,
  ): Promise<void> {
    const title = `Новая заявка ${requestNumber}`;
    const message = `Поступила новая заявка от ${customerName} (${customerEmail}).`;

    await this.notificationsRepository.createForManagers(
      NotificationType.NEW_REQUEST,
      title,
      message,
      requestId,
    );
  }

  getStatusChangeMessage(status: SupplyRequestStatus): string {
    return STATUS_MESSAGES[status].message;
  }
}
