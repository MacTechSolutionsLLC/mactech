/**
 * Scoring Constants
 * Centralized constants for opportunity relevance scoring
 */

/**
 * Base score represents generic consulting opportunity viability before specialization.
 * This provides a foundation for scoring adjustments and helps explain why opportunities
 * score 55 vs 30 when tuning weights.
 * Updated per specification: BASE_SCORE = 30
 */
export const BASE_SCORE = 30

/**
 * Scoring weights for different factors
 * Updated per specification:
 * - NAICS allowlist match: +20
 * - SDVOSB/VOSB: +30
 * - Other set-aside: +15
 * - Sources Sought: +25
 * - Pre-Solicitation: +15
 * - Solicitation: +10
 * - Each cyber keyword (RMF, STIG, ATO, Zero Trust): +5
 * - Deadline < 7 days: +10
 * - Deadline < 14 days: +5
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
  SOLICITATION_BOOST: 10,    // +10 for Solicitation (updated from COMBINED_BOOST)
  
  // Cyber keyword matching
  CYBER_KEYWORD_MATCH: 5,    // +5 per cyber keyword (RMF, STIG, ATO, Zero Trust)
  
  // Response deadline proximity
  DEADLINE_URGENT: 10,       // +10 if deadline < 7 days
  DEADLINE_NEAR: 5,          // +5 if deadline < 14 days
} as const

/**
 * Minimum score threshold for displaying opportunities in admin pane
 */
export const MIN_SCORE_THRESHOLD = 50

/**
 * Cyber keywords that boost relevance score
 * Per specification: RMF, STIG, ATO, Zero Trust
 * Each match adds +5 points
 */
export const CYBER_KEYWORDS = [
  'RMF',
  'Risk Management Framework',
  'STIG',
  'Security Technical Implementation Guide',
  'ATO',
  'Authorization to Operate',
  'Zero Trust',
  'zero trust',
] as const

/**
 * @deprecated Use CYBER_KEYWORDS instead
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

