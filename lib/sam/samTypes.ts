/**
 * Type definitions for SAM.gov ingestion system
 */

import { SamGovOpportunity, SamGovApiResponse } from '../sam-gov-api-v2'

/**
 * Source query identifier
 */
export type SourceQuery = 'A' | 'B' | 'C' | 'D' | 'E'

/**
 * Normalized opportunity record
 * Matches the canonical record shape from specification
 */
export interface NormalizedOpportunity {
  noticeId: string
  title: string
  solicitationNumber?: string
  agencyPath: string
  postedDate: string
  responseDeadline?: string

  naics: {
    primary?: string
    all: string[]
    confidence: 'high' | 'medium' | 'low'
  }

  setAside?: string
  type: string
  placeOfPerformance?: string

  descriptionUrl: string
  uiLink: string

  rawScore: number
  aiTags: string[]
  relevanceTier: 'high' | 'medium' | 'low'

  ingestRunId: string
  ingestedAt: string

  // Metadata
  sourceQueries: SourceQuery[]
  batchId: string
  rawPayload: SamGovOpportunity
}

/**
 * AI Analysis Result
 */
export interface AIAnalysisResult {
  relevanceSummary: string
  recommendedAction: 'prime' | 'sub' | 'monitor' | 'ignore'
  capabilityMatch: string[]
  risks: string[]
}

/**
 * Ingestion Batch metadata
 */
export interface IngestionBatch {
  batchId: string
  ingestedAt: Date
  totalFetched: number
  totalDeduplicated: number
  totalPassedFilters: number
  totalScored: number
  totalScoredAbove50: number
  queryStats: Record<SourceQuery, number>
}

/**
 * Ingestion Result
 */
export interface IngestionResult {
  success: boolean
  batchId: string
  fetched: number
  deduplicated: number
  passedFilters: number
  scoredAbove50: number
  error?: string
  batch: IngestionBatch
}

// Re-export SAM.gov types for convenience
export type { SamGovOpportunity, SamGovApiResponse }

