import { PrismaClient } from '@prisma/client';

// Ensures a single global connection pool is maintained across the app lifecycle
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
