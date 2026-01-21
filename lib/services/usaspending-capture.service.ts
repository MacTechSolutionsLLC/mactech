/**
 * USAspending Capture Intelligence Service
 * 
 * Implements exact API contracts for award discovery, enrichment, and signal generation.
 * This service is idempotent and safe to run daily.
 */

import { prisma } from '../prisma'

const BASE_URL = 'https://api.usaspending.gov/api/v2'

// Rate limiter to avoid overwhelming the API
class RateLimiter {
  private requests: number[] = []
  private maxRequests = 10
  private windowMs = 1000 // 1 second window

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.requests.push(Date.now())
  }
}

const rateLimiter = new RateLimiter()

/**
 * Make API request with error handling and retry logic
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  await rateLimiter.waitIfNeeded()
  
  const url = `${BASE_URL}${endpoint}`
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorData: any = {}
        try {
          if (errorText) {
            errorData = JSON.parse(errorText)
          }
        } catch (e) {
          // If parsing fails, use empty object
        }

        // Log detailed error information for debugging
        const requestBody = options.body ? (typeof options.body === 'string' ? options.body.substring(0, 2000) : JSON.stringify(options.body).substring(0, 2000)) : 'N/A'
        console.error(`[USAspending API] Error ${response.status} on ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText: errorText.substring(0, 1000),
          requestBody: requestBody.substring(0, 1000),
          attempt: attempt + 1,
          retries,
        })

        if (response.status === 400) {
          throw new Error(`Bad request: ${JSON.stringify(errorData)} - Request body: ${requestBody.substring(0, 500)}`)
        }
        if (response.status === 422) {
          throw new Error(`Validation error (422): ${JSON.stringify(errorData)} - Request: ${requestBody.substring(0, 1000)}`)
        }
        if (response.status === 500) {
          if (attempt < retries - 1) {
            console.warn(`[USAspending API] Retrying after 500 error (attempt ${attempt + 1}/${retries})...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText.substring(0, 500)} - Request: ${requestBody.substring(0, 500)}`)
        }
        throw new Error(`HTTP error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)} - Request: ${requestBody.substring(0, 500)}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === retries - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * Discovery result interface
 */
interface DiscoveryAward {
  'Award ID'?: string
  'Recipient Name'?: string
  'Award Amount'?: number
  'Awarding Agency'?: string
  'Awarding Sub Agency'?: string
  'Description'?: string
  generated_internal_id?: string
  internal_id?: string
  [key: string]: any
}

interface DiscoveryResponse {
  results?: DiscoveryAward[]
  page_metadata?: {
    page?: number
    has_next_page?: boolean
    has_previous_page?: boolean
    next?: string
    previous?: string
  }
  messages?: string[]
}

/**
 * Discover awards using exact API contract
 */
export async function discoverAwards(
  filters: {
    naicsCodes?: string[]
    awardTypeCodes?: string[]
    agencies?: Array<{ type: 'awarding' | 'funding'; tier: 'toptier' | 'subtier'; name: string }>
    timePeriod?: { startDate: string; endDate: string }
  } = {},
  pagination: { maxPages?: number; limitPerPage?: number } = {}
): Promise<DiscoveryAward[]> {
  const maxPages = pagination.maxPages ?? 100
  const limitPerPage = pagination.limitPerPage ?? 100

  // Build filters with defaults
  const apiFilters: any = {
    naics_codes: filters.naicsCodes || ['541512', '541511', '541519'],
    award_type_codes: filters.awardTypeCodes || ['A', 'B'],
    agencies: filters.agencies || [
      { type: 'awarding', tier: 'toptier', name: 'Department of Defense' }
    ],
    time_period: (() => {
      const today = new Date().toISOString().split('T')[0]
      if (filters.timePeriod) {
        // Cap end_date at today to avoid future date issues with API
        const endDate = filters.timePeriod.endDate > today ? today : filters.timePeriod.endDate
        return [{ start_date: filters.timePeriod.startDate, end_date: endDate }]
      }
      // Default to last 2 years to avoid API timeouts with large date ranges
      return [{ 
        start_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        end_date: today
      }]
    })(),
  }

  const allAwards: DiscoveryAward[] = []
  let page = 1
  let hasNext = true

  while (hasNext && page <= maxPages) {
    try {
      // Use display field names (as per requirements) with valid sort field
      // The API requires sort field to be in the fields array and use display names
      let body: any = {
        filters: apiFilters,
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Awarding Agency',
          'Awarding Sub Agency',
          'Description',
          'generated_internal_id',
          'internal_id'
        ],
        limit: limitPerPage,
        page,
        // Use 'generated_internal_id' as sort (it's in the valid sort fields list)
        // This prevents API from defaulting to invalid 'award_id'
        sort: 'generated_internal_id',
        order: 'desc',
      }

      // Log request details for first page to help debug
      if (page === 1) {
        console.log(`[USAspending Capture] Discovery request (page ${page}):`, {
          filters: JSON.stringify(apiFilters).substring(0, 500),
          fields: body.fields,
          limit: body.limit,
          sort: body.sort,
          order: body.order,
        })
      }

      // Make request with display field names and valid sort
      const response = await makeRequest<DiscoveryResponse>('/search/spending_by_award/', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (response.results && response.results.length > 0) {
        allAwards.push(...response.results)
      }

      hasNext = response.page_metadata?.has_next_page ?? false
      page++

      // Small delay between pages
      if (hasNext) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`[USAspending Capture] Error discovering awards on page ${page}:`, error)
      // Continue with next page if we have some results
      if (allAwards.length === 0) {
        throw error
      }
      hasNext = false
    }
  }

  return allAwards
}

/**
 * Enrich award using GET /awards/{generated_internal_id}/
 */
export async function enrichAward(generatedInternalId: string): Promise<any> {
  try {
    const response = await makeRequest<any>(`/awards/${generatedInternalId}/`, {
      method: 'GET',
    })
    return response
  } catch (error) {
    console.error(`[USAspending Capture] Error enriching award ${generatedInternalId}:`, error)
    throw error
  }
}

/**
 * Fetch transactions for an award
 */
export async function fetchTransactions(
  awardId: string,
  awardTypeCodes: string[]
): Promise<any[]> {
  try {
    const body = {
      filters: {
        award_ids: [awardId],
        award_type_codes: awardTypeCodes
      },
      fields: [
        'Issued Date',
        'Transaction Amount',
        'Mod',
        'Transaction Description'
      ],
      limit: 100,
      sort: 'Issued Date',
      order: 'desc' as const
    }

    const response = await makeRequest<{ results?: any[] }>('/search/spending_by_transaction/', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return response.results || []
  } catch (error) {
    console.error(`[USAspending Capture] Error fetching transactions for award ${awardId}:`, error)
    // Return empty array on error - don't fail the whole process
    return []
  }
}

/**
 * Calculate relevance score (0-100)
 */
export function calculateRelevanceScore(award: {
  naics_code?: string | null
  awarding_agency_name?: string | null
  description?: string | null
  end_date?: Date | null
  total_obligation?: number | null
  transaction_count?: number | null
}): number {
  let score = 0

  // +30: NAICS 541512 or 541511
  if (award.naics_code === '541512' || award.naics_code === '541511') {
    score += 30
  }

  // +20: DoD awarding agency
  if (award.awarding_agency_name && 
      award.awarding_agency_name.toLowerCase().includes('department of defense')) {
    score += 20
  }

  // +15: Keywords in description
  const keywords = ['RMF', 'STIG', 'ATO', 'Cyber', 'eMASS', 'Zero Trust', 'Enterprise']
  if (award.description) {
    const descriptionUpper = award.description.toUpperCase()
    const hasKeyword = keywords.some(keyword => descriptionUpper.includes(keyword.toUpperCase()))
    if (hasKeyword) {
      score += 15
    }
  }

  // +15: Active or future PoP end date
  if (award.end_date) {
    const endDate = new Date(award.end_date)
    const now = new Date()
    if (endDate >= now) {
      score += 15
    }
  }

  // +10: Award amount > $5M
  if (award.total_obligation && award.total_obligation > 5_000_000) {
    score += 10
  }

  // +10: >10 transactions (ongoing activity)
  if (award.transaction_count && award.transaction_count > 10) {
    score += 10
  }

  return Math.min(score, 100) // Cap at 100
}

/**
 * Generate signals from transactions and award data
 */
export function generateSignals(
  transactions: any[],
  award: {
    start_date?: Date | null
    end_date?: Date | null
    last_modified_date?: Date | null
  }
): string[] {
  const signals: string[] = []

  // ACTIVE: end_date in future AND (last_modified_date < 180 days OR recent non-zero tx)
  if (award.end_date) {
    const endDate = new Date(award.end_date)
    const now = new Date()
    if (endDate >= now) {
      const daysSinceModified = award.last_modified_date
        ? (now.getTime() - new Date(award.last_modified_date).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity
      
      const hasRecentActivity = daysSinceModified < 180
      const hasRecentTransactions = transactions.some((tx: any) => {
        if (!tx['Issued Date']) return false
        const txDate = new Date(tx['Issued Date'])
        const daysSinceTx = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceTx < 180 && tx['Transaction Amount'] && tx['Transaction Amount'] > 0
      })

      if (hasRecentActivity || hasRecentTransactions) {
        signals.push('ACTIVE')
      }
    }
  }

  // STABLE: >5 mods AND low volatility
  const mods = transactions.filter((tx: any) => tx['Mod']).length
  if (mods > 5) {
    const amounts = transactions
      .map((tx: any) => tx['Transaction Amount'])
      .filter((amt: any) => amt != null && amt !== 0)
    
    if (amounts.length > 0) {
      const avg = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length
      const variance = amounts.reduce((sum: number, amt: number) => sum + Math.pow(amt - avg, 2), 0) / amounts.length
      const stdDev = Math.sqrt(variance)
      const coefficientOfVariation = avg !== 0 ? stdDev / Math.abs(avg) : 0
      
      // Low volatility = CV < 0.5
      if (coefficientOfVariation < 0.5) {
        signals.push('STABLE')
      }
    }
  }

  // DECLINING: negative obligations OR no activity
  const hasNegativeObligations = transactions.some((tx: any) => 
    tx['Transaction Amount'] && tx['Transaction Amount'] < 0
  )
  const hasNoRecentActivity = transactions.length === 0 || 
    transactions.every((tx: any) => {
      if (!tx['Issued Date']) return true
      const txDate = new Date(tx['Issued Date'])
      const daysSinceTx = (new Date().getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceTx > 365
    })
  
  if (hasNegativeObligations || hasNoRecentActivity) {
    signals.push('DECLINING')
  }

  // RECOMPETE_WINDOW: end_date within 24 months
  if (award.end_date) {
    const endDate = new Date(award.end_date)
    const now = new Date()
    const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsUntilEnd > 0 && monthsUntilEnd <= 24) {
      signals.push('RECOMPETE_WINDOW')
    }
  }

  return signals
}

/**
 * Save discovered award to database (upsert by generated_internal_id)
 */
export async function saveDiscoveredAward(discoveryAward: DiscoveryAward): Promise<{
  saved: boolean
  awardId: string | null
  error?: string
}> {
  try {
    const generatedInternalId = discoveryAward.generated_internal_id || discoveryAward.internal_id
    if (!generatedInternalId) {
      return { saved: false, awardId: null, error: 'Missing generated_internal_id' }
    }

    const humanAwardId = discoveryAward['Award ID']
    const awardAmount = discoveryAward['Award Amount']
    const recipientName = discoveryAward['Recipient Name']
    const awardingAgency = discoveryAward['Awarding Agency']
    const awardingSubAgency = discoveryAward['Awarding Sub Agency']
    const description = discoveryAward['Description']

    // Parse awarding agency JSON if needed
    let awardingAgencyJson: any = null
    if (awardingAgency) {
      try {
        awardingAgencyJson = typeof awardingAgency === 'string' 
          ? JSON.parse(awardingAgency) 
          : awardingAgency
      } catch {
        awardingAgencyJson = { name: awardingAgency }
      }
      
      if (awardingSubAgency) {
        awardingAgencyJson.subtier_agency = { name: awardingSubAgency }
      }
    }

    // Upsert by generated_internal_id
    const award = await prisma.usaSpendingAward.upsert({
      where: {
        generated_internal_id: String(generatedInternalId)
      },
      create: {
        generated_internal_id: String(generatedInternalId),
        human_award_id: humanAwardId || null,
        award_id: humanAwardId || null, // Also store in existing field for compatibility
        total_obligation: awardAmount || null,
        recipient_name: recipientName || null,
        awarding_agency_name: awardingAgency || null,
        awarding_agency: awardingAgencyJson ? JSON.stringify(awardingAgencyJson) : null,
        description: description || null,
        enrichment_status: 'pending',
        raw_data: JSON.stringify(discoveryAward),
      },
      update: {
        human_award_id: humanAwardId || undefined,
        award_id: humanAwardId || undefined,
        total_obligation: awardAmount || undefined,
        recipient_name: recipientName || undefined,
        awarding_agency_name: awardingAgency || undefined,
        awarding_agency: awardingAgencyJson ? JSON.stringify(awardingAgencyJson) : undefined,
        description: description || undefined,
        enrichment_status: 'pending', // Reset to pending if updating
        raw_data: JSON.stringify(discoveryAward),
        updated_at: new Date(),
      },
    })

    return { saved: true, awardId: award.id }
  } catch (error) {
    console.error('[USAspending Capture] Error saving discovered award:', error)
    return { 
      saved: false, 
      awardId: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update award with enrichment data
 */
export async function updateAwardEnrichment(
  generatedInternalId: string,
  enrichmentData: any
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Extract fields from enrichment data
    const pop = enrichmentData.period_of_performance
    const naics = enrichmentData.naics
    const naicsDescription = enrichmentData.naics_description
    const psc = enrichmentData.psc
    const pscDescription = enrichmentData.psc_description
    const subawardCount = enrichmentData.subaward_count
    const totalSubawardAmount = enrichmentData.total_subaward_amount
    const recipient = enrichmentData.recipient

    const updateData: any = {
      enrichment_status: 'completed',
      enriched_at: new Date(),
      raw_data: JSON.stringify(enrichmentData),
    }

    if (pop) {
      if (pop.start_date) updateData.start_date = new Date(pop.start_date)
      if (pop.end_date) updateData.end_date = new Date(pop.end_date)
      if (pop.last_modified_date) updateData.last_modified_date = new Date(pop.last_modified_date)
      updateData.period_of_performance = JSON.stringify(pop)
    }

    if (naics) updateData.naics_code = naics
    if (naicsDescription) updateData.naics_description = naicsDescription
    if (psc) updateData.psc_code = psc
    if (pscDescription) updateData.psc_description = pscDescription
    if (subawardCount !== undefined) updateData.subaward_count = subawardCount
    if (totalSubawardAmount !== undefined) updateData.total_subaward_amount = totalSubawardAmount

    if (recipient) {
      if (recipient.recipient_name) updateData.recipient_name = recipient.recipient_name
      if (recipient.parent_recipient_name) {
        // Store parent in raw_data or create a derived field
        const currentRaw = updateData.raw_data ? JSON.parse(updateData.raw_data) : {}
        currentRaw.recipient = { ...currentRaw.recipient, parent_recipient_name: recipient.parent_recipient_name }
        updateData.raw_data = JSON.stringify(currentRaw)
      }
    }

    await prisma.usaSpendingAward.update({
      where: { generated_internal_id: String(generatedInternalId) },
      data: updateData,
    })

    return { success: true }
  } catch (error) {
    console.error(`[USAspending Capture] Error updating award enrichment ${generatedInternalId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Save transactions to database
 */
export async function saveTransactions(
  awardDbId: string,
  transactions: any[]
): Promise<number> {
  let saved = 0

  for (const tx of transactions) {
    try {
      const issuedDate = tx['Issued Date'] ? new Date(tx['Issued Date']) : null
      const transactionAmount = tx['Transaction Amount']
      const mod = tx['Mod']
      const description = tx['Transaction Description']

      // Use mod as transaction_id if available, otherwise generate one
      const transactionId = mod || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      await prisma.usaSpendingTransaction.upsert({
        where: {
          transaction_id: transactionId
        },
        create: {
          transaction_id: transactionId,
          award_id: awardDbId,
          action_date: issuedDate,
          federal_action_obligation: transactionAmount,
          raw_data: JSON.stringify(tx),
        },
        update: {
          action_date: issuedDate,
          federal_action_obligation: transactionAmount,
          raw_data: JSON.stringify(tx),
          updated_at: new Date(),
        },
      })

      saved++
    } catch (error) {
      console.error('[USAspending Capture] Error saving transaction:', error)
      // Continue with next transaction
    }
  }

  return saved
}

/**
 * Update award with relevance score and signals
 */
export async function updateAwardScoring(
  generatedInternalId: string,
  relevanceScore: number,
  signals: string[]
): Promise<void> {
  try {
    await prisma.usaSpendingAward.update({
      where: { generated_internal_id: String(generatedInternalId) },
      data: {
        relevance_score: relevanceScore,
        signals: JSON.stringify(signals),
      },
    })
  } catch (error) {
    console.error(`[USAspending Capture] Error updating award scoring ${generatedInternalId}:`, error)
    throw error
  }
}

/**
 * Normalize Entity API response to Prisma JSON format
 * Uses AUTHORITATIVE field paths from SAM.gov Entity API v3
 */
export function normalizeEntityData(entityData: any): any {
  return {
    legalBusinessName: entityData.entityRegistration?.legalBusinessName || null,
    registrationStatus: entityData.entityRegistration?.registrationStatus || null,
    ueiSAM: entityData.entityRegistration?.ueiSAM || null,
    cageCode: entityData.entityRegistration?.cageCode || null,
    entityStructureDesc: entityData.coreData?.generalInformation?.entityStructureDesc || null,
    profitStructureDesc: entityData.coreData?.generalInformation?.profitStructureDesc || null,
    organizationStructureDesc: entityData.coreData?.generalInformation?.organizationStructureDesc || null,
    countryOfIncorporation: entityData.coreData?.generalInformation?.countryOfIncorporationDesc || null,
    businessTypeList: entityData.coreData?.businessTypes?.businessTypeList || [],
    primaryNaics: entityData.assertions?.goodsAndServices?.primaryNaics || null,
    naicsList: entityData.assertions?.goodsAndServices?.naicsList || [],
    pscList: entityData.assertions?.goodsAndServices?.pscList || [],
    samRegistered: entityData.entityRegistration?.samRegistered || null,
    registrationDate: entityData.entityRegistration?.registrationDate || null,
    registrationExpirationDate: entityData.entityRegistration?.registrationExpirationDate || null,
    pointsOfContact: entityData.pointsOfContact || {},
  }
}

/**
 * Enrich award with SAM.gov Entity API v3 (SECONDARY, BEST-EFFORT)
 * 
 * This is a secondary enrichment layer that runs AFTER USAspending enrichment.
 * Empty results are VALID and expected.
 * 
 * Rules:
 * - Only enriches if recipient_name exists
 * - Truncates vendor name only if >120 characters
 * - Uses ONLY allowed Entity API parameters
 * - Treats empty results as valid success
 * - Does NOT retry on empty results
 */
export async function enrichAwardWithEntityApi(award: {
  id: string
  recipient_name: string | null
  raw_data: string | null
}): Promise<{
  success: boolean
  entityData: any | null
  error?: string
}> {
  // Extract vendor name from award
  let vendorName = award.recipient_name

  // Fallback: Try to parse parent_recipient_name from raw_data
  if (!vendorName && award.raw_data) {
    try {
      const rawData = JSON.parse(award.raw_data)
      const recipient = rawData.recipient
      vendorName = recipient?.parent_recipient_name || recipient?.recipient_name
    } catch {
      // Invalid JSON, skip fallback
    }
  }

  // If no vendor name, return early (no enrichment possible)
  if (!vendorName || vendorName.trim().length === 0) {
    return {
      success: true,
      entityData: null,
    }
  }

  // Truncate vendor name ONLY if >120 characters
  const truncatedName = vendorName.length > 120
    ? vendorName.slice(0, 120)
    : vendorName

  try {
    // Import the restricted Entity API function
    const { searchEntitiesByLegalBusinessName } = await import('../sam-gov-entity-api')

    // Execute ONE Entity API query with ONLY allowed parameters
    const response = await searchEntitiesByLegalBusinessName(truncatedName, {
      registrationStatus: 'ACTIVE',
      size: 5,
      page: 0,
    })

    // Handle results
    if (!response.entityData || response.entityData.length === 0) {
      // Empty results are VALID SUCCESS CASE
      return {
        success: true,
        entityData: null,
      }
    }

    // Select FIRST entity (treat as contextual, not authoritative)
    const firstEntity = response.entityData[0]
    return {
      success: true,
      entityData: firstEntity,
    }
  } catch (error) {
    // Log error but return failure (caller will handle logging at appropriate level)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      entityData: null,
      error: errorMessage,
    }
  }
}
