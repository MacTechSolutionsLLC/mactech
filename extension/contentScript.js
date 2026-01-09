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

  // Extract contract data from the page
  function extractContractData() {
    const url = window.location.href
    const hostname = window.location.hostname.toLowerCase()
    const title = document.title || ''
    
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
    
    // Try to extract structured data
    const data = {
      url,
      title: title.replace(/\s*-\s*SAM\.gov\s*$/i, '').trim() || 'Contract Opportunity',
      htmlContent,
      textContent,
      snippet,
      domain: hostname,
      documentType: detectDocumentType(url, title, textContent),
      noticeId: extractNoticeId(textContent, url),
      solicitationNumber: extractSolicitationNumber(textContent),
      agency: extractAgency(textContent, title),
      naicsCodes: extractNaicsCodes(textContent),
      setAside: extractSetAside(textContent),
      keywords: extractKeywords(textContent, title),
      sowAttachmentUrl: findSOWAttachment(),
      sowAttachmentType: findSOWAttachmentType(),
      pointsOfContact: extractPointsOfContact(textContent, htmlContent),
      description: extractDescription(textContent),
      requirements: extractRequirements(textContent),
      deadline: extractDeadline(textContent),
      estimatedValue: extractEstimatedValue(textContent),
      periodOfPerformance: extractPeriodOfPerformance(textContent),
      placeOfPerformance: extractPlaceOfPerformance(textContent),
    }
    
    return data
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

  // Extract points of contact
  function extractPointsOfContact(text, html) {
    const contacts = []
    const textLower = text.toLowerCase()
    
    // Extract emails
    const emailPattern = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi
    const emails = [...text.matchAll(emailPattern)]
    
    emails.forEach((emailMatch) => {
      const email = emailMatch[1]
      const emailLower = email.toLowerCase()
      
      // Skip common non-POC emails
      if (emailLower.includes('noreply') || emailLower.includes('no-reply') || 
          emailLower.includes('donotreply') || emailLower.includes('automated') ||
          emailLower.includes('system') || emailLower.includes('notification')) {
        return
      }
      
      // Look for name before email (within 100 chars)
      const emailIndex = text.indexOf(email)
      const beforeText = text.substring(Math.max(0, emailIndex - 100), emailIndex)
      const nameMatch = beforeText.match(/(?:contact|poc|officer|manager|specialist|representative)[:\s]+([a-z\s]{2,50})/i)
      const name = nameMatch ? nameMatch[1].trim() : null
      
      // Look for phone near email
      const afterText = text.substring(emailIndex, emailIndex + 200)
      const phoneMatch = afterText.match(/(?:phone|tel|telephone)[:\s]+([\d\s\-\(\)\.]+)/i)
      const phone = phoneMatch ? phoneMatch[1].trim() : null
      
      // Determine role
      let role = 'Contact'
      if (beforeText.toLowerCase().includes('contracting')) role = 'Contracting Officer'
      else if (beforeText.toLowerCase().includes('technical')) role = 'Technical POC'
      else if (beforeText.toLowerCase().includes('program')) role = 'Program Manager'
      
      if (name || email) {
        contacts.push({
          name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          phone: phone || null,
          role: role
        })
      }
    })
    
    return contacts.slice(0, 5) // Limit to 5 contacts
  }

  // Extract full description
  function extractDescription(text) {
    // Look for description sections
    const descPatterns = [
      /(?:description|summary|overview|background)[:\s]+([^]{200,2000})/i,
      /(?:statement of work|sow|scope)[:\s]+([^]{200,2000})/i,
    ]
    
    for (const pattern of descPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim().substring(0, 5000)
      }
    }
    
    // Fallback: use first substantial paragraph
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 100)
    if (paragraphs.length > 0) {
      return paragraphs[0].trim().substring(0, 5000)
    }
    
    return text.substring(0, 5000)
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
        const contractData = extractContractData()
        
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
