/**
 * POST /api/admin/capture/opportunities/[id]/briefing
 * Generate executive briefing document
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateExecutiveBriefing } from '@/lib/services/briefing-generator'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)

    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id },
    })

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Generate briefing
    const briefingUrl = await generateExecutiveBriefing(opportunity)

    return NextResponse.json({
      success: true,
      url: briefingUrl,
    })
  } catch (error) {
    console.error('[API] Error generating briefing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

