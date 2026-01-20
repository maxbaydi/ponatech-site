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
import { MediaModule } from './media/media.module';
import { ProductsController } from './products/products.controller';
import { ProductsRepository } from './products/products.repository';
import { ProductsService } from './products/products.service';
import { CartController } from './cart/cart.controller';
import { CartRepository } from './cart/cart.repository';
import { CartService } from './cart/cart.service';
import { RequestsController } from './requests/requests.controller';
import { RequestsRepository } from './requests/requests.repository';
import { RequestsService } from './requests/requests.service';
import { SiteSettingsController } from './settings/settings.controller';
import { SiteSettingsRepository } from './settings/settings.repository';
import { SiteSettingsService } from './settings/settings.service';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [
    BrandsController,
    CategoriesController,
    ProductsController,
    CatalogGrpcController,
    RequestsController,
    CartController,
    SiteSettingsController,
  ],
  providers: [
    BrandsRepository,
    BrandsService,
    CategoriesRepository,
    CategoriesService,
    ProductsRepository,
    ProductsService,
    RequestsRepository,
    RequestsService,
    CartRepository,
    CartService,
    SiteSettingsRepository,
    SiteSettingsService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class CatalogModule {}
