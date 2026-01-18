/**
 * Run all API tests and generate documentation
 * 
 * This script runs both USAspending and SAM.gov Entity API tests
 * and generates a comprehensive documentation file.
 */

import { runTests as runUsaSpendingTests } from './test-usaspending-api'
import { runTests as runSamEntityTests } from './test-sam-entity-api'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  endpoint: string
  method?: string
  params?: Record<string, any>
  success: boolean
  statusCode?: number
  responseTime?: number
  error?: string
  responseStructure?: {
    keys?: string[]
    sampleData?: any
    recordCount?: number
    sections?: string[]
  }
}

/**
 * Format test results as markdown
 */
function formatResultsAsMarkdown(
  usaspendingResults: TestResult[],
  samEntityResults: TestResult[]
): string {
  const timestamp = new Date().toISOString()
  
  let markdown = `# API Testing Results\n\n`
  markdown += `**Generated:** ${timestamp}\n\n`
  markdown += `## Overview\n\n`
  markdown += `This document contains test results for USAspending.gov and SAM.gov Entity Management APIs.\n\n`
  
  // USAspending Results
  markdown += `## USAspending.gov API Tests\n\n`
  markdown += `**Total Tests:** ${usaspendingResults.length}\n`
  markdown += `**Successful:** ${usaspendingResults.filter(r => r.success).length}\n`
  markdown += `**Failed:** ${usaspendingResults.filter(r => !r.success).length}\n\n`
  
  for (const result of usaspendingResults) {
    markdown += `### ${result.endpoint}\n\n`
    markdown += `- **Method:** ${result.method || 'N/A'}\n`
    markdown += `- **Status:** ${result.success ? '✅ Success' : '❌ Failed'}\n`
    if (result.statusCode) {
      markdown += `- **HTTP Status:** ${result.statusCode}\n`
    }
    if (result.responseTime) {
      markdown += `- **Response Time:** ${result.responseTime}ms\n`
    }
    if (result.error) {
      markdown += `- **Error:** ${result.error}\n`
    }
    if (result.responseStructure) {
      if (result.responseStructure.recordCount !== undefined) {
        markdown += `- **Records Returned:** ${result.responseStructure.recordCount}\n`
      }
      if (result.responseStructure.keys && result.responseStructure.keys.length > 0) {
        markdown += `- **Response Keys:** ${result.responseStructure.keys.slice(0, 20).join(', ')}${result.responseStructure.keys.length > 20 ? '...' : ''}\n`
      }
    }
    markdown += `\n`
  }
  
  // SAM.gov Entity Results
  markdown += `## SAM.gov Entity Management API Tests\n\n`
  markdown += `**Total Tests:** ${samEntityResults.length}\n`
  markdown += `**Successful:** ${samEntityResults.filter(r => r.success).length}\n`
  markdown += `**Failed:** ${samEntityResults.filter(r => !r.success).length}\n\n`
  
  for (const result of samEntityResults) {
    markdown += `### ${result.endpoint}\n\n`
    if (result.params) {
      markdown += `- **Parameters:** ${JSON.stringify(result.params, null, 2)}\n`
    }
    markdown += `- **Status:** ${result.success ? '✅ Success' : '❌ Failed'}\n`
    if (result.statusCode) {
      markdown += `- **HTTP Status:** ${result.statusCode}\n`
    }
    if (result.responseTime) {
      markdown += `- **Response Time:** ${result.responseTime}ms\n`
    }
    if (result.error) {
      markdown += `- **Error:** ${result.error}\n`
    }
    if (result.responseStructure) {
      if (result.responseStructure.recordCount !== undefined) {
        markdown += `- **Records Returned:** ${result.responseStructure.recordCount}\n`
      }
      if (result.responseStructure.sections && result.responseStructure.sections.length > 0) {
        markdown += `- **Sections Available:** ${result.responseStructure.sections.join(', ')}\n`
      }
      if (result.responseStructure.keys && result.responseStructure.keys.length > 0) {
        markdown += `- **Response Keys:** ${result.responseStructure.keys.slice(0, 20).join(', ')}${result.responseStructure.keys.length > 20 ? '...' : ''}\n`
      }
    }
    markdown += `\n`
  }
  
  // Integration Opportunities
  markdown += `## Integration Opportunities\n\n`
  
  const successfulUsaSpending = usaspendingResults.filter(r => r.success)
  const successfulSamEntity = samEntityResults.filter(r => r.success)
  
  markdown += `### USAspending.gov Endpoints for Integration\n\n`
  for (const result of successfulUsaSpending) {
    markdown += `- **${result.endpoint}** - ${result.responseStructure?.recordCount ? `Returns ${result.responseStructure.recordCount} records` : 'Available'}\n`
  }
  
  markdown += `\n### SAM.gov Entity API Features for Integration\n\n`
  for (const result of successfulSamEntity) {
    if (result.params?.includeSections) {
      markdown += `- **${result.params.includeSections}** section - Available\n`
    }
    if (result.params?.proceedingsData) {
      markdown += `- **proceedingsData** filter - Available\n`
    }
    if (result.params?.responsibilityQualificationType) {
      markdown += `- **responsibilityQualificationType** filter - Available\n`
    }
    if (result.params?.evsMonitoring) {
      markdown += `- **evsMonitoring** filter - Available\n`
    }
  }
  
  markdown += `\n## Recommendations\n\n`
  
  // Generate recommendations based on successful tests
  const recommendations: string[] = []
  
  if (successfulUsaSpending.some(r => r.endpoint.includes('/awards/funding'))) {
    recommendations.push('Consider using `/awards/funding` endpoint to enrich award data with detailed funding breakdowns')
  }
  
  if (successfulUsaSpending.some(r => r.endpoint.includes('/search/spending_by_transaction_grouped'))) {
    recommendations.push('Use `/search/spending_by_transaction_grouped/` for better understanding of award composition')
  }
  
  if (successfulSamEntity.some(r => r.params?.includeSections?.includes('integrityInformation'))) {
    recommendations.push('Include `integrityInformation` section in SAM.gov Entity API calls for vendor risk assessment')
  }
  
  if (successfulSamEntity.some(r => r.params?.includeSections?.includes('repsAndCerts'))) {
    recommendations.push('Include `repsAndCerts` section to identify socio-economic status and set-aside eligibility')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Review failed tests and adjust parameters or request structure')
    recommendations.push('Consider rate limiting and API key permissions for SAM.gov Entity API')
  }
  
  for (const rec of recommendations) {
    markdown += `- ${rec}\n`
  }
  
  return markdown
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Running all API tests...\n')
  
  try {
    // Run USAspending tests
    console.log('📊 Running USAspending.gov API tests...')
    const usaspendingResults = await runUsaSpendingTests()
    console.log(`✅ USAspending tests completed: ${usaspendingResults.length} tests\n`)
    
    // Run SAM.gov Entity tests
    console.log('📋 Running SAM.gov Entity API tests...')
    const samEntityResults = await runSamEntityTests()
    console.log(`✅ SAM.gov Entity tests completed: ${samEntityResults.length} tests\n`)
    
    // Generate documentation
    console.log('📝 Generating documentation...')
    const markdown = formatResultsAsMarkdown(usaspendingResults, samEntityResults)
    
    // Ensure docs directory exists
    const docsDir = path.join(process.cwd(), 'docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }
    
    // Write documentation
    const outputPath = path.join(docsDir, 'API_TESTING_RESULTS.md')
    fs.writeFileSync(outputPath, markdown)
    console.log(`✅ Documentation written to: ${outputPath}\n`)
    
    // Summary
    const totalTests = usaspendingResults.length + samEntityResults.length
    const totalSuccessful = 
      usaspendingResults.filter(r => r.success).length +
      samEntityResults.filter(r => r.success).length
    
    console.log('📊 Final Summary:')
    console.log('='.repeat(60))
    console.log(`Total tests: ${totalTests}`)
    console.log(`✅ Successful: ${totalSuccessful}`)
    console.log(`❌ Failed: ${totalTests - totalSuccessful}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { main }

