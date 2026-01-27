import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatMessageSender } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @ApiProperty({ description: 'ID заявки' })
  @IsUUID()
  @IsNotEmpty()
  requestId!: string;

  @ApiPropertyOptional({ description: 'Текст сообщения' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;
}

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Количество на странице', default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export interface ChatMessageAttachmentResponse {
  id: string;
  messageId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface ChatMessageResponse {
  id: string;
  requestId: string;
  senderType: ChatMessageSender;
  senderId?: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  attachments: ChatMessageAttachmentResponse[];
}

export interface ChatListItemResponse {
  requestId: string;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: string;
}

export interface PaginatedChatMessagesResponse {
  data: ChatMessageResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'ID заявки' })
  @IsUUID()
  @IsNotEmpty()
  requestId!: string;
}

export interface ChatStatsResponse {
  totalChats: number;
  unreadChats: number;
}

export class GetChatListQueryDto {
  @ApiPropertyOptional({ description: '????????????? ???????? ?????? ? ??????' })
  @IsOptional()
  @IsUUID()
  includeRequestId?: string;
}
