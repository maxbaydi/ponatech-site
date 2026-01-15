import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BrandResponse, CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BrandResponse[]> {
    return this.prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({ where: { id, deletedAt: null } });
  }

  async findByName(name: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async findBySlug(slug: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({ where: { slug, deletedAt: null } });
  }

  async create(data: CreateBrandDto): Promise<BrandResponse> {
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: UpdateBrandDto): Promise<BrandResponse> {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
