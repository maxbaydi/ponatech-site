import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { RateLimitGuard } from '../src/auth/guards/rate-limit.guard';
import { Role } from '../src/auth/role.enum';
import { PrismaService } from '../src/prisma/prisma.service';

const ensureSchema = (): void => {
  const schemaPath = join(process.cwd(), 'apps', 'catalog-service', 'prisma', 'schema.prisma');
  const prismaCliPath = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');

  execFileSync(
    process.execPath,
    [prismaCliPath, 'db', 'push', '--accept-data-loss', '--skip-generate', '--schema', schemaPath],
    { stdio: 'inherit', env: process.env },
  );
};

const buildTestDatabaseUrl = (schema: string): string => {
  const baseUrl =
    process.env.TEST_DATABASE_URL ??
    'postgresql://ponatech:ponatech@localhost:5432/ponatech_catalog_test?schema=public';

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('schema', schema);
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}schema=${schema}`;
  }
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    RateLimitGuard.reset();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key-change-me';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
    process.env.RATE_LIMIT_MAX = '1000';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.DATABASE_URL = buildTestDatabaseUrl('auth_test');

    ensureSchema();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    authService = app.get(AuthService);
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /auth/register registers user and returns tokens', async () => {
    const email = `user-${randomUUID()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    expect(response.body).toMatchObject({
      tokenType: 'Bearer',
      user: { email, role: Role.Customer },
    });
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  it('POST /auth/register returns 409 on duplicate user', async () => {
    const email = `dup-${randomUUID()}@example.com`;
    const payload = { email, password: 'StrongPass123!' };

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(201);

    await request(app.getHttpServer()).post('/auth/register').send(payload).expect(409);
  });

  it('POST /auth/login returns 401 for invalid credentials', async () => {
    const email = `login-${randomUUID()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'WrongPass123!' })
      .expect(401);
  });

  it('POST /auth/login authenticates and issues tokens', async () => {
    const email = `auth-${randomUUID()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'StrongPass123!' })
      .expect(200);

    expect(response.body.user).toMatchObject({ email, role: Role.Customer });
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  it('POST /auth/refresh rotates refresh tokens', async () => {
    const email = `refresh-${randomUUID()}@example.com`;

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    const refreshToken = register.body.refreshToken;

    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshed.body.refreshToken).not.toBe(refreshToken);
    expect(typeof refreshed.body.accessToken).toBe('string');

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('POST /auth/logout revokes refresh token', async () => {
    const email = `logout-${randomUUID()}@example.com`;

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken: register.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: register.body.refreshToken })
      .expect(401);
  });

  it('GET /auth/me returns profile for valid access token', async () => {
    const email = `me-${randomUUID()}@example.com`;

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${register.body.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({ email, role: Role.Customer });
  });

  it('GET /auth/me rejects tampered access token', async () => {
    const email = `tamper-${randomUUID()}@example.com`;

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'StrongPass123!' })
      .expect(201);

    const token = register.body.accessToken as string;
    const tampered = `${token.slice(0, -1)}x`;

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${tampered}`)
      .expect(401);
  });

  it('admin can update user role and invalidate existing tokens', async () => {
    const adminEmail = `admin-${randomUUID()}@example.com`;
    const userEmail = `user-${randomUUID()}@example.com`;
    const password = 'StrongPass123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'SUPER_ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, password })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/auth/admin/users/${userLogin.body.user.id}/role`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .send({ role: 'MANAGER' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`)
      .expect(401);

    const relogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    expect(relogin.body.user.role).toBe(Role.Manager);
  });

  it('admin can deactivate user and block login', async () => {
    const adminEmail = `admin-${randomUUID()}@example.com`;
    const userEmail = `inactive-${randomUUID()}@example.com`;
    const password = 'StrongPass123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'SUPER_ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, password })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/auth/admin/users/${userLogin.body.user.id}/deactivate`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(401);
  });

  it('admin can logout-all and revoke refresh tokens', async () => {
    const adminEmail = `admin-${randomUUID()}@example.com`;
    const userEmail = `logout-${randomUUID()}@example.com`;
    const password = 'StrongPass123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'SUPER_ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, password })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/auth/admin/users/${userLogin.body.user.id}/logout-all`)
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: userLogin.body.refreshToken })
      .expect(401);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`)
      .expect(401);
  });

  it('blocks admin endpoints for non-admin user', async () => {
    const email = `basic-${randomUUID()}@example.com`;
    const password = 'StrongPass123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/auth/admin/users/${login.body.user.id}/role`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ role: 'MANAGER' })
      .expect(403);
  });
});

describe('Auth rate limiting', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    RateLimitGuard.reset();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key-change-me';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
    process.env.RATE_LIMIT_MAX = '4';
    process.env.RATE_LIMIT_WINDOW_MS = '10000';
    process.env.DATABASE_URL = buildTestDatabaseUrl('auth_test');

    ensureSchema();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns 429 when rate limit exceeded', async () => {
    const email = `limit-${randomUUID()}@example.com`;
    const password = 'StrongPass123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(RateLimitGuard.getSize()).toBe(1);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(RateLimitGuard.getSize()).toBe(1);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(RateLimitGuard.getSize()).toBe(1);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(429);
  });
});
