# AI Contract Analysis Integration

This document describes the AI-powered contract analysis features integrated from the vetted platform into MacTech's contract discovery system.

## Overview

The integration adapts the vetted platform's AI capabilities (originally designed for LinkedIn profiles and job descriptions) to parse, analyze, and score government contracts for award likelihood.

## Features Implemented

### 1. AI-Powered Contract Parsing
- **Location**: `lib/ai/contract-parser.ts`
- **API**: `POST /api/admin/contract-discovery/[id]/parse`
- **Functionality**: 
  - Extracts structured data from contract documents (SOW, PWS, RFQ, RFP)
  - Identifies key information: requirements, deliverables, budget, timeline
  - Detects VetCert-eligible set-asides (SDVOSB/VOSB)
  - Extracts NAICS codes, skills, certifications, security clearances
  - Uses OpenAI GPT-4o-mini for accurate extraction

### 2. Contract Analysis
- **Location**: `lib/ai/contract-analysis.ts`
- **API**: `POST /api/admin/contract-discovery/[id]/analyze`
- **Functionality**:
  - Generates executive summary
  - Identifies key requirements and keywords
  - Assesses fit score (0-100) for MacTech capabilities
  - Identifies strengths and concerns
  - Provides recommended actions
  - Categorizes contracts (cybersecurity, infrastructure, compliance, etc.)

### 3. Award Likelihood Scoring
- **Location**: `lib/ai/contract-scoring.ts`
- **API**: `GET /api/admin/contract-discovery/[id]/award-likelihood`
- **Functionality**:
  - Calculates award probability (0-100)
  - Considers set-aside eligibility, capability match, past performance
  - Provides confidence level (HIGH, MEDIUM, LOW)
  - Identifies risk factors and recommendations
  - Explains reasoning for the score

## Database Schema Updates

Added to `GovernmentContractDiscovery` model:

### AI Parsing Fields
- `aiParsedData` (String) - JSON string of parsed contract data
- `aiParsedAt` (DateTime) - When parsing was completed

### AI Analysis Fields
- `aiSummary` (String) - Executive summary
- `aiKeyRequirements` (String) - JSON array of key requirements
- `aiKeywords` (String) - JSON array of AI-detected keywords
- `aiStrengths` (String) - JSON array of strengths
- `aiConcerns` (String) - JSON array of concerns
- `aiFitScore` (Float) - 0-100 fit score
- `aiServiceCategory` (String) - Service category
- `aiRecommendedActions` (String) - JSON array of actions
- `aiAnalysisGeneratedAt` (DateTime) - When analysis was generated

### AI Award Likelihood Fields
- `aiAwardLikelihood` (Float) - 0-100 award probability
- `aiAwardConfidence` (String) - HIGH, MEDIUM, or LOW
- `aiAwardReasoning` (String) - Explanation of score
- `aiAwardStrengths` (String) - JSON array of award strengths
- `aiAwardConcerns` (String) - JSON array of award concerns
- `aiAwardRiskFactors` (String) - JSON array of risk factors
- `aiAwardRecommendations` (String) - JSON array of recommendations
- `aiAwardLikelihoodGeneratedAt` (DateTime) - When score was calculated

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Database Migration
Run Prisma migration to update the database schema:
```bash
npm run db:push
```

### 3. Dependencies
The OpenAI package has been installed:
```bash
npm install openai
```

## API Usage Examples

### Parse a Contract
```typescript
POST /api/admin/contract-discovery/[contractId]/parse

// Response
{
  "success": true,
  "parsed": {
    "title": "Contract Title",
    "agency": "Department of Defense",
    "requirements": ["requirement1", "requirement2"],
    "setAside": ["SDVOSB"],
    // ... more fields
  },
  "message": "Contract parsed successfully"
}
```

### Analyze a Contract
```typescript
POST /api/admin/contract-discovery/[contractId]/analyze

// Response
{
  "success": true,
  "analysis": {
    "summary": "Executive summary...",
    "keyRequirements": ["req1", "req2"],
    "fitScore": 85,
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1"],
    "serviceCategory": "cybersecurity",
    "recommendedActions": ["action1", "action2"]
  },
  "message": "Contract analyzed successfully"
}
```

### Calculate Award Likelihood
```typescript
GET /api/admin/contract-discovery/[contractId]/award-likelihood

// Response
{
  "success": true,
  "result": {
    "score": 75,
    "confidence": "HIGH",
    "reasoning": "Explanation...",
    "strengths": ["strength1"],
    "concerns": ["concern1"],
    "riskFactors": ["risk1"],
    "recommendations": ["recommendation1"]
  },
  "message": "Award likelihood calculated successfully"
}
```

## Integration Points

The AI features integrate seamlessly with existing contract discovery workflow:

1. **Contract Discovery** → Discovers contracts from SAM.gov
2. **Scraping** → Scrapes contract pages and SOW attachments
3. **AI Parsing** → Parses contract content into structured data
4. **AI Analysis** → Analyzes contract fit and generates insights
5. **Award Likelihood** → Calculates probability of winning the contract

## Cost Optimization

- Uses `gpt-4o-mini` model (cost-effective)
- Results are cached in database (not regenerated on every view)
- Non-blocking operations (don't delay user actions)
- Graceful degradation if OpenAI is not configured

## Error Handling

- All AI features gracefully degrade if OpenAI is not configured
- Errors are logged but don't break user workflows
- Fallback to non-AI behavior when AI fails
- Clear error messages returned to API consumers

## Next Steps

1. **UI Integration**: Add buttons/actions in the contract discovery UI to trigger AI parsing, analysis, and scoring
2. **Batch Processing**: Add ability to process multiple contracts at once
3. **Caching Strategy**: Implement Redis or similar for caching AI results
4. **Analytics**: Track AI feature usage and success rates
5. **Feedback Loop**: Allow users to rate AI-generated insights

## Files Created

- `lib/openai.ts` - OpenAI client singleton
- `lib/ai/contract-parser.ts` - Contract parsing logic
- `lib/ai/contract-analysis.ts` - Contract analysis logic
- `lib/ai/contract-scoring.ts` - Award likelihood scoring
- `app/api/admin/contract-discovery/[id]/parse/route.ts` - Parse API endpoint
- `app/api/admin/contract-discovery/[id]/analyze/route.ts` - Analyze API endpoint
- `app/api/admin/contract-discovery/[id]/award-likelihood/route.ts` - Award likelihood API endpoint

## Files Modified

- `prisma/schema.prisma` - Added AI analysis fields
- `package.json` - Added openai dependency

