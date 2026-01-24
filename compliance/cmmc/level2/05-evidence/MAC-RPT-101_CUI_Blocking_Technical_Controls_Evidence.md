# CUI File Storage and Protection Technical Controls Evidence

**CMMC Practice:** CUI Handling (CMMC Level 2)  
**Purpose:** Document technical controls for CUI file storage and password protection  
**Date:** 2026-01-24

---

## Overview

**CMMC Level 2: System now supports both FCI and CUI files.** CUI files are stored separately from FCI files and require password protection for access. This evidence document demonstrates the technical implementation of CUI file storage, password protection, and access controls.

---

## Technical Implementation

### 1. CUI Keyword Detection Library

**File:** `lib/cui-blocker.ts`

**Purpose:** Provides keyword-based detection for auto-classification of files as CUI. CUI files are now supported and stored separately with password protection.

**Key Functions:**
- `containsCUIKeywords(text: string)`: Checks if text contains CUI-related keywords
- `detectCUIKeywords(input: any)`: Detects CUI keywords for auto-classification (returns boolean)
- `monitorCUIKeywords(input: any, context?: string, actorUserId?: string, actorEmail?: string)`: Monitors input for CUI keywords and logs detection
- `monitorCUIKeywordsSync(input: any, context?: string)`: Synchronous monitoring function
- `validateNoCUI(input: any)`: [DEPRECATED] No longer blocks - only logs warnings for backward compatibility
- `validateFilename(filename: string)`: Validates filename format (no longer blocks CUI keywords)

**Detected Keywords:**
- Explicit CUI terms: "CUI", "Controlled Unclassified Information", "FOUO", "For Official Use Only"
- Classification terms: "Classified", "Confidential", "Secret", "Top Secret", "TS/SCI"
- Field names that suggest CUI: "cui", "controlled", "classified", "fouo", "sensitive", "classification"

**Code Evidence:**
```typescript
// From lib/cui-blocker.ts
export function detectCUIKeywords(input: any): boolean {
  // Detects CUI keywords in strings, objects, and arrays
  // Returns true if CUI keywords detected, false otherwise
  // Used for auto-classification of files as CUI
}
```

---

### 2. CUI File Storage

**File:** `lib/file-storage.ts`

**Purpose:** Stores CUI files separately from FCI files with password protection.

**Key Functions:**
- `storeCUIFile(userId: string, file: File, metadata?: Record<string, any>)`: Stores CUI file in StoredCUIFile table
- `getCUIFile(fileId: string, userId?: string, userRole?: string)`: Retrieves CUI file with authentication and role-based access control
- `listCUIFiles(userId: string, includeDeleted: boolean, userRole?: string)`: Lists CUI files for user

**Database Model:**
- `StoredCUIFile` table in PostgreSQL
- Separate from `StoredFile` table (FCI files)
- Same structure: id, userId, filename, mimeType, size, data (BYTEA), uploadedAt, deletedAt, metadata

**Code Evidence:**
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

---

### 3. CUI File Upload API

**File:** `app/api/files/upload/route.ts`

**Purpose:** Handles file uploads with CUI detection and separate storage.

**Implementation:**
- Requires authentication (`requireAuth()`)
- Accepts `isCUI` flag from form data (user checkbox)
- Auto-detects CUI keywords in filename and metadata using `detectCUIKeywords()`
- Routes to `storeCUIFile()` if CUI detected or user selected
- Routes to `storeFile()` for non-CUI files

**Code Evidence:**
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

---

### 4. CUI File Download API

**File:** `app/api/files/cui/[id]/route.ts`

**Purpose:** Provides authenticated, role-based access to CUI files.

**Implementation:**
- Requires authentication (user must be logged in)
- Requires ADMIN role for access to all CUI files
- Users can only access their own CUI files (unless admin)
- All access attempts logged to audit log

**Code Evidence:**
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

---

## Access Control

**CUI File Access:**
- Authentication required (user must be logged in)
- ADMIN role required for CUI file access
- Role-based access control enforced
- Users can only access their own CUI files (unless admin)
- All CUI file access attempts logged to audit log

**Access Logging:**
- Successful access: Logged as "cui_file_access" event
- Failed access: Logged as "cui_file_access_denied" event
- Includes file ID, filename, user information, role, and timestamp
- All access attempts audited for compliance monitoring

---

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

## Security Controls

**CUI File Protection:**
- Separate storage (StoredCUIFile table)
- Admin authentication required for access
- Role-based access control (ADMIN role required)
- Authentication required for all access
- Access control (users see only their own, admins see all)
- Comprehensive audit logging of all access attempts
- Encryption at rest (Railway platform)
- Encryption in transit (HTTPS/TLS)

**Access Control Management:**
- Admin role authentication enforced at API level
- Role-based authorization checks implemented
- Access attempts logged to audit system
- Failed access attempts logged for security monitoring

**Combined Approach:**
Technical controls (separate storage, admin authentication, role-based access control) + Procedural controls (user training, CUI handling procedures) + Monitoring (comprehensive audit logging) = Defense-in-depth for CUI protection.

---

## Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md`
- Media Handling Policy: `../02-policies-and-procedures/MAC-POL-213_Media_Handling_Policy.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`

---

## Code References

- CUI Detection Library: `lib/cui-blocker.ts`
- CUI File Storage: `lib/file-storage.ts` (storeCUIFile, getCUIFile)
- CUI File Upload API: `app/api/files/upload/route.ts`
- CUI File Download API: `app/api/files/cui/[id]/route.ts`
- CUI File List API: `app/api/files/cui/list/route.ts`
- Database Schema: `prisma/schema.prisma` (StoredCUIFile model)
- Authentication: NextAuth.js with role-based access control

---

**Document Status:** This document reflects the system state as of 2026-01-24 and is maintained under configuration control.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Date:** 2026-01-24  
**Version:** 2.0

**Change History:**
- Version 2.1 (2026-01-24): Updated CUI access control to rely on admin authentication and audit logging instead of password protection
- Version 2.0 (2026-01-24): Updated to reflect CUI support (CMMC Level 2) - CUI files now stored separately with admin authentication
- Version 1.0 (2026-01-21): Initial document for CUI blocking/monitoring (CMMC Level 2)
