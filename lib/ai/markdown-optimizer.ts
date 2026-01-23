import { getOpenAIClient, isOpenAIConfigured } from "../openai"

/**
 * Generate a summary of a markdown document
 */
export async function generateDocumentSummary(content: string): Promise<string | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const client = getOpenAIClient()
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a technical documentation assistant. Generate a concise, professional summary of compliance documentation. Focus on key points, structure, and main sections."
        },
        {
          role: "user",
          content: `Please provide a brief summary (2-3 sentences) of this compliance document:\n\n${content.substring(0, 4000)}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error("Error generating document summary:", error)
    return null
  }
}

/**
 * Improve readability of markdown content
 * This can enhance formatting, fix common issues, and improve clarity
 */
export async function improveMarkdownReadability(content: string): Promise<string | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const client = getOpenAIClient()
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a technical writing assistant. Improve the readability and formatting of markdown compliance documentation. Preserve all technical details, code blocks, tables, and structure. Only improve clarity, fix formatting issues, and enhance readability. Return the improved markdown exactly as provided, with only minor improvements."
        },
        {
          role: "user",
          content: `Improve the readability of this markdown document while preserving all content and structure:\n\n${content.substring(0, 8000)}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.2,
    })

    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error("Error improving markdown readability:", error)
    return null
  }
}

/**
 * Extract key sections and create a table of contents
 */
export async function generateTableOfContents(content: string): Promise<string[] | null> {
  if (!isOpenAIConfigured()) {
    return null
  }

  try {
    const client = getOpenAIClient()
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a documentation assistant. Extract all headings (H1, H2, H3) from the markdown document and return them as a JSON array of strings in order of appearance."
        },
        {
          role: "user",
          content: `Extract all headings from this markdown document:\n\n${content.substring(0, 4000)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const result = response.choices[0]?.message?.content
    if (result) {
      const parsed = JSON.parse(result)
      return parsed.headings || null
    }
    return null
  } catch (error) {
    console.error("Error generating table of contents:", error)
    return null
  }
}
