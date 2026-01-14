import { Injectable, LoggerService } from '@nestjs/common';
import { RequestContextStorage } from '../context/request-context';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

type LogMeta = Record<string, unknown>;

interface LogPayload extends LogMeta {
  timestamp: string;
  level: LogLevel;
  message: string;
  traceId?: string;
  userId?: string;
}

@Injectable()
export class AppLogger implements LoggerService {
  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  private write(level: LogLevel, message: unknown, optionalParams: unknown[]): void {
    const context = RequestContextStorage.get();
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message: this.stringifyMessage(message),
      traceId: context?.traceId,
      userId: context?.userId,
      ...this.buildMeta(optionalParams),
    };

    const output = JSON.stringify(payload);

    if (level === 'error') {
      console.error(output);
      return;
    }

    console.log(output);
  }

  private stringifyMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    const serialized = JSON.stringify(message);
    return serialized ?? String(message);
  }

  private buildMeta(optionalParams: unknown[]): LogMeta {
    if (optionalParams.length === 0) {
      return {};
    }

    if (optionalParams.length === 1 && this.isRecord(optionalParams[0])) {
      return optionalParams[0];
    }

    return { params: optionalParams };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
