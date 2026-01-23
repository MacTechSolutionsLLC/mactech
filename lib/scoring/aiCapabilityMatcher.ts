/**
 * AI Capability Matcher
 * Uses OpenAI for semantic matching of contract requirements to company capabilities
 */

import { getOpenAIClient, isOpenAIConfigured } from '../openai'
import { CompanyCapabilities, CapabilityMatchResult, Pillar } from './capabilityData'

/**
 * Match contract using AI semantic analysis
 * Returns null if AI is not configured or fails
 */
export async function matchCapabilitiesWithAI(
  title: string,
  description: string,
  requirements: string[],
  capabilities: CompanyCapabilities
): Promise<CapabilityMatchResult | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const openai = getOpenAIClient()

    // Prepare capability summaries
    const resumeSummary = capabilities.resumes.map(r => 
      `${r.leaderName} (${r.pillar}): Skills: ${r.skills.slice(0, 10).join(', ')}, Certifications: ${r.certifications.slice(0, 5).join(', ')}`
    ).join('\n')

    const serviceSummary = capabilities.services.map(s => 
      `${s.name} (${s.pillar}): ${s.description}. Capabilities: ${s.capabilities.slice(0, 5).join(', ')}`
    ).join('\n')

    const showcaseSummary = capabilities.showcases
      .filter(s => s.status !== 'coming-soon')
      .map(s => 
        `${s.name} (${s.pillar}, ${s.status}): ${s.description}. Features: ${s.features.slice(0, 5).join(', ')}`
      ).join('\n')

    const pillarSummary = capabilities.pillars.map(p => 
      `${p.pillar} (${p.leaderName}): ${p.description}. Expertise: ${p.expertiseAreas.join(', ')}`
    ).join('\n')

    const contractText = `
Title: ${title}
Description: ${description}
Requirements: ${requirements.join('\n- ')}
`.trim()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at matching government contracts to company capabilities. Analyze the contract requirements and determine how well they match the company's capabilities.

Return JSON with this exact structure:
{
  "resumeMatch": {
    "score": 0-100,
    "matchedSkills": ["skill1", "skill2", ...],
    "matchedCertifications": ["cert1", "cert2", ...],
    "matchedPillars": ["Security", "Infrastructure", "Quality", "Governance"],
    "reasoning": "Explanation of resume match"
  },
  "serviceMatch": {
    "score": 0-100,
    "matchedServices": ["service1", "service2", ...],
    "matchedKeywords": ["keyword1", "keyword2", ...],
    "reasoning": "Explanation of service match"
  },
  "showcaseMatch": {
    "score": 0-100,
    "matchedShowcases": ["showcase1", "showcase2", ...],
    "matchedFeatures": ["feature1", "feature2", ...],
    "reasoning": "Explanation of showcase match"
  },
  "pillarMatch": {
    "score": 0-100,
    "primaryPillar": "Security" | "Infrastructure" | "Quality" | "Governance" | null,
    "matchedPillars": ["Security", ...],
    "reasoning": "Explanation of pillar match"
  },
  "overallScore": 0-100
}

Be thorough and provide detailed reasoning. Consider semantic similarity, not just exact keyword matches.`
        },
        {
          role: 'user',
          content: `Contract:
${contractText}

Company Capabilities:

Resumes:
${resumeSummary}

Services:
${serviceSummary}

Showcases:
${showcaseSummary}

Pillars:
${pillarSummary}

Analyze the match and return JSON.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const result = JSON.parse(content) as CapabilityMatchResult
    
    // Add breakdown weights
    result.breakdown = {
      resumeWeight: 0.30,
      serviceWeight: 0.30,
      showcaseWeight: 0.20,
      pillarWeight: 0.20
    }

    return result
  } catch (error: any) {
    console.error('Error in AI capability matching:', error)
    return null
  }
}
