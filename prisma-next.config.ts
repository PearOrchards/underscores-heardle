import dotenv from 'dotenv';
import { defineConfig } from '@prisma/orm-mongo/config';

dotenv.config({ path: ['.env.local'], quiet: true });

export default defineConfig({
  contract: "./prisma/contract.prisma",
  db: {
    connection: process.env['DATABASE_URL']!,
  },
});
