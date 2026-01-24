# NIST SP 800-171 Control 3.1.22

**Control ID:** 3.1.22  
**Requirement:** Control CUI on public systems  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.22:**
"Control CUI on public systems"

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
- MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// From lib/cui-blocker.ts
export function detectCUIKeywords(input: any): boolean {
  // Detects CUI keywords in strings, objects, and arrays
  // Returns true if CUI keywords detected, false otherwise
  // Used for auto-classification of files as CUI
}
```

```typescript
// From lib/file-storage.ts
export async function storeCUIFile(
  userId: string,
  file: File,
  metadata?: Record<string, any>
): Promise<{ fileId: string; signedUrl: string }> {
  // Stores CUI file in StoredCUIFile table
  const storedFile = await prisma.storedCUIFile.create({
    data: { userId, filename: file.name, mimeType: file.type, size: file.size, data: buffer, ... }
  })
}

export async function getCUIFile(
  fileId: string,
  userId?: string,
  userRole?: string
): Promise<StoredCUIFile> {
  // Retrieves CUI file with authentication and role-based access control
  // Admin role can access all CUI files; users can only access their own
}
```

```typescript
// From app/api/files/upload/route.ts
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const formData = await req.formData()
  const file = formData.get("file") as File
  const isCUI = formData.get("isCUI") === "true"
  
  // Auto-detect CUI
  const hasCUIInFilename = detectCUIKeywords(file.name)
  const hasCUIInMetadata = detectCUIKeywords(metadata)
  const shouldStoreAsCUI = isCUI || hasCUIInFilename || hasCUIInMetadata
  
  // Store in appropriate table
  const result = shouldStoreAsCUI
    ? await storeCUIFile(session.user.id, file, metadata)
    : await storeFile(session.user.id, file, metadata)
}
```

```typescript
// From app/api/files/cui/[id]/route.ts
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  
  // Admin role required for CUI file access
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
  }
  
  const file = await getCUIFile(id, session.user.id, session.user.role)
  // Return file...
}
```

```prisma
// prisma/schema.prisma (lines 1036-1048)
model PublicContent {
  id          String    @id @default(cuid())
  content     String    @db.Text // Content to be made public
  contentType String // Type of content (post, page, etc.)
  approvedBy  String? // User ID who approved
  approvedAt  DateTime? // When approved
  isPublic    Boolean   @default(false) // Whether content is public
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([isPublic])
  @@index([approvedAt])
}
```

**Source Code Files:**

**File:** `lib/cui-blocker.ts`

```typescript
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
// ... (truncated)
```

**File:** `lib/file-storage.ts`

```typescript
/**
 * File storage service for CMMC Level 2 compliance
 * 
 * Handles both FCI files (StoredFile) and CUI files (StoredCUIFile)
 * CUI files require password protection for access
 * 
 * Stores files in PostgreSQL BYTEA column (replaces /public/uploads)
 * Provides signed URLs for secure file access
 */

import { prisma } from "./prisma"
import { validateFilename } from "./cui-blocker"
import crypto from "crypto"

// Allowed MIME types (configurable)
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/json",
]

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Signed URL expiration: 1 hour (default)
const DEFAULT_SIGNED_URL_EXPIRES_IN = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Validate file type
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${file.size} bytes exceeds maximum ${MAX_FILE_SIZE} bytes (10MB)`,
    }
  }
  return { valid: true }
}
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-101_CUI_Blocking_Technical_Controls_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_1_22_control_cui_on_public_systems_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

## Testing Evidence

**Test Scenarios:**
1. Upload file with CUI checkbox → Stored in StoredCUIFile table
2. Upload file with CUI keywords in filename → Auto-detected and stored as CUI
3. Access CUI file without authentication → 401 Unauthorized
4. Access CUI file without ADMIN role → 403 Forbidden
5. Access CUI file with ADMIN role → File downloaded
6. List CUI files → Shows only user's own CUI files (unless admin)

**Code Review Evidence:**
- Code review confirms CUI files stored separately
- Admin authentication and role-based access control implemented
- Access control enforced through authentication and authorization
- Audit logging functional for all access attempts

---

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.1.22 implemented as specified
- ✅ Implementation verified: Approval workflow
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.22

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
