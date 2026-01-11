/**
 * Enhanced contract scraper service
 * Multi-strategy scraping with validation and quality scoring
 */

import { scrapeContractPage, ScrapeResult, scrapeSOWAttachment } from '../contract-scraper'
import { DiscoveryResult } from '../contract-discovery'
import { validateScrapeResult, ScrapeValidationResult } from './contract-validator'
import { retry } from '../utils/retry'
import { createLogger, recordScrapeMetrics } from './contract-metrics'

const logger = createLogger('EnhancedScraper')

export interface EnhancedScrapeOptions {
  useApiData?: boolean // Prefer API data over HTML scraping
  validateContent?: boolean // Validate scraped content
  extractSOW?: boolean // Automatically extract SOW if found
  maxRetries?: number
}

export interface EnhancedScrapeResult {
  success: boolean
  scrapeResult: ScrapeResult
  validation: ScrapeValidationResult
  sowContent?: string
  sowScraped: boolean
  duration: number
  error?: string
}

/**
 * Enhanced scrape with multi-strategy approach
 */
export async function enhancedScrape(
  contract: DiscoveryResult,
  options: EnhancedScrapeOptions = {}
): Promise<EnhancedScrapeResult> {
  const startTime = Date.now()
  const scrapeId = `scrape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logger.info('Starting enhanced scrape', {
    scrapeId,
    url: contract.url,
    hasApiData: !!contract.api_data,
  })
  
  try {
    // Strategy 1: Use API data if available (preferred)
    const useApiData = options.useApiData !== false && !!contract.api_data
    
    let scrapeResult: ScrapeResult
    
    if (useApiData) {
      logger.debug('Using API data for scraping', { scrapeId })
      scrapeResult = await scrapeContractPage(contract.url, contract.api_data)
    } else {
      // Strategy 2: HTML scraping with retry
      logger.debug('Using HTML scraping', { scrapeId })
      
      const retryResult = await retry(
        async () => {
          return await scrapeContractPage(contract.url)
        },
        {
          maxRetries: options.maxRetries || 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          retryableErrors: (error) => {
            return error.message.includes('timeout') ||
                   error.message.includes('network') ||
                   error.message.includes('ECONNRESET') ||
                   error.message.includes('ETIMEDOUT')
          },
        }
      )
      
      if (!retryResult.success || !retryResult.data) {
        throw retryResult.error || new Error('Scraping failed after retries')
      }
      
      scrapeResult = retryResult.data
    }
    
    // Validate scraped content
    const validation = validateScrapeResult(scrapeResult)
    
    // Extract SOW if found and requested
    let sowContent: string | undefined
    let sowScraped = false
    
    if (options.extractSOW && scrapeResult.sowAttachmentUrl) {
      logger.debug('Extracting SOW attachment', {
        scrapeId,
        sowUrl: scrapeResult.sowAttachmentUrl,
        sowType: scrapeResult.sowAttachmentType,
      })
      
      try {
        const sowResult = await retry(
          async () => {
            return await scrapeSOWAttachment(
              scrapeResult.sowAttachmentUrl!,
              scrapeResult.sowAttachmentType || 'unknown'
            )
          },
          {
            maxRetries: 2,
            initialDelayMs: 2000,
            maxDelayMs: 15000,
          }
        )
        
        if (sowResult.success && sowResult.data?.content) {
          sowContent = sowResult.data.content
          sowScraped = true
          logger.debug('SOW extracted successfully', {
            scrapeId,
            contentLength: sowResult.data.content.length,
          })
        } else {
          logger.warn('SOW extraction failed', {
            scrapeId,
            error: sowResult.error,
          })
        }
      } catch (error) {
        logger.warn('SOW extraction error', {
          scrapeId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
    
    const duration = Date.now() - startTime
    
    // Record metrics
    recordScrapeMetrics({
      scrapeId,
      url: contract.url,
      duration,
      success: scrapeResult.success,
      sowFound: !!scrapeResult.sowAttachmentUrl,
      error: scrapeResult.error,
      timestamp: Date.now(),
    })
    
    logger.info('Enhanced scrape completed', {
      scrapeId,
      success: scrapeResult.success,
      validationScore: validation.score,
      sowScraped,
      duration,
    })
    
    return {
      success: scrapeResult.success,
      scrapeResult,
      validation,
      sowContent,
      sowScraped,
      duration,
      error: scrapeResult.error,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('Enhanced scrape failed', {
      scrapeId,
      error: error instanceof Error ? error : new Error(String(error)),
      duration,
    })
    
    // Record error metrics
    recordScrapeMetrics({
      scrapeId,
      url: contract.url,
      duration,
      success: false,
      sowFound: false,
      error: errorMessage,
      timestamp: Date.now(),
    })
    
    return {
      success: false,
      scrapeResult: {
        success: false,
        error: errorMessage,
      },
      validation: {
        valid: false,
        score: 0,
        sowFound: false,
        sowQuality: 'none',
        contentLength: 0,
        errors: [errorMessage],
        warnings: [],
      },
      sowScraped: false,
      duration,
      error: errorMessage,
    }
  }
}

/**
 * Batch scrape multiple contracts
 */
export async function batchScrape(
  contracts: DiscoveryResult[],
  options: EnhancedScrapeOptions = {}
): Promise<Map<string, EnhancedScrapeResult>> {
  const results = new Map<string, EnhancedScrapeResult>()
  
  logger.info('Starting batch scrape', {
    contractCount: contracts.length,
  })
  
  // Process in parallel with concurrency limit
  const concurrency = 3
  const chunks: DiscoveryResult[][] = []
  
  for (let i = 0; i < contracts.length; i += concurrency) {
    chunks.push(contracts.slice(i, i + concurrency))
  }
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(contract => enhancedScrape(contract, options))
    )
    
    chunk.forEach((contract, index) => {
      results.set(contract.url, chunkResults[index])
    })
  }
  
  logger.info('Batch scrape completed', {
    totalContracts: contracts.length,
    successful: Array.from(results.values()).filter(r => r.success).length,
  })
  
  return results
}

