import * as Joi from 'joi';

export const catalogValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CATALOG_HTTP_PORT: Joi.number().port().required(),
  CATALOG_GRPC_PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).default('change-me-please-change-me'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  REDIS_URL: Joi.string().uri().optional(),
});
