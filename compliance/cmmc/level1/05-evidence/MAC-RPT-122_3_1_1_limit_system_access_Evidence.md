# Limit System Access Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.1

**Control ID:** 3.1.1  
**Requirement:** Limit system access to authorized users, processes acting on behalf of authorized users, and devices

---

## 1. Purpose

This document provides evidence of the implementation of access control mechanisms to limit system access to authorized users, processes, and devices, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.1.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Access Control System:** NextAuth.js authentication + middleware-based authorization

**Access Enforcement:** All protected routes require authentication

---

## 3. Code Implementation

### 3.1 Authentication Requirement

**File:** `middleware.ts`

**Access Control Enforcement:**
```typescript
// middleware.ts (lines 19-26)
// Allow access to auth pages and password change
if (pathname.startsWith("/auth")) {
  return NextResponse.next()
}

// Protect user portal routes (require authentication, allow all roles)
if (pathname.startsWith("/user")) {
  if (!session) {
    // Redirect to sign in if not authenticated
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

### 3.2 NextAuth.js Authentication

**File:** `lib/auth.ts`

**Authentication System:**
- NextAuth.js provides authentication framework
- Credentials provider for email/password authentication
- Session management via JWT tokens

**Code Implementation:**
```typescript
// lib/auth.ts (lines 8-196)
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    CredentialsProvider({
      // ... authentication logic
    })
  ],
  // ... session configuration
})
```

**Code References:**
- `lib/auth.ts` - Lines 8-196 (NextAuth configuration)
- Authentication system functional

**Evidence:**
- `lib/auth.ts` - Authentication system exists
- NextAuth.js configured

---

### 3.3 User Model

**File:** `prisma/schema.prisma`

**User Identification:**
- Users identified by unique email addresses
- System-generated unique identifiers (CUID)
- User accounts stored in database

**Code Implementation:**
```prisma
// prisma/schema.prisma (lines 14-27)
model User {
  id                               String    @id @default(cuid())
  email                            String    @unique
  name                             String?
  password                         String?
  role                             String    @default("USER")
  // ... additional fields
}
```

**Code References:**
- `prisma/schema.prisma` - User model (lines 14-27)
- Unique email constraint enforces user identification

**Evidence:**
- `prisma/schema.prisma` - User model exists
- User identification functional

---

### 3.4 Process Identification

**Process Identification:**
- Processes identified via application logging
- Audit logs include process context
- System processes logged with identification

**Code References:**
- `lib/audit.ts` - Audit logging with process identification
- Processes logged in audit system

**Evidence:**
- Process identification in audit logs
- System processes tracked

---

### 3.5 Device Identification

**Device Identification:**
- Endpoint inventory tracks devices
- Device identification via endpoint inventory system
- Devices logged with identifiers

**Code References:**
- Endpoint inventory: `/admin/endpoint-inventory`
- Device tracking in database

**Evidence:**
- Endpoint inventory system exists
- Device identification functional

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- User Account Provisioning Procedure: `../02-policies-and-procedures/MAC-SOP-221_User_Account_Provisioning_and_Deprovisioning_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.1)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Authentication requirement (middleware.ts), NextAuth.js authentication (lib/auth.ts), user model (prisma/schema.prisma), process identification, device identification, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
