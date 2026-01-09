import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai"
import { prisma } from "@/lib/prisma"

export interface AwardLikelihoodResult {
  score: number // 0-100
  confidence: "HIGH" | "MEDIUM" | "LOW"
  reasoning: string
  strengths: string[]
  concerns: string[]
  riskFactors: string[]
  recommendations: string[]
}

/**
 * Calculate award likelihood for a contract
 * Considers: set-aside eligibility, past performance, capabilities match, competition, etc.
 */
export async function calculateAwardLikelihood(
  contractId: string
): Promise<AwardLikelihoodResult | null> {
  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, skipping award likelihood calculation")
    return null
  }

  try {
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      return null
    }

    const contractContext = buildContractContext(contract)
    const companyCapabilities = buildCompanyCapabilities()

    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert government contracting analyst. Predict the likelihood that MacTech Solutions LLC (SDVOSB) will win this contract award.

Consider these factors:
1. **Set-Aside Eligibility (30%)**: Is this SDVOSB/VOSB set-aside? MacTech is SDVOSB certified.
2. **Capability Match (25%)**: How well do MacTech's capabilities align with requirements?
3. **Past Performance (15%)**: Does MacTech have relevant past performance?
4. **Competition Level (15%)**: How competitive is this opportunity?
5. **Proposal Quality Potential (10%)**: Can MacTech write a strong proposal?
6. **Budget/Timeline Fit (5%)**: Is the budget and timeline realistic?

MacTech's Capabilities:
- RMF (Risk Management Framework) implementation and management
- STIG compliance and security hardening
- Cybersecurity architecture and documentation
- Audit readiness and compliance
- Infrastructure deployment and optimization
- Contract management and legal support
- DoD and federal government experience

Return JSON:
{
  "score": 75,  // 0-100 award probability
  "confidence": "HIGH",  // HIGH (complete data), MEDIUM (partial), LOW (limited)
  "reasoning": "Brief explanation",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "riskFactors": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Be realistic - most contracts should score 40-70. Only exceptional fits score 80+.
Only score 90+ for truly ideal opportunities.`
        },
        {
          role: "user",
          content: `Calculate award likelihood for this contract:

Contract Details:
${contractContext}

Company Capabilities:
${companyCapabilities}`
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
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      confidence: ["HIGH", "MEDIUM", "LOW"].includes(parsed.confidence)
        ? (parsed.confidence as "HIGH" | "MEDIUM" | "LOW")
        : "MEDIUM",
      reasoning: parsed.reasoning || "Award likelihood calculated",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    }
  } catch (error: any) {
    console.error("Error calculating award likelihood:", error)
    return null
  }
}

function buildContractContext(contract: any): string {
  const parts: string[] = []
  
  parts.push(`Title: ${contract.title || "N/A"}`)
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
    parts.push(`\nContract Content:\n${contract.scraped_text_content.substring(0, 6000)}`)
  }
  
  // SOW content
  if (contract.sow_attachment_content) {
    parts.push(`\nSOW Content:\n${contract.sow_attachment_content.substring(0, 6000)}`)
  }
  
  return parts.join("\n")
}

function buildCompanyCapabilities(): string {
  return `MacTech Solutions LLC - SDVOSB Certified

Core Capabilities:
- Risk Management Framework (RMF) implementation and management
- STIG compliance and security technical implementation
- Cybersecurity architecture and documentation
- Audit readiness and compliance (ISO, NIST, etc.)
- Infrastructure deployment and data center operations
- Network configuration and security
- Contract management and legal support
- DoD and federal government contracting experience

Certifications:
- SDVOSB (Service-Disabled Veteran-Owned Small Business)
- GSA HACS (Highly Adaptive Cybersecurity Services) eligible

Past Performance:
- DoD cybersecurity contracts
- RMF implementation projects
- Compliance and audit readiness
- Infrastructure deployment`
}

