import { Body, Controller, Get, HttpCode, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthTokensResponse, ChangePasswordDto, LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { JwtAuthGuard, RequestWithUser } from './guards/jwt-auth.guard';
import { AUTH_SERVICE_NAME, ValidateTokenResponse } from '../grpc/auth.grpc';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokensResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<AuthTokensResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponse> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(
    @Req() request: Request,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    telegramChatId?: string | null;
    telegramNotificationsEnabled?: boolean;
  }> {
    const userId = (request as RequestWithUser).user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.authService.getProfile(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? null,
      phone: user.phone ?? null,
      company: user.company ?? null,
      telegramChatId: user.telegramChatId ?? null,
      telegramNotificationsEnabled: user.telegramNotificationsEnabled ?? false,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() request: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    name?: string | null;
    phone?: string | null;
    company?: string | null;
    telegramChatId?: string | null;
    telegramNotificationsEnabled?: boolean;
  }> {
    const userId = (request as RequestWithUser).user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.authService.updateProfile(userId, dto);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? null,
      phone: user.phone ?? null,
      company: user.company ?? null,
      telegramChatId: user.telegramChatId ?? null,
      telegramNotificationsEnabled: user.telegramNotificationsEnabled ?? false,
    };
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() request: Request, @Body() dto: ChangePasswordDto): Promise<AuthTokensResponse> {
    const userId = (request as RequestWithUser).user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.changePassword(userId, dto);
  }
}

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateToken')
  async validateToken(request: ValidateTokenDto): Promise<ValidateTokenResponse> {
    const user = await this.authService.validateToken(request.accessToken);

    if (!user) {
      return {
        isValid: false,
        userId: '',
        role: '',
      };
    }

    return {
      isValid: true,
      userId: user.userId,
      role: user.role,
    };
  }
}
