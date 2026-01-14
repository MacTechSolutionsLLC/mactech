# SAM.gov API Setup Guide

The contract discovery system uses the official SAM.gov Opportunities API v2 to search for contract opportunities. You need to register for a free API key to use this feature.

## Getting Your API Key

1. **Register on SAM.gov**
   - Go to https://sam.gov/
   - Create a Login.gov account or log in if you already have one

2. **Generate an API Key**
   - Go to your Profile → API Key Management
   - Generate a new API key
   - Copy the API key (you'll need it for the environment variable)

3. **Add API Key to Environment Variables**
   
   For local development, add to your `.env` file:
   ```
   SAM_GOV_API_KEY=your-api-key-here
   ```
   
   Or use:
   ```
   SAM_API_KEY=your-api-key-here
   ```
   
   For Railway/production:
   - Go to your Railway project settings
   - Navigate to "Variables"
   - Add `SAM_GOV_API_KEY` with your API key value
   - Redeploy your application

## API Documentation

- Official SAM.gov API Documentation: https://open.gsa.gov/api/opportunities-api/
- **Correct API Endpoint**: `https://api.sam.gov/opportunities/v2/search` (no `/prod/` in path)
- Authentication: `X-API-KEY` header (not query parameter)

## Supported Parameters

The API supports the following search parameters:

- `keywords` - Comma or space-separated keywords
- `naics` - NAICS code(s), comma-separated
- `setAside` - Set-aside codes (SDVOSB, VOSB, SB, 8A, HZC, NONE), comma-separated
- `ptype` - Solicitation type (RFI, PRESOL, COMBINE, SRCSGT, SNOTE, SSALE, AWARD, JA, ITB)
- `postedFrom` / `postedTo` - Date range (MM/DD/YYYY format)
- `agency` - Agency code (e.g., 9700 for DoD)
- `limit` - Results per page (default: 25, max: 100)
- `offset` - Pagination offset (default: 0)

## Set-Aside Codes

Use exact codes:
- `SDVOSB` - Service-Disabled Veteran-Owned Small Business
- `VOSB` - Veteran-Owned Small Business
- `SB` - Small Business
- `8A` - 8(a) Business Development Program
- `HZC` - HUBZone
- `NONE` - Full & Open competition

## Example API Calls

### SDVOSB Cyber / RMF / Security Contracts
```
GET https://api.sam.gov/opportunities/v2/search?keywords=cybersecurity,RMF,STIG&setAside=SDVOSB&naics=541512,541511&limit=25
Headers: X-API-KEY: your-api-key
```

### RFI Opportunities (Early Capture)
```
GET https://api.sam.gov/opportunities/v2/search?keywords=consulting,advisory&ptype=RFI&limit=25
Headers: X-API-KEY: your-api-key
```

### DoD Opportunities Only
```
GET https://api.sam.gov/opportunities/v2/search?agency=9700&postedFrom=01/01/2026&limit=50
Headers: X-API-KEY: your-api-key
```

## Rate Limits

SAM.gov API has daily request limits based on account type:
- Non-federal user (no role): 10 requests/day
- Non-federal user (with role): 1,000 requests/day
- Federal user: 1,000 requests/day
- Non-federal system: 1,000 requests/day
- Federal system: 10,000 requests/day

The system includes caching (5-minute TTL) to reduce API calls.

## Benefits

- ✅ Free to use
- ✅ Official and legal
- ✅ Structured JSON data
- ✅ Direct access to contract data
- ✅ Supports multiple set-asides in one call
- ✅ Proper keyword filtering and relevance scoring

## Troubleshooting

### API Key Errors
If you see "API_KEY_INVALID" or 401 errors:
1. Verify your API key is correct
2. Check that the environment variable is set correctly (`SAM_GOV_API_KEY`)
3. Ensure the API key hasn't expired
4. Try regenerating your API key on SAM.gov
5. Verify the API key is being sent in the `X-API-KEY` header (not query parameter)

### Rate Limit Errors
If you see rate limit (429) errors:
1. Wait for the rate limit window to reset
2. Check your account type and daily limits
3. The system caches results for 5 minutes to reduce API calls
4. Consider upgrading your API key tier if needed

### No Results
If searches return no results:
1. Verify keywords are spelled correctly
2. Try broader keywords
3. Check date range (try "Past Year" instead of "Past Month")
4. Remove NAICS code filters to see more results
5. Check that set-aside codes are correct (SDVOSB, VOSB, etc.)

## Implementation Notes

- The system uses the **correct endpoint**: `https://api.sam.gov/opportunities/v2/search` (no `/prod/`)
- Authentication uses **X-API-KEY header** (not query parameter)
- Multiple set-asides are supported in a single API call (comma-separated)
- Keywords are filtered client-side to ensure relevance
- Results are scored by relevance (title matches score higher than description matches)


