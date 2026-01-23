/**
 * Hybrid Capability Matcher
 * Combines keyword-based and AI semantic matching
 */

import { CapabilityMatchResult } from './capabilityData'
import { matchCapabilities } from './capabilityMatcher'
import { matchCapabilitiesWithAI } from './aiCapabilityMatcher'

export interface HybridMatchOptions {
  useAIForHighValue?: boolean
  highValueThreshold?: number // Contract value threshold in dollars
  useAIForLowConfidence?: boolean
  lowConfidenceThreshold?: number // Keyword match confidence threshold
  contractValue?: number
}

/**
 * Hybrid matching strategy
 * Uses keyword matching for speed, AI matching for complex cases
 */
export async function hybridMatchCapabilities(
  title: string,
  description: string,
  requirements: string[],
  capabilities: any, // CompanyCapabilities
  options: HybridMatchOptions = {}
): Promise<CapabilityMatchResult> {
  const {
    useAIForHighValue = true,
    highValueThreshold = 1_000_000,
    useAIForLowConfidence = true,
    lowConfidenceThreshold = 40,
    contractValue
  } = options

  // Always start with keyword matching (fast)
  const keywordMatch = matchCapabilities(title, description, requirements, capabilities)

  // Determine if we should use AI matching
  const shouldUseAI = 
    (useAIForHighValue && contractValue && contractValue >= highValueThreshold) ||
    (useAIForLowConfidence && keywordMatch.overallScore < lowConfidenceThreshold)

  if (!shouldUseAI) {
    return keywordMatch
  }

  // Use AI matching for complex cases
  const aiMatch = await matchCapabilitiesWithAI(title, description, requirements, capabilities)

  if (!aiMatch) {
    // AI matching failed, return keyword match
    return keywordMatch
  }

  // Combine both scores with weighted average
  // Give more weight to AI match if keyword confidence is low
  const keywordWeight = keywordMatch.overallScore >= 60 ? 0.4 : 0.2
  const aiWeight = 1 - keywordWeight

  const combinedScore = Math.round(
    keywordMatch.overallScore * keywordWeight +
    aiMatch.overallScore * aiWeight
  )

  // Combine matched items (union)
  const combinedResult: CapabilityMatchResult = {
    resumeMatch: {
      score: Math.round(
        keywordMatch.resumeMatch.score * keywordWeight +
        aiMatch.resumeMatch.score * aiWeight
      ),
      matchedSkills: [...new Set([...keywordMatch.resumeMatch.matchedSkills, ...aiMatch.resumeMatch.matchedSkills])],
      matchedCertifications: [...new Set([...keywordMatch.resumeMatch.matchedCertifications, ...aiMatch.resumeMatch.matchedCertifications])],
      matchedPillars: [...new Set([...keywordMatch.resumeMatch.matchedPillars, ...aiMatch.resumeMatch.matchedPillars])],
      reasoning: `Keyword: ${keywordMatch.resumeMatch.reasoning}. AI: ${aiMatch.resumeMatch.reasoning}`
    },
    serviceMatch: {
      score: Math.round(
        keywordMatch.serviceMatch.score * keywordWeight +
        aiMatch.serviceMatch.score * aiWeight
      ),
      matchedServices: [...new Set([...keywordMatch.serviceMatch.matchedServices, ...aiMatch.serviceMatch.matchedServices])],
      matchedKeywords: [...new Set([...keywordMatch.serviceMatch.matchedKeywords, ...aiMatch.serviceMatch.matchedKeywords])],
      reasoning: `Keyword: ${keywordMatch.serviceMatch.reasoning}. AI: ${aiMatch.serviceMatch.reasoning}`
    },
    showcaseMatch: {
      score: Math.round(
        keywordMatch.showcaseMatch.score * keywordWeight +
        aiMatch.showcaseMatch.score * aiWeight
      ),
      matchedShowcases: [...new Set([...keywordMatch.showcaseMatch.matchedShowcases, ...aiMatch.showcaseMatch.matchedShowcases])],
      matchedFeatures: [...new Set([...keywordMatch.showcaseMatch.matchedFeatures, ...aiMatch.showcaseMatch.matchedFeatures])],
      reasoning: `Keyword: ${keywordMatch.showcaseMatch.reasoning}. AI: ${aiMatch.showcaseMatch.reasoning}`
    },
    pillarMatch: {
      score: Math.round(
        keywordMatch.pillarMatch.score * keywordWeight +
        aiMatch.pillarMatch.score * aiWeight
      ),
      primaryPillar: aiMatch.pillarMatch.primaryPillar || keywordMatch.pillarMatch.primaryPillar,
      matchedPillars: [...new Set([...keywordMatch.pillarMatch.matchedPillars, ...aiMatch.pillarMatch.matchedPillars])],
      reasoning: `Keyword: ${keywordMatch.pillarMatch.reasoning}. AI: ${aiMatch.pillarMatch.reasoning}`
    },
    overallScore: combinedScore,
    breakdown: keywordMatch.breakdown
  }

  return combinedResult
}
