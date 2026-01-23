/**
 * SAM.gov Ingestion Orchestrator
 * Orchestrates the complete ingestion pipeline:
 * 1. Execute all 5 queries (A-E) with full pagination
 * 2. Deduplicate by noticeId
 * 3. Normalize all opportunities
 * 4. Apply hard filters
 * 5. Score all filtered opportunities
 * 6. AI analyze opportunities that passed filters (async, non-blocking)
 * 7. Store in database
 * 8. Return summary stats
 */

import { paginateQuery } from '../sam/samPaginator'
import { buildQuery } from '../sam/samQueries'
import { deduplicateOpportunities } from './dedupe'
import { normalizeOpportunity } from '../sam/samNormalizer'
import { applyHardFilters } from '../filters/hardFilters'
import { scoreOpportunity } from '../scoring/scoreOpportunity'
import { analyzeOpportunitiesBatch } from '../ai/analyzeOpportunity'
import { storeNormalizedOpportunities } from '../store/opportunityStore'
import { MIN_SCORE_THRESHOLD } from '../scoring/scoringConstants'
import { NormalizedOpportunity, IngestionResult, IngestionBatch, SourceQuery as SourceQueryType, AIAnalysisResult } from '../sam/samTypes'
import { SamGovOpportunity } from '../sam-gov-api-v2'
import { prisma } from '../prisma'
import { isSamGovOutage } from '../sam/samClient'
import { enrichOpportunity } from '../services/award-enrichment'
import { scrapeContractPage } from '../contract-scraper'
import { parseContractText, ParsedContract } from '../ai/contract-parser'
import { calculateSmartSortScore, OpportunityWithEnrichment } from '../ai/smartSort'
import { calculateCapabilityScore, loadCompanyCapabilities } from '../scoring/calculateCapabilityScore'
import { CapabilityMatchResult } from '../scoring/capabilityData'
import * as cheerio from 'cheerio'

/**
 * Extract and categorize all links from multiple sources
 */
function extractAllLinks(
  apiLinks?: Array<{ rel?: string; href?: string; type?: string }>,
  additionalInfoLink?: string,
  htmlContent?: string,
  parsedData?: ParsedContract
): Array<{ url: string; type: string; name?: string; description?: string }> {
  const linksMap = new Map<string, { url: string; type: string; name?: string; description?: string }>()
  
  // Helper to categorize link type
  const categorizeLink = (url: string, text?: string): string => {
    const urlLower = url.toLowerCase()
    const textLower = (text || '').toLowerCase()
    const combined = `${urlLower} ${textLower}`
    
    // SOW links
    if (combined.match(/sow|statement\s+of\s+work|pws|performance\s+work\s+statement|work\s+statement|scope\s+of\s+work/)) {
      return 'SOW'
    }
    
    // Attachments (PDF, DOCX, XLSX)
    if (urlLower.match(/\.(pdf|docx?|xlsx?)$/)) {
      return 'Attachment'
    }
    
    // Resources
    if (combined.match(/resource|faq|question|answer|help|guide|manual/)) {
      return 'Resource'
    }
    
    // Additional Info
    if (combined.match(/additional\s+info|more\s+information|details|supplemental/)) {
      return 'Additional Info'
    }
    
    // Default to Resource for unknown links
    return 'Resource'
  }
  
  // Extract from API links
  if (apiLinks) {
    for (const link of apiLinks) {
      if (link.href) {
        const type = categorizeLink(link.href, link.rel || link.type)
        linksMap.set(link.href, {
          url: link.href,
          type,
          name: link.rel || link.type || undefined,
          description: link.type || undefined,
        })
      }
    }
  }
  
  // Extract from additionalInfoLink
  if (additionalInfoLink) {
    const type = categorizeLink(additionalInfoLink)
    linksMap.set(additionalInfoLink, {
      url: additionalInfoLink,
      type,
      name: 'Additional Information',
      description: 'Additional information link',
    })
  }
  
  // Extract from HTML content
  if (htmlContent) {
    try {
      const $ = cheerio.load(htmlContent)
      $('a[href]').each((_, element) => {
        const $link = $(element)
        const href = $link.attr('href')
        const text = $link.text().trim()
        const title = $link.attr('title') || ''
        
        if (href) {
          // Resolve relative URLs
          let fullUrl = href
          if (href.startsWith('/') || href.startsWith('#')) {
            // Skip relative URLs that aren't absolute
            return
          } else if (!href.startsWith('http')) {
            // Skip non-http URLs
            return
          }
          
          const type = categorizeLink(fullUrl, text || title)
          const existing = linksMap.get(fullUrl)
          if (!existing || (text && !existing.name)) {
            linksMap.set(fullUrl, {
              url: fullUrl,
              type,
              name: text || title || undefined,
              description: title || undefined,
            })
          }
        }
      })
    } catch (error) {
      console.warn(`[Ingest] Error extracting links from HTML:`, error)
    }
  }
  
  // Extract from parsed data
  if (parsedData?.links) {
    for (const link of parsedData.links) {
      const existing = linksMap.get(link.url)
      if (!existing || (link.name && !existing.name)) {
        linksMap.set(link.url, {
          url: link.url,
          type: link.type || categorizeLink(link.url),
          name: link.name || undefined,
          description: link.description || undefined,
        })
      }
    }
  }
  
  return Array.from(linksMap.values())
}

/**
 * Generate batch ID for this ingestion run
 */
function generateBatchId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate ingest run ID
 */
function generateIngestRunId(): string {
  return `run-${Date.now()}`
}

/**
 * Get date range for queries
 * Default: Full year 2025 (01/01/2025 to 12/31/2025) per exact specification
 */
function getDateRange(): { from: string; to: string } {
  // Default to full year 2025 per exact specification
  return {
    from: '01/01/2025',
    to: '12/31/2025',
  }
}

/**
 * Execute all 5 queries with full pagination
 */
async function executeAllQueries(): Promise<Map<SourceQueryType, SamGovOpportunity[]>> {
  const { from, to } = getDateRange()
  const results = new Map<SourceQueryType, SamGovOpportunity[]>()
  
  const queries: SourceQueryType[] = ['A', 'B', 'C', 'D', 'E']
  
  for (const sourceQuery of queries) {
    try {
      console.log(`[Ingest] Starting Query ${sourceQuery}`)
      
      const buildQueryFn = (offset: number) => {
        return buildQuery(sourceQuery, from, to, 1000, offset)
      }
      
      const opportunities = await paginateQuery(buildQueryFn, sourceQuery, 1000)
      results.set(sourceQuery, opportunities)
      
      console.log(`[Ingest] Query ${sourceQuery} fetched ${opportunities.length} opportunities`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[Ingest] Query ${sourceQuery} failed:`, errorMessage)
      // Continue with other queries even if one fails
      results.set(sourceQuery, [])
    }
  }
  
  return results
}

/**
 * Update ingestion status in database
 */
async function updateIngestionStatus(
  status: 'running' | 'completed' | 'paused' | 'failed' | 'outage',
  options: {
    batchId?: string
    samGovOutage?: boolean
    outageReason?: string
    error?: string
    metrics?: {
      fetched?: number
      deduplicated?: number
      passedFilters?: number
      scoredAbove50?: number
    }
  } = {}
): Promise<void> {
  try {
    // Get or create status record
    let statusRecord = await prisma.ingestionStatus.findFirst()
    
    const updateData: any = {
      status,
      batch_id: options.batchId,
      updated_at: new Date(),
    }

    if (options.samGovOutage !== undefined) {
      updateData.sam_gov_outage = options.samGovOutage
      if (options.samGovOutage) {
        updateData.sam_gov_outage_detected_at = new Date()
        updateData.sam_gov_outage_reason = options.outageReason
      } else {
        updateData.sam_gov_outage_resolved_at = new Date()
      }
    }

    if (status === 'running') {
      updateData.last_run_started_at = new Date()
    }

    if (status === 'completed' || status === 'failed') {
      updateData.last_run_completed_at = new Date()
      if (options.metrics) {
        updateData.last_fetched = options.metrics.fetched || 0
        updateData.last_deduplicated = options.metrics.deduplicated || 0
        updateData.last_passed_filters = options.metrics.passedFilters || 0
        updateData.last_scored_above_50 = options.metrics.scoredAbove50 || 0
      }
    }

    if (status === 'failed') {
      updateData.last_error = options.error
      updateData.error_count = { increment: 1 }
    }

    if (status === 'completed') {
      const startTime = statusRecord?.last_run_started_at?.getTime()
      if (startTime) {
        updateData.last_run_duration_ms = Date.now() - startTime
      }
    }

    if (statusRecord) {
      await prisma.ingestionStatus.update({
        where: { id: statusRecord.id },
        data: updateData,
      })
    } else {
      await prisma.ingestionStatus.create({
        data: {
          ...updateData,
          status,
          batch_id: options.batchId,
        },
      })
    }
  } catch (error) {
    console.error('[Ingest] Error updating status:', error)
    // Don't throw - status tracking is non-blocking
  }
}

/**
 * Main ingestion function
 */
export async function ingestSamOpportunities(): Promise<IngestionResult> {
  const batchId = generateBatchId()
  const ingestRunId = generateIngestRunId()
  const startTime = Date.now()
  
  console.log(`[Ingest] Starting ingestion batch: ${batchId}`)
  
  // Update status to running
  await updateIngestionStatus('running', { batchId })
  
  try {
    // Stage 1: Execute all 5 queries with full pagination
    console.log(`[Ingest] Stage 1: Executing all queries`)
    let queryResults: Map<SourceQueryType, SamGovOpportunity[]>
    
    try {
      queryResults = await executeAllQueries()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check for outage
      if (isSamGovOutage(errorMessage)) {
        console.warn(`[Ingest] SAM.gov outage detected: ${errorMessage}`)
        await updateIngestionStatus('outage', {
          batchId,
          samGovOutage: true,
          outageReason: errorMessage,
        })
        throw new Error(`SAM.gov API outage: ${errorMessage}`)
      }
      
      // Other errors - mark as failed
      await updateIngestionStatus('failed', {
        batchId,
        error: errorMessage,
      })
      throw error
    }
    
    // Clear outage status if we got here
    await updateIngestionStatus('running', {
      batchId,
      samGovOutage: false,
    })
    
    // Combine all results
    const allRawOpportunities: SamGovOpportunity[] = []
    const queryStats: Record<SourceQueryType, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    }
    
    for (const [sourceQuery, opportunities] of queryResults.entries()) {
      allRawOpportunities.push(...opportunities)
      queryStats[sourceQuery] = opportunities.length
      console.log(`[Ingest] Query ${sourceQuery} fetched ${opportunities.length}`)
    }
    
    const totalFetched = allRawOpportunities.length
    console.log(`[Ingest] Total fetched: ${totalFetched}`)
    
    if (totalFetched === 0) {
      return {
        success: true,
        batchId,
        fetched: 0,
        deduplicated: 0,
        passedFilters: 0,
        scoredAbove50: 0,
        batch: {
          batchId,
          ingestedAt: new Date(),
          totalFetched: 0,
          totalDeduplicated: 0,
          totalPassedFilters: 0,
          totalScored: 0,
          totalScoredAbove50: 0,
          queryStats,
        },
      }
    }
    
    // Stage 2: Build source query map before deduplication
    const sourceQueryMap = new Map<string, SourceQueryType[]>()
    for (const [sourceQuery, opportunities] of queryResults.entries()) {
      for (const opp of opportunities) {
        if (opp.noticeId) {
          const existing = sourceQueryMap.get(opp.noticeId) || []
          if (!existing.includes(sourceQuery)) {
            existing.push(sourceQuery)
          }
          sourceQueryMap.set(opp.noticeId, existing)
        }
      }
    }
    
    // Deduplicate by noticeId (simple deduplication of raw opportunities)
    console.log(`[Ingest] Stage 2: Deduplicating`)
    const seenNoticeIds = new Map<string, SamGovOpportunity>()
    for (const opp of allRawOpportunities) {
      if (opp.noticeId && !seenNoticeIds.has(opp.noticeId)) {
        seenNoticeIds.set(opp.noticeId, opp)
      }
    }
    const deduplicatedRaw = Array.from(seenNoticeIds.values())
    const deduplicatedCount = deduplicatedRaw.length
    console.log(
      `[Dedup] Reduced ${totalFetched} to ${deduplicatedCount} unique notices ` +
      `(${totalFetched - deduplicatedCount} duplicates removed)`
    )
    
    // Stage 3: Normalize all opportunities
    console.log(`[Ingest] Stage 3: Normalizing`)
    const normalizedOpportunities: NormalizedOpportunity[] = []
    
    // Normalize each deduplicated opportunity
    for (const rawOpp of deduplicatedRaw) {
      const sourceQueries = sourceQueryMap.get(rawOpp.noticeId || '') || ['A'] // Default to A if not found
      const normalized = normalizeOpportunity(
        rawOpp,
        sourceQueries[0], // Use first source query as primary
        batchId,
        ingestRunId
      )
      // Merge source queries
      normalized.sourceQueries = sourceQueries
      normalizedOpportunities.push(normalized)
    }
    
    console.log(`[Ingest] Normalized ${normalizedOpportunities.length} opportunities`)
    
    // Stage 4: Apply hard filters
    console.log(`[Ingest] Stage 4: Applying hard filters`)
    const filterResult = applyHardFilters(deduplicatedRaw)
    const passedRaw = filterResult.passed
    
    // Map filtered raw opportunities back to normalized
    const passedNormalized = normalizedOpportunities.filter(norm => 
      passedRaw.some(raw => raw.noticeId === norm.noticeId)
    )
    
    console.log(`[Filter] ${filterResult.stats.passed} opportunities passed filters`)
    console.log(`  Discarded:`)
    console.log(`    - NAICS gate: ${filterResult.stats.discarded.naics}`)
    console.log(`    - PSC gate: ${filterResult.stats.discarded.psc}`)
    console.log(`    - Title gate: ${filterResult.stats.discarded.title}`)
    
    // Stage 5: Score all filtered opportunities
    console.log(`[Ingest] Stage 5: Scoring`)
    const scoredOpportunities: Array<{
      normalized: NormalizedOpportunity
      score: number
      aiAnalysis: AIAnalysisResult | null
    }> = passedNormalized.map(normalized => {
      // Find corresponding raw opportunity for scoring
      const rawOpp = passedRaw.find(raw => raw.noticeId === normalized.noticeId)
      if (!rawOpp) {
        // Shouldn't happen, but handle gracefully
        return { normalized, score: 0, aiAnalysis: null }
      }
      
      const scoringResult = scoreOpportunity(rawOpp)
      normalized.rawScore = scoringResult.score
      
      // Determine relevance tier
      if (scoringResult.score >= 70) {
        normalized.relevanceTier = 'high'
      } else if (scoringResult.score >= 40) {
        normalized.relevanceTier = 'medium'
      } else {
        normalized.relevanceTier = 'low'
      }
      
      return {
        normalized,
        score: scoringResult.score,
        aiAnalysis: null as AIAnalysisResult | null, // Will be populated in next stage
      }
    })
    
    const scoredAbove50 = scoredOpportunities.filter(item => item.score >= MIN_SCORE_THRESHOLD).length
    console.log(`[Score] ${scoredAbove50} opportunities scored ≥ ${MIN_SCORE_THRESHOLD}`)
    
    // Stage 6: Store in database (before enrichment so we have records to enrich)
    console.log(`[Ingest] Stage 6: Storing in database`)
    const { created, updated } = await storeNormalizedOpportunities(scoredOpportunities, batchId)
    console.log(`[Ingest] Stored: ${created} created, ${updated} updated`)
    
    // Stage 6.5: Calculate capability matches for high-scoring opportunities (non-blocking)
    console.log(`[Ingest] Stage 6.5: Calculating capability matches`)
    let capabilityMatchCount = 0
    const capabilities = await loadCompanyCapabilities()
    
    // Calculate capability matches for opportunities scoring >= 50
    const opportunitiesForCapabilityMatch = scoredOpportunities.filter(item => item.score >= MIN_SCORE_THRESHOLD)
    
    for (const item of opportunitiesForCapabilityMatch.slice(0, 100)) { // Limit to first 100 to avoid timeout
      try {
        // Find corresponding raw opportunity
        const rawOpp = passedRaw.find(raw => raw.noticeId === item.normalized.noticeId)
        if (!rawOpp) continue
        
        const capabilityMatch = await calculateCapabilityScore(rawOpp, capabilities)
        
        if (capabilityMatch) {
          // Update opportunity with capability match data
          await prisma.governmentContractDiscovery.updateMany({
            where: { notice_id: item.normalized.noticeId },
            data: {
              capability_match_score: capabilityMatch.overallScore,
              matched_resume_skills: JSON.stringify(capabilityMatch.resumeMatch.matchedSkills),
              matched_services: JSON.stringify(capabilityMatch.serviceMatch.matchedServices),
              matched_showcases: JSON.stringify(capabilityMatch.showcaseMatch.matchedShowcases),
              primary_pillar: capabilityMatch.pillarMatch.primaryPillar || null,
              capability_match_breakdown: JSON.stringify({
                resume: capabilityMatch.resumeMatch.score,
                service: capabilityMatch.serviceMatch.score,
                showcase: capabilityMatch.showcaseMatch.score,
                pillar: capabilityMatch.pillarMatch.score
              }),
              capability_match_calculated_at: new Date(),
            },
          })
          capabilityMatchCount++
        }
      } catch (error) {
        console.error(`[Ingest] Error calculating capability match for ${item.normalized.noticeId}:`, error)
        // Continue with other opportunities
      }
    }
    
    console.log(`[Ingest] Calculated capability matches for ${capabilityMatchCount} opportunities`)
    
    // Stage 7: USAspending enrichment with Entity API (BEFORE AI Analysis, as per diagram)
    // Enrich high-scoring opportunities (score ≥ 70) to provide competitive intelligence for AI
    console.log(`[Ingest] Stage 7: USAspending enrichment with Entity API (before AI analysis)`)
    const highScoringOpportunities = scoredOpportunities.filter(item => item.score >= 70)
    let enrichedCount = 0
    
    for (const item of highScoringOpportunities) {
      try {
        // Find the stored opportunity record
        const opportunity = await prisma.governmentContractDiscovery.findFirst({
          where: { notice_id: item.normalized.noticeId },
        })
        
        if (opportunity && !opportunity.usaspending_enrichment) {
          try {
            // Enrich with USAspending + Entity API (enriches vendor metadata via Entity API)
            const enrichment = await enrichOpportunity(opportunity.id, {
              limit: 10,
              useDatabase: false, // Call USAspending API directly for turnkey solution
              createLinks: true,
            })
            
            if (enrichment) {
              // Store enrichment result
              await prisma.governmentContractDiscovery.update({
                where: { id: opportunity.id },
                data: {
                  usaspending_enrichment: JSON.stringify(enrichment),
                  usaspending_enriched_at: new Date(),
                  usaspending_enrichment_status: 'completed',
                },
              })
              enrichedCount++
            }
          } catch (enrichError) {
            console.error(`[Ingest] Error enriching opportunity ${item.normalized.noticeId}:`, enrichError)
            // Continue with next opportunity
          }
        }
      } catch (error) {
        console.error(`[Ingest] Error processing enrichment for opportunity:`, error)
        // Continue with next opportunity
      }
    }
    
    console.log(`[Ingest] Auto-enriched ${enrichedCount} high-scoring opportunities`)
    
    // Stage 7.5: Scrape and AI parse ALL opportunities that passed filters
    // This ensures we have comprehensive HTML content for all Contract Detail pages
    console.log(`[Ingest] Stage 7.5: Scraping and AI parsing all filtered opportunities`)
    const opportunitiesToScrape = scoredOpportunities // Scrape all opportunities that passed filters
    console.log(`[Ingest] Found ${opportunitiesToScrape.length} opportunities to scrape (all filtered opportunities)`)
    
    let scrapedCount = 0
    let parsedCount = 0
    let skippedCount = 0
    let errorCount = 0
    let alreadyScrapedCount = 0
    let noUrlCount = 0
    let notFoundCount = 0
    
    // Process opportunities with a small delay to avoid rate limiting
    const BATCH_SIZE = 10
    const DELAY_MS = 500 // 500ms delay between batches
    
    for (let i = 0; i < opportunitiesToScrape.length; i++) {
      const item = opportunitiesToScrape[i]
      
      // Add delay between batches to avoid overwhelming SAM.gov
      if (i > 0 && i % BATCH_SIZE === 0) {
        console.log(`[Ingest] Processed ${i}/${opportunitiesToScrape.length}, pausing ${DELAY_MS}ms...`)
        await new Promise(resolve => setTimeout(resolve, DELAY_MS))
      }
      try {
        const opportunity = await prisma.governmentContractDiscovery.findFirst({
          where: { notice_id: item.normalized.noticeId },
        })
        
        if (!opportunity) {
          notFoundCount++
          console.warn(`[Ingest] Opportunity ${item.normalized.noticeId} not found in database`)
          continue
        }
        
        // Check if already scraped AND has actual content
        // If scraped but no content, re-scrape to get the HTML/text
        if (opportunity.scraped && opportunity.scraped_html_content && opportunity.scraped_text_content) {
          alreadyScrapedCount++
          // Log first few to understand why they're already scraped
          if (alreadyScrapedCount <= 3) {
            console.log(`[Ingest] Skipping ${item.normalized.noticeId}: Already scraped with content at ${opportunity.scraped_at}`)
          }
          continue
        }
        
        // If marked as scraped but missing content, log and re-scrape
        if (opportunity.scraped && (!opportunity.scraped_html_content || !opportunity.scraped_text_content)) {
          console.log(`[Ingest] Re-scraping ${item.normalized.noticeId}: Marked as scraped but missing content`)
        }
        
        // Determine URL to scrape - prefer uiLink, fallback to url field, then construct from noticeId
        let urlToScrape = item.normalized.uiLink || opportunity.url
        if (!urlToScrape && item.normalized.noticeId) {
          urlToScrape = `https://sam.gov/opp/${item.normalized.noticeId}`
        }
        
        if (!urlToScrape || !urlToScrape.startsWith('http')) {
          noUrlCount++
          console.warn(`[Ingest] Skipping ${item.normalized.noticeId}: Invalid URL: ${urlToScrape}`)
          continue
        }
        
        // Scrape the contract page
        console.log(`[Ingest] Scraping ${item.normalized.noticeId} (score: ${item.score}): ${urlToScrape}`)
          const scrapeResult = await scrapeContractPage(urlToScrape, {
            description: item.normalized.rawPayload?.description || opportunity.description || undefined,
            links: item.normalized.rawPayload?.links,
            additionalInfoLink: item.normalized.rawPayload?.additionalInfoLink,
            title: item.normalized.title || opportunity.title || undefined,
          })
          
          if (scrapeResult.success) {
            // Save scraped content (even if it's just API data fallback)
            await prisma.governmentContractDiscovery.update({
              where: { id: opportunity.id },
              data: {
                scraped: true,
                scraped_at: new Date(),
                scraped_html_content: scrapeResult.htmlContent || null,
                scraped_text_content: scrapeResult.textContent || null,
                sow_attachment_url: scrapeResult.sowAttachmentUrl || null,
                sow_attachment_type: scrapeResult.sowAttachmentType || null,
                // Update description if we got better content from scraping
                description: scrapeResult.textContent && scrapeResult.textContent.length > (opportunity.description?.length || 0)
                  ? scrapeResult.textContent.substring(0, 10000) // Store first 10k chars
                  : opportunity.description,
              },
            })
            scrapedCount++
            
            if (scrapeResult.htmlContent) {
              console.log(`[Ingest] Successfully scraped HTML for ${item.normalized.noticeId} (${scrapeResult.htmlContent.length} chars)`)
            } else if (scrapeResult.textContent) {
              console.log(`[Ingest] Using API fallback for ${item.normalized.noticeId} (${scrapeResult.textContent.length} chars)`)
            }
            
            // AI parse the scraped text if available
            if (scrapeResult.textContent && scrapeResult.textContent.length > 500) {
              try {
                console.log(`[Ingest] AI parsing ${item.normalized.noticeId}`)
                const parsedData = await parseContractText(scrapeResult.textContent)
                
                if (parsedData) {
                  // Extract all links from multiple sources
                  const allLinks = extractAllLinks(
                    item.normalized.rawPayload?.links,
                    item.normalized.rawPayload?.additionalInfoLink,
                    scrapeResult.htmlContent,
                    parsedData
                  )
                  
                  // Update with parsed data
                  await prisma.governmentContractDiscovery.update({
                    where: { id: opportunity.id },
                    data: {
                      aiParsedData: JSON.stringify(parsedData),
                      aiParsedAt: new Date(),
                      // Update fields from parsed data if they're missing or more complete
                      description: parsedData.summary || opportunity.description || null,
                      deadline: parsedData.deadline || opportunity.deadline || null,
                      place_of_performance: parsedData.location || opportunity.place_of_performance || null,
                      estimated_value: parsedData.estimatedValue || parsedData.budget || opportunity.estimated_value || null,
                      period_of_performance: parsedData.performancePeriod || parsedData.timeline || opportunity.period_of_performance || null,
                      requirements: parsedData.requirements.length > 0 
                        ? JSON.stringify(parsedData.requirements) 
                        : opportunity.requirements || null,
                      // Update NAICS if parsed data has more codes
                      naics_codes: parsedData.naicsCodes.length > 0
                        ? JSON.stringify(parsedData.naicsCodes)
                        : opportunity.naics_codes,
                      // Update set-aside if parsed data has more info
                      set_aside: parsedData.setAside.length > 0
                        ? JSON.stringify(parsedData.setAside)
                        : opportunity.set_aside,
                      // Store all extracted links
                      resource_links: allLinks.length > 0 ? JSON.stringify(allLinks) : null,
                      // Update POC from parsed data if available
                      points_of_contact: parsedData.pointsOfContact && parsedData.pointsOfContact.length > 0
                        ? JSON.stringify(parsedData.pointsOfContact)
                        : opportunity.points_of_contact || null,
                    },
                  })
                  parsedCount++
                } else {
                  // Even if parsing fails, extract links from API and HTML
                  const allLinks = extractAllLinks(
                    item.normalized.rawPayload?.links,
                    item.normalized.rawPayload?.additionalInfoLink,
                    scrapeResult.htmlContent
                  )
                  
                  if (allLinks.length > 0) {
                    await prisma.governmentContractDiscovery.update({
                      where: { id: opportunity.id },
                      data: {
                        resource_links: JSON.stringify(allLinks),
                      },
                    })
                  }
                }
              } catch (parseError) {
                console.error(`[Ingest] Error parsing ${item.normalized.noticeId}:`, parseError)
                // Continue - scraping is still valuable even if parsing fails
              }
            }
          } else {
            // Scraping failed - log the error
            console.warn(`[Ingest] Scraping failed for ${item.normalized.noticeId}: ${scrapeResult.error || 'Unknown error'}`)
            errorCount++
          }
        } catch (scrapeError) {
          console.error(`[Ingest] Error scraping ${item.normalized.noticeId}:`, scrapeError)
          errorCount++
          // Continue with next opportunity
        }
    }
    
    console.log(`[Ingest] Scraping complete: ${scrapedCount} scraped, ${parsedCount} parsed`)
    console.log(`[Ingest] Scraping stats: ${alreadyScrapedCount} already scraped, ${notFoundCount} not found, ${noUrlCount} no URL, ${errorCount} errors`)
    
    // Stage 8: AI analyze opportunities with enrichment context (as per diagram: Enrichment → AI Analysis → Executive Summaries)
    console.log(`[Ingest] Stage 8: AI analysis with enrichment context (Executive Summaries)`)
    const aiAnalysisMap = await analyzeOpportunitiesBatch(passedNormalized)
    
    // Attach AI analysis to scored opportunities
    for (const item of scoredOpportunities) {
      const analysis = aiAnalysisMap.get(item.normalized.noticeId)
      if (analysis) {
        item.aiAnalysis = analysis
        // Extract tags from AI analysis
        item.normalized.aiTags = [
          ...analysis.capabilityMatch,
          analysis.recommendedAction,
        ]
      }
    }
    
    // Update stored opportunities with AI analysis (including summaries that now have enrichment context)
    if (aiAnalysisMap.size > 0) {
      console.log(`[Ingest] Updating ${aiAnalysisMap.size} opportunities with AI analysis`)
      for (const [noticeId, analysis] of aiAnalysisMap.entries()) {
        try {
          await prisma.governmentContractDiscovery.updateMany({
            where: { notice_id: noticeId },
            data: {
              aiSummary: analysis.relevanceSummary,
              aiAnalysis: JSON.stringify(analysis), // Store complete analysis as JSON
              aiRecommendedActions: JSON.stringify([analysis.recommendedAction]),
              competitive_landscape_summary: analysis.competitiveLandscape?.marketTrends || 
                analysis.competitiveLandscape?.vendorDominance || null,
              incumbent_vendors: analysis.competitiveLandscape?.likelyIncumbents 
                ? JSON.stringify(analysis.competitiveLandscape.likelyIncumbents)
                : null,
              aiAnalysisGeneratedAt: new Date(),
            },
          })
        } catch (error) {
          console.error(`[Ingest] Error updating AI analysis for ${noticeId}:`, error)
        }
      }
    }
    
    // Stage 9: Calculate smart sort scores for high-scoring, fully enriched opportunities (optional optimization)
    console.log(`[Ingest] Stage 9: Calculating smart sort scores for high-scoring opportunities`)
    let smartSortCount = 0
    
    // Only calculate for opportunities that have been fully enriched (score >= 70, scraped, parsed, and enriched)
    const fullyEnrichedOpportunities = await prisma.governmentContractDiscovery.findMany({
      where: {
        relevance_score: { gte: 70 },
        scraped: true,
        aiParsedData: { not: null },
        usaspending_enrichment_status: 'completed',
        smart_sort_score: null, // Only calculate if not already cached
      },
      take: 50, // Limit to 50 per ingestion run to avoid rate limits
    })
    
    for (const opportunity of fullyEnrichedOpportunities) {
      try {
        // Parse enriched data
        const parsedData = opportunity.aiParsedData
          ? typeof opportunity.aiParsedData === 'string'
            ? JSON.parse(opportunity.aiParsedData)
            : opportunity.aiParsedData
          : null

        const usaspendingEnrichment = opportunity.usaspending_enrichment
          ? typeof opportunity.usaspending_enrichment === 'string'
            ? JSON.parse(opportunity.usaspending_enrichment)
            : opportunity.usaspending_enrichment
          : null

        const smartSortResult = await calculateSmartSortScore({
          opportunity: opportunity as OpportunityWithEnrichment,
          enrichedData: {
            scrapedContent: opportunity.scraped_text_content || undefined,
            parsedData,
            usaspendingEnrichment,
          },
        })

        // Store smart sort score
        await prisma.governmentContractDiscovery.update({
          where: { id: opportunity.id },
          data: {
            smart_sort_score: smartSortResult.smartScore,
            smart_sort_reasoning: smartSortResult.reasoning,
            smart_sort_calculated_at: new Date(),
          },
        })

        smartSortCount++
      } catch (error) {
        console.error(`[Ingest] Error calculating smart sort for ${opportunity.notice_id}:`, error)
        // Continue with next opportunity
      }
    }
    
    console.log(`[Ingest] Calculated smart sort scores for ${smartSortCount} opportunities`)
    
    const duration = Date.now() - startTime
    console.log(`[Ingest] Ingestion completed in ${duration}ms`)
    
    // Update status to completed
    await updateIngestionStatus('completed', {
      batchId,
      metrics: {
        fetched: totalFetched,
        deduplicated: normalizedOpportunities.length,
        passedFilters: filterResult.stats.passed,
        scoredAbove50,
      },
    })
    
    return {
      success: true,
      batchId,
      fetched: totalFetched,
      deduplicated: normalizedOpportunities.length,
      passedFilters: filterResult.stats.passed,
      scoredAbove50,
      batch: {
        batchId,
        ingestedAt: new Date(),
        totalFetched,
        totalDeduplicated: normalizedOpportunities.length,
        totalPassedFilters: filterResult.stats.passed,
        totalScored: scoredOpportunities.length,
        totalScoredAbove50: scoredAbove50,
        queryStats,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Ingest] Ingestion failed:`, error)
    
    // Check if it's an outage
    const isOutage = isSamGovOutage(errorMessage)
    
    // Update status
    await updateIngestionStatus(isOutage ? 'outage' : 'failed', {
      batchId,
      samGovOutage: isOutage,
      outageReason: isOutage ? errorMessage : undefined,
      error: errorMessage,
    })
    
    return {
      success: false,
      batchId,
      fetched: 0,
      deduplicated: 0,
      passedFilters: 0,
      scoredAbove50: 0,
      error: errorMessage,
      batch: {
        batchId,
        ingestedAt: new Date(),
        totalFetched: 0,
        totalDeduplicated: 0,
        totalPassedFilters: 0,
        totalScored: 0,
        totalScoredAbove50: 0,
        queryStats: {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          E: 0,
        },
      },
    }
  }
}

