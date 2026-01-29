/**
 * CUI (Controlled Unclassified Information) keyword detection and monitoring
 * 
 * CMMC Level 2: System now supports both FCI and CUI files.
 * CUI files are stored separately and require password protection.
 * 
 * This module provides:
 * - CUI keyword detection for auto-classification of files
 * - Monitoring for audit purposes
 * - Legacy validation functions (now non-blocking for CUI)
 */

// CUI-related keywords for detection
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
 * Detect if input contains CUI keywords
 * Used for auto-classification of files as CUI
 * @param input Input to check (string, object, or array)
 * @returns true if CUI keywords detected, false otherwise
 */
export function detectCUIKeywords(input: any): boolean {
  if (input === null || input === undefined) {
    return false
  }

  // Check strings
  if (typeof input === "string") {
    return containsCUIKeywords(input)
  }

  // Check objects
  if (typeof input === "object" && !Array.isArray(input)) {
    // Check object keys (field names)
    for (const key of Object.keys(input)) {
      const lowerKey = key.toLowerCase()
      if (RESTRICTED_FIELD_NAMES.some((restricted) => lowerKey.includes(restricted))) {
        return true
      }
    }

    // Check object values
    for (const value of Object.values(input)) {
      if (detectCUIKeywords(value)) {
        return true
      }
    }
    return false
  }

  // Check arrays
  if (Array.isArray(input)) {
    for (const item of input) {
      if (detectCUIKeywords(item)) {
        return true
      }
    }
    return false
  }

  return false
}

/**
 * Validate that input does not contain CUI keywords
 * @deprecated CUI is now supported. Use detectCUIKeywords() for detection instead.
 * This function now only logs a warning and does not throw errors.
 * @param input Input to validate (string, object, or array)
 */
export function validateNoCUI(input: any): void {
  // CUI is now supported, so this function no longer blocks
  // It's kept for backward compatibility but only logs warnings
  if (detectCUIKeywords(input)) {
    console.warn("[CUI Detection] CUI keywords detected in input. CUI files must be uploaded via the CUI Files tab (direct-to-vault).")
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
 * Validate filename format (no longer blocks CUI keywords)
 * @param filename Filename to validate
 * @throws Error only for invalid filename format, not for CUI keywords
 */
export function validateFilename(filename: string): void {
  // Basic filename validation (no special characters, etc.)
  if (!filename || filename.trim().length === 0) {
    throw new Error("Filename cannot be empty")
  }
  
  // CUI keywords in filename are allowed - files with CUI keywords should be stored as CUI files
  // This function now only validates basic filename format
}
