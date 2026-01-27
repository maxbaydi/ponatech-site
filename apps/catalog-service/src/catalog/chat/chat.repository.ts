import { Injectable } from '@nestjs/common';
import { ChatMessageSender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ChatListItemResponse,
  ChatMessageResponse,
  ChatStatsResponse,
  GetMessagesQueryDto,
  PaginatedChatMessagesResponse,
} from './dto/chat.dto';

type AttachmentCreateInput = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(
    requestId: string,
    senderType: ChatMessageSender,
    senderId: string | null,
    content: string,
    attachments: AttachmentCreateInput[] = [],
  ): Promise<ChatMessageResponse> {
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          requestId,
          senderType,
          senderId,
          content,
          attachments: {
            create: attachments,
          },
        },
        include: {
          attachments: true,
          sender: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.supplyRequest.update({
        where: { id: requestId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return this.mapMessageToResponse(message);
  }

  async getMessagesByRequestId(
    requestId: string,
    query: GetMessagesQueryDto,
  ): Promise<PaginatedChatMessagesResponse> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { requestId },
        include: {
          attachments: true,
          sender: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where: { requestId } }),
    ]);

    return {
      data: messages.map((message) => this.mapMessageToResponse(message)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChatsForManager(includeRequestId?: string): Promise<ChatListItemResponse[]> {
    const requests = await this.prisma.supplyRequest.findMany({
      where: includeRequestId
        ? {
            OR: [{ chatMessages: { some: {} } }, { id: includeRequestId }],
          }
        : {
            chatMessages: {
              some: {},
            },
          },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            chatMessages: {
              where: {
                isRead: false,
                senderType: ChatMessageSender.CUSTOMER,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return requests.map((request) => ({
      requestId: request.id,
      requestNumber: request.requestNumber ?? `#${request.sequenceNumber}`,
      customerName: request.name,
      customerEmail: request.email,
      customerCompany: request.company ?? undefined,
      lastMessage: request.chatMessages[0]?.content ?? '',
      lastMessageAt: request.chatMessages[0]?.createdAt ?? request.createdAt,
      unreadCount: request._count.chatMessages,
      status: request.status,
    }));
  }

  async getChatsForCustomer(email: string, includeRequestId?: string): Promise<ChatListItemResponse[]> {
    const requests = await this.prisma.supplyRequest.findMany({
      where: {
        email: { equals: email, mode: 'insensitive' },
        ...(includeRequestId
          ? { OR: [{ chatMessages: { some: {} } }, { id: includeRequestId }] }
          : {
              chatMessages: {
                some: {},
              },
            }),
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            chatMessages: {
              where: {
                isRead: false,
                senderType: { in: [ChatMessageSender.MANAGER, ChatMessageSender.SYSTEM] },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return requests.map((request) => ({
      requestId: request.id,
      requestNumber: request.requestNumber ?? `#${request.sequenceNumber}`,
      customerName: request.name,
      customerEmail: request.email,
      customerCompany: request.company ?? undefined,
      lastMessage: request.chatMessages[0]?.content ?? '',
      lastMessageAt: request.chatMessages[0]?.createdAt ?? request.createdAt,
      unreadCount: request._count.chatMessages,
      status: request.status,
    }));
  }

  async markMessagesAsRead(requestId: string, forManager: boolean): Promise<number> {
    const senderTypes = forManager
      ? [ChatMessageSender.CUSTOMER]
      : [ChatMessageSender.MANAGER, ChatMessageSender.SYSTEM];

    const result = await this.prisma.chatMessage.updateMany({
      where: {
        requestId,
        isRead: false,
        senderType: { in: senderTypes },
      },
      data: { isRead: true },
    });

    return result.count;
  }

  async getRequestById(requestId: string) {
    return this.prisma.supplyRequest.findUnique({
      where: { id: requestId },
    });
  }

  async getStatsForManager(): Promise<ChatStatsResponse> {
    const [totalChats, unreadChats] = await Promise.all([
      this.prisma.supplyRequest.count({
        where: {
          chatMessages: { some: {} },
        },
      }),
      this.prisma.supplyRequest.count({
        where: {
          chatMessages: {
            some: {
              isRead: false,
              senderType: ChatMessageSender.CUSTOMER,
            },
          },
        },
      }),
    ]);

    return { totalChats, unreadChats };
  }

  async getUnreadCountForCustomer(email: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        request: {
          email: { equals: email, mode: 'insensitive' },
        },
        isRead: false,
        senderType: { in: [ChatMessageSender.MANAGER, ChatMessageSender.SYSTEM] },
      },
    });
  }

  private mapMessageToResponse(
    message: {
      id: string;
      requestId: string;
      senderType: ChatMessageSender;
      senderId: string | null;
      content: string;
      isRead: boolean;
      createdAt: Date;
      attachments: Array<{
        id: string;
        messageId: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        createdAt: Date;
      }>;
      sender: { id: string; name: string | null } | null;
    },
  ): ChatMessageResponse {
    return {
      id: message.id,
      requestId: message.requestId,
      senderType: message.senderType,
      senderId: message.senderId ?? undefined,
      senderName: message.sender?.name ?? undefined,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        messageId: attachment.messageId,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
        createdAt: attachment.createdAt,
      })),
    };
  }
}
