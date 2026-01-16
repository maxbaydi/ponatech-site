import { CanActivate, ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

jest.setTimeout(30000);

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requestRef = context.switchToHttp().getRequest<{
      method: string;
      headers: Record<string, string | string[] | undefined>;
    }>();

    if (requestRef.method !== 'POST') {
      return true;
    }

    const roleHeader = requestRef.headers['x-role'];
    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    return role === 'MANAGER';
  }
}

const ensureSchema = (): void => {
  const schemaPath = join(process.cwd(), 'apps', 'catalog-service', 'prisma', 'schema.prisma');
  const prismaCliPath = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');

  execFileSync(
    process.execPath,
    [prismaCliPath, 'db', 'push', '--accept-data-loss', '--skip-generate', '--schema', schemaPath],
    { stdio: 'inherit', env: process.env },
  );
};

describe('ProductsController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ??
      'postgresql://ponatech:ponatech@localhost:5432/ponatech_catalog_test?schema=public';

    ensureSchema();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: APP_GUARD,
          useClass: MockAuthGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /products creates product with json attributes', async () => {
    const suffix = randomUUID();
    const brand = await prisma.brand.create({
      data: {
        name: `Brand ${suffix}`,
        slug: `brand-${suffix}`,
      },
    });
    const category = await prisma.category.create({
      data: {
        name: `Category ${suffix}`,
        slug: `category-${suffix}`,
      },
    });

    const payload = {
      title: 'Tee',
      slug: `tee-${suffix}`,
      sku: `sku-${suffix}`,
      description: 'Soft tee',
      price: 1200,
      currency: 'RUB',
      stock: 5,
      attributes: {
        color: 'red',
        material: 'cotton',
      },
      brandId: brand.id,
      categoryId: category.id,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('x-role', 'MANAGER')
      .send(payload)
      .expect(201);

    expect(response.body.attributes).toEqual({ color: 'red', material: 'cotton' });
    expect(response.body.brandId).toBe(brand.id);
    expect(response.body.categoryId).toBe(category.id);

    const stored = await prisma.product.findUnique({ where: { id: response.body.id } });
    expect(stored?.attributes).toEqual({ color: 'red', material: 'cotton' });
  });

  it('GET /products filters by json attributes', async () => {
    const suffix = randomUUID();
    const brand = await prisma.brand.create({
      data: {
        name: `Brand ${suffix}`,
        slug: `brand-${suffix}`,
      },
    });
    const category = await prisma.category.create({
      data: {
        name: `Category ${suffix}`,
        slug: `category-${suffix}`,
      },
    });

    await prisma.product.create({
      data: {
        title: 'Red Tee',
        slug: `red-tee-${suffix}`,
        sku: `sku-red-${suffix}`,
        description: 'Red',
        price: 1000,
        currency: 'RUB',
        stock: 2,
        attributes: { color: 'red' },
        brandId: brand.id,
        categoryId: category.id,
      },
    });

    await prisma.product.create({
      data: {
        title: 'Blue Tee',
        slug: `blue-tee-${suffix}`,
        sku: `sku-blue-${suffix}`,
        description: 'Blue',
        price: 1000,
        currency: 'RUB',
        stock: 2,
        attributes: { color: 'blue' },
        brandId: brand.id,
        categoryId: category.id,
      },
    });

    const response = await request(app.getHttpServer()).get('/products?color=red').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].attributes).toEqual({ color: 'red' });
  });

  it('DELETE /products/:id performs soft delete', async () => {
    const suffix = randomUUID();
    const brand = await prisma.brand.create({
      data: {
        name: `Brand ${suffix}`,
        slug: `brand-${suffix}`,
      },
    });
    const category = await prisma.category.create({
      data: {
        name: `Category ${suffix}`,
        slug: `category-${suffix}`,
      },
    });

    const product = await prisma.product.create({
      data: {
        title: 'Delete Me',
        slug: `delete-${suffix}`,
        sku: `sku-delete-${suffix}`,
        description: 'Delete',
        price: 500,
        currency: 'RUB',
        stock: 1,
        attributes: { color: 'black' },
        brandId: brand.id,
        categoryId: category.id,
      },
    });

    await request(app.getHttpServer()).delete(`/products/${product.id}`).expect(200);

    const stored = await prisma.product.findUnique({ where: { id: product.id } });
    expect(stored?.deletedAt).not.toBeNull();
  });

  it('GET /categories returns tree structure', async () => {
    const parent = await prisma.category.create({
      data: {
        name: 'Apparel',
        slug: `apparel-${randomUUID()}`,
      },
    });
    const child = await prisma.category.create({
      data: {
        name: 'Shirts',
        slug: `shirts-${randomUUID()}`,
        parentId: parent.id,
      },
    });
    const root = await prisma.category.create({
      data: {
        name: 'Footwear',
        slug: `footwear-${randomUUID()}`,
      },
    });

    const response = await request(app.getHttpServer()).get('/categories').expect(200);

    const parentNode = findCategoryNode(response.body, parent.id);
    const rootNode = findCategoryNode(response.body, root.id);

    expect(parentNode?.children).toHaveLength(1);
    expect(parentNode?.children[0].id).toBe(child.id);
    expect(rootNode?.children).toHaveLength(0);
  });

  it('POST /brands blocks customer role', async () => {
    await request(app.getHttpServer())
      .post('/brands')
      .set('x-role', 'CUSTOMER')
      .send({
        name: 'Blocked Brand',
        slug: `blocked-${randomUUID()}`,
      })
      .expect(403);
  });

  it('DELETE /brands performs soft delete', async () => {
    const brand = await request(app.getHttpServer())
      .post('/brands')
      .set('x-role', 'MANAGER')
      .send({
        name: 'Soft Brand',
        slug: `soft-brand-${randomUUID()}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/brands/${brand.body.id}`)
      .set('x-role', 'MANAGER')
      .expect(200);

    const stored = await prisma.brand.findUnique({ where: { id: brand.body.id } });
    expect(stored?.deletedAt).not.toBeNull();

    const list = await request(app.getHttpServer()).get('/brands').expect(200);
    expect(list.body).toHaveLength(0);
  });

  it('DELETE /categories performs soft delete', async () => {
    const category = await request(app.getHttpServer())
      .post('/categories')
      .set('x-role', 'MANAGER')
      .send({
        name: 'Soft Category',
        slug: `soft-category-${randomUUID()}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/categories/${category.body.id}`)
      .set('x-role', 'MANAGER')
      .expect(200);

    const stored = await prisma.category.findUnique({ where: { id: category.body.id } });
    expect(stored?.deletedAt).not.toBeNull();

    const list = await request(app.getHttpServer()).get('/categories').expect(200);
    expect(list.body).toHaveLength(0);
  });

  it('POST /products validates brandId and categoryId', async () => {
    const suffix = randomUUID();
    const brand = await prisma.brand.create({
      data: {
        name: `Brand ${suffix}`,
        slug: `brand-${suffix}`,
      },
    });

    await request(app.getHttpServer())
      .post('/products')
      .set('x-role', 'MANAGER')
      .send({
        title: 'Invalid Category',
        slug: `invalid-category-${suffix}`,
        sku: `sku-invalid-category-${suffix}`,
        description: 'Invalid',
        price: 900,
        currency: 'RUB',
        stock: 1,
        attributes: { color: 'green' },
        brandId: brand.id,
        categoryId: 'missing-category',
      })
      .expect(404);

    const category = await prisma.category.create({
      data: {
        name: `Category ${suffix}`,
        slug: `category-${suffix}`,
      },
    });

    await request(app.getHttpServer())
      .post('/products')
      .set('x-role', 'MANAGER')
      .send({
        title: 'Invalid Brand',
        slug: `invalid-brand-${suffix}`,
        sku: `sku-invalid-brand-${suffix}`,
        description: 'Invalid',
        price: 900,
        currency: 'RUB',
        stock: 1,
        attributes: { color: 'green' },
        brandId: 'missing-brand',
        categoryId: category.id,
      })
      .expect(404);
  });

  it('GET /products filters by brandId, categoryId, and status', async () => {
    const suffix = randomUUID();
    const brandA = await prisma.brand.create({
      data: {
        name: `Brand A ${suffix}`,
        slug: `brand-a-${suffix}`,
      },
    });
    const brandB = await prisma.brand.create({
      data: {
        name: `Brand B ${suffix}`,
        slug: `brand-b-${suffix}`,
      },
    });
    const categoryA = await prisma.category.create({
      data: {
        name: `Category A ${suffix}`,
        slug: `category-a-${suffix}`,
      },
    });
    const categoryB = await prisma.category.create({
      data: {
        name: `Category B ${suffix}`,
        slug: `category-b-${suffix}`,
      },
    });

    await prisma.product.create({
      data: {
        title: 'Published A',
        slug: `published-a-${suffix}`,
        sku: `sku-published-a-${suffix}`,
        description: 'Published',
        price: 1500,
        currency: 'RUB',
        stock: 2,
        status: ProductStatus.PUBLISHED,
        attributes: { material: 'cotton' },
        brandId: brandA.id,
        categoryId: categoryA.id,
      },
    });

    await prisma.product.create({
      data: {
        title: 'Draft B',
        slug: `draft-b-${suffix}`,
        sku: `sku-draft-b-${suffix}`,
        description: 'Draft',
        price: 1600,
        currency: 'RUB',
        stock: 3,
        status: ProductStatus.DRAFT,
        attributes: { material: 'linen' },
        brandId: brandB.id,
        categoryId: categoryB.id,
      },
    });

    const byBrand = await request(app.getHttpServer())
      .get(`/products?brandId=${brandA.id}`)
      .expect(200);
    expect(byBrand.body.data).toHaveLength(1);
    expect(byBrand.body.data[0].brandId).toBe(brandA.id);

    const byCategory = await request(app.getHttpServer())
      .get(`/products?categoryId=${categoryB.id}`)
      .expect(200);
    expect(byCategory.body.data).toHaveLength(1);
    expect(byCategory.body.data[0].categoryId).toBe(categoryB.id);

    const byStatus = await request(app.getHttpServer())
      .get(`/products?status=PUBLISHED`)
      .expect(200);
    expect(byStatus.body.data).toHaveLength(1);
    expect(byStatus.body.data[0].status).toBe('PUBLISHED');
  });
});

const findCategoryNode = (
  nodes: Array<{ id: string; children?: unknown[] }>,
  id: string,
): { id: string; children: unknown[] } | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node as { id: string; children: unknown[] };
    }

    const children = Array.isArray(node.children) ? node.children : [];
    const match = findCategoryNode(children as Array<{ id: string; children?: unknown[] }>, id);

    if (match) {
      return match;
    }
  }

  return undefined;
};
