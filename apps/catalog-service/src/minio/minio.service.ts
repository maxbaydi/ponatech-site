import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

const DEFAULT_HTTP_PORT = 80;
const DEFAULT_HTTPS_PORT = 443;
const DEFAULT_PUBLIC_PATH_PREFIX = '';
const PATH_SEPARATOR = '/';
const URL_SCHEME_SEPARATOR = '://';

const normalizePathPrefix = (value?: string): string => {
  if (!value) return DEFAULT_PUBLIC_PATH_PREFIX;
  const trimmed = value.trim();
  if (!trimmed || trimmed === PATH_SEPARATOR) return DEFAULT_PUBLIC_PATH_PREFIX;
  const withLeading = trimmed.startsWith(PATH_SEPARATOR) ? trimmed : `${PATH_SEPARATOR}${trimmed}`;
  return withLeading.endsWith(PATH_SEPARATOR) ? withLeading.slice(0, -1) : withLeading;
};

const resolvePortSegment = (port: number, useSSL: boolean): string => {
  const defaultPort = useSSL ? DEFAULT_HTTPS_PORT : DEFAULT_HTTP_PORT;
  return port === defaultPort ? '' : `:${port}`;
};

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  private port: number;
  private useSSL: boolean;
  private publicEndpoint: string;
  private publicPort: number;
  private publicUseSSL: boolean;
  private publicPathPrefix: string;
  private publicRead: boolean;

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    this.port = this.config.get<number>('MINIO_PORT', 9000);
    this.useSSL = this.config.get<boolean>('MINIO_USE_SSL', false);
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'ponatech-media');
    this.publicEndpoint = this.config.get<string>('MINIO_PUBLIC_ENDPOINT', this.endpoint);
    this.publicPort = this.config.get<number>('MINIO_PUBLIC_PORT', this.port);
    this.publicUseSSL = this.config.get<boolean>('MINIO_PUBLIC_USE_SSL', this.useSSL);
    this.publicPathPrefix = normalizePathPrefix(
      this.config.get<string>('MINIO_PUBLIC_PATH_PREFIX', DEFAULT_PUBLIC_PATH_PREFIX),
    );
    this.publicRead = this.config.get<boolean>('MINIO_PUBLIC_READ', true);

    const protocol = this.useSSL ? 'https' : 'http';
    const endpointUrl = `${protocol}://${this.endpoint}:${this.port}`;

    this.client = new S3Client({
      endpoint: endpointUrl,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('MINIO_ROOT_USER', 'minioadmin'),
        secretAccessKey: this.config.get<string>('MINIO_ROOT_PASSWORD', 'minioadmin'),
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
    if (this.publicRead) {
      await this.ensureBucketPublicRead();
    }
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err.name === 'NotFound' || err.name === 'NoSuchBucket') {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        return;
      }
      throw error;
    }
  }

  private async ensureBucketPublicRead(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy),
      }),
    );
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const key = this.generateKey(filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
      size: buffer.length,
    };
  }

  async uploadStream(
    stream: Readable,
    filename: string,
    mimeType: string,
    size?: number,
  ): Promise<UploadResult> {
    const key = this.generateKey(filename);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: mimeType,
      },
    });

    await upload.done();

    return {
      key,
      url: this.getPublicUrl(key),
      size: size ?? 0,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getObject(key: string): Promise<Readable> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return response.Body as Readable;
  }

  getPublicUrl(key: string): string {
    const baseUrl = this.getPublicBaseUrl();
    return `${baseUrl}${PATH_SEPARATOR}${this.bucket}${PATH_SEPARATOR}${key}`;
  }

  normalizePublicUrl(url: string): string {
    const key = this.extractKeyFromUrl(url);
    if (!key) return url;
    return this.getPublicUrl(key);
  }

  private getPublicBaseUrl(): string {
    const protocol = this.publicUseSSL ? 'https' : 'http';
    const portSegment = resolvePortSegment(this.publicPort, this.publicUseSSL);
    return `${protocol}${URL_SCHEME_SEPARATOR}${this.publicEndpoint}${portSegment}${this.publicPathPrefix}`;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split(PATH_SEPARATOR).filter(Boolean);
      if (pathParts.length < 2 || pathParts[0] !== this.bucket) {
        return null;
      }
      return pathParts.slice(1).join(PATH_SEPARATOR);
    } catch {
      return null;
    }
  }

  private generateKey(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}-${random}-${safeFilename}`;
  }
}
