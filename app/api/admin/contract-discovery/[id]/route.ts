import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function safeJsonParse(jsonString: string | null | undefined, fallback: any = []) {
  if (!jsonString) return fallback
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * Get a single contract by ID
 * GET /api/admin/contract-discovery/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const contractId = resolvedParams.id

    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedContract = {
      ...contract,
      naics_codes: safeJsonParse(contract.naics_codes, []),
      set_aside: safeJsonParse(contract.set_aside, []),
      location_mentions: safeJsonParse(contract.location_mentions, []),
      detected_keywords: safeJsonParse(contract.detected_keywords, []),
      analysis_keywords: safeJsonParse(contract.analysis_keywords, []),
      aiKeyRequirements: safeJsonParse(contract.aiKeyRequirements, []),
    }

    return NextResponse.json({
      success: true,
      contract: parsedContract,
    })
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

