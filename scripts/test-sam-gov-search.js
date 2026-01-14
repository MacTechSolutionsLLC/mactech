/**
 * Validation Test Script for SAM.gov Keyword Search
 * 
 * This script tests the improved keyword filtering and relevance scoring.
 * 
 * Usage:
 *   1. Start the Next.js dev server: npm run dev
 *   2. Run this script: node scripts/test-sam-gov-search.js
 * 
 * Requires Node.js 18+ (for fetch) or install node-fetch: npm install node-fetch
 */

// Use node-fetch if available, otherwise use global fetch (Node 18+)
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  fetch = globalThis.fetch;
  if (!fetch) {
    console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch');
    process.exit(1);
  }
}

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testSearch(keywords, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${description}`);
  console.log(`Keywords: "${keywords}"`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/admin/contract-discovery/search-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: keywords,
        service_category: 'general',
        date_range: 'past_month',
        limit: 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ API Error (${response.status}):`, error);
      return false;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Search failed:', data.error || data.message);
      return false;
    }

    console.log(`✅ Search successful`);
    console.log(`   Total records from API: ${data.totalRecords || 0}`);
    console.log(`   Results returned: ${data.results_count || 0}`);
    console.log(`   Cached: ${data.cached ? 'Yes' : 'No'}`);
    console.log(`   Duration: ${data.duration || 0}ms\n`);

    // Validate keyword filtering
    const keywordsArray = keywords.split(',').map(k => k.trim().toLowerCase());
    const results = data.results || [];
    
    console.log('📊 Validation Results:');
    console.log(`   Total results: ${results.length}`);
    
    let keywordMatches = 0;
    let titleMatches = 0;
    let descriptionMatches = 0;
    let noKeywordMatches = 0;
    let highRelevanceCount = 0;

    results.forEach((result, index) => {
      const title = (result.title || '').toLowerCase();
      const description = (result.description || result.snippet || '').toLowerCase();
      const combined = `${title} ${description}`;
      
      const hasKeyword = keywordsArray.some(keyword => 
        combined.includes(keyword.toLowerCase())
      );
      
      const hasTitleMatch = keywordsArray.some(keyword => 
        title.includes(keyword.toLowerCase())
      );
      
      const hasDescMatch = keywordsArray.some(keyword => 
        description.includes(keyword.toLowerCase())
      );

      if (hasKeyword) keywordMatches++;
      if (hasTitleMatch) titleMatches++;
      if (hasDescMatch) descriptionMatches++;
      if (!hasKeyword) noKeywordMatches++;
      
      const relevance = result.relevance_score || 0;
      if (relevance >= 70) highRelevanceCount++;

      // Show first few results for inspection
      if (index < 3) {
        console.log(`\n   Result ${index + 1}:`);
        console.log(`      Title: ${result.title?.substring(0, 60)}...`);
        console.log(`      Relevance: ${relevance}`);
        console.log(`      Has keyword: ${hasKeyword ? '✅' : '❌'}`);
        console.log(`      Title match: ${hasTitleMatch ? '✅' : '❌'}`);
        console.log(`      Description match: ${hasDescMatch ? '✅' : '❌'}`);
      }
    });

    console.log(`\n   ✅ Results with keywords: ${keywordMatches}/${results.length}`);
    console.log(`   ✅ Results with title matches: ${titleMatches}/${results.length}`);
    console.log(`   ✅ Results with description matches: ${descriptionMatches}/${results.length}`);
    console.log(`   ✅ High relevance (≥70): ${highRelevanceCount}/${results.length}`);
    console.log(`   ❌ Results without keywords: ${noKeywordMatches}/${results.length}`);

    // Validation checks
    const allHaveKeywords = noKeywordMatches === 0;
    const hasTitleMatches = titleMatches > 0;
    const hasHighRelevance = highRelevanceCount > 0;

    console.log(`\n📋 Validation Summary:`);
    console.log(`   ${allHaveKeywords ? '✅' : '❌'} All results contain keywords: ${allHaveKeywords}`);
    console.log(`   ${hasTitleMatches ? '✅' : '⚠️'} Has title matches: ${hasTitleMatches}`);
    console.log(`   ${hasHighRelevance ? '✅' : '⚠️'} Has high relevance results: ${hasHighRelevance}`);

    // Show API call details if available
    if (data.apiCallDetails) {
      console.log(`\n🔗 API Call Details:`);
      console.log(`   Keyword: ${data.apiCallDetails.keyword || 'N/A'}`);
      console.log(`   Set-Aside: ${data.apiCallDetails.setAside?.join(', ') || 'None'}`);
      console.log(`   Date Range: ${data.apiCallDetails.dateRange || 'N/A'}`);
      if (data.apiCallDetails.apiUrl) {
        console.log(`   API URL: ${data.apiCallDetails.apiUrl.substring(0, 100)}...`);
      }
    }

    return {
      success: true,
      allHaveKeywords,
      hasTitleMatches,
      hasHighRelevance,
      totalResults: results.length,
    };
  } catch (error) {
    console.error(`❌ Test failed with error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🧪 SAM.gov Keyword Search Validation Tests');
  console.log('='.repeat(60));
  console.log(`Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));

  const tests = [
    {
      keywords: 'metrology',
      description: 'Single keyword search - should only return metrology-related results',
    },
    {
      keywords: 'cybersecurity, RMF',
      description: 'Multiple keywords - should return cybersecurity/RMF opportunities',
    },
    {
      keywords: 'calibration',
      description: 'Another single keyword - should filter to calibration-related results',
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await testSearch(test.keywords, test.description);
    results.push({ ...test, ...result });
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Summary');
  console.log(`${'='.repeat(60)}\n`);

  const passed = results.filter(r => r.success && r.allHaveKeywords).length;
  const total = results.filter(r => r.success !== undefined).length;

  results.forEach((result, index) => {
    const status = result.success && result.allHaveKeywords ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.description}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log(`${'='.repeat(60)}\n`);

  return { passed, total, results };
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testSearch, runAllTests };

