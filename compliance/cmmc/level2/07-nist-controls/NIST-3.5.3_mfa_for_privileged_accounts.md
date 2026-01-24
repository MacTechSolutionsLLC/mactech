# NIST SP 800-171 Control 3.5.3

**Control ID:** 3.5.3  
**Requirement:** MFA for privileged accounts  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.3:**
"MFA for privileged accounts"

---

## 2. Implementation Status

**Status:** ✅ Implemented

**Status Description:**  
Control is fully implemented by the organization

**Last Assessment Date:** 2026-01-24

---

## 3. Policy and Procedure References

**Policy Document:**  
- MAC-POL-211

**Procedure/SOP References:**  
- MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Solution:** NextAuth.js with TOTP (Time-based One-Time Password) Provider

**Technology Stack:**
- NextAuth.js v5.0.0-beta.30
- @otplib/preset-default v12.0.1
- qrcode library for QR code generation
- bcryptjs for backup code hashing

**MFA Method:** TOTP (RFC 6238)
- Algorithm: SHA1
- Digits: 6
- Period: 30 seconds
- Issuer: "MacTech Solutions"

#### Implementation Components

**Database Schema:**
- File: `prisma/schema.prisma`
- Fields added to User model:
  - `mfaEnabled` (Boolean): Whether MFA is enabled for the user
  - `mfaSecret` (String): Encrypted TOTP secret
  - `mfaBackupCodes` (String): JSON array of hashed backup codes
  - `mfaEnrolledAt` (DateTime): Timestamp of MFA enrollment
  - `failedLoginAttempts` (Int): Count of consecutive failed login attempts
  - `lockedUntil` (DateTime): Account lockout expiration timestamp

**MFA Utilities:**
- File: `lib/mfa.ts`
- Functions:
  - `generateMFASecret()`: Generate TOTP secret
  - `generateTOTPURI()`: Generate TOTP URI for QR code
  - `verifyTOTPCode()`: Verify TOTP code
  - `generateBackupCodes()`: Generate backup codes
  - `enableMFA()`: Enable MFA for user
  - `verifyMFA()`: Verify MFA code (TOTP or backup)

**API Routes:**
- `/api/auth/mfa/enroll` (GET): Generate MFA enrollment data (QR code, backup codes)
- `/api/auth/mfa/verify-enrollment` (POST): Verify and complete MFA enrollment
- `/api/auth/mfa/verify` (POST): Verify MFA code during login
- `/api/auth/custom-signin` (POST): Custom sign-in with MFA checks

**User Interface:**
- `/app/auth/mfa/enroll/page.tsx`: MFA enrollment page
- `/app/auth/mfa/verify/page.tsx`: MFA verification page during login
- `/app/auth/signin/page.tsx`: Updated sign-in page with MFA flow

**Authentication Flow:**
- File: `lib/auth.ts`
- Updated to:
  - Check account lockout status
  - Track failed login attempts
  - Return MFA requirement status in user object

#### MFA Enforcement

**Enforcement Rules:**
- MFA required for all ADMIN role accounts
- MFA required on every login (not just first login)
- MFA bypass not allowed for ADMIN accounts
- MFA optional for USER role (future enhancement)

**Enrollment Process:**
1. User with ADMIN role logs in with password
2. System detects MFA required but not enrolled
3. User redirected to MFA enrollment page
4. System generates TOTP secret and QR code
5. User scans QR code with authenticator app
6. User enters TOTP code to verify enrollment
7. System enables MFA and stores backup codes

**Authentication Process:**
1. User enters email and password
2. Password verified
3. System detects ADMIN role and MFA required
4. User prompted for TOTP code
5. User enters TOTP code from app (or backup code)
6. TOTP code verified
7. Authentication complete, session created

#### Backup Codes

**Backup Code Generation:**
- 10 backup codes generated during enrollment
- Codes are 8-character alphanumeric
- Codes are hashed using bcrypt before storage
- Codes can be used once for MFA verification
- Used codes are removed from storage

**Backup Code Usage:**
- Backup codes can be used if authenticator device is lost
- Backup codes are verified using bcrypt comparison
- Used backup codes are automatically removed

---

**Code Snippets:**

```typescript
// Implementation located in: lib/mfa.ts
// Control 3.5.3: MFA for privileged accounts
```

**Source Code Files:**

**File:** `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Authentication User model
model User {
  id                               String    @id @default(cuid())
  email                            String    @unique
  name                             String?
  password                         String? // Encrypted password (bcrypt hash)
  role                             String    @default("USER") // USER, ADMIN
  image                            String?
  emailVerified                    DateTime?
  mustChangePassword               Boolean   @default(false) // Force password change on next login
  lastLoginAt                      DateTime? // Last successful login timestamp
  disabled                         Boolean   @default(false) // Account disabled flag
  securityAcknowledgmentVersion    String? // Version of security acknowledgment accepted
  securityAcknowledgmentAcceptedAt DateTime? // When security acknowledgment was accepted
  securityAcknowledgmentRequired   Boolean   @default(true) // Whether acknowledgment is required
  // MFA fields (CMMC Level 2)
  mfaEnabled                       Boolean   @default(false) // Whether MFA is enabled for this user
  mfaSecret                        String? // Encrypted TOTP secret
  mfaBackupCodes                   String? // JSON array of hashed backup codes
  mfaEnrolledAt                    DateTime? // When MFA was enrolled
  // Account lockout fields (CMMC Level 2)
  failedLoginAttempts              Int       @default(0) // Number of consecutive failed login attempts
  lockedUntil                      DateTime? // Account lockout expiration timestamp
  createdAt                        DateTime  @default(now())
  updatedAt                        DateTime  @updatedAt

  // Relations
  events             AppEvent[] // Events created by this user
  uploadedFiles      StoredFile[] // Files uploaded by this user
  uploadedCUIFiles   StoredCUIFile[] @relation("CUIFiles") // CUI files uploaded by this user
  physicalAccessLogs PhysicalAccessLog[] // Physical access logs created by this user
  passwordHistory    PasswordHistory[] // Password history for reuse prevention

  @@index([email])
  @@index([disabled])
  @@index([lastLoginAt])
}

// Password history for reuse prevention (NIST SP 800-171 Rev. 2, Section 3.5.8)
model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  passwordHash String // bcrypt hash of password
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
// ... (truncated)
```

**File:** `lib/mfa.ts`

```typescript
/**
 * MFA (Multi-Factor Authentication) utilities for CMMC Level 2 compliance
 * Implements TOTP (Time-based One-Time Password) per NIST SP 800-171 Rev. 2, Section 3.5.3
 */

import { authenticator, totp } from "@otplib/preset-default"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// TOTP configuration per MFA Implementation Guide
const TOTP_CONFIG = {
  issuer: "MacTech Solutions",
  algorithm: "sha1",
  digits: 6,
  period: 30, // seconds
}

/**
 * Generate a new TOTP secret for a user
 */
export function generateMFASecret(email: string): string {
  return authenticator.generateSecret()
}

/**
 * Generate TOTP URI for QR code generation
 */
export function generateTOTPURI(email: string, secret: string): string {
  return authenticator.keyuri(email, TOTP_CONFIG.issuer, secret)
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTPCode(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error("TOTP verification error:", error)
    return false
  }
}

/**
 * Generate backup codes for MFA recovery
 * Returns array of plain text codes (should be hashed before storage)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()
    codes.push(code)
  }
  return codes
}

/**
 * Hash backup codes for storage
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-104_MFA_Implementation_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_5_3_mfa_for_privileged_accounts_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_5_3_mfa_for_privileged_accounts_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

#### Testing

#### Test Scenarios

**Test Cases:**
1. ✅ MFA enrollment for new ADMIN user
2. ✅ MFA authentication with valid TOTP code
3. ✅ MFA authentication with invalid TOTP code
4. ✅ MFA authentication with backup code
5. ✅ MFA enforcement for ADMIN role
6. ✅ Account lockout integration
7. ✅ Failed login attempt tracking

**Test Results:** Implementation complete, ready for user acceptance testing.

---

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.5.3 implemented as specified
- ✅ Implementation verified: lib/mfa.ts, app/auth/mfa/
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.3

**SSP Document:**  
`../01-system-scope/MAC-IT-304_System_Security_Plan.md`

---

## 8. Related Controls

**Control Family:** Identification and Authentication (IA)

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
