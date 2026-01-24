# NIST SP 800-171 Control 3.5.8

**Control ID:** 3.5.8  
**Requirement:** Prohibit password reuse  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.8:**
"Prohibit password reuse"

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
- MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```prisma
model User {
  id    String  @id @default(cuid())
  email String  @unique  // Unique constraint prevents reuse
  // ... other fields
}
```

```typescript
// lib/password-policy.ts (line 126)
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12,
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5, // Number of previous passwords to prevent reuse
}
```

```prisma
// prisma/schema.prisma (lines 51-61)
model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  passwordHash String // bcrypt hash of password
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
}
```

```typescript
// app/api/auth/change-password/route.ts (lines 75-93)
// Check password history to prevent reuse
const passwordHistory = await prisma.passwordHistory.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  take: PASSWORD_POLICY.passwordHistoryCount,
})

// Check against password history
for (const historyEntry of passwordHistory) {
  const isReusedPassword = await bcrypt.compare(newPassword, historyEntry.passwordHash)
  if (isReusedPassword) {
    return NextResponse.json(
      { 
        error: `Password cannot be reused. You cannot use any of your last ${PASSWORD_POLICY.passwordHistoryCount} passwords.`,
        errors: [`Password reuse is prohibited for the last ${PASSWORD_POLICY.passwordHistoryCount} passwords`]
      },
      { status: 400 }
    )
  }
}
```

```typescript
// app/api/auth/change-password/route.ts (lines 107-113)
// Save current password to history before updating
await prisma.passwordHistory.create({
  data: {
    userId: user.id,
    passwordHash: user.password, // Store the old password hash
  }
})
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

**File:** `app/api/admin/create-user/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/authz'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { monitorCUIKeywords } from '@/lib/cui-blocker'
import { logAdminAction, logEvent } from '@/lib/audit'

// API route to create admin users (protected - only existing admins can create new users)
// Requires admin authentication
export async function POST(req: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin()

    const { email, password, name, role = 'ADMIN' } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Monitor input for CUI keywords (monitoring-only, does not block)
    await monitorCUIKeywords({ email, name, role }, "user_creation", session.user.id, session.user.email || null)

    // Validate password against policy
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password with configured cost factor
    const hashedPassword = await bcrypt.hash(password, PASSWORD_POLICY.bcryptRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md`
- `../05-evidence/MAC-RPT-121_3_5_8_prohibit_password_reuse_Evidence.md`
- `../05-evidence/MAC-RPT-122_3_5_8_prohibit_password_reuse_Evidence.md`


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
- ✅ Control 3.5.8 implemented as specified
- ✅ Implementation verified: Password history (5 generations)
- ✅ Evidence documented

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.8

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
