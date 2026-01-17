/**
 * AI-Enhanced Smart Sort Service
 * Uses AI to analyze enriched data and generate composite relevance scores for sorting
 */

import { getOpenAIClient, isOpenAIConfigured } from '@/lib/openai'

export interface OpportunityWithEnrichment {
  id: string
  title: string
  agency?: string | null
  relevance_score: number
  deadline?: string | null
  description?: string | null
  estimated_value?: string | null
  period_of_performance?: string | null
  place_of_performance?: string | null
  set_aside?: string | null
  naics_codes?: string | null
  scraped_text_content?: string | null
  aiParsedData?: string | null
  usaspending_enrichment?: string | null
  incumbent_vendors?: string | null
  competitive_landscape_summary?: string | null
}

export interface SmartSortInput {
  opportunity: OpportunityWithEnrichment
  enrichedData: {
    scrapedContent?: string
    parsedData?: any
    usaspendingEnrichment?: any
    entityApiData?: any
  }
}

export interface SmartSortResult {
  smartScore: number // 0-100 composite score
  reasoning: string // Why this contract ranks high/low
  factors: string[] // Key factors (e.g., "High budget", "SDVOSB eligible", "Strong incumbent data")
}

/**
 * Calculate smart sort score using AI analysis of enriched data
 */
export async function calculateSmartSortScore(
  input: SmartSortInput
): Promise<SmartSortResult> {
  if (!isOpenAIConfigured()) {
    console.warn('OpenAI not configured, using fallback scoring')
    return {
      smartScore: input.opportunity.relevance_score,
      reasoning: 'AI scoring unavailable, using base relevance score',
      factors: [],
    }
  }

  try {
    const openai = getOpenAIClient()

    // Prepare context from enriched data
    const contextParts: string[] = []
    
    if (input.enrichedData.parsedData) {
      contextParts.push(`Parsed Contract Data: ${JSON.stringify(input.enrichedData.parsedData, null, 2)}`)
    }
    
    if (input.enrichedData.scrapedContent) {
      contextParts.push(`Scraped Content (excerpt): ${input.enrichedData.scrapedContent.substring(0, 2000)}`)
    }
    
    if (input.enrichedData.usaspendingEnrichment) {
      contextParts.push(`USAspending Enrichment: ${JSON.stringify(input.enrichedData.usaspendingEnrichment, null, 2)}`)
    }
    
    if (input.opportunity.competitive_landscape_summary) {
      contextParts.push(`Competitive Landscape: ${input.opportunity.competitive_landscape_summary}`)
    }
    
    if (input.opportunity.incumbent_vendors) {
      try {
        const vendors = JSON.parse(input.opportunity.incumbent_vendors)
        if (Array.isArray(vendors) && vendors.length > 0) {
          contextParts.push(`Likely Incumbents: ${vendors.join(', ')}`)
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    const context = contextParts.join('\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert federal capture analyst for MacTech Solutions, a SDVOSB/VOSB technology services company specializing in cybersecurity, infrastructure, compliance, and RMF services.

Analyze the provided contract opportunity and enriched data to generate a composite "Smart Sort" score (0-100) that considers:

1. **Budget/Value** (0-25 points): Higher scores for larger contracts, clear budget indicators
2. **Set-Aside Eligibility** (0-20 points): SDVOSB/VOSB set-asides get maximum points, other set-asides get partial
3. **Competitive Landscape** (0-20 points): Lower competition (fewer incumbents, less vendor dominance) = higher score
4. **Technical Fit** (0-20 points): Alignment with MacTech capabilities (cybersecurity, RMF, infrastructure, compliance)
5. **Urgency/Timeline** (0-15 points): Near-term deadlines, clear timelines, active procurement = higher score

Return JSON with this exact structure:
{
  "smartScore": 0-100,
  "reasoning": "Brief explanation of the score (2-3 sentences)",
  "factors": ["factor1", "factor2", ...] // Key factors that influenced the score
}

Be specific and cite data sources. If data is missing, note it in reasoning.`,
        },
        {
          role: 'user',
          content: `Contract Opportunity:
Title: ${input.opportunity.title}
Agency: ${input.opportunity.agency || 'N/A'}
Base Relevance Score: ${input.opportunity.relevance_score}/100
Deadline: ${input.opportunity.deadline || 'N/A'}
Estimated Value: ${input.opportunity.estimated_value || 'N/A'}
Period of Performance: ${input.opportunity.period_of_performance || 'N/A'}
Set-Aside: ${input.opportunity.set_aside || 'N/A'}
NAICS: ${input.opportunity.naics_codes || 'N/A'}
Description: ${input.opportunity.description?.substring(0, 500) || 'N/A'}

${context ? `\nEnriched Data:\n${context}` : '\nNo enriched data available.'}

Calculate the Smart Sort score considering all available data.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const parsed = JSON.parse(content) as SmartSortResult

    // Validate and normalize
    return {
      smartScore: Math.max(0, Math.min(100, parsed.smartScore || input.opportunity.relevance_score)),
      reasoning: parsed.reasoning || 'AI analysis completed',
      factors: Array.isArray(parsed.factors) ? parsed.factors : [],
    }
  } catch (error) {
    console.error('Error calculating smart sort score:', error)
    // Fallback to base relevance score
    return {
      smartScore: input.opportunity.relevance_score,
      reasoning: 'AI scoring failed, using base relevance score',
      factors: [],
    }
  }
}

/**
 * Batch calculate smart sort scores for multiple opportunities
 */
export async function calculateSmartSortScoresBatch(
  opportunities: OpportunityWithEnrichment[]
): Promise<Map<string, SmartSortResult>> {
  const results = new Map<string, SmartSortResult>()

  // Process in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < opportunities.length; i += batchSize) {
    const batch = opportunities.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map(async (opp) => {
        try {
          // Parse enriched data
          const parsedData = opp.aiParsedData
            ? typeof opp.aiParsedData === 'string'
              ? JSON.parse(opp.aiParsedData)
              : opp.aiParsedData
            : null

          const usaspendingEnrichment = opp.usaspending_enrichment
            ? typeof opp.usaspending_enrichment === 'string'
              ? JSON.parse(opp.usaspending_enrichment)
              : opp.usaspending_enrichment
            : null

          const result = await calculateSmartSortScore({
            opportunity: opp,
            enrichedData: {
              scrapedContent: opp.scraped_text_content || undefined,
              parsedData,
              usaspendingEnrichment,
            },
          })

          results.set(opp.id, result)
        } catch (error) {
          console.error(`Error calculating smart sort for opportunity ${opp.id}:`, error)
          // Use fallback score
          results.set(opp.id, {
            smartScore: opp.relevance_score,
            reasoning: 'Calculation failed',
            factors: [],
          })
        }
      })
    )

    // Small delay between batches to respect rate limits
    if (i + batchSize < opportunities.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

