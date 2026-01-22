/**
 * CUI (Controlled Unclassified Information) keyword monitoring
 * 
 * MONITORING-ONLY: This module provides spill detection monitoring, NOT prevention.
 * The system does not process CUI. Keyword detection is used solely as a 
 * spill-detection mechanism and is not relied upon as a security boundary.
 * 
 * Note: System handles FCI only. CUI is explicitly excluded.
 * 
 * @deprecated validateNoCUI, validateFilename - These functions throw errors and block input.
 * Use monitorCUIKeywords instead for monitoring-only spill detection.
 */

// CUI-related keywords to block
const CUI_KEYWORDS = [
  // Explicit CUI terms
  "CUI",
  "Controlled Unclassified Information",
  "FOUO",
  "For Official Use Only",
  
  // Classification terms
  "Classified",
  "Confidential",
  "Secret",
  "Top Secret",
  "TS/SCI",
  "Sensitive Compartmented Information",
  
  // Field names that suggest CUI
  "cui",
  "controlled",
  "classified",
  "fouo",
  "sensitive",
]

// Field names that should not contain CUI-related terms
const RESTRICTED_FIELD_NAMES = [
  "cui",
  "controlled",
  "classified",
  "fouo",
  "sensitive",
  "classification",
]

/**
 * Check if text contains CUI-related keywords
 * @param text Text to check
 * @returns true if CUI keywords found, false otherwise
 */
export function containsCUIKeywords(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false
  }

  const lowerText = text.toLowerCase()
  
  return CUI_KEYWORDS.some((keyword) => 
    lowerText.includes(keyword.toLowerCase())
  )
}

/**
 * Validate that input does not contain CUI keywords
 * @deprecated Use monitorCUIKeywords or monitorCUIKeywordsSync for monitoring-only detection.
 * This function throws errors and blocks input, which is not the intended behavior.
 * @param input Input to validate (string, object, or array)
 * @throws Error if CUI keywords detected
 */
export function validateNoCUI(input: any): void {
  if (input === null || input === undefined) {
    return
  }

  // Check strings
  if (typeof input === "string") {
    if (containsCUIKeywords(input)) {
      throw new Error(
        "Input contains prohibited terms. This system handles FCI only. CUI is not permitted."
      )
    }
    return
  }

  // Check objects
  if (typeof input === "object") {
    // Check object keys (field names)
    for (const key of Object.keys(input)) {
      const lowerKey = key.toLowerCase()
      if (RESTRICTED_FIELD_NAMES.some((restricted) => lowerKey.includes(restricted))) {
        throw new Error(
          `Field name "${key}" is not permitted. This system handles FCI only.`
        )
      }
    }

    // Check object values
    for (const value of Object.values(input)) {
      validateNoCUI(value)
    }
    return
  }

  // Check arrays
  if (Array.isArray(input)) {
    for (const item of input) {
      validateNoCUI(item)
    }
    return
  }
}

/**
 * Sanitize metadata by removing CUI keywords
 * This is a defensive measure - primary control is validation
 * @param metadata Metadata object to sanitize
 * @returns Sanitized metadata object
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(metadata)) {
    // Skip restricted field names
    const lowerKey = key.toLowerCase()
    if (RESTRICTED_FIELD_NAMES.some((restricted) => lowerKey.includes(restricted))) {
      continue // Skip this field
    }

    // Sanitize string values
    if (typeof value === "string") {
      // Remove CUI keywords from string values
      let sanitizedValue = value
      for (const keyword of CUI_KEYWORDS) {
        const regex = new RegExp(keyword, "gi")
        sanitizedValue = sanitizedValue.replace(regex, "[REDACTED]")
      }
      sanitized[key] = sanitizedValue
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Monitor input for CUI keywords synchronously (monitoring-only, does not block)
 * Logs detection to console. For async audit logging, use monitorCUIKeywordsAsync.
 * @param input Input to monitor (string, object, or array)
 * @param context Optional context for logging (e.g., "user_input", "metadata")
 * @returns true if CUI keywords detected, false otherwise
 */
export function monitorCUIKeywordsSync(
  input: any,
  context?: string
): boolean {
  if (input === null || input === undefined) {
    return false
  }

  let detected = false

  // Check strings
  if (typeof input === "string") {
    if (containsCUIKeywords(input)) {
      detected = true
      console.warn(`[CUI Monitoring] Potential CUI Spill Detected in ${context || "unknown"}: ${input.substring(0, 100)}`)
    }
    return detected
  }

  // Check objects
  if (typeof input === "object" && !Array.isArray(input)) {
    // Check object keys (field names)
    for (const key of Object.keys(input)) {
      const lowerKey = key.toLowerCase()
      if (RESTRICTED_FIELD_NAMES.some((restricted) => lowerKey.includes(restricted))) {
        detected = true
        console.warn(`[CUI Monitoring] Potential CUI Spill Detected - Restricted field name "${key}" in ${context || "unknown"}`)
      }
    }

    // Check object values
    for (const value of Object.values(input)) {
      if (monitorCUIKeywordsSync(value, context)) detected = true
    }
    return detected
  }

  // Check arrays
  if (Array.isArray(input)) {
    for (const item of input) {
      if (monitorCUIKeywordsSync(item, context)) detected = true
    }
    return detected
  }

  return false
}

/**
 * Monitor input for CUI keywords asynchronously (monitoring-only, does not block)
 * Logs detection as "Potential CUI Spill Detected" to audit log but does NOT prevent input
 * @param input Input to monitor (string, object, or array)
 * @param context Optional context for logging (e.g., "user_input", "metadata")
 * @param actorUserId Optional user ID for audit logging
 * @param actorEmail Optional user email for audit logging
 * @returns true if CUI keywords detected, false otherwise
 */
export async function monitorCUIKeywords(
  input: any,
  context?: string,
  actorUserId?: string | null,
  actorEmail?: string | null
): Promise<boolean> {
  // First do synchronous check
  const detected = monitorCUIKeywordsSync(input, context)
  
  // If detected, log to audit system asynchronously
  if (detected) {
    try {
      const { logEvent } = await import("./audit")
      await logEvent(
        "cui_spill_detected",
        actorUserId || null,
        actorEmail || null,
        false, // success = false (spill detected)
        undefined, // targetType
        undefined, // targetId
        {
          context: context || "unknown",
          message: "Potential CUI Spill Detected",
        }
      )
    } catch (error) {
      // If logging fails, at least we logged to console in sync function
      console.error("CUI keyword detected but audit logging failed:", error)
    }
  }
  
  return detected
}

/**
 * Validate filename for CUI keywords
 * @deprecated Use monitorCUIKeywords instead for monitoring-only detection
 * @param filename Filename to validate
 * @throws Error if CUI keywords detected
 */
export function validateFilename(filename: string): void {
  if (containsCUIKeywords(filename)) {
    throw new Error(
      "Filename contains prohibited terms. This system handles FCI only. CUI is not permitted."
    )
  }
}
