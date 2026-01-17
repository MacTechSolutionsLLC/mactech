/**
 * Executive Briefing Generator
 * Generates PDF/Word executive briefings for opportunities
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai'
import { GovernmentContractDiscovery } from '@prisma/client'

/**
 * Generate executive briefing document
 * Returns URL to generated document
 */
export async function generateExecutiveBriefing(
  opportunity: GovernmentContractDiscovery
): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI not configured')
  }

  try {
    const openai = getOpenAIClient()

    // Parse enrichment and analysis data
    const enrichment = opportunity.usaspending_enrichment
      ? JSON.parse(opportunity.usaspending_enrichment)
      : null

    const aiAnalysis = opportunity.aiAnalysis
      ? typeof opportunity.aiAnalysis === 'string'
        ? JSON.parse(opportunity.aiAnalysis)
        : opportunity.aiAnalysis
      : null

    // Build briefing content using AI
    const briefingPrompt = `
Generate an executive briefing document for this federal contract opportunity.

Opportunity Details:
- Title: ${opportunity.title}
- Agency: ${opportunity.agency || 'N/A'}
- Relevance Score: ${opportunity.relevance_score || 'N/A'}
- Deadline: ${opportunity.deadline || 'N/A'}
- Description: ${opportunity.description?.substring(0, 1000) || 'N/A'}

${aiAnalysis ? `AI Analysis: ${JSON.stringify(aiAnalysis, null, 2)}` : ''}
${enrichment ? `Competitive Intelligence: ${JSON.stringify(enrichment.statistics, null, 2)}` : ''}

Generate a professional executive briefing in markdown format with the following sections:
1. Executive Summary
2. Opportunity Overview
3. Why This Matters
4. Competitive Landscape
5. Recommended Actions
6. Next Steps

Format for executive consumption - clear, concise, and actionable.
    `.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating executive briefings for federal contract opportunities. Generate clear, concise, and actionable briefings.',
        },
        {
          role: 'user',
          content: briefingPrompt,
        },
      ],
      temperature: 0.7,
    })

    const briefingContent = response.choices[0]?.message?.content || ''

    // For now, return a data URL (in production, save to file storage and return URL)
    // TODO: Implement actual PDF/Word generation using a library like pdfkit or docx
    const dataUrl = `data:text/markdown;base64,${Buffer.from(briefingContent).toString('base64')}`

    return dataUrl
  } catch (error) {
    console.error('[Briefing Generator] Error:', error)
    throw error
  }
}

