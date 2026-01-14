import { NextRequest, NextResponse } from 'next/server'
import { searchContracts, SearchRequest } from '@/lib/services/contract-search-service'
import { validateContractResult, detectDuplicates } from '@/lib/services/contract-validator'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/services/contract-metrics'
import { buildGoogleQuery } from '@/lib/services/vetcert-query-builder'

const logger = createLogger('SearchAPIv2')

export const dynamic = 'force-dynamic'

interface SearchRequestBody {
  keywords: string // Comma-separated keywords
  service_category?: 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
  location?: string
  agency?: string[]
  date_range?: 'past_week' | 'past_month' | 'past_year'
  naics_codes?: string[]
  psc_codes?: string[]
  limit?: number
  use_cache?: boolean
}

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logger.info('Unified search API request', { requestId })
  
  try {
    let body: SearchRequestBody
    try {
      body = await request.json()
      
      // Validate required fields
      if (!body.keywords || body.keywords.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Keywords are required',
            message: 'Please provide comma-separated keywords for the search',
            requestId,
          },
          { status: 400 }
        )
      }
      
      logger.debug('Request body parsed', {
        requestId,
        keywords: body.keywords,
        serviceCategory: body.service_category,
      })
    } catch (parseError) {
      logger.error('Failed to parse request body', {
        requestId,
        error: parseError instanceof Error ? parseError : new Error(String(parseError)),
      })
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: parseError instanceof Error ? parseError.message : 'Failed to parse JSON',
          requestId,
        },
        { status: 400 }
      )
    }
    
    // Build search request
    const searchRequest: SearchRequest = {
      keywords: body.keywords,
      serviceCategory: body.service_category, // Optional - no default
      location: body.location,
      agency: body.agency,
      dateRange: body.date_range || 'past_month',
      naicsCodes: body.naics_codes,
      pscCodes: body.psc_codes,
      limit: body.limit || 30,
      useCache: body.use_cache !== false,
    }
    
    // Build Google query using the same parameters
    const parsedKeywords = body.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    const googleQuery = buildGoogleQuery({
      keywords: parsedKeywords,
      serviceCategory: body.service_category, // Optional - no default
      location: body.location,
      agency: body.agency,
      dateRange: body.date_range || 'past_month',
      naicsCodes: body.naics_codes,
      pscCodes: body.psc_codes,
    })
    
    // Execute search
    const searchResponse = await searchContracts(searchRequest)
    
    if (!searchResponse.success) {
      logger.error('Search failed', {
        requestId,
        error: searchResponse.error,
        googleQuery: googleQuery.query,
      })
      
      return NextResponse.json(
        {
          error: 'Search failed',
          message: searchResponse.error || 'Unknown error',
          requestId,
          googleQuery: googleQuery, // Include Google query even on error
        },
        { status: 500 }
      )
    }
    
    // Validate and filter results
    const validatedResults = searchResponse.results.map(result => {
      const validation = validateContractResult(result)
      return {
        ...result,
        validation,
      }
    })
    
    // Filter out invalid results (but keep warnings)
    const validResults = validatedResults.filter(r => r.validation.valid)
    const invalidResults = validatedResults.filter(r => !r.validation.valid)
    
    if (invalidResults.length > 0) {
      logger.warn('Some results failed validation', {
        requestId,
        invalidCount: invalidResults.length,
        totalCount: validatedResults.length,
      })
    }
    
    // Check for duplicates against database
    let dbAvailable = false
    let existingUrls = new Set<string>()
    
    try {
      await prisma.$connect()
      dbAvailable = true
      
      // Get existing URLs from database
      const existing = await prisma.governmentContractDiscovery.findMany({
        select: { url: true },
        where: {
          url: {
            in: validResults.map(r => r.url),
          },
        },
      })
      
      existingUrls = new Set(existing.map(e => e.url.toLowerCase().trim()))
    } catch (dbError) {
      logger.warn('Database unavailable for duplicate check', {
        requestId,
        error: dbError instanceof Error ? dbError.message : String(dbError),
      })
    }
    
    // Detect duplicates
    const { duplicates, unique } = detectDuplicates(validResults, existingUrls)
    
    if (duplicates.length > 0) {
      logger.debug('Duplicates detected', {
        requestId,
        duplicateCount: duplicates.length,
      })
    }
    
    // Store results in database
    let storedResults = unique
    
    if (dbAvailable) {
      try {
        storedResults = await Promise.all(
          unique.map(async (result) => {
            try {
              const existing = await prisma.governmentContractDiscovery.findUnique({
                where: { url: result.url },
              })
              
              if (existing) {
                // Update existing record
                const updated = await prisma.governmentContractDiscovery.update({
                  where: { url: result.url },
                  data: {
                    google_query: googleQuery.query, // Update Google query
                    title: result.title,
                    snippet: result.snippet || null,
                    domain: result.domain,
                    document_type: result.document_type || null,
                    notice_id: result.notice_id || null,
                    solicitation_number: result.solicitation_number || null,
                    agency: result.agency || null,
                    naics_codes: JSON.stringify(result.naics_codes || []),
                    set_aside: JSON.stringify(result.set_aside || []),
                    location_mentions: JSON.stringify(result.location_mentions || []),
                    detected_keywords: JSON.stringify(result.detected_keywords || []),
                    relevance_score: result.relevance_score || 0,
                    service_category: result.detected_service_category || searchRequest.serviceCategory || null,
                    description: result.description || result.snippet || existing.description,
                    scraped_text_content: result.api_data?.description || result.description || existing.scraped_text_content,
                    points_of_contact: result.points_of_contact && result.points_of_contact.length > 0
                      ? JSON.stringify(result.points_of_contact)
                      : existing.points_of_contact,
                    deadline: result.deadline || existing.deadline,
                    place_of_performance: result.place_of_performance || existing.place_of_performance,
                    sow_attachment_url: result.sow_attachment_url || existing.sow_attachment_url,
                    sow_attachment_type: result.sow_attachment_type || existing.sow_attachment_type,
                    updated_at: new Date(),
                  },
                })
                return { ...result, id: updated.id }
              } else {
                // Create new record
                const created = await prisma.governmentContractDiscovery.create({
                  data: {
                    google_query: googleQuery.query, // Add Google query from generated query
                    title: result.title,
                    url: result.url,
                    domain: result.domain,
                    snippet: result.snippet || null,
                    document_type: result.document_type || null,
                    notice_id: result.notice_id || null,
                    solicitation_number: result.solicitation_number || null,
                    agency: result.agency || null,
                    naics_codes: JSON.stringify(result.naics_codes || []),
                    set_aside: JSON.stringify(result.set_aside || []),
                    location_mentions: JSON.stringify(result.location_mentions || []),
                    detected_keywords: JSON.stringify(result.detected_keywords || []),
                    relevance_score: result.relevance_score || 0,
                    service_category: result.detected_service_category || searchRequest.serviceCategory || null,
                    ingestion_status: 'discovered',
                    verified: false,
                    sow_attachment_url: result.sow_attachment_url || null,
                    sow_attachment_type: result.sow_attachment_type || null,
                    description: result.description || result.snippet || null,
                    scraped_text_content: result.api_data?.description || result.description || null,
                    points_of_contact: result.points_of_contact && result.points_of_contact.length > 0
                      ? JSON.stringify(result.points_of_contact)
                      : null,
                    deadline: result.deadline || null,
                    place_of_performance: result.place_of_performance || null,
                  },
                })
                return { ...result, id: created.id }
              }
            } catch (error) {
              logger.warn('Error storing individual result', {
                requestId,
                url: result.url,
                error: error instanceof Error ? error.message : String(error),
              })
              return { ...result, id: `temp-${Date.now()}-${Math.random()}` }
            }
          })
        )
      } catch (bulkError) {
        logger.error('Bulk database operation failed', {
          requestId,
          error: bulkError instanceof Error ? bulkError : new Error(String(bulkError)),
        })
        storedResults = unique.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
      }
    } else {
      storedResults = unique.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
    }
    
    logger.info('Search completed successfully', {
      requestId,
      resultsCount: storedResults.length,
      totalRecords: searchResponse.totalRecords,
      cached: searchResponse.cached,
      duration: searchResponse.duration,
    })
    
    return NextResponse.json({
      success: true,
      requestId,
      results: storedResults.map((r: any) => ({
        id: r.id || `temp-${Date.now()}-${Math.random()}`,
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
        document_type: r.document_type,
        notice_id: r.notice_id,
        solicitation_number: r.solicitation_number,
        agency: r.agency,
        naics_codes: Array.isArray(r.naics_codes) ? r.naics_codes : (r.naics_codes || []),
        set_aside: Array.isArray(r.set_aside) ? r.set_aside : (r.set_aside || []),
        location_mentions: Array.isArray(r.location_mentions) ? r.location_mentions : (r.location_mentions || []),
        detected_keywords: Array.isArray(r.detected_keywords) ? r.detected_keywords : (r.detected_keywords || []),
        relevance_score: r.relevance_score || 0,
        detected_service_category: r.detected_service_category,
        ingestion_status: r.ingestion_status || 'discovered',
        verified: r.verified || false,
        validation: r.validation,
      })),
      apiCallDetails: searchResponse.apiCallDetails,
      samGovQuery: searchResponse.samGovQuery,
      googleQuery: googleQuery, // Include Google query in response
      totalRecords: searchResponse.totalRecords,
      resultsCount: storedResults.length,
      cached: searchResponse.cached,
      duration: searchResponse.duration,
      stats: {
        total: searchResponse.results.length,
        valid: validResults.length,
        invalid: invalidResults.length,
        duplicates: duplicates.length,
        unique: storedResults.length,
      },
      // Include error if present (even when success is true, in case of partial failures)
      error: searchResponse.error || undefined,
    })
  } catch (error) {
    logger.error('Unhandled error in unified search', {
      requestId,
      error: error instanceof Error ? error : new Error(String(error)),
    })
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    )
  }
}

