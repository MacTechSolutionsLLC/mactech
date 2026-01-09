import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai"

export interface ParsedContract {
  title: string | null
  agency: string | null
  solicitationNumber: string | null
  noticeId: string | null
  documentType: 'SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other' | null
  summary: string | null
  background: string | null
  objectives: string | null
  scope: string | null
  requirements: string[]
  deliverables: string[]
  timeline: string | null
  budget: string | null
  naicsCodes: string[]
  setAside: string[]
  keywords: string[]
  skills: string[]
  certifications: string[]
  securityClearance: string | null
  location: string | null
  remoteWork: boolean | null
  estimatedValue: string | null
  deadline: string | null
  contractType: string | null
  performancePeriod: string | null
}

/**
 * Parse contract text using OpenAI
 * Extracts structured data from contract documents (SOW, PWS, RFQ, RFP, etc.)
 */
export async function parseContractText(contractText: string): Promise<ParsedContract | null> {
  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, skipping contract parsing")
    return null
  }

  try {
    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing government contracts, Statements of Work (SOW), Performance Work Statements (PWS), RFQs, RFPs, and other procurement documents. Extract comprehensive structured data from the contract text and return it as JSON.

Return JSON with this exact structure:
{
  "title": "Contract title or null",
  "agency": "Agency name or null",
  "solicitationNumber": "Solicitation number or null",
  "noticeId": "SAM.gov notice ID or null",
  "documentType": "SOW" | "PWS" | "RFQ" | "RFP" | "Sources Sought" | "Other" | null,
  "summary": "Executive summary or null",
  "background": "Background section or null",
  "objectives": "Objectives/goals or null",
  "scope": "Scope of work or null",
  "requirements": ["requirement1", "requirement2", ...],
  "deliverables": ["deliverable1", "deliverable2", ...],
  "timeline": "Timeline or period of performance or null",
  "budget": "Budget/estimated value or null",
  "naicsCodes": ["code1", "code2", ...],
  "setAside": ["SDVOSB", "VOSB", "8(a)", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "skills": ["skill1", "skill2", ...],
  "certifications": ["cert1", "cert2", ...],
  "securityClearance": "Required clearance level or null",
  "location": "Work location or null",
  "remoteWork": true | false | null,
  "estimatedValue": "Estimated contract value or null",
  "deadline": "Submission deadline or null",
  "contractType": "Contract type (FFP, CPFF, etc.) or null",
  "performancePeriod": "Period of performance or null"
}

Extract ALL available information comprehensively. Focus on:
- Identifying VetCert-eligible set-asides (SDVOSB, VOSB)
- Extracting technical requirements and skills needed
- Identifying cybersecurity/RMF/compliance requirements
- Finding budget and timeline information
- Extracting NAICS codes and PSC codes
- Identifying security clearance requirements

If a field is not found, use null or empty array. Be thorough and extract everything you can find.`
        },
        {
          role: "user",
          content: `Parse this contract document:\n\n${contractText.substring(0, 16000)}` // Limit to 16k chars
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more accurate extraction
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    const parsed = JSON.parse(content) as ParsedContract

    // Validate and normalize
    return {
      title: parsed.title || null,
      agency: parsed.agency || null,
      solicitationNumber: parsed.solicitationNumber || null,
      noticeId: parsed.noticeId || null,
      documentType: parsed.documentType || null,
      summary: parsed.summary || null,
      background: parsed.background || null,
      objectives: parsed.objectives || null,
      scope: parsed.scope || null,
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      timeline: parsed.timeline || null,
      budget: parsed.budget || null,
      naicsCodes: Array.isArray(parsed.naicsCodes) ? parsed.naicsCodes : [],
      setAside: Array.isArray(parsed.setAside) ? parsed.setAside : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      securityClearance: parsed.securityClearance || null,
      location: parsed.location || null,
      remoteWork: parsed.remoteWork ?? null,
      estimatedValue: parsed.estimatedValue || null,
      deadline: parsed.deadline || null,
      contractType: parsed.contractType || null,
      performancePeriod: parsed.performancePeriod || null,
    }
  } catch (error: any) {
    console.error("Error parsing contract:", error)
    return null
  }
}

