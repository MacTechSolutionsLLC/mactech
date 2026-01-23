/**
 * GET /api/admin/capture/opportunities/[id]
 * Get a single opportunity with full details
 */

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

export async function GET(
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

    // Parse JSON fields similar to contract-discovery API
    const parsedOpportunity = {
      ...opportunity,
      naics_codes: safeJsonParse(opportunity.naics_codes, []),
      set_aside: safeJsonParse(opportunity.set_aside, []),
      location_mentions: safeJsonParse(opportunity.location_mentions, []),
      detected_keywords: safeJsonParse(opportunity.detected_keywords, []),
      analysis_keywords: safeJsonParse(opportunity.analysis_keywords, []),
      aiKeyRequirements: safeJsonParse(opportunity.aiKeyRequirements, []),
      points_of_contact: safeJsonParse(opportunity.points_of_contact, []),
      requirements: safeJsonParse(opportunity.requirements, []),
      // Capability match fields
      matched_resume_skills: safeJsonParse(opportunity.matched_resume_skills, []),
      matched_services: safeJsonParse(opportunity.matched_services, []),
      matched_showcases: safeJsonParse(opportunity.matched_showcases, []),
      capability_match_breakdown: safeJsonParse(opportunity.capability_match_breakdown, {}),
    }

    return NextResponse.json({
      success: true,
      opportunity: parsedOpportunity,
    })
  } catch (error) {
    console.error('[API] Error getting opportunity:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

