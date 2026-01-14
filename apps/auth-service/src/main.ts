import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AllExceptionsFilter, AppLogger, LoggingInterceptor, RequestContextInterceptor } from '@ponatech/common';
import { AUTH_PROTO_PACKAGE } from './grpc/auth.grpc';
import { AppModule } from './app.module';

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

  const grpcPort = configService.getOrThrow<number>('AUTH_GRPC_PORT');
  const httpPort = configService.getOrThrow<number>('AUTH_HTTP_PORT');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${grpcPort}`,
      package: AUTH_PROTO_PACKAGE,
      protoPath: join(process.cwd(), 'proto', 'auth.proto'),
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);
  logger.log('Auth service started', { httpPort, grpcPort });
}

void bootstrap();

const parseCorsOrigins = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};
