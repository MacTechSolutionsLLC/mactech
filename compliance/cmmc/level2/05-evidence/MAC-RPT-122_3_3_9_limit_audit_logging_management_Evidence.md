# Limit Audit Logging Management Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.3.9

**Control ID:** 3.3.9  
**Requirement:** Limit management of audit logging functionality to a subset of privileged users

---

## 1. Purpose

This document provides evidence of the implementation of restrictions on audit logging functionality management to privileged users only, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.3.9.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Management Restrictions:**
- Audit logging management restricted to ADMIN role
- Audit log access requires ADMIN privileges
- Audit log configuration changes require ADMIN role
- Separation of audit management from other functions

---

## 3. Code Implementation

### 3.1 Admin-Only Access Control

**File:** `middleware.ts`

**Admin Route Protection:**
```typescript
// middleware.ts (lines 46-67)
// Protect admin routes (require ADMIN role)
if (pathname.startsWith("/admin")) {
  if (!session) {
    // Redirect to sign in if not authenticated
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
- All `/admin` routes require ADMIN role

**Evidence:**
- `middleware.ts` - Admin-only access enforced
- Audit log management restricted to admins

---

### 3.2 Audit Log Viewer Access

**Admin Portal:**
- Audit log viewer: `/admin/events` (admin-only)
- Access controlled via middleware
- Non-admin users redirected

**Code References:**
- `middleware.ts` - Admin route protection
- Audit log viewer requires admin access

**Evidence:**
- Audit log viewer requires admin access
- Access control functional

---

### 3.3 Audit Log Export Access

**File:** `app/api/admin/events/export/route.ts`

**Admin-Only Export:**
```typescript
// app/api/admin/events/export/route.ts (lines 10-12)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()
    // ... export functionality
  }
}
```

**Code References:**
- `app/api/admin/events/export/route.ts` - Line 12 (requireAdmin)
- Export requires admin authentication

**Evidence:**
- Export endpoint requires admin access
- Management restricted to privileged users

---

### 3.4 Authorization Functions

**File:** `lib/authz.ts`

**Require Admin Function:**
```typescript
// lib/authz.ts (lines 28-37)
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
- `lib/authz.ts` - Lines 28-37 (requireAdmin function)
- Function enforces admin-only access

**Evidence:**
- `lib/authz.ts` - Admin authorization function exists
- Function restricts access to admins

---

### 3.5 Audit Logging Management Separation

**Separation of Functions:**
- Audit log viewing: Admin-only
- Audit log export: Admin-only
- Audit log configuration: Admin-only
- Audit log management separated from other admin functions

**Code References:**
- `middleware.ts` - Admin route protection
- `lib/authz.ts` - Admin authorization
- Management functions separated

**Evidence:**
- Audit logging management separated
- Only privileged users can manage audit logs

---

## 4. Related Documents

- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.4, 3.3.9)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Admin-only access control (middleware.ts), audit log viewer access, audit log export access (app/api/admin/events/export/route.ts), authorization functions (lib/authz.ts requireAdmin), audit logging management separation, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
