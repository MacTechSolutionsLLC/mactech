/**
 * SAM.gov Entity Management API Integration
 * 
 * Uses the official SAM.gov Entity Management API
 * Documentation: https://open.gsa.gov/api/entity-api/
 * Endpoints:
 *   - Production: https://api.sam.gov/entity-information/v{1-4}/entities
 *   - Alpha: https://api-alpha.sam.gov/entity-information/v{1-4}/entities
 * 
 * This API allows querying entity/vendor information, which can be useful for:
 * - Finding vendor capabilities (NAICS, PSC codes)
 * - Checking entity registration status
 * - Getting entity contact information
 * - Understanding vendor hierarchies
 */

export interface EntitySearchParams {
  // Basic filters
  ueiSAM?: string // Unique Entity Identifier
  samRegistered?: 'Yes' | 'No' // v2: Yes only, v3/v4: Yes or No
  registrationStatus?: string // v3/v4: replaces samExtractCode
  includeSections?: string // Comma-separated list of sections to include
  
  // Entity information filters
  q?: string // Free text search
  naicsCode?: string // NAICS code filter
  pscCode?: string // PSC code filter
  businessTypes?: string // Business type filter
  
  // Location filters
  state?: string // State code
  city?: string // City name
  zip?: string // ZIP code
  
  // Socio-economic filters
  socioEconomicStatus?: string // e.g., "SDVOSB", "VOSB", "8A", "WOSB", etc.
  
  // Pagination
  page?: number // Page number (default: 1)
  size?: number // Records per page (default: 10, max: 10,000 for sync, 1M for async)
  
  // Format (for extract API)
  format?: 'json' | 'csv' // For async extract requests
  emailId?: 'Yes' | 'No' // Send download link via email
  
  // Advanced filters (v3/v4)
  evsMonitoring?: string // EVS monitoring status
  proceedingsData?: string // Proceedings data filter
  responsibilityQualificationType?: string // Responsibility/qualification type
}

export interface EntityResponse {
  entityData?: EntityData[]
  totalRecords?: number
  page?: number
  size?: number
  // For async extract requests
  downloadLink?: string
  token?: string
}

export interface EntityData {
  ueiSAM?: string
  entityRegistration?: {
    registrationStatus?: string
    evsSource?: string
    lastUpdateDate?: string
  }
  coreData?: {
    entityInformation?: {
      entityName?: string
      dbaName?: string
      entityDivision?: string
      divisionNumber?: string
    }
    physicalAddress?: Address
    mailingAddress?: Address
    businessTypes?: string[]
    naicsCodes?: Array<{
      naicsCode?: string
      naicsName?: string
    }>
    pscCodes?: Array<{
      pscCode?: string
      pscName?: string
    }>
  }
  pointsOfContact?: Array<{
    firstName?: string
    middleName?: string
    lastName?: string
    title?: string
    email?: string // FOUO data
    phone?: string // FOUO data
    fax?: string // FOUO data
    address?: Address
  }>
  // Additional sections available based on includeSections parameter
}

export interface Address {
  line1?: string
  line2?: string
  city?: string
  stateOrProvinceCode?: string
  zip?: string
  zipPlus4?: string
  countryCode?: string
}

/**
 * Search SAM.gov entities
 * 
 * @param params Search parameters
 * @param version API version (1-4, default: 4)
 * @param useAlpha Use alpha endpoint (default: false)
 * @returns Entity response data
 */
export async function searchSamGovEntities(
  params: EntitySearchParams,
  version: number = 4,
  useAlpha: boolean = false
): Promise<EntityResponse> {
  const baseUrl = useAlpha 
    ? 'https://api-alpha.sam.gov'
    : 'https://api.sam.gov'
  
  const endpoint = `${baseUrl}/entity-information/v${version}/entities`
  const apiUrl = new URL(endpoint)
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      apiUrl.searchParams.append(key, String(value))
    }
  })
  
  // Get API key from environment
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  // Add API key to query params (for public data access)
  if (apiKey) {
    apiUrl.searchParams.append('api_key', apiKey)
  }
  
  console.log(`[SAM.gov Entity API] Searching: ${apiUrl.toString().replace(/api_key=[^&]+/, 'api_key=***')}`)
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'MacTech Contract Discovery/1.0',
    }
    
    // For FOUO/Sensitive data, API key should be in headers
    if (apiKey) {
      headers['x-api-key'] = apiKey // Entity API uses lowercase
      headers['X-Api-Key'] = apiKey // Also support uppercase for compatibility
    }
    
    // For Sensitive data, need Basic Auth with system account credentials
    const systemUsername = process.env.SAM_GOV_SYSTEM_USERNAME
    const systemPassword = process.env.SAM_GOV_SYSTEM_PASSWORD
    
    if (systemUsername && systemPassword) {
      // Base64 encode username:password for Basic Auth
      const authString = Buffer.from(`${systemUsername}:${systemPassword}`).toString('base64')
      headers['Authorization'] = `Basic ${authString}`
    }
    
    // Use POST for sensitive data, GET for public/FOUO
    const method = systemUsername && systemPassword ? 'POST' : 'GET'
    
    const response = await fetch(apiUrl.toString(), {
      method,
      headers,
      // For POST requests with sensitive data, body can contain additional filters
      body: method === 'POST' ? JSON.stringify(params) : undefined,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      
      if (response.status === 401) {
        throw new Error(
          `SAM.gov Entity API requires authentication. ` +
          `Please set SAM_GOV_API_KEY environment variable. ` +
          `For FOUO/Sensitive data, system account credentials may be required. ` +
          `Error: ${errorText.substring(0, 200)}`
        )
      }
      
      if (response.status === 429) {
        throw new Error(
          `SAM.gov Entity API rate limit exceeded. ` +
          `Rate limits vary by account type (10-10,000 requests/day). ` +
          `Please try again later.`
        )
      }
      
      throw new Error(`SAM.gov Entity API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`)
    }
    
    const data: EntityResponse = await response.json()
    
    console.log(`[SAM.gov Entity API] Found ${data.totalRecords || 0} total records`)
    
    return data
  } catch (error) {
    console.error('[SAM.gov Entity API] Error:', error)
    throw error
  }
}

/**
 * Get entities by NAICS codes (useful for finding vendors in our target categories)
 */
export async function getEntitiesByNaicsCodes(
  naicsCodes: string[],
  options: {
    includeSections?: string
    socioEconomicStatus?: string
    state?: string
    version?: number
  } = {}
): Promise<EntityResponse> {
  // Entity API supports multiple NAICS codes via comma separation or multiple params
  // For simplicity, we'll search with the first code and note that multiple codes
  // may require multiple API calls or comma-separated values (check API docs)
  
  const params: EntitySearchParams = {
    naicsCode: naicsCodes[0], // Start with first code
    includeSections: options.includeSections || 'entityRegistration,coreData',
    socioEconomicStatus: options.socioEconomicStatus,
    state: options.state,
    size: 100, // Get more results per page
  }
  
  return searchSamGovEntities(params, options.version || 4)
}

/**
 * Get entities by PSC codes
 */
export async function getEntitiesByPscCodes(
  pscCodes: string[],
  options: {
    includeSections?: string
    socioEconomicStatus?: string
    version?: number
  } = {}
): Promise<EntityResponse> {
  const params: EntitySearchParams = {
    pscCode: pscCodes[0], // Start with first code
    includeSections: options.includeSections || 'entityRegistration,coreData',
    socioEconomicStatus: options.socioEconomicStatus,
    size: 100,
  }
  
  return searchSamGovEntities(params, options.version || 4)
}

/**
 * Simple in-memory cache for entity data
 * In production, use Redis or similar
 */
interface EntityCacheEntry {
  data: EntityData
  timestamp: number
}

const entityCache = new Map<string, EntityCacheEntry>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get entity by UEI with caching
 */
export async function getEntityByUei(
  uei: string,
  options: {
    useCache?: boolean
    includeSections?: string
    version?: number
  } = {}
): Promise<EntityData | null> {
  const useCache = options.useCache !== false // Default to true
  
  // Check cache first
  if (useCache) {
    const cached = entityCache.get(uei)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[SAM.gov Entity API] Cache hit for UEI: ${uei}`)
      return cached.data
    }
  }
  
  try {
    const params: EntitySearchParams = {
      ueiSAM: uei,
      includeSections: options.includeSections || 'entityRegistration,coreData',
      size: 1,
    }
    
    const response = await searchSamGovEntities(params, options.version || 4)
    
    if (response.entityData && response.entityData.length > 0) {
      const entity = response.entityData[0]
      
      // Cache the result
      if (useCache) {
        entityCache.set(uei, {
          data: entity,
          timestamp: Date.now(),
        })
      }
      
      return entity
    }
    
    return null
  } catch (error) {
    console.error(`[SAM.gov Entity API] Error fetching entity ${uei}:`, error)
    return null
  }
}

/**
 * Batch lookup entities by UEI
 * Processes in batches to avoid overwhelming the API
 */
export async function batchLookupEntities(
  ueis: string[],
  options: {
    batchSize?: number
    delayBetweenBatches?: number
    useCache?: boolean
    includeSections?: string
    version?: number
  } = {}
): Promise<Map<string, EntityData>> {
  const batchSize = options.batchSize || 10
  const delayBetweenBatches = options.delayBetweenBatches || 1000 // 1 second
  const useCache = options.useCache !== false
  
  const results = new Map<string, EntityData>()
  
  // Filter out cached entries
  const uncachedUeis: string[] = []
  for (const uei of ueis) {
    if (useCache) {
      const cached = entityCache.get(uei)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        results.set(uei, cached.data)
        continue
      }
    }
    uncachedUeis.push(uei)
  }
  
  // Process in batches
  for (let i = 0; i < uncachedUeis.length; i += batchSize) {
    const batch = uncachedUeis.slice(i, i + batchSize)
    
    // Process batch in parallel (but with rate limiting)
    const batchPromises = batch.map(uei =>
      getEntityByUei(uei, {
        useCache: false, // We'll cache manually
        includeSections: options.includeSections,
        version: options.version,
      })
    )
    
    const batchResults = await Promise.all(batchPromises)
    
    // Store results
    batch.forEach((uei, index) => {
      const entity = batchResults[index]
      if (entity) {
        results.set(uei, entity)
        
        // Cache the result
        if (useCache) {
          entityCache.set(uei, {
            data: entity,
            timestamp: Date.now(),
          })
        }
      }
    })
    
    // Delay between batches to avoid rate limiting
    if (i + batchSize < uncachedUeis.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }
  
  console.log(`[SAM.gov Entity API] Batch lookup: ${results.size}/${ueis.length} entities found`)
  
  return results
}

/**
 * Clear entity cache
 */
export function clearEntityCache(): void {
  entityCache.clear()
  console.log('[SAM.gov Entity API] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getEntityCacheStats(): { size: number; entries: number } {
  const now = Date.now()
  let validEntries = 0
  
  for (const entry of entityCache.values()) {
    if (now - entry.timestamp < CACHE_TTL) {
      validEntries++
    }
  }
  
  return {
    size: entityCache.size,
    entries: validEntries,
  }
}

