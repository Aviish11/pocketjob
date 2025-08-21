import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [{ level: 'error', emit: 'event' }],
});

prisma.$on('error', (e) => {
  console.error('Prisma error:', e);
});