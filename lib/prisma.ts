import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Set default DATABASE_URL if not provided (for Railway/SQLite)
if (!process.env.DATABASE_URL) {
  // Default to SQLite in /tmp for Railway or ./prisma/dev.db for local
  process.env.DATABASE_URL = process.env.NODE_ENV === 'production' 
    ? 'file:/tmp/dev.db'
    : 'file:./prisma/dev.db'
  console.warn('[Prisma] DATABASE_URL not set, using default:', process.env.DATABASE_URL)
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

