// MacTech Contract Scraper Content Script
// Detects contract opportunity pages and provides scraping functionality

(function () {
  'use strict'

  // Avoid injecting multiple buttons
  if (document.getElementById('mactech-scrape-btn')) return

  let isProcessing = false

  // Detect if we're on a contract opportunity page
  function isContractPage() {
    const url = window.location.href.toLowerCase()
    const hostname = window.location.hostname.toLowerCase()
    
    // SAM.gov pages
    if (hostname.includes('sam.gov') && (url.includes('/opp/') || url.includes('opportunity'))) {
      return true
    }
    
    // Google search results - check for SAM.gov links
    if (hostname.includes('google.com') && url.includes('/search')) {
      return true // Allow scraping from Google results
    }
    
    // Check page content for contract indicators
    const bodyText = document.body?.textContent?.toLowerCase() || ''
    const contractIndicators = [
      'statement of work',
      'sow',
      'performance work statement',
      'pws',
      'rfq',
      'rfp',
      'solicitation',
      'contract opportunity',
      'notice id',
      'naics code',
    ]
    
    return contractIndicators.some(indicator => bodyText.includes(indicator))
  }

  // Extract contract data from the page - Enhanced with structured parsing
  function extractContractData() {
    const url = window.location.href
    const hostname = window.location.hostname.toLowerCase()
    
    // Try to get better title from page content first
    let title = document.title || ''
    const h1Title = document.querySelector('h1')?.textContent?.trim()
    if (h1Title && h1Title.length > 10) {
      title = h1Title
    }
    // Also check for SAM.gov specific title elements
    const samTitle = document.querySelector('[data-testid="opportunity-title"], .opportunity-title, #opportunity-title')?.textContent?.trim()
    if (samTitle && samTitle.length > 10) {
      title = samTitle
    }
    title = title.replace(/\s*-\s*SAM\.gov\s*$/i, '').trim() || 'Contract Opportunity'
    
    // Remove scripts and styles for text extraction
    const clone = document.cloneNode(true)
    const scripts = clone.querySelectorAll('script, style, noscript, iframe')
    scripts.forEach(el => el.remove())
    
    const textContent = clone.body?.textContent || ''
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000)
    
    const htmlContent = document.documentElement.outerHTML.substring(0, 100000)
    
    // Extract snippet (first 500 chars of visible text)
    const snippet = textContent.substring(0, 500)
    
    // Extract structured data from SAM.gov pages
    const structuredData = extractStructuredData(document, textContent, htmlContent)
    
    // Try to extract structured data
    const data = {
      url,
      title: structuredData.title || title,
      htmlContent,
      textContent,
      snippet,
      domain: hostname,
      documentType: structuredData.documentType || detectDocumentType(url, title, textContent),
      noticeId: structuredData.noticeId || extractNoticeId(textContent, url),
      solicitationNumber: structuredData.solicitationNumber || extractSolicitationNumber(textContent),
      agency: structuredData.agency || extractAgency(textContent, title),
      naicsCodes: structuredData.naicsCodes || extractNaicsCodes(textContent),
      setAside: structuredData.setAside || extractSetAside(textContent),
      keywords: structuredData.keywords || extractKeywords(textContent, title),
      sowAttachmentUrl: structuredData.sowAttachmentUrl || findSOWAttachment(),
      sowAttachmentType: structuredData.sowAttachmentType || findSOWAttachmentType(),
      pointsOfContact: structuredData.pointsOfContact || extractPointsOfContact(textContent, htmlContent),
      description: structuredData.description || extractDescription(textContent, htmlContent),
      requirements: structuredData.requirements || extractRequirements(textContent),
      deadline: structuredData.deadline || extractDeadline(textContent),
      estimatedValue: structuredData.estimatedValue || extractEstimatedValue(textContent),
      periodOfPerformance: structuredData.periodOfPerformance || extractPeriodOfPerformance(textContent),
      placeOfPerformance: structuredData.placeOfPerformance || extractPlaceOfPerformance(textContent),
      postedDate: structuredData.postedDate || null,
      responseDeadline: structuredData.responseDeadline || structuredData.deadline || null,
      contractType: structuredData.contractType || null,
      classificationCode: structuredData.classificationCode || null,
    }
    
    console.log('[MacTech Scraper] Extracted data:', {
      title: data.title,
      pocCount: data.pointsOfContact?.length || 0,
      hasDescription: !!data.description,
      requirementsCount: data.requirements?.length || 0,
      noticeId: data.noticeId,
      solicitationNumber: data.solicitationNumber,
      agency: data.agency
    })
    
    return data
  }

  // Extract structured data from SAM.gov pages
  function extractStructuredData(doc, text, html) {
    const result = {}
    
    try {
      // Extract from SAM.gov data attributes and structured elements
      const dataElements = doc.querySelectorAll('[data-testid], [data-field], [class*="field"], [class*="label"]')
      
      dataElements.forEach(el => {
        const label = el.textContent?.toLowerCase() || ''
        const value = el.nextElementSibling?.textContent?.trim() || 
                     el.querySelector('.value, [class*="value"]')?.textContent?.trim() ||
                     el.textContent?.trim()
        
        // Map common SAM.gov fields
        if (label.includes('notice id') || label.includes('noticeid')) {
          result.noticeId = value.match(/[a-z0-9-]+/i)?.[0] || value
        }
        if (label.includes('solicitation') && !result.solicitationNumber) {
          result.solicitationNumber = value
        }
        if (label.includes('agency') || label.includes('department')) {
          result.agency = value
        }
        if (label.includes('deadline') || label.includes('response date') || label.includes('closing')) {
          result.responseDeadline = value
          result.deadline = value
        }
        if (label.includes('posted') || label.includes('published')) {
          result.postedDate = value
        }
        if (label.includes('naics')) {
          const codes = value.match(/\d{6}/g) || []
          result.naicsCodes = codes
        }
        if (label.includes('set-aside') || label.includes('setaside')) {
          result.setAside = [value]
        }
        if (label.includes('contract type') || label.includes('type of')) {
          result.contractType = value
        }
      })
      
      // Extract from tables (common SAM.gov structure)
      const tables = doc.querySelectorAll('table')
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr')
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th')
          if (cells.length >= 2) {
            const label = cells[0]?.textContent?.toLowerCase()?.trim() || ''
            const value = cells[1]?.textContent?.trim() || ''
            
            if (label.includes('notice id') && !result.noticeId) {
              result.noticeId = value.match(/[a-z0-9-]+/i)?.[0] || value
            }
            if (label.includes('solicitation') && !result.solicitationNumber) {
              result.solicitationNumber = value
            }
            if (label.includes('agency') && !result.agency) {
              result.agency = value
            }
            if (label.includes('deadline') || label.includes('response') || label.includes('closing')) {
              result.responseDeadline = value
              result.deadline = value
            }
            if (label.includes('posted') || label.includes('published')) {
              result.postedDate = value
            }
            if (label.includes('naics')) {
              const codes = value.match(/\d{6}/g) || []
              if (codes.length > 0) result.naicsCodes = codes
            }
            if (label.includes('set-aside') || label.includes('setaside')) {
              if (!result.setAside) result.setAside = []
              result.setAside.push(value)
            }
            if (label.includes('contract type') || label.includes('type')) {
              result.contractType = value
            }
            if (label.includes('classification') || label.includes('psc')) {
              result.classificationCode = value
            }
          }
        })
      })
      
      // Extract title from SAM.gov specific elements
      const titleEl = doc.querySelector('[data-testid="opportunity-title"], .opportunity-title, h1.opportunity-title, #opportunity-title')
      if (titleEl) {
        result.title = titleEl.textContent?.trim()
      }
      
      // Extract description from SAM.gov description sections
      const descEl = doc.querySelector('[data-testid="description"], .description-content, #description, [class*="description"]')
      if (descEl) {
        const descText = descEl.textContent?.trim()
        if (descText && descText.length > 100) {
          result.description = descText.substring(0, 5000)
        }
      }
      
    } catch (e) {
      console.warn('[MacTech Scraper] Error extracting structured data:', e)
    }
    
    return result
  }

  // Detect document type
  function detectDocumentType(url, title, text) {
    const combined = `${url} ${title} ${text}`.toLowerCase()
    
    if (combined.includes('statement of work') || combined.includes(' sow ')) return 'SOW'
    if (combined.includes('performance work statement') || combined.includes(' pws ')) return 'PWS'
    if (combined.includes('rfq') || combined.includes('request for quotation')) return 'RFQ'
    if (combined.includes('rfp') || combined.includes('request for proposal')) return 'RFP'
    if (combined.includes('sources sought')) return 'Sources Sought'
    
    return 'Other'
  }

  // Extract notice ID
  function extractNoticeId(text, url) {
    // SAM.gov notice ID pattern
    const noticeIdPattern = /notice[_\s-]?id[:\s]+([a-z0-9-]+)/i
    const match = text.match(noticeIdPattern) || url.match(/\/opp\/([a-z0-9-]+)/i)
    return match ? match[1] : null
  }

  // Extract solicitation number
  function extractSolicitationNumber(text) {
    const patterns = [
      /solicitation[_\s-]?number[:\s]+([a-z0-9-]+)/i,
      /solicitation[_\s-]?#[:\s]+([a-z0-9-]+)/i,
      /solicitation[:\s]+([a-z0-9-]+)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  // Extract agency
  function extractAgency(text, title) {
    const agencyPatterns = [
      /department of ([a-z\s]+)/i,
      /([a-z\s]+) department/i,
      /agency[:\s]+([a-z\s]+)/i,
    ]
    
    for (const pattern of agencyPatterns) {
      const match = text.match(pattern)
      if (match && match[1].length < 100) return match[1].trim()
    }
    
    return null
  }

  // Extract NAICS codes
  function extractNaicsCodes(text) {
    const naicsPattern = /naics[_\s-]?code[s]?[:\s]+(\d{6})/gi
    const matches = [...text.matchAll(naicsPattern)]
    return matches.map(m => m[1]).filter(Boolean)
  }

  // Extract set-aside information
  function extractSetAside(text) {
    const setAsides = []
    const setAsidePatterns = [
      /(sdvosb|service-disabled veteran)/i,
      /(vosb|veteran-owned)/i,
      /(8\(a\)|8a)/i,
      /(hubzone)/i,
      /(wosb|woman-owned)/i,
      /(small business set-aside)/i,
    ]
    
    for (const pattern of setAsidePatterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern)
        if (match) setAsides.push(match[1].toUpperCase())
      }
    }
    
    return [...new Set(setAsides)]
  }

  // Extract keywords
  function extractKeywords(text, title) {
    const keywords = []
    const keywordPatterns = [
      /\b(rmf|risk management framework)\b/i,
      /\b(ato|authorization to operate)\b/i,
      /\b(isso|information system security officer)\b/i,
      /\b(issm|information system security manager)\b/i,
      /\b(stig|security technical implementation guide)\b/i,
      /\b(cybersecurity)\b/i,
      /\b(compliance)\b/i,
      /\b(audit readiness)\b/i,
    ]
    
    const combined = `${title} ${text}`.toLowerCase()
    for (const pattern of keywordPatterns) {
      if (pattern.test(combined)) {
        const match = combined.match(pattern)
        if (match) keywords.push(match[1].toUpperCase())
      }
    }
    
    return [...new Set(keywords)]
  }

  // Find SOW attachment link
  function findSOWAttachment() {
    const links = document.querySelectorAll('a[href]')
    const sowKeywords = ['statement of work', 'sow', 'pws', 'work statement', 'scope of work']
    
    for (const link of links) {
      const href = link.getAttribute('href') || ''
      const text = link.textContent?.toLowerCase() || ''
      const combined = `${href} ${text}`
      
      if (sowKeywords.some(keyword => combined.includes(keyword))) {
        if (href.startsWith('http')) return href
        if (href.startsWith('/')) return new URL(href, window.location.origin).href
      }
      
      // Check for PDF/DOCX links
      if (/\.(pdf|docx?)$/i.test(href)) {
        if (href.startsWith('http')) return href
        if (href.startsWith('/')) return new URL(href, window.location.origin).href
      }
    }
    
    return null
  }

  // Find SOW attachment type
  function findSOWAttachmentType() {
    const url = findSOWAttachment()
    if (!url) return null
    
    if (url.match(/\.pdf$/i)) return 'PDF'
    if (url.match(/\.docx?$/i)) return 'DOCX'
    if (url.match(/\.xlsx?$/i)) return 'XLSX'
    
    return 'HTML'
  }

  // Extract points of contact - Enhanced version
  function extractPointsOfContact(text, html) {
    const contacts = []
    const seenEmails = new Set()
    
    // First, try to parse HTML structure for better extraction
    if (html) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        
        // Look for contact sections, tables, or divs with contact info
        const contactSelectors = [
          '[class*="contact"]',
          '[id*="contact"]',
          '[class*="poc"]',
          '[id*="poc"]',
          '[class*="officer"]',
          'table',
          'dl', // definition lists often used for contact info
        ]
        
        contactSelectors.forEach(selector => {
          try {
            const elements = doc.querySelectorAll(selector)
            elements.forEach(el => {
              const elText = el.textContent || ''
              const elHtml = el.innerHTML || ''
              
              // Extract email from this element
              const emailPattern = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
              const emailMatches = [...elText.matchAll(emailPattern)]
              
              emailMatches.forEach(emailMatch => {
                const email = emailMatch[1].toLowerCase()
                
                // Skip non-POC emails
                if (email.includes('noreply') || email.includes('no-reply') || 
                    email.includes('donotreply') || email.includes('automated') ||
                    email.includes('system') || email.includes('notification') ||
                    email.includes('example') || email.includes('test')) {
                  return
                }
                
                if (seenEmails.has(email)) return
                seenEmails.add(email)
                
                // Extract name - look for patterns like "Name: John Doe" or "John Doe, Email:"
                let name = null
                const namePatterns = [
                  /(?:name|contact|poc|officer|manager|specialist|representative|primary contact)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
                  /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*[,;]|\s+email|\s+@)/i,
                  /([A-Z][a-z]+\s+[A-Z]\.?\s+[A-Z][a-z]+)/, // First Last Middle
                ]
                
                for (const pattern of namePatterns) {
                  const nameMatch = elText.match(pattern)
                  if (nameMatch && nameMatch[1]) {
                    name = nameMatch[1].trim()
                    // Validate name (should be 2-4 words, each 2+ chars)
                    const nameParts = name.split(/\s+/)
                    if (nameParts.length >= 2 && nameParts.length <= 4 && 
                        nameParts.every(p => p.length >= 2)) {
                      break
                    } else {
                      name = null
                    }
                  }
                }
                
                // Extract phone - look for phone patterns
                let phone = null
                const phonePatterns = [
                  /(?:phone|tel|telephone|call)[:\s]+([\d\s\-\(\)\.]+)/i,
                  /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,
                  /(\d{3}[-.\s]\d{3}[-.\s]\d{4})/,
                ]
                
                for (const pattern of phonePatterns) {
                  const phoneMatch = elText.match(pattern)
                  if (phoneMatch && phoneMatch[1]) {
                    const phoneStr = phoneMatch[1].trim()
                    // Validate phone (should have at least 10 digits)
                    const digits = phoneStr.replace(/\D/g, '')
                    if (digits.length >= 10) {
                      phone = phoneStr
                      break
                    }
                  }
                }
                
                // Determine role
                let role = 'Contact'
                const roleText = elText.toLowerCase()
                if (roleText.includes('contracting officer') || roleText.includes('co')) {
                  role = 'Contracting Officer'
                } else if (roleText.includes('technical') || roleText.includes('tech')) {
                  role = 'Technical POC'
                } else if (roleText.includes('program manager') || roleText.includes('pm')) {
                  role = 'Program Manager'
                } else if (roleText.includes('project manager')) {
                  role = 'Project Manager'
                } else if (roleText.includes('contract specialist')) {
                  role = 'Contract Specialist'
                }
                
                contacts.push({
                  name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  email: email,
                  phone: phone,
                  role: role
                })
              })
            })
          } catch (e) {
            console.warn('[MacTech Scraper] Error parsing contact selector:', selector, e)
          }
        })
      } catch (e) {
        console.warn('[MacTech Scraper] Error parsing HTML for contacts:', e)
      }
    }
    
    // Fallback: extract from plain text
    const emailPattern = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
    const emails = [...text.matchAll(emailPattern)]
    
    emails.forEach((emailMatch) => {
      const email = emailMatch[1].toLowerCase()
      
      if (seenEmails.has(email)) return
      
      // Skip non-POC emails
      if (email.includes('noreply') || email.includes('no-reply') || 
          email.includes('donotreply') || email.includes('automated') ||
          email.includes('system') || email.includes('notification') ||
          email.includes('example') || email.includes('test')) {
        return
      }
      
      seenEmails.add(email)
      
      // Look for name before email (within 150 chars)
      const emailIndex = text.indexOf(email)
      const beforeText = text.substring(Math.max(0, emailIndex - 150), emailIndex)
      const namePatterns = [
        /(?:name|contact|poc|officer|manager|specialist|representative|primary contact)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*[,;]|\s+email|\s+@)/i,
      ]
      
      let name = null
      for (const pattern of namePatterns) {
        const nameMatch = beforeText.match(pattern)
        if (nameMatch && nameMatch[1]) {
          name = nameMatch[1].trim()
          break
        }
      }
      
      // Look for phone near email
      const contextText = text.substring(Math.max(0, emailIndex - 100), emailIndex + 200)
      const phonePatterns = [
        /(?:phone|tel|telephone|call)[:\s]+([\d\s\-\(\)\.]+)/i,
        /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/,
      ]
      
      let phone = null
      for (const pattern of phonePatterns) {
        const phoneMatch = contextText.match(pattern)
        if (phoneMatch && phoneMatch[1]) {
          const phoneStr = phoneMatch[1].trim()
          const digits = phoneStr.replace(/\D/g, '')
          if (digits.length >= 10) {
            phone = phoneStr
            break
          }
        }
      }
      
      // Determine role
      let role = 'Contact'
      const roleText = beforeText.toLowerCase()
      if (roleText.includes('contracting')) role = 'Contracting Officer'
      else if (roleText.includes('technical')) role = 'Technical POC'
      else if (roleText.includes('program')) role = 'Program Manager'
      
      contacts.push({
        name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        phone: phone,
        role: role
      })
    })
    
    // Remove duplicates and limit
    const uniqueContacts = []
    const emailSet = new Set()
    for (const contact of contacts) {
      if (!emailSet.has(contact.email)) {
        emailSet.add(contact.email)
        uniqueContacts.push(contact)
      }
    }
    
    return uniqueContacts.slice(0, 10) // Increased limit to 10 contacts
  }

  // Extract full description - Enhanced with better filtering to exclude contact info and footers
  function extractDescription(text, html) {
    // Patterns that indicate we should STOP extracting (footer/navigation)
    const stopPatterns = [
      /contact\s+information/i,
      /primary\s+point\s+of\s+contact/i,
      /alternative\s+point\s+of\s+contact/i,
      /contracting\s+office\s+address/i,
      /attachments\/links/i,
      /links\s*link/i,
      /updated\s+date/i,
      /feedback/i,
      /one\s+question/i,
      /survey/i,
      /our\s+website/i,
      /about\s+this\s+site/i,
      /our\s+community/i,
      /release\s+notes/i,
      /system\s+alerts/i,
      /our\s+partners/i,
      /policies/i,
      /terms\s+of\s+use/i,
      /privacy\s+policy/i,
      /freedom\s+of\s+information/i,
      /accessibility/i,
      /customer\s+service/i,
      /help/i,
      /check\s+entity\s+status/i,
      /federal\s+service\s+desk/i,
      /external\s+resources/i,
      /warning/i,
      /this\s+is\s+a\s+u\.s\./i,
      /general\s+services\s+administration/i,
      /for\s+official\s+use\s+only/i,
      /controlled\s+unclassified\s+information/i,
      /sam\.gov\s+an\s+official\s+website/i,
      /create\s+post/i,
      /save\s+idea/i,
    ]
    
    // Clean text function that removes footer/navigation content
    function cleanDescription(descText) {
      if (!descText) return ''
      
      let cleaned = descText.trim()
      
      // Find where to stop (first occurrence of stop pattern)
      let stopIndex = cleaned.length
      for (const pattern of stopPatterns) {
        const match = cleaned.match(pattern)
        if (match && match.index !== undefined && match.index < stopIndex) {
          stopIndex = match.index
        }
      }
      
      // Cut off at stop point
      if (stopIndex < cleaned.length) {
        cleaned = cleaned.substring(0, stopIndex).trim()
      }
      
      // Remove common UI elements
      cleaned = cleaned.replace(/\b(Back to top|Print|Share|Download|View all|See more)\b/gi, '')
      
      // Remove email patterns (these should be in POC section, not description)
      cleaned = cleaned.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '')
      
      // Remove phone patterns
      cleaned = cleaned.replace(/(?:phone|tel|telephone)[:\s]+[\d\s\-\(\)\.]+/gi, '')
      
      // Remove address patterns
      cleaned = cleaned.replace(/\d+\s+[a-z\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|way|circle|cir|lane|ln)[^.!?]*/gi, '')
      cleaned = cleaned.replace(/[A-Z]{2}\s+\d{5}(?:-\d{4})?/g, '') // ZIP codes
      
      // Remove excessive whitespace
      cleaned = cleaned.replace(/\s+/g, ' ').trim()
      
      // Remove trailing punctuation/whitespace issues
      cleaned = cleaned.replace(/\s+[\.;:,]+$/g, '')
      
      return cleaned
    }
    // First try HTML structure with better SAM.gov selectors
    if (html && typeof document !== 'undefined') {
      try {
        // Use live DOM if available (we're in a browser extension)
        const descSelectors = [
          // SAM.gov specific selectors
          '[data-testid="description"]',
          '[data-testid="description-content"]',
          '[data-testid="opportunity-description"]',
          '#description',
          '#description-content',
          '.description-content',
          '.opportunity-description',
          '[class*="description-content"]',
          '[class*="opportunity-description"]',
          // Generic but common
          '[class*="description"]:not([class*="contact"]):not([class*="poc"])',
          '[id*="description"]:not([id*="contact"]):not([id*="poc"])',
          '[class*="summary"]',
          '[id*="summary"]',
          '[class*="overview"]',
          '[id*="overview"]',
          '[class*="background"]',
          '[id*="background"]',
          '[class*="scope"]',
          '[class*="statement"]',
          'article',
          'main',
          // Look for divs after "Description" labels
          'div:has(+ div[class*="description"])',
        ]
        
        for (const selector of descSelectors) {
          try {
            const elements = document.querySelectorAll(selector)
            for (const el of elements) {
              const elText = el.textContent || ''
              // Skip if too short or too long, or contains mostly navigation/UI
              if (elText.length < 200 || elText.length > 15000) continue
              
              // Skip if it's mostly links or navigation
              const linkCount = el.querySelectorAll('a').length
              if (linkCount > elText.length / 50) continue // Too many links relative to text
              
              // Skip if contains stop patterns
              if (stopPatterns.some(pattern => pattern.test(elText))) continue
              
              // Check if it looks like a description (has sentences, not just keywords)
              const sentences = elText.match(/[^.!?]+[.!?]+/g) || []
              if (sentences.length >= 2) {
                const cleaned = cleanDescription(elText)
                if (cleaned.length >= 100) {
                  console.log('[MacTech Scraper] Found description via selector:', selector)
                  return cleaned.substring(0, 5000)
                }
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        // Try to find description by looking for label + content pattern
        const labels = document.querySelectorAll('label, dt, th, [class*="label"], [class*="field-label"]')
        for (const label of labels) {
          const labelText = label.textContent?.toLowerCase() || ''
          if (labelText.includes('description') || labelText.includes('summary') || 
              labelText.includes('overview') || labelText.includes('background')) {
            // Try to find the associated content
            let contentEl = label.nextElementSibling
            if (!contentEl) {
              // Try parent's next sibling
              contentEl = label.parentElement?.nextElementSibling
            }
            if (!contentEl) {
              // Try finding in same parent
              contentEl = label.parentElement?.querySelector('[class*="value"], [class*="content"], div, p')
            }
            
            if (contentEl) {
              const contentText = contentEl.textContent?.trim() || ''
              // Stop if we hit contact info
              if (stopPatterns.some(pattern => pattern.test(contentText))) continue
              
              if (contentText.length >= 100 && contentText.length < 10000) {
                const sentences = contentText.match(/[^.!?]+[.!?]+/g) || []
                if (sentences.length >= 1) {
                  const cleaned = cleanDescription(contentText)
                  if (cleaned.length >= 100) {
                    console.log('[MacTech Scraper] Found description via label pattern')
                    return cleaned.substring(0, 5000)
                  }
                }
              }
            }
          }
        }
        
        // Try parsing HTML string if live DOM didn't work
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        
        // Same selectors but on parsed doc
        for (const selector of descSelectors.slice(0, 15)) { // Limit to avoid too many queries
          try {
            const elements = doc.querySelectorAll(selector)
            for (const el of elements) {
              const elText = el.textContent || ''
              if (elText.length < 200 || elText.length > 15000) continue
              
              const linkCount = el.querySelectorAll('a').length
              if (linkCount > elText.length / 50) continue
              
              const sentences = elText.match(/[^.!?]+[.!?]+/g) || []
              if (sentences.length >= 3) {
                let cleaned = elText.trim().replace(/\s+/g, ' ')
                cleaned = cleaned.replace(/\b(Back to top|Print|Share|Download|View all|See more)\b/gi, '')
                
                if (cleaned.length >= 200) {
                  console.log('[MacTech Scraper] Found description via parsed HTML:', selector)
                  return cleaned.substring(0, 8000)
                }
              }
            }
          } catch (e) {
            // Continue
          }
        }
      } catch (e) {
        console.warn('[MacTech Scraper] Error parsing HTML for description:', e)
      }
    }
    
    // Look for description sections in text with better patterns (stop before contact info)
    const descPatterns = [
      // Look for text that starts with description-like content but stops before contact info
      /(?:description|summary|overview|background|purpose|objective|scope|statement)[:\s\n]+([^]{100,3000}?)(?=\s*(?:contact\s+information|primary\s+point|attachments|links|feedback|our\s+website|warning|this\s+is\s+a\s+u\.s\.))/is,
      /(?:this\s+(?:opportunity|contract|solicitation|procurement|acquisition|amendment|change))([^]{100,3000}?)(?=\s*(?:contact\s+information|primary\s+point|attachments|links|feedback|our\s+website|warning|this\s+is\s+a\s+u\.s\.))/is,
      /(?:the\s+(?:government|agency|contracting officer|purpose|objective|goal))([^]{100,3000}?)(?=\s*(?:contact\s+information|primary\s+point|attachments|links|feedback|our\s+website|warning|this\s+is\s+a\s+u\.s\.))/is,
    ]
    
    for (const pattern of descPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const cleaned = cleanDescription(match[1])
        if (cleaned.length >= 100) {
          const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || []
          if (sentences.length >= 1) {
            console.log('[MacTech Scraper] Found description via text pattern')
            return cleaned.substring(0, 5000)
          }
        }
      }
    }
    
    // Fallback: use substantial paragraphs (improved logic)
    const paragraphs = text.split(/\n\n+|\.\s+(?=[A-Z])/).filter(p => {
      const trimmed = p.trim()
      // Better filtering: must have multiple sentences and reasonable length
      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || []
      return trimmed.length > 200 && trimmed.length < 3000 && sentences.length >= 2
    })
    
    if (paragraphs.length > 0) {
      // Take first 2-4 paragraphs that form a coherent description
      let combined = ''
      for (let i = 0; i < Math.min(4, paragraphs.length); i++) {
        const para = paragraphs[i].trim()
        if (para.length >= 200) {
          combined += (combined ? '\n\n' : '') + para
          if (combined.length >= 500) break // Stop when we have enough
        }
      }
      
      if (combined.length >= 200) {
        console.log('[MacTech Scraper] Found description via paragraph extraction')
        return combined.substring(0, 8000)
      }
    }
    
    // Last resort: find the longest paragraph-like section
    const sections = text.match(/[^.!?]{200,2000}[.!?]+/g) || []
    if (sections.length > 0) {
      // Sort by length and take the longest reasonable section
      const sorted = sections.sort((a, b) => b.length - a.length)
      for (const section of sorted) {
        const cleaned = section.trim().replace(/\s+/g, ' ')
        if (cleaned.length >= 200 && cleaned.length < 5000) {
          const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || []
          if (sentences.length >= 2) {
            console.log('[MacTech Scraper] Found description via longest section')
            return cleaned.substring(0, 8000)
          }
        }
      }
    }
    
    // Fallback: extract text up to first stop pattern
    const cleaned = cleanDescription(text)
    if (cleaned.length >= 100) {
      // Take first substantial paragraph
      const paragraphs = cleaned.split(/\.\s+/).filter(p => {
        const trimmed = p.trim()
        return trimmed.length > 50 && trimmed.length < 2000
      })
      
      if (paragraphs.length > 0) {
        const firstPara = paragraphs[0].trim()
        if (firstPara.length >= 100) {
          console.log('[MacTech Scraper] Found description via cleaned text fallback')
          return firstPara.substring(0, 5000)
        }
      }
    }
    
    console.log('[MacTech Scraper] No description found')
    return null
  }

  // Extract requirements
  function extractRequirements(text) {
    const requirements = []
    
    // Common requirement patterns
    const reqPatterns = [
      /(?:requirement|must|shall|should)[:\s]+([^.\n]{20,500})/gi,
      /(?:experience|qualification|skill)[\s]*(?:required|needed|desired)[:\s]+([^.\n]{20,500})/gi,
      /(?:minimum|required)[\s]+(?:years?|years of)[\s]+(?:experience|experience in)[:\s]+([^.\n]{20,500})/gi,
    ]
    
    reqPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)]
      matches.forEach(match => {
        if (match[1] && match[1].trim().length > 10) {
          const req = match[1].trim().substring(0, 500)
          if (!requirements.some(r => r.toLowerCase().includes(req.toLowerCase().substring(0, 50)))) {
            requirements.push(req)
          }
        }
      })
    })
    
    return requirements.slice(0, 20) // Limit to 20 requirements
  }

  // Extract deadline
  function extractDeadline(text) {
    const deadlinePatterns = [
      /(?:deadline|due date|closing date|response date|submission deadline)[:\s]+([\d\/\-]+(?:\s+[\d:]+)?)/gi,
      /(?:submit|response)[\s]*(?:by|before|on)[:\s]+([\d\/\-]+(?:\s+[\d:]+)?)/gi,
      /(?:closes?|closing)[\s]+(?:on|at)[:\s]+([\d\/\-]+(?:\s+[\d:]+)?)/gi,
    ]
    
    for (const pattern of deadlinePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  // Extract estimated value
  function extractEstimatedValue(text) {
    const valuePatterns = [
      /\$[\d,]+(?:\s*(?:million|thousand|k|m|b))?/gi,
      /(?:estimated|estimated value|budget|contract value)[:\s]+(\$?[\d,]+(?:\s*(?:million|thousand|k|m|b))?)/gi,
    ]
    
    for (const pattern of valuePatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0].trim()
      }
    }
    
    return null
  }

  // Extract period of performance
  function extractPeriodOfPerformance(text) {
    const popPatterns = [
      /(?:period of performance|pop)[:\s]+([^.\n]{10,200})/gi,
      /(?:performance period|contract period)[:\s]+([^.\n]{10,200})/gi,
      /(?:start date|begin)[:\s]+([\d\/\-]+)[\s]+(?:to|through|end)[:\s]+([\d\/\-]+)/gi,
    ]
    
    for (const pattern of popPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1] ? match[1].trim() : match[0].trim()
      }
    }
    
    return null
  }

  // Extract place of performance
  function extractPlaceOfPerformance(text) {
    const popPatterns = [
      /(?:place of performance|pop|location)[:\s]+([^.\n]{10,200})/gi,
      /(?:work will be performed|performance location)[:\s]+([^.\n]{10,200})/gi,
    ]
    
    for (const pattern of popPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim().substring(0, 500)
      }
    }
    
    return null
  }

  // Inject scrape button
  function injectButton() {
    if (document.getElementById('mactech-scrape-btn')) return
    if (!document.body) {
      setTimeout(injectButton, 100)
      return
    }

    // Always show button on all pages - user can click if it's a contract page
    // We'll validate on the backend anyway

    const button = document.createElement('button')
    button.id = 'mactech-scrape-btn'
    button.textContent = '📄 Scrape Contract'
    button.title = 'Scrape this contract page and import to MacTech'
    
    // Position it above the vetted button if it exists
    const vettedBtn = document.getElementById('profile-json-floating-btn')
    if (vettedBtn) {
      // Position MacTech button above vetted button
      button.style.bottom = '80px' // Above the vetted button
    }

    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '2147483647',
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      background: '#1a73e8',
      color: '#ffffff',
      fontWeight: '500',
      opacity: '0.9',
      transition: 'opacity 0.2s',
    })

    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1'
    })

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.9'
    })

    button.addEventListener('click', async () => {
      if (isProcessing) {
        showToast('Already processing contract. Please wait.', true)
        return
      }

      isProcessing = true
      button.disabled = true
      button.textContent = '⏳ Scraping...'

      try {
        // Get basic data first
        const url = window.location.href
        const htmlContent = document.documentElement.outerHTML
        
        // Send HTML to AI parser first
        button.textContent = '🤖 Parsing with AI...'
        
        const apiUrl = await getApiUrl()
        const parseResponse = await fetch(`${apiUrl}/api/admin/contract-discovery/parse-html`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            htmlContent: htmlContent.substring(0, 200000), // Limit HTML size
            url: url,
          }),
        })

        if (!parseResponse.ok) {
          const errorData = await parseResponse.json().catch(() => ({}))
          throw new Error(errorData.error || 'AI parsing failed')
        }

        const parseData = await parseResponse.json()
        if (!parseData.success || !parseData.data) {
          throw new Error('AI parsing returned invalid data')
        }

        // Merge AI-parsed data with basic extraction
        const aiData = parseData.data
        const basicData = extractContractData()
        
        // Combine: prefer AI data, fallback to basic extraction
        const contractData = {
          url,
          title: aiData.title || basicData.title,
          htmlContent: htmlContent.substring(0, 100000),
          textContent: basicData.textContent,
          snippet: basicData.snippet,
          domain: basicData.domain,
          documentType: aiData.contractType || basicData.documentType,
          noticeId: aiData.noticeId || basicData.noticeId,
          solicitationNumber: aiData.solicitationNumber || basicData.solicitationNumber,
          agency: aiData.agency || basicData.agency,
          naicsCodes: aiData.naicsCodes || basicData.naicsCodes,
          setAside: aiData.setAside || basicData.setAside,
          keywords: aiData.keywords || basicData.keywords,
          sowAttachmentUrl: aiData.sowAttachmentUrl || basicData.sowAttachmentUrl,
          sowAttachmentType: aiData.sowAttachmentType || basicData.sowAttachmentType,
          pointsOfContact: aiData.pointsOfContact || basicData.pointsOfContact,
          description: aiData.description || basicData.description,
          requirements: aiData.requirements || basicData.requirements,
          deadline: aiData.deadline || aiData.responseDeadline || basicData.deadline,
          estimatedValue: aiData.estimatedValue || basicData.estimatedValue,
          periodOfPerformance: aiData.periodOfPerformance || basicData.periodOfPerformance,
          placeOfPerformance: aiData.placeOfPerformance || basicData.placeOfPerformance,
        }
        
        button.textContent = '📤 Uploading...'
        
        // Send to background script for API call
        chrome.runtime.sendMessage(
          {
            type: 'SCRAPE_CONTRACT',
            payload: contractData,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              showToast(`Error: ${chrome.runtime.lastError.message}`, true)
              button.disabled = false
              button.textContent = '📄 Scrape Contract'
              isProcessing = false
              return
            }

            if (response && response.success) {
              showToast(`✅ Contract imported successfully! (ID: ${response.contractId})`)
              button.textContent = '✅ Imported'
              button.style.background = '#34a853'
              
              // Reset button after 3 seconds
              setTimeout(() => {
                button.textContent = '📄 Scrape Contract'
                button.style.background = '#1a73e8'
                button.disabled = false
                isProcessing = false
              }, 3000)
            } else {
              showToast(`Error: ${response?.error || 'Failed to import contract'}`, true)
              button.disabled = false
              button.textContent = '📄 Scrape Contract'
              isProcessing = false
            }
          }
        )
      } catch (error) {
        console.error('Error scraping contract:', error)
        showToast(`Error: ${error.message || 'Unknown error'}`, true)
        button.disabled = false
        button.textContent = '📄 Scrape Contract'
        isProcessing = false
      }
    })

    // Helper function to get API URL
    async function getApiUrl() {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['mactechApiUrl'], (data) => {
          const defaultUrl = 'http://localhost:3000'
          resolve(data.mactechApiUrl || defaultUrl)
        })
      })
    }

    document.body.appendChild(button)
    
    // Debug logging
    console.log('[MacTech Scraper] Button injected on:', window.location.href)
    console.log('[MacTech Scraper] Is contract page:', isContractPage())
  }

  // Show toast notification
  function showToast(message, isError = false) {
    const existing = document.getElementById('mactech-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.id = 'mactech-toast'
    toast.textContent = message

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      zIndex: '2147483647',
      padding: '12px 16px',
      background: isError ? '#ea4335' : 'rgba(0,0,0,0.85)',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      maxWidth: '300px',
      opacity: '1',
      transition: 'opacity 0.3s',
    })

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton)
  } else {
    injectButton()
  }

  // Re-inject on navigation (for SPAs)
  let lastUrl = location.href
  new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      setTimeout(injectButton, 500)
    }
  }).observe(document, { subtree: true, childList: true })
})()
