# Verify External Systems Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.20

**Control ID:** 3.1.20  
**Requirement:** Verify and control/limit connections to and use of external systems

---

## 1. Purpose

This document provides evidence of the implementation of external system verification and connection controls in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.20.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**External Systems Connected:**
- SAM.gov API (read-only, public API)
- USAspending.gov API (read-only, public API)
- Railway Platform (hosting and database)
- GitHub.com (source code repository)

**Connection Controls:**
- All external connections use HTTPS/TLS encryption
- API keys stored in environment variables
- Read-only access to external APIs
- Connection monitoring and error handling

---

## 3. Code Implementation

### 3.1 SAM.gov API Client

**File:** `lib/sam/samClient.ts`

**External System Verification:**
- API key authentication via environment variables
- Rate limiting and retry logic
- Outage detection
- Error handling and fallback mechanisms

**Code Implementation:**
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

**Code References:**
- `lib/sam/samClient.ts` - Lines 19-48 (API key management)
- API key verification and fallback mechanism

**Evidence:**
- `lib/sam/samClient.ts` - External system API key verification
- API keys stored in environment variables

---

### 3.2 External System Connection Security

**File:** `lib/sam/samClient.ts`

**Connection Security:**
- HTTPS/TLS encryption for all external connections
- API key authentication headers
- Rate limiting and retry logic
- Outage detection

**Code Implementation:**
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

**Code References:**
- `lib/sam/samClient.ts` - Lines 81-118 (external system connection with security)
- HTTPS/TLS encryption (inherited from Railway platform)
- API key authentication

**Evidence:**
- `lib/sam/samClient.ts` - External system connection security
- HTTPS/TLS encryption for all external connections

---

### 3.3 External System Connection Monitoring

**File:** `lib/sam/samClient.ts`

**Connection Monitoring:**
- Request/response logging
- Error detection and handling
- Outage detection
- Connection failure monitoring

**Code Implementation:**
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

**Code References:**
- `lib/sam/samClient.ts` - Lines 68-76 (connection monitoring)
- Request/response logging for external systems

**Evidence:**
- `lib/sam/samClient.ts` - External system connection monitoring
- Connection activity logged

---

### 3.4 External System List

**System Security Plan Reference:**
- SAM.gov API: HTTPS/TLS (read-only, public API)
- USAspending.gov API: HTTPS/TLS (read-only, public API)
- Railway Platform: HTTPS/TLS, encrypted database connection
- GitHub.com: HTTPS/TLS, repository access controls

**Code References:**
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 4.1)
- External systems documented and verified

**Evidence:**
- External systems listed and verified
- Connection security controls documented

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 4.1, 7.1, 3.1.20)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - SAM.gov API client (lib/sam/samClient.ts), external system connection security (HTTPS/TLS, API key authentication), external system connection monitoring (request/response logging), external system list, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
