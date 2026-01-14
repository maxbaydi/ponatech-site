import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User, UserRole } from '@prisma/client';
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './role.enum';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

export type UserRecord = User;

interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
  ver: number;
  iat: number;
  exp: number;
}

const ACCESS_TOKEN_DEFAULT_TTL = 3600;
const REFRESH_TOKEN_DEFAULT_TTL = 60 * 60 * 24 * 30;

@Injectable()
export class AuthRepository {
  private readonly jwtSecret: string;
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.accessTokenTtlSeconds = parseExpiresIn(
      this.configService.get<string>('JWT_EXPIRES_IN'),
      ACCESS_TOKEN_DEFAULT_TTL,
    );
    this.refreshTokenTtlSeconds = parseExpiresIn(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      REFRESH_TOKEN_DEFAULT_TTL,
    );
  }

  getAccessTokenTtlSeconds(): number {
    return this.accessTokenTtlSeconds;
  }

  async createUser(email: string, password: string, role: Role): Promise<UserRecord> {
    const normalizedEmail = normalizeEmail(email);

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: this.hashPassword(password),
        role: role as unknown as UserRole,
      },
    });
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  async findUserById(userId: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findAllUsers(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: UserRecord[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = options?.search
      ? { email: { contains: options.search, mode: 'insensitive' } }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  verifyPassword(password: string, storedHash: string): boolean {
    return this.verifyPasswordHash(password, storedHash);
  }

  createAccessToken(user: UserRecord): string {
    return this.signJwt(
      {
        sub: user.id,
        role: user.role as Role,
        email: user.email,
        ver: user.tokenVersion,
      },
      this.accessTokenTtlSeconds,
    );
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async rotateRefreshToken(
    refreshToken: string,
  ): Promise<{ user: UserRecord; refreshToken: string } | null> {
    if (!refreshToken || refreshToken.trim().length === 0) {
      return null;
    }

    const tokenHash = this.hashToken(refreshToken);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
        return null;
      }

      if (!record.user.isActive) {
        return null;
      }

      const revoked = await tx.refreshToken.updateMany({
        where: { id: record.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count === 0) {
        return null;
      }

      const nextToken = randomBytes(48).toString('base64url');
      const nextHash = this.hashToken(nextToken);
      const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);

      await tx.refreshToken.create({
        data: {
          tokenHash: nextHash,
          userId: record.userId,
          expiresAt,
        },
      });

      return { user: record.user, refreshToken: nextToken };
    });
  }

  async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    if (!refreshToken || refreshToken.trim().length === 0) {
      return false;
    }

    const tokenHash = this.hashToken(refreshToken);
    const result = await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return result.count > 0;
  }

  async updateUserRole(userId: string, role: Role): Promise<UserRecord> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          role: role as unknown as UserRole,
          tokenVersion: { increment: 1 },
        },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return user;
    });
  }

  async deactivateUser(userId: string): Promise<UserRecord> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          tokenVersion: { increment: 1 },
        },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return user;
    });
  }

  async logoutAll(userId: string): Promise<UserRecord> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          tokenVersion: { increment: 1 },
        },
      });

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return user;
    });
  }

  async validateToken(token: string): Promise<AuthenticatedUser | null> {
    if (!token || token.trim().length === 0) {
      return null;
    }

    const payload = this.verifyJwt(token);

    if (!payload || !payload.sub || !payload.role) {
      return null;
    }

    if (!Object.values(Role).includes(payload.role)) {
      return null;
    }

    const user = await this.findUserById(payload.sub);

    if (!user || !user.isActive) {
      return null;
    }

    if (user.role !== (payload.role as unknown as UserRole)) {
      return null;
    }

    if (user.tokenVersion !== payload.ver) {
      return null;
    }

    return {
      userId: user.id,
      role: user.role as Role,
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('base64url');
    const hash = scryptSync(password, salt, 64).toString('base64url');
    return `${salt}:${hash}`;
  }

  private verifyPasswordHash(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derived = scryptSync(password, salt, 64).toString('base64url');

    return safeEqual(hash, derived);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds: number): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSeconds;
    const fullPayload: JwtPayload = { ...payload, iat, exp };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', this.jwtSecret)
      .update(signingInput)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyJwt(token: string): JwtPayload | null {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac('sha256', this.jwtSecret)
      .update(signingInput)
      .digest('base64url');

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    try {
      const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string };

      if (header.alg !== 'HS256') {
        return null;
      }

      const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;

      if (!payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const base64UrlEncode = (input: string): string => Buffer.from(input).toString('base64url');

const base64UrlDecode = (input: string): string => Buffer.from(input, 'base64url').toString('utf8');

const safeEqual = (value: string, expected: string): boolean => {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
};

const parseExpiresIn = (value: string | undefined, fallbackSeconds: number): number => {
  if (!value) {
    return fallbackSeconds;
  }

  const trimmed = value.trim();
  const match = /^(\d+)([smhd])?$/.exec(trimmed);

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);

  if (!Number.isFinite(amount) || amount <= 0) {
    return fallbackSeconds;
  }

  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  };

  return amount * (multipliers[unit] ?? 1);
};
