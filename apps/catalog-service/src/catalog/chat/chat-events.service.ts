import { Injectable, Logger } from '@nestjs/common';
import { ChatEventType, Prisma } from '@prisma/client';
import { Subject, Observable, filter } from 'rxjs';
import type { ChatMessageResponse } from './dto/chat.dto';
import type { NotificationResponse } from '../notifications/dto/notification.dto';
import { ChatEventsRepository } from './chat-events.repository';

type ChatEventTypeName = 'new_message' | 'message_read' | 'notification';

export type ChatEvent = {
  id: number;
  type: ChatEventTypeName;
  requestId?: string;
  userId?: string;
  email?: string;
  data: ChatMessageResponse | NotificationResponse | { requestId: string };
  createdAt: Date;
};

const EVENT_TYPE_TO_DB: Record<ChatEventTypeName, ChatEventType> = {
  new_message: ChatEventType.NEW_MESSAGE,
  message_read: ChatEventType.MESSAGE_READ,
  notification: ChatEventType.NOTIFICATION,
};

const EVENT_TYPE_FROM_DB: Record<ChatEventType, ChatEventTypeName> = {
  [ChatEventType.NEW_MESSAGE]: 'new_message',
  [ChatEventType.MESSAGE_READ]: 'message_read',
  [ChatEventType.NOTIFICATION]: 'notification',
};

@Injectable()
export class ChatEventsService {
  private readonly events$ = new Subject<ChatEvent>();
  private readonly logger = new Logger(ChatEventsService.name);

  constructor(private readonly chatEventsRepository: ChatEventsRepository) {}

  async emitNewMessage(message: ChatMessageResponse, recipientEmail?: string): Promise<void> {
    try {
      const event = await this.chatEventsRepository.createEvent({
        type: EVENT_TYPE_TO_DB.new_message,
        requestId: message.requestId,
        email: recipientEmail,
        payload: this.serializePayload(message),
      });

      this.events$.next(this.mapRecordToEvent(event));
    } catch (error) {
      this.logger.error('Failed to enqueue chat message event', error);
    }
  }

  async emitMessageRead(requestId: string, userId?: string): Promise<void> {
    try {
      const event = await this.chatEventsRepository.createEvent({
        type: EVENT_TYPE_TO_DB.message_read,
        requestId,
        userId,
        payload: this.serializePayload({ requestId }),
      });

      this.events$.next(this.mapRecordToEvent(event));
    } catch (error) {
      this.logger.error('Failed to enqueue chat read event', error);
    }
  }

  async emitNotification(notification: NotificationResponse, userId?: string, email?: string): Promise<void> {
    try {
      const event = await this.chatEventsRepository.createEvent({
        type: EVENT_TYPE_TO_DB.notification,
        userId,
        email,
        payload: this.serializePayload(notification),
      });

      this.events$.next(this.mapRecordToEvent(event));
    } catch (error) {
      this.logger.error('Failed to enqueue notification event', error);
    }
  }

  getEventsForUser(userId: string): Observable<ChatEvent> {
    return this.events$.pipe(
      filter((event) => event.userId === userId),
    );
  }

  getEventsForEmail(email: string): Observable<ChatEvent> {
    const normalized = email.toLowerCase();
    return this.events$.pipe(
      filter((event) => event.email?.toLowerCase() === normalized),
    );
  }

  getEventsForRequest(requestId: string): Observable<ChatEvent> {
    return this.events$.pipe(
      filter((event) => event.requestId === requestId),
    );
  }

  getEventsForManager(): Observable<ChatEvent> {
    return this.events$.asObservable();
  }

  async getBacklogForUser(userId: string, lastEventId?: number): Promise<ChatEvent[]> {
    const events = await this.chatEventsRepository.getEvents({ userId, lastEventId });
    return events.map((event) => this.mapRecordToEvent(event));
  }

  async getBacklogForEmail(email: string, lastEventId?: number): Promise<ChatEvent[]> {
    const events = await this.chatEventsRepository.getEvents({ email, lastEventId });
    return events.map((event) => this.mapRecordToEvent(event));
  }

  async getBacklogForRequest(requestId: string, lastEventId?: number): Promise<ChatEvent[]> {
    const events = await this.chatEventsRepository.getEvents({ requestId, lastEventId });
    return events.map((event) => this.mapRecordToEvent(event));
  }

  async getBacklogForManager(lastEventId?: number): Promise<ChatEvent[]> {
    const events = await this.chatEventsRepository.getEvents({ lastEventId });
    return events.map((event) => this.mapRecordToEvent(event));
  }

  private mapRecordToEvent(record: {
    id: number;
    type: ChatEventType;
    requestId: string | null;
    userId: string | null;
    email: string | null;
    payload: unknown;
    createdAt: Date;
  }): ChatEvent {
    return {
      id: record.id,
      type: EVENT_TYPE_FROM_DB[record.type],
      requestId: record.requestId ?? undefined,
      userId: record.userId ?? undefined,
      email: record.email ?? undefined,
      data: record.payload as ChatEvent['data'],
      createdAt: record.createdAt,
    };
  }

  private serializePayload(payload: ChatEvent['data']): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue;
  }
}
