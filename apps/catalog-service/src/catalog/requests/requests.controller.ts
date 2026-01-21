import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import archiver from 'archiver';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateRequestDto,
  GetRequestsQueryDto,
  PaginatedResponse,
  RequestResponse,
  SupplyRequestAttachmentResponse,
  SupplyRequestResponse,
  SupplyRequestStatsResponse,
  UpdateRequestStatusDto,
} from './dto/request.dto';
import { RequestsService } from './requests.service';
import {
  REQUEST_ATTACHMENT_MAX_FILE_SIZE,
  REQUEST_ATTACHMENT_MAX_FILES,
  isAllowedAttachmentType,
} from './request-attachments.constants';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRequestDto): Promise<RequestResponse> {
    return this.requestsService.create(dto);
  }

  @Post('with-attachments')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        description: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: ['name', 'email', 'phone', 'description'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', REQUEST_ATTACHMENT_MAX_FILES, {
      limits: { fileSize: REQUEST_ATTACHMENT_MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (isAllowedAttachmentType(file.originalname, file.mimetype)) {
          callback(null, true);
          return;
        }
        callback(
          new BadRequestException(`Unsupported file type: ${file.originalname}`),
          false,
        );
      },
    }),
  )
  async createWithAttachments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateRequestDto,
  ): Promise<RequestResponse> {
    return this.requestsService.createWithAttachments(dto, files);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async findAll(
    @Query() query: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    return this.requestsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async findMy(
    @Req() req: RequestWithUser,
    @Query() query: GetRequestsQueryDto,
  ): Promise<PaginatedResponse<SupplyRequestResponse>> {
    const email = req.user?.email;
    if (!email) {
      throw new UnauthorizedException('Missing user email');
    }

    return this.requestsService.findAllByEmail(email, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async getStats(): Promise<SupplyRequestStatsResponse> {
    return this.requestsService.getStats();
  }

  @Get(':id/attachments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  async getAttachments(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<SupplyRequestAttachmentResponse[]> {
    return this.requestsService.getAttachments(id, req.user);
  }

  @Get(':id/attachments/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Customer, Role.Manager, Role.Admin, Role.SuperAdmin)
  @ApiProduces('application/zip')
  async downloadAttachments(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const files = await this.requestsService.getAttachmentsForArchive(id, req.user);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `request-attachments-${Date.now()}.zip`;

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

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin, Role.SuperAdmin)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ): Promise<SupplyRequestResponse> {
    return this.requestsService.updateStatus(id, dto);
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
