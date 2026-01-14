/**
 * Filter Constants
 * Centralized constants for SAM.gov opportunity filtering
 */

/**
 * NAICS codes that are relevant for MacTech Solutions
 * These represent IT/cybersecurity consulting services
 */
export const NAICS_ALLOWLIST = [
  '541512', // Computer Systems Design Services
  '541511', // Custom Computer Programming Services
  '541519', // Other Computer Related Services
  '541330', // Engineering Services
  '541513', // Computer Facilities Management Services
] as const

/**
 * PSC code prefixes to blacklist (hard drop)
 * These represent categories we don't pursue:
 * - H*: Facilities
 * - J*: Repair
 * - 65*: Medical
 * - 41*: Furniture/Food
 * - 51*: Tools
 * - 52*: Tools
 * - 53*: Tools
 */
export const PSC_BLACKLIST_PREFIXES = [
  'H',   // Facilities
  'J',   // Repair
  '65',  // Medical
  '41',  // Furniture/Food
  '51',  // Tools
  '52',  // Tools
  '53',  // Tools
] as const

/**
 * Title intent keywords
 * Opportunities must contain at least one of these in title or description
 * to pass the title intent gate
 */
export const TITLE_INTENT_KEYWORDS = [
  'support',
  'services',
  'engineering',
  'technical',
  'information',
  'systems',
  'software',
  'cyber',
  'security',
  'operations',
] as const

/**
 * Strong intent keywords for NAICS exception
 * Used to identify legitimate cyber Sources Sought that may not have NAICS assigned yet
 */
export const STRONG_INTENT_KEYWORDS = [
  'cybersecurity',
  'cyber security',
  'information security',
  'information systems',
  'risk management framework',
  'rmf',
  'ato',
  'authorization to operate',
  'stig',
  'security technical implementation guide',
  'isso',
  'issm',
  'nist',
  'security assessment',
  'security engineering',
  'security architecture',
] as const

