# Non-Privileged Accounts Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.6

**Control ID:** 3.1.6  
**Requirement:** Use non-privileged accounts or roles when accessing nonsecurity functions

---

## 1. Purpose

This document provides evidence of the implementation of non-privileged accounts (USER role) for accessing nonsecurity functions, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.6.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Non-Privileged Role:** USER role used for non-administrative access

**Enforcement:** Role-based access control with USER and ADMIN roles

---

## 3. Code Implementation

### 3.1 USER Role Implementation

**File:** `prisma/schema.prisma`

**User Role Model:**
```prisma
// prisma/schema.prisma (line 19)
model User {
  id                               String    @id @default(cuid())
  email                            String    @unique
  role                             String    @default("USER") // USER, ADMIN
  // ... additional fields
}
```

**Default Role:**
- Default role: USER (non-privileged)
- USER role used for non-administrative access
- ADMIN role used only when administrative functions required

**Code References:**
- `prisma/schema.prisma` - User model (line 19: role field, default "USER")
- Default role is non-privileged

**Evidence:**
- `prisma/schema.prisma` - USER role as default
- Non-privileged accounts implemented

---

### 3.2 Non-Privileged Access Enforcement

**File:** `middleware.ts`

**User Portal Access:**
- USER role can access user portal routes
- Non-privileged access allowed for user functions
- Admin routes require ADMIN role

**Code Implementation:**
```typescript
// middleware.ts (lines 29-44)
// Protect user portal routes (require authentication, allow all roles)
if (pathname.startsWith("/user")) {
  if (!session) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }
  // USER role can access user portal
}
```

**Code References:**
- `middleware.ts` - Lines 29-44 (user portal access)
- USER role can access user routes

**Evidence:**
- `middleware.ts` - Non-privileged access allowed
- USER role can access user functions

---

### 3.3 Role-Based Access Separation

**Access Separation:**
- USER role: Access to user portal only
- ADMIN role: Access to admin portal + user portal
- Non-privileged accounts cannot access security functions

**Code References:**
- `middleware.ts` - Role-based access separation
- USER role limited to user functions

**Evidence:**
- Role-based access separation implemented
- Non-privileged accounts restricted

---

### 3.4 Application-Level Enforcement

**Authorization Functions:**
- requireAuth() allows authenticated users (USER or ADMIN)
- requireAdmin() restricts to ADMIN role only
- Non-privileged functions accessible to USER role

**Code Implementation:**
```typescript
// lib/authz.ts (lines 13-22)
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  return session // Allows USER or ADMIN
}
```

**Code References:**
- `lib/authz.ts` - Lines 13-22 (requireAuth function)
- requireAuth() allows non-privileged access

**Evidence:**
- Authorization functions support non-privileged access
- USER role can access nonsecurity functions

---

### 3.5 Non-Privileged Account Usage

**Account Usage:**
- USER role used for non-administrative access
- Non-privileged accounts cannot access security functions
- Application enforces role-based access to functions

**Code References:**
- `middleware.ts` - Role enforcement
- `lib/authz.ts` - Authorization checks
- Non-privileged accounts functional

**Evidence:**
- Non-privileged account usage implemented
- USER role functional

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Account Lifecycle Enforcement Procedure: `../02-policies-and-procedures/MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.6)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - USER role implementation (prisma/schema.prisma), non-privileged access enforcement (middleware.ts), role-based access separation, application-level enforcement (lib/authz.ts), non-privileged account usage, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
