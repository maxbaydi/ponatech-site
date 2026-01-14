import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BrandsController } from './brands/brands.controller';
import { BrandsRepository } from './brands/brands.repository';
import { BrandsService } from './brands/brands.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesRepository } from './categories/categories.repository';
import { CategoriesService } from './categories/categories.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { CatalogGrpcController } from './grpc/catalog-grpc.controller';
import { ProductsController } from './products/products.controller';
import { ProductsRepository } from './products/products.repository';
import { ProductsService } from './products/products.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    BrandsController,
    CategoriesController,
    ProductsController,
    CatalogGrpcController,
  ],
  providers: [
    BrandsRepository,
    BrandsService,
    CategoriesRepository,
    CategoriesService,
    ProductsRepository,
    ProductsService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class CatalogModule {}
