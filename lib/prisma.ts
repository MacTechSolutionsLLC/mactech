import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Warn if DATABASE_URL is not set (required for PostgreSQL)
if (!process.env.DATABASE_URL) {
  console.error('[Prisma] DATABASE_URL environment variable is not set. Database operations will fail.')
  console.error('[Prisma] For local development, set DATABASE_URL in .env.local')
  console.error('[Prisma] For production, ensure DATABASE_URL is set in Railway environment variables')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

