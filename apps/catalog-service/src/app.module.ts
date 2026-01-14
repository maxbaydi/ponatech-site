import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@ponatech/common';
import { CatalogModule } from './catalog/catalog.module';
import { catalogValidationSchema } from './config/env.validation';

const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validationSchema: catalogValidationSchema,
    }),
    CommonModule,
    CatalogModule,
  ],
})
export class AppModule {}
