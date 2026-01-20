import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryResponse[]> {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<CategoryResponse | null> {
    return this.prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  async findByName(name: string): Promise<CategoryResponse | null> {
    return this.prisma.category.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async findBySlug(slug: string): Promise<CategoryResponse | null> {
    return this.prisma.category.findFirst({ where: { slug, deletedAt: null } });
  }

  async findByNameOrSlug(name: string, slugs: string[]): Promise<CategoryResponse | null> {
    const uniqueSlugs = Array.from(new Set(slugs)).filter((slug) => slug.trim().length > 0);
    return this.prisma.category.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          ...(uniqueSlugs.length > 0 ? [{ slug: { in: uniqueSlugs } }] : []),
        ],
      },
    });
  }

  async create(data: CreateCategoryDto): Promise<CategoryResponse> {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
