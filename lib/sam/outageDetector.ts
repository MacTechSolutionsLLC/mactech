/**
 * SAM.gov Outage Detection
 * Detects SAM.gov API outages and suspension states
 */

export interface OutageDetectionResult {
  isOutage: boolean
  reason?: string
  detectedAt?: Date
}

/**
 * Detect if SAM.gov API response indicates an outage
 * Checks for "State: SUSPENDED" and other outage indicators
 */
export function detectSamGovOutage(
  responseText: string,
  responseStatus?: number
): OutageDetectionResult {
  // Check for suspended state in response
  const suspendedPatterns = [
    /State:\s*SUSPENDED/i,
    /SUSPENDED/i,
    /service\s+(?:is\s+)?(?:temporarily\s+)?(?:unavailable|down|suspended)/i,
    /maintenance\s+mode/i,
    /system\s+(?:is\s+)?(?:temporarily\s+)?(?:unavailable|down)/i,
  ]

  const text = responseText || ''
  const upperText = text.toUpperCase()

  for (const pattern of suspendedPatterns) {
    if (pattern.test(text) || pattern.test(upperText)) {
      return {
        isOutage: true,
        reason: `SAM.gov API suspended: ${text.substring(0, 200)}`,
        detectedAt: new Date(),
      }
    }
  }

  // Check for 503 Service Unavailable
  if (responseStatus === 503) {
    return {
      isOutage: true,
      reason: 'SAM.gov API returned 503 Service Unavailable',
      detectedAt: new Date(),
    }
  }

  // Check for 502 Bad Gateway
  if (responseStatus === 502) {
    return {
      isOutage: true,
      reason: 'SAM.gov API returned 502 Bad Gateway',
      detectedAt: new Date(),
    }
  }

  return {
    isOutage: false,
  }
}

/**
 * Check if error response indicates outage
 */
export function detectOutageFromError(error: Error | string): OutageDetectionResult {
  const errorMessage = typeof error === 'string' ? error : error.message
  const upperMessage = errorMessage.toUpperCase()

  const outagePatterns = [
    /SUSPENDED/i,
    /service\s+(?:is\s+)?(?:temporarily\s+)?(?:unavailable|down)/i,
    /503/i,
    /502/i,
    /bad\s+gateway/i,
    /service\s+unavailable/i,
  ]

  for (const pattern of outagePatterns) {
    if (pattern.test(errorMessage) || pattern.test(upperMessage)) {
      return {
        isOutage: true,
        reason: `Detected outage: ${errorMessage.substring(0, 200)}`,
        detectedAt: new Date(),
      }
    }
  }

  return {
    isOutage: false,
  }
}

