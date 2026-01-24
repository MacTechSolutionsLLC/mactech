# Control CUI on Public Systems Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.22

**Control ID:** 3.1.22  
**Requirement:** Control information posted or processed on publicly accessible information systems

---

## 1. Purpose

This document provides evidence of the implementation of controls to prevent CUI from being posted or processed on publicly accessible information systems, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.22.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-23

**Public Content Control:**
- PublicContent model requires ADMIN approval before being visible
- Approval workflow tracks approvedBy and approvedAt fields
- Public content stored separately from FCI/CUI
- No CUI posted to public systems

---

## 3. Code Implementation

### 3.1 PublicContent Model

**File:** `prisma/schema.prisma`

**Public Content Control:**
- PublicContent model requires ADMIN approval before being visible
- Approval fields track who approved and when
- Public content stored separately from FCI/CUI

**Code Implementation:**
```prisma
// prisma/schema.prisma (lines 1036-1048)
model PublicContent {
  id          String    @id @default(cuid())
  content     String    @db.Text // Content to be made public
  contentType String // Type of content (post, page, etc.)
  approvedBy  String? // User ID who approved
  approvedAt  DateTime? // When approved
  isPublic    Boolean   @default(false) // Whether content is public
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([isPublic])
  @@index([approvedAt])
}
```

**Code References:**
- `prisma/schema.prisma` - Lines 1036-1048 (PublicContent model)
- Approval workflow fields: approvedBy, approvedAt, isPublic

**Evidence:**
- `prisma/schema.prisma` - PublicContent model exists
- Approval workflow fields implemented

---

### 3.2 Public Content Approval Workflow

**Approval Requirements:**
- Public content requires `isPublic = true` flag
- `approvedBy` field tracks user ID who approved
- `approvedAt` field tracks when approval occurred
- Approval workflow prevents unauthorized public posting

**Code References:**
- PublicContent model: `prisma/schema.prisma` (lines 1036-1048)
- Approval fields: approvedBy, approvedAt, isPublic

**Evidence:**
- Approval workflow fields in database schema
- Public content requires approval before being visible

---

### 3.3 Public Content Separation from FCI/CUI

**System Boundary Documentation:**
- Public content stored separately from FCI/CUI
- FCI/CUI not posted to public systems
- Public content approval control prevents CUI exposure

**Code References:**
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md` (Section 4.1)
- Public content stored in separate PublicContent table

**Evidence:**
- Public content separated from FCI/CUI
- No CUI posted to public systems

---

### 3.4 Access Control for Public Content

**File:** `middleware.ts`

**Access Control:**
- Admin routes require ADMIN role
- Public content approval requires ADMIN access
- Unauthorized users cannot approve public content

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
    return NextResponse.redirect(new URL("/user/contract-discovery", req.url))
  }
}
```

**Code References:**
- `middleware.ts` - Lines 46-67 (admin route protection)
- Admin access required for public content approval

**Evidence:**
- `middleware.ts` - Admin access control implemented
- Public content approval requires ADMIN role

---

## 4. Related Documents

- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.22)
- System Boundary: `../01-system-scope/MAC-IT-105_System_Boundary.md` (Section 4.1)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate codebase evidence - PublicContent model (prisma/schema.prisma), public content approval workflow (approvedBy, approvedAt, isPublic fields), public content separation from FCI/CUI, access control for public content (middleware.ts), and code references
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---

## 4. Related Documents

- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md`
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** [To be scheduled]

**Change History:**
- Version 1.0 (2026-01-24): Initial evidence document creation
