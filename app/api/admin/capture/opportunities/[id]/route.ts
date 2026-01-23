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
    let hasCapabilityFields = true
    
    try {
      // Try to fetch with all fields (will work after migration runs)
      opportunity = await prisma.governmentContractDiscovery.findUnique({
        where: { id },
      })
    } catch (error: any) {
      // If columns don't exist yet, fetch without capability match fields
      if (error.code === 'P2022' || error.message?.includes('does not exist') || error.message?.includes('capability_match')) {
        console.warn('[API] Capability match columns not found, using fallback query. Migration may need to run.')
        hasCapabilityFields = false
        
        // Fetch without capability match fields using select
        opportunity = await prisma.governmentContractDiscovery.findUnique({
          where: { id },
          select: {
            id: true,
            notice_id: true,
            title: true,
            agency: true,
            description: true,
            relevance_score: true,
            deadline: true,
            aiSummary: true,
            aiAnalysis: true,
            flagged: true,
            ignored: true,
            naics_codes: true,
            set_aside: true,
            detected_keywords: true,
            aiKeyRequirements: true,
            points_of_contact: true,
            url: true,
            solicitation_number: true,
            created_at: true,
            resource_links: true,
            scraped: true,
            scraped_at: true,
            scraped_text_content: true,
            scraped_html_content: true,
            aiParsedData: true,
            aiParsedAt: true,
            usaspending_enrichment: true,
            usaspending_enriched_at: true,
            usaspending_enrichment_status: true,
            incumbent_vendors: true,
            competitive_landscape_summary: true,
            requirements: true,
            estimated_value: true,
            period_of_performance: true,
            place_of_performance: true,
            sow_attachment_url: true,
            sow_attachment_type: true,
            // Exclude capability match fields
          },
        })
        
        // Add null capability match fields
        if (opportunity) {
          opportunity = {
            ...opportunity,
            matched_resume_skills: null,
            matched_services: null,
            matched_showcases: null,
            capability_match_breakdown: null,
            capability_match_score: null,
            primary_pillar: null,
            capability_match_calculated_at: null,
          }
        }
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

