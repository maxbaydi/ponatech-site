import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';
import { parseString, writeToBuffer } from 'fast-csv';
import { BrandsRepository } from '../brands/brands.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsRepository } from './products.repository';
import {
  BatchOperationResult,
  BatchUpdateProductBrandDto,
  BatchUpdateProductCategoryDto,
  BatchUpdateProductStatusDto,
  CreateProductDto,
  PaginatedResponse,
  ProductIdsDto,
  ProductImageResponse,
  ProductResponse,
  UpdateProductDto,
} from './dto/product.dto';
import {
  ExportProductsCsvDto,
  ImportProductsCsvDto,
  ImportProductsCsvResult,
  ImportProductsCsvStrategy,
  PRODUCT_CSV_COLUMNS,
} from './dto/products-csv.dto';
import { slugify } from '../utils/slugify';
import { getMainProductImage } from './product-image.utils';
import { applyProductSearchFilter } from './product-search.utils';

const CSV_REQUIRED_COLUMNS = ['name', 'article', 'price', 'brand'] as const;
const DEFAULT_PRODUCT_CURRENCY = 'RUB';
const DEFAULT_PRODUCT_STATUS: ProductStatus = ProductStatus.DRAFT;
const DEFAULT_IMPORT_STATUS: ProductStatus = ProductStatus.PUBLISHED;
const DEFAULT_IMPORT_MERGE_STRATEGY: ImportProductsCsvStrategy = 'replace';
const DEFAULT_BRAND_SLUG_BASE = 'brand';
const DEFAULT_CATEGORY_SLUG_BASE = 'category';

const MAX_SLUG_ATTEMPTS = 50;
const MAX_EXPORT_LIMIT = 50_000;
const PRODUCT_MAIN_IMAGE_ORDER = 0;

type CsvRow = Record<string, unknown>;
type ProductCsvColumn = (typeof PRODUCT_CSV_COLUMNS)[number];

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly brandsRepository: BrandsRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly mediaService: MediaService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    filters?: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const result = await this.productsRepository.findAll(filters);
    return this.normalizePaginatedResponse(result);
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.productsRepository.findOne(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.normalizeProductResponse(product);
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.normalizeProductResponse(product);
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    await this.ensureRelations(dto.brandId, dto.categoryId);
    const created = await this.productsRepository.create(dto);
    await this.syncMainImage(created.id, dto.mainImageId, created.title);
    return this.findOne(created.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.ensureRelations(dto.brandId, dto.categoryId);
    const updated = await this.productsRepository.update(id, dto);
    await this.syncMainImage(updated.id, dto.mainImageId, updated.title);
    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.remove(id);
  }

  async removeMany(dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsRepository.removeMany(dto.ids);
  }

  async updateStatusMany(dto: BatchUpdateProductStatusDto): Promise<BatchOperationResult> {
    return this.productsRepository.updateStatusMany(dto.ids, dto.status);
  }

  async updateBrandMany(dto: BatchUpdateProductBrandDto): Promise<BatchOperationResult> {
    await this.ensureRelations(dto.brandId, undefined);
    return this.productsRepository.updateBrandMany(dto.ids, dto.brandId);
  }

  async updateCategoryMany(dto: BatchUpdateProductCategoryDto): Promise<BatchOperationResult> {
    await this.ensureRelations(undefined, dto.categoryId ?? undefined);
    return this.productsRepository.updateCategoryMany(dto.ids, dto.categoryId);
  }

  async findAllDeleted(
    filters?: Record<string, string | string[] | undefined>,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const result = await this.productsRepository.findAllDeleted(filters);
    return this.normalizePaginatedResponse(result);
  }

  async restore(id: string): Promise<ProductResponse> {
    const restored = await this.productsRepository.restoreOne(id);
    return this.normalizeProductResponse(restored);
  }

  async restoreMany(dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsRepository.restoreMany(dto.ids);
  }

  async hardDelete(id: string): Promise<void> {
    await this.productsRepository.hardDeleteOne(id);
  }

  async hardDeleteMany(dto: ProductIdsDto): Promise<BatchOperationResult> {
    return this.productsRepository.hardDeleteMany(dto.ids);
  }

  private normalizePaginatedResponse(
    response: PaginatedResponse<ProductResponse>,
  ): PaginatedResponse<ProductResponse> {
    return {
      ...response,
      data: response.data.map((product) => this.normalizeProductResponse(product)),
    };
  }

  private normalizeProductResponse(product: ProductResponse): ProductResponse {
    return {
      ...product,
      images: this.normalizeProductImages(product.images),
    };
  }

  private normalizeProductImages(
    images?: ProductImageResponse[],
  ): ProductImageResponse[] | undefined {
    if (!images) return images;
    return images.map((image) => this.normalizeProductImage(image));
  }

  private normalizeProductImage(image: ProductImageResponse): ProductImageResponse {
    return {
      ...image,
      url: this.mediaService.normalizePublicUrl(image.url),
    };
  }

  async importCsv(buffer: Buffer, opts?: ImportProductsCsvDto): Promise<ImportProductsCsvResult> {
    const text = buffer.toString('utf8');
    const status = opts?.status ?? DEFAULT_IMPORT_STATUS;
    const updateBySku = opts?.updateBySku !== 'false';
    const mergeStrategy = opts?.mergeStrategy ?? DEFAULT_IMPORT_MERGE_STRATEGY;
    const requestedColumns = opts?.columns;
    const result: ImportProductsCsvResult = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    let rowIndex = 0;

    await new Promise<void>((resolve, reject) => {
      const parser = parseString(text, { headers: true, trim: true, ignoreEmpty: true });
      let importColumns: ProductCsvColumn[] | null = null;
      let inFlight = 0;
      let ended = false;
      let rejected = false;

      const safeReject = (error: unknown) => {
        if (rejected) return;
        rejected = true;
        reject(error);
      };

      const maybeResolve = () => {
        if (!rejected && ended && inFlight === 0) {
          resolve();
        }
      };

      parser.on('error', safeReject);

      parser.on('headers', (headers: string[]) => {
        try {
          importColumns = this.normalizeImportColumns(headers, requestedColumns);
        } catch (error) {
          safeReject(error);
          parser.destroy();
        }
      });

      parser.on('data', (row: CsvRow) => {
        if (rejected) return;
        rowIndex += 1;
        const csvRowNumber = rowIndex + 1; // header is row 1
        result.total += 1;
        inFlight += 1;

        parser.pause();
        const columnSet = new Set(importColumns ?? PRODUCT_CSV_COLUMNS);
        this.upsertFromCsvRow(row, { status, updateBySku, mergeStrategy, columns: columnSet })
          .then((outcome) => {
            if (outcome === 'created') result.created += 1;
            if (outcome === 'updated') result.updated += 1;
          })
          .catch((error: unknown) => {
            result.failed += 1;
            result.errors.push({ row: csvRowNumber, message: this.toCsvErrorMessage(error) });
          })
          .finally(() => {
            inFlight -= 1;
            if (!parser.destroyed) {
              parser.resume();
            }
            maybeResolve();
          });
      });

      parser.on('end', () => {
        ended = true;
        maybeResolve();
      });
    });

    return result;
  }

  async exportCsv(dto: ExportProductsCsvDto): Promise<{ buffer: Buffer; filename: string }> {
    const columns = this.normalizeExportColumns(dto.columns);

    const products = await this.prisma.product.findMany({
      where: this.buildWhereForExport(dto),
      orderBy: { createdAt: 'desc' },
      take: MAX_EXPORT_LIMIT,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });

    const rows = products.map((product) => {
      const mainImage = getMainProductImage(product.images);
      const values: Record<string, string> = {};

      for (const column of columns) {
        switch (column) {
          case 'id':
            values.id = product.id;
            break;
          case 'name':
            values.name = product.title;
            break;
          case 'article':
            values.article = product.sku;
            break;
          case 'price':
            values.price = String(product.price);
            break;
          case 'img':
            values.img = mainImage?.url ?? '';
            break;
          case 'description':
            values.description = product.description ?? '';
            break;
          case 'characteristics':
            if (product.specs && typeof product.specs === 'object') {
              values.characteristics = JSON.stringify(product.specs);
            } else {
              values.characteristics = product.characteristics ?? '';
            }
            break;
          case 'brand':
            values.brand = product.brand?.name ?? '';
            break;
          case 'category':
            values.category = product.category?.name ?? '';
            break;
        }
      }

      return values;
    });

    const buffer = await writeToBuffer(rows, { headers: columns });
    const bom = Buffer.from('\ufeff', 'utf8');
    return { buffer: Buffer.concat([bom, buffer]), filename: 'products.csv' };
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

  private async syncMainImage(
    productId: string,
    mainImageId: string | null | undefined,
    fallbackAlt: string,
  ): Promise<void> {
    if (mainImageId === undefined) return;

    if (mainImageId === null) {
      await this.prisma.productImage.deleteMany({ where: { productId } });
      return;
    }

    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id: mainImageId },
      select: { id: true, url: true, alt: true },
    });

    if (!mediaFile) {
      throw new NotFoundException('Media file not found');
    }

    const alt = mediaFile.alt ?? fallbackAlt;

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productImage.create({
        data: {
          productId,
          url: mediaFile.url,
          alt,
          order: PRODUCT_MAIN_IMAGE_ORDER,
          isMain: true,
          mediaFileId: mediaFile.id,
        },
      });
    });
  }

  private async upsertFromCsvRow(
    row: CsvRow,
    opts: {
      status: ProductStatus;
      updateBySku: boolean;
      mergeStrategy: ImportProductsCsvStrategy;
      columns: Set<ProductCsvColumn>;
    },
  ): Promise<'created' | 'updated'> {
    const hasColumn = (column: ProductCsvColumn) => opts.columns.has(column);

    const normalizedRow = this.normalizeCsvRow(row);

    const id = hasColumn('id') ? this.normalizeString(normalizedRow.id) : undefined;
    const name = hasColumn('name') ? this.requireString(normalizedRow.name, 'name') : undefined;
    const article = hasColumn('article') ? this.requireString(normalizedRow.article, 'article') : undefined;
    const price = hasColumn('price') ? this.requireNumber(normalizedRow.price, 'price') : undefined;
    const description = hasColumn('description') ? this.normalizeString(normalizedRow.description) : undefined;
    const rawCharacteristics = hasColumn('characteristics')
      ? this.normalizeString(normalizedRow.characteristics)
      : undefined;
    const parsedSpecs = hasColumn('characteristics') ? this.parseSpecsFromCsv(rawCharacteristics) : { hasSpecs: false };
    const characteristics = hasColumn('characteristics')
      ? parsedSpecs.hasSpecs
        ? null
        : rawCharacteristics
      : undefined;
    const brandName = hasColumn('brand') ? this.requireString(normalizedRow.brand, 'brand') : undefined;
    const categoryValue = hasColumn('category') ? this.normalizeString(normalizedRow.category) : undefined;
    const imgUrl = hasColumn('img') ? this.normalizeString(normalizedRow.img) : undefined;

    const existingSelect: Prisma.ProductSelect = {
      id: true,
      title: true,
      sku: true,
      price: true,
      description: true,
      characteristics: true,
      specs: true,
      brandId: true,
      categoryId: true,
      status: true,
      images: {
        where: { isMain: true },
        orderBy: { order: 'asc' },
        take: 1,
        select: { url: true },
      },
    };

    const existingById = id
      ? await this.prisma.product.findFirst({
          where: { id, deletedAt: null },
          select: existingSelect,
        })
      : null;

    const existingBySku =
      !existingById && opts.updateBySku && article
        ? await this.prisma.product.findFirst({
            where: { sku: article, deletedAt: null },
            select: existingSelect,
          })
        : null;

    const existing = existingById ?? existingBySku;
    const matchedBySku = !existingById && !!existingBySku;

    const brandId = brandName ? await this.getOrCreateBrandId(brandName) : undefined;
    const categoryId = categoryValue ? await this.getOrCreateCategoryId(categoryValue) : undefined;

    if (existing) {
      let data: Prisma.ProductUncheckedUpdateInput = {};

      if (hasColumn('name') && name !== undefined) {
        data.title = name;
      }

      if (hasColumn('article') && article !== undefined) {
        data.sku = article;
      }

      if (hasColumn('price') && price !== undefined) {
        data.price = price;
      }

      if (hasColumn('description') && description !== undefined) {
        data.description = description;
      }

      if (hasColumn('characteristics')) {
        if (parsedSpecs.hasSpecs) {
          data.characteristics = null;
          data.specs = parsedSpecs.specs;
        } else if (rawCharacteristics !== undefined) {
          data.characteristics = rawCharacteristics;
        }
      }

      if (hasColumn('brand') && brandId) {
        data.brandId = brandId;
      }

      if (hasColumn('category') && categoryId) {
        data.categoryId = categoryId;
      }

      if (matchedBySku) {
        data.status = opts.status;
      }

      let mediaFile: { id: string; url: string } | null = null;
      if (imgUrl) {
        const existingImageUrl = existing.images?.[0]?.url;
        if (!(opts.mergeStrategy === 'update' && existingImageUrl === imgUrl)) {
          const alt = name ?? existing.title;
          mediaFile = await this.uploadImageToMediaLibrary(imgUrl, alt);
        }
      }

      if (opts.mergeStrategy === 'update') {
        data = this.filterChangedImportData(existing, data);
      }

      const hasDataUpdates = Object.keys(data).length > 0;

      if (!hasDataUpdates && !mediaFile) {
        return 'updated';
      }

      await this.prisma.$transaction(async (tx) => {
        if (hasDataUpdates) {
          await tx.product.update({ where: { id: existing.id }, data });
        }
        if (mediaFile) {
          await tx.productImage.deleteMany({ where: { productId: existing.id } });
          await tx.productImage.create({
            data: {
              url: mediaFile.url,
              order: 0,
              isMain: true,
              productId: existing.id,
              alt: name ?? existing.title,
              mediaFileId: mediaFile.id,
            },
          });
        }
      });

      return 'updated';
    }

    const missingRequired = CSV_REQUIRED_COLUMNS.filter((column) => !hasColumn(column));
    if (missingRequired.length > 0) {
      throw new BadRequestException(`Missing CSV columns: ${missingRequired.join(', ')}`);
    }

    if (!name || !article || price === undefined || !brandId) {
      throw new BadRequestException('Missing required product fields');
    }

    const slug = await this.buildUniqueProductSlug(name, article);
    const productId = id || undefined;
    const mediaFile = imgUrl ? await this.uploadImageToMediaLibrary(imgUrl, name) : null;

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...(productId ? { id: productId } : {}),
          title: name,
          slug,
          sku: article,
          description,
          characteristics,
          price,
          currency: DEFAULT_PRODUCT_CURRENCY,
          status: opts.status ?? DEFAULT_PRODUCT_STATUS,
          stock: null,
          attributes: {},
          specs: parsedSpecs.specs,
          brandId,
          categoryId: categoryId ?? null,
        },
      });

      if (mediaFile) {
        await tx.productImage.create({
          data: {
            url: mediaFile.url,
            order: 0,
            isMain: true,
            productId: created.id,
            alt: name,
            mediaFileId: mediaFile.id,
          },
        });
      }
    });

    return 'created';
  }

  private async uploadImageToMediaLibrary(
    imgUrl: string,
    alt: string,
  ): Promise<{ id: string; url: string } | null> {
    try {
      const mediaFile = await this.mediaService.uploadFromUrl(imgUrl, alt);
      return { id: mediaFile.id, url: mediaFile.url };
    } catch {
      return null;
    }
  }

  private async getOrCreateBrandId(name: string): Promise<string> {
    const existing = await this.brandsRepository.findByName(name);
    if (existing) return existing.id;

    const base = slugify(name) || DEFAULT_BRAND_SLUG_BASE;
    const slug = await this.buildUniqueSlug(base, (candidate) => this.brandsRepository.findBySlug(candidate));
    const created = await this.prisma.brand.create({ data: { name, slug } });
    return created.id;
  }

  private async getOrCreateCategoryId(value: string): Promise<string> {
    const slugified = slugify(value);
    const slugCandidates = slugified && slugified !== value ? [value, slugified] : [value];
    const existing = await this.categoriesRepository.findByNameOrSlug(value, slugCandidates);
    if (existing) return existing.id;

    const base = slugified || DEFAULT_CATEGORY_SLUG_BASE;
    const slug = await this.buildUniqueSlug(base, (candidate) => this.categoriesRepository.findBySlug(candidate));
    const created = await this.prisma.category.create({ data: { name: value, slug } });
    return created.id;
  }

  private async buildUniqueProductSlug(title: string, sku: string): Promise<string> {
    const base = slugify(title) || slugify(sku) || 'product';
    const skuSuffix = slugify(sku);
    const candidates = skuSuffix && base !== skuSuffix ? [base, `${base}-${skuSuffix}`] : [base];

    for (const candidate of candidates) {
      const available = await this.prisma.product.findUnique({ where: { slug: candidate } });
      if (!available) return candidate;
    }

    return this.buildUniqueSlug(base, (candidate) => this.prisma.product.findUnique({ where: { slug: candidate } }));
  }

  private async buildUniqueSlug(
    base: string,
    findExisting: (slug: string) => Promise<{ id: string } | null>,
  ): Promise<string> {
    const normalizedBase = base || 'item';

    for (let i = 0; i < MAX_SLUG_ATTEMPTS; i += 1) {
      const candidate = i === 0 ? normalizedBase : `${normalizedBase}-${i + 1}`;
      const existing = await findExisting(candidate);
      if (!existing) return candidate;
    }

    throw new BadRequestException('Unable to generate unique slug');
  }

  private buildWhereForExport(dto: ExportProductsCsvDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const ids = dto.ids?.filter((id) => id && id.trim());
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }
    const brandId = dto.brandId?.trim();
    if (brandId) {
      where.brandId = brandId;
    }
    applyProductSearchFilter(where, dto.search);
    return where;
  }

  private normalizeExportColumns(columns?: string[]): string[] {
    if (!columns || columns.length === 0) {
      return [...PRODUCT_CSV_COLUMNS];
    }

    const unique = Array.from(new Set(columns));
    const filtered = unique.filter((c) => PRODUCT_CSV_COLUMNS.includes(c as (typeof PRODUCT_CSV_COLUMNS)[number]));
    return filtered.length > 0 ? filtered : [...PRODUCT_CSV_COLUMNS];
  }

  private normalizeImportColumns(headers: string[], requested?: ProductCsvColumn[]): ProductCsvColumn[] {
    const normalizedHeaders = headers.map((header) => this.normalizeCsvHeader(String(header)));
    const headerSet = new Set(normalizedHeaders);
    const available = PRODUCT_CSV_COLUMNS.filter((column) => headerSet.has(column));

    if (requested) {
      const normalizedRequested = Array.from(
        new Set(requested.map((column) => this.normalizeCsvHeader(String(column))) as ProductCsvColumn[]),
      );
      if (normalizedRequested.length === 0) {
        throw new BadRequestException('No import columns selected');
      }
      const missing = normalizedRequested.filter((column) => !headerSet.has(column));
      if (missing.length > 0) {
        throw new BadRequestException(`Missing CSV columns: ${missing.join(', ')}`);
      }
      return normalizedRequested;
    }

    if (available.length === 0) {
      throw new BadRequestException('No import columns selected');
    }

    return available;
  }

  private normalizeCsvHeader(value: string): string {
    return value.replace(/^\uFEFF/, '').trim();
  }

  private normalizeCsvRow(row: CsvRow): CsvRow {
    return Object.entries(row).reduce<CsvRow>((acc, [key, value]) => {
      const normalizedKey = this.normalizeCsvHeader(key);
      acc[normalizedKey] = value;
      return acc;
    }, {});
  }

  private normalizeString(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    const text = String(value).trim();
    return text ? text : undefined;
  }

  private parseSpecsFromCsv(
    raw?: string,
  ): { specs?: Record<string, string>; hasSpecs: boolean } {
    if (!raw) {
      return { hasSpecs: false };
    }

    const trimmed = raw.trim();
    const candidates: string[] = [trimmed];
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      candidates.push(trimmed.slice(1, -1));
    }

    let sawJsonMarker = false;

    for (const candidate of candidates) {
      const candidateTrim = candidate.trim();
      if (candidateTrim.startsWith('{')) {
        sawJsonMarker = true;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(candidateTrim);
      } catch {
        continue;
      }

      if (typeof parsed === 'string') {
        const nested = parsed.trim();
        try {
          parsed = JSON.parse(nested);
        } catch {
          continue;
        }
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        continue;
      }

      const specs: Record<string, string> = {};
      Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
        const normalizedKey = String(key).trim();
        if (!normalizedKey) return;
        specs[normalizedKey] = value === null || value === undefined ? '' : String(value);
      });

      return { specs, hasSpecs: true };
    }

    if (sawJsonMarker) {
      throw new BadRequestException('Invalid characteristics JSON');
    }

    return { hasSpecs: false };
  }

  private filterChangedImportData(
    existing: {
      title: string;
      sku: string;
      price: unknown;
      description: string | null;
      characteristics: string | null;
      specs: unknown;
      brandId: string;
      categoryId: string | null;
      status: ProductStatus;
    },
    data: Prisma.ProductUncheckedUpdateInput,
  ): Prisma.ProductUncheckedUpdateInput {
    const next: Prisma.ProductUncheckedUpdateInput = {};

    if (data.title !== undefined && data.title !== existing.title) {
      next.title = data.title;
    }

    if (data.sku !== undefined && data.sku !== existing.sku) {
      next.sku = data.sku;
    }

    if (data.price !== undefined && !this.isSameNumber(existing.price, data.price)) {
      next.price = data.price;
    }

    if (data.description !== undefined && (data.description ?? null) !== (existing.description ?? null)) {
      next.description = data.description;
    }

    if (data.characteristics !== undefined && (data.characteristics ?? null) !== (existing.characteristics ?? null)) {
      next.characteristics = data.characteristics;
    }

    if (data.specs !== undefined && !this.areSpecsEqual(existing.specs, data.specs)) {
      next.specs = data.specs;
    }

    if (data.brandId !== undefined && data.brandId !== existing.brandId) {
      next.brandId = data.brandId;
    }

    if (data.categoryId !== undefined && data.categoryId !== existing.categoryId) {
      next.categoryId = data.categoryId;
    }

    if (data.status !== undefined && data.status !== existing.status) {
      next.status = data.status;
    }

    return next;
  }

  private areSpecsEqual(left: unknown, right: unknown): boolean {
    return this.normalizeSpecsValue(left) === this.normalizeSpecsValue(right);
  }

  private normalizeSpecsValue(value: unknown): string {
    const normalize = (input: unknown): unknown => {
      if (Array.isArray(input)) {
        return input.map((item) => normalize(item));
      }
      if (input && typeof input === 'object') {
        const entries = Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
        const sorted: Record<string, unknown> = {};
        entries.forEach(([key, val]) => {
          sorted[key] = normalize(val);
        });
        return sorted;
      }
      return input;
    };

    const serialized = JSON.stringify(normalize(value));
    return serialized === undefined ? 'undefined' : serialized;
  }

  private isSameNumber(left: unknown, right: unknown): boolean {
    const leftNum = this.toFiniteNumber(left);
    const rightNum = this.toFiniteNumber(right);
    if (leftNum === null || rightNum === null) {
      return false;
    }
    return Math.abs(leftNum - rightNum) < 1e-9;
  }

  private toFiniteNumber(value: unknown): number | null {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private requireString(value: unknown, field: string): string {
    const text = this.normalizeString(value);
    if (!text) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return text;
  }

  private requireNumber(value: unknown, field: string): number {
    const text = this.normalizeString(value);
    const parsed = text ? this.parseCsvNumber(text) : NaN;
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return parsed;
  }

  private parseCsvNumber(raw: string): number {
    const trimmed = raw.trim();
    if (!trimmed) return NaN;

    const compact = trimmed.replace(/[\s\u00A0\u202F]/g, '');
    if (!compact) return NaN;

    const lastComma = compact.lastIndexOf(',');
    const lastDot = compact.lastIndexOf('.');
    let normalized = compact;

    if (lastComma !== -1 && lastDot !== -1) {
      if (lastComma > lastDot) {
        normalized = compact.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = compact.replace(/,/g, '');
      }
    } else if (lastComma !== -1) {
      if (compact.indexOf(',') !== lastComma) {
        normalized = compact.replace(/,/g, '');
      } else {
        normalized = compact.replace(',', '.');
      }
    }

    return Number(normalized);
  }

  private toCsvErrorMessage(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      if (typeof response === 'string') return response;
      if (response && typeof response === 'object' && 'message' in response) {
        const message = (response as { message?: unknown }).message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message)) return message.map(String).join('; ');
      }
      return 'Bad request';
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: unknown; meta?: unknown };
      const code = String(prismaError.code ?? '');
      if (code === 'P2002') {
        const target = prismaError.meta && typeof prismaError.meta === 'object' && 'target' in prismaError.meta
          ? (prismaError.meta as { target?: unknown }).target
          : undefined;
        const targetText = Array.isArray(target) ? target.join(', ') : target ? String(target) : '';
        return targetText ? `Дубликат уникального поля: ${targetText}` : 'Дубликат уникального поля (P2002)';
      }

      return `Database error: ${code}`;
    }

    return error instanceof Error ? error.message : 'Unknown error';
  }
}
