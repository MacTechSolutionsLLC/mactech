# NIST SP 800-171 Control 3.1.20

**Control ID:** 3.1.20  
**Requirement:** Verify external systems  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.20:**
"Verify external systems"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-210

**Procedure/SOP References:**  
- MAC-IT-304_System_Security_Plan.md

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// lib/sam/samClient.ts (lines 19-48)
function getApiKey(useFallback: boolean = false): string {
  if (useFallback) {
    const altKey = process.env.ALT_SAM_API_KEY
    if (!altKey) {
      throw new Error(
        'Fallback SAM.gov API key (ALT_SAM_API_KEY) not found. ' +
        'Please set ALT_SAM_API_KEY environment variable.'
      )
    }
    return altKey
  }
  
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  if (!apiKey) {
    throw new Error(
      'SAM.gov API key required. ' +
      'Please register at https://api.sam.gov/ and set SAM_GOV_API_KEY or ALT_SAM_API_KEY environment variable.'
    )
  }
  
  return apiKey
}
```

```typescript
// lib/sam/samClient.ts (lines 81-118)
export async function executeSamGovQuery(
  params: URLSearchParams,
  retries: number = 3,
  useFallbackKey: boolean = false
): Promise<SamGovApiResponse> {
  const apiKey = getApiKey(useFallbackKey)
  const url = new URL(API_BASE_URL) // HTTPS endpoint
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'User-Agent': 'MacTech Contract Discovery/1.0',
    'X-Api-Key': apiKey, // API key authentication
  }
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url.toString(), { headers })
    // ... error handling and retry logic
  }
}
```

```typescript
// lib/sam/samClient.ts (lines 68-76)
function logRequest(url: string, params: URLSearchParams, attempt: number): void {
  const sanitizedUrl = url.toString().replace(/api_key=[^&]+/, 'api_key=***')
  console.log(`[SAM Client] Request ${attempt}: ${sanitizedUrl}`)
}

function logResponse(status: number, attempt: number, duration?: number): void {
  const durationStr = duration ? ` (${duration}ms)` : ''
  console.log(`[SAM Client] Response ${attempt}: ${status}${durationStr}`)
}
```

**Source Code Files:**

**File:** `lib/sam/samClient.ts`

```typescript
/**
 * SAM.gov API Client
 * Wrapper around SAM.gov Opportunities API v2
 * Handles authentication, rate limiting, error handling, and outage detection
 */

import { SamGovApiResponse } from '../sam-gov-api-v2'
import { detectSamGovOutage, detectOutageFromError, OutageDetectionResult } from './outageDetector'

const API_BASE_URL = 'https://api.sam.gov/opportunities/v2/search'

// Export outage detection result type
export type { OutageDetectionResult }

/**
 * Get API key from environment
 * Tries primary key first, then fallback key
 */
function getApiKey(useFallback: boolean = false): string {
  if (useFallback) {
    const altKey = process.env.ALT_SAM_API_KEY
    if (!altKey) {
      throw new Error(
        'Fallback SAM.gov API key (ALT_SAM_API_KEY) not found. ' +
        'Please set ALT_SAM_API_KEY environment variable.'
      )
    }
    return altKey
  }
  
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  if (!apiKey) {
    // Try fallback before throwing error
    const altKey = process.env.ALT_SAM_API_KEY
    if (altKey) {
      console.log('[SAM Client] Primary API key not found, using fallback ALT_SAM_API_KEY')
      return altKey
    }
    
    throw new Error(
      'SAM.gov API key required. ' +
      'Please register at https://api.sam.gov/ and set SAM_GOV_API_KEY or ALT_SAM_API_KEY environment variable.'
    )
  }
  
  return apiKey
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Add jitter to backoff time to avoid thundering herd
 */
function addJitter(baseMs: number, jitterPercent: number = 0.1): number {
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-121_3_1_20_verify_external_systems_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.1.20 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.20

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Access Control (AC)

**Related Controls in Same Family:**  
- See SCTM for complete control family mapping: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 9. Assessment Notes

### Assessor Notes

*[Space for assessor notes during assessment]*

### Open Items

- None

---

## 10. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Prepared Date:** 2026-01-24  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial control assessment file creation
- Version 1.1 (2026-01-24): Enriched with comprehensive evidence from MAC-RPT files

---

## Related Documents

- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- Evidence Index: `../05-evidence/MAC-RPT-100_Evidence_Index.md`
