# Testing SAM.gov Keyword Search Improvements

This document describes how to validate the improvements made to the SAM.gov keyword search functionality.

## Changes Made

1. **Client-side keyword filtering**: Results are now filtered to ensure they contain the search keywords
2. **Improved relevance scoring**: 
   - +50 points (plus +20 per additional match) for keywords in title
   - +20 points (plus +10 per additional match) for keywords in description
   - -40 points penalty for results without keywords
3. **Fixed API URL display**: Shows correct information when multiple set-asides are used

## Manual Testing

### Option 1: Using the Web UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/contract-discovery`

3. Test searches:
   - Enter "metrology" in the keywords field
   - Click "Search Contracts"
   - Verify that all results contain "metrology" in the title or description
   - Check that results with "metrology" in the title have higher relevance scores

### Option 2: Using the Test Script (Node.js)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   node scripts/test-sam-gov-search.js
   ```

   The script will:
   - Test multiple keyword searches
   - Validate that all results contain the keywords
   - Check relevance scoring
   - Show detailed results

### Option 3: Using curl

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run the bash test script:
   ```bash
   bash scripts/test-sam-gov-search.sh
   ```

3. Or test manually with curl:
   ```bash
   curl -X POST http://localhost:3000/api/admin/contract-discovery/search-v2 \
     -H "Content-Type: application/json" \
     -d '{
       "keywords": "metrology",
       "service_category": "general",
       "date_range": "past_month",
       "limit": 10
     }' | jq '.'
   ```

## What to Validate

### 1. Keyword Filtering
- ✅ All returned results should contain at least one of the search keywords
- ✅ Results without keywords should be filtered out
- ✅ Check the console logs for "Filtered X results that didn't contain keywords"

### 2. Relevance Scoring
- ✅ Results with keywords in the title should have higher relevance scores (≥70)
- ✅ Results with keywords only in description should have moderate scores (50-70)
- ✅ Results without keywords should be filtered out (not appear in results)

### 3. API URL Display
- ✅ When multiple set-asides (SDVOSB, VOSB) are used, the API URL should indicate multiple calls
- ✅ The displayed URL should show only one setAside parameter (not multiple)

### 4. Performance
- ✅ Search should complete in reasonable time (< 5 seconds typically)
- ✅ Results should be cached for 5 minutes (subsequent identical searches should be faster)

## Expected Results for "metrology" Search

Before the fix:
- ❌ Many irrelevant results (dairy, relays, etc.)
- ❌ Results that don't contain "metrology"

After the fix:
- ✅ Only results containing "metrology" in title or description
- ✅ Higher relevance scores for results with "metrology" in title
- ✅ Irrelevant results filtered out

## Troubleshooting

### No results returned
- Check that SAM_GOV_API_KEY is set in your environment
- Verify the API is not rate-limited
- Check server logs for errors

### Results still contain irrelevant items
- Verify the filtering logic is running (check console logs)
- Check that keywords are being parsed correctly
- Ensure the API is returning the expected data structure

### Low relevance scores
- Check that keyword matching is working (keywords should appear in title/description)
- Verify the scoring logic is being applied
- Check that results actually contain the keywords

## API Endpoints

- **Search v2**: `POST /api/admin/contract-discovery/search-v2`
  - Uses the new filtering and scoring logic
  - Recommended for testing

- **Search (legacy)**: `POST /api/admin/contract-discovery/search`
  - Also updated with filtering
  - Used by some older code paths

