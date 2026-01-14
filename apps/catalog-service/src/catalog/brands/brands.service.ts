import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandResponse, CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { BrandsRepository } from './brands.repository';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async findAll(): Promise<BrandResponse[]> {
    return this.brandsRepository.findAll();
  }

  async findOne(id: string): Promise<BrandResponse> {
    const brand = await this.brandsRepository.findOne(id);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async create(dto: CreateBrandDto): Promise<BrandResponse> {
    return this.brandsRepository.create(dto);
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandResponse> {
    return this.brandsRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.brandsRepository.remove(id);
  }
}
