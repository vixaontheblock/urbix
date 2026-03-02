import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: "postgresql://postgres.lbmpidbezrzwhmkqjbin:XaviiOnTheBlock27_@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma