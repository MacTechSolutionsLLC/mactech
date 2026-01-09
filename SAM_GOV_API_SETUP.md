# SAM.gov API Setup Guide

The contract discovery system uses the official SAM.gov API to search for contract opportunities. You need to register for a free API key to use this feature.

## Getting Your API Key

1. **Register on SAM.gov**
   - Go to https://sam.gov/
   - Create an account or log in if you already have one

2. **Request an API Key**
   - Navigate to your account settings
   - Look for "API Key" or "Developer Access" section
   - Request a new API key
   - Alternatively, visit: https://api.sam.gov/

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
- API Endpoint: https://api.sam.gov/prod/opportunities/v2/search

## Benefits

- ✅ Free to use
- ✅ Official and legal
- ✅ Structured JSON data
- ✅ No rate limiting issues (within reasonable use)
- ✅ Direct access to contract data

## Troubleshooting

If you see "API_KEY_INVALID" errors:
1. Verify your API key is correct
2. Check that the environment variable is set correctly
3. Ensure the API key hasn't expired
4. Try regenerating your API key on SAM.gov

## Alternative

If you prefer not to use the SAM.gov API, you can:
- Use the scraping functionality to manually scrape contract pages
- Set up a different search provider
- Use the existing contract discovery features that don't require API access

