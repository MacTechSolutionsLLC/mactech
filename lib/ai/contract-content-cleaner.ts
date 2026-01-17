/**
 * Contract Content Cleaner
 * Uses AI to clean and parse scraped contract content into succinct, accurate, and clean data
 */

import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai"

export interface CleanedContractContent {
  cleanedDescription: string
  cleanedTextContent: string
  extractedFields: {
    summary?: string
    keyPoints?: string[]
    requirements?: string[]
    deliverables?: string[]
    timeline?: string
    budget?: string
    location?: string
    contactInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  }
}

/**
 * Clean and parse scraped contract content using AI
 * Removes verbose content, strange characters, and extracts structured data
 */
export async function cleanContractContent(
  rawText: string,
  rawHtml?: string
): Promise<CleanedContractContent | null> {
  if (!isOpenAIConfigured()) {
    console.warn("OpenAI not configured, skipping content cleaning")
    return null
  }

  if (!rawText || rawText.trim().length === 0) {
    return null
  }

  try {
    const openai = getOpenAIClient()

    // Limit input to avoid token limits (keep first 20k chars)
    const inputText = rawText.substring(0, 20000)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at cleaning and parsing government contract content. Your task is to:
1. Remove verbose, repetitive, or unnecessary content
2. Clean up strange characters, encoding issues, and formatting problems
3. Extract key information into structured format
4. Create a succinct, accurate, and clean description
5. Preserve all important contract details

Return JSON with this structure:
{
  "cleanedDescription": "Clean, succinct description (2-4 paragraphs max, remove verbose content and strange characters)",
  "cleanedTextContent": "Full cleaned text content (remove strange characters, fix encoding, remove excessive whitespace, but keep all important information)",
  "extractedFields": {
    "summary": "Executive summary (1-2 sentences)",
    "keyPoints": ["key point 1", "key point 2", ...],
    "requirements": ["requirement 1", "requirement 2", ...],
    "deliverables": ["deliverable 1", "deliverable 2", ...],
    "timeline": "Timeline or period of performance",
    "budget": "Budget or estimated value",
    "location": "Work location or place of performance",
    "contactInfo": {
      "name": "Point of contact name",
      "email": "Email address",
      "phone": "Phone number"
    }
  }
}

CLEANING RULES:
- Remove HTML entities and encoding issues (e.g., &nbsp;, &#39;, etc.)
- Remove excessive whitespace and line breaks
- Remove navigation elements, headers, footers, and boilerplate text
- Remove repetitive content
- Fix broken words or characters
- Normalize formatting (consistent spacing, capitalization)
- Remove strange Unicode characters that don't add value
- Keep all important contract information (requirements, deadlines, POCs, etc.)
- Make description concise but comprehensive

EXTRACTION RULES:
- Extract only clearly stated information
- Use null or empty arrays for missing information
- Preserve exact values (don't paraphrase numbers, dates, codes)
- Extract contact info from any section (not just "Contact Information")
- Extract requirements from any format (bullets, paragraphs, lists)`
        },
        {
          role: "user",
          content: `Clean and parse this contract content:\n\n${inputText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent cleaning
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    const parsed = JSON.parse(content) as CleanedContractContent

    // Validate and normalize
    return {
      cleanedDescription: parsed.cleanedDescription || rawText.substring(0, 2000).trim(),
      cleanedTextContent: parsed.cleanedTextContent || rawText.trim(),
      extractedFields: {
        summary: parsed.extractedFields?.summary || undefined,
        keyPoints: Array.isArray(parsed.extractedFields?.keyPoints) 
          ? parsed.extractedFields.keyPoints.filter((p: any) => p && typeof p === 'string')
          : undefined,
        requirements: Array.isArray(parsed.extractedFields?.requirements)
          ? parsed.extractedFields.requirements.filter((r: any) => r && typeof r === 'string')
          : undefined,
        deliverables: Array.isArray(parsed.extractedFields?.deliverables)
          ? parsed.extractedFields.deliverables.filter((d: any) => d && typeof d === 'string')
          : undefined,
        timeline: parsed.extractedFields?.timeline || undefined,
        budget: parsed.extractedFields?.budget || undefined,
        location: parsed.extractedFields?.location || undefined,
        contactInfo: parsed.extractedFields?.contactInfo || undefined,
      },
    }
  } catch (error: any) {
    console.error("Error cleaning contract content:", error)
    // Return fallback - at least clean up basic issues
    return {
      cleanedDescription: rawText
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000),
      cleanedTextContent: rawText
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim(),
      extractedFields: {},
    }
  }
}

