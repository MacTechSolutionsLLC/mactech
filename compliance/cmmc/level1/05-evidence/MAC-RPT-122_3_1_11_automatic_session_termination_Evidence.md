# Automatic Session Termination Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.11

**Control ID:** 3.1.11  
**Requirement:** Terminate (automatically) a user session after a defined condition

---

## 1. Purpose

This document provides evidence of the implementation of automatic session termination after a defined condition (8 hours of inactivity), demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.11.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Session Timeout:** 8 hours (28,800 seconds)

**Enforcement:** NextAuth.js session management with automatic expiration

---

## 3. Code Implementation

### 3.1 Session Configuration

**File:** `lib/auth.ts`

**Session Timeout:**
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
- maxAge: 8 hours (automatic termination)

**Evidence:**
- `lib/auth.ts` - Session timeout configured
- Automatic termination after 8 hours

---

### 3.2 Session Expiration Enforcement

**File:** `middleware.ts`

**Session Validation:**
- Middleware validates session on each request
- Expired sessions rejected
- Users redirected to sign-in if session expired

**Code Implementation:**
```typescript
// middleware.ts (line 7)
export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth // Session validated by NextAuth

  // If no session, redirect to sign-in
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
  // ... additional checks
})
```

**Code References:**
- `middleware.ts` - Line 7 (session validation)
- Expired sessions rejected

**Evidence:**
- `middleware.ts` - Session validation implemented
- Expired sessions handled

---

### 3.3 Token Expiration

**JWT Token Expiration:**
- JWT tokens include expiration timestamps
- Tokens expire after 8 hours
- Expired tokens rejected

**Code Implementation:**
```typescript
// lib/auth.ts (lines 157-195)
callbacks: {
  async jwt({ token, user, trigger, session }) {
    // Token includes expiration
    return token
  },
  async session({ session, token }) {
    // Session validated against token expiration
    return session
  },
}
```

**Code References:**
- `lib/auth.ts` - Lines 157-195 (JWT callbacks)
- Token expiration enforced

**Evidence:**
- JWT token expiration configured
- Expired tokens rejected

---

### 3.4 Session Termination Logging

**Audit Logging:**
- Session termination events logged
- Logout events captured in audit log
- Session expiration tracked

**Code References:**
- `lib/audit.ts` - Session event logging
- Session termination logged

**Evidence:**
- Session termination logging implemented
- Events tracked in audit log

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.11)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Session configuration (lib/auth.ts, 8-hour timeout), session expiration enforcement (middleware.ts), token expiration (JWT tokens), session termination logging, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
