import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  GetUsersQueryDto,
  GetUsersStatsQueryDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserRoleDto,
  UsersStatsResponse,
} from './dto/admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './guards/jwt-auth.guard';
import { Roles } from './guards/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './role.enum';

@Controller('auth/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.SuperAdmin)
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  async getUsers(@Query() query: GetUsersQueryDto): Promise<{
    users: {
      id: string;
      email: string;
      role: string;
      isActive: boolean;
      name?: string | null;
      phone?: string | null;
      company?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.authService.getAllUsers({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get('users/stats')
  async getUsersStats(@Query() query: GetUsersStatsQueryDto): Promise<UsersStatsResponse> {
    return this.authService.getUsersStats(query.days);
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: string): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.getUserByIdAdmin(userId);
  }

  @Post('users')
  async createUser(
    @Req() request: RequestWithUser,
    @Body() dto: CreateUserDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.createUserByAdmin(dto, request.user?.userId);
  }

  @Patch('users/:id')
  async updateUser(
    @Req() request: RequestWithUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.updateUserByAdmin(userId, dto, request.user?.userId);
  }

  @Patch('users/:id/password')
  async updatePassword(
    @Req() request: RequestWithUser,
    @Param('id') userId: string,
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.updateUserPasswordByAdmin(userId, dto, request.user?.userId);
  }

  @Patch('users/:id/role')
  async updateRole(
    @Param('id') userId: string,
    @Req() request: RequestWithUser,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.updateUserRole(userId, dto.role, request.user?.userId);
  }

  @Post('users/:id/deactivate')
  @HttpCode(200)
  async deactivate(
    @Param('id') userId: string,
    @Req() request: RequestWithUser,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.authService.deactivateUser(userId, request.user?.userId);
  }

  @Post('users/:id/logout-all')
  @HttpCode(200)
  async logoutAll(@Param('id') userId: string, @Req() request: RequestWithUser): Promise<{ success: boolean }> {
    await this.authService.logoutAll(userId, request.user?.userId);
    return { success: true };
  }

  @Delete('users/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string, @Req() request: RequestWithUser): Promise<void> {
    await this.authService.deleteUserByAdmin(userId, request.user?.userId);
  }
}
