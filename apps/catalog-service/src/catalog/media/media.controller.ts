import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import archiver from 'archiver';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { MediaService } from './media.service';
import {
  MediaFileResponse,
  MediaFilesQueryDto,
  PaginatedMediaFilesResponse,
  UpdateMediaFileDto,
  UploadFromUrlDto,
  MediaIdsDto,
  BatchOperationResult,
  MediaDownloadUrlsResponse,
} from './dto/media.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список медиафайлов' })
  async findAll(@Query() query: MediaFilesQueryDto): Promise<PaginatedMediaFilesResponse> {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить медиафайл по ID' })
  async findOne(@Param('id') id: string): Promise<MediaFileResponse> {
    return this.mediaService.findOne(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt?: string,
  ): Promise<MediaFileResponse> {
    return this.mediaService.upload(file, alt);
  }

  @Post('upload-from-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузить файл по URL' })
  async uploadFromUrl(@Body() dto: UploadFromUrlDto): Promise<MediaFileResponse> {
    return this.mediaService.uploadFromUrl(dto.url, dto.alt);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить медиафайл' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaFileDto,
  ): Promise<MediaFileResponse> {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить медиафайл' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.mediaService.delete(id);
  }

  @Post('batch/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Массовое удаление медиафайлов' })
  async deleteBatch(@Body() dto: MediaIdsDto): Promise<BatchOperationResult> {
    return this.mediaService.deleteBatch(dto.ids);
  }

  @Post('batch/download-urls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить URL для скачивания выбранных файлов' })
  async getDownloadUrls(@Body() dto: MediaIdsDto): Promise<MediaDownloadUrlsResponse> {
    return this.mediaService.getDownloadUrls(dto.ids);
  }

  @Post('batch/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.Admin, Role.Manager)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download selected media files as zip' })
  @ApiProduces('application/zip')
  async downloadBatch(@Body() dto: MediaIdsDto, @Res() res: Response): Promise<void> {
    const files = await this.mediaService.getFilesForArchive(dto.ids);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `media-files-${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    archive.on('error', (error) => {
      res.destroy(error);
    });

    archive.pipe(res);

    const usedNames = new Set<string>();
    for (const file of files) {
      const entryName = this.buildArchiveEntryName(file.originalName, file.id, usedNames);
      archive.append(file.stream, { name: entryName });
    }

    await archive.finalize();
  }

  private buildArchiveEntryName(originalName: string, id: string, usedNames: Set<string>): string {
    const sanitized = this.sanitizeFilename(originalName) || `file-${id}`;
    if (!usedNames.has(sanitized)) {
      usedNames.add(sanitized);
      return sanitized;
    }

    const { base, ext } = this.splitFilename(sanitized);
    let index = 1;
    let candidate = `${base}-${index}${ext}`;
    while (usedNames.has(candidate)) {
      index += 1;
      candidate = `${base}-${index}${ext}`;
    }
    usedNames.add(candidate);
    return candidate;
  }

  private splitFilename(filename: string): { base: string; ext: string } {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === filename.length - 1) {
      return { base: filename, ext: '' };
    }
    return { base: filename.slice(0, lastDot), ext: filename.slice(lastDot) };
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^\w.-]+/g, '_');
  }
}
