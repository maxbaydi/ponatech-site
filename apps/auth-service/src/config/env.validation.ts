import * as Joi from 'joi';

export const authValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().required(),
  AUTH_GRPC_PORT: Joi.number().port().required(),
  AUTH_HTTP_PORT: Joi.number().port().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('30d'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: Joi.number().integer().min(0).default(100),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(0).default(60000),
  REDIS_URL: Joi.string().uri().optional(),
});
