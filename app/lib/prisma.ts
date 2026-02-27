import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * In serverless (e.g. Vercel), limit connections per instance to avoid pool exhaustion.
 * Neon's pool has a finite limit; connection_limit=1 keeps each cold start from claiming multiple connections.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) return 'postgresql://localhost'
  if (url.includes('connection_limit=')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}connection_limit=1`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: { url: getDatabaseUrl() },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma