# Limit Access to Transactions and Functions Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.2

**Control ID:** 3.1.2  
**Requirement:** Limit system access to the types of transactions and functions that authorized users are permitted to execute

---

## 1. Purpose

This document provides evidence of the implementation of role-based access control to limit system access to authorized transactions and functions, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.2.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Access Control System:** Role-Based Access Control (RBAC) with USER and ADMIN roles

**Enforcement:** Middleware-based route protection + authorization functions

---

## 3. Code Implementation

### 3.1 Role-Based Access Control

**File:** `middleware.ts`

**Admin Route Protection:**
```typescript
// middleware.ts (lines 46-67)
// Protect admin routes (require ADMIN role)
if (pathname.startsWith("/admin")) {
  if (!session) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user is admin
  if (session.user?.role !== "ADMIN") {
    // Redirect to user contract discovery if not admin
    return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
  }
}
```

**Code References:**
- `middleware.ts` - Lines 46-67 (admin route protection)
- Role-based access enforced

**Evidence:**
- `middleware.ts` - RBAC enforcement implemented
- Admin routes protected

---

### 3.2 Authorization Functions

**File:** `lib/authz.ts`

**Authorization Functions:**
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
- requireAuth() and requireAdmin() functions

**Evidence:**
- `lib/authz.ts` - Authorization functions exist
- Functions enforce role-based access

---

### 3.3 User Role Model

**File:** `prisma/schema.prisma`

**Role Field:**
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
- Roles: USER or ADMIN

**Evidence:**
- `prisma/schema.prisma` - Role field in User model
- Role-based access supported

---

### 3.4 Transaction-Level Access Control

**API Route Protection:**
- Admin API routes require ADMIN role
- User API routes require authentication
- Transaction-level access controlled via authorization functions

**Code Implementation:**
```typescript
// Example: app/api/admin/create-user/route.ts (line 14)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin() // Admin-only access
    // ... user creation logic
  }
}
```

**Code References:**
- `app/api/admin/create-user/route.ts` - Line 14 (requireAdmin)
- Admin routes require ADMIN role

**Evidence:**
- API routes protected by authorization
- Transaction-level access controlled

---

### 3.5 Function-Level Access Control

**Function Access:**
- Admin functions restricted to ADMIN role
- User functions available to authenticated users
- Function-level access controlled via middleware and authorization

**Code References:**
- `middleware.ts` - Route protection
- `lib/authz.ts` - Authorization functions
- Function-level access controlled

**Evidence:**
- Function-level access control implemented
- Access restricted by role

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Account Lifecycle Enforcement Procedure: `../02-policies-and-procedures/MAC-SOP-222_Account_Lifecycle_Enforcement_Procedure.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.2)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Role-based access control (middleware.ts), authorization functions (lib/authz.ts requireAuth, requireAdmin), user role model (prisma/schema.prisma), transaction-level access control, function-level access control, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
