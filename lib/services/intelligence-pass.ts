/**
 * Intelligence Pass Service
 * Computes derived intelligence signals from federal API data
 * All computations are deterministic and explainable
 */

import { prisma } from '../prisma'
import { normalizeAgencyName } from '../usaspending-api'
import crypto from 'crypto'

/**
 * Opportunity fingerprint for deduplication
 * Deterministic hash of key opportunity fields
 */
export function computeOpportunityFingerprint(opportunity: {
  agency?: string | null
  naics_codes: string | string[] | null
  title: string
  solicitation_number?: string | null
}): string {
  // Normalize agency name
  const agencyNormalized = opportunity.agency 
    ? normalizeAgencyName(opportunity.agency).toLowerCase().trim()
    : ''

  // Normalize and sort NAICS codes
  let naicsArray: string[] = []
  if (opportunity.naics_codes) {
    if (typeof opportunity.naics_codes === 'string') {
      try {
        naicsArray = JSON.parse(opportunity.naics_codes)
      } catch {
        naicsArray = [opportunity.naics_codes]
      }
    } else {
      naicsArray = opportunity.naics_codes
    }
  }
  const naicsSorted = naicsArray.sort().join(',')

  // Normalize title (remove extra whitespace, lowercase)
  const titleNormalized = (opportunity.title || '').toLowerCase().trim().replace(/\s+/g, ' ')

  // Normalize solicitation number
  const solicitationNormalized = (opportunity.solicitation_number || '').toLowerCase().trim()

  // Create fingerprint string
  const fingerprintString = [
    agencyNormalized,
    naicsSorted,
    titleNormalized,
    solicitationNormalized,
  ].join('|')

  // Generate SHA256 hash
  return crypto.createHash('sha256').update(fingerprintString).digest('hex')
}

/**
 * Classify lifecycle stage from SAM.gov opportunity type
 */
export function classifyLifecycleStage(opportunity: {
  type?: string | null
  baseType?: string | null
}): 'SOURCES_SOUGHT' | 'PRE_SOLICITATION' | 'SOLICITATION' | 'AWARD' | 'UNKNOWN' {
  const type = (opportunity.type || '').toUpperCase()
  const baseType = (opportunity.baseType || '').toUpperCase()
  const combined = `${type} ${baseType}`

  if (combined.includes('SRCSGT') || combined.includes('SOURCES SOUGHT')) {
    return 'SOURCES_SOUGHT'
  } else if (combined.includes('PRESOL') || combined.includes('PRE-SOLICITATION')) {
    return 'PRE_SOLICITATION'
  } else if (combined.includes('SOLICITATION') || combined.includes('COMBINE') || combined.includes('COMBINED')) {
    return 'SOLICITATION'
  } else if (combined.includes('AWARD')) {
    return 'AWARD'
  }

  return 'UNKNOWN'
}

/**
 * Calculate incumbent concentration score using Herfindahl-Hirschman Index (HHI)
 * Returns 0-1 score where 1 = single vendor dominance
 */
export function calculateIncumbentConcentration(awards: Array<{
  recipient_uei?: string | null
  recipient_name?: string | null
}>): number {
  if (!awards || awards.length === 0) {
    return 0
  }

  // Group awards by recipient UEI (preferred) or name (fallback)
  const vendorGroups = new Map<string, number>()
  
  for (const award of awards) {
    const vendorId = award.recipient_uei || award.recipient_name || 'unknown'
    vendorGroups.set(vendorId, (vendorGroups.get(vendorId) || 0) + 1)
  }

  // Calculate market shares
  const totalAwards = awards.length
  const shares: number[] = []
  
  for (const count of vendorGroups.values()) {
    shares.push(count / totalAwards)
  }

  // Calculate HHI: sum of squared market shares
  const hhi = shares.reduce((sum, share) => sum + share * share, 0)

  return hhi
}

/**
 * Calculate award size realism ratio
 * Returns SAM estimated value / historical average obligation
 */
export function calculateAwardSizeRealism(
  samEstimatedValue: string | number | null | undefined,
  historicalAverage: number | null
): number | null {
  if (!samEstimatedValue || !historicalAverage || historicalAverage === 0) {
    return null
  }

  // Parse SAM value (handle string numbers)
  let samValue: number
  if (typeof samEstimatedValue === 'string') {
    // Remove currency symbols and commas
    const cleaned = samEstimatedValue.replace(/[$,\s]/g, '')
    samValue = parseFloat(cleaned)
    if (isNaN(samValue)) {
      return null
    }
  } else {
    samValue = samEstimatedValue
  }

  return samValue / historicalAverage
}

/**
 * Calculate recompete likelihood
 * Returns probability (0-1) that same vendor won last N awards
 */
export function calculateRecompeteLikelihood(awards: Array<{
  recipient_uei?: string | null
  recipient_name?: string | null
  awarding_date?: string | Date | null
}>): number | null {
  if (!awards || awards.length < 2) {
    return null
  }

  // Sort by awarding date (most recent first)
  const sortedAwards = [...awards].sort((a, b) => {
    const dateA = a.awarding_date ? new Date(a.awarding_date).getTime() : 0
    const dateB = b.awarding_date ? new Date(b.awarding_date).getTime() : 0
    return dateB - dateA
  })

  // Look at last 5 awards (or all if fewer)
  const recentAwards = sortedAwards.slice(0, Math.min(5, sortedAwards.length))
  
  if (recentAwards.length < 2) {
    return null
  }

  // Get most recent recipient
  const lastRecipient = recentAwards[0].recipient_uei || recentAwards[0].recipient_name
  if (!lastRecipient) {
    return null
  }

  // Count how many of recent awards went to same recipient
  const sameRecipientCount = recentAwards.filter(a => 
    (a.recipient_uei || a.recipient_name) === lastRecipient
  ).length

  return sameRecipientCount / recentAwards.length
}

/**
 * Agency behavior profile structure
 */
export interface AgencyBehaviorProfile {
  new_vendor_acceptance_rate: number // 0-1: % of awards to vendors with <3 prior awards
  typical_award_size_avg: number | null
  typical_award_size_median: number | null
  award_frequency_per_year: number | null
  set_aside_compliance_rate: number | null // 0-1: % matching stated set-aside
  solicitation_to_award_days_avg: number | null
  award_count: number // Number of awards used in calculation
}

/**
 * Get agency behavior profile from cache or compute fresh
 */
export async function getAgencyBehaviorProfile(
  agencyName: string | null | undefined,
  naicsCodes: string[]
): Promise<AgencyBehaviorProfile | null> {
  if (!agencyName || !naicsCodes || naicsCodes.length === 0) {
    return null
  }

  // Normalize agency name for cache lookup
  const agencyId = normalizeAgencyName(agencyName)
  const primaryNaics = naicsCodes[0] // Use primary NAICS for cache key

  // Check cache
  const cached = await prisma.agencyIntelligenceCache.findUnique({
    where: {
      agency_id_naics_code: {
        agency_id: agencyId,
        naics_code: primaryNaics,
      },
    },
  })

  // Return cached if fresh (<7 days old)
  if (cached) {
    const ageDays = (Date.now() - cached.last_calculated_at.getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays < 7) {
      try {
        return JSON.parse(cached.behavior_profile)
      } catch {
        // Invalid JSON, recompute
      }
    }
  }

  // Compute fresh profile
  return await computeAgencyBehaviorProfile(agencyName, naicsCodes)
}

/**
 * Compute agency behavior profile from historical awards
 */
export async function computeAgencyBehaviorProfile(
  agencyName: string | null | undefined,
  naicsCodes: string[]
): Promise<AgencyBehaviorProfile | null> {
  if (!agencyName || !naicsCodes || naicsCodes.length === 0) {
    return null
  }

  const agencyId = normalizeAgencyName(agencyName)
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  // Normalize agency name for matching
  const normalizedAgencyName = normalizeAgencyName(agencyName).toLowerCase()

  // Query historical awards from database
  // Try exact match first, then fallback to contains
  const historicalAwards = await prisma.usaSpendingAward.findMany({
    where: {
      OR: [
        {
          awarding_agency_name: {
            equals: normalizedAgencyName,
            mode: 'insensitive',
          },
        },
        {
          awarding_agency_name: {
            contains: normalizedAgencyName,
            mode: 'insensitive',
          },
        },
      ],
      naics_code: {
        in: naicsCodes,
      },
      awarding_date: {
        gte: threeYearsAgo,
      },
      total_obligation: {
        not: null,
      },
    },
    select: {
      recipient_uei: true,
      recipient_name: true,
      total_obligation: true,
      awarding_date: true,
      recipient_entity_data: true,
    },
    take: 1000, // Limit to avoid performance issues
  })

  if (historicalAwards.length < 5) {
    // Insufficient data
    return {
      new_vendor_acceptance_rate: 0,
      typical_award_size_avg: null,
      typical_award_size_median: null,
      award_frequency_per_year: null,
      set_aside_compliance_rate: null,
      solicitation_to_award_days_avg: null,
      award_count: historicalAwards.length,
    }
  }

  // Calculate new vendor acceptance rate
  const vendorAwardCounts = new Map<string, number>()
  for (const award of historicalAwards) {
    const vendorId = award.recipient_uei || award.recipient_name || 'unknown'
    vendorAwardCounts.set(vendorId, (vendorAwardCounts.get(vendorId) || 0) + 1)
  }

  const newVendorThreshold = 3 // <3 awards = new vendor
  const newVendorAwards = historicalAwards.filter(a => {
    const vendorId = a.recipient_uei || a.recipient_name || 'unknown'
    return (vendorAwardCounts.get(vendorId) || 0) < newVendorThreshold
  })
  const new_vendor_acceptance_rate = newVendorAwards.length / historicalAwards.length

  // Calculate award size statistics
  const obligations = historicalAwards
    .map(a => a.total_obligation)
    .filter((v): v is number => v !== null && v !== undefined)

  const typical_award_size_avg = obligations.length > 0
    ? obligations.reduce((a, b) => a + b, 0) / obligations.length
    : null

  const typical_award_size_median = obligations.length > 0
    ? obligations.sort((a, b) => a - b)[Math.floor(obligations.length / 2)]
    : null

  // Calculate award frequency per year
  const years = 3
  const award_frequency_per_year = historicalAwards.length / years

  // Calculate set-aside compliance (requires Entity API data)
  // This will be computed separately in computeSetAsideEnforcementReality

  // Calculate solicitation to award days (requires SAM.gov data)
  // This is complex and may not be available, return null for now

  const profile: AgencyBehaviorProfile = {
    new_vendor_acceptance_rate,
    typical_award_size_avg,
    typical_award_size_median,
    award_frequency_per_year,
    set_aside_compliance_rate: null, // Computed separately
    solicitation_to_award_days_avg: null, // Requires SAM.gov integration
    award_count: historicalAwards.length,
  }

  // Cache the profile
  const primaryNaics = naicsCodes[0]
  await prisma.agencyIntelligenceCache.upsert({
    where: {
      agency_id_naics_code: {
        agency_id: agencyId,
        naics_code: primaryNaics,
      },
    },
    create: {
      agency_id: agencyId,
      agency_name: agencyName,
      naics_code: primaryNaics,
      behavior_profile: JSON.stringify(profile),
      award_count: historicalAwards.length,
    },
    update: {
      behavior_profile: JSON.stringify(profile),
      award_count: historicalAwards.length,
      last_calculated_at: new Date(),
    },
  })

  return profile
}

/**
 * Set-aside enforcement reality structure
 */
export interface SetAsideEnforcementReality {
  compliance_rate: number // 0-1: % of awards matching stated set-aside
  common_deviations: string[] // Set-asides that appear but weren't stated
  enforcement_strength: 'STRICT' | 'MODERATE' | 'WEAK'
}

/**
 * Compute set-aside enforcement reality
 */
export async function computeSetAsideEnforcementReality(
  agencyName: string | null | undefined,
  naicsCodes: string[],
  statedSetAside: string | string[] | null | undefined
): Promise<SetAsideEnforcementReality | null> {
  if (!agencyName || !naicsCodes || naicsCodes.length === 0 || !statedSetAside) {
    return null
  }

  // Normalize set-aside
  const setAsideArray = typeof statedSetAside === 'string'
    ? (statedSetAside.includes('[') ? JSON.parse(statedSetAside) : [statedSetAside])
    : statedSetAside

  if (!Array.isArray(setAsideArray) || setAsideArray.length === 0) {
    return null
  }

  const primarySetAside = setAsideArray[0].toUpperCase()

  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  // Normalize agency name for matching
  const normalizedAgencyName = normalizeAgencyName(agencyName).toLowerCase()

  // Query historical awards
  const historicalAwards = await prisma.usaSpendingAward.findMany({
    where: {
      OR: [
        {
          awarding_agency_name: {
            equals: normalizedAgencyName,
            mode: 'insensitive',
          },
        },
        {
          awarding_agency_name: {
            contains: normalizedAgencyName,
            mode: 'insensitive',
          },
        },
      ],
      naics_code: {
        in: naicsCodes,
      },
      awarding_date: {
        gte: threeYearsAgo,
      },
      recipient_entity_data: {
        not: null,
      },
    },
    select: {
      recipient_entity_data: true,
    },
    take: 500,
  })

  if (historicalAwards.length < 5) {
    return {
      compliance_rate: 0,
      common_deviations: [],
      enforcement_strength: 'WEAK',
    }
  }

  // Check compliance
  let compliantCount = 0
  const allDeviations = new Set<string>()

  for (const award of historicalAwards) {
    if (!award.recipient_entity_data) continue

    try {
      const entityData = typeof award.recipient_entity_data === 'string'
        ? JSON.parse(award.recipient_entity_data)
        : award.recipient_entity_data

      const businessTypes = entityData.businessTypes || entityData.coreData?.businessTypes?.businessTypeList || []
      const businessTypesUpper = businessTypes.map((bt: string) => bt.toUpperCase())

      // Check if vendor has stated set-aside
      const hasStatedSetAside = businessTypesUpper.includes(primarySetAside) ||
        businessTypesUpper.some((bt: string) => bt.includes(primarySetAside))

      if (hasStatedSetAside) {
        compliantCount++
      } else {
        // Track deviations
        businessTypesUpper.forEach((bt: string) => {
          if (['SDVOSB', 'VOSB', '8A', 'WOSB', 'EDWOSB', 'HUBZONE', 'SB'].includes(bt)) {
            allDeviations.add(bt)
          }
        })
      }
    } catch {
      // Invalid JSON, skip
      continue
    }
  }

  const compliance_rate = compliantCount / historicalAwards.length

  // Determine enforcement strength
  let enforcement_strength: 'STRICT' | 'MODERATE' | 'WEAK'
  if (compliance_rate >= 0.9) {
    enforcement_strength = 'STRICT'
  } else if (compliance_rate >= 0.7) {
    enforcement_strength = 'MODERATE'
  } else {
    enforcement_strength = 'WEAK'
  }

  return {
    compliance_rate,
    common_deviations: Array.from(allDeviations),
    enforcement_strength,
  }
}

/**
 * Intelligence result structure
 */
export interface IntelligenceResult {
  agency_behavior_profile: AgencyBehaviorProfile | null
  set_aside_enforcement_reality: SetAsideEnforcementReality | null
}

/**
 * Run intelligence pass for an opportunity
 */
export async function runIntelligencePass(opportunityId: string): Promise<IntelligenceResult> {
  const opportunity = await prisma.governmentContractDiscovery.findUnique({
    where: { id: opportunityId },
    select: {
      agency: true,
      naics_codes: true,
      set_aside: true,
    },
  })

  if (!opportunity) {
    throw new Error(`Opportunity ${opportunityId} not found`)
  }

  // Parse NAICS codes
  let naicsCodes: string[] = []
  try {
    naicsCodes = typeof opportunity.naics_codes === 'string'
      ? JSON.parse(opportunity.naics_codes || '[]')
      : opportunity.naics_codes || []
  } catch {
    // Invalid JSON, try as string
    if (typeof opportunity.naics_codes === 'string') {
      naicsCodes = [opportunity.naics_codes]
    }
  }

  // Get or compute agency behavior profile
  const agencyProfile = await getAgencyBehaviorProfile(opportunity.agency, naicsCodes)

  // Compute set-aside enforcement reality
  const setAsideReality = await computeSetAsideEnforcementReality(
    opportunity.agency,
    naicsCodes,
    opportunity.set_aside
  )

  return {
    agency_behavior_profile: agencyProfile,
    set_aside_enforcement_reality: setAsideReality,
  }
}
