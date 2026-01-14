import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthTokensResponse, LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
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
  async me(@Req() request: Request): Promise<{ id: string; email: string; role: string }> {
    const userId = (request as RequestWithUser).user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    const user = await this.authService.getProfile(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
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
