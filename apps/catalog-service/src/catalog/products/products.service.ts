import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandsRepository } from '../brands/brands.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, ProductResponse, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsRepository: BrandsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async findAll(
    filters?: Record<string, string | string[] | undefined>,
  ): Promise<ProductResponse[]> {
    return this.productsRepository.findAll(filters);
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.productsRepository.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    await this.ensureRelations(dto.brandId, dto.categoryId);
    return this.productsRepository.create(dto);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.ensureRelations(dto.brandId, dto.categoryId);
    return this.productsRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.remove(id);
  }

  private async ensureRelations(brandId?: string, categoryId?: string): Promise<void> {
    const [brand, category] = await Promise.all([
      brandId ? this.brandsRepository.findOne(brandId) : Promise.resolve(null),
      categoryId ? this.categoriesRepository.findOne(categoryId) : Promise.resolve(null),
    ]);

    if (brandId && !brand) {
      throw new NotFoundException('Brand not found');
    }

    if (categoryId && !category) {
      throw new NotFoundException('Category not found');
    }
  }
}
