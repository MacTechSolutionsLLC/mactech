/**
 * Types for USAspending.gov ingestion pipeline
 */

import { UsaSpendingAward } from '../usaspending-api'

export interface IngestionBatch {
  batchId: string
  ingestedAt: Date
  totalFetched: number
  totalSaved: number
  totalSkipped: number
  errors: string[]
}

export interface IngestionResult {
  success: boolean
  batchId: string
  ingested: number
  saved: number
  skipped: number
  errors: string[]
  stats: IngestionBatch
}

export interface IngestionFilters {
  naicsCodes?: string[]
  pscCodes?: string[]
  agencies?: string[]
  awardTypes?: string[]
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  minAmount?: number
  maxAmount?: number
}

