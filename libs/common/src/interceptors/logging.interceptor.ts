import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const contextName = this.getContextName(context);

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log('Request completed', {
            context: contextName,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          this.logger.error('Request failed', {
            context: contextName,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : error,
          });
        },
      }),
    );
  }

  private getContextName(context: ExecutionContext): string {
    if (context.getType<'http'>() === 'http') {
      const request = context.switchToHttp().getRequest<{ method?: string; url?: string }>();
      const method = request.method ?? 'UNKNOWN';
      const url = request.url ?? '';
      return `${method} ${url}`.trim();
    }

    const handler = context.getHandler();
    const className = context.getClass().name;
    return `${className}.${handler.name}`;
  }
}
