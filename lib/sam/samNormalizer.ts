/**
 * SAM.gov Normalizer
 * Converts raw SAM.gov opportunities to normalized format
 * Handles missing fields gracefully (never throws)
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { NormalizedOpportunity, SourceQuery } from './samTypes'

/**
 * Normalize NAICS codes
 */
function normalizeNaics(opportunity: SamGovOpportunity): {
  primary?: string
  all: string[]
  confidence: 'high' | 'medium' | 'low'
} {
  const all: string[] = []
  
  if (opportunity.naicsCode) {
    all.push(opportunity.naicsCode)
  }
  
  if (opportunity.naicsCodes && Array.isArray(opportunity.naicsCodes)) {
    all.push(...opportunity.naicsCodes)
  }
  
  // Remove duplicates
  const unique = [...new Set(all)]
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (opportunity.naicsCode) {
    confidence = 'high'
  } else if (unique.length > 0) {
    confidence = 'medium'
  }
  
  return {
    primary: unique[0],
    all: unique,
    confidence,
  }
}

/**
 * Normalize agency path
 * Prioritizes meaningful agency information over generic "Office" field
 */
function normalizeAgencyPath(opportunity: SamGovOpportunity): string {
  // Priority 1: Direct agency field (most reliable)
  if (opportunity.agency && opportunity.agency.trim() && opportunity.agency !== 'Office') {
    return opportunity.agency.trim()
  }
  
  // Priority 2: Organization type (often contains agency name)
  if (opportunity.organizationType && opportunity.organizationType.trim() && opportunity.organizationType !== 'Office') {
    return opportunity.organizationType.trim()
  }
  
  // Priority 3: Office field (only if it's not just "Office")
  if (opportunity.office && opportunity.office.trim() && opportunity.office !== 'Office') {
    return opportunity.office.trim()
  }
  
  // Priority 4: Office address city (as last resort)
  if (opportunity.officeAddress?.city && opportunity.officeAddress.city.trim()) {
    return opportunity.officeAddress.city.trim()
  }
  
  // Priority 5: Try to extract from description if available
  if (opportunity.description) {
    // Look for common agency patterns in description
    const agencyMatch = opportunity.description.match(/(?:Department of|Agency|Administration|Bureau|Service|Command)\s+([A-Z][A-Za-z\s]+?)(?:\s|,|\.|$)/i)
    if (agencyMatch && agencyMatch[1]) {
      return agencyMatch[1].trim()
    }
  }
  
  return 'Unknown Agency'
}

/**
 * Normalize place of performance
 */
function normalizePlaceOfPerformance(opportunity: SamGovOpportunity): string | undefined {
  if (!opportunity.placeOfPerformance) {
    return undefined
  }
  
  const parts: string[] = []
  
  if (opportunity.placeOfPerformance.city) {
    parts.push(opportunity.placeOfPerformance.city)
  }
  
  if (opportunity.placeOfPerformance.state) {
    parts.push(opportunity.placeOfPerformance.state)
  }
  
  if (opportunity.placeOfPerformance.zip) {
    parts.push(opportunity.placeOfPerformance.zip)
  }
  
  return parts.length > 0 ? parts.join(', ') : undefined
}

/**
 * Normalize description URL
 */
function normalizeDescriptionUrl(opportunity: SamGovOpportunity): string {
  if (opportunity.additionalInfoLink) {
    return opportunity.additionalInfoLink
  }
  
  if (opportunity.uiLink) {
    return opportunity.uiLink
  }
  
  if (opportunity.noticeId) {
    return `https://sam.gov/opp/${opportunity.noticeId}`
  }
  
  return 'https://sam.gov'
}

/**
 * Normalize UI link
 */
function normalizeUiLink(opportunity: SamGovOpportunity): string {
  if (opportunity.uiLink) {
    return opportunity.uiLink
  }
  
  if (opportunity.noticeId) {
    return `https://sam.gov/opp/${opportunity.noticeId}`
  }
  
  return 'https://sam.gov'
}

/**
 * Normalize a SAM.gov opportunity
 */
export function normalizeOpportunity(
  opportunity: SamGovOpportunity,
  sourceQuery: SourceQuery,
  batchId: string,
  ingestRunId: string
): NormalizedOpportunity {
  const naics = normalizeNaics(opportunity)
  const agencyPath = normalizeAgencyPath(opportunity)
  const placeOfPerformance = normalizePlaceOfPerformance(opportunity)
  const descriptionUrl = normalizeDescriptionUrl(opportunity)
  const uiLink = normalizeUiLink(opportunity)
  
  // Initial values (will be updated by scoring and AI)
  const rawScore = 0
  const aiTags: string[] = []
  const relevanceTier: 'high' | 'medium' | 'low' = 'low'
  
  return {
    noticeId: opportunity.noticeId || '',
    title: opportunity.title || 'Untitled',
    solicitationNumber: opportunity.solicitationNumber,
    agencyPath,
    postedDate: opportunity.postedDate || new Date().toISOString(),
    responseDeadline: opportunity.responseDeadLine,
    naics,
    setAside: opportunity.typeOfSetAside,
    type: opportunity.type || opportunity.baseType || 'Unknown',
    placeOfPerformance,
    descriptionUrl,
    uiLink,
    rawScore,
    aiTags,
    relevanceTier,
    ingestRunId,
    ingestedAt: new Date().toISOString(),
    sourceQueries: [sourceQuery],
    batchId,
    rawPayload: opportunity,
  }
}

/**
 * Merge normalized opportunities (for deduplication)
 * Combines sourceQueries arrays when duplicates are found
 */
export function mergeNormalizedOpportunities(
  existing: NormalizedOpportunity,
  incoming: NormalizedOpportunity
): NormalizedOpportunity {
  // Merge sourceQueries
  const mergedSourceQueries = [...new Set([...existing.sourceQueries, ...incoming.sourceQueries])]
  
  // Use the most recent ingestedAt
  const mostRecent = new Date(existing.ingestedAt) > new Date(incoming.ingestedAt)
    ? existing
    : incoming
  
  return {
    ...mostRecent,
    sourceQueries: mergedSourceQueries,
  }
}

