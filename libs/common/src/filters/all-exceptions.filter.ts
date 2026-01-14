import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { AppLogger } from '../logger/app-logger.service';
import { RequestContextStorage } from '../context/request-context';

interface HttpErrorPayload {
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
  traceId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void | ReturnType<typeof throwError> {
    const contextType = host.getType<'http' | 'rpc'>();

    if (contextType === 'rpc') {
      return this.handleRpc(exception);
    }

    this.handleHttp(exception, host);
  }

  private handleHttp(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (payload: HttpErrorPayload) => void } }>();
    const request = ctx.getRequest<{ url?: string }>();
    const traceId = RequestContextStorage.get()?.traceId;

    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof Error ? exception.message : 'Unexpected error';

    const payload: HttpErrorPayload = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId,
    };

    this.logger.error('Unhandled HTTP exception', {
      statusCode,
      message,
      traceId,
    });

    response.status(statusCode).json(payload);
  }

  private handleRpc(exception: unknown): ReturnType<typeof throwError> {
    const traceId = RequestContextStorage.get()?.traceId;
    const message = exception instanceof Error ? exception.message : 'Unexpected error';
    const grpcStatus = this.mapGrpcStatus(exception);

    if (exception instanceof RpcException) {
      const normalized = this.normalizeRpcError(exception.getError());
      this.logger.error('RPC exception', {
        grpcStatus: normalized.code,
        message: normalized.message,
        traceId,
      });

      return throwError(() => new RpcException({
        code: normalized.code,
        message: normalized.message,
        traceId,
      }));
    }

    this.logger.error('Unhandled RPC exception', {
      grpcStatus,
      message,
      traceId,
    });

    return throwError(() => new RpcException({
      code: grpcStatus,
      message,
      traceId,
    }));
  }

  private mapGrpcStatus(exception: unknown): status {
    if (exception instanceof HttpException) {
      const code = exception.getStatus();
      switch (code) {
        case HttpStatus.BAD_REQUEST:
          return status.INVALID_ARGUMENT;
        case HttpStatus.UNAUTHORIZED:
          return status.UNAUTHENTICATED;
        case HttpStatus.FORBIDDEN:
          return status.PERMISSION_DENIED;
        case HttpStatus.NOT_FOUND:
          return status.NOT_FOUND;
        case HttpStatus.CONFLICT:
          return status.ALREADY_EXISTS;
        default:
          return status.INTERNAL;
      }
    }

    if (exception instanceof RpcException) {
      return status.INTERNAL;
    }

    return status.INTERNAL;
  }

  private normalizeRpcError(error: unknown): { code: status; message: string } {
    if (typeof error === 'string') {
      return { code: status.INTERNAL, message: error };
    }

    if (error && typeof error === 'object') {
      const record = error as Record<string, unknown>;
      const code = typeof record.code === 'number' ? (record.code as status) : status.INTERNAL;
      const message = typeof record.message === 'string' ? record.message : 'Unexpected error';
      return { code, message };
    }

    return { code: status.INTERNAL, message: 'Unexpected error' };
  }
}
