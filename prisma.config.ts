import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
loadEnv({ path: envFile });

export default defineConfig({
  schema: 'apps/catalog-service/prisma/schema.prisma',
});
