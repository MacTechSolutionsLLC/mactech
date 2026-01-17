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
  // Explicit fields for display
  postedDate?: string | null
  pointsOfContact?: Array<{
    name: string
    email?: string
    phone?: string
    role?: string
  }>
  vendor?: string | null
  links?: Array<{
    url: string
    type: string // 'SOW', 'Attachment', 'Resource', 'Additional Info'
    name?: string
    description?: string
  }>
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
  "performancePeriod": "Period of performance or null",
  "postedDate": "Posted date (YYYY-MM-DD or ISO format) or null",
  "pointsOfContact": [
    {
      "name": "Contact name",
      "email": "email@example.com or null",
      "phone": "Phone number or null",
      "role": "Role/title or null"
    }
  ],
  "vendor": "Vendor/awardee name from historical awards (if available) or null",
  "links": [
    {
      "url": "Full URL",
      "type": "SOW" | "Attachment" | "Resource" | "Additional Info",
      "name": "Link name/description or null",
      "description": "Link description or null"
    }
  ]
}

Extract ALL available information comprehensively. Focus on:
- Identifying VetCert-eligible set-asides (SDVOSB, VOSB)
- Extracting technical requirements and skills needed
- Identifying cybersecurity/RMF/compliance requirements
- Finding budget and timeline information
- Extracting NAICS codes and PSC codes
- Identifying security clearance requirements
- **Extracting ALL points of contact** (name, email, phone, role) - look for "Point of Contact", "POC", "Contracting Officer", "CO", "Technical POC", etc.
- **Extracting ALL dates** (posted date, deadline, period of performance start/end dates)
- **Extracting ALL links** (SOW attachments, PDFs, DOCX files, resource links, additional info links) - categorize as "SOW", "Attachment", "Resource", or "Additional Info"
- **Extracting vendor information** if mentioned (awardee name, incumbent vendor)

For links, extract from:
- Document attachments (PDF, DOCX, XLSX files)
- SOW/PWS references
- Resource links
- Additional information URLs
- Any URLs mentioned in the text

For points of contact, look for:
- Contracting Officer (CO)
- Technical POC
- Program Manager
- Any contact information sections

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
      postedDate: parsed.postedDate || null,
      pointsOfContact: Array.isArray(parsed.pointsOfContact) ? parsed.pointsOfContact : [],
      vendor: parsed.vendor || null,
      links: Array.isArray(parsed.links) ? parsed.links : [],
    }
  } catch (error: any) {
    console.error("Error parsing contract:", error)
    return null
  }
}

