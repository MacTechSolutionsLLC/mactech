/**
 * Test SAM.gov Entity Management API Endpoints
 * 
 * Tests SAM.gov Entity API with various sections and filters
 * to understand available data and identify useful features.
 */

const BASE_URL = 'https://api.sam.gov/entity-information/v4'

interface TestResult {
  endpoint: string
  params: Record<string, any>
  success: boolean
  statusCode?: number
  responseTime?: number
  data?: any
  error?: string
  responseStructure?: {
    keys?: string[]
    sampleData?: any
    recordCount?: number
    sections?: string[]
  }
}

/**
 * Make API request with error handling
 */
async function makeRequest(
  endpoint: string,
  params: Record<string, any> = {},
  usePost: boolean = false
): Promise<{ success: boolean; statusCode?: number; data?: any; error?: string; responseTime?: number }> {
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  if (!apiKey) {
    console.warn('[SAM.gov Entity API] Warning: SAM_GOV_API_KEY or SAM_API_KEY not set. Tests may fail.')
    return {
      success: false,
      error: 'API key not set',
    }
  }
  
  const url = new URL(`${BASE_URL}${endpoint}`)
  
  // Add API key to query params
  url.searchParams.append('api_key', apiKey)
  
  // Add other params
  if (!usePost) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  const startTime = Date.now()
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'MacTech Contract Discovery/1.0',
    }
    
    // Add API key to headers as well (for FOUO/Sensitive)
    headers['x-api-key'] = apiKey
    
    // For POST requests (Sensitive data), add Content-Type
    if (usePost) {
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(url.toString(), {
      method: usePost ? 'POST' : 'GET',
      headers,
      body: usePost ? JSON.stringify(params) : undefined,
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
 * Analyze response structure
 */
function analyzeResponse(data: any): { keys?: string[]; sampleData?: any; recordCount?: number; sections?: string[] } {
  if (!data) return {}
  
  const structure: { keys?: string[]; sampleData?: any; recordCount?: number; sections?: string[] } = {}
  
  if (Array.isArray(data)) {
    structure.recordCount = data.length
    if (data.length > 0) {
      structure.keys = Object.keys(data[0])
      structure.sampleData = data[0]
    }
  } else if (typeof data === 'object') {
    structure.keys = Object.keys(data)
    
    // Check for entityData array
    if (data.entityData && Array.isArray(data.entityData)) {
      structure.recordCount = data.entityData.length
      if (data.entityData.length > 0) {
        const firstEntity = data.entityData[0]
        structure.keys = Object.keys(firstEntity)
        structure.sections = Object.keys(firstEntity).filter(key => 
          typeof firstEntity[key] === 'object' && firstEntity[key] !== null
        )
        structure.sampleData = firstEntity
      }
    } else {
      structure.sampleData = data
    }
  }
  
  return structure
}

/**
 * Test basic entity search with default sections
 */
async function testBasicEntitySearch(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { naicsCode: '541512', size: 5 },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test entity search with integrityInformation section
 */
async function testIntegrityInformation(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,integrityInformation',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,integrityInformation',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test entity search with repsAndCerts section
 */
async function testRepsAndCerts(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,repsAndCerts',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,repsAndCerts',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test entity search with assertions section
 */
async function testAssertions(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,assertions',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,assertions',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test entity search with all sections
 */
async function testAllSections(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'All',
    size: 3,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'All',
      size: 3,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test proceedingsData filter (v3/v4)
 */
async function testProceedingsData(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,integrityInformation',
    proceedingsData: 'Yes',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,integrityInformation',
      proceedingsData: 'Yes',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test responsibilityQualificationType filter
 */
async function testResponsibilityQualificationType(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,integrityInformation',
    responsibilityQualificationType: 'Responsible',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,integrityInformation',
      responsibilityQualificationType: 'Responsible',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test evsMonitoring filter
 */
async function testEvsMonitoring(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData',
    evsMonitoring: 'Yes',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData',
      evsMonitoring: 'Yes',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test socio-economic status filter
 */
async function testSocioEconomicStatus(): Promise<TestResult> {
  const result = await makeRequest('/entities', {
    naicsCode: '541512',
    includeSections: 'entityRegistration,coreData,repsAndCerts',
    socioEconomicStatus: 'SDVOSB',
    size: 5,
    page: 1,
  })
  
  return {
    endpoint: '/entities',
    params: { 
      naicsCode: '541512', 
      includeSections: 'entityRegistration,coreData,repsAndCerts',
      socioEconomicStatus: 'SDVOSB',
      size: 5,
    },
    success: result.success,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    data: result.data,
    error: result.error,
    responseStructure: result.data ? analyzeResponse(result.data) : undefined,
  }
}

/**
 * Test entity lookup by UEI
 */
async function testEntityByUei(): Promise<TestResult> {
  // First, get a sample UEI from a basic search
  const searchResult = await makeRequest('/entities', {
    naicsCode: '541512',
    size: 1,
    page: 1,
  })
  
  if (!searchResult.success || !searchResult.data?.entityData?.[0]?.ueiSAM) {
    return {
      endpoint: '/entities',
      params: { ueiSAM: 'sample' },
      success: false,
      error: 'Could not find sample UEI for testing',
    }
  }
  
  const uei = searchResult.data.entityData[0].ueiSAM
  
  const result = await makeRequest('/entities', {
    ueiSAM: uei,
    includeSections: 'All',
  })
  
  return {
    endpoint: '/entities',
    params: { ueiSAM: uei, includeSections: 'All' },
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
  console.log('🧪 Starting SAM.gov Entity API Tests...\n')
  
  const allResults: TestResult[] = []
  
  // Test basic search
  console.log('🔍 Testing basic entity search...')
  const basicResult = await testBasicEntitySearch()
  allResults.push(basicResult)
  console.log(`${basicResult.success ? '✅' : '❌'} Basic search: ${basicResult.statusCode || 'N/A'} (${basicResult.responseStructure?.recordCount || 0} records)\n`)
  
  // Test with integrityInformation section
  console.log('🛡️  Testing integrityInformation section...')
  const integrityResult = await testIntegrityInformation()
  allResults.push(integrityResult)
  console.log(`${integrityResult.success ? '✅' : '❌'} Integrity info: ${integrityResult.statusCode || 'N/A'} (sections: ${integrityResult.responseStructure?.sections?.join(', ') || 'N/A'})\n`)
  
  // Test with repsAndCerts section
  console.log('📋 Testing repsAndCerts section...')
  const repsResult = await testRepsAndCerts()
  allResults.push(repsResult)
  console.log(`${repsResult.success ? '✅' : '❌'} Reps & Certs: ${repsResult.statusCode || 'N/A'} (sections: ${repsResult.responseStructure?.sections?.join(', ') || 'N/A'})\n`)
  
  // Test with assertions section
  console.log('📝 Testing assertions section...')
  const assertionsResult = await testAssertions()
  allResults.push(assertionsResult)
  console.log(`${assertionsResult.success ? '✅' : '❌'} Assertions: ${assertionsResult.statusCode || 'N/A'} (sections: ${assertionsResult.responseStructure?.sections?.join(', ') || 'N/A'})\n`)
  
  // Test with all sections
  console.log('📦 Testing all sections...')
  const allSectionsResult = await testAllSections()
  allResults.push(allSectionsResult)
  console.log(`${allSectionsResult.success ? '✅' : '❌'} All sections: ${allSectionsResult.statusCode || 'N/A'} (sections: ${allSectionsResult.responseStructure?.sections?.join(', ') || 'N/A'})\n`)
  
  // Test proceedingsData filter
  console.log('⚖️  Testing proceedingsData filter...')
  const proceedingsResult = await testProceedingsData()
  allResults.push(proceedingsResult)
  console.log(`${proceedingsResult.success ? '✅' : '❌'} Proceedings data: ${proceedingsResult.statusCode || 'N/A'}\n`)
  
  // Test responsibilityQualificationType filter
  console.log('✅ Testing responsibilityQualificationType filter...')
  const responsibilityResult = await testResponsibilityQualificationType()
  allResults.push(responsibilityResult)
  console.log(`${responsibilityResult.success ? '✅' : '❌'} Responsibility type: ${responsibilityResult.statusCode || 'N/A'}\n`)
  
  // Test evsMonitoring filter
  console.log('🔔 Testing evsMonitoring filter...')
  const evsResult = await testEvsMonitoring()
  allResults.push(evsResult)
  console.log(`${evsResult.success ? '✅' : '❌'} EVS monitoring: ${evsResult.statusCode || 'N/A'}\n`)
  
  // Test socio-economic status filter
  console.log('👥 Testing socioEconomicStatus filter...')
  const socioResult = await testSocioEconomicStatus()
  allResults.push(socioResult)
  console.log(`${socioResult.success ? '✅' : '❌'} Socio-economic: ${socioResult.statusCode || 'N/A'}\n`)
  
  // Test entity lookup by UEI
  console.log('🔑 Testing entity lookup by UEI...')
  const ueiResult = await testEntityByUei()
  allResults.push(ueiResult)
  console.log(`${ueiResult.success ? '✅' : '❌'} UEI lookup: ${ueiResult.statusCode || 'N/A'}\n`)
  
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

