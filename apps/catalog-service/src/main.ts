import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AllExceptionsFilter, AppLogger, LoggingInterceptor, RequestContextInterceptor } from '@ponatech/common';
import { AppModule } from './app.module';
import { CATALOG_PROTO_PACKAGE } from './catalog/grpc/catalog.grpc';
import { RedisIoAdapter } from './config/redis-io.adapter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  const corsOrigins = parseCorsOrigins(configService.get<string>('CORS_ORIGINS'));

  app.useLogger(logger);
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new RequestContextInterceptor(), new LoggingInterceptor(logger));
  app.enableShutdownHooks();

  const grpcPort = configService.getOrThrow<number>('CATALOG_GRPC_PORT');
  const httpPort = configService.getOrThrow<number>('CATALOG_HTTP_PORT');
  const redisUrl = configService.get<string>('REDIS_URL');

  if (redisUrl) {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(redisUrl);
    app.useWebSocketAdapter(redisIoAdapter);
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${grpcPort}`,
      package: CATALOG_PROTO_PACKAGE,
      protoPath: join(process.cwd(), 'proto', 'catalog.proto'),
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pona Tech Catalog API')
    .setDescription('Catalog service REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(httpPort);

  logger.log('Catalog service started', { httpPort, grpcPort });
}

void bootstrap();

const parseCorsOrigins = (value?: string): string[] | true => {
  if (!value || value.trim() === '' || value === '*') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};
