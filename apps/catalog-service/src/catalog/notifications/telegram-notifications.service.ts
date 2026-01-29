import { Injectable, Logger } from '@nestjs/common';
import { SiteSettingsRepository } from '../settings/settings.repository';
import { NotificationsRepository } from './notifications.repository';

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const TELEGRAM_MESSAGE_LIMIT = 3500;

@Injectable()
export class TelegramNotificationsService {
  private readonly logger = new Logger(TelegramNotificationsService.name);

  constructor(
    private readonly siteSettingsRepository: SiteSettingsRepository,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async notifyManagersNewRequest(payload: {
    requestNumber: string;
    customerName: string;
    customerEmail: string;
  }): Promise<void> {
    const message = [
      `Новая заявка ${payload.requestNumber}`,
      `Клиент: ${payload.customerName}`,
      `Email: ${payload.customerEmail}`,
    ].join('\n');

    await this.sendToManagers(message);
  }

  async notifyManagersNewMessage(payload: {
    requestNumber: string;
    senderName?: string;
    content: string;
  }): Promise<void> {
    const content = normalizeMessageContent(payload.content);
    const sender = payload.senderName?.trim() || 'Клиент';

    const message = [
      `Новое сообщение по заявке ${payload.requestNumber}`,
      `От: ${sender}`,
      `Сообщение: ${content}`,
    ].join('\n');

    await this.sendToManagers(message);
  }

  private async sendToManagers(text: string): Promise<void> {
    try {
      const token = await this.getTelegramToken();
      if (!token) return;

      const recipients = await this.notificationsRepository.getTelegramRecipientsForManagers();
      if (recipients.length === 0) return;

      const message = truncateTelegramMessage(text);
      const results = await Promise.allSettled(
        recipients.map((recipient) => this.sendMessage(token, recipient.chatId, message)),
      );

      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        this.logger.warn(`Telegram уведомления: ошибок отправки ${failures.length} из ${results.length}.`);
      }
    } catch (error) {
      this.logger.error('Failed to send Telegram notifications', error);
    }
  }

  private async getTelegramToken(): Promise<string | null> {
    const settings = await this.siteSettingsRepository.getSettings();
    const token = settings.telegramBotToken?.trim();
    return token && token.length > 0 ? token : null;
  }

  private async sendMessage(token: string, chatId: string, text: string): Promise<void> {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Telegram API error ${response.status}: ${body}`);
    }
  }
}

const normalizeMessageContent = (content: string): string => {
  const trimmed = (content ?? '').trim();
  return trimmed.length > 0 ? trimmed : 'Сообщение без текста';
};

const truncateTelegramMessage = (text: string): string => {
  if (text.length <= TELEGRAM_MESSAGE_LIMIT) return text;
  return `${text.slice(0, TELEGRAM_MESSAGE_LIMIT - 1)}...`;
};
