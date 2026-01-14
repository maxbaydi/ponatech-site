import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly hits = new Map<string, RateLimitEntry>();

  static reset(): void {
    RateLimitGuard.hits.clear();
  }

  static getSize(): number {
    return RateLimitGuard.hits.size;
  }

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const max = this.parseNumber(
      process.env.RATE_LIMIT_MAX ?? this.configService.get<string>('RATE_LIMIT_MAX'),
      100,
    );
    const windowMs = this.parseNumber(
      process.env.RATE_LIMIT_WINDOW_MS ?? this.configService.get<string>('RATE_LIMIT_WINDOW_MS'),
      60000,
    );

    if (max <= 0 || windowMs <= 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = buildRateLimitKey(request);
    const now = Date.now();
    const entry = RateLimitGuard.hits.get(key);

    if (!entry || entry.resetAt <= now) {
      RateLimitGuard.hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    entry.count += 1;

    if (entry.count > max) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private parseNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return parsed;
  }
}

const buildRateLimitKey = (request: Request): string => {
  const forwarded = request.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const rawIp =
    forwardedIp?.split(',')[0]?.trim() || request.ip || request.socket?.remoteAddress || 'unknown';
  const normalized = rawIp.replace('::ffff:', '');
  return normalized === '::1' ? '127.0.0.1' : normalized;
};
