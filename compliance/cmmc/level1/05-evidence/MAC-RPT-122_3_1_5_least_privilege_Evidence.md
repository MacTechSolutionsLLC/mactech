# Least Privilege Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.5

**Control ID:** 3.1.5  
**Requirement:** Employ the principle of least privilege, including for specific security functions and privileged accounts

---

## 1. Purpose

This document provides evidence of the implementation of least privilege access control to grant users only the minimum access necessary, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.5.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Least Privilege Implementation:** Role-Based Access Control (RBAC) with USER and ADMIN roles

**Enforcement:** Middleware-based route protection + authorization functions

---

## 3. Code Implementation

### 3.1 Role-Based Access Control

**File:** `middleware.ts`

**Role Enforcement:**
- USER role: Limited access (user portal only)
- ADMIN role: Full access (admin portal + user portal)
- Non-admin users cannot access admin functions

**Code Implementation:**
```typescript
// middleware.ts (lines 46-67)
// Protect admin routes (require ADMIN role)
if (pathname.startsWith("/admin")) {
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Check if user is admin
  if (session.user?.role !== "ADMIN") {
    // Redirect to user contract discovery if not admin
    return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
  }
}
```

**Code References:**
- `middleware.ts` - Lines 46-67 (role enforcement)
- ADMIN role required for admin routes

**Evidence:**
- `middleware.ts` - Role enforcement implemented
- Least privilege enforced

---

### 3.2 Authorization Functions

**File:** `lib/authz.ts`

**Least Privilege Functions:**
```typescript
// lib/authz.ts (lines 13-37)
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    )
  }
  return session
}
```

**Code References:**
- `lib/authz.ts` - Lines 13-37 (authorization functions)
- requireAdmin() enforces least privilege

**Evidence:**
- `lib/authz.ts` - Authorization functions exist
- Least privilege enforced

---

### 3.3 User Role Model

**File:** `prisma/schema.prisma`

**Role Structure:**
- USER role: Default role, minimal access
- ADMIN role: Privileged role, full access
- Roles stored in User model

**Code Implementation:**
```prisma
// prisma/schema.prisma (line 19)
model User {
  id                               String    @id @default(cuid())
  email                            String    @unique
  role                             String    @default("USER") // USER, ADMIN
  // ... additional fields
}
```

**Code References:**
- `prisma/schema.prisma` - User model (line 19: role field)
- Default role: USER (least privilege)

**Evidence:**
- `prisma/schema.prisma` - Role field in User model
- Default role enforces least privilege

---

### 3.4 Security Function Access

**Security Functions:**
- Security functions restricted to ADMIN role
- Audit log access: Admin-only
- User management: Admin-only
- Configuration management: Admin-only

**Code References:**
- `middleware.ts` - Admin route protection
- `lib/authz.ts` - requireAdmin() function
- Security functions protected

**Evidence:**
- Security function access restricted
- Least privilege enforced

---

### 3.5 Privileged Account Access

**Privileged Accounts:**
- ADMIN role accounts have privileged access
- Privileged access limited to authorized administrators
- Privileged functions require ADMIN role

**Code References:**
- `middleware.ts` - Admin route protection
- `lib/authz.ts` - requireAdmin() function
- Privileged access controlled

**Evidence:**
- Privileged account access controlled
- Least privilege enforced

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Account Lifecycle Enforcement Procedure: `../02-policies-and-procedures/MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.5)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Role-based access control (middleware.ts), authorization functions (lib/authz.ts), user role model (prisma/schema.prisma), security function access, privileged account access, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
