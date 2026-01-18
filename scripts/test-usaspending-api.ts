/**
 * Test USAspending.gov API Endpoints
 * 
 * Tests various USAspending API endpoints to understand available data
 * and identify useful endpoints for improving contract discovery workflows.
 */

import { prisma } from '../lib/prisma'

const BASE_URL = 'https://api.usaspending.gov/api/v2'

interface TestResult {
  endpoint: string
  method: string
  success: boolean
  statusCode?: number
  responseTime?: number
  data?: any
  error?: string
  responseStructure?: {
    keys?: string[]
    sampleData?: any
    recordCount?: number
  }
}

/**
 * Make API request with error handling
 */
async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; statusCode?: number; data?: any; error?: string; responseTime?: number }> {
  const url = `${BASE_URL}${endpoint}`
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })
    
    const responseTime = Date.now() - startTime
    const statusCode = response.status
    
    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        statusCode,
        error: errorText.substring(0, 500),
        responseTime,
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      statusCode,
      data,
      responseTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    }
  }
}

/**
 * Get sample award IDs from database
 */
async function getSampleAwardIds(): Promise<string[]> {
  try {
    const awards = await prisma.usaSpendingAward.findMany({
      take: 5,
      where: {
        award_id: { not: null },
      },
      select: {
        award_id: true,
        generated_unique_award_id: true,
      },
    })
    
    const ids: string[] = []
    for (const award of awards) {
      if (award.award_id) ids.push(award.award_id)
      if (award.generated_unique_award_id) ids.push(award.generated_unique_award_id)
    }
    
    return ids.slice(0, 5) // Return up to 5 IDs
  } catch (error) {
    console.warn('[Test] Could not fetch award IDs from database:', error)
    // Return some known test IDs as fallback
    return ['CONT_AWD_FA466125FG029_9700_FA805523A3011_9700']
  }
}

/**
 * Analyze response structure
 */
function analyzeResponse(data: any): { keys?: string[]; sampleData?: any; recordCount?: number } {
  if (!data) return {}
  
  const structure: { keys?: string[]; sampleData?: any; recordCount?: number } = {}
  
  if (Array.isArray(data)) {
    structure.recordCount = data.length
    if (data.length > 0) {
      structure.keys = Object.keys(data[0])
      structure.sampleData = data[0]
    }
  } else if (typeof data === 'object') {
    structure.keys = Object.keys(data)
    
    // Check for common response patterns
    if (data.results && Array.isArray(data.results)) {
      structure.recordCount = data.results.length
      if (data.results.length > 0) {
        structure.sampleData = data.results[0]
      }
    } else if (data.data && Array.isArray(data.data)) {
      structure.recordCount = data.data.length
      if (data.data.length > 0) {
        structure.sampleData = data.data[0]
      }
    } else {
      structure.sampleData = data
    }
  }
  
  return structure
}

/**
 * Test award funding endpoint
 */
async function testAwardFunding(awardIds: string[]): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  for (const awardId of awardIds.slice(0, 2)) { // Test with 2 awards
    const result = await makeRequest('/awards/funding', {
      method: 'POST',
      body: JSON.stringify({
        filters: {
          award_id: awardId,
        },
      }),
    })
    
    results.push({
      endpoint: `/awards/funding`,
      method: 'POST',
      success: result.success,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      data: result.data,
      error: result.error,
      responseStructure: result.data ? analyzeResponse(result.data) : undefined,
    })
  }
  
  return results
}

/**
 * Test award funding rollup endpoint
 */
async function testAwardFundingRollup(awardIds: string[]): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  for (const awardId of awardIds.slice(0, 2)) {
    const result = await makeRequest('/awards/funding_rollup', {
      method: 'POST',
      body: JSON.stringify({
        filters: {
          award_id: awardId,
        },
      }),
    })
    
    results.push({
      endpoint: `/awards/funding_rollup`,
      method: 'POST',
      success: result.success,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      data: result.data,
      error: result.error,
      responseStructure: result.data ? analyzeResponse(result.data) : undefined,
    })
  }
  
  return results
}

/**
 * Test award accounts endpoint
 */
async function testAwardAccounts(awardIds: string[]): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  for (const awardId of awardIds.slice(0, 2)) {
    const result = await makeRequest('/awards/accounts', {
      method: 'POST',
      body: JSON.stringify({
        filters: {
          award_id: awardId,
        },
      }),
    })
    
    results.push({
      endpoint: `/awards/accounts`,
      method: 'POST',
      success: result.success,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      data: result.data,
      error: result.error,
      responseStructure: result.data ? analyzeResponse(result.data) : undefined,
    })
  }
  
  return results
}

/**
 * Test transaction-level search
 */
async function testSpendingByTransaction(): Promise<TestResult> {
  const result = await makeRequest('/search/spending_by_transaction/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['A'],
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
        naics_codes: ['541512'],
      },
      page: 1,
      limit: 10,
      sort: 'action_date',
      order: 'desc',
      fields: [
        'transaction_id',
        'award_id',
        'federal_action_obligation',
        'action_date',
        'awarding_agency',
        'recipient',
      ],
    }),
  })
  
  return {
    endpoint: `/search/spending_by_transaction/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test grouped transactions endpoint
 */
async function testSpendingByTransactionGrouped(): Promise<TestResult> {
  const result = await makeRequest('/search/spending_by_transaction_grouped/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['A'],
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
        naics_codes: ['541512'],
      },
      page: 1,
      limit: 10,
    }),
  })
  
  return {
    endpoint: `/search/spending_by_transaction_grouped/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test geographic spending endpoint
 */
async function testSpendingByGeography(): Promise<TestResult> {
  const result = await makeRequest('/search/spending_by_geography/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['A'],
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
        naics_codes: ['541512'],
      },
      scope: 'state',
      page: 1,
      limit: 10,
    }),
  })
  
  return {
    endpoint: `/search/spending_by_geography/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test CFDA category endpoint
 */
async function testSpendingByCategoryCfda(): Promise<TestResult> {
  const result = await makeRequest('/search/spending_by_category/cfda/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['B'], // Grants use CFDA
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
      },
      page: 1,
      limit: 10,
    }),
  })
  
  return {
    endpoint: `/search/spending_by_category/cfda/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test recipient endpoint
 */
async function testRecipient(): Promise<TestResult> {
  const result = await makeRequest('/recipient/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        keyword: 'technology',
      },
      page: 1,
      limit: 10,
    }),
  })
  
  return {
    endpoint: `/recipient/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test IDV awards endpoint
 */
async function testIdvAwards(): Promise<TestResult> {
  // First, get a sample IDV award ID
  const searchResult = await makeRequest('/search/spending_by_award/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['IDV_A', 'IDV_B'],
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
      },
      page: 1,
      limit: 1,
      fields: ['award_id', 'generated_unique_award_id'],
    }),
  })
  
  if (!searchResult.success || !searchResult.data) {
    return {
      endpoint: `/idvs/awards/`,
      method: 'POST',
      success: false,
      error: 'Could not find IDV award for testing',
    }
  }
  
  const awards = searchResult.data.results || []
  if (awards.length === 0) {
    return {
      endpoint: `/idvs/awards/`,
      method: 'POST',
      success: false,
      error: 'No IDV awards found',
    }
  }
  
  const idvAwardId = awards[0].award_id || awards[0].generated_unique_award_id
  
  const result = await makeRequest('/idvs/awards/', {
    method: 'POST',
    body: JSON.stringify({
      award_id: idvAwardId,
      page: 1,
      limit: 10,
    }),
  })
  
  return {
    endpoint: `/idvs/awards/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test IDV funding endpoint
 */
async function testIdvFunding(): Promise<TestResult> {
  // Get a sample IDV award ID
  const searchResult = await makeRequest('/search/spending_by_award/', {
    method: 'POST',
    body: JSON.stringify({
      filters: {
        award_type_codes: ['IDV_A', 'IDV_B'],
        time_period: [{
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          date_type: 'action_date',
        }],
      },
      page: 1,
      limit: 1,
      fields: ['award_id', 'generated_unique_award_id'],
    }),
  })
  
  if (!searchResult.success || !searchResult.data) {
    return {
      endpoint: `/idvs/funding/`,
      method: 'POST',
      success: false,
      error: 'Could not find IDV award for testing',
    }
  }
  
  const awards = searchResult.data.results || []
  if (awards.length === 0) {
    return {
      endpoint: `/idvs/funding/`,
      method: 'POST',
      success: false,
      error: 'No IDV awards found',
    }
  }
  
  const idvAwardId = awards[0].award_id || awards[0].generated_unique_award_id
  
  const result = await makeRequest('/idvs/funding/', {
    method: 'POST',
    body: JSON.stringify({
      award_id: idvAwardId,
    }),
  })
  
  return {
    endpoint: `/idvs/funding/`,
    method: 'POST',
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Starting USAspending API Tests...\n')
  
  const allResults: TestResult[] = []
  
  // Get sample award IDs
  console.log('📋 Fetching sample award IDs...')
  const awardIds = await getSampleAwardIds()
  console.log(`✅ Found ${awardIds.length} award IDs: ${awardIds.slice(0, 3).join(', ')}...\n`)
  
  // Test award funding endpoints
  console.log('💰 Testing award funding endpoints...')
  const fundingResults = await testAwardFunding(awardIds)
  allResults.push(...fundingResults)
  console.log(`✅ Tested ${fundingResults.length} funding requests`)
  
  const rollupResults = await testAwardFundingRollup(awardIds)
  allResults.push(...rollupResults)
  console.log(`✅ Tested ${rollupResults.length} funding rollup requests`)
  
  const accountsResults = await testAwardAccounts(awardIds)
  allResults.push(...accountsResults)
  console.log(`✅ Tested ${accountsResults.length} accounts requests\n`)
  
  // Test transaction endpoints
  console.log('📊 Testing transaction endpoints...')
  const transactionResult = await testSpendingByTransaction()
  allResults.push(transactionResult)
  console.log(`${transactionResult.success ? '✅' : '❌'} Transaction search: ${transactionResult.statusCode || 'N/A'}`)
  
  const groupedResult = await testSpendingByTransactionGrouped()
  allResults.push(groupedResult)
  console.log(`${groupedResult.success ? '✅' : '❌'} Grouped transactions: ${groupedResult.statusCode || 'N/A'}\n`)
  
  // Test geographic and category endpoints
  console.log('🌍 Testing geographic and category endpoints...')
  const geographyResult = await testSpendingByGeography()
  allResults.push(geographyResult)
  console.log(`${geographyResult.success ? '✅' : '❌'} Geographic spending: ${geographyResult.statusCode || 'N/A'}`)
  
  const cfdaResult = await testSpendingByCategoryCfda()
  allResults.push(cfdaResult)
  console.log(`${cfdaResult.success ? '✅' : '❌'} CFDA category: ${cfdaResult.statusCode || 'N/A'}\n`)
  
  // Test recipient endpoint
  console.log('👥 Testing recipient endpoint...')
  const recipientResult = await testRecipient()
  allResults.push(recipientResult)
  console.log(`${recipientResult.success ? '✅' : '❌'} Recipient search: ${recipientResult.statusCode || 'N/A'}\n`)
  
  // Test IDV endpoints
  console.log('🚚 Testing IDV endpoints...')
  const idvAwardsResult = await testIdvAwards()
  allResults.push(idvAwardsResult)
  console.log(`${idvAwardsResult.success ? '✅' : '❌'} IDV awards: ${idvAwardsResult.statusCode || 'N/A'}`)
  
  const idvFundingResult = await testIdvFunding()
  allResults.push(idvFundingResult)
  console.log(`${idvFundingResult.success ? '✅' : '❌'} IDV funding: ${idvFundingResult.statusCode || 'N/A'}\n`)
  
  // Summary
  console.log('\n📊 Test Summary:')
  console.log('='.repeat(60))
  const successful = allResults.filter(r => r.success).length
  const failed = allResults.filter(r => !r.success).length
  console.log(`Total tests: ${allResults.length}`)
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('='.repeat(60))
  
  // Return results for documentation
  return allResults
}

// Run if executed directly
if (require.main === module) {
  runTests()
    .then((results) => {
      console.log('\n✅ Tests completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test execution failed:', error)
      process.exit(1)
    })
}

export { runTests, TestResult }

