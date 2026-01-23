/**
 * Award Enrichment Service
 * Links SAM.gov opportunities to similar historical awards from USAspending.gov
 * Supports batch enrichment, detailed data fetching, and caching
 */

import { prisma } from '../prisma'
import { 
  searchAwards, 
  UsaSpendingFilters,
  AwardTypeCode,
  searchSpendingByNaics,
  searchSpendingByPsc,
  searchSpendingByAwardingAgency,
  searchSpendingOverTime,
  calculateTitleSimilarity,
  normalizeAgencyName,
  matchAwardsByTitle
} from '../usaspending-api'
import { batchLookupEntities, getEntityByUei } from '../sam-gov-entity-api'

export interface EnrichmentResult {
  similar_awards: any[]
  statistics: {
    count: number
    average_obligation: number | null
    min_obligation: number | null
    max_obligation: number | null
    unique_recipients: string[]
    unique_agencies: string[]
  }
  trends?: {
    award_frequency?: string
    typical_duration?: string
    spending_over_time?: any[]
    agency_patterns?: any[]
    naics_trends?: any[]
    psc_trends?: any[]
  }
}

export interface BatchEnrichmentResult {
  contractId: string
  success: boolean
  enrichment?: EnrichmentResult
  error?: string
}

// Simple in-memory cache (in production, use Redis or similar)
const enrichmentCache = new Map<string, { data: EnrichmentResult; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Deterministic join logic: Match opportunities to awards
 * Uses Agency + NAICS + Title similarity for deterministic joins
 */
export async function createOpportunityAwardLinks(
  opportunityId: string,
  awards: any[],
  opportunityTitle: string,
  opportunityAgency?: string,
  opportunityNaics?: string[]
): Promise<number> {
  let linksCreated = 0

  for (const award of awards) {
    let joinConfidence = 0
    let joinMethod = 'manual'
    let similarityScore: number | null = null
    const matchedNaics: string[] = []
    let matchedAgency: string | null = null

    // Method 1: Agency + NAICS matching (highest confidence)
    if (opportunityAgency && opportunityNaics && opportunityNaics.length > 0) {
      const normalizedOppAgency = normalizeAgencyName(opportunityAgency)
      const awardAgency = award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name || ''
      const normalizedAwardAgency = normalizeAgencyName(awardAgency)

      if (normalizedOppAgency && normalizedAwardAgency && 
          normalizedOppAgency === normalizedAwardAgency) {
        // Agency matches
        matchedAgency = awardAgency

        // Check NAICS match
        const awardNaics = award.naics || award.naics_code || ''
        const naicsMatch = opportunityNaics.some(naics => 
          awardNaics.includes(naics) || awardNaics === naics
        )

        if (naicsMatch) {
          matchedNaics.push(...opportunityNaics.filter(naics => 
            awardNaics.includes(naics) || awardNaics === naics
          ))
          joinConfidence = 0.9
          joinMethod = 'agency_naics'
        }
      }
    }

    // Method 2: Title similarity (medium confidence)
    if (joinConfidence < 0.7 && opportunityTitle) {
      const awardTitle = award.description || ''
      similarityScore = calculateTitleSimilarity(opportunityTitle, awardTitle)
      
      if (similarityScore >= 0.5) {
        joinConfidence = Math.max(joinConfidence, similarityScore * 0.8)
        if (joinMethod === 'manual') {
          joinMethod = 'title_similarity'
        }
      }
    }

    // Only create link if confidence is above threshold
    if (joinConfidence >= 0.5) {
      try {
        // Find or create award in database
        let awardRecord = await prisma.usaSpendingAward.findFirst({
          where: {
            OR: [
              { award_id: award.award_id || award.id },
              { generated_unique_award_id: award.generated_unique_award_id },
            ],
          },
        })

        if (!awardRecord && award.award_id) {
          // Award not in DB, skip linking (would need to ingest first)
          continue
        }

        if (awardRecord) {
          // Create or update link
          await prisma.opportunityAwardLink.upsert({
            where: {
              opportunity_id_award_id: {
                opportunity_id: opportunityId,
                award_id: awardRecord.id,
              },
            },
            create: {
              opportunity_id: opportunityId,
              award_id: awardRecord.id,
              join_confidence: joinConfidence,
              join_method: joinMethod,
              similarity_score: similarityScore,
              matched_naics: JSON.stringify(matchedNaics),
              matched_agency: matchedAgency,
              title_similarity: similarityScore,
            },
            update: {
              join_confidence: joinConfidence,
              join_method: joinMethod,
              similarity_score: similarityScore,
              matched_naics: JSON.stringify(matchedNaics),
              matched_agency: matchedAgency,
              title_similarity: similarityScore,
            },
          })
          linksCreated++
        }
      } catch (error) {
        console.error(`[Award Enrichment] Error creating link:`, error)
        // Continue with next award
      }
    }
  }

  return linksCreated
}

/**
 * Enrich a SAM.gov opportunity with similar historical awards
 * Uses deterministic join logic for linking
 */
export async function enrichOpportunity(
  opportunityId: string,
  options?: {
    limit?: number
    useDatabase?: boolean
    createLinks?: boolean // Create OpportunityAwardLink records
  }
): Promise<EnrichmentResult | null> {
  const limit = options?.limit ?? 10
  const useDatabase = options?.useDatabase ?? false
  const createLinks = options?.createLinks ?? true

  try {
    // Get the opportunity
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    // Parse NAICS codes
    let naicsCodes: string[] = []
    try {
      naicsCodes = JSON.parse(opportunity.naics_codes || '[]')
    } catch (e) {
      // Ignore parse errors
    }

    // Build filters based on opportunity
    // Note: API requires specific IDV types (IDV_A, IDV_B, etc.), not just 'IDV'
    // Valid values: 'A', 'B', 'C', 'D', '02'-'11', 'IDV_A', 'IDV_B', etc., '-1', 'no intersection'
    // Using only contract types (A) and grants (B) for now to avoid validation errors
    // Filter out any invalid values (like 'IDV') to prevent API errors
    const validAwardTypes: AwardTypeCode[] = ['A', 'B', 'C', 'D'] // Contracts, Grants, Direct Payments, Loans
    const apiValidTypes = ['A', 'B', 'C', 'D', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
                           'IDV_A', 'IDV_B', 'IDV_B_A', 'IDV_B_B', 'IDV_B_C', 'IDV_C', 'IDV_D', 'IDV_E', 
                           '-1', 'no intersection']
    const filteredTypes = validAwardTypes.filter(type => apiValidTypes.includes(type)) as AwardTypeCode[]
    const filters: UsaSpendingFilters = {
      award_type_codes: filteredTypes.length > 0 ? filteredTypes : (['A'] as AwardTypeCode[]), // Default to 'A' if all filtered out
    }

    if (naicsCodes.length > 0) {
      // USAspending API expects naics_codes as array of strings, not objects
      filters.naics_codes = naicsCodes as any
    }

    // Try to match by agency name (normalized)
    if (opportunity.agency) {
      // Note: This is approximate - in production, use agency ID mapping
      // For now, we'll search by keywords in description
    }

    if (useDatabase) {
      // Search database
      const where: any = {}

      try {
        const naicsCodes = JSON.parse(opportunity.naics_codes || '[]')
        if (Array.isArray(naicsCodes) && naicsCodes.length > 0) {
          where.naics_code = { in: naicsCodes }
        }
      } catch (e) {
        // Ignore
      }

      const awards = await prisma.usaSpendingAward.findMany({
        where,
        take: limit,
        orderBy: { total_obligation: 'desc' },
      })

      const obligations = awards
        .map(a => a.total_obligation)
        .filter((v): v is number => v !== null && v !== undefined)

      const recipients = new Set(
        awards
          .map(a => a.recipient_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      const agencies = new Set(
        awards
          .map(a => a.awarding_agency_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      // Enrich with Entity API data for awards that don't have it yet
      const recipientUeis = new Set<string>()
      for (const award of awards) {
        const uei = award.recipient_uei
        if (uei && !award.recipient_entity_data) {
          recipientUeis.add(uei)
        }
      }

      // Batch lookup entities for awards missing Entity API data
      let entityDataMap = new Map<string, any>()
      if (recipientUeis.size > 0) {
        try {
          console.log(`[Award Enrichment] Enriching ${recipientUeis.size} vendors via Entity API (database path)`)
          entityDataMap = await batchLookupEntities(Array.from(recipientUeis), {
            batchSize: 10,
            delayBetweenBatches: 500,
            includeSections: 'entityRegistration,coreData',
          })
          console.log(`[Award Enrichment] Enriched ${entityDataMap.size} vendors with Entity API data`)
        } catch (entityError) {
          console.warn(`[Award Enrichment] Entity API enrichment failed (non-blocking):`, entityError)
          // Continue without entity data - enrichment is still valuable
        }
      }

      // Map awards with Entity API data
      const enrichedAwards = awards.map(award => {
        // Parse existing entity data if available
        let recipientEntityData = null
        if (award.recipient_entity_data) {
          try {
            recipientEntityData = typeof award.recipient_entity_data === 'string'
              ? JSON.parse(award.recipient_entity_data)
              : award.recipient_entity_data
          } catch (e) {
            // Invalid JSON, will try to enrich below
          }
        }

        // If no entity data exists, try to enrich with newly fetched data
        if (!recipientEntityData && award.recipient_uei) {
          const entityData = entityDataMap.get(award.recipient_uei)
          if (entityData) {
            const businessTypeList = entityData.coreData?.businessTypes?.businessTypeList || []
            recipientEntityData = {
              entityName: entityData.coreData?.entityInformation?.entityName,
              dbaName: entityData.coreData?.entityInformation?.dbaName,
              registrationStatus: entityData.entityRegistration?.registrationStatus,
              businessTypes: businessTypeList,
              naicsCodes: entityData.coreData?.naicsCodes || [],
              pscCodes: entityData.coreData?.pscCodes || [],
              socioEconomicStatus: businessTypeList.filter((bt: string) => 
                ['SDVOSB', 'VOSB', '8A', 'WOSB', 'EDWOSB', 'HUBZone'].includes(bt)
              ),
            }
          }
        }

        return {
          ...award,
          award_id: award.award_id || award.generated_unique_award_id,
          recipient: {
            name: award.recipient_name,
            uei: award.recipient_uei,
          },
          awarding_agency: award.awarding_agency ? JSON.parse(award.awarding_agency) : null,
          funding_agency: award.funding_agency ? JSON.parse(award.funding_agency) : null,
          recipient_location: award.recipient_location ? JSON.parse(award.recipient_location) : null,
          place_of_performance: award.place_of_performance ? JSON.parse(award.place_of_performance) : null,
          recipient_entity_data: recipientEntityData,
        }
      })

      // Recalculate statistics from enriched awards
      const enrichedObligations = enrichedAwards
        .map(a => a.total_obligation)
        .filter((v): v is number => v !== null && v !== undefined)

      const enrichedRecipients = new Set(
        enrichedAwards
          .map(a => a.recipient?.name || a.recipient_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      const enrichedAgencies = new Set(
        enrichedAwards
          .map(a => a.awarding_agency?.name || a.awarding_agency_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      return {
        similar_awards: enrichedAwards,
        statistics: {
          count: enrichedAwards.length,
          average_obligation: enrichedObligations.length > 0
            ? enrichedObligations.reduce((a, b) => a + b, 0) / enrichedObligations.length
            : null,
          min_obligation: enrichedObligations.length > 0 ? Math.min(...enrichedObligations) : null,
          max_obligation: enrichedObligations.length > 0 ? Math.max(...enrichedObligations) : null,
          unique_recipients: Array.from(enrichedRecipients),
          unique_agencies: Array.from(enrichedAgencies),
        },
      }
    } else {
      // Search API with title similarity if available
      const response = await searchAwards({
        filters,
        limit: limit * 2, // Get more results for filtering
        // Don't specify sort - let API use default, or sort must match a field in the fields array
        // sort: 'total_obligation', // This field is in the fields array
        order: 'desc',
        titleSimilarity: opportunity.title
          ? {
              targetTitle: opportunity.title,
              threshold: 0.3,
              maxResults: limit,
            }
          : undefined,
      })

      let similarAwards = response.results || []
      
      // If title similarity matches were found, prioritize them
      if (response.titleSimilarityMatches && response.titleSimilarityMatches.length > 0) {
        // Merge similarity matches with regular results, prioritizing high similarity
        const similarityMap = new Map(
          response.titleSimilarityMatches.map(m => [m.award.award_id || m.award.id, m.similarity])
        )
        
        similarAwards = similarAwards
          .map(award => ({
            award,
            similarity: similarityMap.get(award.award_id || award.id) || 0,
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map(item => item.award)
      } else {
        similarAwards = similarAwards.slice(0, limit)
      }

      const obligations = similarAwards
        .map(a => a.total_obligation)
        .filter((v): v is number => v !== undefined && v !== null)

      const recipients = new Set(
        similarAwards
          .map(a => a.recipient?.name)
          .filter((v): v is string => v !== undefined && v !== null)
      )

      const agencies = new Set(
        similarAwards
          .map(a => a.awarding_agency?.name || a.awarding_agency?.toptier_agency?.name)
          .filter((v): v is string => v !== undefined && v !== null)
      )

      // Enrich vendor information using Entity API (as per diagram: Entity API → USAspending Enrichment)
      const recipientUeis = new Set<string>()
      for (const award of similarAwards) {
        const uei = award.recipient?.uei
        if (uei) {
          recipientUeis.add(uei)
        }
      }

      // Batch lookup entities for all unique UEIs
      let entityDataMap = new Map<string, any>()
      if (recipientUeis.size > 0) {
        try {
          console.log(`[Award Enrichment] Enriching ${recipientUeis.size} vendors via Entity API (API path)`)
          const ueiArray = Array.from(recipientUeis)
          entityDataMap = await batchLookupEntities(ueiArray, {
            batchSize: 10,
            delayBetweenBatches: 500,
            includeSections: 'entityRegistration,coreData',
          })
          console.log(`[Award Enrichment] Successfully enriched ${entityDataMap.size} of ${recipientUeis.size} vendors with Entity API data`)
          if (entityDataMap.size < recipientUeis.size) {
            console.log(`[Award Enrichment] Note: ${recipientUeis.size - entityDataMap.size} vendors did not return Entity API data (may not be registered or may have different UEIs)`)
          }
        } catch (entityError) {
          console.warn(`[Award Enrichment] Entity API enrichment failed (non-blocking):`, entityError)
          // Continue without entity data - enrichment is still valuable
        }
      } else {
        console.log(`[Award Enrichment] No UEIs found in awards - skipping Entity API enrichment`)
      }

      // Attach entity data to awards (preserve original award structure)
      const enrichedAwards = similarAwards.map(award => {
        const uei = award.recipient?.uei
        const entityData = uei ? entityDataMap.get(uei) : null
        
        return {
          ...award,
          // Add entity data as a separate property (doesn't affect original award structure)
          recipient_entity_data: entityData ? (() => {
            const businessTypeList = entityData.coreData?.businessTypes?.businessTypeList || []
            return {
              entityName: entityData.coreData?.entityInformation?.entityName,
              dbaName: entityData.coreData?.entityInformation?.dbaName,
              registrationStatus: entityData.entityRegistration?.registrationStatus,
              businessTypes: businessTypeList,
              naicsCodes: entityData.coreData?.naicsCodes || [],
              pscCodes: entityData.coreData?.pscCodes || [],
              socioEconomicStatus: businessTypeList.filter((bt: string) => 
                ['SDVOSB', 'VOSB', '8A', 'WOSB', 'EDWOSB', 'HUBZone'].includes(bt)
              ),
            }
          })() : null,
        } as any // Type assertion to allow recipient_entity_data property
      })

      // Save awards to database for linking (turnkey solution)
      if (createLinks && enrichedAwards.length > 0) {
        const batchId = `enrichment-${Date.now()}`
        for (const award of enrichedAwards) {
          try {
            const awardId = award.award_id || award.id || award.generated_unique_award_id
            if (!awardId) continue

            // Check if award exists
            const existing = await prisma.usaSpendingAward.findFirst({
              where: {
                OR: [
                  { award_id: awardId },
                  { generated_unique_award_id: award.generated_unique_award_id },
                ].filter(Boolean),
              },
            })

            if (!existing) {
              // Save award to database for linking
              await prisma.usaSpendingAward.create({
                data: {
                  award_id: awardId,
                  generated_unique_award_id: award.generated_unique_award_id,
                  award_type: award.type,
                  award_type_description: award.type_description,
                  category: award.category,
                  piid: award.piid,
                  fain: award.fain,
                  uri: award.uri,
                  total_obligation: award.total_obligation,
                  total_outlay: award.total_outlay,
                  total_subsidy_cost: award.total_subsidy_cost,
                  awarding_agency: award.awarding_agency ? JSON.stringify(award.awarding_agency) : null,
                  funding_agency: award.funding_agency ? JSON.stringify(award.funding_agency) : null,
                  awarding_agency_name: award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name,
                  funding_agency_name: award.funding_agency?.name || award.funding_agency?.toptier_agency?.name,
                  awarding_agency_id: award.awarding_agency?.id ? String(award.awarding_agency.id) : null,
                  funding_agency_id: award.funding_agency?.id ? String(award.funding_agency.id) : null,
                  recipient_name: award.recipient?.name,
                  recipient_uei: award.recipient?.uei,
                  recipient_duns: award.recipient?.duns,
                  recipient_hash: award.recipient?.hash,
                  recipient_id: award.recipient?.recipient_id,
                  recipient_location: award.recipient?.location ? JSON.stringify(award.recipient.location) : null,
                  place_of_performance: award.place_of_performance ? JSON.stringify(award.place_of_performance) : null,
                  pop_state: award.place_of_performance?.state,
                  pop_country: award.place_of_performance?.country,
                  start_date: award.start_date ? new Date(award.start_date) : null,
                  end_date: award.end_date ? new Date(award.end_date) : null,
                  last_modified_date: award.last_modified_date ? new Date(award.last_modified_date) : null,
                  awarding_date: award.awarding_date ? new Date(award.awarding_date) : null,
                  period_of_performance: award.period_of_performance ? JSON.stringify(award.period_of_performance) : null,
                  naics_code: award.naics || award.naics_code,
                  naics_description: award.naics_description,
                  psc_code: award.psc || award.psc_code,
                  psc_description: award.psc_description,
                  cfda_number: award.cfda_number,
                  cfda_title: award.cfda_title,
                  description: award.description,
                  transaction_count: award.transaction_count || 0,
                  total_subaward_amount: award.total_subaward_amount,
                  subaward_count: award.subaward_count || 0,
                  raw_data: JSON.stringify(award),
                  ingestion_batch_id: batchId,
                },
              })
            }
          } catch (error) {
            // Continue if save fails - award might already exist
            console.warn(`[Award Enrichment] Could not save award ${award.award_id || award.id}:`, error)
          }
        }
      }

      // Update result with enriched awards
      const result: EnrichmentResult = {
        similar_awards: enrichedAwards,
        statistics: {
          count: enrichedAwards.length,
          average_obligation: obligations.length > 0
            ? obligations.reduce((a, b) => a + b, 0) / obligations.length
            : null,
          min_obligation: obligations.length > 0 ? Math.min(...obligations) : null,
          max_obligation: obligations.length > 0 ? Math.max(...obligations) : null,
          unique_recipients: Array.from(recipients),
          unique_agencies: Array.from(agencies),
        },
      }

      // Create deterministic links if requested
      if (createLinks && enrichedAwards.length > 0) {
        const linksCreated = await createOpportunityAwardLinks(
          opportunityId,
          enrichedAwards,
          opportunity.title,
          opportunity.agency || undefined,
          naicsCodes
        )
        console.log(`[Award Enrichment] Created ${linksCreated} opportunity-award links`)
      }

      return result
    }
  } catch (error) {
    console.error('[Award Enrichment] Error:', error)
    return null
  }
}

/**
 * Get detailed enrichment data including trends and patterns
 */
export async function getDetailedEnrichment(
  opportunityId: string,
  options?: {
    limit?: number
    useDatabase?: boolean
    includeTrends?: boolean
  }
): Promise<EnrichmentResult | null> {
  const limit = options?.limit ?? 20
  const useDatabase = options?.useDatabase ?? false
  const includeTrends = options?.includeTrends ?? true

  // Check cache first
  const cacheKey = `enrichment:${opportunityId}:${limit}:${useDatabase}`
  const cached = enrichmentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Award Enrichment] Using cached data for ${opportunityId}`)
    return cached.data
  }

  try {
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    // Get basic enrichment
    const basicEnrichment = await enrichOpportunity(opportunityId, { limit, useDatabase })
    if (!basicEnrichment) {
      return null
    }

    const result: EnrichmentResult = { ...basicEnrichment }

    // Add trends if requested
    if (includeTrends) {
      // Valid values: 'A', 'B', 'C', 'D', '02'-'11', 'IDV_A', 'IDV_B', etc., '-1', 'no intersection'
      // Filter out any invalid values to prevent API errors
      const validAwardTypes: AwardTypeCode[] = ['A', 'B', 'C', 'D'] // Contracts, Grants, Direct Payments, Loans
      const apiValidTypes = ['A', 'B', 'C', 'D', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
                             'IDV_A', 'IDV_B', 'IDV_B_A', 'IDV_B_B', 'IDV_B_C', 'IDV_C', 'IDV_D', 'IDV_E', 
                             '-1', 'no intersection']
      const filteredTypes = validAwardTypes.filter(type => apiValidTypes.includes(type)) as AwardTypeCode[]
      const filters: UsaSpendingFilters = {
        award_type_codes: filteredTypes.length > 0 ? filteredTypes : (['A'] as AwardTypeCode[]), // Default to 'A' if all filtered out
      }

      try {
        const naicsCodes = JSON.parse(opportunity.naics_codes || '[]')
        if (Array.isArray(naicsCodes) && naicsCodes.length > 0) {
          // USAspending API expects naics_codes as array of strings, not objects
          filters.naics_codes = naicsCodes as any
        }
      } catch (e) {
        // Ignore
      }

      // Get spending trends
      try {
        const spendingOverTime = await searchSpendingOverTime(filters)
        result.trends = {
          ...result.trends,
          spending_over_time: spendingOverTime.results || [],
        }
      } catch (e) {
        console.error('[Award Enrichment] Error fetching spending trends:', e)
      }

      // Get NAICS trends
      try {
        const naicsTrends = await searchSpendingByNaics(filters, 1, 10)
        result.trends = {
          ...result.trends,
          naics_trends: naicsTrends.results || [],
        }
      } catch (e) {
        console.error('[Award Enrichment] Error fetching NAICS trends:', e)
      }

      // Get agency patterns
      try {
        const agencyPatterns = await searchSpendingByAwardingAgency(filters, 1, 10)
        result.trends = {
          ...result.trends,
          agency_patterns: agencyPatterns.results || [],
        }
      } catch (e) {
        console.error('[Award Enrichment] Error fetching agency patterns:', e)
      }

      // Calculate typical duration from similar awards
      if (basicEnrichment.similar_awards.length > 0) {
        const durations = basicEnrichment.similar_awards
          .map(a => {
            const start = a.start_date || a.period_of_performance?.start_date
            const end = a.end_date || a.period_of_performance?.end_date
            if (start && end) {
              const startDate = new Date(start)
              const endDate = new Date(end)
              const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
              return months
            }
            return null
          })
          .filter((v): v is number => v !== null)

        if (durations.length > 0) {
          const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
          result.trends = {
            ...result.trends,
            typical_duration: `${Math.round(avgDuration)} months`,
          }
        }
      }
    }

    // Cache the result
    enrichmentCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return result
  } catch (error) {
    console.error('[Award Enrichment] Error in detailed enrichment:', error)
    return null
  }
}

/**
 * Enrich multiple contracts in batch
 */
export async function enrichBatch(
  opportunityIds: string[],
  options?: {
    limit?: number
    useDatabase?: boolean
    includeTrends?: boolean
    onProgress?: (progress: { current: number; total: number; contractId: string }) => void
  }
): Promise<BatchEnrichmentResult[]> {
  const results: BatchEnrichmentResult[] = []
  const total = opportunityIds.length

  for (let i = 0; i < opportunityIds.length; i++) {
    const contractId = opportunityIds[i]

    if (options?.onProgress) {
      options.onProgress({ current: i + 1, total, contractId })
    }

    try {
      const enrichment = await getDetailedEnrichment(contractId, {
        limit: options?.limit,
        useDatabase: options?.useDatabase,
        includeTrends: options?.includeTrends,
      })

      if (enrichment) {
        results.push({
          contractId,
          success: true,
          enrichment,
        })
      } else {
        results.push({
          contractId,
          success: false,
          error: 'No enrichment data found',
        })
      }
    } catch (error) {
      results.push({
        contractId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    // Small delay to avoid overwhelming the API
    if (i < opportunityIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Clear enrichment cache for a specific contract or all contracts
 */
export function clearEnrichmentCache(opportunityId?: string): void {
  if (opportunityId) {
    // Clear specific contract cache
    for (const key of enrichmentCache.keys()) {
      if (key.includes(opportunityId)) {
        enrichmentCache.delete(key)
      }
    }
  } else {
    // Clear all cache
    enrichmentCache.clear()
  }
}

