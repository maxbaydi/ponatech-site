import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@ponatech/common';
import { AuthModule } from './auth/auth.module';
import { authValidationSchema } from './config/env.validation';

const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validationSchema: authValidationSchema,
    }),
    CommonModule,
    AuthModule,
  ],
})
export class AppModule {}
