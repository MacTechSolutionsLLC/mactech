/**
 * Decision-oriented type definitions for Federal Capture Intelligence Dashboard
 * These types abstract away raw API schemas and focus on decision-making
 */

// Intelligence flag structure
export interface IntelligenceFlag {
  type: 'HIGH_INCUMBENT_LOCK_IN' | 'EARLY_STAGE_SHAPE' | 'SAM_VALUE_INFLATED' | 
        'AGENCY_RARELY_AWARDS_TO_NEW_VENDORS' | 'LIKELY_RECOMPETE' | 
        'SET_ASIDE_ENFORCEMENT_WEAK' | 'CAPABILITY_GAP_RISK' | 'SET_ASIDE_ADVANTAGE_REQUIRED'
  severity: 'high' | 'medium' | 'low'
  message: string
  tooltip: string
}

// Decision-oriented opportunity summary
export interface OpportunitySummary {
  id: string
  noticeId?: string
  title: string
  agency?: string
  naicsCodes: string[]
  setAside: string[]
  deadline?: string
  relevanceScore: number
  pipelineStatus: 'discovered' | 'scraping' | 'scraped' | 'enriching' | 'enriched' | 'intelligence_pass' | 'analyzing' | 'analyzed' | 'ready'
  
  // Intelligence flags (computed from API data)
  intelligenceFlags: IntelligenceFlag[]
  
  // Quick decision indicators
  verdict?: 'HIGH_FIT' | 'MEDIUM_RISK' | 'LOW_FIT' | 'MONITOR'
  recommendedAction?: 'BID' | 'NO_BID' | 'MONITOR' | 'INVESTIGATE'
  
  // Additional fields for display
  solicitationNumber?: string | null
  estimatedValue?: string | null
  flagged?: boolean
  ignored?: boolean
}

// Full intelligence data
export interface OpportunityIntel {
  opportunityId: string
  
  // Decision summary
  verdict: {
    label: string // e.g., "HIGH FIT / MEDIUM RISK"
    explanation: string
    recommendedAction: 'BID' | 'NO_BID' | 'MONITOR' | 'INVESTIGATE'
    confidence: number // 0-1
    reasoning: string[]
  }
  
  // Intelligence sections
  agencyBehavior?: {
    newVendorAcceptanceRate: number | null
    typicalAwardSizeAvg: number | null
    setAsideEnforcementStrength: 'STRICT' | 'MODERATE' | 'WEAK' | null
  }
  
  competitiveRisk?: {
    incumbentLockIn: boolean
    incumbentConcentrationScore: number | null
    recompeteLikelihood: number | null
  }
  
  awardRealism?: {
    samValue: number | null
    historicalAvg: number | null
    realismRatio: number | null
  }
  
  lifecycleTiming?: {
    stage: 'SOURCES_SOUGHT' | 'PRE_SOLICITATION' | 'SOLICITATION' | 'AWARD' | 'UNKNOWN'
    daysUntilDeadline: number | null
  }
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalOpportunities: number
  flaggedCount: number
  highPriorityCount: number
  earlyStageCount: number
  highRiskCount: number
}

// Intent filter state
export interface IntentFilters {
  shapeableOnly?: boolean
  highIncumbentRisk?: boolean
  newVendorFriendly?: boolean
  earlyLifecycleOnly?: boolean
}
