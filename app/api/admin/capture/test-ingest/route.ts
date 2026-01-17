/**
 * POST /api/admin/capture/test-ingest
 * Test endpoint to verify database is ready for 3-tier API ingestion
 * 
 * This endpoint:
 * 1. Fetches a small sample (1-2 opportunities) from SAM.gov
 * 2. Attempts to store them in the database
 * 3. Verifies all required fields exist
 * 4. Tests USAspending enrichment (if opportunity scores high enough)
 * 5. Tests Entity API enrichment
 * 
 * Returns success/failure with detailed diagnostics
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchSamGovV2 } from '@/lib/sam-gov-api-v2'
import { normalizeOpportunity } from '@/lib/sam/samNormalizer'
import { scoreOpportunity } from '@/lib/scoring/scoreOpportunity'
import { prisma } from '@/lib/prisma'
import { enrichOpportunity } from '@/lib/services/award-enrichment'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const diagnostics: string[] = []
  const errors: string[] = []
  
  try {
    diagnostics.push('🧪 Starting test ingestion...')
    
    // Step 1: Verify database schema
    diagnostics.push('📋 Step 1: Verifying database schema...')
    try {
      // Check if required columns exist by attempting a query
      const testQuery = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'GovernmentContractDiscovery' 
        AND column_name IN ('usaspending_enrichment', 'usaspending_enriched_at', 'usaspending_enrichment_status')
      `
      const columns = (testQuery as any[]).map((r: any) => r.column_name)
      
      if (columns.length < 3) {
        errors.push(`Missing columns: Expected 3, found ${columns.length}. Columns found: ${columns.join(', ')}`)
      } else {
        diagnostics.push(`✅ All required columns exist: ${columns.join(', ')}`)
      }
    } catch (schemaError) {
      errors.push(`Schema check failed: ${schemaError instanceof Error ? schemaError.message : String(schemaError)}`)
    }
    
    // Step 2: Fetch a small sample from SAM.gov (Query A, limit 2)
    diagnostics.push('📡 Step 2: Fetching sample opportunities from SAM.gov...')
    let sampleOpportunities: any[] = []
    try {
      const today = new Date()
      const fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - 30)
      
      const response = await searchSamGovV2({
        ptype: 'r,p,o',
        postedFrom: fromDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
        postedTo: today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
        limit: 2,
        offset: 0,
      })
      
      sampleOpportunities = response.opportunitiesData || []
      diagnostics.push(`✅ Fetched ${sampleOpportunities.length} sample opportunities`)
      
      if (sampleOpportunities.length === 0) {
        errors.push('No opportunities returned from SAM.gov API')
      }
    } catch (fetchError) {
      errors.push(`SAM.gov fetch failed: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`)
    }
    
    if (sampleOpportunities.length === 0) {
      return NextResponse.json({
        success: false,
        errors,
        diagnostics,
        message: 'Test failed: No opportunities to test with',
      }, { status: 400 })
    }
    
    // Step 3: Normalize and score
    diagnostics.push('🔄 Step 3: Normalizing and scoring opportunities...')
    const testOpportunity = sampleOpportunities[0]
    let normalized: any = null
    let score = 0
    
    try {
      const batchId = 'test-batch'
      const ingestRunId = 'test-run'
      normalized = normalizeOpportunity(testOpportunity, 'A', batchId, ingestRunId)
      const scoringResult = scoreOpportunity(testOpportunity) // scoreOpportunity takes raw opportunity, not normalized
      score = scoringResult.score
      diagnostics.push(`✅ Normalized and scored: score=${score}`)
    } catch (normalizeError) {
      errors.push(`Normalization failed: ${normalizeError instanceof Error ? normalizeError.message : String(normalizeError)}`)
    }
    
    if (!normalized) {
      return NextResponse.json({
        success: false,
        errors,
        diagnostics,
        message: 'Test failed: Could not normalize opportunity',
      }, { status: 400 })
    }
    
    // Step 4: Attempt to store in database
    diagnostics.push('💾 Step 4: Testing database storage...')
    try {
      const existing = await prisma.governmentContractDiscovery.findFirst({
        where: { notice_id: normalized.noticeId },
      })
      
      if (existing) {
        // Update existing
        await prisma.governmentContractDiscovery.update({
          where: { id: existing.id },
          data: {
            title: normalized.title,
            agency: normalized.agency,
            naics_codes: JSON.stringify(normalized.naics || []),
            relevance_score: score,
            updated_at: new Date(),
            // Test the new fields
            usaspending_enrichment: null,
            usaspending_enriched_at: null,
            usaspending_enrichment_status: 'pending',
          },
        })
        diagnostics.push(`✅ Updated existing opportunity: ${normalized.noticeId}`)
      } else {
        // Create new
        await prisma.governmentContractDiscovery.create({
          data: {
            google_query: 'test-ingest',
            title: normalized.title,
            url: normalized.uiLink || `https://sam.gov/opp/${normalized.noticeId}`,
            domain: 'sam.gov',
            notice_id: normalized.noticeId,
            agency: normalized.agency,
            naics_codes: JSON.stringify(normalized.naics || []),
            relevance_score: score,
            ingestion_source: 'test',
            ingestion_batch_id: 'test-batch',
            // Test the new fields
            usaspending_enrichment: null,
            usaspending_enriched_at: null,
            usaspending_enrichment_status: 'pending',
          },
        })
        diagnostics.push(`✅ Created new opportunity: ${normalized.noticeId}`)
      }
    } catch (storeError) {
      errors.push(`Storage failed: ${storeError instanceof Error ? storeError.message : String(storeError)}`)
    }
    
    // Step 5: Test USAspending enrichment (if score is high enough)
    if (score >= 70 && normalized) {
      diagnostics.push('🔍 Step 5: Testing USAspending enrichment...')
      try {
        const enrichment = await enrichOpportunity(
          normalized.noticeId,
          normalized,
          {
            useDatabase: false, // Test direct API call
            limit: 5,
            createLinks: false, // Don't create links in test
          }
        )
        
        if (enrichment && enrichment.similar_awards.length > 0) {
          diagnostics.push(`✅ USAspending enrichment successful: Found ${enrichment.similar_awards.length} similar awards`)
          
          // Test Entity API enrichment (check if recipient_entity_data is present)
          const hasEntityData = enrichment.similar_awards.some((award: any) => award.recipient_entity_data)
          if (hasEntityData) {
            diagnostics.push(`✅ Entity API enrichment successful: Found entity data in awards`)
          } else {
            diagnostics.push(`⚠️  Entity API enrichment: No entity data found (may be normal if no UEIs)`)
          }
        } else {
          diagnostics.push(`⚠️  USAspending enrichment: No similar awards found (may be normal)`)
        }
      } catch (enrichError) {
        errors.push(`Enrichment test failed: ${enrichError instanceof Error ? enrichError.message : String(enrichError)}`)
      }
    } else {
      diagnostics.push(`⏭️  Step 5: Skipping enrichment (score ${score} < 70)`)
    }
    
    // Step 6: Cleanup test data
    diagnostics.push('🧹 Step 6: Cleaning up test data...')
    try {
      await prisma.governmentContractDiscovery.deleteMany({
        where: {
          ingestion_batch_id: 'test-batch',
        },
      })
      diagnostics.push('✅ Test data cleaned up')
    } catch (cleanupError) {
      diagnostics.push(`⚠️  Cleanup warning: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`)
    }
    
    const success = errors.length === 0
    
    return NextResponse.json({
      success,
      message: success 
        ? '✅ Test ingestion passed! Database is ready for 3-tier API ingestion.'
        : '❌ Test ingestion failed. See errors below.',
      diagnostics,
      errors: errors.length > 0 ? errors : undefined,
      testResults: {
        opportunitiesFetched: sampleOpportunities.length,
        normalized: normalized ? 1 : 0,
        score,
        stored: true,
        enrichmentTested: score >= 70,
      },
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test ingestion failed with unexpected error',
      error: error instanceof Error ? error.message : String(error),
      diagnostics,
      errors,
    }, { status: 500 })
  }
}

