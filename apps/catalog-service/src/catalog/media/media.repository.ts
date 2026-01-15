import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaFilesQueryDto, PaginatedMediaFilesResponse } from './dto/media.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MediaFilesQueryDto): Promise<PaginatedMediaFilesResponse> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { originalName: { contains: query.search, mode: 'insensitive' as const } },
            { filename: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.prisma.mediaFile.findUnique({ where: { id } });
  }

  async findByUrl(url: string) {
    return this.prisma.mediaFile.findFirst({ where: { url } });
  }

  async create(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }) {
    return this.prisma.mediaFile.create({ data });
  }

  async update(id: string, data: { alt?: string }) {
    return this.prisma.mediaFile.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.mediaFile.delete({ where: { id } });
  }
}
