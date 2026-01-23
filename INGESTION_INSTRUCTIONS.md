# USAspending & SAM.gov Entity API Ingestion Instructions

## Option 1: Via Admin Portal (Recommended)

1. Navigate to the capture dashboard:
   - Production: `https://mactech-production.up.railway.app/user/capture`
   - Local: `http://localhost:3000/user/capture`

2. Click the **"Fetch USAspending Awards"** button

3. The system will:
   - Discover awards from USAspending.gov
   - Save awards to database
   - Enrich awards with full details
   - Fetch transactions for signal generation
   - Calculate relevance scores (0-100)
   - Generate activity signals (ACTIVE, STABLE, DECLINING, RECOMPETE_WINDOW)
   - Enrich eligible awards with SAM.gov Entity API (relevanceScore >= 60)

## Option 2: Via API Call (Production)

```bash
curl -X POST https://mactech-production.up.railway.app/api/admin/capture/usaspending/ingest \
  -H "Content-Type: application/json" \
  -d '{}'
```

With custom options:
```bash
curl -X POST https://mactech-production.up.railway.app/api/admin/capture/usaspending/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "pagination": {
      "maxPages": 3,
      "limitPerPage": 50
    }
  }'
```

## Option 3: Via Script (Local Development)

```bash
# Install dependencies if needed
npm install

# Run the ingestion script
npx tsx scripts/trigger-usaspending-ingest.ts

# With custom options
npx tsx scripts/trigger-usaspending-ingest.ts --maxPages 3 --limitPerPage 50
```

## Default Configuration

- **Date Range**: 2022-01-01 to 2026-12-31
- **NAICS Codes**: 541512, 541511, 541519 (Computer Systems Design, Custom Programming, Other Computer Related Services)
- **Award Types**: A (Contracts), B (Grants)
- **Agency**: Department of Defense
- **Max Pages**: 5 (hard limit to prevent unbounded pagination)
- **Limit Per Page**: 50 awards

## What Happens During Ingestion

1. **Discovery**: Fetches awards from USAspending.gov API
   - Handles intermittent 500 errors gracefully
   - Stops pagination after first 500 error
   - Preserves any awards already collected

2. **Saving**: Saves discovered awards to database
   - Sets `enrichment_status = 'pending'`
   - Only saves if awards were successfully discovered

3. **Enrichment**: Enriches awards with full details
   - Fetches complete award data from USAspending
   - Updates `enrichment_status = 'completed'`

4. **Transaction Fetching**: Fetches transactions for signal generation
   - Used to calculate activity signals
   - Not displayed raw, only used for signals

5. **Scoring**: Calculates relevance scores (0-100)
   - Based on NAICS codes, agency, keywords, dates, amounts
   - Stored in `relevance_score` field

6. **Signal Generation**: Generates activity signals
   - ACTIVE: Recent activity, future PoP
   - STABLE: Multiple mods, low volatility
   - DECLINING: Negative obligations, no activity
   - RECOMPETE_WINDOW: PoP ending within 24 months

7. **Entity API Enrichment**: Enriches eligible awards with SAM.gov Entity API
   - Only for awards with `relevance_score >= 60` AND `recipient_name` exists
   - Best-effort enrichment (non-fatal if it fails)
   - Empty results are valid (vendor may not be in SAM.gov)
   - Stores entity data in `recipient_entity_data` field

## Expected Behavior

- **Success**: Awards discovered, saved, enriched, and scored
- **Degraded**: Some pages failed with 500 errors, but partial results collected
- **Failed**: All pages failed (upstream API unavailable)

The system will **never crash** on discovery failures - it handles 500 errors gracefully and continues with whatever data was successfully collected.

## Monitoring

Check the logs in Railway or your local console to see:
- Discovery progress
- Enrichment status
- Entity API enrichment results
- Any warnings or errors

## Notes

- USAspending API may intermittently return 500 errors on heavy queries (expected behavior)
- The system handles these gracefully and preserves any awards already collected
- SAM.gov Entity API enrichment is best-effort and non-fatal
- Empty Entity API results are valid (vendor may not be registered in SAM.gov)
