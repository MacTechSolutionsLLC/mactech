/**
 * Hard Filter Orchestrator
 * Applies all hard filters in sequence and provides detailed logging
 * 
 * Filter order:
 * 1. PSC gate first (hard drop - most reliable exclusion)
 * 2. NAICS gate second (pass or penalty, with Sources Sought exception)
 * 3. Title gate third (final intent check)
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { filterByPsc, PscGateResult } from './pscGate'
import { filterByNaics, NaicsGateResult } from './naicsGate'
import { filterByTitleIntent, TitleGateResult } from './titleGate'

export interface FilterResult {
  opportunity: SamGovOpportunity
  reason: string
}

export interface HardFilterResult {
  passed: SamGovOpportunity[]
  discarded: FilterResult[]
  stats: {
    total: number
    passed: number
    discarded: {
      psc: number
      naics: number
      title: number
    }
  }
}

/**
 * Apply all hard filters to opportunities
 * 
 * @param opportunities - Array of SAM.gov opportunities to filter
 * @returns Filtered results with passed opportunities and discarded with reasons
 */
export function applyHardFilters(opportunities: SamGovOpportunity[]): HardFilterResult {
  const passed: SamGovOpportunity[] = []
  const discarded: FilterResult[] = []
  
  const stats = {
    total: opportunities.length,
    passed: 0,
    discarded: {
      psc: 0,
      naics: 0,
      title: 0,
    },
  }
  
  for (const opportunity of opportunities) {
    // Step 1: PSC gate (HARD DROP)
    const pscResult: PscGateResult = filterByPsc(opportunity)
    if (!pscResult.passed) {
      discarded.push({
        opportunity,
        reason: `PSC gate: ${pscResult.reason || 'PSC code matches blacklist'}`,
      })
      stats.discarded.psc++
      continue // Hard drop - don't continue to other filters
    }
    
    // Step 2: NAICS gate
    const naicsResult: NaicsGateResult = filterByNaics(opportunity)
    if (!naicsResult.passed) {
      discarded.push({
        opportunity,
        reason: `NAICS gate: ${naicsResult.reason || 'NAICS code not in allowlist'}`,
      })
      stats.discarded.naics++
      continue
    }
    
    // Step 3: Title intent gate
    const titleResult: TitleGateResult = filterByTitleIntent(opportunity)
    if (!titleResult.passed) {
      discarded.push({
        opportunity,
        reason: `Title gate: ${titleResult.reason || 'Title/description missing intent keywords'}`,
      })
      stats.discarded.title++
      continue
    }
    
    // All filters passed
    passed.push(opportunity)
    stats.passed++
  }
  
  return {
    passed,
    discarded,
    stats,
  }
}

