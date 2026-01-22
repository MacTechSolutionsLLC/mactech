# CUI Monitoring Technical Controls Evidence

**CMMC Practice:** Scope Enforcement (FCI-only system)  
**Purpose:** Document technical monitoring controls that support FCI-only scope  
**Date:** 2026-01-22

---

## Overview

**CUI is prohibited by policy and process. This system is scoped for FCI only.** The system does not process CUI. Keyword detection is used solely as a spill-detection mechanism and is not relied upon as a security boundary. File uploads are disabled to prevent CUI entry. This evidence document demonstrates the technical implementation of keyword monitoring for spill detection.

---

## Technical Implementation

### 1. CUI Keyword Monitoring Library

**File:** `lib/cui-blocker.ts`

**Purpose:** Provides keyword-based monitoring for spill detection. The system does not process CUI. Keyword detection is used solely as a spill-detection mechanism and is not relied upon as a security boundary.

**Key Functions:**
- `containsCUIKeywords(text: string)`: Checks if text contains CUI-related keywords
- `monitorCUIKeywords(input: any, context?: string, actorUserId?: string, actorEmail?: string)`: Monitors input for CUI keywords and logs detection (monitoring-only, does not block)
- `monitorCUIKeywordsSync(input: any, context?: string)`: Synchronous monitoring function
- `validateNoCUI(input: any)`: [DEPRECATED] Validates input and throws error (deprecated in favor of monitoring-only approach)
- `validateFilename(filename: string)`: [DEPRECATED] Validates filenames and throws error (deprecated in favor of monitoring-only approach)

**Blocked Keywords:**
- Explicit CUI terms: "CUI", "Controlled Unclassified Information", "FOUO", "For Official Use Only"
- Classification terms: "Classified", "Confidential", "Secret", "Top Secret", "TS/SCI"
- Restricted field names: "cui", "controlled", "classified", "fouo", "sensitive", "classification"

**Code Evidence:**
```typescript
// From lib/cui-blocker.ts
export function validateFilename(filename: string): void {
  if (containsCUIKeywords(filename)) {
    throw new Error(
      "Filename contains prohibited terms. This system handles FCI only. CUI is not permitted."
    )
  }
}

export function validateNoCUI(input: any): void {
  // Validates strings, objects, and arrays for CUI keywords
  // Throws error if CUI keywords detected
}
```

---

### 2. File Upload Endpoint (Disabled)

**File:** `app/api/files/upload/route.ts`

**Purpose:** File uploads are disabled. This system handles FCI only and does not accept file uploads.

**Implementation:**
- Endpoint returns 403 Forbidden with message: "File uploads are disabled. This system handles FCI only and does not accept file uploads."
- File storage service (`lib/file-storage.ts`) is deprecated
- No file uploads are accepted to prevent CUI entry

**Code Evidence:**
```typescript
// From lib/file-storage.ts
export async function storeFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>
): Promise<{ fileId: string; signedUrl: string }> {
  // Validate filename for CUI keywords
  validateFilename(file.name)

  // Validate metadata for CUI keywords
  if (metadata) {
    validateNoCUI(metadata)
  }
  // ... rest of file storage logic
}
```

---

### 3. File Upload API Endpoint

**File:** `app/api/files/upload/route.ts`

**Purpose:** API endpoint that applies keyword-based filtering as a guardrail for all file uploads. CUI is prohibited by policy and process.

**Implementation:**
- Requires authentication (`requireAuth()`)
- Validates metadata for CUI keywords before processing
- Calls `storeFile()` which enforces filename and metadata validation
- Returns error if CUI keywords detected

**Code Evidence:**
```typescript
// From app/api/files/upload/route.ts
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  
  // Parse metadata if provided
  if (metadataStr) {
    metadata = JSON.parse(metadataStr)
    // Validate metadata for CUI keywords
    validateNoCUI(metadata)
  }
  
  // Store file (which also validates filename)
  const result = await storeFile(session.user.id, file, metadata)
}
```

---

## Error Handling

**Monitoring Behavior:**
- Keyword detection is logged as "cui_spill_detected" event in audit log
- Event includes context, actor information, and detection details
- Input is NOT blocked - monitoring is for spill detection only
- Audit log entry has success=false to indicate spill detection

**File Upload Response:**
- HTTP 403 (Forbidden) with message: "File uploads are disabled. This system handles FCI only and does not accept file uploads."
- File uploads are completely disabled to prevent CUI entry

---

## Testing Evidence

**Test Scenarios:**
1. Attempt to upload file → 403 Forbidden (file uploads disabled)
2. Enter CUI keywords in user input → Detected and logged (not blocked)
3. CUI keyword detection → Logged as "cui_spill_detected" event in audit log
4. Normal FCI-only input → Accepted and processed

**Code Review Evidence:**
- Code review confirms file upload endpoint returns 403 Forbidden
- Monitoring function logs detection but does not block
- Audit log entries demonstrate spill detection capability

---

## Limitations and Procedural Controls

**CUI is prohibited by policy and process. This system is scoped for FCI only.**

**Technical Monitoring Limitations:**
- Keyword-based detection (not comprehensive content scanning)
- Relies on known CUI-related terms
- May not catch all variations or obfuscated terms
- Monitoring is for spill detection only, not prevention
- The system does not process CUI. Keyword detection is used solely as a spill-detection mechanism and is not relied upon as a security boundary.

**Primary Controls:**
- File uploads are disabled to prevent CUI entry
- User Access and FCI Handling Acknowledgement (explicit CUI prohibition)
- User training on FCI-only scope
- Administrative oversight and monitoring
- Contractual prohibition of CUI upload
- Warning banners on input forms

**Combined Approach:**
Procedural controls (policy, user acknowledgment, training) + Technical controls (file uploads disabled) + Monitoring (keyword detection for spill detection) = Defense-in-depth for scope enforcement. CUI is prohibited by policy and process; file uploads are disabled; keyword monitoring provides spill detection capability.

---

## Related Documents

- FCI Scope and Data Boundary Statement: `../01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md`
- User Access and FCI Handling Acknowledgement: `../02-policies-and-procedures/MAC-FRM-203_User_Access_and_FCI_Handling_Acknowledgement.md`
- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`

---

## Code References

- CUI Blocking Library: `lib/cui-blocker.ts`
- File Storage Service: `lib/file-storage.ts`
- File Upload API: `app/api/files/upload/route.ts`

---

**Document Status:** This document reflects the system state as of 2026-01-21 and is maintained under configuration control.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Date:** 2026-01-21  
**Version:** 1.0
