import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryResponse, CategoryTreeResponse, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryTreeResponse[]> {
    const categories = await this.categoriesRepository.findAll();
    return buildCategoryTree(categories);
  }

  async findOne(id: string): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.findOne(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    return this.categoriesRepository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.categoriesRepository.remove(id);
  }
}

const buildCategoryTree = (categories: CategoryResponse[]): CategoryTreeResponse[] => {
  const nodes = new Map<string, CategoryTreeResponse>();
  const roots: CategoryTreeResponse[] = [];

  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};
