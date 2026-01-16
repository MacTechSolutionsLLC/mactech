import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Database health check endpoint
 * Tests database connectivity and verifies tables exist
 */
export async function GET() {
  try {
    // Test connection
    await prisma.$connect()
    
    // Test a few key tables
    const checks = {
      connected: true,
      tables: {} as Record<string, { exists: boolean; count?: number; error?: string }>
    }
    
    const tables = [
      'ReadinessAssessment',
      'ContactSubmission',
      'GovernmentContractDiscovery',
      'IgnoredOpportunity',
    ]
    
    for (const table of tables) {
      try {
        const count = await prisma[table as keyof typeof prisma].count()
        checks.tables[table] = { exists: true, count }
      } catch (error: any) {
        checks.tables[table] = { 
          exists: false, 
          error: error.message || 'Unknown error' 
        }
      }
    }
    
    const allTablesExist = Object.values(checks.tables).every(t => t.exists)
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      provider: 'postgresql',
      tables: checks.tables,
      allTablesExist,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Database connection failed',
      provider: 'postgresql',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

