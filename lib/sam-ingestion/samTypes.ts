/**
 * Type definitions for SAM.gov ingestion pipeline
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { ScoringResult } from '../scoring/scoreOpportunity'
import { FilterResult } from '../filters/hardFilter'

/**
 * Scored opportunity with all metadata
 */
export interface ScoredOpportunity {
  opportunity: SamGovOpportunity
  score: number
  breakdown: ScoringResult['breakdown']
  passed: boolean
}

/**
 * Ingestion batch metadata
 */
export interface IngestionBatch {
  batchId: string
  ingestedAt: Date
  totalFetched: number
  totalPassedFilters: number
  totalScored: number
  totalShortlisted: number
  filterStats: {
    psc: number
    naics: number
    title: number
  }
}

/**
 * Ingestion result
 */
export interface IngestionResult {
  success: boolean
  batchId: string
  ingested: number
  filtered: number
  shortlisted: number
  scoredOpportunities: ScoredOpportunity[]
  discarded: FilterResult[]
  stats: IngestionBatch
  error?: string
}

