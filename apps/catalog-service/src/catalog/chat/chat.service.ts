import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageSender } from '@prisma/client';
import { ChatRepository } from './chat.repository';
import { ChatEventsService } from './chat-events.service';
import { MinioService } from '../../minio/minio.service';
import { Role } from '../auth/role.enum';
import type { RequestWithUser } from '../auth/jwt-auth.guard';
import type {
  ChatListItemResponse,
  ChatMessageResponse,
  ChatStatsResponse,
  GetMessagesQueryDto,
  PaginatedChatMessagesResponse,
  SendMessageDto,
} from './dto/chat.dto';
import { NotificationsService } from '../notifications/notifications.service';
import {
  REQUEST_ATTACHMENT_MAX_FILE_SIZE,
  REQUEST_ATTACHMENT_MAX_FILES,
  isAllowedAttachmentType,
} from '../requests/request-attachments.constants';

type RequestUser = RequestWithUser['user'];

const MANAGER_ROLES = [Role.Manager, Role.Admin, Role.SuperAdmin];

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatEventsService: ChatEventsService,
    private readonly minioService: MinioService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendMessage(
    dto: SendMessageDto,
    user: RequestUser,
    files?: Express.Multer.File[],
  ): Promise<ChatMessageResponse> {
    const request = await this.chatRepository.getRequestById(dto.requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    this.ensureChatAccess(request.email, user);
    this.validateAttachments(files ?? []);

    const content = (dto.content ?? '').trim();
    if (!content && (files?.length ?? 0) === 0) {
      throw new BadRequestException('Message is empty');
    }

    const isManager = !!user?.role && MANAGER_ROLES.includes(user.role as Role);
    const senderType = isManager ? ChatMessageSender.MANAGER : ChatMessageSender.CUSTOMER;
    const senderId = isManager ? user?.userId ?? null : null;

    const uploadedAttachments = await this.uploadAttachments(files ?? []);

    try {
      const message = await this.chatRepository.createMessage(
        dto.requestId,
        senderType,
        senderId,
        content,
        uploadedAttachments,
      );

      const normalizedMessage = this.normalizeMessageUrls(message);

      await this.chatEventsService.emitNewMessage(normalizedMessage, request.email);
      await this.safeNotifyNewMessage(request, isManager);

      return normalizedMessage;
    } catch (error) {
      await this.cleanupAttachments(uploadedAttachments);
      throw error;
    }
  }

  async sendSystemMessage(requestId: string, content: string): Promise<ChatMessageResponse> {
    const request = await this.chatRepository.getRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    
    const message = await this.chatRepository.createMessage(
      requestId,
      ChatMessageSender.SYSTEM,
      null,
      content,
    );

    const normalizedMessage = this.normalizeMessageUrls(message);

    await this.chatEventsService.emitNewMessage(normalizedMessage, request.email);

    return normalizedMessage;
  }

  async getMessages(
    requestId: string,
    query: GetMessagesQueryDto,
    user: RequestUser,
  ): Promise<PaginatedChatMessagesResponse> {
    const request = await this.chatRepository.getRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    this.ensureChatAccess(request.email, user);

    const result = await this.chatRepository.getMessagesByRequestId(requestId, query);

    return {
      ...result,
      data: result.data.map((message) => this.normalizeMessageUrls(message)),
    };
  }

  async getChats(user: RequestUser, includeRequestId?: string): Promise<ChatListItemResponse[]> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      return this.chatRepository.getChatsForManager(includeRequestId);
    }

    if (!user.email) {
      throw new ForbiddenException('User email required');
    }

    return this.chatRepository.getChatsForCustomer(user.email, includeRequestId);
  }

  async markAsRead(requestId: string, user: RequestUser): Promise<void> {
    const request = await this.chatRepository.getRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    this.ensureChatAccess(request.email, user);

    const isManager = !!user?.role && MANAGER_ROLES.includes(user.role as Role);
    const updatedCount = await this.chatRepository.markMessagesAsRead(requestId, !!isManager);

    if (updatedCount > 0) {
      await this.chatEventsService.emitMessageRead(requestId, user?.userId);
    }
  }

  async getStats(user: RequestUser): Promise<ChatStatsResponse> {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);

    if (isManager) {
      return this.chatRepository.getStatsForManager();
    }

    if (!user.email) {
      throw new ForbiddenException('User email required');
    }

    const unreadCount = await this.chatRepository.getUnreadCountForCustomer(user.email);
    return {
      totalChats: 0,
      unreadChats: unreadCount,
    };
  }

  private ensureChatAccess(requestEmail: string, user: RequestUser): void {
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    const isManager = MANAGER_ROLES.includes(user.role as Role);
    if (isManager) {
      return;
    }

    const userEmail = user.email?.trim().toLowerCase();
    if (!userEmail || userEmail !== requestEmail.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }
  }

  private validateAttachments(files: Express.Multer.File[]): void {
    if (files.length === 0) {
      return;
    }

    if (files.length > REQUEST_ATTACHMENT_MAX_FILES) {
      throw new BadRequestException(
        `Too many files. Maximum allowed is ${REQUEST_ATTACHMENT_MAX_FILES}.`,
      );
    }

    for (const file of files) {
      if (!file?.buffer || file.size <= 0) {
        throw new BadRequestException(`File "${file?.originalname ?? 'unknown'}" is empty.`);
      }

      if (file.size > REQUEST_ATTACHMENT_MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File "${file.originalname}" is too large. Maximum size is ${REQUEST_ATTACHMENT_MAX_FILE_SIZE / 1024 / 1024}MB.`,
        );
      }

      if (!isAllowedAttachmentType(file.originalname, file.mimetype)) {
        throw new BadRequestException(`Unsupported file type: ${file.originalname}`);
      }
    }
  }

  private async uploadAttachments(
    files: Express.Multer.File[],
  ): Promise<Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }>> {
    const uploads: Array<{ filename: string; originalName: string; mimeType: string; size: number; url: string }> = [];

    for (const file of files) {
      const result = await this.minioService.upload(file.buffer, file.originalname, file.mimetype);
      uploads.push({
        filename: result.key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: result.size,
        url: result.url,
      });
    }

    return uploads;
  }

  private async cleanupAttachments(
    attachments: Array<{ filename: string }>,
  ): Promise<void> {
    await Promise.allSettled(attachments.map((a) => this.minioService.delete(a.filename)));
  }

  private normalizeMessageUrls(message: ChatMessageResponse): ChatMessageResponse {
    return {
      ...message,
      attachments: message.attachments.map((attachment) => ({
        ...attachment,
        url: this.minioService.normalizePublicUrl(attachment.url),
      })),
    };
  }

  private async safeNotifyNewMessage(
    request: { id: string; email: string; requestNumber: string | null; sequenceNumber: number; name: string },
    isManager: boolean,
  ): Promise<void> {
    try {
      const requestNumber =
        request.requestNumber ?? `#${request.sequenceNumber ?? request.id.slice(0, 8)}`;
      if (isManager) {
        await this.notificationsService.notifyNewMessage(
          request.id,
          requestNumber,
          request.email,
          false,
        );
      } else {
        const senderName = request.name ?? request.email;
        await this.notificationsService.notifyNewMessage(
          request.id,
          requestNumber,
          request.email,
          true,
          senderName,
        );
      }
    } catch {
      // Non-critical, do not fail message send
    }
  }
}
