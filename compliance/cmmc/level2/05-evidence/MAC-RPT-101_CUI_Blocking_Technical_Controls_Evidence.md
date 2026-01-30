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

**Purpose:** Enforces CUI boundary rules by storing **CUI metadata only** on Railway and delegating CUI byte storage to the dedicated CUI vault (direct-to-vault).

**Key Functions:**
- `recordCUIUploadMetadata(...)`: Creates the `StoredCUIFile` metadata record after the browser uploads bytes directly to the vault\n+- `getCUIFileMetadataForView(...)`: Returns metadata (including `vaultId`) only; never returns file bytes\n+- `deleteCUIFile(...)`: Deletes vault record first, then marks metadata deleted\n+- `listCUIFiles(...)`: Lists CUI metadata by owner/admin access rules

**Database Model:**
- `StoredCUIFile` table in PostgreSQL (metadata only)
- Separate from `StoredFile` table (FCI files)
- Structure: id, userId, filename, mimeType, size, data (BYTEA - empty for vault-stored files), uploadedAt, deletedAt, metadata, storedInVault, vaultId
- **Note:** CUI content is stored in CUI vault only. Railway database stores metadata only.

**Code Evidence:**
```typescript
// From lib/file-storage.ts (CUI metadata record for vault-stored files)
export async function recordCUIUploadMetadata(
  userId: string,
  vaultId: string,
  size: number,
  mimeType: string,
  displayLabel?: string
): Promise<{ fileId: string; signedUrl: string }> {
  // Stores metadata only on Railway; data is empty for vault-stored CUI
}
```

---

### 3. CUI File Upload API

**Files:**\n- `app/api/cui/upload-session/route.ts` (metadata-only session)\n- `app/api/cui/record/route.ts` (metadata record after vault upload)\n- `app/api/files/upload/route.ts` (non-CUI only; rejects CUI)

**Purpose:** Ensures CUI bytes never transit Railway by issuing short-lived vault tokens and requiring direct-to-vault upload.

**Implementation:**
- Requires authentication and MFA (`requireAuth()` enforces step-up MFA)\n+- `POST /api/cui/upload-session` accepts **metadata only** and returns `{ uploadUrl, uploadToken, expiresAt }`\n+- Browser uploads CUI bytes directly to the vault endpoint `POST /v1/files/upload` using `Authorization: Bearer <uploadToken>`\n+- `POST /api/cui/record` stores vault metadata only (`vaultId`, size, mimeType; no filename)\n+- `POST /api/files/upload` is **non-CUI only** and rejects any attempt to send CUI bytes to Railway

**Code Evidence:**
```typescript
// From app/api/cui/upload-session/route.ts (metadata-only)
export async function POST(req: NextRequest) {
  const session = await requireAuth()
  const body = await req.json()
  // returns uploadUrl + uploadToken for direct browser-to-vault upload
}
```

---

### 4. CUI File Download API

**Files:**\n- `app/api/cui/view-session/route.ts` (metadata-only session)\n- `app/api/files/cui/[id]/route.ts` (returns view session only)

**Purpose:** Provides authenticated, role-based access to CUI by returning a short-lived vault URL/token.\n\n**Important:** Railway does **not** return CUI file bytes.

**Implementation:**
- Requires authentication and MFA (`requireAuth()`)\n+- Authorization: user must be owner or ADMIN\n+- Returns `{ viewUrl, viewToken, expiresAt }` for direct browser-to-vault streaming\n+- Logs all access attempts (success and denial) without storing CUI bytes on Railway

**Code Evidence:**
```typescript
// From app/api/files/cui/[id]/route.ts
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  // Returns viewUrl/token only; browser opens vault URL directly
}
```

---

## Access Control

**CUI File Access:**
- Authentication required (user must be logged in)\n+- MFA required for protected access (step-up; `mfaVerified=true`)\n+- Role-based access control enforced: users can access their own CUI metadata and obtain view tokens; ADMIN can access all\n+- All CUI access attempts logged to audit log

**Access Logging:**
- Successful access: Logged as "cui_file_access" event
- Failed access: Logged as "cui_file_access_denied" event
- Includes file ID, vaultId, user information, role, and timestamp (no plaintext CUI bytes)
- All access attempts audited for compliance monitoring

---

## Testing Evidence

**Test Scenarios:**
1. Request upload session (`/api/cui/upload-session`) → returns vault upload URL/token (metadata only)\n+2. Browser uploads file directly to vault (`/v1/files/upload`) → vault returns `vaultId`\n+3. Record metadata (`/api/cui/record`) → Railway stores metadata only (`StoredCUIFile` with `vaultId`, `data` empty)\n+4. Attempt to upload CUI to `/api/files/upload` → rejected with instructions to use direct-to-vault flow
3. Access CUI file without authentication → 401 Unauthorized
4. Access CUI file without MFA verification → 403 (MFA required)\n+5. Access CUI file as owner or ADMIN → returns vault view URL/token; bytes stream from vault to browser\n+6. List CUI files → Shows only user's own files (unless admin)

**Code Review Evidence:**
- Code review confirms CUI files stored separately
- Admin authentication and role-based access control implemented
- Access control enforced through authentication and authorization
- Audit logging functional for all access attempts

---

## Security Controls

**CUI File Protection:**
- Separate storage (StoredCUIFile table)
- Primary CUI bytes stored only in the vault boundary (encrypted at rest)\n+- Authentication + MFA required for access to protected resources and CUI token issuance\n+- Role-based access control (users see only their own; admins see all)
- Comprehensive audit logging of all access attempts
- Encryption at rest: vault AES-256-GCM (FIPS-validated module per vault evidence)\n+- Encryption in transit: TLS 1.3 to vault for CUI bytes

**Access Control Management:**
- Authorization enforced at API level (owner/admin checks)\n+- MFA gating enforced in middleware and authorization helper (`requireAuth`)
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
- CUI File Storage (metadata): `lib/file-storage.ts` (`recordCUIUploadMetadata`, `getCUIFileMetadataForView`, `deleteCUIFile`)\n+- CUI Upload Session API: `app/api/cui/upload-session/route.ts`\n+- CUI Metadata Record API: `app/api/cui/record/route.ts`\n+- Non-CUI Upload API (rejects CUI): `app/api/files/upload/route.ts`
- CUI File Download API: `app/api/files/cui/[id]/route.ts`
- CUI File List API: `app/api/files/cui/list/route.ts`
- Database Schema: `prisma/schema.prisma` (StoredCUIFile model)
- Authentication: NextAuth.js with role-based access control
 - CUI boundary CI guardrail: `scripts/check-cui-boundary.ts`, `.github/workflows/cui-boundary.yml`

---

**Document Status:** This document reflects the system state as of 2026-01-24 and is maintained under configuration control.

---

## Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Date:** 2026-01-30  
**Version:** 3.0

**Change History:**
- Version 3.0 (2026-01-30): Updated to direct-to-vault architecture; Railway stores metadata only; CUI download returns vault view session only; added CI guardrail references.\n+- Version 2.0 (2026-01-24): Initial Level 2 draft.\n+- Version 1.0 (2026-01-21): Initial document.
