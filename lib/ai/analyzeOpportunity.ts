/**
 * AI Opportunity Analyzer
 * Analyzes opportunities that passed hard filters using OpenAI
 * Returns structured analysis results
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai'
import { NormalizedOpportunity, AIAnalysisResult } from '../sam/samTypes'

/**
 * Analyze an opportunity using AI
 * Non-blocking - returns null if AI is not configured or fails
 * 
 * @param opportunity - Normalized opportunity to analyze
 * @returns AI analysis result or null if analysis fails
 */
export async function analyzeOpportunity(
  opportunity: NormalizedOpportunity
): Promise<AIAnalysisResult | null> {
  if (!isOpenAIConfigured()) {
    console.warn('[AI Analyzer] OpenAI not configured, skipping analysis')
    return null
  }

  try {
    const openai = getOpenAIClient()

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
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert government contract analyst specializing in DoD and federal cybersecurity contracts. 
Analyze this SAM.gov opportunity and provide structured insights.

Return JSON with this exact structure:
{
  "relevanceSummary": "2-3 sentence summary of why this opportunity is relevant or not",
  "recommendedAction": "prime" | "sub" | "monitor" | "ignore",
  "capabilityMatch": ["capability1", "capability2", ...],
  "risks": ["risk1", "risk2", ...]
}

Focus on:
- SDVOSB/VOSB set-aside eligibility
- RMF, cybersecurity, compliance requirements
- Technical skills and certifications needed
- Budget and timeline feasibility
- Competitive landscape considerations

Be concise and actionable.`,
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

    const analysis = JSON.parse(content) as AIAnalysisResult

    // Validate structure
    if (!analysis.relevanceSummary || !analysis.recommendedAction) {
      throw new Error('Invalid AI analysis structure')
    }

    // Ensure arrays exist
    analysis.capabilityMatch = analysis.capabilityMatch || []
    analysis.risks = analysis.risks || []

    console.log(`[AI Analyzer] Analyzed opportunity ${opportunity.noticeId}`)
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
 * Processes sequentially to avoid rate limits
 * 
 * @param opportunities - Array of normalized opportunities
 * @returns Map of noticeId to AI analysis result
 */
export async function analyzeOpportunitiesBatch(
  opportunities: NormalizedOpportunity[]
): Promise<Map<string, AIAnalysisResult>> {
  const results = new Map<string, AIAnalysisResult>()

  if (!isOpenAIConfigured()) {
    console.warn('[AI Analyzer] OpenAI not configured, skipping batch analysis')
    return results
  }

  console.log(`[AI Analyzer] Starting batch analysis of ${opportunities.length} opportunities`)

  for (let i = 0; i < opportunities.length; i++) {
    const opportunity = opportunities[i]
    const analysis = await analyzeOpportunity(opportunity)

    if (analysis) {
      results.set(opportunity.noticeId, analysis)
    }

    // Small delay between requests to avoid rate limits
    if (i < opportunities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[AI Analyzer] Processed ${i + 1}/${opportunities.length} opportunities`)
    }
  }

  console.log(`[AI Analyzer] Completed batch analysis: ${results.size}/${opportunities.length} successful`)
  return results
}

