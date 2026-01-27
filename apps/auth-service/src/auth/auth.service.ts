import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AppLogger } from '@ponatech/common';
import { AuthRepository, AuthenticatedUser, UserRecord, normalizeEmail } from './auth.repository';
import { AuthTokensResponse, ChangePasswordDto, LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { CreateUserDto, UpdateUserDto, UpdateUserPasswordDto, UsersStatsResponse } from './dto/admin.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import { DEFAULT_USERS_PAGE, DEFAULT_USERS_PAGE_LIMIT, DEFAULT_USERS_STATS_DAYS, MIN_STATS_DAYS } from './auth.constants';
import { Role } from './role.enum';

const INVALID_PASSWORD_MESSAGE = 'Неверный текущий пароль';
const PASSWORD_MATCH_MESSAGE = 'Новый пароль должен отличаться от текущего';
const USER_ALREADY_EXISTS_MESSAGE = 'User already exists';
const USER_NOT_FOUND_MESSAGE = 'User not found';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';
const ADMIN_USER_LOG_MESSAGE = 'Admin user action';
const ADMIN_USER_ACTIONS = {
  create: 'create',
  update: 'update',
  resetPassword: 'reset_password',
  delete: 'delete',
  logoutAll: 'logout_all',
} as const;
const USER_UPDATE_FIELDS = {
  email: 'email',
  role: 'role',
  isActive: 'isActive',
  name: 'name',
  phone: 'phone',
  company: 'company',
} as const;

type AdminUserDetails = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  createdAt: Date;
  updatedAt: Date;
};


@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: AppLogger,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existing = await this.authRepository.findUserByEmail(dto.email);

    if (existing) {
      throw new ConflictException(USER_ALREADY_EXISTS_MESSAGE);
    }

    const user = await this.executeUserMutation(
      () =>
        this.authRepository.createUser({
          email: dto.email,
          password: dto.password,
          role: Role.Customer,
        }),
      { conflictMessage: USER_ALREADY_EXISTS_MESSAGE },
    );

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user || !user.isActive || !this.authRepository.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
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
      throw new UnauthorizedException(USER_NOT_FOUND_MESSAGE);
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserRecord> {
    const update = normalizeProfileUpdate(dto);

    if (Object.keys(update).length === 0) {
      return this.getProfile(userId);
    }

    return this.executeUserMutation(() => this.authRepository.updateUserProfile(userId, update), {
      notFoundMessage: USER_NOT_FOUND_MESSAGE,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<AuthTokensResponse> {
    const user = await this.getProfile(userId);

    if (!this.authRepository.verifyPassword(dto.currentPassword, user.passwordHash)) {
      throw new BadRequestException(INVALID_PASSWORD_MESSAGE);
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(PASSWORD_MATCH_MESSAGE);
    }

    const updatedUser = await this.authRepository.updateUserPassword(userId, dto.newPassword);
    return this.issueTokens(updatedUser);
  }

  async getAllUsers(options?: { page?: number; limit?: number; search?: string }): Promise<{
    users: AdminUserDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options?.page ?? DEFAULT_USERS_PAGE;
    const limit = options?.limit ?? DEFAULT_USERS_PAGE_LIMIT;

    const { users, total } = await this.authRepository.findAllUsers({ page, limit, search: options?.search });

    return {
      users: users.map((user) => this.toAdminDetails(user)),
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

  async getUserByIdAdmin(userId: string): Promise<AdminUserDetails> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    return this.toAdminDetails(user);
  }

  async createUserByAdmin(dto: CreateUserDto, actorId?: string): Promise<AdminUserDetails> {
    const role = dto.role ?? Role.Customer;
    const name = dto.name !== undefined ? normalizeOptionalString(dto.name) : undefined;
    const phone = dto.phone !== undefined ? normalizeOptionalString(dto.phone) : undefined;
    const company = dto.company !== undefined ? normalizeOptionalString(dto.company) : undefined;

    const user = await this.executeUserMutation(
      () =>
        this.authRepository.createUser({
          email: dto.email,
          password: dto.password,
          role,
          name,
          phone,
          company,
          isActive: dto.isActive,
        }),
      { conflictMessage: USER_ALREADY_EXISTS_MESSAGE },
    );

    this.logAdminUserAction(ADMIN_USER_ACTIONS.create, {
      actorId,
      targetUserId: user.id,
      role: user.role,
      isActive: user.isActive,
    });

    return this.toAdminDetails(user);
  }

  async updateUserByAdmin(userId: string, dto: UpdateUserDto, actorId?: string): Promise<AdminUserDetails> {
    const existing = await this.authRepository.findUserById(userId);

    if (!existing) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    const updateData: Prisma.UserUpdateInput = {};
    const updatedFields: string[] = [];
    let revokeTokens = false;

    if (dto.email !== undefined) {
      const normalizedEmail = normalizeEmail(dto.email);
      if (normalizedEmail !== existing.email) {
        updateData.email = normalizedEmail;
        updatedFields.push(USER_UPDATE_FIELDS.email);
        revokeTokens = true;
      }
    }

    if (dto.role !== undefined && dto.role !== (existing.role as Role)) {
      updateData.role = dto.role as UserRecord['role'];
      updatedFields.push(USER_UPDATE_FIELDS.role);
      revokeTokens = true;
    }

    if (dto.isActive !== undefined && dto.isActive !== existing.isActive) {
      updateData.isActive = dto.isActive;
      updatedFields.push(USER_UPDATE_FIELDS.isActive);
      revokeTokens = true;
    }

    const profileUpdate = normalizeProfileUpdate(dto);

    if (dto.name !== undefined && profileUpdate.name !== existing.name) {
      updateData.name = profileUpdate.name ?? null;
      updatedFields.push(USER_UPDATE_FIELDS.name);
    }

    if (dto.phone !== undefined && profileUpdate.phone !== existing.phone) {
      updateData.phone = profileUpdate.phone ?? null;
      updatedFields.push(USER_UPDATE_FIELDS.phone);
    }

    if (dto.company !== undefined && profileUpdate.company !== existing.company) {
      updateData.company = profileUpdate.company ?? null;
      updatedFields.push(USER_UPDATE_FIELDS.company);
    }

    if (updatedFields.length === 0) {
      return this.toAdminDetails(existing);
    }

    if (revokeTokens) {
      updateData.tokenVersion = { increment: 1 };
    }

    const updatedUser = await this.executeUserMutation(
      () => this.authRepository.updateUserAdmin(userId, updateData, revokeTokens),
      {
        conflictMessage: USER_ALREADY_EXISTS_MESSAGE,
        notFoundMessage: USER_NOT_FOUND_MESSAGE,
      },
    );

    this.logAdminUserAction(ADMIN_USER_ACTIONS.update, {
      actorId,
      targetUserId: userId,
      updatedFields,
      isActive: updatedUser.isActive,
      role: updatedUser.role,
    });

    return this.toAdminDetails(updatedUser);
  }

  async updateUserPasswordByAdmin(
    userId: string,
    dto: UpdateUserPasswordDto,
    actorId?: string,
  ): Promise<AdminUserDetails> {
    const user = await this.executeUserMutation(() => this.authRepository.updateUserPassword(userId, dto.password), {
      notFoundMessage: USER_NOT_FOUND_MESSAGE,
    });

    this.logAdminUserAction(ADMIN_USER_ACTIONS.resetPassword, {
      actorId,
      targetUserId: userId,
    });

    return this.toAdminDetails(user);
  }

  async deleteUserByAdmin(userId: string, actorId?: string): Promise<void> {
    const user = await this.executeUserMutation(() => this.authRepository.deleteUser(userId), {
      notFoundMessage: USER_NOT_FOUND_MESSAGE,
    });

    this.logAdminUserAction(ADMIN_USER_ACTIONS.delete, {
      actorId,
      targetUserId: userId,
      email: user.email,
      role: user.role,
    });
  }

  async updateUserRole(userId: string, role: Role, actorId?: string): Promise<AdminUserDetails> {
    return this.updateUserByAdmin(userId, { role }, actorId);
  }

  async deactivateUser(userId: string, actorId?: string): Promise<AdminUserDetails> {
    return this.updateUserByAdmin(userId, { isActive: false }, actorId);
  }

  async logoutAll(userId: string, actorId?: string): Promise<void> {
    await this.executeUserMutation(() => this.authRepository.logoutAll(userId), {
      notFoundMessage: USER_NOT_FOUND_MESSAGE,
    });

    this.logAdminUserAction(ADMIN_USER_ACTIONS.logoutAll, {
      actorId,
      targetUserId: userId,
    });
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

  private async executeUserMutation<T>(
    action: () => Promise<T>,
    options?: { conflictMessage?: string; notFoundMessage?: string },
  ): Promise<T> {
    try {
      return await action();
    } catch (error: unknown) {
      if (options?.conflictMessage && isUniqueConstraintError(error)) {
        throw new ConflictException(options.conflictMessage);
      }

      if (options?.notFoundMessage && isNotFoundError(error)) {
        throw new NotFoundException(options.notFoundMessage);
      }

      throw error;
    }
  }

  private toAdminDetails(user: UserRecord): AdminUserDetails {
    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      name: user.name ?? null,
      phone: user.phone ?? null,
      company: user.company ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private logAdminUserAction(
    action: (typeof ADMIN_USER_ACTIONS)[keyof typeof ADMIN_USER_ACTIONS],
    meta: Record<string, unknown>,
  ): void {
    this.logger.log(ADMIN_USER_LOG_MESSAGE, {
      action,
      ...meta,
    });
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

type ProfileUpdateInput = {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
};

const normalizeProfileUpdate = (dto: ProfileUpdateInput): ProfileUpdateInput => {
  const update: ProfileUpdateInput = {};

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
