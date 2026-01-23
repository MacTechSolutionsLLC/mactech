/**
 * Calculate Capability Score
 * Main entry point for capability matching and scoring
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { CompanyCapabilities, CapabilityMatchResult } from './capabilityData'
import { getResumeCapabilities } from './extractResumeCapabilities'
import { getServiceCapabilities, getShowcaseCapabilities } from './extractServiceCapabilities'
import { PILLAR_DOMAINS } from './pillarDomains'
import { hybridMatchCapabilities } from './hybridMatcher'

/**
 * Load all company capabilities
 */
export async function loadCompanyCapabilities(): Promise<CompanyCapabilities> {
  const resumes = await getResumeCapabilities()
  const services = getServiceCapabilities()
  const showcases = getShowcaseCapabilities()
  
  const pillars = Object.entries(PILLAR_DOMAINS).map(([pillar, domain]) => ({
    pillar: pillar as any,
    leaderName: getPillarLeader(pillar as any),
    description: domain.description,
    keywords: domain.keywords,
    expertiseAreas: domain.expertiseAreas
  }))

  return {
    resumes,
    services,
    showcases,
    pillars
  }
}

/**
 * Get pillar leader name
 */
function getPillarLeader(pillar: string): string {
  const leaders: Record<string, string> = {
    Security: 'Patrick Caruso',
    Infrastructure: 'James Adams',
    Quality: 'Brian MacDonald',
    Governance: 'John Milso'
  }
  return leaders[pillar] || 'Unknown'
}

/**
 * Calculate capability match score for an opportunity
 */
export async function calculateCapabilityScore(
  opportunity: SamGovOpportunity,
  capabilities?: CompanyCapabilities,
  contractValue?: number
): Promise<CapabilityMatchResult | null> {
  try {
    // Load capabilities if not provided
    if (!capabilities) {
      capabilities = await loadCompanyCapabilities()
    }

    const title = opportunity.title || ''
    const description = opportunity.description || ''
    const requirements: string[] = [] // Requirements extracted from description or other sources if available

    // Use hybrid matching
    const matchResult = await hybridMatchCapabilities(
      title,
      description,
      requirements,
      capabilities,
      {
        contractValue,
        useAIForHighValue: true,
        highValueThreshold: 1_000_000,
        useAIForLowConfidence: true,
        lowConfidenceThreshold: 40
      }
    )

    return matchResult
  } catch (error: any) {
    console.error('Error calculating capability score:', error)
    return null
  }
}
