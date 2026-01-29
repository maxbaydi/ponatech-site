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
import { ChatEventsService } from '../chat/chat-events.service';
import { TelegramNotificationsService } from './telegram-notifications.service';

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
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly chatEventsService: ChatEventsService,
    private readonly telegramNotificationsService: TelegramNotificationsService,
  ) {}

  async getNotifications(
    user: RequestUser,
    query: GetNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      return this.notificationsRepository.getByUserId(user.userId, query);
    }

    const email = user.email?.trim();
    if (!email) {
      throw new ForbiddenException('User email required');
    }

    return this.notificationsRepository.getByEmail(email, query);
  }

  async markAsRead(notificationId: string, user: RequestUser): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      await this.notificationsRepository.markAsRead(notificationId, user.userId);
      return;
    }

    const email = user.email?.trim();
    if (!email) {
      throw new ForbiddenException('User email required');
    }

    await this.notificationsRepository.markAsReadByEmail(notificationId, email);
  }

  async markAllAsRead(user: RequestUser): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      await this.notificationsRepository.markAllAsRead(user.userId);
      return;
    }

    const email = user.email?.trim();
    if (!email) {
      throw new ForbiddenException('User email required');
    }

    await this.notificationsRepository.markAllAsReadByEmail(email);
  }

  async getStats(user: RequestUser): Promise<NotificationStatsResponse> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      return this.notificationsRepository.getStats(user.userId);
    }

    const email = user.email?.trim();
    if (!email) {
      throw new ForbiddenException('User email required');
    }

    return this.notificationsRepository.getStatsByEmail(email);
  }

  async notifyStatusChange(
    requestId: string,
    requestNumber: string,
    customerEmail: string,
    newStatus: SupplyRequestStatus,
  ): Promise<void> {
    const statusInfo = STATUS_MESSAGES[newStatus];
    const title = `${statusInfo.title} (${requestNumber})`;

    const notification = await this.notificationsRepository.create({
      email: customerEmail,
      type: NotificationType.STATUS_CHANGE,
      title,
      message: statusInfo.message,
      requestId,
    });

    await this.chatEventsService.emitNotification(notification, undefined, customerEmail);
  }

  async notifyNewMessage(
    requestId: string,
    requestNumber: string,
    recipientEmail: string,
    isForManager: boolean,
    senderName?: string,
    messageContent?: string,
  ): Promise<void> {
    const title = isForManager
      ? `Новое сообщение по заявке ${requestNumber}`
      : `Ответ по заявке ${requestNumber}`;

    const contentPreview = formatMessagePreview(messageContent);

    const message = isForManager
      ? buildManagerMessage(senderName ?? recipientEmail, contentPreview)
      : buildCustomerMessage(contentPreview);

    if (isForManager) {
      await this.notificationsRepository.createForManagers(
        NotificationType.NEW_MESSAGE,
        title,
        message,
        requestId,
      );

      await this.telegramNotificationsService.notifyManagersNewMessage({
        requestNumber,
        senderName: senderName ?? recipientEmail,
        content: messageContent ?? '',
      });
    } else {
      const notification = await this.notificationsRepository.create({
        email: recipientEmail,
        type: NotificationType.NEW_MESSAGE,
        title,
        message,
        requestId,
      });

      await this.chatEventsService.emitNotification(notification, undefined, recipientEmail);
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

    await this.telegramNotificationsService.notifyManagersNewRequest({
      requestNumber,
      customerName,
      customerEmail,
    });
  }

  getStatusChangeMessage(status: SupplyRequestStatus): string {
    return STATUS_MESSAGES[status].message;
  }
}


const MESSAGE_PREVIEW_LIMIT = 240;

const formatMessagePreview = (content?: string): string | null => {
  const trimmed = (content ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length <= MESSAGE_PREVIEW_LIMIT) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_LIMIT - 1)}...`;
};

const buildManagerMessage = (sender: string, content: string | null): string => {
  if (!content) {
    return `Клиент ${sender} отправил сообщение по заявке.`;
  }
  return `Клиент ${sender} написал: ${content}`;
};

const buildCustomerMessage = (content: string | null): string => {
  if (!content) {
    return 'Менеджер ответил на ваше сообщение.';
  }
  return `Менеджер ответил: ${content}`;
};
