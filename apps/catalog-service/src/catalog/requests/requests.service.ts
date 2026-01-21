import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import {
  CreateRequestDto,
  GetRequestsQueryDto,
  PaginatedResponse,
  RequestResponse,
  SupplyRequestAttachmentResponse,
  SupplyRequestResponse,
  SupplyRequestStatsResponse,
  UpdateRequestStatusDto,
} from './dto/request.dto';
import { RequestsRepository } from './requests.repository';
import { MinioService } from '../../minio/minio.service';
import { Role } from '../auth/role.enum';
import type { RequestWithUser } from '../auth/jwt-auth.guard';
import {
  REQUEST_ATTACHMENT_MAX_FILE_SIZE,
  REQUEST_ATTACHMENT_MAX_FILES,
  getAttachmentExtension,
  isAllowedAttachmentType,
} from './request-attachments.constants';

type AttachmentRecord = Awaited<ReturnType<RequestsRepository['findAttachmentsByRequestId']>>[number];
type RequestUser = RequestWithUser['user'];
type RequestAttachmentArchiveEntry = { id: string; originalName: string; stream: Readable };

@Injectable()
export class RequestsService {
  constructor(
    private readonly requestsRepository: RequestsRepository,
    private readonly minioService: MinioService,
  ) {}

  async create(dto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestsRepository.create(dto);
  }

  async createWithAttachments(
    dto: CreateRequestDto,
    files: Express.Multer.File[] | undefined,
  ): Promise<RequestResponse> {
    const uploadFiles = files ?? [];
    this.validateAttachments(uploadFiles);

    if (uploadFiles.length === 0) {
      return this.requestsRepository.create(dto);
    }

    const uploads: Array<{
      key: string;
      url: string;
      size: number;
      originalName: string;
      mimeType: string;
    }> = [];

    try {
      for (const file of uploadFiles) {
        const result = await this.minioService.upload(
          file.buffer,
          file.originalname,
          file.mimetype,
        );
        uploads.push({
          key: result.key,
          url: result.url,
          size: result.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
        });
      }

      return await this.requestsRepository.createWithAttachments(
        dto,
        uploads.map((upload) => ({
          filename: upload.key,
          originalName: upload.originalName,
          mimeType: upload.mimeType,
          size: upload.size,
          url: upload.url,
        })),
      );
    } catch (error) {
      await Promise.allSettled(uploads.map((upload) => this.minioService.delete(upload.key)));
      throw error;
    }
  }

  async findAll(filters?: GetRequestsQueryDto): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsRepository.findAll(filters);
  }

  async findAllByEmail(
    email: string,
    filters?: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsRepository.findAllByEmail(email, filters);
  }

  async getStats(): Promise<SupplyRequestStatsResponse> {
    return this.requestsRepository.getStats();
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto): Promise<SupplyRequestResponse> {
    return this.requestsRepository.updateStatus(id, dto.status);
  }

  async getAttachments(
    requestId: string,
    user: RequestUser,
  ): Promise<SupplyRequestAttachmentResponse[]> {
    await this.ensureRequestAccess(requestId, user);
    const attachments = await this.requestsRepository.findAttachmentsByRequestId(requestId);
    return attachments.map((attachment) => this.normalizeAttachment(attachment));
  }

  async getAttachmentsForArchive(
    requestId: string,
    user: RequestUser,
  ): Promise<RequestAttachmentArchiveEntry[]> {
    await this.ensureRequestAccess(requestId, user);
    const attachments = await this.requestsRepository.findAttachmentsByRequestId(requestId);

    if (attachments.length === 0) {
      throw new NotFoundException('Attachments not found');
    }

    return Promise.all(
      attachments.map(async (attachment) => ({
        id: attachment.id,
        originalName: attachment.originalName,
        stream: await this.minioService.getObject(attachment.filename),
      })),
    );
  }

  private async ensureRequestAccess(requestId: string, user: RequestUser): Promise<void> {
    const request = await this.requestsRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!user) {
      throw new ForbiddenException('Forbidden');
    }

    if (user?.role === Role.Customer) {
      const email = user.email?.trim().toLowerCase();
      if (!email || email !== request.email.toLowerCase()) {
        throw new ForbiddenException('Forbidden');
      }
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

      const extension = getAttachmentExtension(file.originalname);

      if (!isAllowedAttachmentType(file.originalname, file.mimetype)) {
        const mimeDescription = file.mimetype ? file.mimetype : 'unknown';
        const extDescription = extension ? `.${extension}` : 'unknown';
        throw new BadRequestException(
          `Unsupported file type: ${file.originalname} (${mimeDescription}, ${extDescription}).`,
        );
      }
    }
  }

  private normalizeAttachment(attachment: AttachmentRecord): SupplyRequestAttachmentResponse {
    return {
      id: attachment.id,
      requestId: attachment.requestId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: this.minioService.normalizePublicUrl(attachment.url),
      createdAt: attachment.createdAt,
    };
  }
}
