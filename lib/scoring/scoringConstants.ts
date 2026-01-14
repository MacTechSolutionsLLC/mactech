/**
 * Scoring Constants
 * Centralized constants for opportunity relevance scoring
 */

/**
 * Base score represents generic consulting opportunity viability before specialization.
 * This provides a foundation for scoring adjustments and helps explain why opportunities
 * score 55 vs 30 when tuning weights.
 */
export const BASE_SCORE = 30

/**
 * Scoring weights for different factors
 */
export const SCORING_WEIGHTS = {
  // NAICS code matching
  NAICS_MATCH: 20,           // +20 if NAICS is in allowlist
  NAICS_MISSING_PENALTY: -40, // -40 if NAICS is missing (unless Sources Sought exception)
  
  // Set-aside preferences
  SDVOSB_VOSB_BOOST: 30,     // +30 for SDVOSB or VOSB set-aside
  OTHER_SET_ASIDE_BOOST: 15, // +15 for other set-asides
  
  // Lifecycle stage preferences
  SOURCES_SOUGHT_BOOST: 25,  // +25 for Sources Sought (earliest stage)
  PRE_SOLICITATION_BOOST: 15, // +15 for Pre-Solicitation
  COMBINED_BOOST: 10,        // +10 for Combined Synopsis/Solicitation
  
  // Title keyword matching
  KEYWORD_MATCH: 5,          // +5 per keyword match (RMF, STIG, ATO, cyber, security)
  
  // Response deadline proximity
  DEADLINE_URGENT: 10,       // +10 if deadline < 7 days
  DEADLINE_NEAR: 5,          // +5 if deadline < 14 days
} as const

/**
 * Minimum score threshold for displaying opportunities in admin pane
 */
export const MIN_SCORE_THRESHOLD = 50

/**
 * Title keywords that boost relevance score
 */
export const RELEVANCE_KEYWORDS = [
  'RMF',
  'Risk Management Framework',
  'STIG',
  'Security Technical Implementation Guide',
  'ATO',
  'Authorization to Operate',
  'cyber',
  'cybersecurity',
  'security',
] as const

