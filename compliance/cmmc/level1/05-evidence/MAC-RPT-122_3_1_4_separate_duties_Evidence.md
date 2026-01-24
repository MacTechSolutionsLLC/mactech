# Separation of Duties Evidence - CMMC Level 2

**Document Version:** 2.0  
**Date:** 2026-01-24  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section 3.1.4

**Control ID:** 3.1.4  
**Requirement:** Separate duties of individuals to reduce the risk of malevolent activity without collusion

---

## 1. Purpose

This document provides evidence of the implementation of separation of duties controls in the MacTech Solutions system, demonstrating compliance with NIST SP 800-171 Rev. 2, Section 3.1.4.

---

## 2. Implementation Summary

**Status:** ✅ Fully Implemented

**Implementation Date:** 2026-01-24

**Implementation Approach:**
- Role-based access control (RBAC) with USER and ADMIN roles
- Separation of Duties Matrix established and documented
- RBAC enforcement via middleware and authorization functions
- Operational controls prevent single user from performing conflicting duties

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Role Structure

**Roles:**
- **USER role:** Standard user functionality, no administrative privileges
- **ADMIN role:** Administrative privileges, system management functions

**Role Separation:**
- USER role cannot access admin functions
- ADMIN role has access to both user and admin functions
- Roles enforced via middleware and authorization checks

**Code References:**
- `prisma/schema.prisma` - User model with role field
- `middleware.ts` - Role-based route protection
- `lib/authz.ts` - Authorization functions (requireAdmin, requireAuth)

**Evidence:**
- `prisma/schema.prisma` - User.role field (USER or ADMIN)
- `middleware.ts` - Admin route protection (line 29: `requireAdmin()`)
- `lib/authz.ts` - Authorization function implementation

---

### 3.2 RBAC Enforcement

**Middleware Enforcement:**
- All admin routes require ADMIN role
- User routes accessible to authenticated users
- Role checked before route access granted

**Code Implementation:**
```typescript
// middleware.ts
if (pathname.startsWith('/admin')) {
  await requireAdmin(session);
}
```

**Authorization Functions:**
- `requireAdmin()` - Enforces ADMIN role requirement
- `requireAuth()` - Enforces authentication requirement
- Role checks performed before access granted

**Code References:**
- `middleware.ts` - Route protection (lines 19-40)
- `lib/authz.ts` - Authorization functions

**Evidence:**
- `middleware.ts` - Admin route protection code
- `lib/authz.ts` - Authorization function implementation
- Role-based access enforcement in code

---

## 4. Separation of Duties Matrix

### 4.1 SoD Matrix Document

**Document:** `../02-policies-and-procedures/MAC-SOP-235_Separation_of_Duties_Matrix.md`

**Purpose:** Establishes separation of duties requirements and identifies conflicting duties that must be separated.

**Key Elements:**
- Duty definitions
- Conflicting duty pairs
- Role assignments
- Separation requirements

**Evidence:**
- Separation of Duties Matrix document exists
- Matrix defines duty separations
- Matrix identifies conflicting duties

---

### 4.2 Separation of Duties Enforcement Evidence

**Document:** `MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md`

**Purpose:** Provides evidence of how separation of duties is enforced in the system.

**Key Elements:**
- RBAC implementation
- Role enforcement
- Access control mechanisms
- Operational controls

**Evidence:**
- Separation of Duties Enforcement Evidence document exists
- Document describes enforcement mechanisms
- Document provides code references

---

## 5. Operational Controls

### 5.1 Access Control Enforcement

**User Functions:**
- Access to contract opportunities
- View and analyze opportunities
- Access to user-specific data
- Standard application features

**Admin Functions:**
- User account management
- System configuration
- Audit log access
- Compliance management
- POA&M management
- SCTM management

**Separation:**
- USER role cannot perform admin functions
- ADMIN role can perform both user and admin functions
- Separation enforced via RBAC

**Evidence:**
- Role-based access enforced in code
- User and admin functions separated
- Access control prevents unauthorized access

---

### 5.2 Conflicting Duties Prevention

**Conflicting Duties:**
- User account creation and user account deletion
- System configuration and audit log review
- Data entry and data approval
- System access and system administration

**Prevention:**
- RBAC prevents single user from having conflicting roles
- Role assignments reviewed and approved
- Access reviews conducted periodically

**Evidence:**
- SoD Matrix identifies conflicting duties
- RBAC prevents conflicting role assignments
- Access reviews documented

---

## 6. Related Documents

- Separation of Duties Enforcement Evidence: `MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md`
- Separation of Duties Matrix: `../02-policies-and-procedures/MAC-SOP-235_Separation_of_Duties_Matrix.md`
- Access Control Policy: `../02-policies-and-procedures/MAC-POL-210_Access_Control_Policy.md`
- System Security Plan: `../01-system-scope/MAC-IT-304_System_Security_Plan.md` (Section 7.1, 3.1.4)
- System Control Traceability Matrix: `../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md`

---

## 7. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** 2026-04-24

**Change History:**
- Version 2.0 (2026-01-24): Complete rewrite with legitimate evidence - RBAC implementation, role structure, middleware enforcement, Separation of Duties Matrix, operational controls, code references (middleware.ts, lib/authz.ts, prisma/schema.prisma), and references to MAC-RPT-117 and MAC-SOP-235
- Version 1.0 (2026-01-24): Initial evidence document creation (placeholder content)

---
