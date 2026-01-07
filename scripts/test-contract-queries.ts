/**
 * Test script to iterate on contract discovery queries
 * Run with: npx tsx scripts/test-contract-queries.ts
 */

import { getJson } from 'serpapi'

const SERPAPI_KEY = process.env.SERPAPI_KEY || process.env.SERP_API_KEY

if (!SERPAPI_KEY) {
  console.error('SERPAPI_KEY or SERP_API_KEY not set')
  process.exit(1)
}

interface QueryTest {
  name: string
  query: string
  description: string
}

const queryTemplates: QueryTest[] = [
  {
    name: 'RMF & ATO Services',
    description: 'Focus on Risk Management Framework and Authorization to Operate contracts',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "Performance Work Statement") ("RMF" OR "Risk Management Framework" OR "ATO" OR "Authorization to Operate" OR "STIG" OR "Security Technical Implementation Guide") after:2024-01-01'
  },
  {
    name: 'Cybersecurity & STIG Compliance',
    description: 'STIG compliance and cybersecurity assessment contracts',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("STIG" OR "Security Technical Implementation Guide" OR "cybersecurity assessment" OR "security control assessment") after:2024-01-01'
  },
  {
    name: 'Infrastructure Engineering',
    description: 'Infrastructure, cloud migration, and systems engineering',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("infrastructure engineering" OR "cloud migration" OR "systems engineering" OR "platform engineering" OR "IaC" OR "infrastructure as code") after:2024-01-01'
  },
  {
    name: 'ISO Compliance & Quality',
    description: 'ISO certification, quality management, and audit readiness',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("ISO 9001" OR "ISO 17025" OR "ISO 27001" OR "quality management system" OR "audit readiness" OR "QMS") after:2024-01-01'
  },
  {
    name: 'Veteran-Owned Set-Asides',
    description: 'SDVOSB and veteran-owned set-aside opportunities',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("SDVOSB" OR "Service-Disabled Veteran" OR "veteran-owned" OR "VOSB") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance") after:2024-01-01'
  },
  {
    name: 'DoD Cybersecurity',
    description: 'Department of Defense cybersecurity and RMF contracts',
    query: 'filetype:pdf site:sam.gov ("Statement of Work" OR "PWS") ("Department of Defense" OR "DoD" OR "Air Force" OR "Navy" OR "Army") ("RMF" OR "ATO" OR "cybersecurity" OR "STIG" OR "security assessment") after:2024-01-01'
  },
  {
    name: 'Continuous Monitoring',
    description: 'ConMon and continuous monitoring services',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Continuous Monitoring" OR "ConMon" OR "continuous assessment" OR "security monitoring") after:2024-01-01'
  },
  {
    name: 'NIST 800-53 Compliance',
    description: 'NIST 800-53 security control implementation and assessment',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NIST 800-53" OR "security controls" OR "control assessment" OR "SCA") after:2024-01-01'
  },
  {
    name: 'CMMC & Defense Contractors',
    description: 'CMMC compliance for defense contractors',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("CMMC" OR "Cybersecurity Maturity Model Certification" OR "defense contractor" OR "DFARS") after:2024-01-01'
  },
  {
    name: 'Boston Area Government Contracts',
    description: 'Government contracts in Boston/New England area',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Boston" OR "Massachusetts" OR "New England" OR "Rhode Island") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance") after:2024-01-01'
  },
  {
    name: 'Small Business Set-Asides',
    description: 'Small business, 8(a), and HUBZone opportunities',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("small business" OR "8(a)" OR "HUBZone" OR "WOSB") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance") after:2024-01-01'
  },
  {
    name: 'NAICS 541330 & 541511',
    description: 'Engineering and cybersecurity services by NAICS codes',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NAICS 541330" OR "NAICS 541511" OR "NAICS 541512") after:2024-01-01'
  }
]

async function testQuery(test: QueryTest) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Testing: ${test.name}`)
  console.log(`Description: ${test.description}`)
  console.log(`Query: ${test.query}`)
  console.log('-'.repeat(80))

  try {
    const results = await getJson({
      engine: 'google',
      q: test.query,
      api_key: SERPAPI_KEY,
      num: 10,
      tbs: 'qdr:y', // Past year
    })

    const organicResults = results.organic_results || []
    
    console.log(`\nResults: ${organicResults.length} found`)
    
    if (organicResults.length > 0) {
      console.log('\nTop 3 Results:')
      organicResults.slice(0, 3).forEach((result: any, idx: number) => {
        console.log(`\n${idx + 1}. ${result.title}`)
        console.log(`   URL: ${result.link}`)
        console.log(`   Domain: ${result.displayed_link || 'N/A'}`)
        console.log(`   Snippet: ${(result.snippet || '').substring(0, 150)}...`)
      })
      
      // Analyze relevance
      const relevantCount = organicResults.filter((r: any) => {
        const text = `${r.title} ${r.snippet || ''}`.toLowerCase()
        return text.includes('statement of work') || 
               text.includes('pws') || 
               text.includes('performance work statement') ||
               text.includes('sow') ||
               r.link.includes('.pdf')
      }).length
      
      console.log(`\nRelevance: ${relevantCount}/${organicResults.length} appear to be contract documents`)
      return {
        name: test.name,
        query: test.query,
        totalResults: organicResults.length,
        relevantResults: relevantCount,
        success: true
      }
    } else {
      console.log('No results found')
      return {
        name: test.name,
        query: test.query,
        totalResults: 0,
        relevantResults: 0,
        success: false
      }
    }
  } catch (error) {
    console.error(`Error testing query: ${error}`)
    return {
      name: test.name,
      query: test.query,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

async function main() {
  console.log('Testing Contract Discovery Query Templates')
  console.log(`Using SerpAPI Key: ${SERPAPI_KEY ? SERPAPI_KEY.substring(0, 10) + '...' : 'NOT SET'}`)
  console.log(`Total queries to test: ${queryTemplates.length}`)

  const results = []
  
  for (const template of queryTemplates) {
    const result = await testQuery(template)
    results.push(result)
    
    // Wait a bit between queries to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log('SUMMARY')
  console.log('='.repeat(80))
  
  const successful = results.filter(r => r.success && r.totalResults > 0)
  const bestQueries = successful
    .sort((a, b) => (b.relevantResults || 0) - (a.relevantResults || 0))
    .slice(0, 5)
  
  console.log(`\nSuccessful queries: ${successful.length}/${results.length}`)
  console.log(`\nTop 5 Most Effective Queries:`)
  
  bestQueries.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.name}`)
    console.log(`   Total Results: ${result.totalResults}`)
    console.log(`   Relevant Results: ${result.relevantResults}`)
    console.log(`   Query: ${result.query}`)
  })

  console.log(`\n${'='.repeat(80)}`)
}

main().catch(console.error)

