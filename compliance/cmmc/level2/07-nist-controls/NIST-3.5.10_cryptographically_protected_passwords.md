# NIST SP 800-171 Control 3.5.10

**Control ID:** 3.5.10  
**Requirement:** Cryptographically-protected passwords  
**Control Family:** Identification and Authentication (IA)  
**Reference:** NIST SP 800-171 Rev. 2

---

## 1. Control Requirement

**NIST SP 800-171 Rev. 2, Section 3.5.10:**
"Cryptographically-protected passwords"

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
// lib/password-policy.ts (line 124)
export const PASSWORD_POLICY = {
  minLength: 14,
  bcryptRounds: 12, // Cost factor for bcrypt
  requireCommonPasswordCheck: true,
  passwordHistoryCount: 5,
}
```

```typescript
// app/api/auth/change-password/route.ts (line 96)
// Hash new password with configured cost factor
const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_POLICY.bcryptRounds)
```

```typescript
// app/api/admin/create-user/route.ts (lines 52-70)
// Hash password with configured cost factor
const hashedPassword = await bcrypt.hash(password, PASSWORD_POLICY.bcryptRounds)

// Create user
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword, // Stored as hash, not plaintext
    name: name || null,
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
  },
})
```

```typescript
// lib/auth.ts (lines 44-47)
const isPasswordValid = await bcrypt.compare(
  credentials.password as string,
  user.password
)
```

```typescript
// middleware.ts (lines 9-17)
// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  const protocol = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol
  if (protocol === "http") {
    const httpsUrl = new URL(req.url)
    httpsUrl.protocol = "https"
    return NextResponse.redirect(httpsUrl, 301)
  }
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

### 4.2 System/Configuration Evidence

### 4.3 Operational Procedures

## 5. Evidence Documents

**MAC-RPT Evidence Files:**  
- `../05-evidence/MAC-RPT-122_3_5_10_cryptographically_protected_passwords_Evidence.md`


---

## 6. Testing and Verification

**Verification Methods:**  
- Code review: Verify implementation code exists
- Operational testing: Verify control functions as specified
- Configuration review: Verify settings are properly configured

**Test Results:**  
- ✅ Control 3.5.10 implemented as specified
- ✅ Implementation verified
- ✅ Evidence documented

**Last Verification Date:** 2026-01-24

---

## 7. SSP References

**System Security Plan Section:**  
- Section 7.2, 3.5.10

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
