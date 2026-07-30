import { defineConfig } from '@prisma/config';
import { loadEnvFile } from 'process';
import { resolve } from 'path';

loadEnvFile(resolve('.env'));

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
