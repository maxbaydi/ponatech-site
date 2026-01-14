import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUsersQueryDto, UpdateUserRoleDto } from './dto/admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
    users: { id: string; email: string; role: string; isActive: boolean; createdAt: Date }[];
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

  @Patch('users/:id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<{ id: string; email: string; role: string; isActive: boolean }> {
    return this.authService.updateUserRole(userId, dto.role);
  }

  @Post('users/:id/deactivate')
  @HttpCode(200)
  async deactivate(
    @Param('id') userId: string,
  ): Promise<{ id: string; email: string; role: string; isActive: boolean }> {
    return this.authService.deactivateUser(userId);
  }

  @Post('users/:id/logout-all')
  @HttpCode(200)
  async logoutAll(@Param('id') userId: string): Promise<{ success: boolean }> {
    await this.authService.logoutAll(userId);
    return { success: true };
  }
}
