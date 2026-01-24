# Identify Users Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.5.1

**Control ID:** 3.5.1  
**Requirement:** Identify system users, processes acting on behalf of users, and devices

---

## 1. Purpose

This document provides evidence of the implementation of user identification mechanisms to uniquely identify system users, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.5.1.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Identification Method:** Unique email addresses + system-generated CUID identifiers

---

## 3. Code Implementation

### 3.1 User Model Structure

**File:** `prisma/schema.prisma`

**User Model:**
```prisma
// prisma/schema.prisma (lines 14-27)
model User {
  id                               String    @id @default(cuid())
  email                            String    @unique
  name                             String?
  password                         String? // Encrypted password (bcrypt hash)
  role                             String    @default("USER") // USER, ADMIN
  image                            String?
  emailVerified                    DateTime?
  mustChangePassword               Boolean   @default(false)
  lastLoginAt                      DateTime?
  disabled                         Boolean   @default(false)
  securityAcknowledgmentVersion    String?
  securityAcknowledgmentAcceptedAt DateTime?
  securityAcknowledgmentRequired   Boolean   @default(true)
  // ... additional fields
}
```

**Unique Identifiers:**
- `id`: System-generated CUID (cryptographically unique identifier)
- `email`: Unique email address (primary user identifier)

**Code References:**
- `prisma/schema.prisma` - User model (lines 14-27)
- Line 15: `id String @id @default(cuid())` - Unique system identifier
- Line 16: `email String @unique` - Unique email constraint

**Evidence:**
- `prisma/schema.prisma` - User model exists
- Unique constraints enforced at database level

---

### 3.2 User Identification Enforcement

**Database-Level Enforcement:**
- Email uniqueness enforced by PostgreSQL unique constraint
- System identifier (CUID) automatically generated and unique
- Database prevents duplicate email addresses

**Code References:**
- `prisma/schema.prisma` - Unique constraint on email field
- Database enforces uniqueness

**Evidence:**
- Database schema enforces unique email addresses
- System identifiers are unique

---

### 3.3 Application-Level User Identification

**User Creation:**
- User creation validates email uniqueness
- System checks for existing email addresses before creation
- Duplicate email addresses rejected

**Code Implementation:**
```typescript
// app/api/admin/create-user/route.ts (lines 41-50)
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
```

**Code References:**
- `app/api/admin/create-user/route.ts` - Lines 41-50 (email uniqueness check)
- Application validates email before creating user

**Evidence:**
- `app/api/admin/create-user/route.ts` - Email uniqueness validation
- Duplicate email addresses rejected

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

- Identification and Authentication Policy: `../02-policies-and-procedures/MAC-POL-211_Identification_and_Authentication_Policy.md`
- User Account Provisioning Procedure: `../02-policies-and-procedures/MAC-SOP-221_User_Account_Provisioning_and_Deprovisioning_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.2, 3.5.1)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - User model structure (prisma/schema.prisma), user identification enforcement, application-level user identification (app/api/admin/create-user/route.ts), process identification, device identification, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
