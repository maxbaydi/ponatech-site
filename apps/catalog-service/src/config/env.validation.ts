import * as Joi from 'joi';

export const catalogValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CATALOG_HTTP_PORT: Joi.number().port().required(),
  CATALOG_GRPC_PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).default('change-me-please-change-me'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  REDIS_URL: Joi.string().uri().optional(),
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().port().default(9000),
  MINIO_ROOT_USER: Joi.string().default('minioadmin'),
  MINIO_ROOT_PASSWORD: Joi.string().default('minioadmin'),
  MINIO_BUCKET: Joi.string().default('ponatech-media'),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_PUBLIC_ENDPOINT: Joi.string().default(Joi.ref('MINIO_ENDPOINT')),
  MINIO_PUBLIC_PORT: Joi.number().port().default(Joi.ref('MINIO_PORT')),
  MINIO_PUBLIC_USE_SSL: Joi.boolean().default(Joi.ref('MINIO_USE_SSL')),
  MINIO_PUBLIC_PATH_PREFIX: Joi.string().allow('').default(''),
  MINIO_PUBLIC_READ: Joi.boolean().default(true),
});
