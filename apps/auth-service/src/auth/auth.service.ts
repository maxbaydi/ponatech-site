import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository, AuthenticatedUser, UserRecord } from './auth.repository';
import { AuthTokensResponse, LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { UsersStatsResponse } from './dto/admin.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import { Role } from './role.enum';

const DEFAULT_USERS_STATS_DAYS = 7;
const MIN_STATS_DAYS = 1;

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existing = await this.authRepository.findUserByEmail(dto.email);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    let user: UserRecord;

    try {
      user = await this.authRepository.createUser(dto.email, dto.password, Role.Customer);
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('User already exists');
      }

      throw error;
    }

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user || !user.isActive || !this.authRepository.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokensResponse> {
    const rotated = await this.authRepository.rotateRefreshToken(dto.refreshToken);

    if (!rotated) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(rotated.user, rotated.refreshToken);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    await this.authRepository.revokeRefreshToken(dto.refreshToken);
  }

  async validateToken(accessToken: string): Promise<AuthenticatedUser | null> {
    return this.authRepository.validateToken(accessToken);
  }

  async getProfile(userId: string): Promise<UserRecord> {
    const user = await this.authRepository.findUserById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserRecord> {
    const update = normalizeProfileUpdate(dto);

    if (Object.keys(update).length === 0) {
      return this.getProfile(userId);
    }

    return this.executeUserUpdate(() => this.authRepository.updateUserProfile(userId, update));
  }

  async getAllUsers(options?: { page?: number; limit?: number; search?: string }): Promise<{
    users: { id: string; email: string; role: string; isActive: boolean; createdAt: Date }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const { users, total } = await this.authRepository.findAllUsers({ page, limit, search: options?.search });

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role as Role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsersStats(days?: number): Promise<UsersStatsResponse> {
    const periodDays = normalizeStatsDays(days);
    const since = getDateDaysAgo(periodDays);
    const newUsers = await this.authRepository.countUsersSince(since);

    return {
      newUsers,
      periodDays,
    };
  }

  async updateUserRole(
    userId: string,
    role: Role,
  ): Promise<{ id: string; email: string; role: string; isActive: boolean }> {
    const user = await this.executeUserUpdate(() =>
      this.authRepository.updateUserRole(userId, role),
    );

    return this.toAdminResponse(user);
  }

  async deactivateUser(
    userId: string,
  ): Promise<{ id: string; email: string; role: string; isActive: boolean }> {
    const user = await this.executeUserUpdate(() => this.authRepository.deactivateUser(userId));
    return this.toAdminResponse(user);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.executeUserUpdate(() => this.authRepository.logoutAll(userId));
  }

  private async issueTokens(user: UserRecord, refreshToken?: string): Promise<AuthTokensResponse> {
    const accessToken = this.authRepository.createAccessToken(user);
    const nextRefreshToken = refreshToken ?? (await this.authRepository.createRefreshToken(user.id));

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      tokenType: 'Bearer',
      expiresIn: this.authRepository.getAccessTokenTtlSeconds(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        name: user.name ?? null,
        phone: user.phone ?? null,
        company: user.company ?? null,
      },
    };
  }

  private async executeUserUpdate<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  private toAdminResponse(user: UserRecord): { id: string; email: string; role: string; isActive: boolean } {
    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
    };
  }
}

const isUniqueConstraintError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error && (error as { code?: string }).code === 'P2002';
};

const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error && (error as { code?: string }).code === 'P2025';
};

const normalizeProfileUpdate = (dto: UpdateProfileDto): { name?: string | null; phone?: string | null; company?: string | null } => {
  const update: { name?: string | null; phone?: string | null; company?: string | null } = {};

  if (dto.name !== undefined) {
    update.name = normalizeOptionalString(dto.name);
  }

  if (dto.phone !== undefined) {
    update.phone = normalizeOptionalString(dto.phone);
  }

  if (dto.company !== undefined) {
    update.company = normalizeOptionalString(dto.company);
  }

  return update;
};

const normalizeStatsDays = (days?: number): number => {
  if (days === undefined || !Number.isFinite(days) || days < MIN_STATS_DAYS) {
    return DEFAULT_USERS_STATS_DAYS;
  }

  return Math.floor(days);
};

const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const normalizeOptionalString = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};
