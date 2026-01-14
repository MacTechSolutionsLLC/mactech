/**
 * Opportunity Store
 * Database persistence layer for SAM.gov opportunities
 */

import { prisma } from '../prisma'
import { ScoredOpportunity } from '../sam-ingestion/samTypes'
import { SamGovOpportunity } from '../sam-gov-api-v2'

/**
 * Convert SAM.gov opportunity to database format
 */
function opportunityToDbData(
  opportunity: SamGovOpportunity,
  scored: ScoredOpportunity,
  batchId: string
) {
  const naicsCodes: string[] = []
  if (opportunity.naicsCode) {
    naicsCodes.push(opportunity.naicsCode)
  }
  if (opportunity.naicsCodes) {
    naicsCodes.push(...opportunity.naicsCodes)
  }

  const url = opportunity.uiLink || 
    (opportunity.noticeId ? `https://sam.gov/opp/${opportunity.noticeId}` : 'https://sam.gov')

  return {
    google_query: `SAM.gov Ingestion Batch ${batchId}`,
    service_category: null,
    title: opportunity.title,
    url,
    domain: 'sam.gov',
    snippet: opportunity.description?.substring(0, 500) || null,
    document_type: opportunity.type || null,
    notice_id: opportunity.noticeId || null,
    solicitation_number: opportunity.solicitationNumber || null,
    agency: opportunity.agency || opportunity.organizationType || null,
    naics_codes: JSON.stringify(naicsCodes),
    set_aside: JSON.stringify(opportunity.typeOfSetAside ? [opportunity.typeOfSetAside] : []),
    location_mentions: JSON.stringify(
      opportunity.placeOfPerformance
        ? [`${opportunity.placeOfPerformance.city || ''} ${opportunity.placeOfPerformance.state || ''}`.trim()]
        : []
    ),
    detected_keywords: JSON.stringify([]), // Will be populated by other processes
    relevance_score: scored.score,
    ingestion_status: 'discovered',
    ingestion_source: 'sam-ingestion',
    ingestion_batch_id: batchId,
    verified: false,
    description: opportunity.description || null,
    scraped_text_content: opportunity.description || null,
    points_of_contact: opportunity.pointOfContact && opportunity.pointOfContact.length > 0
      ? JSON.stringify(
          opportunity.pointOfContact.map(poc => ({
            name: poc.fullName || '',
            email: poc.email || '',
            phone: poc.phone || '',
            role: poc.type || poc.title || '',
          }))
        )
      : null,
    deadline: opportunity.responseDeadLine || null,
    place_of_performance: opportunity.placeOfPerformance
      ? `${opportunity.placeOfPerformance.streetAddress || ''} ${opportunity.placeOfPerformance.city || ''} ${opportunity.placeOfPerformance.state || ''} ${opportunity.placeOfPerformance.zip || ''}`.trim()
      : null,
    sow_attachment_url: null,
    sow_attachment_type: null,
  }
}

/**
 * Store scored opportunities in database
 * Updates existing records or creates new ones
 */
export async function storeOpportunities(
  scoredOpportunities: ScoredOpportunity[],
  batchId: string
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  for (const scored of scoredOpportunities) {
    try {
      const dbData = opportunityToDbData(scored.opportunity, scored, batchId)
      const url = dbData.url

      const existing = await prisma.governmentContractDiscovery.findUnique({
        where: { url },
      })

      if (existing) {
        // Update existing record
        await prisma.governmentContractDiscovery.update({
          where: { url },
          data: {
            ...dbData,
            updated_at: new Date(),
          },
        })
        updated++
      } else {
        // Create new record
        await prisma.governmentContractDiscovery.create({
          data: dbData,
        })
        created++
      }
    } catch (error) {
      console.error(`[OpportunityStore] Error storing opportunity ${scored.opportunity.noticeId}:`, error)
      // Continue with next opportunity
    }
  }

  return { created, updated }
}

/**
 * Flag an opportunity
 */
export async function flagOpportunity(
  noticeId: string,
  flaggedBy?: string
): Promise<void> {
  try {
    const opportunity = await prisma.governmentContractDiscovery.findFirst({
      where: { notice_id: noticeId },
    })

    if (!opportunity) {
      throw new Error(`Opportunity with noticeId ${noticeId} not found`)
    }

    await prisma.governmentContractDiscovery.update({
      where: { id: opportunity.id },
      data: {
        flagged: true,
        flagged_at: new Date(),
        flagged_by: flaggedBy || null,
      },
    })
  } catch (error) {
    console.error(`[OpportunityStore] Error flagging opportunity:`, error)
    throw error
  }
}

/**
 * Unflag an opportunity
 */
export async function unflagOpportunity(noticeId: string): Promise<void> {
  try {
    const opportunity = await prisma.governmentContractDiscovery.findFirst({
      where: { notice_id: noticeId },
    })

    if (!opportunity) {
      throw new Error(`Opportunity with noticeId ${noticeId} not found`)
    }

    await prisma.governmentContractDiscovery.update({
      where: { id: opportunity.id },
      data: {
        flagged: false,
        flagged_at: null,
        flagged_by: null,
      },
    })
  } catch (error) {
    console.error(`[OpportunityStore] Error unflagging opportunity:`, error)
    throw error
  }
}

