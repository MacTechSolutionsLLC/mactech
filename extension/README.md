# MacTech Contract Scraper Extension

Browser extension to scrape contract opportunity pages and import them to the MacTech platform when SAM.gov API limits are reached.

## Features

- **Automatic Detection**: Detects contract opportunity pages on SAM.gov and Google search results
- **One-Click Scraping**: Click the floating button to scrape and import contracts
- **Smart Extraction**: Automatically extracts:
  - Contract title, URL, and content
  - Notice ID and solicitation number
  - Agency information
  - NAICS codes
  - Set-aside information (SDVOSB, VOSB, etc.)
  - Keywords (RMF, ATO, ISSO, etc.)
  - SOW attachment links
- **API Integration**: Sends scraped data directly to MacTech platform API

## Installation

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. The extension is now installed!

## Configuration

1. Click the extension icon in your browser toolbar
2. Enter your MacTech platform API URL:
   - **Local development**: `http://localhost:3000`
   - **Production**: Your Railway/Vercel URL (e.g., `https://your-app.railway.app`)
3. Click "Save Settings"

## Usage

### On SAM.gov Contract Pages

1. Navigate to a contract opportunity page on SAM.gov
2. Look for the blue "📄 Scrape Contract" button in the bottom-right corner
3. Click the button to scrape and import the contract
4. You'll see a success message with the contract ID

### On Google Search Results

1. Perform a Google search for contract opportunities
2. Click on a SAM.gov result to open it
3. The scrape button will appear on the contract page
4. Click to import the contract

## How It Works

1. **Detection**: The extension detects when you're on a contract opportunity page
2. **Extraction**: It extracts structured data from the page (title, content, metadata)
3. **API Call**: Sends the data to `/api/admin/contract-discovery/import`
4. **Storage**: The contract is saved to your MacTech database

## API Endpoint

The extension uses:
```
POST /api/admin/contract-discovery/import
```

Request body:
```json
{
  "url": "https://sam.gov/opp/...",
  "title": "Contract Title",
  "htmlContent": "...",
  "textContent": "...",
  "snippet": "...",
  "domain": "sam.gov",
  "documentType": "SOW",
  "noticeId": "...",
  "solicitationNumber": "...",
  "agency": "...",
  "naicsCodes": ["541511"],
  "setAside": ["SDVOSB"],
  "keywords": ["RMF", "ATO"],
  "sowAttachmentUrl": "...",
  "sowAttachmentType": "PDF"
}
```

## Troubleshooting

### Button doesn't appear
- Make sure you're on a contract opportunity page (SAM.gov or Google search)
- Refresh the page
- Check that the extension is enabled in `chrome://extensions/`

### Import fails
- Check that your API URL is correct in the extension popup
- Verify the API endpoint is accessible
- Check browser console for error messages
- Ensure CORS is configured on your API

### Data not extracted correctly
- Some pages may have different structures
- The extension uses heuristics to extract data
- You can manually verify and update contract data in the MacTech platform

## Development

To modify the extension:

1. Edit files in the `extension/` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Permissions

The extension requires:
- **storage**: To save API URL settings
- **activeTab**: To access the current page content
- **host_permissions**: To access SAM.gov, Google, and your API

## Notes

- This extension performs local DOM scraping only
- Users are responsible for complying with site terms of service
- Intended for internal/testing use only
- The extension gracefully handles errors and provides user feedback
