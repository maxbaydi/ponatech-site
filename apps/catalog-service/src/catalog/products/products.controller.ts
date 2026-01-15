import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';
import {
  BatchOperationResult,
  BatchUpdateProductBrandDto,
  BatchUpdateProductCategoryDto,
  BatchUpdateProductStatusDto,
  CreateProductDto,
  PaginatedResponse,
  ProductIdsDto,
  ProductResponse,
  UpdateProductDto,
} from './dto/product.dto';
import { ExportProductsCsvDto, ImportProductsCsvDto, ImportProductsCsvResult } from './dto/products-csv.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() filters: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    return this.productsService.findAll(filters);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ProductResponse> {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponse> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async create(@Body() dto: CreateProductDto): Promise<ProductResponse> {
    return this.productsService.create(dto);
  }

  @Post('import-csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: ImportProductsCsvDto,
  ): Promise<ImportProductsCsvResult> {
    if (!file?.buffer) {
      throw new BadRequestException('CSV file is required');
    }
    return this.productsService.importCsv(file.buffer, dto);
  }

  @Post('export-csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async exportCsv(
    @Body() dto: ExportProductsCsvDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this.productsService.exportCsv(dto);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return new StreamableFile(buffer);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponse> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  @Post('batch/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async removeMany(@Body() dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsService.removeMany(dto);
  }

  @Patch('batch/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async updateStatusMany(@Body() dto: BatchUpdateProductStatusDto): Promise<BatchOperationResult> {
    return this.productsService.updateStatusMany(dto);
  }

  @Patch('batch/brand')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async updateBrandMany(@Body() dto: BatchUpdateProductBrandDto): Promise<BatchOperationResult> {
    return this.productsService.updateBrandMany(dto);
  }

  @Patch('batch/category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async updateCategoryMany(@Body() dto: BatchUpdateProductCategoryDto): Promise<BatchOperationResult> {
    return this.productsService.updateCategoryMany(dto);
  }

  @Get('trash/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async findAllDeleted(
    @Query() filters: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    return this.productsService.findAllDeleted(filters);
  }

  @Post('trash/:id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async restore(@Param('id') id: string): Promise<ProductResponse> {
    return this.productsService.restore(id);
  }

  @Post('trash/batch/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async restoreMany(@Body() dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsService.restoreMany(dto);
  }

  @Delete('trash/:id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.productsService.hardDelete(id);
  }

  @Post('trash/batch/permanent-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async hardDeleteMany(@Body() dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsService.hardDeleteMany(dto);
  }
}
