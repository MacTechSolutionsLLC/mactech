/**
 * AI Opportunity Analyzer
 * Analyzes opportunities that passed hard filters using OpenAI
 * Returns structured analysis results
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai'
import { NormalizedOpportunity, AIAnalysisResult } from '../sam/samTypes'
import { prisma } from '../prisma'

/**
 * Enhanced AI Analysis Result with relevance score and USAspending context
 */
export interface EnhancedAIAnalysisResult extends AIAnalysisResult {
  relevanceScore?: number // 0-100 relevance score
  relevanceReasoning?: string // Explanation of the score
  whyThisMatters?: string // Plain-English explanation for executives
  competitiveLandscape?: {
    likelyIncumbents?: string[]
    marketTrends?: string
    vendorDominance?: string
  }
  dataSources?: string[] // Citations: 'SAM.gov', 'USAspending.gov', etc.
}

/**
 * Analyze an opportunity using AI with USAspending context
 * Non-blocking - returns null if AI is not configured or fails
 * 
 * @param opportunity - Normalized opportunity to analyze
 * @param includeUSAspendingContext - Whether to include USAspending enrichment data
 * @returns Enhanced AI analysis result or null if analysis fails
 */
export async function analyzeOpportunity(
  opportunity: NormalizedOpportunity,
  includeUSAspendingContext: boolean = true
): Promise<EnhancedAIAnalysisResult | null> {
  if (!isOpenAIConfigured()) {
    console.warn('[AI Analyzer] OpenAI not configured, skipping analysis')
    return null
  }

  try {
    const openai = getOpenAIClient()

    // Get USAspending enrichment if available (as per diagram: Enrichment → AI Analysis → Executive Summaries)
    let usaspendingContext = ''
    let entityApiContext = ''
    const dataSources: string[] = ['SAM.gov']
    
    if (includeUSAspendingContext) {
      try {
        const opportunityRecord = await prisma.governmentContractDiscovery.findFirst({
          where: { notice_id: opportunity.noticeId },
        })
        
        if (opportunityRecord?.usaspending_enrichment) {
          const enrichment = JSON.parse(opportunityRecord.usaspending_enrichment)
          dataSources.push('USAspending.gov')
          
          if (enrichment.statistics) {
            const stats = enrichment.statistics
            usaspendingContext = `
USAspending.gov Historical Data:
- Similar awards found: ${stats.count || 0}
- Average award value: ${stats.average_obligation ? `$${stats.average_obligation.toLocaleString()}` : 'N/A'}
- Award range: ${stats.min_obligation ? `$${stats.min_obligation.toLocaleString()}` : 'N/A'} - ${stats.max_obligation ? `$${stats.max_obligation.toLocaleString()}` : 'N/A'}
- Previous awardees: ${stats.unique_recipients?.slice(0, 5).join(', ') || 'N/A'}
- Awarding agencies: ${stats.unique_agencies?.slice(0, 3).join(', ') || 'N/A'}
            `.trim()
          }
          
          // Extract Entity API enrichment data (vendor metadata from Entity API)
          if (enrichment.similar_awards && Array.isArray(enrichment.similar_awards)) {
            const enrichedVendors = enrichment.similar_awards
              .filter((award: any) => award.recipient_entity_data)
              .map((award: any) => {
                const entity = award.recipient_entity_data
                const vendorInfo = [
                  `Vendor: ${award.recipient?.name || 'Unknown'}`,
                  entity.entityName ? `Entity Name: ${entity.entityName}` : null,
                  entity.registrationStatus ? `Status: ${entity.registrationStatus}` : null,
                  entity.socioEconomicStatus?.length > 0 
                    ? `Certifications: ${entity.socioEconomicStatus.join(', ')}` 
                    : null,
                  entity.naicsCodes?.length > 0 
                    ? `NAICS: ${entity.naicsCodes.map((n: any) => n.naicsCode || n).join(', ')}` 
                    : null,
                ].filter(Boolean).join('; ')
                return vendorInfo
              })
              .slice(0, 5)
            
            if (enrichedVendors.length > 0) {
              dataSources.push('SAM.gov Entity API')
              entityApiContext = `
Contextual SAM.gov Entity API information (non-authoritative):
${enrichedVendors.map((v: string, i: number) => `${i + 1}. ${v}`).join('\n')}

Note: USAspending.gov remains the source of truth for incumbents, award history, competitive landscape, and recompete signals. Entity API data is contextual enrichment only.
              `.trim()
            }
          }
        }
      } catch (e) {
        // Ignore errors fetching enrichment
        console.warn(`[AI Analyzer] Could not fetch USAspending/Entity API context:`, e)
      }
    }

    // Build context from opportunity
    const context = `
Title: ${opportunity.title}
Agency: ${opportunity.agencyPath}
NAICS: ${opportunity.naics.all.join(', ') || 'Not specified'}
Set-Aside: ${opportunity.setAside || 'None'}
Type: ${opportunity.type}
Posted Date: ${opportunity.postedDate}
Deadline: ${opportunity.responseDeadline || 'Not specified'}
Description: ${opportunity.rawPayload.description?.substring(0, 2000) || 'No description available'}
${usaspendingContext ? `\n${usaspendingContext}` : ''}
${entityApiContext ? `\n${entityApiContext}` : ''}
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert government contract analyst specializing in DoD and federal cybersecurity contracts. 
Analyze this SAM.gov opportunity and provide structured insights with explainable reasoning.

Return JSON with this exact structure:
{
  "relevanceSummary": "2-3 sentence executive summary of why this opportunity is relevant or not",
  "relevanceScore": 85,  // 0-100 score indicating relevance to MacTech Solutions
  "relevanceReasoning": "Explanation of the relevance score based on capability match, set-aside eligibility, and market opportunity",
  "whyThisMatters": "Plain-English explanation for executives: why should we pursue this opportunity?",
  "recommendedAction": "prime" | "sub" | "monitor" | "ignore",
  "capabilityMatch": ["capability1", "capability2", ...],
  "risks": ["risk1", "risk2", ...],
  "competitiveLandscape": {
    "likelyIncumbents": ["vendor1", "vendor2", ...],  // Based on USAspending data if available
    "marketTrends": "Brief description of market trends",
    "vendorDominance": "Description of vendor dominance in this space"
  }
}

Focus on:
- SDVOSB/VOSB set-aside eligibility (MacTech is SDVOSB/VOSB certified)
- RMF, cybersecurity, compliance requirements (MacTech's core capabilities)
- Technical skills and certifications needed
- Budget and timeline feasibility
- Competitive landscape considerations (use USAspending data if provided)
- Likely incumbents from historical awards

CRITICAL DATA SOURCE RULES:
- USAspending.gov is the SOLE source of truth for incumbents, award history, competitive landscape, and recompete signals
- SAM.gov Entity API data is CONTEXTUAL ONLY (non-authoritative enrichment)
- Do NOT infer absence of entity data as risk
- Do NOT infer small/large business status, certifications, or capabilities from entity data absence
- Do NOT override USAspending data with Entity API data
- Entity API data may be referenced as contextual information only

Be concise, actionable, and cite data sources (SAM.gov, USAspending.gov as primary source of truth, SAM.gov Entity API as contextual enrichment only).`,
        },
        {
          role: 'user',
          content: `Analyze this opportunity:\n\n${context}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const analysis = JSON.parse(content) as EnhancedAIAnalysisResult

    // Validate structure
    if (!analysis.relevanceSummary || !analysis.recommendedAction) {
      throw new Error('Invalid AI analysis structure')
    }

    // Ensure arrays exist
    analysis.capabilityMatch = analysis.capabilityMatch || []
    analysis.risks = analysis.risks || []
    analysis.dataSources = dataSources
    analysis.competitiveLandscape = analysis.competitiveLandscape || {}
    
    // Ensure relevance score is in valid range
    if (analysis.relevanceScore !== undefined) {
      analysis.relevanceScore = Math.max(0, Math.min(100, analysis.relevanceScore))
    }

    console.log(`[AI Analyzer] Analyzed opportunity ${opportunity.noticeId} (score: ${analysis.relevanceScore || 'N/A'})`)
    return analysis
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[AI Analyzer] Error analyzing opportunity ${opportunity.noticeId}:`, errorMessage)
    // Non-blocking - return null on failure
    return null
  }
}

/**
 * Analyze multiple opportunities in batch
 * Auto-generates summaries for high-scoring opportunities (score ≥ 70)
 * Processes sequentially to avoid rate limits
 * 
 * @param opportunities - Array of normalized opportunities
 * @param autoGenerateForHighScoring - Auto-generate summaries for score ≥ 70 (default: true)
 * @returns Map of noticeId to AI analysis result
 */
export async function analyzeOpportunitiesBatch(
  opportunities: NormalizedOpportunity[],
  autoGenerateForHighScoring: boolean = true
): Promise<Map<string, EnhancedAIAnalysisResult>> {
  const results = new Map<string, EnhancedAIAnalysisResult>()

  if (!isOpenAIConfigured()) {
    console.warn('[AI Analyzer] OpenAI not configured, skipping batch analysis')
    return results
  }

  console.log(`[AI Analyzer] Starting batch analysis of ${opportunities.length} opportunities`)

  // Filter to high-scoring opportunities if auto-generating
  const opportunitiesToAnalyze = autoGenerateForHighScoring
    ? opportunities.filter(opp => {
        // Check if opportunity has a high score (from scoring stage)
        // We'll analyze all for now, but could filter by score if available
        return true
      })
    : opportunities

  for (let i = 0; i < opportunitiesToAnalyze.length; i++) {
    const opportunity = opportunitiesToAnalyze[i]
    
    // Only auto-analyze if score ≥ 70 (check from opportunity record if available)
    if (autoGenerateForHighScoring) {
      try {
        const opportunityRecord = await prisma.governmentContractDiscovery.findFirst({
          where: { notice_id: opportunity.noticeId },
          select: { relevance_score: true },
        })
        
        // Skip if score is below 70
        if (opportunityRecord && opportunityRecord.relevance_score < 70) {
          continue
        }
      } catch (e) {
        // If we can't check, proceed with analysis
      }
    }
    
    const analysis = await analyzeOpportunity(opportunity, true)

    if (analysis) {
      results.set(opportunity.noticeId, analysis)
      
      // Store enhanced analysis in database
      try {
        await prisma.governmentContractDiscovery.updateMany({
          where: { notice_id: opportunity.noticeId },
          data: {
            aiAnalysis: JSON.stringify(analysis),
            aiSummary: analysis.relevanceSummary,
            aiAnalysisGeneratedAt: new Date(),
            // Store relevance score if available
            ...(analysis.relevanceScore !== undefined && {
              relevance_score: Math.round(analysis.relevanceScore),
            }),
            // Store competitive landscape summary
            competitive_landscape_summary: analysis.competitiveLandscape
              ? JSON.stringify(analysis.competitiveLandscape)
              : null,
          },
        })
      } catch (e) {
        console.warn(`[AI Analyzer] Could not store analysis for ${opportunity.noticeId}:`, e)
      }
    }

    // Small delay between requests to avoid rate limits
    if (i < opportunitiesToAnalyze.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[AI Analyzer] Processed ${i + 1}/${opportunitiesToAnalyze.length} opportunities`)
    }
  }

  console.log(`[AI Analyzer] Completed batch analysis: ${results.size}/${opportunitiesToAnalyze.length} successful`)
  return results
}

