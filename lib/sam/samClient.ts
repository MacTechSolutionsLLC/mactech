/**
 * SAM.gov API Client
 * Wrapper around SAM.gov Opportunities API v2
 * Handles authentication, rate limiting, and error handling
 */

import { SamGovApiResponse } from '../sam-gov-api-v2'

const API_BASE_URL = 'https://api.sam.gov/opportunities/v2/search'

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  if (!apiKey) {
    throw new Error(
      'SAM.gov API key required. ' +
      'Please register at https://api.sam.gov/ and set SAM_GOV_API_KEY environment variable.'
    )
  }
  
  return apiKey
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute a SAM.gov API call with retry logic
 */
export async function executeSamGovQuery(
  params: URLSearchParams,
  retries: number = 3
): Promise<SamGovApiResponse> {
  const apiKey = getApiKey()
  const url = new URL(API_BASE_URL)
  
  // Add all query parameters
  params.forEach((value, key) => {
    url.searchParams.append(key, value)
  })
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'User-Agent': 'MacTech Contract Discovery/1.0',
    'X-API-KEY': apiKey,
  }
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.pow(2, attempt - 1) * 1000
        console.log(`[SAM Client] Retry attempt ${attempt + 1}/${retries} after ${backoffMs}ms`)
        await sleep(backoffMs)
      }
      
      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) {
        const errorText = await response.text()
        
        // Handle authentication errors
        if (response.status === 401) {
          throw new Error(
            `SAM.gov API authentication failed. ` +
            `Please verify your API key is correct. ` +
            `Error: ${errorText.substring(0, 200)}`
          )
        }
        
        // Handle rate limiting (429)
        if (response.status === 429) {
          let nextAccessTime: string | null = null
          try {
            const errorJson = JSON.parse(errorText)
            nextAccessTime = errorJson.nextAccessTime || 
              errorJson.description?.match(/after (.+?)(?:\s|$)/)?.[1] || null
          } catch {
            const timeMatch = errorText.match(/after (.+?)(?:\s|UTC|$)/i)
            if (timeMatch) {
              nextAccessTime = timeMatch[1]
            }
          }
          
          const rateLimitMessage = nextAccessTime 
            ? `SAM.gov API rate limit exceeded. You can try again after ${nextAccessTime}. The free tier has daily request limits.`
            : `SAM.gov API rate limit exceeded. The free tier has daily request limits. Please try again later.`
          
          // If this is the last retry, throw the error
          if (attempt === retries - 1) {
            throw new Error(rateLimitMessage)
          }
          
          // Otherwise, wait longer and retry
          console.warn(`[SAM Client] Rate limit hit, waiting before retry...`)
          await sleep(5000) // Wait 5 seconds for rate limit
          continue
        }
        
        throw new Error(
          `SAM.gov API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`
        )
      }
      
      const data: SamGovApiResponse = await response.json()
      return data
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on authentication errors
      if (lastError.message.includes('authentication failed') || 
          lastError.message.includes('401')) {
        throw lastError
      }
      
      // Log error but continue to retry
      console.error(`[SAM Client] Attempt ${attempt + 1} failed:`, lastError.message)
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Failed to execute SAM.gov query after retries')
}

