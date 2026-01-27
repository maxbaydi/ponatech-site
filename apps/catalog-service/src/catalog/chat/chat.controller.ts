import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ChatService } from './chat.service';
import {
  ChatListItemResponse,
  ChatMessageResponse,
  ChatStatsResponse,
  GetChatListQueryDto,
  GetMessagesQueryDto,
  PaginatedChatMessagesResponse,
  SendMessageDto,
} from './dto/chat.dto';
import {
  REQUEST_ATTACHMENT_MAX_FILE_SIZE,
  REQUEST_ATTACHMENT_MAX_FILES,
  isAllowedAttachmentType,
} from '../requests/request-attachments.constants';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() req: RequestWithUser,
  ): Promise<ChatMessageResponse> {
    return this.chatService.sendMessage(dto, req.user);
  }

  @Post('messages/with-attachments')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requestId: { type: 'string' },
        content: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: ['requestId'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', REQUEST_ATTACHMENT_MAX_FILES, {
      limits: { fileSize: REQUEST_ATTACHMENT_MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (isAllowedAttachmentType(file.originalname, file.mimetype)) {
          callback(null, true);
          return;
        }
        callback(
          new BadRequestException(`Unsupported file type: ${file.originalname}`),
          false,
        );
      },
    }),
  )
  async sendMessageWithAttachments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: SendMessageDto,
    @Req() req: RequestWithUser,
  ): Promise<ChatMessageResponse> {
    return this.chatService.sendMessage(dto, req.user, files);
  }

  @Get('messages/:requestId')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getMessages(
    @Param('requestId') requestId: string,
    @Query() query: GetMessagesQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<PaginatedChatMessagesResponse> {
    return this.chatService.getMessages(requestId, query, req.user);
  }

  @Get('list')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getChats(
    @Req() req: RequestWithUser,
    @Query() query: GetChatListQueryDto,
  ): Promise<ChatListItemResponse[]> {
    return this.chatService.getChats(req.user, query?.includeRequestId);
  }

  @Post('mark-read/:requestId')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async markAsRead(
    @Param('requestId') requestId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ success: boolean }> {
    await this.chatService.markAsRead(requestId, req.user);
    return { success: true };
  }

  @Get('stats')
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getStats(@Req() req: RequestWithUser): Promise<ChatStatsResponse> {
    return this.chatService.getStats(req.user);
  }
}
