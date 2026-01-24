# NIST SP 800-171 Control 3.5.7

**Control ID:** 3.5.7  
**Requirement:** Password complexity  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.7:**
"Password complexity"

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
- No specific procedure document

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Code Snippets:**

```typescript
// lib/password-policy.ts (lines 122-127)
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12, // Cost factor for bcrypt
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5, // Number of previous passwords to prevent reuse
}
```

```typescript
// lib/password-policy.ts (lines 164-191)
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!password) {
    errors.push("Password is required")
    return { valid: false, errors }
  }

  // Check minimum length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_POLICY.minLength} characters long`
    )
  }

  // Check common passwords
  if (PASSWORD_POLICY.requireCommonPasswordCheck && checkCommonPasswords(password)) {
    errors.push("Password cannot be a common password")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

```typescript
// lib/password-policy.ts (lines 7-117)
const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "123456789",
  // ... 100 most common passwords
]

export function checkCommonPasswords(password: string): boolean {
  const lowerPassword = password.toLowerCase()
  return COMMON_PASSWORDS.includes(lowerPassword)
}
```

```typescript
// app/api/auth/change-password/route.ts (lines 28-38)
// Validate password against policy
const passwordValidation = validatePassword(newPassword)
if (!passwordValidation.valid) {
  return NextResponse.json(
    {
      error: 'Password does not meet requirements',
      errors: passwordValidation.errors,
    },
    { status: 400 }
  )
}
```

```typescript
// app/api/admin/create-user/route.ts (lines 28-38)
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
```

**Source Code Files:**

**File:** `lib/password-policy.ts`

```typescript
/**
 * Password policy enforcement for CMMC Level 1 compliance
 * Minimum 14 characters, common password denylist
 * Bcrypt cost factor: 12 (documented)
 */

// Common passwords denylist (100 most common)
// Source: Common password lists (top 100)
const COMMON_PASSWORDS = [
  "password",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "abc123",
  "password1",
  "Password1",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "1234567",
  "123456",
  "sunshine",
  "princess",
  "football",
  "iloveyou",
  "master",
  "hello",
  "freedom",
  "whatever",
  "qazwsx",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "starwars",
  "batman",
  "superman",
  "qwertyuiop",
  "123qwe",
  "zxcvbnm",
  "asdfgh",
  "qwerty123",
  "password12",
  "Password123",
  "admin123",
  "root",
  "toor",
  "pass",
  "test",
  "guest",
  "info",
  "adm",
  "mysql",
  "user",
  "administrator",
  "oracle",
  "ftp",
// ... (truncated)
```

**File:** `app/api/auth/change-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy'
import { logEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate password against policy
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          errors: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-122_3_5_7_password_complexity_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.5.7 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.7

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
