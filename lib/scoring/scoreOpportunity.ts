/**
 * Opportunity Scoring Engine
 * Calculates relevance score (0-100) for SAM.gov opportunities
 * 
 * Scoring is deterministic and explainable - all factors are documented
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { filterByNaics, NaicsGateResult } from '../filters/naicsGate'
import {
  BASE_SCORE,
  SCORING_WEIGHTS,
  RELEVANCE_KEYWORDS,
  MIN_SCORE_THRESHOLD,
} from './scoringConstants'

export interface ScoreBreakdown {
  base: number
  naics: number
  setAside: number
  lifecycle: number
  keywords: number
  deadline: number
  total: number
}

export interface ScoringResult {
  score: number
  breakdown: ScoreBreakdown
  passed: boolean // Whether score meets minimum threshold
}

/**
 * Calculate days until response deadline
 */
function daysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null
  
  try {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadlineDate.setHours(0, 0, 0, 0)
    
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch {
    return null
  }
}

/**
 * Check if opportunity is Sources Sought
 */
function isSourcesSought(opportunity: SamGovOpportunity): boolean {
  const type = (opportunity.type || '').toUpperCase()
  const baseType = (opportunity.baseType || '').toUpperCase()
  
  return type.includes('SRCSGT') || 
         baseType.includes('SRCSGT') ||
         type.includes('SOURCES SOUGHT') ||
         baseType.includes('SOURCES SOUGHT')
}

/**
 * Check if opportunity is Pre-Solicitation
 */
function isPreSolicitation(opportunity: SamGovOpportunity): boolean {
  const type = (opportunity.type || '').toUpperCase()
  const baseType = (opportunity.baseType || '').toUpperCase()
  
  return type.includes('PRESOL') || 
         baseType.includes('PRESOL') ||
         type.includes('PRE-SOLICITATION') ||
         baseType.includes('PRE-SOLICITATION')
}

/**
 * Check if opportunity is Combined Synopsis/Solicitation
 */
function isCombined(opportunity: SamGovOpportunity): boolean {
  const type = (opportunity.type || '').toUpperCase()
  const baseType = (opportunity.baseType || '').toUpperCase()
  
  return type.includes('COMBINE') || 
         baseType.includes('COMBINE') ||
         type.includes('COMBINED') ||
         baseType.includes('COMBINED')
}

/**
 * Count keyword matches in title and description
 */
function countKeywordMatches(opportunity: SamGovOpportunity): number {
  const title = (opportunity.title || '').toUpperCase()
  const description = (opportunity.description || '').toUpperCase()
  const combined = `${title} ${description}`
  
  let matches = 0
  for (const keyword of RELEVANCE_KEYWORDS) {
    if (combined.includes(keyword.toUpperCase())) {
      matches++
    }
  }
  
  return matches
}

/**
 * Calculate NAICS score component
 */
function calculateNaicsScore(opportunity: SamGovOpportunity): number {
  const naicsResult = filterByNaics(opportunity)
  
  // If NAICS is in allowlist, add match bonus
  if (naicsResult.passed && !naicsResult.missingNaics) {
    return SCORING_WEIGHTS.NAICS_MATCH
  }
  
  // If NAICS is missing, apply penalty (unless Sources Sought exception)
  if (naicsResult.missingNaics) {
    if (naicsResult.sourcesSoughtException) {
      // Sources Sought exception - no penalty
      return 0
    }
    // Missing NAICS penalty
    return SCORING_WEIGHTS.NAICS_MISSING_PENALTY
  }
  
  // NAICS exists but not in allowlist (shouldn't reach here due to hard filter, but handle gracefully)
  return 0
}

/**
 * Calculate set-aside score component
 */
function calculateSetAsideScore(opportunity: SamGovOpportunity): number {
  const setAside = (opportunity.typeOfSetAside || '').toUpperCase()
  
  if (setAside.includes('SDVOSB') || setAside.includes('VOSB')) {
    return SCORING_WEIGHTS.SDVOSB_VOSB_BOOST
  }
  
  if (setAside && setAside.length > 0) {
    return SCORING_WEIGHTS.OTHER_SET_ASIDE_BOOST
  }
  
  return 0
}

/**
 * Calculate lifecycle stage score component
 */
function calculateLifecycleScore(opportunity: SamGovOpportunity): number {
  if (isSourcesSought(opportunity)) {
    return SCORING_WEIGHTS.SOURCES_SOUGHT_BOOST
  }
  
  if (isPreSolicitation(opportunity)) {
    return SCORING_WEIGHTS.PRE_SOLICITATION_BOOST
  }
  
  if (isCombined(opportunity)) {
    return SCORING_WEIGHTS.COMBINED_BOOST
  }
  
  return 0
}

/**
 * Calculate deadline proximity score component
 */
function calculateDeadlineScore(opportunity: SamGovOpportunity): number {
  const daysUntil = daysUntilDeadline(opportunity.responseDeadLine)
  
  if (daysUntil === null) {
    return 0
  }
  
  if (daysUntil < 7) {
    return SCORING_WEIGHTS.DEADLINE_URGENT
  }
  
  if (daysUntil < 14) {
    return SCORING_WEIGHTS.DEADLINE_NEAR
  }
  
  return 0
}

/**
 * Score an opportunity
 * 
 * @param opportunity - SAM.gov opportunity to score
 * @returns Scoring result with score, breakdown, and pass/fail status
 */
export function scoreOpportunity(opportunity: SamGovOpportunity): ScoringResult {
  const breakdown: ScoreBreakdown = {
    base: BASE_SCORE,
    naics: calculateNaicsScore(opportunity),
    setAside: calculateSetAsideScore(opportunity),
    lifecycle: calculateLifecycleScore(opportunity),
    keywords: countKeywordMatches(opportunity) * SCORING_WEIGHTS.KEYWORD_MATCH,
    deadline: calculateDeadlineScore(opportunity),
    total: 0,
  }
  
  // Calculate total score
  breakdown.total = Math.max(0, Math.min(100, 
    breakdown.base +
    breakdown.naics +
    breakdown.setAside +
    breakdown.lifecycle +
    breakdown.keywords +
    breakdown.deadline
  ))
  
  return {
    score: breakdown.total,
    breakdown,
    passed: breakdown.total >= MIN_SCORE_THRESHOLD,
  }
}

