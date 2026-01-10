/**
 * Contract Scraping Service
 * 
 * Scrapes SAM.gov contract opportunity pages and extracts SOW attachments.
 * Uses heuristics and AI analysis to identify relevant contract information.
 */

import * as cheerio from 'cheerio'
import { prisma } from './prisma'

export interface ScrapeResult {
  success: boolean
  htmlContent?: string
  textContent?: string
  sowAttachmentUrl?: string
  sowAttachmentType?: string
  analysis?: ContractAnalysis
  error?: string
}

export interface ContractAnalysis {
  summary: string
  confidence: number
  keywords: string[]
  sowFound: boolean
  sowUrl?: string
  sowType?: string
  estimatedValue?: string
  deadline?: string
  requirements?: string[]
  skills?: string[]
}

/**
 * Scrape a contract opportunity page from SAM.gov
 * 
 * For contracts from SAM.gov API, we should use the API data directly.
 * This function is primarily for contracts discovered via web scraping or
 * when we need to refresh/update data from the HTML page.
 */
export async function scrapeContractPage(
  url: string,
  apiData?: {
    description?: string
    links?: Array<{ rel?: string; href?: string; type?: string }>
    additionalInfoLink?: string
    title?: string
  }
): Promise<ScrapeResult> {
  try {
    console.log(`[Scraper] Processing contract: ${url}`, {
      hasApiData: !!apiData,
      hasDescription: !!apiData?.description,
      hasLinks: !!apiData?.links,
    })
    
    // If we have API data, use it directly instead of scraping
    if (apiData) {
      const textContent = apiData.description || ''
      
      // Extract SOW attachment from API links
      const sowAttachment = findSOWFromApiLinks(apiData.links || [], apiData.additionalInfoLink)
      
      // Analyze using API data (includes contact info extraction)
      const analysis = analyzeContractFromApiData(apiData, sowAttachment)
      
      return {
        success: true,
        htmlContent: undefined, // Don't store HTML if we have API data
        textContent: textContent.substring(0, 50000),
        sowAttachmentUrl: sowAttachment?.url,
        sowAttachmentType: sowAttachment?.type,
        analysis,
      }
    }
    
    // Fallback to HTML scraping if no API data provided
    console.log(`[Scraper] No API data provided, scraping HTML page: ${url}`)
    
    // Fetch the HTML page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const htmlContent = await response.text()
    const $ = cheerio.load(htmlContent) as cheerio.CheerioAPI
    
    // Extract text content (remove scripts, styles, etc.)
    $('script, style, noscript').remove()
    const textContent = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000) // Limit to 50k chars

    // Find SOW attachment using heuristics
    const sowAttachment = findSOWAttachment($, url, textContent)
    
    // Analyze the contract
    const analysis = analyzeContract($, textContent, sowAttachment)

    return {
      success: true,
      htmlContent: htmlContent.substring(0, 100000), // Limit HTML storage
      textContent,
      sowAttachmentUrl: sowAttachment?.url,
      sowAttachmentType: sowAttachment?.type,
      analysis,
    }
  } catch (error) {
    console.error(`[Scraper] Error scraping ${url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Find SOW attachment from SAM.gov API links array
 */
function findSOWFromApiLinks(
  links: Array<{ rel?: string; href?: string; type?: string }>,
  additionalInfoLink?: string
): { url: string; type: string } | null {
  const sowKeywords = [
    'statement of work',
    'sow',
    'pws', // Performance Work Statement
    'work statement',
    'scope of work',
    'statement of objectives',
    'soo',
    'attachment',
    'document',
  ]

  // Check all links for SOW indicators
  const potentialLinks: Array<{ url: string; type: string; score: number }> = []

  links.forEach(link => {
    if (!link.href) return

    const href = link.href.toLowerCase()
    const rel = (link.rel || '').toLowerCase()
    const type = (link.type || '').toLowerCase()

    let score = 0

    // Check if link text/rel/type suggests SOW
    const linkText = `${rel} ${type} ${href}`.toLowerCase()
    sowKeywords.forEach(keyword => {
      if (linkText.includes(keyword)) {
        score += 10
      }
    })

    // Check file extension
    let fileType = 'unknown'
    if (href.match(/\.pdf$/i)) {
      fileType = 'PDF'
      score += 5
    } else if (href.match(/\.docx?$/i)) {
      fileType = 'DOCX'
      score += 4
    } else if (href.match(/\.xlsx?$/i)) {
      fileType = 'XLSX'
      score += 3
    }

    // Prefer links with "attachment" or "document" in rel/type
    if (rel.includes('attachment') || rel.includes('document')) {
      score += 5
    }

    if (score > 0) {
      potentialLinks.push({
        url: link.href,
        type: fileType,
        score,
      })
    }
  })

  // Also check additionalInfoLink
  if (additionalInfoLink) {
    const href = additionalInfoLink.toLowerCase()
    let score = 3 // Base score for additional info link
    
    sowKeywords.forEach(keyword => {
      if (href.includes(keyword)) {
        score += 5
      }
    })

    let fileType = 'unknown'
    if (href.match(/\.pdf$/i)) {
      fileType = 'PDF'
      score += 3
    } else if (href.match(/\.docx?$/i)) {
      fileType = 'DOCX'
      score += 2
    }

    potentialLinks.push({
      url: additionalInfoLink,
      type: fileType,
      score,
    })
  }

  // Sort by score and return best match
  potentialLinks.sort((a, b) => b.score - a.score)
  
  const bestMatch = potentialLinks[0]
  if (bestMatch && bestMatch.score > 5) {
    console.log(`[Scraper] Found SOW attachment from API links: ${bestMatch.url} (score: ${bestMatch.score})`)
    return {
      url: bestMatch.url,
      type: bestMatch.type,
    }
  }

  console.log(`[Scraper] No SOW attachment found in API links (checked ${potentialLinks.length} links)`)
  return null
}

/**
 * Analyze contract from API data (more efficient than HTML scraping)
 */
function analyzeContractFromApiData(
  apiData: {
    description?: string
    title?: string
    links?: Array<{ rel?: string; href?: string; type?: string }>
    pointOfContact?: Array<{
      type?: string
      email?: string
      phone?: string
      fax?: string
      fullName?: string
      title?: string
    }>
    placeOfPerformance?: {
      streetAddress?: string
      city?: string
      state?: string
      zip?: string
      country?: string
    }
    responseDeadLine?: string
    postedDate?: string
  },
  sowAttachment: { url: string; type: string } | null
): ContractAnalysis {
  const text = `${apiData.title || ''} ${apiData.description || ''}`.toLowerCase()
  const keywords: string[] = []
  const requirements: string[] = []
  const skills: string[] = []

  // Extract keywords (same patterns as HTML analysis)
  const keywordPatterns = [
    { pattern: /rmf|risk management framework/gi, keyword: 'RMF' },
    { pattern: /ato|authorization to operate/gi, keyword: 'ATO' },
    { pattern: /isso|information system security officer/gi, keyword: 'ISSO' },
    { pattern: /issm|information system security manager/gi, keyword: 'ISSM' },
    { pattern: /stig|security technical implementation guide/gi, keyword: 'STIG' },
    { pattern: /nist\s*800-53/gi, keyword: 'NIST 800-53' },
    { pattern: /cybersecurity/gi, keyword: 'Cybersecurity' },
    { pattern: /audit\s*readiness/gi, keyword: 'Audit Readiness' },
    { pattern: /compliance/gi, keyword: 'Compliance' },
    { pattern: /data\s*center/gi, keyword: 'Data Center' },
    { pattern: /infrastructure/gi, keyword: 'Infrastructure' },
    { pattern: /cloud/gi, keyword: 'Cloud' },
    { pattern: /sdvosb|service-disabled veteran/gi, keyword: 'SDVOSB' },
    { pattern: /vosb|veteran-owned/gi, keyword: 'VOSB' },
  ]

  keywordPatterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      keywords.push(keyword)
    }
  })

  // Extract requirements
  const requirementPatterns = [
    /(?:requirement|must|shall|should)\s*[:\-]?\s*([^.\n]{20,200})/gi,
    /(?:experience|qualification|skill)\s*(?:required|needed|desired)\s*[:\-]?\s*([^.\n]{20,200})/gi,
  ]

  requirementPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        requirements.push(match[1].trim().substring(0, 200))
      }
    }
  })

  // Extract skills
  const skillKeywords = [
    'python', 'java', 'javascript', 'typescript', 'sql',
    'aws', 'azure', 'gcp', 'cloud',
    'ansible', 'terraform', 'kubernetes', 'docker',
    'linux', 'windows', 'networking',
    'security', 'compliance', 'audit',
  ]

  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      skills.push(skill)
    }
  })

  // Extract estimated value
  let estimatedValue: string | undefined
  const valuePatterns = [
    /\$[\d,]+(?:\s*(?:million|thousand|k|m))?/gi,
    /estimated\s*(?:value|amount|budget)\s*[:\-]?\s*\$?[\d,]+/gi,
  ]

  valuePatterns.forEach(pattern => {
    const match = text.match(pattern)
    if (match && !estimatedValue) {
      estimatedValue = match[0]
    }
  })

  // Extract deadline - prefer API data over text parsing
  let deadline: string | undefined = apiData.responseDeadLine
  if (!deadline) {
    const deadlinePatterns = [
      /(?:deadline|due\s*date|closing\s*date|response\s*date)\s*[:\-]?\s*([\d\/\-]+)/gi,
      /(?:submit|response)\s*(?:by|before|on)\s*([\d\/\-]+)/gi,
    ]

    deadlinePatterns.forEach(pattern => {
      const match = text.match(pattern)
      if (match && !deadline) {
        deadline = match[1]
      }
    })
  }

  // Generate summary
  const summaryParts: string[] = []
  
  if (keywords.length > 0) {
    summaryParts.push(`Keywords: ${keywords.slice(0, 5).join(', ')}`)
  }
  
  if (sowAttachment) {
    summaryParts.push(`SOW attachment found (${sowAttachment.type})`)
  } else {
    summaryParts.push('No SOW attachment detected')
  }

  if (estimatedValue) {
    summaryParts.push(`Estimated value: ${estimatedValue}`)
  }

  if (deadline) {
    summaryParts.push(`Deadline: ${deadline}`)
  }

  if (requirements.length > 0) {
    summaryParts.push(`${requirements.length} requirements identified`)
  }

  const summary = summaryParts.join('. ') || 'Contract opportunity identified'

  // Calculate confidence (higher for API data since it's more reliable)
  let confidence = 0.7 // Higher base confidence for API data
  if (sowAttachment) confidence += 0.2
  if (keywords.length > 3) confidence += 0.1
  if (estimatedValue) confidence += 0.05
  if (deadline) confidence += 0.05
  confidence = Math.min(confidence, 1.0)

  return {
    summary,
    confidence,
    keywords: [...new Set(keywords)],
    sowFound: !!sowAttachment,
    sowUrl: sowAttachment?.url,
    sowType: sowAttachment?.type,
    estimatedValue,
    deadline,
    requirements: requirements.slice(0, 10),
    skills: [...new Set(skills)],
  }
}

/**
 * Find SOW attachment link using heuristics
 */
function findSOWAttachment($: cheerio.CheerioAPI, baseUrl: string, textContent: string): { url: string; type: string } | null {
  // Common SOW-related keywords
  const sowKeywords = [
    'statement of work',
    'sow',
    'pws', // Performance Work Statement
    'work statement',
    'scope of work',
    'statement of objectives',
    'soo',
  ]

  // Look for links that might be SOW attachments
  const potentialLinks: Array<{ url: string; text: string; type: string }> = []

  // Find all links on the page
  $('a[href]').each((_, element) => {
    const $link = $(element)
    const href = $link.attr('href')
    const text = $link.text().toLowerCase()
    const title = $link.attr('title')?.toLowerCase() || ''
    const combinedText = `${text} ${title}`

    if (!href) return

    // Check if link text contains SOW keywords
    const hasSowKeyword = sowKeywords.some(keyword => 
      combinedText.includes(keyword)
    )

    // Check if URL suggests a document
    const isDocument = /\.(pdf|doc|docx|xls|xlsx)$/i.test(href)

    if (hasSowKeyword || isDocument) {
      // Resolve relative URLs
      let fullUrl = href
      if (href.startsWith('/')) {
        try {
          const base = new URL(baseUrl)
          fullUrl = `${base.origin}${href}`
        } catch {
          fullUrl = href
        }
      } else if (!href.startsWith('http')) {
        try {
          const base = new URL(baseUrl)
          fullUrl = new URL(href, baseUrl).toString()
        } catch {
          fullUrl = href
        }
      }

      // Determine file type
      let type = 'unknown'
      if (href.match(/\.pdf$/i)) type = 'PDF'
      else if (href.match(/\.docx?$/i)) type = 'DOCX'
      else if (href.match(/\.xlsx?$/i)) type = 'XLSX'
      else if (hasSowKeyword) type = 'HTML' // Might be a page, not a file

      potentialLinks.push({ url: fullUrl, text: combinedText, type })
    }
  })

  // Also check for download buttons/sections
  $('[class*="download"], [class*="attachment"], [class*="document"]').each((_, element) => {
    const $elem = $(element)
    const text = $elem.text().toLowerCase()
    const href = $elem.find('a').attr('href') || $elem.attr('href')
    
    if (href && sowKeywords.some(kw => text.includes(kw))) {
      let fullUrl = href
      if (href.startsWith('/')) {
        try {
          const base = new URL(baseUrl)
          fullUrl = `${base.origin}${href}`
        } catch {
          fullUrl = href
        }
      } else if (!href.startsWith('http')) {
        try {
          fullUrl = new URL(href, baseUrl).toString()
        } catch {
          fullUrl = href
        }
      }

      let type = 'unknown'
      if (href.match(/\.pdf$/i)) type = 'PDF'
      else if (href.match(/\.docx?$/i)) type = 'DOCX'
      else if (href.match(/\.xlsx?$/i)) type = 'XLSX'

      potentialLinks.push({ url: fullUrl, text, type })
    }
  })

  // Score and rank potential links
  const scoredLinks = potentialLinks.map(link => {
    let score = 0
    
    // Higher score for explicit SOW mentions
    sowKeywords.forEach(keyword => {
      if (link.text.includes(keyword)) {
        score += 10
      }
    })

    // Prefer PDFs and DOCX over HTML
    if (link.type === 'PDF') score += 5
    if (link.type === 'DOCX') score += 4
    if (link.type === 'HTML') score -= 2

    // Prefer links with "download" or "attachment" in URL
    if (link.url.toLowerCase().includes('download') || 
        link.url.toLowerCase().includes('attachment')) {
      score += 3
    }

    return { ...link, score }
  })

  // Sort by score and return the best match
  scoredLinks.sort((a, b) => b.score - a.score)
  
  const bestMatch = scoredLinks[0]
  if (bestMatch && bestMatch.score > 5) {
    console.log(`[Scraper] Found SOW attachment: ${bestMatch.url} (score: ${bestMatch.score})`)
    return {
      url: bestMatch.url,
      type: bestMatch.type,
    }
  }

  console.log(`[Scraper] No SOW attachment found (checked ${potentialLinks.length} links)`)
  return null
}

/**
 * Analyze contract content using heuristics
 */
function analyzeContract($: cheerio.CheerioAPI, textContent: string, sowAttachment: { url: string; type: string } | null): ContractAnalysis {
  const text = textContent.toLowerCase()
  const keywords: string[] = []
  const requirements: string[] = []
  const skills: string[] = []

  // Extract keywords from common contract sections
  const keywordPatterns = [
    { pattern: /rmf|risk management framework/gi, keyword: 'RMF' },
    { pattern: /ato|authorization to operate/gi, keyword: 'ATO' },
    { pattern: /isso|information system security officer/gi, keyword: 'ISSO' },
    { pattern: /issm|information system security manager/gi, keyword: 'ISSM' },
    { pattern: /stig|security technical implementation guide/gi, keyword: 'STIG' },
    { pattern: /nist\s*800-53/gi, keyword: 'NIST 800-53' },
    { pattern: /cybersecurity/gi, keyword: 'Cybersecurity' },
    { pattern: /audit\s*readiness/gi, keyword: 'Audit Readiness' },
    { pattern: /compliance/gi, keyword: 'Compliance' },
    { pattern: /data\s*center/gi, keyword: 'Data Center' },
    { pattern: /infrastructure/gi, keyword: 'Infrastructure' },
    { pattern: /cloud/gi, keyword: 'Cloud' },
    { pattern: /sdvosb|service-disabled veteran/gi, keyword: 'SDVOSB' },
    { pattern: /vosb|veteran-owned/gi, keyword: 'VOSB' },
  ]

  keywordPatterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      keywords.push(keyword)
    }
  })

  // Extract requirements (look for requirement-like patterns)
  const requirementPatterns = [
    /(?:requirement|must|shall|should)\s*[:\-]?\s*([^.\n]{20,200})/gi,
    /(?:experience|qualification|skill)\s*(?:required|needed|desired)\s*[:\-]?\s*([^.\n]{20,200})/gi,
  ]

  requirementPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        requirements.push(match[1].trim().substring(0, 200))
      }
    }
  })

  // Extract skills (look for skill mentions)
  const skillKeywords = [
    'python', 'java', 'javascript', 'typescript', 'sql',
    'aws', 'azure', 'gcp', 'cloud',
    'ansible', 'terraform', 'kubernetes', 'docker',
    'linux', 'windows', 'networking',
    'security', 'compliance', 'audit',
  ]

  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      skills.push(skill)
    }
  })

  // Extract estimated value
  let estimatedValue: string | undefined
  const valuePatterns = [
    /\$[\d,]+(?:\s*(?:million|thousand|k|m))?/gi,
    /estimated\s*(?:value|amount|budget)\s*[:\-]?\s*\$?[\d,]+/gi,
  ]

  valuePatterns.forEach(pattern => {
    const match = text.match(pattern)
    if (match && !estimatedValue) {
      estimatedValue = match[0]
    }
  })

  // Extract deadline
  let deadline: string | undefined
  const deadlinePatterns = [
    /(?:deadline|due\s*date|closing\s*date|response\s*date)\s*[:\-]?\s*([\d\/\-]+)/gi,
    /(?:submit|response)\s*(?:by|before|on)\s*([\d\/\-]+)/gi,
  ]

  deadlinePatterns.forEach(pattern => {
    const match = text.match(pattern)
    if (match && !deadline) {
      deadline = match[1]
    }
  })

  // Generate summary
  const summaryParts: string[] = []
  
  if (keywords.length > 0) {
    summaryParts.push(`Keywords: ${keywords.slice(0, 5).join(', ')}`)
  }
  
  if (sowAttachment) {
    summaryParts.push(`SOW attachment found (${sowAttachment.type})`)
  } else {
    summaryParts.push('No SOW attachment detected')
  }

  if (estimatedValue) {
    summaryParts.push(`Estimated value: ${estimatedValue}`)
  }

  if (deadline) {
    summaryParts.push(`Deadline: ${deadline}`)
  }

  if (requirements.length > 0) {
    summaryParts.push(`${requirements.length} requirements identified`)
  }

  const summary = summaryParts.join('. ') || 'Contract opportunity identified'

  // Calculate confidence based on available information
  let confidence = 0.5 // Base confidence
  if (sowAttachment) confidence += 0.2
  if (keywords.length > 3) confidence += 0.15
  if (estimatedValue) confidence += 0.1
  if (deadline) confidence += 0.05
  confidence = Math.min(confidence, 1.0)

  return {
    summary,
    confidence,
    keywords: [...new Set(keywords)], // Remove duplicates
    sowFound: !!sowAttachment,
    sowUrl: sowAttachment?.url,
    sowType: sowAttachment?.type,
    estimatedValue,
    deadline,
    requirements: requirements.slice(0, 10), // Limit to 10
    skills: [...new Set(skills)], // Remove duplicates
  }
}

/**
 * Scrape SOW attachment document
 */
export async function scrapeSOWAttachment(url: string, type: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    console.log(`[Scraper] Fetching SOW attachment: ${url} (type: ${type})`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (type === 'PDF') {
      // For PDF, we'll need to use pdf-parse (already in dependencies)
      const pdfParseModule: any = await import('pdf-parse')
      const pdfParse = pdfParseModule.default || pdfParseModule
      const buffer = await response.arrayBuffer()
      const data = await pdfParse(Buffer.from(buffer))
      return {
        success: true,
        content: data.text.substring(0, 100000), // Limit to 100k chars
      }
    } else if (type === 'DOCX') {
      // For DOCX, we'll need to use mammoth (already in dependencies)
      const mammoth = await import('mammoth')
      const buffer = await response.arrayBuffer()
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      return {
        success: true,
        content: result.value.substring(0, 100000), // Limit to 100k chars
      }
    } else if (type === 'HTML' || type === 'unknown') {
      // For HTML, extract text
      const html = await response.text()
      const $ = cheerio.load(html)
      $('script, style, noscript').remove()
      const text = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100000)
      return {
        success: true,
        content: text,
      }
    } else {
      // For other types, try to extract as text
      const text = await response.text()
      return {
        success: true,
        content: text.substring(0, 100000),
      }
    }
  } catch (error) {
    console.error(`[Scraper] Error scraping SOW attachment ${url}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Save scraped contract to database
 */
export async function saveScrapedContract(
  contractId: string,
  scrapeResult: ScrapeResult
): Promise<void> {
  try {
    await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        scraped: true,
        scraped_at: new Date(),
        scraped_html_content: scrapeResult.htmlContent || null,
        scraped_text_content: scrapeResult.textContent || null,
        sow_attachment_url: scrapeResult.sowAttachmentUrl || null,
        sow_attachment_type: scrapeResult.sowAttachmentType || null,
        analysis_summary: scrapeResult.analysis?.summary || null,
        analysis_confidence: scrapeResult.analysis?.confidence || null,
        analysis_keywords: JSON.stringify(scrapeResult.analysis?.keywords || []),
        updated_at: new Date(),
      },
    })
  } catch (error) {
    console.error(`[Scraper] Error saving scraped contract ${contractId}:`, error)
    throw error
  }
}

/**
 * Save scraped SOW content to database
 */
export async function saveScrapedSOW(
  contractId: string,
  sowContent: string
): Promise<void> {
  try {
    await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        sow_scraped: true,
        sow_scraped_at: new Date(),
        sow_attachment_content: sowContent,
        updated_at: new Date(),
      },
    })
  } catch (error) {
    console.error(`[Scraper] Error saving SOW content ${contractId}:`, error)
    throw error
  }
}

