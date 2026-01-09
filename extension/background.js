// MacTech Contract Scraper Background Service Worker
// Handles API communication with MacTech platform

// Get API URL from storage or use default
async function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['mactechApiUrl'], (data) => {
      // Default to localhost for development, user can set production URL
      const defaultUrl = 'http://localhost:3000'
      resolve(data.mactechApiUrl || defaultUrl)
    })
  })
}

// Send contract data to MacTech API
async function sendContractToAPI(contractData) {
  try {
    const apiUrl = await getApiUrl()
    const endpoint = `${apiUrl}/api/admin/contract-discovery/import`
    
    console.log('[MacTech Scraper] Sending contract to API:', endpoint)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contractData),
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('[MacTech Scraper] Non-JSON response:', text.substring(0, 200))
      throw new Error(`Server returned ${response.status}: ${response.statusText}. Response: ${text.substring(0, 100)}`)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return {
      success: true,
      contractId: data.contract?.id,
      message: data.message,
    }
  } catch (error) {
    console.error('[MacTech Scraper] API error:', error)
    throw error
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_CONTRACT') {
    console.log('[MacTech Scraper] Received scrape request:', message.payload.url)
    
    sendContractToAPI(message.payload)
      .then((result) => {
        sendResponse(result)
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message || 'Failed to import contract',
        })
      })
    
    // Return true to indicate we'll send response asynchronously
    return true
  }

  if (message.type === 'GET_API_URL') {
    getApiUrl().then((url) => {
      sendResponse({ apiUrl: url })
    })
    return true
  }

  if (message.type === 'SET_API_URL') {
    chrome.storage.sync.set({ mactechApiUrl: message.apiUrl }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[MacTech Scraper] Extension installed')
  
  // Set default API URL if not set
  chrome.storage.sync.get(['mactechApiUrl'], (data) => {
    if (!data.mactechApiUrl) {
      // Try to detect if we're on Railway or Vercel
      chrome.storage.sync.set({ 
        mactechApiUrl: 'http://localhost:3000' 
      })
    }
  })
})
