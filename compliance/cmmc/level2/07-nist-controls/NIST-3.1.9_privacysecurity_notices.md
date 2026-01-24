# NIST SP 800-171 Control 3.1.9

**Control ID:** 3.1.9  
**Requirement:** Privacy/security notices  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.9:**
"Privacy/security notices"

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
- user-agreements/MAC-USR-001-Patrick_User_Agreement.md

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// app/auth/security-acknowledgment/page.tsx (lines 59-123)
// Privacy and security notices displayed:
- System Access Requirements
- Data Handling (FCI/CUI storage, no local storage, no removable media)
- Password Security
- Incident Reporting
- Access Control
```

**Source Code Files:**

**File:** `app/auth/security-acknowledgment/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const SECURITY_ACKNOWLEDGMENT_VERSION = "1.0"

export default function SecurityAcknowledgmentPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accepted) {
      setError("You must accept the security acknowledgment to continue")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Update user's security acknowledgment
      const response = await fetch('/api/auth/security-acknowledgment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: SECURITY_ACKNOWLEDGMENT_VERSION,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save acknowledgment')
      }

      // Update session
      await update()

      // Redirect based on user role
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/user/contract-discovery')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
// ... (truncated)
```

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

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-121_3_1_9_privacy_security_notices_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_1_9_privacy_security_notices_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results from Evidence Files:**

#### Testing/Verification

**Verification Methods:**
- Manual testing: Verify control implementation
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified

**Test Results:**
- ✅ Control 3.1.9 implemented as specified
- ✅ Implementation verified: User acknowledgments
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.9

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
