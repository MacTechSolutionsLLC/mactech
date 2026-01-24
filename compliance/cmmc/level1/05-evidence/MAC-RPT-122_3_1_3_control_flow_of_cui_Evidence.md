# Control Flow of CUI Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.3

**Control ID:** 3.1.3  
**Requirement:** Control the flow of CUI in accordance with approved authorizations

---

## 1. Purpose

This document provides evidence of the implementation of information flow controls to control the flow of CUI in accordance with approved authorizations, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.3.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Flow Control Mechanisms:**
- Access controls via middleware and authorization
- CUI access restricted to authorized users
- Network boundaries enforced by Railway platform

---

## 3. Code Implementation

### 3.1 Access Control Enforcement

**File:** `middleware.ts`, `lib/authz.ts`

**Access Control:**
- CUI access restricted to authorized users based on role
- Access controls prevent unauthorized CUI access
- Information flow controlled via access mechanisms

**Code Implementation:**
```typescript
// middleware.ts (lines 46-67)
// Protect admin routes (require ADMIN role)
if (pathname.startsWith("/admin")) {
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  if (session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
  }
}
```

**Code References:**
- `middleware.ts` - Lines 46-67 (access control enforcement)
- `lib/authz.ts` - Authorization functions

**Evidence:**
- `middleware.ts` - Access control implemented
- CUI access restricted

---

### 3.2 CUI File Access Control

**File:** `lib/file-storage.ts`

**CUI File Access:**
- CUI files require authentication
- CUI files require password protection
- Users can only access their own CUI files (unless admin)

**Code Implementation:**
```typescript
// lib/file-storage.ts (lines 331-375)
export async function getCUIFile(
  fileId: string,
  password: string,
  userId?: string,
  userRole?: string
) {
  // Verify password first
  if (!verifyCUIPassword(password)) {
    throw new Error("Invalid CUI password")
  }

  const file = await prisma.storedCUIFile.findUnique({
    where: { id: fileId },
  })

  // Access control: user can access their own CUI files, admin can access any CUI file
  if (userId) {
    if (file.userId !== userId && userRole !== "ADMIN") {
      throw new Error("Access denied")
    }
  } else {
    throw new Error("Authentication required")
  }

  return file
}
```

**Code References:**
- `lib/file-storage.ts` - Lines 331-375 (CUI file access control)
- Access control enforced for CUI files

**Evidence:**
- `lib/file-storage.ts` - CUI file access control implemented
- CUI flow controlled

---

### 3.3 Network Boundaries

**Network Architecture:**
- Network boundaries enforced by Railway platform (inherited)
- Application-level access controls prevent unauthorized CUI access
- CUI data flow documented in data flow diagrams

**Code References:**
- Railway platform provides network boundaries
- Application-level controls: `middleware.ts`, `lib/authz.ts`

**Evidence:**
- Network boundaries enforced
- CUI flow controlled

---

### 3.4 Information Flow Controls

**Access Control Mechanisms:**
- Role-based access control (RBAC)
- Authorization functions enforce access
- CUI access restricted to authorized users

**Code References:**
- `middleware.ts` - Route protection
- `lib/authz.ts` - Authorization functions
- Information flow controlled

**Evidence:**
- Information flow controls implemented
- CUI flow controlled

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.3)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - Access control enforcement (middleware.ts, lib/authz.ts), CUI file access control (lib/file-storage.ts getCUIFile), network boundaries, information flow controls, and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
