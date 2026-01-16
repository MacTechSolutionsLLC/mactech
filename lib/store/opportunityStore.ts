/**
 * Opportunity Store
 * Database persistence layer for SAM.gov opportunities
 * Updated per specification to handle new schema fields
 */

import { prisma } from '../prisma'
import { ScoredOpportunity } from '../sam-ingestion/samTypes'
import { SamGovOpportunity } from '../sam-gov-api-v2'
import { NormalizedOpportunity, AIAnalysisResult } from '../sam/samTypes'
import { getAllIgnored } from './ignoredOpportunities'

/**
 * Get description from SAM.gov payload, fetching from API if description is a URL
 */
async function getDescriptionFromPayload(rawPayload: SamGovOpportunity): Promise<string | null> {
  const description = rawPayload.description
  
  if (!description) {
    return null
  }
  
  // Check if description is a URL (API endpoint to fetch description)
  if (description.startsWith('http://') || description.startsWith('https://')) {
    // Extract noticeId from URL if present
    const noticeIdMatch = description.match(/noticeid=([a-z0-9]+)/i)
    const noticeId = noticeIdMatch ? noticeIdMatch[1] : rawPayload.noticeId
    
    if (noticeId) {
      try {
        // Fetch description from SAM.gov API
        const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
        if (!apiKey) {
          console.warn('[OpportunityStore] No API key available to fetch description')
          return null
        }
        
        const descUrl = `https://api.sam.gov/prod/opportunities/v1/noticedesc?noticeid=${noticeId}`
        const response = await fetch(descUrl, {
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': apiKey,
            'User-Agent': 'MacTech Contract Discovery/1.0',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          // The API returns the description in different possible fields
          const fetchedDescription = data.description || data.noticeDescription || data.content || data.text
          if (fetchedDescription && typeof fetchedDescription === 'string' && fetchedDescription.trim().length > 0) {
            return fetchedDescription.trim()
          }
        } else {
          console.warn(`[OpportunityStore] Failed to fetch description for ${noticeId}: ${response.status}`)
        }
      } catch (error) {
        console.error(`[OpportunityStore] Error fetching description for ${noticeId}:`, error)
      }
    }
    
    // If fetching failed, return null instead of the URL
    return null
  }
  
  // Description is actual text, return it
  return description.trim()
}

/**
 * Convert SAM.gov opportunity to database format
 */
async function opportunityToDbData(
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

  // Fetch description if it's a URL, otherwise use the text directly
  const description = await getDescriptionFromPayload(opportunity)
  const snippet = description ? description.substring(0, 500) : (opportunity.description?.substring(0, 500) || null)

  return {
    google_query: `SAM.gov Ingestion Batch ${batchId}`,
    service_category: null,
    title: opportunity.title,
    url,
    domain: 'sam.gov',
    snippet,
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
    description,
    scraped_text_content: description,
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
 * Store normalized opportunities with scores and AI analysis
 * Updates existing records or creates new ones (upsert by noticeId)
 */
export async function storeNormalizedOpportunities(
  normalizedOpportunities: Array<{
    normalized: NormalizedOpportunity
    score: number
    aiAnalysis?: AIAnalysisResult | null
  }>,
  batchId: string
): Promise<{ created: number; updated: number }> {
  let created = 0
  let updated = 0

  // Get ignored noticeIds
  const ignoredSet = await getAllIgnored()

  for (const item of normalizedOpportunities) {
    try {
      const { normalized, score, aiAnalysis } = item
      const noticeId = normalized.noticeId

      if (!noticeId) {
        console.warn('[OpportunityStore] Skipping opportunity without noticeId')
        continue
      }

      // Skip if ignored
      if (ignoredSet.has(noticeId)) {
        console.log(`[OpportunityStore] Skipping ignored opportunity ${noticeId}`)
        continue
      }

      const url = normalized.uiLink || 
        (noticeId ? `https://sam.gov/opp/${noticeId}` : 'https://sam.gov')

      // Fetch description if it's a URL, otherwise use the text directly
      const description = await getDescriptionFromPayload(normalized.rawPayload)
      const snippet = description ? description.substring(0, 500) : (normalized.rawPayload.description?.substring(0, 500) || null)

      const dbData = {
        google_query: `SAM.gov Ingestion Batch ${batchId}`,
        service_category: null,
        title: normalized.title,
        url,
        domain: 'sam.gov',
        snippet,
        document_type: normalized.type || null,
        notice_id: noticeId,
        solicitation_number: normalized.solicitationNumber || null,
        agency: normalized.agencyPath || null,
        naics_codes: JSON.stringify(normalized.naics.all),
        set_aside: JSON.stringify(normalized.setAside ? [normalized.setAside] : []),
        location_mentions: JSON.stringify(
          normalized.placeOfPerformance ? [normalized.placeOfPerformance] : []
        ),
        detected_keywords: JSON.stringify(normalized.aiTags),
        relevance_score: score,
        ingestion_status: 'discovered',
        ingestion_source: 'sam-ingestion',
        ingestion_batch_id: batchId,
        verified: false,
        description,
        scraped_text_content: description,
        points_of_contact: normalized.rawPayload.pointOfContact && normalized.rawPayload.pointOfContact.length > 0
          ? JSON.stringify(
              normalized.rawPayload.pointOfContact.map(poc => ({
                name: poc.fullName || '',
                email: poc.email || '',
                phone: poc.phone || '',
                role: poc.type || poc.title || '',
              }))
            )
          : null,
        deadline: normalized.responseDeadline || null,
        place_of_performance: normalized.placeOfPerformance || null,
        sow_attachment_url: null,
        sow_attachment_type: null,
        // New fields per specification
        raw_payload: JSON.stringify(normalized.rawPayload),
        normalized_fields: JSON.stringify(normalized),
        source_queries: JSON.stringify(normalized.sourceQueries),
        ingested_at: new Date(normalized.ingestedAt),
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        aiAnalysisGeneratedAt: aiAnalysis ? new Date() : null,
      }

      // Upsert by noticeId (using url as unique constraint fallback)
      const existing = await prisma.governmentContractDiscovery.findFirst({
        where: { notice_id: noticeId },
      })

      if (existing) {
        // Update existing record
        await prisma.governmentContractDiscovery.update({
          where: { id: existing.id },
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
      console.error(`[OpportunityStore] Error storing opportunity:`, error)
      // Continue with next opportunity
    }
  }

  return { created, updated }
}

/**
 * Store scored opportunities in database (legacy method)
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
      const dbData = await opportunityToDbData(scored.opportunity, scored, batchId)
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
 * Get ignored noticeIds
 */
export async function getIgnoredNoticeIds(): Promise<Set<string>> {
  return getAllIgnored()
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

/**
 * Flag or unflag an opportunity
 */
export async function setFlagged(noticeId: string, flagged: boolean, flaggedBy?: string): Promise<void> {
  if (flagged) {
    await flagOpportunity(noticeId, flaggedBy)
  } else {
    await unflagOpportunity(noticeId)
  }
}

