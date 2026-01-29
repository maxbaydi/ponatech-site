import { Injectable } from '@nestjs/common';
import { ChatMessageSender, Prisma, SupplyRequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateRequestDto,
  GetRequestsQueryDto,
  PaginatedResponse,
  RequestResponse,
  SupplyRequestResponse,
  SupplyRequestStatsResponse,
} from './dto/request.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_STATS_DAYS = 7;
const REQUEST_NUMBER_PREFIX = '№';
const REQUEST_NUMBER_SEPARATOR = '_';
const REQUEST_NUMBER_PAD_LENGTH = 4;
const REQUEST_NUMBER_DATE_PAD_LENGTH = 2;
const REQUEST_NUMBER_PATTERN = /^\d{4,}_\d{8}$/;
const SEQUENCE_NUMBER_PATTERN = /^\d+$/;
const PAD_CHAR = '0';
const MONTH_OFFSET = 1;

type RequestAttachmentInput = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

@Injectable()
export class RequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto): Promise<RequestResponse> {
    return this.createWithAttachments(dto, []);
  }

  async createWithAttachments(
    dto: CreateRequestDto,
    attachments: RequestAttachmentInput[],
  ): Promise<RequestResponse> {
    return this.prisma.$transaction(async (tx) => {
      const created = await this.createRequestWithNumber(tx, dto);

      if (attachments.length > 0) {
        await tx.supplyRequestAttachment.createMany({
          data: attachments.map((attachment) => ({
            ...attachment,
            requestId: created.id,
          })),
        });
      }

      return { id: created.id, createdAt: created.createdAt };
    });
  }

  async findById(id: string): Promise<{ id: string; email: string; status: SupplyRequestStatus } | null> {
    return this.prisma.supplyRequest.findUnique({
      where: { id },
      select: { id: true, email: true, status: true },
    });
  }

  async findWithNumber(id: string): Promise<{ id: string; requestNumber: string | null } | null> {
    return this.prisma.supplyRequest.findUnique({
      where: { id },
      select: { id: true, requestNumber: true },
    });
  }

  async findByRequestReference(
    reference: string,
    unreadSenderTypes: ChatMessageSender[],
  ): Promise<SupplyRequestResponse | null> {
    const { requestNumber, sequenceNumber } = this.normalizeRequestReference(reference);

    if (!requestNumber && !sequenceNumber) {
      return null;
    }

    const where: Prisma.SupplyRequestWhereInput = requestNumber
      ? { requestNumber }
      : { sequenceNumber };

    const request = await this.prisma.supplyRequest.findFirst({
      where,
      include: {
        _count: {
          select: {
            chatMessages: {
              where: {
                isRead: false,
                senderType: { in: unreadSenderTypes },
              },
            },
          },
        },
      },
    });

    if (!request) {
      return null;
    }

    const { _count, ...data } = request;
    return { ...data, unreadCount: _count.chatMessages };
  }

  async findAttachmentsByRequestId(requestId: string) {
    return this.prisma.supplyRequestAttachment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAll(
    filters: GetRequestsQueryDto | undefined,
    unreadSenderTypes: ChatMessageSender[],
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    const page = this.normalizeNumber(filters?.page, DEFAULT_PAGE);
    const limit = this.normalizeNumber(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const where = this.buildWhere(filters);

    const skip = (page - 1) * limit;
    const [total, data] = await this.prisma.$transaction([
      this.prisma.supplyRequest.count({ where }),
      this.prisma.supplyRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              chatMessages: {
                where: {
                  isRead: false,
                  senderType: { in: unreadSenderTypes },
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: data.map(({ _count, ...request }) => ({
        ...request,
        unreadCount: _count.chatMessages,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAllByEmail(
    email: string,
    filters: GetRequestsQueryDto | undefined,
    unreadSenderTypes: ChatMessageSender[],
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    const page = this.normalizeNumber(filters?.page, DEFAULT_PAGE);
    const limit = this.normalizeNumber(filters?.limit, DEFAULT_LIMIT, MAX_LIMIT);
    const where = this.buildWhere(filters);
    where.email = { equals: email, mode: 'insensitive' };

    const skip = (page - 1) * limit;
    const [total, data] = await this.prisma.$transaction([
      this.prisma.supplyRequest.count({ where }),
      this.prisma.supplyRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              chatMessages: {
                where: {
                  isRead: false,
                  senderType: { in: unreadSenderTypes },
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: data.map(({ _count, ...request }) => ({
        ...request,
        unreadCount: _count.chatMessages,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getStats(): Promise<SupplyRequestStatsResponse> {
    const since = this.getDateDaysAgo(DEFAULT_STATS_DAYS);
    const newRequests = await this.prisma.supplyRequest.count({
      where: { createdAt: { gte: since }, status: SupplyRequestStatus.NEW },
    });

    return {
      newRequests,
      periodDays: DEFAULT_STATS_DAYS,
    };
  }

  async updateStatus(id: string, status: SupplyRequestStatus): Promise<SupplyRequestResponse> {
    return this.prisma.supplyRequest.update({
      where: { id },
      data: { status },
    });
  }

  private normalizeNumber(value: number | undefined, fallback: number, max?: number): number {
    if (!Number.isFinite(value) || value === undefined || value <= 0) {
      return fallback;
    }

    if (max !== undefined) {
      return Math.min(value, max);
    }

    return value;
  }

  private normalizeSearch(value?: string): string | undefined {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private buildWhere(filters?: GetRequestsQueryDto): Prisma.SupplyRequestWhereInput {
    const search = this.normalizeSearch(filters?.search);
    const status = filters?.status;
    const where: Prisma.SupplyRequestWhereInput = {};

    if (search) {
      const requestNumber = this.normalizeRequestNumber(search);
      const sequenceNumber = requestNumber ? undefined : this.parseSequenceNumber(search);

      if (requestNumber) {
        where.requestNumber = requestNumber;
      } else if (sequenceNumber) {
        where.sequenceNumber = sequenceNumber;
      } else {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    if (status && Object.values(SupplyRequestStatus).includes(status)) {
      where.status = status;
    }

    return where;
  }

  private normalizeRequestNumber(value: string): string | undefined {
    const compact = value.trim().replace(/\s+/g, '');
    const normalized = compact.startsWith(REQUEST_NUMBER_PREFIX)
      ? compact.slice(REQUEST_NUMBER_PREFIX.length).trim()
      : compact;

    return REQUEST_NUMBER_PATTERN.test(normalized) ? normalized : undefined;
  }

  private normalizeRequestReference(value: string): {
    requestNumber?: string;
    sequenceNumber?: number;
  } {
    const normalized = this.normalizeSearch(value);
    if (!normalized) {
      return {};
    }

    const compact = normalized.replace(/\s+/g, '');
    const withoutPrefix = compact.startsWith(REQUEST_NUMBER_PREFIX)
      ? compact.slice(REQUEST_NUMBER_PREFIX.length).trim()
      : compact;

    const requestNumber = this.normalizeRequestNumber(withoutPrefix);
    if (requestNumber) {
      return { requestNumber };
    }

    const sequenceCandidate = withoutPrefix.includes(REQUEST_NUMBER_SEPARATOR)
      ? withoutPrefix.split(REQUEST_NUMBER_SEPARATOR)[0]
      : withoutPrefix;

    const sequenceNumber = this.parseSequenceNumber(sequenceCandidate);
    return sequenceNumber ? { sequenceNumber } : {};
  }

  private parseSequenceNumber(value: string): number | undefined {
    if (!SEQUENCE_NUMBER_PATTERN.test(value)) {
      return undefined;
    }

    if (value.length > REQUEST_NUMBER_PAD_LENGTH) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  private buildRequestNumber(sequenceNumber: number, createdAt: Date): string {
    const sequence = String(sequenceNumber).padStart(REQUEST_NUMBER_PAD_LENGTH, PAD_CHAR);
    const day = this.formatDatePart(createdAt.getDate());
    const month = this.formatDatePart(createdAt.getMonth() + MONTH_OFFSET);
    const year = createdAt.getFullYear();

    return `${sequence}${REQUEST_NUMBER_SEPARATOR}${day}${month}${year}`;
  }

  private formatDatePart(value: number): string {
    return String(value).padStart(REQUEST_NUMBER_DATE_PAD_LENGTH, PAD_CHAR);
  }

  private getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private async createRequestWithNumber(
    tx: Prisma.TransactionClient,
    dto: CreateRequestDto,
  ) {
    const created = await tx.supplyRequest.create({ data: dto });
    const requestNumber = this.buildRequestNumber(created.sequenceNumber, created.createdAt);
    return tx.supplyRequest.update({
      where: { id: created.id },
      data: { requestNumber },
    });
  }
}
