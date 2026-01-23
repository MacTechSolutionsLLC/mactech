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

    let opportunity: any
    try {
      // Try to fetch with all fields (will work after migration runs)
      opportunity = await prisma.governmentContractDiscovery.findUnique({
        where: { id },
      })
    } catch (error: any) {
      // If columns don't exist yet, use raw SQL to fetch without capability match fields
      if (error.code === 'P2022' || error.message?.includes('does not exist')) {
        const rows = await prisma.$queryRaw<Array<any>>`
          SELECT 
            id, notice_id, title, agency, description, relevance_score, deadline,
            ai_summary, ai_analysis, flagged, ignored, naics_codes, set_aside,
            detected_keywords, ai_key_requirements, points_of_contact, url,
            solicitation_number, created_at, resource_links, scraped, scraped_at,
            scraped_text_content, scraped_html_content, ai_parsed_data, ai_parsed_at,
            usaspending_enrichment, usaspending_enriched_at, usaspending_enrichment_status,
            incumbent_vendors, competitive_landscape_summary, requirements,
            estimated_value, period_of_performance, place_of_performance,
            sow_attachment_url, sow_attachment_type
          FROM "GovernmentContractDiscovery" 
          WHERE id = ${id} 
          LIMIT 1
        `
        opportunity = rows[0] || null
      } else {
        throw error
      }
    }

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
      aiKeyRequirements: safeJsonParse(opportunity.aiKeyRequirements || opportunity.ai_key_requirements, []),
      points_of_contact: safeJsonParse(opportunity.points_of_contact, []),
      requirements: safeJsonParse(opportunity.requirements, []),
      // Capability match fields (may not exist if migration hasn't run yet)
      matched_resume_skills: safeJsonParse(opportunity.matched_resume_skills, []),
      matched_services: safeJsonParse(opportunity.matched_services, []),
      matched_showcases: safeJsonParse(opportunity.matched_showcases, []),
      capability_match_breakdown: safeJsonParse(opportunity.capability_match_breakdown, {}),
      capability_match_score: opportunity.capability_match_score ?? null,
      primary_pillar: opportunity.primary_pillar ?? null,
      capability_match_calculated_at: opportunity.capability_match_calculated_at ?? null,
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

