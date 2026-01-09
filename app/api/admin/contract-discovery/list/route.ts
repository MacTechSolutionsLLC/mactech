import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Safely parse JSON with fallback
 */
function safeJsonParse(jsonString: string | null | undefined, fallback: any = []): any {
  if (!jsonString || jsonString.trim() === '') {
    return fallback
  }
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Failed to parse JSON:', { jsonString, error })
    return fallback
  }
}

/**
 * List all discovered contracts with filtering
 * GET /api/admin/contract-discovery/list?status=discovered&scraped=true
 */
export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // discovered, verified, ignored
    const scraped = searchParams.get('scraped') // true, false
    const dismissed = searchParams.get('dismissed') // true, false
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}

    if (status) {
      where.ingestion_status = status
    }

    if (scraped === 'true') {
      where.scraped = true
    } else if (scraped === 'false') {
      where.scraped = false
    }

    if (dismissed === 'true') {
      where.dismissed = true
    } else if (dismissed === 'false') {
      where.dismissed = false
    }

    // Get contracts
    const contracts = await prisma.governmentContractDiscovery.findMany({
      where,
      orderBy: [
        { relevance_score: 'desc' },
        { created_at: 'desc' },
      ],
      take: limit,
      skip: offset,
    })

    // Parse JSON fields with error handling
    const parsedContracts = contracts.map(contract => {
      try {
        return {
          ...contract,
          naics_codes: safeJsonParse(contract.naics_codes, []),
          set_aside: safeJsonParse(contract.set_aside, []),
          location_mentions: safeJsonParse(contract.location_mentions, []),
          detected_keywords: safeJsonParse(contract.detected_keywords, []),
          analysis_keywords: safeJsonParse(contract.analysis_keywords, []),
        }
      } catch (parseError) {
        console.error('Error parsing contract JSON:', {
          contractId: contract.id,
          error: parseError,
        })
        // Return contract with empty arrays if parsing fails
        return {
          ...contract,
          naics_codes: [],
          set_aside: [],
          location_mentions: [],
          detected_keywords: [],
          analysis_keywords: [],
        }
      }
    })

    // Get total count
    const total = await prisma.governmentContractDiscovery.count({ where })

    return NextResponse.json({
      success: true,
      contracts: parsedContracts,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error listing contracts:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list contracts',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}

