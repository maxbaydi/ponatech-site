import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto, RequestResponse } from './dto/request.dto';

@Injectable()
export class RequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequestDto): Promise<RequestResponse> {
    return this.prisma.supplyRequest.create({
      data: dto,
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
}
