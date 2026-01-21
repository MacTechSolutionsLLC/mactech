/**
 * Award Linking Service
 * 
 * AI-assisted linking between GovernmentContractDiscovery (bids) and UsaSpendingAward (historical awards).
 * Only creates links when ≥2 criteria match and confidence ≥ 0.7.
 */

import { prisma } from '../prisma'
import { calculateTitleSimilarity, normalizeAgencyName } from '../usaspending-api'

interface LinkMatchCriteria {
  agencyMatch: boolean
  naicsMatch: boolean
  descriptionMatch: boolean
  incumbentMatch: boolean
  contractVehicleMatch: boolean
}

interface LinkMatchResult {
  matchCount: number
  confidence: number
  criteria: LinkMatchCriteria
  matchedNaics?: string[]
  matchedAgency?: string
  similarityScore?: number
}

/**
 * Check if agency names match (normalized)
 */
function matchAgency(opportunityAgency: string | null | undefined, awardAgency: string | null | undefined): boolean {
  if (!opportunityAgency || !awardAgency) return false
  
  const normalizedOpp = normalizeAgencyName(opportunityAgency)
  const normalizedAward = normalizeAgencyName(awardAgency)
  
  return normalizedOpp === normalizedAward || 
         normalizedOpp.includes(normalizedAward) || 
         normalizedAward.includes(normalizedOpp)
}

/**
 * Check if NAICS codes match
 */
function matchNaics(
  opportunityNaics: string[] | null | undefined,
  awardNaics: string | null | undefined
): { match: boolean; matchedCodes: string[] } {
  if (!opportunityNaics || opportunityNaics.length === 0 || !awardNaics) {
    return { match: false, matchedCodes: [] }
  }

  const matchedCodes = opportunityNaics.filter(naics => 
    awardNaics.includes(naics) || awardNaics === naics
  )

  return {
    match: matchedCodes.length > 0,
    matchedCodes,
  }
}

/**
 * Check if descriptions are similar (using cosine similarity)
 */
function matchDescription(
  opportunityDescription: string | null | undefined,
  awardDescription: string | null | undefined
): { match: boolean; similarity: number } {
  if (!opportunityDescription || !awardDescription) {
    return { match: false, similarity: 0 }
  }

  const similarity = calculateTitleSimilarity(opportunityDescription, awardDescription)
  
  // Consider it a match if similarity >= 0.3 (threshold for meaningful similarity)
  return {
    match: similarity >= 0.3,
    similarity,
  }
}

/**
 * Check if incumbent matches
 */
function matchIncumbent(
  opportunityDescription: string | null | undefined,
  awardRecipient: string | null | undefined
): boolean {
  if (!opportunityDescription || !awardRecipient) return false

  // Check if award recipient name appears in opportunity description
  const oppLower = opportunityDescription.toLowerCase()
  const recipientLower = awardRecipient.toLowerCase()
  
  // Simple substring match (could be enhanced with fuzzy matching)
  return oppLower.includes(recipientLower) || recipientLower.includes(oppLower.split(' ')[0])
}

/**
 * Check if contract vehicle pattern matches
 * This is a simple heuristic - could be enhanced with AI
 */
function matchContractVehicle(
  opportunityDescription: string | null | undefined,
  awardDescription: string | null | undefined
): boolean {
  if (!opportunityDescription || !awardDescription) return false

  // Look for common contract vehicle patterns
  const vehiclePatterns = [
    'IDIQ',
    'BPA',
    'GWAC',
    'GSA Schedule',
    'MAC',
    'MATOC',
    'SATOC',
  ]

  const oppUpper = opportunityDescription.toUpperCase()
  const awardUpper = awardDescription.toUpperCase()

  return vehiclePatterns.some(pattern => 
    (oppUpper.includes(pattern) && awardUpper.includes(pattern))
  )
}

/**
 * Evaluate match criteria between opportunity and award
 */
function evaluateMatchCriteria(
  opportunity: {
    agency?: string | null
    naics_codes?: string | null // JSON string
    description?: string | null
    title?: string | null
  },
  award: {
    awarding_agency_name?: string | null
    naics_code?: string | null
    description?: string | null
    recipient_name?: string | null
  }
): LinkMatchResult {
  // Parse NAICS codes from opportunity
  let opportunityNaics: string[] = []
  try {
    if (opportunity.naics_codes) {
      const parsed = JSON.parse(opportunity.naics_codes)
      opportunityNaics = Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // Invalid JSON, skip NAICS matching
  }

  const opportunityDescription = opportunity.description || opportunity.title || ''
  const awardDescription = award.description || ''

  // Check each criterion
  const criteria: LinkMatchCriteria = {
    agencyMatch: matchAgency(opportunity.agency, award.awarding_agency_name),
    naicsMatch: matchNaics(opportunityNaics, award.naics_code).match,
    descriptionMatch: matchDescription(opportunityDescription, awardDescription).match,
    incumbentMatch: matchIncumbent(opportunityDescription, award.recipient_name),
    contractVehicleMatch: matchContractVehicle(opportunityDescription, awardDescription),
  }

  // Count matches
  const matchCount = Object.values(criteria).filter(Boolean).length

  // Calculate confidence based on match count and types
  let confidence = 0
  if (matchCount >= 2) {
    // Base confidence from match count
    confidence = matchCount * 0.2 // 0.4, 0.6, 0.8, 1.0 for 2, 3, 4, 5 matches

    // Boost confidence for specific high-value matches
    if (criteria.agencyMatch && criteria.naicsMatch) {
      confidence += 0.15 // Agency + NAICS is very strong
    }
    if (criteria.descriptionMatch) {
      const descMatch = matchDescription(opportunityDescription, awardDescription)
      confidence += descMatch.similarity * 0.2 // Add similarity score as bonus
    }
    if (criteria.incumbentMatch) {
      confidence += 0.1 // Incumbent match is valuable
    }

    // Cap at 1.0
    confidence = Math.min(confidence, 1.0)
  }

  const naicsMatch = matchNaics(opportunityNaics, award.naics_code)
  const descMatch = matchDescription(opportunityDescription, awardDescription)

  return {
    matchCount,
    confidence,
    criteria,
    matchedNaics: naicsMatch.matchedCodes,
    matchedAgency: criteria.agencyMatch ? award.awarding_agency_name || undefined : undefined,
    similarityScore: descMatch.similarity,
  }
}

/**
 * Link awards to active bids (opportunities with capture_status = 'pursuing')
 */
export async function linkAwardsToBids(): Promise<{
  linksCreated: number
  links: Array<{
    bidId: string
    awardId: string
    confidence: number
    relationship: string
  }>
  errors: string[]
}> {
  const errors: string[] = []
  const createdLinks: Array<{
    bidId: string
    awardId: string
    confidence: number
    relationship: string
  }> = []

  try {
    // Get all active bids (opportunities being pursued)
    const activeBids = await prisma.governmentContractDiscovery.findMany({
      where: {
        capture_status: 'pursuing',
        OR: [
          { ignored: false },
          { ignored: null },
        ],
      },
      select: {
        id: true,
        title: true,
        agency: true,
        naics_codes: true,
        description: true,
      },
    })

    console.log(`[Award Linking] Found ${activeBids.length} active bids to link`)

    // Get all enriched awards (only link to completed awards)
    const awards = await prisma.usaSpendingAward.findMany({
      where: {
        enrichment_status: 'completed',
      },
      select: {
        id: true,
        human_award_id: true,
        awarding_agency_name: true,
        naics_code: true,
        description: true,
        recipient_name: true,
      },
      take: 1000, // Limit to avoid memory issues
    })

    console.log(`[Award Linking] Found ${awards.length} awards to evaluate`)

    // For each bid, find matching awards
    for (const bid of activeBids) {
      for (const award of awards) {
        try {
          // Evaluate match criteria
          const matchResult = evaluateMatchCriteria(bid, award)

          // Only create link if ≥2 criteria match AND confidence ≥ 0.7
          if (matchResult.matchCount >= 2 && matchResult.confidence >= 0.7) {
            // Check if link already exists
            const existingLink = await prisma.opportunityAwardLink.findFirst({
              where: {
                opportunity_id: bid.id,
                award_id: award.id,
              },
            })

            if (!existingLink) {
              // Create link using upsert for safety
              await prisma.opportunityAwardLink.upsert({
                where: {
                  opportunity_id_award_id: {
                    opportunity_id: bid.id,
                    award_id: award.id,
                  },
                },
                create: {
                  opportunity_id: bid.id,
                  award_id: award.id,
                  join_confidence: matchResult.confidence,
                  join_method: 'ai_assisted',
                  relationship: 'historical_precedent',
                  matched_naics: matchResult.matchedNaics ? JSON.stringify(matchResult.matchedNaics) : null,
                  matched_agency: matchResult.matchedAgency || null,
                  title_similarity: matchResult.similarityScore || null,
                },
                update: {
                  join_confidence: matchResult.confidence,
                  join_method: 'ai_assisted',
                  relationship: 'historical_precedent',
                  matched_naics: matchResult.matchedNaics ? JSON.stringify(matchResult.matchedNaics) : null,
                  matched_agency: matchResult.matchedAgency || null,
                  title_similarity: matchResult.similarityScore || null,
                },
              })

              createdLinks.push({
                bidId: bid.id,
                awardId: award.id,
                confidence: matchResult.confidence,
                relationship: 'historical_precedent',
              })

              console.log(
                `[Award Linking] Created link: bid ${bid.id} ↔ award ${award.id} ` +
                `(confidence: ${matchResult.confidence.toFixed(2)}, matches: ${matchResult.matchCount})`
              )
            }
          }
        } catch (error) {
          const errorMsg = `Error linking bid ${bid.id} to award ${award.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(`[Award Linking] ${errorMsg}`)
          errors.push(errorMsg)
        }
      }
    }

    console.log(`[Award Linking] Created ${createdLinks.length} links`)

    return {
      linksCreated: createdLinks.length,
      links: createdLinks,
      errors,
    }
  } catch (error) {
    console.error('[Award Linking] Error in linkAwardsToBids:', error)
    throw error
  }
}

/**
 * Link a specific bid to awards
 */
export async function linkBidToAwards(bidId: string): Promise<{
  linksCreated: number
  links: Array<{
    bidId: string
    awardId: string
    confidence: number
    relationship: string
  }>
}> {
  const createdLinks: Array<{
    bidId: string
    awardId: string
    confidence: number
    relationship: string
  }> = []

  try {
    // Get the bid
    const bid = await prisma.governmentContractDiscovery.findUnique({
      where: { id: bidId },
      select: {
        id: true,
        title: true,
        agency: true,
        naics_codes: true,
        description: true,
      },
    })

    if (!bid) {
      throw new Error(`Bid ${bidId} not found`)
    }

    // Get all enriched awards
    const awards = await prisma.usaSpendingAward.findMany({
      where: {
        enrichment_status: 'completed',
      },
      select: {
        id: true,
        human_award_id: true,
        awarding_agency_name: true,
        naics_code: true,
        description: true,
        recipient_name: true,
      },
    })

    // Evaluate matches
    for (const award of awards) {
      const matchResult = evaluateMatchCriteria(bid, award)

      if (matchResult.matchCount >= 2 && matchResult.confidence >= 0.7) {
        // Upsert link (create or update)
        await prisma.opportunityAwardLink.upsert({
            where: {
              opportunity_id_award_id: {
                opportunity_id: bid.id,
                award_id: award.id,
              },
            },
            create: {
              opportunity_id: bid.id,
              award_id: award.id,
              join_confidence: matchResult.confidence,
              join_method: 'ai_assisted',
              relationship: 'historical_precedent',
              matched_naics: matchResult.matchedNaics ? JSON.stringify(matchResult.matchedNaics) : null,
              matched_agency: matchResult.matchedAgency || null,
              title_similarity: matchResult.similarityScore || null,
            },
            update: {
              join_confidence: matchResult.confidence,
              join_method: 'ai_assisted',
              relationship: 'historical_precedent',
              matched_naics: matchResult.matchedNaics ? JSON.stringify(matchResult.matchedNaics) : null,
              matched_agency: matchResult.matchedAgency || null,
              title_similarity: matchResult.similarityScore || null,
            },
          })

          createdLinks.push({
            bidId: bid.id,
            awardId: award.id,
            confidence: matchResult.confidence,
            relationship: 'historical_precedent',
          })
        }
      }
    }

    return {
      linksCreated: createdLinks.length,
      links: createdLinks,
    }
  } catch (error) {
    console.error(`[Award Linking] Error linking bid ${bidId}:`, error)
    throw error
  }
}
