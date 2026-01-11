/**
 * Contract data validation layer
 * Schema validation, quality scoring, and duplicate detection
 */

import { DiscoveryResult } from '../contract-discovery'
import { ScrapeResult } from '../contract-scraper'

export interface ValidationResult {
  valid: boolean
  score: number // 0-100 quality score
  errors: string[]
  warnings: string[]
  completeness: number // 0-100
}

export interface ScrapeValidationResult {
  valid: boolean
  score: number
  sowFound: boolean
  sowQuality: 'high' | 'medium' | 'low' | 'none'
  contentLength: number
  errors: string[]
  warnings: string[]
}

/**
 * Validate contract discovery result
 */
export function validateContractResult(result: DiscoveryResult): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100
  let completeness = 0
  const maxCompleteness = 10
  
  // Required fields
  if (!result.title || result.title.trim().length === 0) {
    errors.push('Missing title')
    score -= 20
  } else {
    completeness++
  }
  
  if (!result.url || result.url.trim().length === 0) {
    errors.push('Missing URL')
    score -= 20
  } else {
    completeness++
  }
  
  // Important fields
  if (!result.notice_id) {
    warnings.push('Missing notice ID')
    score -= 5
  } else {
    completeness++
  }
  
  if (!result.agency) {
    warnings.push('Missing agency')
    score -= 5
  } else {
    completeness++
  }
  
  if (!result.set_aside || result.set_aside.length === 0) {
    warnings.push('Missing set-aside information')
    score -= 10
  } else {
    completeness++
  }
  
  // VetCert validation
  const hasVetCertSetAside = result.set_aside?.some(sa =>
    sa.includes('SDVOSB') ||
    sa.includes('VOSB') ||
    sa.includes('Veteran-Owned') ||
    sa.includes('Service-Disabled Veteran')
  )
  
  if (!hasVetCertSetAside) {
    warnings.push('No VetCert set-aside detected')
    score -= 15
  } else {
    completeness++
  }
  
  // Relevance scoring
  if (!result.relevance_score || result.relevance_score < 50) {
    warnings.push('Low relevance score')
    score -= 10
  } else {
    completeness++
  }
  
  // Keywords
  if (!result.detected_keywords || result.detected_keywords.length === 0) {
    warnings.push('No keywords detected')
    score -= 5
  } else {
    completeness++
  }
  
  // Description/snippet
  if (!result.description && !result.snippet) {
    warnings.push('Missing description')
    score -= 5
  } else {
    completeness++
  }
  
  // NAICS codes
  if (!result.naics_codes || result.naics_codes.length === 0) {
    warnings.push('Missing NAICS codes')
    score -= 5
  } else {
    completeness++
  }
  
  // URL validation
  if (result.url && !result.url.startsWith('http')) {
    errors.push('Invalid URL format')
    score -= 10
  }
  
  // Domain validation
  if (result.domain && !result.domain.includes('sam.gov')) {
    warnings.push('Not from SAM.gov')
    score -= 5
  } else {
    completeness++
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score)
  
  // Calculate completeness percentage
  const completenessPercent = (completeness / maxCompleteness) * 100
  
  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    completeness: completenessPercent,
  }
}

/**
 * Validate scraped contract data
 */
export function validateScrapeResult(scrapeResult: ScrapeResult): ScrapeValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100
  
  if (!scrapeResult.success) {
    return {
      valid: false,
      score: 0,
      sowFound: false,
      sowQuality: 'none',
      contentLength: 0,
      errors: [scrapeResult.error || 'Scrape failed'],
      warnings: [],
    }
  }
  
  // Content validation
  const contentLength = scrapeResult.textContent?.length || 0
  if (contentLength === 0) {
    errors.push('No content extracted')
    score -= 30
  } else if (contentLength < 100) {
    warnings.push('Very short content')
    score -= 10
  }
  
  // SOW attachment validation
  const sowFound = !!scrapeResult.sowAttachmentUrl
  let sowQuality: 'high' | 'medium' | 'low' | 'none' = 'none'
  
  if (sowFound) {
    if (scrapeResult.sowAttachmentType === 'PDF') {
      sowQuality = 'high'
    } else if (scrapeResult.sowAttachmentType === 'DOCX') {
      sowQuality = 'medium'
    } else {
      sowQuality = 'low'
    }
    score += 20
  } else {
    warnings.push('No SOW attachment found')
    score -= 15
  }
  
  // Analysis validation
  if (scrapeResult.analysis) {
    if (scrapeResult.analysis.confidence < 0.5) {
      warnings.push('Low analysis confidence')
      score -= 10
    }
    
    if (!scrapeResult.analysis.keywords || scrapeResult.analysis.keywords.length === 0) {
      warnings.push('No keywords in analysis')
      score -= 5
    }
    
    if (!scrapeResult.analysis.summary || scrapeResult.analysis.summary.length < 50) {
      warnings.push('Short or missing summary')
      score -= 5
    }
  } else {
    warnings.push('No analysis available')
    score -= 10
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))
  
  return {
    valid: errors.length === 0,
    score,
    sowFound,
    sowQuality,
    contentLength,
    errors,
    warnings,
  }
}

/**
 * Check for duplicate contracts
 */
export function detectDuplicates(
  contracts: DiscoveryResult[],
  existingUrls: Set<string>
): {
  duplicates: DiscoveryResult[]
  unique: DiscoveryResult[]
} {
  const seen = new Set<string>()
  const duplicates: DiscoveryResult[] = []
  const unique: DiscoveryResult[] = []
  
  for (const contract of contracts) {
    const url = contract.url.toLowerCase().trim()
    
    // Check against existing URLs
    if (existingUrls.has(url)) {
      duplicates.push(contract)
      continue
    }
    
    // Check against other contracts in this batch
    if (seen.has(url)) {
      duplicates.push(contract)
      continue
    }
    
    seen.add(url)
    unique.push(contract)
  }
  
  return { duplicates, unique }
}

/**
 * Calculate data quality score for a contract
 */
export function calculateQualityScore(result: DiscoveryResult): number {
  let score = 0
  
  // Title (10 points)
  if (result.title && result.title.length > 10) {
    score += 10
  }
  
  // URL (10 points)
  if (result.url && result.url.startsWith('http')) {
    score += 10
  }
  
  // Notice ID (10 points)
  if (result.notice_id) {
    score += 10
  }
  
  // Agency (10 points)
  if (result.agency) {
    score += 10
  }
  
  // Set-aside (15 points)
  if (result.set_aside && result.set_aside.length > 0) {
    score += 15
  }
  
  // Description (10 points)
  if (result.description || result.snippet) {
    score += 10
  }
  
  // Keywords (10 points)
  if (result.detected_keywords && result.detected_keywords.length > 0) {
    score += 10
  }
  
  // NAICS codes (10 points)
  if (result.naics_codes && result.naics_codes.length > 0) {
    score += 10
  }
  
  // Relevance score (5 points if > 50)
  if (result.relevance_score && result.relevance_score > 50) {
    score += 5
  }
  
  return score
}

