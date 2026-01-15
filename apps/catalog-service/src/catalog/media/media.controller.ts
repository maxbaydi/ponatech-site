import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
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
}
