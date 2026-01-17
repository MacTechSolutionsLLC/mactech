/**
 * AI Analysis Service for USAspending Enrichment Data
 * Analyzes enriched historical award data to generate strategic insights,
 * competitive intelligence, and production-ready deliverables
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai'
import { EnrichmentResult } from '../services/award-enrichment'
import { prisma } from '../prisma'

export interface StrategicInsights {
  competitive_positioning: string
  win_probability: number // 0-100
  win_probability_reasoning: string
  pricing_recommendation: string
  key_differentiators: string[]
  market_opportunity: string
}

export interface CompetitiveIntelligence {
  past_winners_analysis: string
  competitor_patterns: string[]
  agency_preferences: string
  market_dynamics: string
  competitive_landscape: string
}

export interface Deliverables {
  executive_summary: string
  competitive_brief: string
  pricing_strategy: string
  proposal_guidance: string
  risk_assessment: string
}

export interface ComparativeAnalysis {
  similarity_score: number // 0-100
  similarity_explanation: string
  deviations: string[]
  opportunity_sizing: string
  feasibility_assessment: string
}

export interface EnrichmentAnalysisResult {
  analyzed_at: string
  strategic_insights: StrategicInsights
  competitive_intelligence: CompetitiveIntelligence
  deliverables: Deliverables
  comparative_analysis: ComparativeAnalysis
}

/**
 * Analyze enriched data to generate strategic insights
 */
export async function analyzeEnrichmentStrategic(
  opportunityId: string,
  enrichment: EnrichmentResult
): Promise<StrategicInsights | null> {
  if (!isOpenAIConfigured()) {
    console.warn('[AI Enrichment] OpenAI not configured, skipping strategic analysis')
    return null
  }

  try {
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    const openai = getOpenAIClient()

    // Build context from opportunity and enrichment data
    const context = `
Contract Opportunity:
- Title: ${opportunity.title}
- Agency: ${opportunity.agency || 'Unknown'}
- NAICS Codes: ${opportunity.naics_codes}
- Set-Aside: ${opportunity.set_aside}
- Description: ${opportunity.description?.substring(0, 1000) || 'N/A'}

Historical Awards Data:
- Similar Awards Found: ${enrichment.statistics.count}
- Average Award Amount: $${enrichment.statistics.average_obligation?.toLocaleString() || 'N/A'}
- Award Range: $${enrichment.statistics.min_obligation?.toLocaleString() || 'N/A'} - $${enrichment.statistics.max_obligation?.toLocaleString() || 'N/A'}
- Past Winners: ${enrichment.statistics.unique_recipients.join(', ') || 'N/A'}
- Agencies: ${enrichment.statistics.unique_agencies.join(', ') || 'N/A'}
- Typical Duration: ${enrichment.trends?.typical_duration || 'N/A'}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert government contract strategist specializing in competitive analysis and bidding strategy. Analyze historical award data to provide strategic insights for winning this contract opportunity.

Return JSON with this exact structure:
{
  "competitive_positioning": "2-3 sentence analysis of our competitive position vs past winners and market",
  "win_probability": 75,  // 0-100 based on historical patterns, our capabilities, and competitive landscape
  "win_probability_reasoning": "Detailed explanation of the win probability score based on historical data",
  "pricing_recommendation": "Specific pricing recommendation with range and reasoning (e.g., 'Recommend $450K-$550K based on historical average of $500K and competitive positioning')",
  "key_differentiators": ["Differentiator 1", "Differentiator 2", "Differentiator 3"],
  "market_opportunity": "Analysis of market opportunity and strategic value"
}

Focus on:
- Comparing our capabilities to past winners
- Identifying competitive advantages
- Pricing strategy based on historical patterns
- Win probability based on market dynamics
- Strategic positioning recommendations`
        },
        {
          role: 'user',
          content: `Analyze this contract opportunity with historical award context:\n\n${context}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const parsed = JSON.parse(content)

    return {
      competitive_positioning: parsed.competitive_positioning || '',
      win_probability: Math.min(100, Math.max(0, parsed.win_probability || 50)),
      win_probability_reasoning: parsed.win_probability_reasoning || '',
      pricing_recommendation: parsed.pricing_recommendation || '',
      key_differentiators: Array.isArray(parsed.key_differentiators) ? parsed.key_differentiators : [],
      market_opportunity: parsed.market_opportunity || '',
    }
  } catch (error) {
    console.error('[AI Enrichment] Error in strategic analysis:', error)
    return null
  }
}

/**
 * Generate competitive intelligence from enriched data
 */
export async function analyzeEnrichmentCompetitive(
  opportunityId: string,
  enrichment: EnrichmentResult
): Promise<CompetitiveIntelligence | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    const openai = getOpenAIClient()

    // Analyze past winners
    const pastWinners = enrichment.statistics.unique_recipients.slice(0, 10)
    const similarAwards = enrichment.similar_awards.slice(0, 5)

    const context = `
Contract Opportunity:
- Title: ${opportunity.title}
- Agency: ${opportunity.agency || 'Unknown'}

Historical Awards Analysis:
- Past Winners: ${pastWinners.join(', ')}
- Number of Similar Awards: ${enrichment.statistics.count}
- Average Award: $${enrichment.statistics.average_obligation?.toLocaleString() || 'N/A'}

Sample Similar Awards:
${similarAwards.map((award, idx) => `
${idx + 1}. ${award.award_type_description || 'Award'} - $${award.total_obligation?.toLocaleString() || 'N/A'}
   Winner: ${award.recipient_name || award.recipient?.name || 'Unknown'}
   Agency: ${award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name || 'Unknown'}
   Date: ${award.awarding_date || award.start_date || 'Unknown'}
`).join('\n')}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a competitive intelligence analyst specializing in government contracting. Analyze historical award data to provide competitive intelligence insights.

Return JSON with this exact structure:
{
  "past_winners_analysis": "Detailed analysis of past winners, their patterns, and market share",
  "competitor_patterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
  "agency_preferences": "Analysis of agency preferences, selection criteria, and patterns",
  "market_dynamics": "Analysis of market dynamics, trends, and competitive landscape",
  "competitive_landscape": "Overview of competitive landscape and key players"
}

Focus on:
- Identifying dominant players and their market share
- Analyzing competitor patterns and strategies
- Understanding agency preferences and selection criteria
- Market trends and dynamics
- Competitive positioning opportunities`
        },
        {
          role: 'user',
          content: `Provide competitive intelligence analysis:\n\n${context}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const parsed = JSON.parse(content)

    return {
      past_winners_analysis: parsed.past_winners_analysis || '',
      competitor_patterns: Array.isArray(parsed.competitor_patterns) ? parsed.competitor_patterns : [],
      agency_preferences: parsed.agency_preferences || '',
      market_dynamics: parsed.market_dynamics || '',
      competitive_landscape: parsed.competitive_landscape || '',
    }
  } catch (error) {
    console.error('[AI Enrichment] Error in competitive analysis:', error)
    return null
  }
}

/**
 * Generate production-ready deliverables
 */
export async function generateEnrichmentDeliverables(
  opportunityId: string,
  enrichment: EnrichmentResult,
  strategicInsights: StrategicInsights,
  competitiveIntelligence: CompetitiveIntelligence
): Promise<Deliverables | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    const openai = getOpenAIClient()

    const context = `
Contract Opportunity:
- Title: ${opportunity.title}
- Agency: ${opportunity.agency || 'Unknown'}
- Description: ${opportunity.description?.substring(0, 1500) || 'N/A'}

Strategic Insights:
- Win Probability: ${strategicInsights.win_probability}%
- Pricing Recommendation: ${strategicInsights.pricing_recommendation}
- Competitive Positioning: ${strategicInsights.competitive_positioning}

Competitive Intelligence:
- Past Winners Analysis: ${competitiveIntelligence.past_winners_analysis}
- Market Dynamics: ${competitiveIntelligence.market_dynamics}

Historical Data:
- Average Award: $${enrichment.statistics.average_obligation?.toLocaleString() || 'N/A'}
- Past Winners: ${enrichment.statistics.unique_recipients.join(', ') || 'N/A'}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a government contract proposal strategist. Generate production-ready deliverables based on contract opportunity analysis and historical award data.

Return JSON with this exact structure:
{
  "executive_summary": "Comprehensive 3-4 paragraph executive summary report covering opportunity overview, competitive landscape, win probability, pricing strategy, and key recommendations",
  "competitive_brief": "Detailed competitive intelligence brief (2-3 paragraphs) analyzing past winners, competitor patterns, agency preferences, and market dynamics",
  "pricing_strategy": "Detailed pricing strategy document (2-3 paragraphs) with recommended pricing range, rationale, and competitive positioning",
  "proposal_guidance": "Actionable proposal guidance (2-3 paragraphs) with key points to emphasize, differentiators to highlight, and proposal structure recommendations",
  "risk_assessment": "Comprehensive risk assessment (2-3 paragraphs) identifying risks, challenges, mitigation strategies, and opportunity factors"
}

Make all deliverables production-ready, professional, and actionable.`
        },
        {
          role: 'user',
          content: `Generate deliverables for this contract opportunity:\n\n${context}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const parsed = JSON.parse(content)

    return {
      executive_summary: parsed.executive_summary || '',
      competitive_brief: parsed.competitive_brief || '',
      pricing_strategy: parsed.pricing_strategy || '',
      proposal_guidance: parsed.proposal_guidance || '',
      risk_assessment: parsed.risk_assessment || '',
    }
  } catch (error) {
    console.error('[AI Enrichment] Error generating deliverables:', error)
    return null
  }
}

/**
 * Perform comparative analysis
 */
export async function analyzeEnrichmentComparative(
  opportunityId: string,
  enrichment: EnrichmentResult
): Promise<ComparativeAnalysis | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    const openai = getOpenAIClient()

    const context = `
Current Opportunity:
- Title: ${opportunity.title}
- Agency: ${opportunity.agency || 'Unknown'}
- NAICS: ${opportunity.naics_codes}
- Description: ${opportunity.description?.substring(0, 1000) || 'N/A'}

Historical Awards:
- Count: ${enrichment.statistics.count}
- Average: $${enrichment.statistics.average_obligation?.toLocaleString() || 'N/A'}
- Range: $${enrichment.statistics.min_obligation?.toLocaleString() || 'N/A'} - $${enrichment.statistics.max_obligation?.toLocaleString() || 'N/A'}
- Typical Duration: ${enrichment.trends?.typical_duration || 'N/A'}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a contract analyst comparing current opportunities to historical awards. Perform comparative analysis.

Return JSON with this exact structure:
{
  "similarity_score": 85,  // 0-100 how similar this opportunity is to historical awards
  "similarity_explanation": "Explanation of similarity score and key similarities",
  "deviations": ["Deviation 1", "Deviation 2", "Deviation 3"],  // How this differs from typical contracts
  "opportunity_sizing": "Analysis of opportunity size, market potential, and value",
  "feasibility_assessment": "Assessment of timeline, budget, and resource feasibility based on historical patterns"
}`
        },
        {
          role: 'user',
          content: `Compare this opportunity to historical awards:\n\n${context}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const parsed = JSON.parse(content)

    return {
      similarity_score: Math.min(100, Math.max(0, parsed.similarity_score || 50)),
      similarity_explanation: parsed.similarity_explanation || '',
      deviations: Array.isArray(parsed.deviations) ? parsed.deviations : [],
      opportunity_sizing: parsed.opportunity_sizing || '',
      feasibility_assessment: parsed.feasibility_assessment || '',
    }
  } catch (error) {
    console.error('[AI Enrichment] Error in comparative analysis:', error)
    return null
  }
}

/**
 * Complete enrichment analysis - runs all AI analysis functions
 */
export async function analyzeEnrichmentComplete(
  opportunityId: string,
  enrichment: EnrichmentResult
): Promise<EnrichmentAnalysisResult | null> {
  try {
    console.log(`[AI Enrichment] Starting complete analysis for ${opportunityId}`)

    // Run all analyses in parallel where possible
    const [strategic, competitive, comparative] = await Promise.all([
      analyzeEnrichmentStrategic(opportunityId, enrichment),
      analyzeEnrichmentCompetitive(opportunityId, enrichment),
      analyzeEnrichmentComparative(opportunityId, enrichment),
    ])

    if (!strategic || !competitive || !comparative) {
      console.warn('[AI Enrichment] Some analyses failed, continuing with available data')
    }

    // Generate deliverables (depends on strategic and competitive)
    let deliverables: Deliverables | null = null
    if (strategic && competitive) {
      deliverables = await generateEnrichmentDeliverables(
        opportunityId,
        enrichment,
        strategic,
        competitive
      )
    }

    if (!strategic || !competitive || !deliverables || !comparative) {
      console.warn('[AI Enrichment] Incomplete analysis, some components may be missing')
    }

    return {
      analyzed_at: new Date().toISOString(),
      strategic_insights: strategic || {
        competitive_positioning: '',
        win_probability: 50,
        win_probability_reasoning: 'Analysis incomplete',
        pricing_recommendation: '',
        key_differentiators: [],
        market_opportunity: '',
      },
      competitive_intelligence: competitive || {
        past_winners_analysis: '',
        competitor_patterns: [],
        agency_preferences: '',
        market_dynamics: '',
        competitive_landscape: '',
      },
      deliverables: deliverables || {
        executive_summary: '',
        competitive_brief: '',
        pricing_strategy: '',
        proposal_guidance: '',
        risk_assessment: '',
      },
      comparative_analysis: comparative || {
        similarity_score: 50,
        similarity_explanation: 'Analysis incomplete',
        deviations: [],
        opportunity_sizing: '',
        feasibility_assessment: '',
      },
    }
  } catch (error) {
    console.error('[AI Enrichment] Error in complete analysis:', error)
    return null
  }
}

