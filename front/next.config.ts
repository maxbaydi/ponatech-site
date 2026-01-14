import type { NextConfig } from 'next';
import path from 'node:path';

const DEFAULT_CATALOG_API_URL = 'http://localhost:5000';
const DEFAULT_AUTH_API_URL = 'http://localhost:4000';

const resolvedApiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_CATALOG_API_URL;
const resolvedCatalogApiUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL ?? resolvedApiUrl;
const resolvedAuthApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL ?? DEFAULT_AUTH_API_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: resolvedApiUrl,
    NEXT_PUBLIC_CATALOG_API_URL: resolvedCatalogApiUrl,
    NEXT_PUBLIC_AUTH_API_URL: resolvedAuthApiUrl,
  },
};

export default nextConfig;
