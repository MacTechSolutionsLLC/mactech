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
