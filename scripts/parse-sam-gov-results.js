#!/usr/bin/env node

/**
 * SAM.gov API Results Parser
 * 
 * Runs a curl command to the SAM.gov API and parses results based on keyword relevance.
 * 
 * Usage:
 *   node scripts/parse-sam-gov-results.js
 * 
 * Or make it executable:
 *   chmod +x scripts/parse-sam-gov-results.js
 *   ./scripts/parse-sam-gov-results.js
 */

const { execSync } = require('child_process');

// API Configuration
const API_KEY = 'SAM-b3bbb32f-f69d-4dab-9de1-45e225afa396';
const API_URL = 'https://api.sam.gov/opportunities/v2/search?naics=541512,541511,541519&ptype=r&keywords=cyber,RMF,STIG,ISSO,ISSM,eMASS&postedFrom=12/15/2025&postedTo=01/13/2026&limit=25';

// Keywords to search for
const KEYWORDS = ['cyber', 'RMF', 'STIG', 'ISSO', 'ISSM', 'eMASS'].map(k => k.toLowerCase());

/**
 * Calculate relevance score for an opportunity based on keyword matches
 */
function calculateRelevanceScore(opportunity) {
  const title = (opportunity.title || '').toLowerCase();
  const description = (opportunity.description || '').toLowerCase();
  const combined = `${title} ${description}`;
  
  let score = 0;
  let matchedKeywords = [];
  let titleMatches = 0;
  let descriptionMatches = 0;
  
  // Check each keyword
  KEYWORDS.forEach(keyword => {
    const titleMatch = title.includes(keyword);
    const descMatch = description.includes(keyword);
    const combinedMatch = combined.includes(keyword);
    
    if (titleMatch) {
      score += 50; // High weight for title matches
      titleMatches++;
      if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
    }
    
    if (descMatch && !titleMatch) {
      score += 20; // Moderate weight for description matches
      descriptionMatches++;
      if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
    }
    
    if (combinedMatch && !titleMatch && !descMatch) {
      score += 10; // Lower weight for other matches
      if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
    }
  });
  
  // Bonus for multiple keyword matches
  if (matchedKeywords.length > 1) {
    score += matchedKeywords.length * 5;
  }
  
  // Bonus for multiple matches in title
  if (titleMatches > 1) {
    score += titleMatches * 10;
  }
  
  // Set-aside bonus (VetCert opportunities)
  if (opportunity.typeOfSetAside) {
    const setAside = opportunity.typeOfSetAside.toUpperCase();
    if (setAside.includes('SDVOSB') || setAside.includes('VOSB')) {
      score += 25;
    } else if (setAside.length > 0) {
      score += 15;
    }
  }
  
  return {
    score: Math.min(100, Math.max(0, score)), // Clamp between 0-100
    matchedKeywords,
    titleMatches,
    descriptionMatches,
  };
}

/**
 * Format opportunity for display
 */
function formatOpportunity(opportunity, index, relevance) {
  const title = opportunity.title || 'No Title';
  const noticeId = opportunity.noticeId || 'N/A';
  const agency = opportunity.agency || opportunity.organizationType || 'Unknown';
  const postedDate = opportunity.postedDate || 'N/A';
  const type = opportunity.type || 'N/A';
  const setAside = opportunity.typeOfSetAside || 'None';
  const url = opportunity.uiLink || (noticeId !== 'N/A' ? `https://sam.gov/opp/${noticeId}` : 'N/A');
  
  const description = (opportunity.description || '').substring(0, 200);
  
  return {
    index: index + 1,
    title,
    noticeId,
    agency,
    postedDate,
    type,
    setAside,
    url,
    description,
    relevanceScore: relevance.score,
    matchedKeywords: relevance.matchedKeywords,
    titleMatches: relevance.titleMatches,
    descriptionMatches: relevance.descriptionMatches,
  };
}

/**
 * Display results in a formatted way
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('SAM.gov API Results - Keyword Relevance Analysis');
  console.log('='.repeat(80));
  console.log(`\nKeywords searched: ${KEYWORDS.join(', ')}`);
  console.log(`Total opportunities found: ${results.length}\n`);
  
  if (results.length === 0) {
    console.log('No opportunities found matching the criteria.');
    return;
  }
  
  // Group by relevance score
  const highRelevance = results.filter(r => r.relevanceScore >= 70);
  const mediumRelevance = results.filter(r => r.relevanceScore >= 40 && r.relevanceScore < 70);
  const lowRelevance = results.filter(r => r.relevanceScore < 40);
  
  console.log(`📊 Relevance Breakdown:`);
  console.log(`   High (≥70): ${highRelevance.length}`);
  console.log(`   Medium (40-69): ${mediumRelevance.length}`);
  console.log(`   Low (<40): ${lowRelevance.length}\n`);
  
  // Display high relevance first
  if (highRelevance.length > 0) {
    console.log('🔥 HIGH RELEVANCE OPPORTUNITIES (Score ≥ 70)');
    console.log('='.repeat(80));
    highRelevance.forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.title}`);
      console.log(`   Notice ID: ${result.noticeId}`);
      console.log(`   Agency: ${result.agency}`);
      console.log(`   Posted: ${result.postedDate}`);
      console.log(`   Type: ${result.type}`);
      console.log(`   Set-Aside: ${result.setAside}`);
      console.log(`   Relevance Score: ${result.relevanceScore}/100`);
      console.log(`   Matched Keywords: ${result.matchedKeywords.join(', ') || 'None'}`);
      console.log(`   Title Matches: ${result.titleMatches}`);
      console.log(`   Description Matches: ${result.descriptionMatches}`);
      console.log(`   URL: ${result.url}`);
      if (result.description) {
        console.log(`   Description: ${result.description}...`);
      }
    });
  }
  
  // Display medium relevance
  if (mediumRelevance.length > 0) {
    console.log('\n\n📋 MEDIUM RELEVANCE OPPORTUNITIES (Score 40-69)');
    console.log('='.repeat(80));
    mediumRelevance.forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.title}`);
      console.log(`   Notice ID: ${result.noticeId}`);
      console.log(`   Agency: ${result.agency}`);
      console.log(`   Relevance Score: ${result.relevanceScore}/100`);
      console.log(`   Matched Keywords: ${result.matchedKeywords.join(', ') || 'None'}`);
      console.log(`   URL: ${result.url}`);
    });
  }
  
  // Display low relevance
  if (lowRelevance.length > 0) {
    console.log('\n\n⚠️  LOW RELEVANCE OPPORTUNITIES (Score < 40)');
    console.log('='.repeat(80));
    lowRelevance.forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.title}`);
      console.log(`   Notice ID: ${result.noticeId}`);
      console.log(`   Relevance Score: ${result.relevanceScore}/100`);
      console.log(`   Matched Keywords: ${result.matchedKeywords.join(', ') || 'None'}`);
    });
  }
  
  // Summary statistics
  console.log('\n\n' + '='.repeat(80));
  console.log('📈 SUMMARY STATISTICS');
  console.log('='.repeat(80));
  
  const avgScore = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
  const keywordFrequency = {};
  results.forEach(r => {
    r.matchedKeywords.forEach(kw => {
      keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
    });
  });
  
  console.log(`\nAverage Relevance Score: ${avgScore.toFixed(2)}/100`);
  console.log(`\nKeyword Match Frequency:`);
  Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .forEach(([keyword, count]) => {
      console.log(`   ${keyword}: ${count} opportunities`);
    });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🔍 Fetching data from SAM.gov API...');
    console.log(`URL: ${API_URL}\n`);
    
    // Execute curl command
    const curlCommand = `curl -X GET "${API_URL}" -H "X-API-KEY: ${API_KEY}"`;
    const response = execSync(curlCommand, { encoding: 'utf-8' });
    
    // Parse JSON response
    let data;
    try {
      data = JSON.parse(response);
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:');
      console.error(response);
      process.exit(1);
    }
    
    // Check for API errors
    if (data.error || data.message) {
      console.error('❌ API Error:');
      console.error(data);
      process.exit(1);
    }
    
    // Extract opportunities
    const opportunities = data.opportunitiesData || data.opportunities || [];
    
    if (!Array.isArray(opportunities)) {
      console.error('❌ Unexpected response format:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
    console.log(`✅ Successfully fetched ${opportunities.length} opportunities\n`);
    
    // Calculate relevance for each opportunity
    const resultsWithRelevance = opportunities.map((opp, index) => {
      const relevance = calculateRelevanceScore(opp);
      return formatOpportunity(opp, index, relevance);
    });
    
    // Sort by relevance score (highest first)
    resultsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Display results
    displayResults(resultsWithRelevance);
    
    // Optionally save to JSON file
    const fs = require('fs');
    const outputPath = 'sam-gov-results.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      query: {
        keywords: KEYWORDS,
        apiUrl: API_URL,
        timestamp: new Date().toISOString(),
      },
      totalResults: resultsWithRelevance.length,
      results: resultsWithRelevance,
    }, null, 2));
    
    console.log(`💾 Results saved to ${outputPath}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stderr) {
      console.error('stderr:', error.stderr.toString());
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { calculateRelevanceScore, formatOpportunity };

