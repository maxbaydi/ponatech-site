import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MinioService } from '../../minio/minio.service';
import { MediaRepository } from './media.repository';
import {
  MediaFileResponse,
  MediaFilesQueryDto,
  PaginatedMediaFilesResponse,
  UpdateMediaFileDto,
} from './dto/media.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class MediaService {
  constructor(
    private readonly minioService: MinioService,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async findAll(query: MediaFilesQueryDto): Promise<PaginatedMediaFilesResponse> {
    return this.mediaRepository.findAll(query);
  }

  async findOne(id: string): Promise<MediaFileResponse> {
    const file = await this.mediaRepository.findOne(id);
    if (!file) {
      throw new NotFoundException('Media file not found');
    }
    return file;
  }

  async upload(
    file: Express.Multer.File,
    alt?: string,
  ): Promise<MediaFileResponse> {
    this.validateFile(file);

    const result = await this.minioService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const dimensions = await this.getImageDimensions(file.buffer);

    return this.mediaRepository.create({
      filename: result.key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: result.size,
      url: result.url,
      width: dimensions?.width,
      height: dimensions?.height,
      alt,
    });
  }

  async uploadFromUrl(url: string, alt?: string): Promise<MediaFileResponse> {
    const existingFile = await this.mediaRepository.findByUrl(url);
    if (existingFile) {
      return existingFile;
    }

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'PonatechBot/1.0' },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch image: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const mimeType = contentType.split(';')[0].trim();

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new BadRequestException(`Unsupported image type: ${mimeType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (buffer.length > MAX_FILE_SIZE) {
        throw new BadRequestException('File too large');
      }

      const filename = this.extractFilenameFromUrl(url);
      const result = await this.minioService.upload(buffer, filename, mimeType);
      const dimensions = await this.getImageDimensions(buffer);

      return this.mediaRepository.create({
        filename: result.key,
        originalName: filename,
        mimeType,
        size: result.size,
        url: result.url,
        width: dimensions?.width,
        height: dimensions?.height,
        alt,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to download image from URL: ${url}`);
    }
  }

  async update(id: string, dto: UpdateMediaFileDto): Promise<MediaFileResponse> {
    await this.findOne(id);
    return this.mediaRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    const file = await this.findOne(id);
    await this.minioService.delete(file.filename);
    await this.mediaRepository.delete(id);
  }

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  private async getImageDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const signature = buffer.slice(0, 8);

      if (this.isPng(signature)) {
        return this.getPngDimensions(buffer);
      }

      if (this.isJpeg(signature)) {
        return this.getJpegDimensions(buffer);
      }

      if (this.isGif(signature)) {
        return this.getGifDimensions(buffer);
      }

      if (this.isWebp(buffer)) {
        return this.getWebpDimensions(buffer);
      }

      return null;
    } catch {
      return null;
    }
  }

  private isPng(sig: Buffer): boolean {
    return sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47;
  }

  private isJpeg(sig: Buffer): boolean {
    return sig[0] === 0xff && sig[1] === 0xd8;
  }

  private isGif(sig: Buffer): boolean {
    return sig[0] === 0x47 && sig[1] === 0x49 && sig[2] === 0x46;
  }

  private isWebp(buffer: Buffer): boolean {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }

  private getPngDimensions(buffer: Buffer): { width: number; height: number } {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  private getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
    return null;
  }

  private getGifDimensions(buffer: Buffer): { width: number; height: number } {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  private getWebpDimensions(buffer: Buffer): { width: number; height: number } | null {
    const vp8Offset = buffer.indexOf('VP8 ');
    if (vp8Offset !== -1) {
      return {
        width: buffer.readUInt16LE(vp8Offset + 14) & 0x3fff,
        height: buffer.readUInt16LE(vp8Offset + 16) & 0x3fff,
      };
    }

    const vp8lOffset = buffer.indexOf('VP8L');
    if (vp8lOffset !== -1) {
      const bits = buffer.readUInt32LE(vp8lOffset + 9);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    return null;
  }

  private extractFilenameFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop() || 'image';
      return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    } catch {
      return 'image';
    }
  }
}
