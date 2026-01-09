import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai"
import { prisma } from "@/lib/prisma"

export interface ContractAnalysisResult {
  summary: string
  keyRequirements: string[]
  keywords: string[]
  strengths: string[]
  concerns: string[]
  fitScore: number // 0-100
  serviceCategory: 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
  recommendedActions: string[]
}

/**
 * Analyze a contract and generate comprehensive insights
 */
export async function analyzeContract(
  contractId: string
): Promise<ContractAnalysisResult | null> {
  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, skipping contract analysis")
    return null
  }

  try {
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      throw new Error("Contract not found")
    }

    // Build contract context
    const contractText = buildContractContext(contract)

    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert government contract analyst specializing in DoD and federal cybersecurity contracts. Analyze contracts and provide comprehensive insights.

Return JSON with this structure:
{
  "summary": "2-3 sentence executive summary of the contract",
  "keyRequirements": ["requirement1", "requirement2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "strengths": ["Why this is a good fit", ...],
  "concerns": ["Potential challenges or gaps", ...],
  "fitScore": 85,  // 0-100 how well it fits MacTech's capabilities
  "serviceCategory": "cybersecurity" | "infrastructure" | "compliance" | "contracts" | "general",
  "recommendedActions": ["action1", "action2", ...]
}

Focus on:
- VetCert eligibility (SDVOSB/VOSB set-asides)
- RMF, cybersecurity, compliance requirements
- Technical skills and certifications needed
- Budget and timeline feasibility
- Competitive landscape considerations`
        },
        {
          role: "user",
          content: `Analyze this contract:\n\n${contractText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    const parsed = JSON.parse(content)

    return {
      summary: parsed.summary || "Contract analysis completed",
      keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      fitScore: Math.min(100, Math.max(0, parsed.fitScore || 0)),
      serviceCategory: parsed.serviceCategory || 'general',
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
    }
  } catch (error: any) {
    console.error("Error analyzing contract:", error)
    return null
  }
}

function buildContractContext(contract: any): string {
  const parts: string[] = []

  parts.push(`Title: ${contract.title || "N/A"}`)
  parts.push(`URL: ${contract.url || "N/A"}`)
  
  if (contract.agency) parts.push(`Agency: ${contract.agency}`)
  if (contract.solicitation_number) parts.push(`Solicitation: ${contract.solicitation_number}`)
  if (contract.notice_id) parts.push(`Notice ID: ${contract.notice_id}`)

  // Set-aside information
  if (contract.set_aside) {
    try {
      const setAside = JSON.parse(contract.set_aside)
      if (Array.isArray(setAside) && setAside.length > 0) {
        parts.push(`Set-Aside: ${setAside.join(", ")}`)
      }
    } catch {
      parts.push(`Set-Aside: ${contract.set_aside}`)
    }
  }

  // NAICS codes
  if (contract.naics_codes) {
    try {
      const naics = JSON.parse(contract.naics_codes)
      if (Array.isArray(naics) && naics.length > 0) {
        parts.push(`NAICS Codes: ${naics.join(", ")}`)
      }
    } catch {
      parts.push(`NAICS Codes: ${contract.naics_codes}`)
    }
  }

  // Keywords
  if (contract.detected_keywords) {
    try {
      const keywords = JSON.parse(contract.detected_keywords)
      if (Array.isArray(keywords) && keywords.length > 0) {
        parts.push(`Keywords: ${keywords.join(", ")}`)
      }
    } catch {
      parts.push(`Keywords: ${contract.detected_keywords}`)
    }
  }

  // Scraped content
  if (contract.scraped_text_content) {
    parts.push(`\nContract Content:\n${contract.scraped_text_content.substring(0, 8000)}`)
  }

  // SOW content
  if (contract.sow_attachment_content) {
    parts.push(`\nSOW Content:\n${contract.sow_attachment_content.substring(0, 8000)}`)
  }

  return parts.join("\n")
}

