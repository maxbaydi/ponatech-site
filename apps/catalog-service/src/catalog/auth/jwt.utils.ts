import { createHmac, timingSafeEqual } from 'node:crypto';
import { Role } from './role.enum';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  role?: Role;
  email?: string;
  ver?: number;
  exp?: number;
}

export const verifyJwt = (token: string, secret: string): JwtPayload | null => {
  if (!token || !secret) {
    return null;
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string };

    if (header.alg !== 'HS256') {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const base64UrlDecode = (input: string): string => Buffer.from(input, 'base64url').toString('utf8');

const safeEqual = (value: string, expected: string): boolean => {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
};
