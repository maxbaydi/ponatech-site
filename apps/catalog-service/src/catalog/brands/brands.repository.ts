import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BrandResponse, CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

const BRAND_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  country: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BrandResponse[]> {
    const [brands, counts] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        select: BRAND_SELECT,
      }),
      this.prisma.product.groupBy({
        by: ['brandId'],
        where: { deletedAt: null },
        orderBy: { brandId: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const countsMap = new Map<string, number>();
    counts.forEach((row) => {
      const count = typeof row._count === 'object' && row._count ? row._count._all ?? 0 : 0;
      countsMap.set(row.brandId, count);
    });

    return brands.map((brand) => ({
      ...brand,
      productsCount: countsMap.get(brand.id) ?? 0,
    }));
  }

  async findOne(id: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
      select: BRAND_SELECT,
    });
  }

  async findByName(name: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
      },
      select: BRAND_SELECT,
    });
  }

  async findBySlug(slug: string): Promise<BrandResponse | null> {
    return this.prisma.brand.findFirst({
      where: { slug, deletedAt: null },
      select: BRAND_SELECT,
    });
  }

  async create(data: CreateBrandDto): Promise<BrandResponse> {
    return this.prisma.brand.create({ data, select: BRAND_SELECT });
  }

  async update(id: string, data: UpdateBrandDto): Promise<BrandResponse> {
    return this.prisma.brand.update({
      where: { id },
      data,
      select: BRAND_SELECT,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
