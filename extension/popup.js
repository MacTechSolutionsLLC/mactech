// Popup script for MacTech Contract Scraper

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl')
  const saveBtn = document.getElementById('saveBtn')
  const status = document.getElementById('status')

  // Load current API URL
  chrome.storage.sync.get(['mactechApiUrl'], (data) => {
    apiUrlInput.value = data.mactechApiUrl || 'http://localhost:3000'
  })

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim()
    
    if (!apiUrl) {
      showStatus('Please enter an API URL', 'error')
      return
    }

    chrome.storage.sync.set({ mactechApiUrl: apiUrl }, () => {
      if (chrome.runtime.lastError) {
        showStatus(`Error: ${chrome.runtime.lastError.message}`, 'error')
      } else {
        showStatus('Settings saved successfully!', 'success')
      }
    })
  })

  function showStatus(message, type) {
    status.textContent = message
    status.className = `status ${type}`
    setTimeout(() => {
      status.className = 'status'
    }, 3000)
  }
})

