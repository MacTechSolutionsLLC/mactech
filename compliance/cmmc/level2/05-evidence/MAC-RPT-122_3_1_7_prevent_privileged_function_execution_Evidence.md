# Prevent Privileged Function Execution Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.7

**Control ID:** 3.1.7  
**Requirement:** Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs

---

## 1. Purpose

This document provides evidence of the implementation of controls to prevent non-privileged users from executing privileged functions and to log privileged function execution, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.7.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Prevention Mechanism:** Middleware-based route protection + authorization functions

**Audit Logging:** All privileged function execution logged in audit system

---

## 3. Code Implementation

### 3.1 Privileged Function Prevention

**File:** `middleware.ts`

**Admin Route Protection:**
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
- `middleware.ts` - Lines 46-67 (admin route protection)
- Non-privileged users cannot access admin routes

**Evidence:**
- `middleware.ts` - Privileged function prevention implemented
- Non-privileged users prevented from accessing admin functions

---

### 3.2 Authorization Functions

**File:** `lib/authz.ts`

**Admin Authorization:**
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
- Function prevents non-privileged execution

**Evidence:**
- `lib/authz.ts` - Admin authorization function exists
- Function prevents privileged function execution by non-privileged users

---

### 3.3 Audit Logging of Privileged Functions

**File:** `lib/audit.ts`

**Admin Action Logging:**
```typescript
// lib/audit.ts (lines 322-397)
export async function logAdminAction(
  userId: string,
  email: string,
  action: string,
  target?: { type: TargetType; id: string },
  details?: Record<string, any>
) {
  // ... fetch admin and target information
  await logEvent(
    "admin_action",
    userId,
    email,
    true,
    target?.type,
    target?.id,
    enhancedDetails
  )
}
```

**Code References:**
- `lib/audit.ts` - Lines 322-397 (logAdminAction function)
- All admin actions logged

**Evidence:**
- `lib/audit.ts` - Admin action logging implemented
- Privileged function execution logged

---

### 3.4 Privileged Function Examples

**Privileged Functions:**
- User account management (create, update, disable)
- Audit log access and export
- System configuration changes
- Security function management
- POA&M management

**Code References:**
- Admin API routes: `/api/admin/*`
- All admin functions require ADMIN role
- All admin functions logged

**Evidence:**
- Privileged functions identified
- All privileged functions protected

---

### 3.5 Audit Log Storage

**File:** `prisma/schema.prisma`

**AppEvent Model:**
```prisma
// prisma/schema.prisma (lines 970-991)
model AppEvent {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  actorUserId String?
  actorEmail  String?
  actionType  String // admin_action, user_create, etc.
  targetType  String?
  targetId    String?
  ip          String?
  userAgent   String?
  success     Boolean  @default(true)
  details     String?  @db.Text
  // ... relations
}
```

**Code References:**
- `prisma/schema.prisma` - AppEvent model (lines 970-991)
- Privileged function execution stored in audit log

**Evidence:**
- `prisma/schema.prisma` - AppEvent model exists
- Privileged function execution logged

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- Audit and Accountability Policy: `../02-policies-and-procedures/MAC-POL-218_Audit_and_Accountability_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.7)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Privileged function prevention (middleware.ts), authorization functions (lib/authz.ts requireAdmin), audit logging of privileged functions (lib/audit.ts logAdminAction), privileged function examples, audit log storage (prisma/schema.prisma AppEvent model), and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
