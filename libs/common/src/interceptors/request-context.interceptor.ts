import { randomUUID } from 'node:crypto';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextStorage } from '../context/request-context';

interface HttpRequestWithHeaders {
  headers?: Record<string, string | string[] | undefined>;
  user?: { id?: string };
}

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const traceId = this.getTraceId(context) ?? randomUUID();
    const userId = this.getUserId(context);

    return RequestContextStorage.run({ traceId, userId }, () => next.handle());
  }

  private getTraceId(context: ExecutionContext): string | undefined {
    if (context.getType<'http'>() === 'http') {
      const request = context.switchToHttp().getRequest<HttpRequestWithHeaders>();
      return this.normalizeHeader(request.headers?.['x-trace-id']);
    }

    return undefined;
  }

  private getUserId(context: ExecutionContext): string | undefined {
    if (context.getType<'http'>() === 'http') {
      const request = context.switchToHttp().getRequest<HttpRequestWithHeaders>();
      return request.user?.id;
    }

    return undefined;
  }

  private normalizeHeader(value: string | string[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
