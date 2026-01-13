/**
 * Shared Prisma client instance
 * Singleton pattern to ensure single database connection
 * 
 * Note: This uses the main Prisma schema at /prisma/schema.prisma
 * The platforms schema at /platforms/prisma/schema.prisma needs to be merged
 * or a separate client needs to be created for platforms
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

