import { Injectable } from '@nestjs/common';
import { ChatEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_BACKLOG_LIMIT = 200;
const MAX_BACKLOG_LIMIT = 1000;

type CreateEventInput = {
  type: ChatEventType;
  requestId?: string;
  userId?: string;
  email?: string;
  payload: Prisma.InputJsonValue;
};

type GetEventsInput = {
  lastEventId?: number;
  requestId?: string;
  userId?: string;
  email?: string;
  limit?: number;
};

@Injectable()
export class ChatEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(input: CreateEventInput) {
    return this.prisma.chatEventQueue.create({
      data: {
        type: input.type,
        requestId: input.requestId ?? null,
        userId: input.userId ?? null,
        email: input.email ?? null,
        payload: input.payload,
      },
    });
  }

  async getEvents(input: GetEventsInput) {
    const where: Prisma.ChatEventQueueWhereInput = {};

    if (input.lastEventId !== undefined) {
      where.id = { gt: input.lastEventId };
    }

    if (input.requestId) {
      where.requestId = input.requestId;
    }

    if (input.userId) {
      where.userId = input.userId;
    }

    if (input.email) {
      where.email = { equals: input.email, mode: 'insensitive' };
    }

    const limit = Math.min(
      Math.max(input.limit ?? DEFAULT_BACKLOG_LIMIT, 1),
      MAX_BACKLOG_LIMIT,
    );

    return this.prisma.chatEventQueue.findMany({
      where,
      orderBy: { id: 'asc' },
      take: limit,
    });
  }
}
