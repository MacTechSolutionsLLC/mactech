# Authenticate Users Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.2

**Control ID:** 3.5.2  
**Requirement:** Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access

---

## 1. Purpose

This document provides evidence of the implementation of user authentication mechanisms to verify user identities before allowing system access, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.5.2.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Authentication System:** NextAuth.js with credentials provider

**Authentication Method:** Email and password with bcrypt password verification

---

## 3. Code Implementation

### 3.1 Authentication System

**File:** `lib/auth.ts`

**NextAuth Configuration:**
```typescript
// lib/auth.ts (lines 8-196)
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
        // Authentication logic
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // 1 hour
  },
  // ... additional configuration
})
```

**Code References:**
- `lib/auth.ts` - Lines 8-196 (NextAuth configuration)
- NextAuth.js provides authentication framework

**Evidence:**
- `lib/auth.ts` - Authentication system exists
- NextAuth.js configured for authentication

---

### 3.2 Authentication Flow

**Authentication Process:**
1. User provides email and password credentials
2. System normalizes email (lowercase, trimmed)
3. System queries database for user by email or name (case-insensitive)
4. System retrieves stored password hash
5. System compares provided password with stored hash using bcrypt
6. If password matches, user is authenticated and session is created
7. Session token is used for subsequent requests

**Code Implementation:**
```typescript
// lib/auth.ts (lines 19-133)
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
    await logLogin(null, loginValue, false).catch(() => {})
    return null
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password as string,
    user.password
  )

  if (!isPasswordValid) {
    // Increment failed login attempts and check for lockout
    // ... lockout logic
    await logLogin(user.id, user.email, false).catch(() => {})
    return null
  }

  // Check if account is locked
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    await logLogin(user.id, user.email, false).catch(() => {})
    return null
  }

  // Reset failed login attempts on successful password verification
  // ... reset logic

  // Log successful login
  await logLogin(user.id, user.email, true).catch(() => {})

  // Return user object for session creation
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    // ... MFA fields
  }
}
```

**Code References:**
- `lib/auth.ts` - Lines 19-133 (authentication flow)
- Password verification: Lines 44-47 (bcrypt.compare)
- Session creation: Lines 123-133 (user object return)

**Evidence:**
- `lib/auth.ts` - Authentication flow implemented
- Password verification functional
- Session creation functional

---

### 3.3 Password Verification

**Password Hashing:**
- Passwords hashed using bcrypt (12 rounds)
- Password verification using bcrypt.compare()
- Passwords never stored in plaintext

**Code Implementation:**
```typescript
// lib/auth.ts (lines 44-47)
const isPasswordValid = await bcrypt.compare(
  credentials.password as string,
  user.password
)
```

**Code References:**
- `lib/auth.ts` - Lines 44-47 (password verification)
- `lib/password-policy.ts` - PASSWORD_POLICY.bcryptRounds = 12

**Evidence:**
- Password verification implemented
- Bcrypt hashing functional

---

### 3.4 Session Management

**Session Strategy:**
- Token-based authentication via NextAuth.js
- JWT tokens used for session management
- Session tokens validated on each request

**Code Implementation:**
```typescript
// lib/auth.ts (lines 136-140)
session: {
  strategy: "jwt",
  maxAge: 8 * 60 * 60, // 8 hours
  updateAge: 60 * 60, // 1 hour (refresh token every hour)
}
```

**Code References:**
- `lib/auth.ts` - Lines 136-140 (session configuration)
- Session tokens managed by NextAuth.js

**Evidence:**
- Session management configured
- Token-based authentication functional

---

### 3.5 Authentication Enforcement

**Middleware Enforcement:**
- All protected routes require authentication
- Unauthenticated users redirected to sign-in page
- Authentication status verified on every request

**Code Implementation:**
```typescript
// middleware.ts (lines 19-26)
// Allow access to auth pages and password change
if (pathname.startsWith("/auth")) {
  return NextResponse.next()
}

// Protect user portal routes (require authentication, allow all roles)
if (pathname.startsWith("/user")) {
  if (!session) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }
}
```

**Code References:**
- `middleware.ts` - Lines 19-26 (authentication enforcement)
- All protected routes require authentication

**Evidence:**
- `middleware.ts` - Authentication enforcement implemented
- Unauthenticated users redirected

---

## 4. Related Documents

- Identification and Authentication Policy: `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.2, 3.5.2)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Authentication system (lib/auth.ts NextAuth configuration), authentication flow (authorize function), password verification (bcrypt.compare), session management (JWT tokens), authentication enforcement (middleware.ts), and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
