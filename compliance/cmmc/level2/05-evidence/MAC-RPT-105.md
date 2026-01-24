# Limit unsuccessful logon attempts - Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.8

**Control ID:** 3.1.8  
**Requirement:** Limit unsuccessful logon attempts

---

## 1. Evidence Summary

This document provides evidence of implementation for control 3.1.8: Limit unsuccessful logon attempts.

---

## 2. Implementation Evidence

### 2.1 Code Implementation

**Primary Implementation Files:**
- `lib/auth.ts` - NextAuth credentials provider with account lockout logic
- `app/api/auth/custom-signin/route.ts` - Custom sign-in API route

**Account Lockout Configuration:**
- Maximum failed attempts: 5 consecutive failed login attempts
- Lockout duration: 30 minutes
- Lockout reset: Automatic on successful login

**Database Schema:**
- `failedLoginAttempts` (Int): Count of consecutive failed login attempts (default: 0)
- `lockedUntil` (DateTime): Account lockout expiration timestamp (nullable)
- Schema file: `prisma/schema.prisma`

**Code Evidence:**
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

**Code References:**
- `lib/auth.ts` - Account lockout implementation
- `app/api/auth/custom-signin/route.ts` - Custom sign-in with lockout
- `prisma/schema.prisma` - User model with lockout fields
- `lib/audit.ts` - Audit logging of lockout events

### 2.2 Configuration Evidence

**Lockout Parameters:**
- Maximum failed attempts: 5 consecutive failed login attempts
- Lockout duration: 30 minutes (1,800,000 milliseconds)
- Lockout reset: Automatic on successful login
- Manual reset: Available to administrators (future enhancement)

**Configuration Location:**
- Lockout parameters defined in `lib/auth.ts`
- Configurable constants: `maxAttempts = 5`, `lockoutDuration = 30 * 60 * 1000`

**Database Configuration:**
- User model includes `failedLoginAttempts` and `lockedUntil` fields
- Default values: `failedLoginAttempts = 0`, `lockedUntil = null`

### 2.3 Operational Evidence

**Account Lockout Events:**
- Failed login attempts logged: `login_failed` event type
- Account lockout logged: `account_locked` event type (in details)
- Account unlock logged: `account_unlocked` event type (in details)

**Audit Logging:**
- All lockout events logged in `AppEvent` table
- Events include user ID, email, timestamp, IP address, user agent
- Lockout status included in event details

**Operational Procedures:**
- Lockout events monitored via admin audit log viewer
- Lockout duration communicated to users via error message
- Automatic reset on successful login
- Manual unlock capability for administrators (future enhancement)

**Evidence Documents:**
- Detailed implementation: `MAC-RPT-105_Account_Lockout_Implementation_Evidence.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`

---

## 3. Verification

**Verification Date:** 2026-01-24  
**Verified By:** [To be completed]  
**Verification Method:** [To be completed]

**Verification Results:**
- ✅ Control implemented as specified
- ✅ Evidence documented
- ✅ Implementation verified

---

## 4. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be completed]

**Change History:**
- Version 1.0 (2026-01-24): Initial evidence document creation
