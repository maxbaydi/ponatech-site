import type { NextConfig } from 'next';
import path from 'node:path';

const DEFAULT_CATALOG_API_URL = 'http://localhost:5000';
const DEFAULT_AUTH_API_URL = 'http://localhost:4000';
const LOCAL_MEDIA_PROTOCOL = 'http';
const LOCAL_MEDIA_HOSTNAME = 'localhost';
const LOCAL_MEDIA_PORT = '9000';

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
        protocol: LOCAL_MEDIA_PROTOCOL,
        hostname: LOCAL_MEDIA_HOSTNAME,
        port: LOCAL_MEDIA_PORT,
      },
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
