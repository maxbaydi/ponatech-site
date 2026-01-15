import { Module } from '@nestjs/common';
import { MinioModule } from '../../minio/minio.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

@Module({
  imports: [MinioModule, PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
