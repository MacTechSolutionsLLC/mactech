# NIST SP 800-171 Control 3.1.8

**Control ID:** 3.1.8  
**Requirement:** Limit unsuccessful logon attempts  
**Control Family:** Access Control (AC)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.1.8:**
"Limit unsuccessful logon attempts"

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
- MAC-SOP-222

**Policy File Location:**  
`../02-policies-and-procedures/`

---

## 4. Implementation Evidence

### 4.1 Code Implementation

**Lockout Parameters:**
- Maximum failed attempts: 5 consecutive failed login attempts
- Lockout duration: 30 minutes
- Lockout reset: Automatic on successful login

**Implementation Location:**
- `lib/auth.ts` - NextAuth credentials provider
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API route

#### Database Schema

**Fields Added to User Model:**
- `failedLoginAttempts` (Int): Count of consecutive failed login attempts (default: 0)
- `lockedUntil` (DateTime): Account lockout expiration timestamp (nullable)

**Schema File:** `prisma/schema.prisma`

#### Account Lockout Logic

**Lockout Process:**
1. User attempts login with invalid password
2. System increments `failedLoginAttempts` counter
3. If `failedLoginAttempts >= 5`:
   - Set `lockedUntil` to current time + 30 minutes
   - Account is locked
4. On successful login:
   - Reset `failedLoginAttempts` to 0
   - Clear `lockedUntil` (set to null)

**Lockout Check:**
- Before password verification, system checks if `lockedUntil` is set and not expired
- If account is locked, authentication is rejected immediately
- Locked account message: "Account is locked due to too many failed login attempts. Please try again later."

#### Implementation Code

**lib/auth.ts:**
```typescript
// Check if account is locked
if (user.lockedUntil && new Date() < user.lockedUntil) {
  await logLogin(user.id, user.email, false).catch(() => {})
  return null
}

// Increment failed attempts on invalid password
const failedAttempts = (user.failedLoginAttempts || 0) + 1
const maxAttempts = 5
const lockoutDuration = 30 * 60 * 1000 // 30 minutes

if (failedAttempts >= maxAttempts) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: failedAttempts,
      lockedUntil: new Date(Date.now() + lockoutDuration),
    },
  })
}

// Reset on successful login
if (user.failedLoginAttempts > 0 || user.lockedUntil) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })
}
```

**app/api/auth/custom-signin/route.ts:**
- Same lockout logic implemented in custom sign-in route
- Ensures consistent behavior across authentication methods

---

**Code Snippets:**

```typescript
// From lib/auth.ts
// Check if account is locked
if (user.lockedUntil && new Date() < user.lockedUntil) {
  await logLogin(user.id, user.email, false).catch(() => {})
  return null
}

// Increment failed attempts on invalid password
const failedAttempts = (user.failedLoginAttempts || 0) + 1
const maxAttempts = 5
const lockoutDuration = 30 * 60 * 1000 // 30 minutes

if (failedAttempts >= maxAttempts) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: failedAttempts,
      lockedUntil: new Date(Date.now() + lockoutDuration),
    },
  })
}

// Reset on successful login
if (user.failedLoginAttempts > 0 || user.lockedUntil) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })
}
```

```typescript
// Check if account is locked
if (user.lockedUntil && new Date() < user.lockedUntil) {
  await logLogin(user.id, user.email, false).catch(() => {})
  return null
}

// Increment failed attempts on invalid password
const failedAttempts = (user.failedLoginAttempts || 0) + 1
const maxAttempts = 5
const lockoutDuration = 30 * 60 * 1000 // 30 minutes

if (failedAttempts >= maxAttempts) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: failedAttempts,
      lockedUntil: new Date(Date.now() + lockoutDuration),
    },
  })
}

// Reset on successful login
if (user.failedLoginAttempts > 0 || user.lockedUntil) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })
}
```

**Source Code Files:**

**File:** `lib/auth.ts`

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { logLogin } from "./audit"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Trust Railway's proxy
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const loginValue = (credentials.email as string).toLowerCase().trim()
        
        // Try to find user by email first, then by name (case-insensitive)
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: loginValue, mode: 'insensitive' } },
              { name: { equals: loginValue, mode: 'insensitive' } }
            ]
          }
        })

        if (!user || !user.password) {
          // Log failed login attempt (user not found)
          await logLogin(null, loginValue, false).catch(() => {
            // Don't fail auth if logging fails
          })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed login attempts and check for lockout
          const failedAttempts = (user.failedLoginAttempts || 0) + 1
          const maxAttempts = 5 // Configurable: 5 failed attempts
          const lockoutDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

          if (failedAttempts >= maxAttempts) {
            // Lock account
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
// ... (truncated)
```

**File:** `app/api/auth/custom-signin/route.ts`

```typescript
/**
 * Custom Sign-In API Route
 * Handles password authentication and MFA requirement checks
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logLogin } from "@/lib/audit"
import { isMFARequired, isMFAEnrolled } from "@/lib/mfa"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const loginValue = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginValue, mode: "insensitive" } },
          { name: { equals: loginValue, mode: "insensitive" } },
        ],
      },
    })

    if (!user || !user.password) {
      await logLogin(null, loginValue, false).catch(() => {})
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      await logLogin(user.id, user.email, false).catch(() => {})
      return NextResponse.json(
        {
          error: "Account is locked due to too many failed login attempts. Please try again later.",
        },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
// ... (truncated)
```

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-105.md`
- `../05-evidence/MAC-RPT-105_Account_Lockout_Implementation_Evidence.md`


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
1. ✅ Account lockout after 5 failed attempts
2. ✅ Lockout expiration after 30 minutes
3. ✅ Lockout reset on successful login
4. ✅ Failed attempt counter reset on successful login
5. ✅ Locked account cannot authenticate
6. ✅ Audit logging of lockout events

**Test Results:** Implementation complete, ready for user acceptance testing.

---

**Last Verification Date:** 2026-01-24

## 7. SSP References

**System Security Plan Section:**  
- Section 7.1, 3.1.8

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
