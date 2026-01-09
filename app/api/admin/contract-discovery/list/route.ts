import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * List all discovered contracts with filtering
 * GET /api/admin/contract-discovery/list?status=discovered&scraped=true
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse JSON fields
    const parsedContracts = contracts.map(contract => ({
      ...contract,
      naics_codes: JSON.parse(contract.naics_codes || '[]'),
      set_aside: JSON.parse(contract.set_aside || '[]'),
      location_mentions: JSON.parse(contract.location_mentions || '[]'),
      detected_keywords: JSON.parse(contract.detected_keywords || '[]'),
      analysis_keywords: JSON.parse(contract.analysis_keywords || '[]'),
    }))

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
    console.error('Error listing contracts:', error)
    return NextResponse.json(
      {
        error: 'Failed to list contracts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

