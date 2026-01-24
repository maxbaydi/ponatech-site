import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryResponse, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryResponse[]> {
    const [categories, counts] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        where: { deletedAt: null, categoryId: { not: null } },
        orderBy: { categoryId: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const countsMap = new Map<string, number>();
    counts.forEach((row) => {
      if (row.categoryId) {
        const count = typeof row._count === 'object' && row._count ? row._count._all ?? 0 : 0;
        countsMap.set(row.categoryId, count);
      }
    });

    return categories.map((category) => ({
      ...category,
      productsCount: countsMap.get(category.id) ?? 0,
    }));
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
