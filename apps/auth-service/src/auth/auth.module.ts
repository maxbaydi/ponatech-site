import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from '@ponatech/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController, AuthGrpcController } from './auth.controller';
import { AuthAdminController } from './admin.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [CommonModule, PrismaModule],
  controllers: [AuthController, AuthAdminController, AuthGrpcController],
  providers: [
    AuthService,
    AuthRepository,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AuthModule {}
